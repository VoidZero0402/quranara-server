import { z } from "zod";
import { validateObjectId } from "@/utils/validations";
import { ATTACHED_FILE_TYPES } from "@/constants/files";

export const CreateQuestionSchema = z.object({
    session: validateObjectId,
    content: z.string({ required_error: "content is required" }).min(1, { message: "content should not be empty" }).max(2048, { message: "content should be has less than 2048 character" }).trim(),
    attached: z.object({
        type: z.enum([ATTACHED_FILE_TYPES.IMAGE, ATTACHED_FILE_TYPES.AUDIO, ATTACHED_FILE_TYPES.ZIP], { message: "attached type only can be image, audio or zip" }),
        url: z.string({ required_error: "attached url is required" }).url(),
    }),
});

export type CreateQuestionSchemaType = z.infer<typeof CreateQuestionSchema>;
