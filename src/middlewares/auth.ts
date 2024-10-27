import { NextFunction, Request, Response } from "express";

import UserModel from "@/models/User";

import { verifyAccessToken } from "@/utils/auth";
import { UnauthorizedException } from "@/utils/exceptions";
import { RequestWithUser, UserDocument } from "@/types/request.types";

const auth = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const accessToken: string = req.cookies.accessToken;

        if (!accessToken) {
            throw new UnauthorizedException("token not provided");
        }

        const payload = await verifyAccessToken(accessToken);

        const user = (await UserModel.findById(payload._id, "-__v")) as UserDocument;

        if (!user) {
            throw new UnauthorizedException("user not found");
        }

        (req as RequestWithUser).user = user;

        next();
    } catch (err) {
        next(err);
    }
};

export default auth;
