import { z } from "zod";
import { validateObjectId } from "@/utils/validations";
import { SignupShcema } from "./auth";

export const BanUserSchema = z.object({
    user: validateObjectId,
});

export type BanUserSchemaType = z.infer<typeof BanUserSchema>;

export const UnbanUserSchema = z.object({
    ban: validateObjectId,
});

export type UnbanUserSchemaType = z.infer<typeof UnbanUserSchema>;

export const CreateUserSchema = SignupShcema.omit({ otp: true });

export type CreateUserSchemaType = z.infer<typeof CreateUserSchema>;

export const SigningCourseSchema = z.object({
    course: validateObjectId,
});

export type SigningCourseSchemaType = z.infer<typeof SigningCourseSchema>;
