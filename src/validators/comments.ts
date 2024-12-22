import { z } from "zod";
import { validateObjectId } from "@/utils/validations";
import { PaginationQuerySchema } from "./pagination";
import { SOURCE, STATUS } from "@/constants/comments";

export const GetAllCommentsQuerySchema = PaginationQuerySchema.extend({
    source: z.enum([SOURCE.COURSE, SOURCE.BLOG, SOURCE.TV], { message: "source only can be COURSE, Blog or TV" }),
    status: z.enum([STATUS.ACCEPTED, STATUS.PENDING, STATUS.REJECTED], { message: "status only can be ACCEPTED, PENDING or REJECTED" }).optional(),
});

export type GetAllCommentsQuerySchemaType = z.infer<typeof GetAllCommentsQuerySchema>;

export const CreateCommentSchema = z
    .object({
        content: z.string({ required_error: "content is required" }).min(1, { message: "content should not be empty" }).max(2048, { message: "content should be has less than 2048 character" }).trim(),
        blog: validateObjectId.optional(),
        course: validateObjectId.optional(),
        tv: validateObjectId.optional(),
    })
    .refine((values) => values.blog || values.course || values.tv, { params: ["blog", "course", "tv"], path: ["blog", "course", "tv"], message: "one entity is required for comment" });

export type CreateCommentSchemaType = z.infer<typeof CreateCommentSchema>;

export const ReplyCommentSchema = z.object({
    content: z.string({ required_error: "content is required" }).min(1, { message: "content should not be empty" }).max(2048, { message: "content should be has less than 2048 character" }).trim(),
});

export type ReplyCommentSchemaType = z.infer<typeof ReplyCommentSchema>;

export const ActionsQuerySchema = z.object({
    isReply: z.coerce.number().transform(Boolean).optional(),
});

export type ActionsQuerySchemaType = z.infer<typeof ActionsQuerySchema>;
