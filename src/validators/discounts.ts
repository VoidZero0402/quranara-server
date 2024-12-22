import { z } from "zod";
import { validateObjectId } from "@/utils/validations";

export const CreateDiscountSchema = z.object({
    code: z.string({ required_error: "code is required" }).min(1, { message: "code should not be empty" }).max(128, { message: "code should be has less than 128 character" }).trim(),
    percent: z.number({ required_error: "percent is required" }).min(1, { message: "minimum value of percent is 1" }).max(100, { message: "maximum vlaue of percent is 100" }),
    course: validateObjectId.optional(),
    max: z.number({ required_error: "max is required" }).min(1, { message: "minimum value of max is 1" }).max(9999, { message: "maximum vlaue of max is 9999" }),
    expireAtTime: z.number({ required_error: "expireAtTime is required" }),
});

export type CreateDiscountSchemaType = z.infer<typeof CreateDiscountSchema>;

export const UpdateDiscountSchema = CreateDiscountSchema.extend({
    expireAtTime: z.number({ required_error: "expireAtTime is required" }).optional(),
});

export type UpdateDiscountSchemaType = z.infer<typeof UpdateDiscountSchema>;

export const AvailableDiscountQuerySchema = CreateDiscountSchema.pick({ code: true, course: true });

export type AvailableDiscountQuerySchemaType = z.infer<typeof AvailableDiscountQuerySchema>;
