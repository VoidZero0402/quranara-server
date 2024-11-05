import { z } from "zod";
import { sanitizeHtmlContent, slugRefiner, validateObjectId } from "@/utils/validations";
import { PaginationQuerySchema } from "./pagination";
import { STATUS } from "@/constants/blog";

export const CreateBlogSchema = z
    .object({
        title: z.string({ required_error: "title is required" }).min(1, { message: "title should not be empty" }).max(255, { message: "title should be has less than 255 character" }).trim(),
        description: z.string({ required_error: "description is required" }).min(1, { message: "description should not be empty" }).max(1024, { message: "description should be has less than 1024 character" }).trim(),
        slug: z.string().min(1, { message: "slug should not be empty" }).max(255, { message: "slug should be has less than 25 character" }).trim().optional(),
        category: validateObjectId,
        cover: z.string({ required_error: "cover is required" }).min(1, { message: "cover should not be empty" }).trim(),
        content: z.string({ required_error: "content is required" }).min(1, { message: "content should not be empty" }).trim().transform(sanitizeHtmlContent),
        tags: z.array(z.string().min(1, { message: "tag should not be empty" }), { invalid_type_error: "tags should be an array od string" }).optional(),
        relatedCourses: z.array(validateObjectId, { message: "relatedCourses should be an array of course ObjectIds" }).optional(),
    })
    .refine(slugRefiner);

export type CreateBlogSchemaType = z.infer<typeof CreateBlogSchema> & { slug: string };

export const CreateBlogQuerySchema = z.object({
    status: z.enum([STATUS.DRAFTED, STATUS.PUBLISHED], { message: "status only can be DRAFTED or PUBLISHED" }).default(STATUS.DRAFTED),
});

export type CreateBlogQuerySchemaType = z.infer<typeof CreateBlogQuerySchema>;

export const GetAllBlogsQuerySchema = PaginationQuerySchema.extend({
    category: validateObjectId.optional(),
});

export type GetAllBlogsQuerySchemaType = z.infer<typeof GetAllBlogsQuerySchema>;

export const SearchBlogsQuerySchame = PaginationQuerySchema.extend({
    q: z.string({ message: "q is required" }).min(1, { message: "title should not be empty" }).trim(),
});

export type SearchBlogsQuerySchameType = z.infer<typeof SearchBlogsQuerySchame>;
