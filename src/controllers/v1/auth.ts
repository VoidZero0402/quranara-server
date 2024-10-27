import { Request, Response, NextFunction } from "express";
import BanModel from "@/models/Ban";
import { SendOtpSchemaType, VerifyOtpSchemaType } from "@/validators/auth";
import { ConflictException, ForbiddenException } from "@/utils/exceptions";
import { generateOtp, getOtp } from "@/utils/auth";
import { SuccessResponse } from "@/utils/responses";

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

export const verify = async (req: Request<{}, {}, VerifyOtpSchemaType>, res: Response, next: NextFunction) => {};
export const getMe = async (req: Request, res: Response, next: NextFunction) => {};
export const refresh = async (req: Request, res: Response, next: NextFunction) => {};
export const logout = async (req: Request, res: Response, next: NextFunction) => {};
