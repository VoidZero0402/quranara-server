import { ServiceUnavailableException } from "@/utils/exceptions";

type SendOtpOutput = Promise<{
    code: string;
    status: string;
}>;

export const sendOtp = async (phone: string): SendOtpOutput => {
    try {
        const options = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                to: phone,
            }),
        };

        const res = await fetch(process.env.MELIPAYAMAK_SEND_OTP_API as string, options);

        if (res.status !== 200) {
            throw new Error();
        }

        const result = await res.json();

        return result;
    } catch {
        throw new ServiceUnavailableException("melipayamak service is unavailable");
    }
};
