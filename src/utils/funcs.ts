import fs from "fs/promises";
import { Request } from "express";
import UserModel from "@/models/User";
import { verifyAccessToken } from "./auth";
import { UserDocument } from "@/types/request.types";

export const removeFile = async (path: string): Promise<void> => {
    await fs.unlink(path);
};

export const getUser = async (req: Request) => {
    const accessToken: string = req.cookies.accessToken;

    if (!accessToken) {
        return null;
    }

    const payload = await verifyAccessToken(accessToken);

    const user = (await UserModel.findById(payload._id, "-__v")) as UserDocument;

    return user;
};

export const createPaginationData = (page: number, limit: number, count: number) => ({ page, limit, pagesCount: Math.ceil(count / limit), count });
