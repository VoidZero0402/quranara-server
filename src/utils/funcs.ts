import fs from "fs/promises";
import { Request } from "express";
import redis from "@/config/redis";
import UserModel, { UserDocument } from "@/models/User";
import { verifySession } from "./auth";

export const removeFile = async (path: string): Promise<void> => {
    await fs.unlink(path);
};

export const getUser = async (req: Request) => {
    const session: string = req.cookies._session;

    if (!session) {
        return null;
    }

    const payload = await verifySession(session);

    const user = (await UserModel.findById(payload._id, "-__v")) as UserDocument;

    return user;
};

export const createPaginationData = (page: number, limit: number, count: number) => ({ page, limit, pagesCount: Math.ceil(count / limit), count });

export const scanRedisKeys = async (pattern: string): Promise<string[]> => {
    const keys = [];
    let cursor = "0";

    do {
        const [newCursor, founded] = await redis.scan(cursor, "MATCH", pattern);
        cursor = newCursor;
        keys.push(...founded);
    } while (cursor !== "0");

    return keys;
};
