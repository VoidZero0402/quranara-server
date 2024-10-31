import { z } from "zod";
import { sanitizeHtmlContent, validateObjectId } from "@/utils/validations";
import { PaginationQuerySchema } from "./pagination";

export const CreateTvSchema = z.object({
    title: z.string({ required_error: "title is required" }).min(1, { message: "title should not be empty" }).max(255, { message: "title should be has less than 25 character" }).trim(),
    description: z.string({ required_error: "description is required" }).min(1, { message: "description should not be empty" }).max(1024, { message: "description should be has less than 1024 character" }).trim(),
    category: validateObjectId,
    cover: z.string({ required_error: "cover is required" }).min(1, { message: "video should not be empty" }).trim(),
    video: z.string({ required_error: "video is required" }).min(1, { message: "video should not be empty" }).trim(),
    attached: z.string().min(1, { message: "attached should not be empty" }).trim().optional(),
    content: z.string().min(1, { message: "content should not be empty" }).trim().transform(sanitizeHtmlContent).optional(),
});

export type CreateTvSchemaType = z.infer<typeof CreateTvSchema>;

export const GetAllTvsQuerySchema = PaginationQuerySchema.extend({
    category: validateObjectId,
});

export type GetAllTvsQuerySchemaType = z.infer<typeof GetAllTvsQuerySchema>;

export const SearchTvsQuerySchame = PaginationQuerySchema.extend({
    q: z.string().min(1, { message: "title should not be empty" }).trim(),
});

export type SearchTvsQuerySchameType = z.infer<typeof SearchTvsQuerySchame>;
