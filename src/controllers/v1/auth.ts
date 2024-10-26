import { Request, Response, NextFunction } from "express";
import BanModel from "@/models/Ban";
import { ConflictException, ForbiddenException } from "@/utils/exceptions";
import { generateOtp, getOtp } from "@/utils/auth";
import { SuccessResponse } from "@/utils/responses";

export const send = async (req: Request, res: Response, next: NextFunction) => {
    const { phone } = req.body;

    const isBanned = await BanModel.findOne({ phone });

    if (isBanned) {
        next(new ForbiddenException("This phone has been blocked"));
        return;
    }

    const { expired, ttl } = await getOtp(phone);

    if (!expired) {
        next(new ConflictException("Otp already exist", { ttl }));
        return;
    }

    const otp = await generateOtp(phone);

    // TODO: send sms

    SuccessResponse(res, 200, { message: "Otp sent successfully!", otp });
};

export const verify = async (req: Request, res: Response, next: NextFunction) => {};
export const getMe = async (req: Request, res: Response, next: NextFunction) => {};
export const refresh = async (req: Request, res: Response, next: NextFunction) => {};
export const logout = async (req: Request, res: Response, next: NextFunction) => {};
