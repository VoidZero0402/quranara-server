import { Request, Response, NextFunction } from "express";

import UserModel, { UserDocument } from "@/models/User";

import { verifySession } from "@/utils/auth";
import { UnauthorizedException } from "@/utils/exceptions";
import { AuthenticatedRequest } from "@/types/request.types";

const auth = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const session: string = req.cookies._session;

        if (!session) {
            throw new UnauthorizedException("session not provided");
        }

        const payload = await verifySession(session);

        if (!payload) {
            throw new UnauthorizedException("session is expired");
        }

        const user = (await UserModel.findById(payload._id, "-__v")) as UserDocument;

        if (!user) {
            throw new UnauthorizedException("user not found");
        }

        (req as AuthenticatedRequest).user = user;

        next();
    } catch (err) {
        next(err);
    }
};

export default auth;
