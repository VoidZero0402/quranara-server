import { z } from "zod";
import { SignupShcema } from "./auth";

export const UpdateAccountSchema = SignupShcema.pick({ fullname: true }).extend({
    username: z.string({ required_error: "username is required" }).min(3, { message: "username should be more than or equal 3 character" }).max(255, { message: "username should be less than or equal 255 character" }),
    profile: z.string().url().optional(),
});

export type UpdateAccountSchemaType = z.infer<typeof UpdateAccountSchema>;

export const ChangePasswordSchema = z.object({
    past: z.string({ required_error: "password is required" }).min(7, { message: "password should be more than or equal 7 character" }).max(255, { message: "password should be less than or equal 255 character" }),
    new: z.string({ required_error: "password is required" }).min(7, { message: "password should be more than or equal 7 character" }).max(255, { message: "password should be less than or equal 255 character" }),
});

export type ChangePasswordSchemaType = z.infer<typeof ChangePasswordSchema>;
