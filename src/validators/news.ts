import { z } from "zod";
import { TYPE } from "@/constants/news";

export const CreateNewsSchema = z.object({
    type: z.enum([TYPE.COVER, TYPE.CONTENT_BASE], { message: "type only can be COVER or CONTENT_BASE" }),
    cover: z.string({ required_error: "cover is required" }).min(1, { message: "cover should not be empty" }).regex(/^[\w-]+\.(jpg|jpeg|png|webp)$/, { message: "cover has invalid signiture" }).trim(),
    title: z.string().min(1, { message: "title should not be empty" }).max(255, { message: "title should be has less than 255 character" }).trim().optional(),
    description: z.string().min(1, { message: "title should not be empty" }).max(255, { message: "title should be has less than 255 character" }).trim().optional(),
    link: z
        .object({
            text: z.string().min(1, { message: "link text should not be empty" }).max(255, { message: "link text should be has less than 255 character" }).trim().optional(),
            url: z.string({ required_error: "link url is required" }).url({ message: "link url is not valid" }),
        })
        .optional(),
    shown: z.boolean({ required_error: "shown is required" }),
});

export type CreateNewsSchemaType = z.infer<typeof CreateNewsSchema>;

export const UpdateNewsSchema = CreateNewsSchema.omit({ type: true, shown: true });

export type UpdateNewsSchemaType = z.infer<typeof UpdateNewsSchema>;
