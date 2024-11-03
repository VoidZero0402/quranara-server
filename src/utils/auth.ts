import { Response } from "express";
import * as jose from "jose";

import redis from "@/config/redis";
import { UserDocument } from "@/models/User";
import { UnauthorizedException } from "./exceptions";

const TWO_MINUTES_IN_SECONDS = 120;

const NINETY_DAYS_IN_SECONDS = 7_776_000;

const NINETY_DAYS_IN_MILLI_SECONDS = 7_776_000_000;

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

const getRedisOtpPattern = (phone: string): string => `otp:${phone}`;

export const getOtp = async (phone: string): Promise<{ expired: boolean; ttl: number }> => {
    const otp = await redis.get(getRedisOtpPattern(phone));

    if (!otp) {
        return { expired: true, ttl: 0 };
    }

    const ttl = await redis.ttl(getRedisOtpPattern(phone));

    return { expired: false, ttl };
};

export const generateOtp = async (phone: string): Promise<string> => {
    let otp = "";

    for (let i = 0; i < 5; i++) {
        otp += Math.floor(Math.random() * (10 - 0) + 0);
    }

    await redis.set(getRedisOtpPattern(phone), otp, "EX", TWO_MINUTES_IN_SECONDS);

    return otp;
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
    const jwt = await new jose.SignJWT(payload).setProtectedHeader({ alg: "HS256" }).setExpirationTime("1d").sign(JWT_SECRET);
    return jwt;
};

export const verifySession = async (session: string): Promise<jose.JWTPayload> => {
    try {
        const { payload } = await jose.jwtVerify(session, JWT_SECRET);
        return payload;
    } catch (err) {
        throw new UnauthorizedException("session is expired");
    }
};

const getRedisSessionPattern = (_id: string): string => `session:${_id}`;

export const saveSessionInRedis = async (session: string, _id: string): Promise<void> => {
    await redis.set(getRedisSessionPattern(_id), session, "EX", NINETY_DAYS_IN_SECONDS);
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
    const expires = new Date(Date.now() + NINETY_DAYS_IN_MILLI_SECONDS);

    res.cookie("_session", credentials.session, {
        ...cookiesOption,
        expires,
    });

    Reflect.deleteProperty(credentials.user, "password");

    res.cookie("_user", credentials.user.toObject(), {
        ...cookiesOption,
        expires,
    });
};

export const updateUserCredentialCookie = async (res: Response, user: UserDocument): Promise<void> => {
    const ttl = await redis.ttl(getRedisSessionPattern(user._id.toString()));

    const expires = new Date(Date.now() + ttl * 1000);

    Reflect.deleteProperty(user, "password");

    res.cookie("_user", user.toObject(), {
        ...cookiesOption,
        expires,
    });
};
