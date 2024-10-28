import { z } from "zod";
import { validateObjectId } from "@/utils/validations";

export const CreateTopicSchema = z.object({
    title: z.string({ required_error: "title is required" }).min(1, { message: "title should not be empty" }).max(255, { message: "title should be has less than 25 character" }).trim(),
    course: validateObjectId,
});

export type CreateTopicSchemaType = z.infer<typeof CreateTopicSchema>;

export const UpdateTopicSchema = CreateTopicSchema.pick({ title: true });

export type UpdateTopicSchemaType = z.infer<typeof UpdateTopicSchema>;

export const UpdateTopicOrderSchema = z
    .object({
        from: z.number({ required_error: "from is required" }).min(1, { message: "from can not be negative" }),
        to: z.number({ required_error: "to is required" }).min(1, { message: "to can not be negative" }),
    })
    .refine((values) => values.from !== values.to, { path: ["from-to"], params: ["from", "to"], message: "from and to can not be same" });

export type UpdateTopicOrderSchemaType = z.infer<typeof UpdateTopicOrderSchema>;
