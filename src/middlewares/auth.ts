import { Request, Response, NextFunction } from "express";

import UserModel, { UserDocument } from "@/models/User";

import { verifySession, checkSession } from "@/utils/auth";
import { UnauthorizedException } from "@/utils/exceptions";
import { AuthenticatedRequest } from "@/types/request.types";

const auth = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const session: string = req.signedCookies._session;
        const authKey: string = req.signedCookies._auth_key;

        if (!session || !authKey) {
            throw new UnauthorizedException("credentials not provided");
        }

        const payload = await verifySession(session);

        if (!payload) {
            throw new UnauthorizedException("session is expired");
        }

        const user = (await UserModel.findById(payload._id, "-password -__v")) as UserDocument;

        if (!user) {
            throw new UnauthorizedException("user not found");
        }

        const isMatched = await checkSession({ session, authKey }, user._id.toString());

        if (!isMatched) {
            throw new UnauthorizedException("invalid credentials");
        }

        (req as AuthenticatedRequest).user = user;

        next();
    } catch (err) {
        next(err);
    }
};

export default auth;
