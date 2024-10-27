import * as jose from "jose";
import redis from "@/config/redis";

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

    await redis.set(getRedisOtpPattern(phone), otp, "EX", 300);

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

export const generateAccessToken = async (payload: jose.JWTPayload) => {
    const secret = new TextEncoder().encode(process.env.ACCESS_TOKEN_SECRET);
    const alg = "HS256";

    const jwt = await new jose.SignJWT(payload).setProtectedHeader({ alg }).setExpirationTime("1d").sign(secret);

    return jwt;
};

export const generateRefreshToken = async (payload: jose.JWTPayload) => {
    const secret = new TextEncoder().encode(process.env.REFRESH_TOKEN_SECRET);
    const alg = "HS256";

    const jwt = await new jose.SignJWT(payload).setProtectedHeader({ alg }).setExpirationTime("90d").sign(secret);

    return jwt;
};
