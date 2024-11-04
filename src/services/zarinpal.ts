import { ServiceUnavailableException } from "@/utils/exceptions";

const baseURL = process.env.ZARINPAL_API_BASE_URL;
const merchantId = process.env.ZARINPAL_MERCHANT_ID;
const paymentBaseURL = process.env.ZARINPAL_PAYMENT_BASE_URL;
const callbackURL = process.env.ZARINPAL_CALLBACK_URL;
const currency = process.env.ZARINPAL_CURRENCY;

type CreatePaymentProps = { amount: number; description: string; mobile: string; email?: string };
type CreatePaymentOutput = Promise<{ data: object; authority: string; paymentUrl: string }>;

export const createPayment = async ({ amount, description, mobile, email }: CreatePaymentProps): CreatePaymentOutput => {
    try {
        const res = await fetch(`${baseURL}/request.json`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                merchant_id: merchantId,
                callback_url: callbackURL,
                amount,
                currency,
                description,
                metadata: {
                    mobile,
                    email,
                },
            }),
        });

        const { data } = await res.json();

        if (data.code !== 100) {
            throw new Error("zarinpal service error");
        }

        return {
            data,
            authority: data.authority,
            paymentUrl: `${paymentBaseURL}/${data.authority}`,
        };
    } catch {
        throw new ServiceUnavailableException("zarinpal service is unavailable");
    }
};

type VerifyPaymentProps = { authority: string; amount: number };
type VerifyPaymentOutput = Promise<{ code: number; message: string; isVerified: boolean }>;

export const verifyPayment = async ({ authority, amount }: VerifyPaymentProps): VerifyPaymentOutput => {
    try {
        const res = await fetch(`${baseURL}/verify.json`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                merchant_id: merchantId,
                amount,
                authority,
            }),
        });

        const { data } = await res.json();

        const isVerified = data.code === 100 || data.code === 101;

        return {
            code: data.code,
            message: data.message,
            isVerified,
        };
    } catch {
        throw new ServiceUnavailableException("zarinpal service is unavailable");
    }
};
