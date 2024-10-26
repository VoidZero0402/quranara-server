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
