import { z } from "zod";
import { validateObjectId } from "@/utils/validations";
import { PaginationQuerySchema } from "./pagination";
import { ATTACHED_FILE_TYPES } from "@/constants/files";
import { STATUS } from "@/constants/questions";

export const CreateQuestionSchema = z.object({
    session: validateObjectId,
    content: z.string({ required_error: "content is required" }).min(1, { message: "content should not be empty" }).max(2048, { message: "content should be has less than 2048 character" }).trim(),
    attached: z
        .object({
            type: z.enum([ATTACHED_FILE_TYPES.IMAGE, ATTACHED_FILE_TYPES.AUDIO, ATTACHED_FILE_TYPES.ZIP], { message: "attached type only can be IMAGE, AUDIO or ZIP" }),
            url: z.string({ required_error: "attached url is required" }).url(),
        })
        .optional(),
});

export type CreateQuestionSchemaType = z.infer<typeof CreateQuestionSchema>;

export const AnswerQuestionSchema = CreateQuestionSchema.omit({ session: true });

export type AnswerQuestionSchemaType = z.infer<typeof AnswerQuestionSchema>;

export const GetAllQuestionsQuerySchema = PaginationQuerySchema.extend({
    status: z.enum([STATUS.ACTIVE, STATUS.SLEEP, STATUS.COLSED], { message: "status only can be ACTIVE, SLEEP or CLOSED" }).default(STATUS.ACTIVE),
});

export type GetAllQuestionsQuerySchemaType = z.infer<typeof GetAllQuestionsQuerySchema>;
