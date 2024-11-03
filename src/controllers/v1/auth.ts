import { NextFunction, Request, Response } from "express";

import UserModel from "@/models/User";
import BanModel from "@/models/Ban";

import { sendOtp } from "@/services/melipayamak";

import { SignupShcemaType, SendOtpSchemaType, LoginWithOtpSchemaType, LoginWithEmailSchemaType } from "@/validators/auth";

import { BadRequestException, ConflictException, ForbiddenException, NotFoundException } from "@/utils/exceptions";
import { SuccessResponse } from "@/utils/responses";
import { isDuplicateKeyError } from "@/utils/errors";
import { createSession, generateOtp, getOtp, saveSessionInRedis, setCredentialCookies, verifyOtp } from "@/utils/auth";

export const signup = async (req: Request<{}, {}, SignupShcemaType>, res: Response, next: NextFunction) => {
    try {
        const { phone, email, fullname, password, otp } = req.body;

        const { expired, matched } = await verifyOtp(phone, otp);

        if (expired) {
            throw new ConflictException("otp is expired");
        }

        if (!matched) {
            throw new BadRequestException("otp is not matched");
        }

        const user = await UserModel.create({
            phone,
            email,
            fullname,
            username: fullname,
            password,
        });

        const session = await createSession({ _id: user._id });

        await saveSessionInRedis(session, user._id.toString());

        setCredentialCookies(res, { session, user });

        SuccessResponse(res, 201, { user });
    } catch (err) {
        if (isDuplicateKeyError(err as Error)) {
            next(new ConflictException("user already exists with this information", { field: Object.keys((err as any).keyPattern)[0] }));
        }
        next(err);
    }
};

export const send = async (req: Request<{}, {}, SendOtpSchemaType>, res: Response, next: NextFunction) => {
    try {
        const { phone } = req.body;

        const isBanned = await BanModel.findOne({ phone });

        if (isBanned) {
            throw new ForbiddenException("this phone has been blocked");
        }

        const { expired, ttl } = await getOtp(phone);

        if (!expired) {
            throw new ConflictException("Otp already exist", { ttl });
        }

        const otp = await generateOtp(phone);

        await sendOtp(phone, otp);

        SuccessResponse(res, 200, { message: "otp sent successfully!", otp });
    } catch (err) {
        next(err);
    }
};

export const loginWithOtp = async (req: Request, res: Response, next: NextFunction) => {};
export const loginWithEmail = async (req: Request, res: Response, next: NextFunction) => {};
export const getMe = async (req: Request, res: Response, next: NextFunction) => {};
export const logout = async (req: Request, res: Response, next: NextFunction) => {};
