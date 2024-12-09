import { z } from "zod";
import { validateObjectId } from "@/utils/validations";

export const CreateNotificationSchema = z.object({
    title: z.string({ required_error: "title is required" }).min(1, { message: "title should not be empty" }).max(255, { message: "title should be has less than 255 character" }).trim(),
    description: z.string({ required_error: "description is required" }).min(1, { message: "description should not be empty" }).max(4098, { message: "description should be has less than 4098 character" }).trim(),
});

export type CreateNotificationSchemaType = z.infer<typeof CreateNotificationSchema>;

export const SendAllNotificationSchema = CreateNotificationSchema;

export type SendAllNotificationSchemaType = z.infer<typeof SendAllNotificationSchema>;

export const SendCourseRegistersNotificationSchema = CreateNotificationSchema.extend({
    course: validateObjectId,
});

export type SendCourseRegistersNotificationSchemaType = z.infer<typeof SendCourseRegistersNotificationSchema>;

export const SendOneNotificationSchema = CreateNotificationSchema.extend({
    user: validateObjectId,
});

export type SendOneNotificationSchemaType = z.infer<typeof SendOneNotificationSchema>;
