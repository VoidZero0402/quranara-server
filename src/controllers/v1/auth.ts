import { NextFunction, Request, Response } from "express";

import UserModel from "@/models/User";
import BanModel from "@/models/Ban";

import { PHASE } from "@/constants/auth";

import { sendOtp } from "@/services/melipayamak";

import { SignupShcemaType, SendOtpSchemaType, LoginWithOtpSchemaType, LoginWithPasswordSchemaType } from "@/validators/auth";

import { AuthenticatedRequest } from "@/types/request.types";

import { BadRequestException, ConflictException, ForbiddenException, NotFoundException } from "@/utils/exceptions";
import { SuccessResponse } from "@/utils/responses";
import { isDuplicateKeyError } from "@/utils/errors";
import { createSession, saveOtpInRedis, getOtp, removeSessionFromRedis, saveSessionInRedis, setCredentialCookies, verifyOtp } from "@/utils/auth";

export const signup = async (req: Request<{}, {}, SignupShcemaType>, res: Response, next: NextFunction) => {
    try {
        const { phone, fullname, password, otp } = req.body;

        const { expired, matched } = await verifyOtp(phone, otp);

        if (expired) {
            throw new ConflictException("otp is expired", { key: "otp" });
        }

        if (!matched) {
            throw new BadRequestException("otp is not matched", { key: "otp" });
        }

        const isBanned = await BanModel.findOne({ phone });

        if (isBanned) {
            throw new ForbiddenException("this account has been blocked");
        }

        const user = await UserModel.create({
            phone,
            fullname,
            username: fullname,
            password,
        });

        const session = await createSession({ _id: user._id });

        await saveSessionInRedis(session, user._id.toString());

        setCredentialCookies(res, { session });

        SuccessResponse(res, 201, { message: "signup was successful" });
    } catch (err) {
        if (isDuplicateKeyError(err as Error)) {
            next(new ConflictException("user already exists with this information", { field: Object.keys((err as any).keyPattern)[0], key: "duplicate" }));
        }
        next(err);
    }
};

export const send = async (req: Request<{}, {}, SendOtpSchemaType>, res: Response, next: NextFunction) => {
    try {
        const { phone, phase } = req.body;

        const isBanned = await BanModel.findOne({ phone });

        if (isBanned) {
            throw new ForbiddenException("this account has been blocked");
        }

        if (phase === PHASE.LOGIN) {
            const user = await UserModel.findOne({ phone });

            if (!user) {
                throw new NotFoundException("user not found with this phone");
            }
        }

        const { expired, ttl } = await getOtp(phone);

        if (!expired) {
            throw new ConflictException("Otp already exist", { ttl });
        }

        const { code } = await sendOtp(phone);

        await saveOtpInRedis(phone, code);

        SuccessResponse(res, 200, { message: "otp sent successfully!" });
    } catch (err) {
        next(err);
    }
};

export const loginWithOtp = async (req: Request<{}, {}, LoginWithOtpSchemaType>, res: Response, next: NextFunction) => {
    try {
        const { phone, otp } = req.body;

        const { expired, matched } = await verifyOtp(phone, otp);

        if (expired) {
            throw new ConflictException("otp is expired");
        }

        if (!matched) {
            throw new BadRequestException("otp is not matched", { key: "otp" });
        }

        const user = await UserModel.findOne({ phone });

        if (!user) {
            throw new NotFoundException("user not found");
        }

        const session = await createSession({ _id: user._id });

        await saveSessionInRedis(session, user._id.toString());

        setCredentialCookies(res, { session });

        SuccessResponse(res, 200, { message: "login was successful", role: user.role });
    } catch (err) {
        next(err);
    }
};

export const loginWithPassword = async (req: Request<{}, {}, LoginWithPasswordSchemaType>, res: Response, next: NextFunction) => {
    try {
        const { phone, password } = req.body;

        const isBanned = await BanModel.findOne({ phone });

        if (isBanned) {
            throw new ForbiddenException("this account has been blocked");
        }

        const user = await UserModel.findOne({ phone });

        if (!user) {
            throw new NotFoundException("user not found");
        }

        const isMatched = await user.comparePassword(password);

        if (!isMatched) {
            throw new NotFoundException("user not found");
        }

        const session = await createSession({ _id: user._id });

        await saveSessionInRedis(session, user._id.toString());

        setCredentialCookies(res, { session });

        SuccessResponse(res, 200, { message: "login was successful", role: user.role });
    } catch (err) {
        next(err);
    }
};

export const getMe = async (req: Request, res: Response, next: NextFunction) => {
    try {
        SuccessResponse(res, 200, { user: (req as AuthenticatedRequest).user });
    } catch (err) {
        next(err);
    }
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await removeSessionFromRedis((req as AuthenticatedRequest).user._id.toString());
        res.clearCookie("_session");

        SuccessResponse(res, 200, { message: "logout is successful" });
    } catch (err) {
        next(err);
    }
};
