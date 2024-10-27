import { Response } from "express";
import * as jose from "jose";
import redis from "@/config/redis";
import { Document } from "mongoose";
import { IUser } from "@/models/User";

const getRedisOtpPattern = (phone: string): string => `otp:${phone}`;

const getRedisRefreshTokenPattern = (_id: string): string => `refreshToken:${_id}`;

export const getOtp = async (phone: string): Promise<{ expired: boolean; ttl: number }> => {
    const otp = await redis.get(getRedisOtpPattern(phone));

    if (!otp) {
        return { expired: true, ttl: 0 };
    }

    const ttl = await redis.ttl(getRedisOtpPattern(phone));

    return { expired: false, ttl };
};

export const saveOtp = async (phone: string, otp: string) => {
    await redis.set(getRedisOtpPattern(phone), otp, "EX", 300);
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

export const generateAccessToken = async (payload: jose.JWTPayload): Promise<string> => {
    const secret = new TextEncoder().encode(process.env.ACCESS_TOKEN_SECRET);
    const alg = "HS256";

    const jwt = await new jose.SignJWT(payload).setProtectedHeader({ alg }).setExpirationTime("1d").sign(secret);

    return jwt;
};

export const generateRefreshToken = async (payload: jose.JWTPayload): Promise<string> => {
    const secret = new TextEncoder().encode(process.env.REFRESH_TOKEN_SECRET);
    const alg = "HS256";

    const jwt = await new jose.SignJWT(payload).setProtectedHeader({ alg }).setExpirationTime("90d").sign(secret);

    return jwt;
};

export const saveRefreshTokenInRedis = async (token: string, _id: string): Promise<void> => {
    await redis.set(getRedisRefreshTokenPattern(_id), token, "EX", 7_776_000);
};

export const setCredentialCookies = (res: Response, credentials: { accessToken: string; refreshToken: string; user: Document<unknown, {}, IUser> & IUser }): void => {
    const options = {
        httpOnly: true,
        path: "/",
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
    } as const;

    const oneDayInMilliSeconds = 86_400_000;
    const ninetyDaysInMilliSeconds = 7_776_000_000;

    res.cookie("accessToken", credentials.accessToken, {
        ...options,
        expires: new Date(Date.now() + oneDayInMilliSeconds),
    });

    res.cookie("refreshToken", credentials.refreshToken, {
        ...options,
        expires: new Date(Date.now() + ninetyDaysInMilliSeconds),
    });

    res.cookie("user", credentials.user.toObject(), {
        ...options,
        expires: new Date(Date.now() + ninetyDaysInMilliSeconds),
    });
};
