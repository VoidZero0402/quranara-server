import { validateObjectId } from "@/utils/validations";
import { z } from "zod";

const CreateCourseSchemaObject = z.object({
    title: z.string({ required_error: "title is required" }).min(1, { message: "title should not be empty" }).max(255, { message: "title should be has less than 25 character" }),
    slug: z.string().min(1, { message: "slug should not be empty" }).max(255, { message: "slug should be has less than 25 character" }).optional(),
    description: z.string({ required_error: "description is required" }).min(1, { message: "description should not be empty" }).max(1024, { message: "description should be has less than 1024 character" }),
    price: z.number().min(0, { message: "price can not be negative" }).default(0),
    isPresell: z.boolean({ required_error: "isPresell is required" }),
    introduction: z
        .object({
            video: z.string().min(1, { message: "video should not be empty" }).optional(),
            content: z.string().min(1, { message: "content should not be empty" }).optional(),
        })
        .optional(),
});

export const CreateCourseSchema = CreateCourseSchemaObject.refine((values) => {
    if (!values.slug) {
        values.slug = values.title.replaceAll(" ", "-");
    }
});

export type CreateCourseSchemaType = z.infer<typeof CreateCourseSchema> & { slug: string };

export const UpdateCourseSchema = CreateCourseSchemaObject.extend({
    discount: z.number().min(0, { message: "discount can not be negative" }).max(100, { message: "discount can not be over han 100" }).optional(),
});

export type UpdateCourseSchemaType = z.infer<typeof UpdateCourseSchema>;

export const CreateTopicSchema = z.object({
    title: z.string({ required_error: "title is required" }).min(1, { message: "title should not be empty" }).max(255, { message: "title should be has less than 25 character" }),
    course: validateObjectId,
});

export type CreateTopicSchemaType = z.infer<typeof CreateTopicSchema>;

export const UpdateTopicSchema = CreateTopicSchema.pick({ title: true });

export type UpdateTopicSchemaType = z.infer<typeof UpdateTopicSchema>;
