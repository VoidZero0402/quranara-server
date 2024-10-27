import { Request, Response, NextFunction } from "express";

import BanModel from "@/models/Ban";
import UserModel from "@/models/User";

import { sendOtp } from "@/services/melipayamak";

import { SendOtpSchemaType, VerifyOtpSchemaType } from "@/validators/auth";

import { BadRequestException, ConflictException, ForbiddenException, UnauthorizedException } from "@/utils/exceptions";
import { SuccessResponse } from "@/utils/responses";
import { generateAccessToken, saveOtp, generateRefreshToken, getOtp, verifyOtp, saveRefreshTokenInRedis, setCredentialCookies, verifyRefreshToken, hasRefreshTokenInRedis } from "@/utils/auth";
import { getUniqueUsername } from "@/utils/users";

import { RequestWithUser } from "@/types/request.types";

export const send = async (req: Request<{}, {}, SendOtpSchemaType>, res: Response, next: NextFunction) => {
    try {
        const { phone } = req.body;

        const isBanned = await BanModel.findOne({ phone });

        if (isBanned) {
            throw new ForbiddenException("This phone has been blocked");
        }

        const { expired, ttl } = await getOtp(phone);

        if (!expired) {
            throw new ConflictException("Otp already exist", { ttl });
        }

        // const otp = await sendOtp(phone);
        const otp = "00000";

        await saveOtp(phone, otp);

        SuccessResponse(res, 200, { message: "Otp sent successfully!", otp });
    } catch (err) {
        next(err);
    }
};

export const verify = async (req: Request<{}, {}, VerifyOtpSchemaType>, res: Response, next: NextFunction) => {
    try {
        const { phone, otp, username } = req.body;

        const { expired, matched } = await verifyOtp(phone, otp);

        if (expired) {
            throw new ConflictException("Otp is expired");
        }

        if (!matched) {
            throw new BadRequestException("Otp is not matched");
        }

        let user = await UserModel.findOne({ phone });
        let isSignupPhase = !user;

        if (!user) {
            const uniqueUsername = await getUniqueUsername();

            user = await UserModel.create({
                phone,
                username: username ?? uniqueUsername,
            });
        }

        const accessToken = await generateAccessToken({ _id: user._id });
        const refreshToken = await generateRefreshToken({ _id: user._id });

        await saveRefreshTokenInRedis(refreshToken, user._id.toString());

        setCredentialCookies(res, { accessToken, refreshToken, user });

        SuccessResponse(res, isSignupPhase ? 201 : 200, { user });
    } catch (err) {
        next(err);
    }
};

export const getMe = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = (req as RequestWithUser).user;
        SuccessResponse(res, 200, { user });
    } catch (err) {
        next(err);
    }
};

export const refresh = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const refreshToken: string = req.cookies.refreshToken;

        if (!refreshToken) {
            throw new UnauthorizedException("token not provided");
        }

        const payload = await verifyRefreshToken(refreshToken);

        const isExists = await hasRefreshTokenInRedis(payload._id as string);

        if (!isExists) {
            throw new UnauthorizedException("token is expired");
        }

        const accessToken = await generateAccessToken({ _id: payload._id });

        //! Dev
        res.cookie("accessToken", accessToken, {
            path: "/",
            httpOnly: true,
            expires: new Date(Date.now() + 7_776_000),
        });

        SuccessResponse(res, 200, { accessToken });
    } catch (err) {
        next(err);
    }
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.clearCookie("accessToken");
        res.clearCookie("refreshToken");
        res.clearCookie("user");

        SuccessResponse(res, 200, { message: "user logged out successfully" });
    } catch (err) {
        next(err);
    }
};
