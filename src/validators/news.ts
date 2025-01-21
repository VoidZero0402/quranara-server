import { z } from "zod";
import { Paths } from "@/constants/uploads";

export const CreateNewsSchema = z.object({
    cover: z
        .string({ required_error: "cover is required" })
        .min(1, { message: "cover should not be empty" })
        .regex(/^[\w-\/\:\.]+\.(jpg|jpeg|png|webp)$/, { message: "cover has invalid signiture" })
        .trim()
        .transform((cover) => `${Paths.news.cover}/${cover}`),
    title: z.string({ required_error: "title is required" }).min(1, { message: "title should not be empty" }).max(255, { message: "title should be has less than 255 character" }).trim(),
    description: z.string({ required_error: "description is required" }).min(1, { message: "description should not be empty" }).max(2048, { message: "description should be has less than 2048 character" }).trim(),
    link: z
        .object({
            text: z.string().min(1, { message: "link text should not be empty" }).max(255, { message: "link text should be has less than 255 character" }).trim(),
            url: z.string({ required_error: "link url is required" }).url({ message: "link url is not valid" }),
        })
        .refine((link) => !!link.text === !!link.url, { path: ["text"], message: "text and url are required together" })
        .optional(),
    shown: z.boolean({ required_error: "shown is required" }),
});

export type CreateNewsSchemaType = z.infer<typeof CreateNewsSchema>;

export const UpdateNewsSchema = CreateNewsSchema.omit({ shown: true });

export type UpdateNewsSchemaType = z.infer<typeof UpdateNewsSchema>;
