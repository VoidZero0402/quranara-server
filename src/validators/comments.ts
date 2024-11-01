import { z } from "zod";
import { validateObjectId } from "@/utils/validations";
import { TYPE } from "@/constants/comments";

export const CommentQuerySchema = z.object({
    type: z.enum([TYPE.BLOG, TYPE.TV, TYPE.COURSE], { message: "type only can be BLOG, TV or COURSE" }),
    entityId: validateObjectId,
});

export type CommentQuerySchemaType = z.infer<typeof CommentQuerySchema>;

export const CreateCommentSchema = z.object({
    content: z.string({ required_error: "content is required" }).min(1, { message: "content should not be empty" }).max(2048, { message: "content should be has less than 2048 character" }).trim(),
    rating: z.number({ required_error: "rating is required" }).min(1, { message: "rating should be more than or equal 1" }).max(5, { message: "rating should be less than or equal 5" }),
});

export type CreateCommentSchemaType = z.infer<typeof CreateCommentSchema>;

export const ReplyCommentSchema = z.object({
    content: z.string({ required_error: "content is required" }).min(1, { message: "content should not be empty" }).max(2048, { message: "content should be has less than 2048 character" }).trim(),
    replyTo: validateObjectId,
});

export type ReplyCommentSchemaType = z.infer<typeof ReplyCommentSchema>;
