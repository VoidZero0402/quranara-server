import { Request } from "express";

import redis from "@/config/redis";
import UserModel, { UserDocument } from "@/models/User";
import { verifySession, checkSession } from "./auth";

export const getUser = async (req: Request) => {
    const session: string = req.signedCookies._session;
    const authKey: string = req.signedCookies._auth_key;

    if (!session || !authKey) {
        return null;
    }

    const payload = await verifySession(session);

    if (!payload) {
        return null;
    }

    const user = (await UserModel.findById(payload._id, "-password -__v")) as UserDocument;

    if (!user) {
        return null;
    }

    const isMatched = await checkSession({ session, authKey }, user._id.toString());

    if (!isMatched) {
        return null;
    }

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
