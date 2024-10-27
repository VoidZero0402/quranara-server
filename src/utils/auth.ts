import { Response } from "express";
import * as jose from "jose";
import { Document } from "mongoose";

import { IUser } from "@/models/User";
import redis from "@/config/redis";
import { UnauthorizedException } from "./exceptions";

const jwtOptions = {
    accessToken: {
        secret: new TextEncoder().encode(process.env.ACCESS_TOKEN_SECRET),
        alg: "HS256",
    },
    refreshToken: {
        secret: new TextEncoder().encode(process.env.ACCESS_TOKEN_SECRET),
        alg: "HS256",
    },
};

const cookiesOption = {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
} as const;

const fiveMinutesInSeconds = 300;

const ninetyDaysInSeconds = 7_776_000;

const oneDayInMilliSeconds = 86_400_000;

const ninetyDaysInMilliSeconds = 7_776_000_000;

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

export const generateOtp = async (phone: string): Promise<string> => {
    let otp = "";

    for (let i = 0; i < 5; i++) {
        otp += Math.floor(Math.random() * (10 - 0) + 0);
    }

    await redis.set(getRedisOtpPattern(phone), otp, "EX", fiveMinutesInSeconds);

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

export const generateAccessToken = async (payload: jose.JWTPayload): Promise<string> => {
    const jwt = await new jose.SignJWT(payload).setProtectedHeader({ alg: jwtOptions.accessToken.alg }).setExpirationTime("1d").sign(jwtOptions.accessToken.secret);
    return jwt;
};

export const verifyAccessToken = async (token: string): Promise<jose.JWTPayload> => {
    try {
        const { payload } = await jose.jwtVerify(token, jwtOptions.accessToken.secret);
        return payload;
    } catch (err) {
        throw new UnauthorizedException("token is expired");
    }
};

export const generateRefreshToken = async (payload: jose.JWTPayload): Promise<string> => {
    const jwt = await new jose.SignJWT(payload).setProtectedHeader({ alg: jwtOptions.refreshToken.alg }).setExpirationTime("90d").sign(jwtOptions.refreshToken.secret);
    return jwt;
};

export const verifyRefreshToken = async (token: string): Promise<jose.JWTPayload> => {
    try {
        const { payload } = await jose.jwtVerify(token, jwtOptions.refreshToken.secret);
        return payload;
    } catch (err) {
        throw new UnauthorizedException("token is expired");
    }
};

export const saveRefreshTokenInRedis = async (token: string, _id: string): Promise<void> => {
    await redis.set(getRedisRefreshTokenPattern(_id), token, "EX", ninetyDaysInSeconds);
};

export const hasRefreshTokenInRedis = async (_id: string): Promise<boolean> => {
    return Boolean(await redis.exists(getRedisRefreshTokenPattern(_id)));
};

export const setCredentialCookies = (res: Response, credentials: { accessToken: string; refreshToken: string; user: Document<unknown, {}, IUser> & IUser }): void => {
    res.cookie("accessToken", credentials.accessToken, {
        ...cookiesOption,
        expires: new Date(Date.now() + oneDayInMilliSeconds),
    });

    res.cookie("refreshToken", credentials.refreshToken, {
        ...cookiesOption,
        expires: new Date(Date.now() + ninetyDaysInMilliSeconds),
    });

    res.cookie("user", credentials.user.toObject(), {
        ...cookiesOption,
        expires: new Date(Date.now() + ninetyDaysInMilliSeconds),
    });
};
