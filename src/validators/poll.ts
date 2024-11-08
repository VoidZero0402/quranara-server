import { z } from "zod";
import { REFERENCES } from "@/constants/poll";

export const CreatePollSchema = z.object({
    title: z.string({ required_error: "title is required" }).min(1, { message: "title should not be empty" }).max(255, { message: "title should be has less than 255 character" }).trim(),
    idetifier: z.string({ required_error: "idetifier is required" }).min(1, { message: "idetifier should not be empty" }).max(255, { message: "idetifier should be has less than 255 character" }).trim(),
    description: z.string({ required_error: "description is required" }).min(1, { message: "description should not be empty" }).max(1024, { message: "description should be has less than 1024 character" }).trim(),
    ref: z.enum([REFERENCES.BLOG], { message: "ref only can be BLOG" }).default(REFERENCES.BLOG),
    options: z.array(
        z.object({
            text: z.string({ required_error: "options.text is required" }).min(1, { message: "options.text should not be empty" }).max(255, { message: "options.text should be has less than 255 character" }).trim(),
        }),
        { required_error: "options is required" }
    ),
});

export type CreatePollSchemaType = z.infer<typeof CreatePollSchema>;

export const UpdatePollSchema = CreatePollSchema.omit({ ref: true });

export type UpdatePollSchemaType = z.infer<typeof UpdatePollSchema>;

export const VoutePollSchema = z.object({
    option: z.string({ required_error: "options is required" }).min(1, { message: "options should not be empty" }).max(255, { message: "options should be has less than 255 character" }).trim(),
});

export type VoutePollSchemaType = z.infer<typeof VoutePollSchema>;
