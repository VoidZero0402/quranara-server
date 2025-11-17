import { z } from "zod";
import { PHASE } from "@/constants/auth";

export const SignupShcema = z.object({
    phone: z
        .string({ required_error: "phone is a required field" })
        .trim()
        .regex(/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,10}$/g, { message: "phone is not valid" }),
    fullname: z.string({ required_error: "fullname is required" }).min(3, { message: "fullname should be more than or equal 3 character" }).max(255, { message: "fullname should be less than or equal 255 character" }),
    password: z.string({ required_error: "password is required" }).min(7, { message: "password should be more than or equal 7 character" }).max(255, { message: "password should be less than or equal 255 character" }),
    otp: z.string({ required_error: "otp is a required field" }).regex(/^[0-9]{5}$/, { message: "otp should be a 5 digits number" }),
});

export type SignupShcemaType = z.infer<typeof SignupShcema>;

export const SendOtpSchema = SignupShcema.pick({ phone: true }).extend({ phase: z.enum([PHASE.SIGNUP, PHASE.LOGIN]).default(PHASE.SIGNUP) });

export type SendOtpSchemaType = z.infer<typeof SendOtpSchema>;

export const LoginWithOtpSchema = SignupShcema.pick({ phone: true, otp: true });

export type LoginWithOtpSchemaType = z.infer<typeof LoginWithOtpSchema>;

export const LoginWithPasswordSchema = SignupShcema.pick({ phone: true, password: true });

export type LoginWithPasswordSchemaType = z.infer<typeof LoginWithPasswordSchema>;
