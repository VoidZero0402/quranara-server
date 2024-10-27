import { Request, Response, NextFunction } from "express";
import BanModel from "@/models/Ban";
import UserModel from "@/models/User";
import { SendOtpSchemaType, VerifyOtpSchemaType } from "@/validators/auth";
import { BadRequestException, ConflictException, ForbiddenException } from "@/utils/exceptions";
import { generateAccessToken, generateOtp, generateRefreshToken, getOtp, verifyOtp } from "@/utils/auth";
import { SuccessResponse } from "@/utils/responses";
import { getUniqueUsername } from "@/utils/users";

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

        const otp = await generateOtp(phone);

        // TODO: send sms

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

        if (!user) {
            const uniqueUsername = await getUniqueUsername();

            user = await UserModel.create({
                phone,
                username: username ?? uniqueUsername,
            });
        }

        const accessToken = await generateAccessToken({ _id: user._id });
        const refreshToken = await generateRefreshToken({ _id: user._id });

        SuccessResponse(res, 200, { user, accessToken, refreshToken });
    } catch (err) {
        next(err);
    }
};

export const getMe = async (req: Request, res: Response, next: NextFunction) => {};
export const refresh = async (req: Request, res: Response, next: NextFunction) => {};
export const logout = async (req: Request, res: Response, next: NextFunction) => {};
