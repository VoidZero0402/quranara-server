import { z } from "zod";
import { validateObjectId } from "@/utils/validations";
import { SORTING } from "@/constants/tv";
import { PaginationQuerySchema } from "./pagination";

export const CreateTvSchema = z.object({
    title: z.string({ required_error: "title is required" }).min(1, { message: "title should not be empty" }).max(255, { message: "title should be has less than 25 character" }).trim(),
    description: z.string({ required_error: "description is required" }).min(1, { message: "description should not be empty" }).max(1024, { message: "description should be has less than 1024 character" }).trim(),
    slug: z
        .string()
        .min(1, { message: "slug should not be empty" })
        .max(255, { message: "slug should be has less than 25 character" })
        .trim()
        .transform((value) => value.replaceAll(" ", "-")),
    category: validateObjectId,
    cover: z
        .string({ required_error: "cover is required" })
        .min(1, { message: "video should not be empty" })
        .regex(/^[\w-\/\:\.]+\.(jpg|jpeg|png|webp)$/, { message: "cover has invalid signiture" })
        .trim(),
    video: z
        .string({ required_error: "video is required" })
        .min(1, { message: "video should not be empty" })
        .regex(/^[\w-\/\:\.]+\.(mp4)$/, { message: "video has invalid signiture" })
        .trim(),
    attached: z.string().min(1, { message: "attached should not be empty" }).trim().optional(),
    content: z.string().min(1, { message: "content should not be empty" }).trim().optional(),
    shown: z.boolean({ required_error: "shown is required" }),
});

export type CreateTvSchemaType = z.infer<typeof CreateTvSchema> & { slug: string };

export const GetAllTvsQuerySchema = PaginationQuerySchema.extend({
    category: validateObjectId.or(z.array(validateObjectId)).optional(),
    sort: z.enum([SORTING.DEFAULT, SORTING.NEWEST, SORTING.OLDEST, SORTING.POPULAR]).default(SORTING.NEWEST),
    search: z.string().min(1, { message: "search should not be empty" }).optional(),
});

export type GetAllTvsQuerySchemaType = z.infer<typeof GetAllTvsQuerySchema>;

export const SearchTvsQuerySchame = PaginationQuerySchema.extend({
    q: z.string({ message: "q is required" }).min(1, { message: "title should not be empty" }).trim(),
});

export type SearchTvsQuerySchameType = z.infer<typeof SearchTvsQuerySchame>;
