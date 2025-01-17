import { Request, Response, NextFunction } from "express";

const isCorsEnable = process.env.CORS === "enable";

const cors = (req: Request, res: Response, next: NextFunction) => {
    if (isCorsEnable) {
        res.setHeader("Access-Control-Allow-Origin", process.env.FRONTEND_URL as string);
        res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, x-quranara-secret");
        res.setHeader("Access-Control-Allow-Credentials", "true");

        if (req.method === "OPTIONS") {
            res.setHeader("Access-Control-Max-Age", "86400");
            res.status(200).end();
            return;
        }
    }

    next();
};

export default cors;
