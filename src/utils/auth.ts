import { Response } from "express";
import * as jose from "jose";

import redis from "@/config/redis";
import { UserDocument } from "@/models/User";

const TwoMinutesInSeconds = 120;

const JwtSessionExpires = parseInt(process.env.JWT_SESSION_EXPIRES as string);

const JwtSessionExpiresInMilliSeconds = JwtSessionExpires * 1000;

const JoseSessionExpirationTime = `${JwtSessionExpires}s`;

const JwtSecret = new TextEncoder().encode(process.env.JWT_SECRET);

const getRedisOtpPattern = (phone: string): string => `otp:${phone}`;

export const getOtp = async (phone: string): Promise<{ expired: boolean; ttl: number }> => {
    const otp = await redis.get(getRedisOtpPattern(phone));

    if (!otp) {
        return { expired: true, ttl: 0 };
    }

    const ttl = await redis.ttl(getRedisOtpPattern(phone));

    return { expired: false, ttl };
};

export const saveOtpInRedis = async (phone: string, otp: string): Promise<void> => {
    await redis.set(getRedisOtpPattern(phone), otp, "EX", TwoMinutesInSeconds);
};

export const verifyOtp = async (phone: string, otp: string): Promise<{ expired: boolean; matched: boolean }> => {
    const savedOtp = await redis.get(getRedisOtpPattern(phone));

    if (!savedOtp) {
        return { expired: true, matched: false };
    }

    const isOtpMatch = savedOtp === otp;

    if (isOtpMatch) {
        await redis.del(getRedisOtpPattern(phone));
    }

    return { expired: false, matched: isOtpMatch };
};

export const createSession = async (payload: jose.JWTPayload): Promise<string> => {
    const jwt = await new jose.SignJWT(payload).setProtectedHeader({ alg: "HS256" }).setExpirationTime(JoseSessionExpirationTime).sign(JwtSecret);
    return jwt;
};

export const verifySession = async (session: string): Promise<jose.JWTPayload | null> => {
    try {
        const { payload } = await jose.jwtVerify(session, JwtSecret);
        return payload;
    } catch {
        return null;
    }
};

const getRedisSessionPattern = (_id: string): string => `session:${_id}`;

export const saveSessionInRedis = async (session: string, _id: string): Promise<void> => {
    await redis.set(getRedisSessionPattern(_id), session, "EX", JwtSessionExpires);
};

export const removeSessionFromRedis = async (_id: string): Promise<void> => {
    await redis.del(getRedisSessionPattern(_id));
};

const cookiesOption = {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
} as const;

export const setCredentialCookies = (res: Response, credentials: { session: string; user: UserDocument }): void => {
    const expires = new Date(Date.now() + JwtSessionExpiresInMilliSeconds);

    res.cookie("_session", credentials.session, {
        ...cookiesOption,
        expires,
    });

    const user = credentials.user.toObject();

    Reflect.deleteProperty(user, "_id");
    Reflect.deleteProperty(user, "password");

    res.cookie("_user", JSON.stringify(user), {
        ...cookiesOption,
        expires,
    });
};

export const updateUserCredentialCookie = async (res: Response, userDoc: UserDocument): Promise<void> => {
    const ttl = await redis.ttl(getRedisSessionPattern(userDoc._id.toString()));

    const expires = new Date(Date.now() + ttl * 1000);

    const user = userDoc.toObject();

    Reflect.deleteProperty(user, "_id");
    Reflect.deleteProperty(user, "password");

    res.cookie("_user", JSON.stringify(user), {
        ...cookiesOption,
        expires,
    });
};
