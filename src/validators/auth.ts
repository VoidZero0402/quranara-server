import { z } from "zod";

export const SendOtpSchema = z.object({
    phone: z
        .string({ required_error: "Phone is a required field" })
        .regex(/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/g, { message: "Phone is not valid" })
        .trim(),
});

export const VerifyOtpSchema = z.object({
    phone: z
        .string({ required_error: "Phone is a required field" })
        .regex(/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/g, { message: "Phone is not valid" })
        .trim(),
    otp: z.string({ required_error: "Otp is a required field" }).regex(/^[0-9]{5}$/, { message: "Otp should be a 5 digits number" }),
    username: z.string().min(3, { message: "Username should be has more than 3 character" }).max(25, { message: "Username should be has less than 25 character" }).trim().optional(),
});
