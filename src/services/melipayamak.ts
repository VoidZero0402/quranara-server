import { ServiceUnavailableException } from "@/utils/exceptions";

export const sendOtp = async (phone: string): Promise<string> => {
    try {
        const options = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ to: phone }),
        };

        const res = await fetch(process.env.MELIPAYAMAK_SEND_OTP_API as string, options);

        if (res.status === 200) {
            const { code, status } = await res.json();
            return code;
        }

        throw new Error();
    } catch (err) {
        throw new ServiceUnavailableException("melipayamak service is unavailable");
    }
};
