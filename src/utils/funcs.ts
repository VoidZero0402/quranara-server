import fs from "fs/promises";
import { Request } from "express";
import UserModel from "@/models/User";

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

export const timeToSeconds = (time: string): number => {
    const parts = time.split(":").map(Number);

    if (parts.length === 2) {
        const [minutes, seconds] = parts;
        return minutes * 60 + seconds;
    }

    const [hours, minutes, seconds] = parts;
    return hours * 3600 + minutes * 60 + seconds;
};

export const secondsToTimeArray = (seconds: number): [number, number] => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return [hours, minutes];
};
