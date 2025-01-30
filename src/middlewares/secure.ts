import { Request, Response, NextFunction } from "express";
import { ForbiddenException } from "@/utils/exceptions";

const isSecure = process.env.SECURE === "enable";

const secure = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (isSecure) {
            const origin = req.headers.origin || req.headers.referer || "";

            if (!origin.startsWith(process.env.FRONTEND_URL as string)) {
                throw new ForbiddenException("you don't have authorization to access this server");
            }

            const secret = req.headers["x-quranara-secret"];

            if (secret !== process.env.QURANARA_SECRET) {
                throw new ForbiddenException("you don't have authorization to access this server");
            }
        }

        next();
    } catch (err) {
        next(err);
    }
};

export default secure;
