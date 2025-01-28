import { Response } from "express";
import * as jose from "jose";
import { v4 as uuidv4 } from "uuid";

import redis from "@/config/redis";
import { UnauthorizedException } from "./exceptions";
import { scanRedisKeys } from "./funcs";

import { Credentials } from "@/types/auth.types";

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

const getAuthKey = (): string => `_auth_key_${uuidv4()}`;

export const createCredential = async (payload: jose.JWTPayload): Promise<Credentials> => {
    const session = await new jose.SignJWT(payload).setProtectedHeader({ alg: "HS256" }).setExpirationTime(JoseSessionExpirationTime).sign(JwtSecret);

    const authKey = getAuthKey();

    return { session, authKey };
};

export const verifySession = async (session: string): Promise<jose.JWTPayload | null> => {
    try {
        const { payload } = await jose.jwtVerify(session, JwtSecret);
        return payload;
    } catch {
        return null;
    }
};

const getRedisSessionPattern = (authKey: string, _id: string): string => `session:${_id}:${authKey}`;

export const saveSessionInRedis = async (credentials: Credentials, _id: string): Promise<void> => {
    await redis.set(getRedisSessionPattern(credentials.authKey, _id), credentials.session, "EX", JwtSessionExpires);
};

export const checkSession = async (credentials: Credentials, _id: string) => {
    const savedSession = await redis.get(getRedisSessionPattern(credentials.authKey, _id));

    const isMatched = credentials.session === savedSession;

    return isMatched;
};

export const removeSession = async (authKey: string, _id: string): Promise<void> => {
    await redis.del(getRedisSessionPattern(authKey, _id));
};

export const removeAllSession = async (_id: string): Promise<void> => {
    const pattern = `session:${_id}:*`;

    const keys = await scanRedisKeys(pattern);

    await redis.del(keys);
};

const cookiesOption = {
    httpOnly: true,
    path: "/",
    sameSite: "strict",
    priority: "high",
    secure: process.env.NODE_ENV === "production",
    signed: process.env.NODE_ENV === "production",
} as const;

export const setCredentialCookies = (res: Response, credentials: { session: string; authKey: string }): void => {
    const expires = new Date(Date.now() + JwtSessionExpiresInMilliSeconds);

    res.cookie("_session", credentials.session, {
        ...cookiesOption,
        expires,
    });

    res.cookie("_auth_key", credentials.authKey, {
        ...cookiesOption,
        expires,
    });
};
