import { z } from "zod";
import { validateObjectId } from "@/utils/validations";
import { ATTACHED_FILE_TYPES } from "@/constants/files";
import { STATUS, TYPE } from "@/constants/tickets";
import { PaginationQuerySchema } from "./pagination";

export const CreateTicketSchema = z.object({
    course: validateObjectId.optional(),
    title: z.string({ required_error: "title is required" }).min(1, { message: "title should not be empty" }).max(255, { message: "title should be has less than 255 character" }).trim(),
    content: z.string({ required_error: "content is required" }).min(1, { message: "content should not be empty" }).max(2048, { message: "content should be has less than 2048 character" }).trim(),
    type: z.enum([TYPE.SUPPORT, TYPE.MANAGEMENT], { message: "type only can be SUPPORT or MANAGEMENT" }).default(TYPE.SUPPORT),
    attached: z
        .object({
            type: z.enum([ATTACHED_FILE_TYPES.IMAGE, ATTACHED_FILE_TYPES.AUDIO, ATTACHED_FILE_TYPES.ZIP], { message: "attached type only can be IMAGE, AUDIO or ZIP" }),
            url: z.string({ required_error: "attached url is required" }).url(),
        })
        .optional(),
});

export type CreateTicketSchemaType = z.infer<typeof CreateTicketSchema>;

export const AnswerTicketSchema = CreateTicketSchema.pick({ content: true, attached: true });

export type AnswerTicketSchemaType = z.infer<typeof AnswerTicketSchema>;

export const GetAllTicketsQuerySchema = PaginationQuerySchema.extend({
    status: z.enum([STATUS.ACTIVE, STATUS.SLEEP, STATUS.COLSED], { message: "status only can be ACTIVE, SLEEP or CLOSED" }).default(STATUS.ACTIVE),
});

export type GetAllTicketsQuerySchemaType = z.infer<typeof GetAllTicketsQuerySchema>;
