import { z } from "zod";
import { REFERENCES } from "@/constants/polls";

const OptionsSchema = z
    .array(
        z.object({
            text: z.string({ required_error: "options.text is required" }).min(1, { message: "options.text should not be empty" }).max(255, { message: "options.text should be has less than 255 character" }).trim(),
        }),
        { required_error: "options is required" }
    )
    .min(2, { message: "the minimum number of options is 2" })
    .refine(
        (value) => {
            const texts = value.map((option) => option.text);
            const uniqueTexts = new Set(texts);

            return texts.length === uniqueTexts.size;
        },
        { params: ["options", "unique"], path: ["options", "unique"], message: "options.text must be unique" }
    );

export const CreatePollSchema = z.object({
    title: z.string({ required_error: "title is required" }).min(1, { message: "title should not be empty" }).max(255, { message: "title should be has less than 255 character" }).trim(),
    identifier: z.string({ required_error: "identifier is required" }).min(1, { message: "identifier should not be empty" }).max(255, { message: "identifier should be has less than 255 character" }).trim(),
    description: z.string({ required_error: "description is required" }).min(1, { message: "description should not be empty" }).max(1024, { message: "description should be has less than 1024 character" }).trim().optional(),
    ref: z.enum([REFERENCES.BLOG], { message: "ref only can be BLOG" }).default(REFERENCES.BLOG),
    options: OptionsSchema,
});

export type CreatePollSchemaType = z.infer<typeof CreatePollSchema>;

export const UpdatePollSchema = CreatePollSchema.omit({ ref: true });

export type UpdatePollSchemaType = z.infer<typeof UpdatePollSchema>;

export const VoutePollSchema = z.object({
    option: z.string({ required_error: "options is required" }).min(1, { message: "options should not be empty" }).max(255, { message: "options should be has less than 255 character" }).trim(),
});

export type VoutePollSchemaType = z.infer<typeof VoutePollSchema>;
