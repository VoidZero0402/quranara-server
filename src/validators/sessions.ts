import { z } from "zod";
import { validateObjectId } from "@/utils/validations";

export const CreateSessionSchema = z.object({
    title: z.string({ required_error: "title is required" }).min(1, { message: "title should not be empty" }).max(255, { message: "title should be has less than 25 character" }).trim(),
    course: validateObjectId,
    topic: validateObjectId,
    isPublic: z.boolean().default(false),
    video: z
        .string({ required_error: "video is required" })
        .min(1, { message: "video should not be empty" })
        .regex(/^[\w-\/\:\.]+\.(mp4)$/, { message: "video has invalid signiture" })
        .trim(),
    time: z
        .string({ required_error: "time of video is required" })
        .trim()
        .regex(/^(\d{1,2}):([0-5]\d):([0-5]\d)$|^([0-5]?\d):([0-5]\d)$/, { message: "time is not valid" }),
    attached: z.string().min(1, { message: "attached should not be empty" }).trim().optional(),
});

export type CreateSessionSchemaType = z.infer<typeof CreateSessionSchema>;

export const UpdateSessionSchema = CreateSessionSchema.omit({ course: true, topic: true });

export type UpdateSessionSchemaType = z.infer<typeof UpdateSessionSchema>;

export const UpdateSessionOrderSchema = z
    .object({
        from: z.number({ required_error: "from is required" }).min(1, { message: "from can not be zero or negative" }),
        to: z.number({ required_error: "to is required" }).min(1, { message: "to can not be zero or negative" }),
    })
    .refine((values) => values.from !== values.to, { path: ["from-to"], params: ["from", "to"], message: "from and to can not be same" });

export type UpdateSessionOrderSchemaType = z.infer<typeof UpdateSessionOrderSchema>;
