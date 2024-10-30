import { z } from "zod";

export const SendOtpSchema = z.object({
    phone: z
        .string({ required_error: "phone is a required field" })
        .trim()
        .regex(/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/g, { message: "phone is not valid" }),
});

export type SendOtpSchemaType = z.infer<typeof SendOtpSchema>;

export const VerifyOtpSchema = z.object({
    phone: z
        .string({ required_error: "phone is a required field" })
        .trim()
        .regex(/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/g, { message: "phone is not valid" }),

    otp: z.string({ required_error: "otp is a required field" }).regex(/^[0-9]{5}$/, { message: "otp should be a 5 digits number" }),
    username: z.string().min(3, { message: "username should be has more than 3 character" }).max(25, { message: "username should be has less than 25 character" }).trim().optional(),
});

export type VerifyOtpSchemaType = z.infer<typeof VerifyOtpSchema>;
