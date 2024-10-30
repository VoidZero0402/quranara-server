import { ServiceUnavailableException } from "@/utils/exceptions";

export const sendOtp = async (phone: string, otp: string): Promise<string> => {
    try {
        const options = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                bodyId: parseInt(process.env.MELIPAYAMAK_BODYID as string),
                to: phone,
                args: [otp],
            }),
        };

        const res = await fetch(process.env.MELIPAYAMAK_SEND_OTP_API as string, options);

        if (res.status !== 200) {
            throw new Error();
        }

        const { recId } = await res.json();
        return recId;
    } catch {
        throw new ServiceUnavailableException("melipayamak service is unavailable");
    }
};
