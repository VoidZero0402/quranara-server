import { z } from "zod";

const CreateCourseObject = z.object({
    title: z.string({ required_error: "title is required" }).min(1, { message: "title should not be empty" }).max(255, { message: "title should be has less than 25 character" }),
    slug: z.string().min(1, { message: "slug should not be empty" }).max(255, { message: "slug should be has less than 25 character" }).optional(),
    description: z.string({ required_error: "description is required" }).min(1, { message: "description should not be empty" }).max(1024, { message: "description should be has less than 1024 character" }),
    price: z.coerce.number().min(0, { message: "price can not be negative" }).default(0),
    isPresell: z.coerce.number({ required_error: "isPresell is required" }).transform(Boolean),
    video: z.string().min(1, { message: "video should not be empty" }).optional(),
    content: z.string().min(1, { message: "content should not be empty" }).optional(),
});

export const CreateCourseSchema = CreateCourseObject.refine((values) => {
    if (!values.slug) {
        values.slug = values.title.replaceAll(" ", "-");
    }

    return true;
});

export type CreateCourseSchemaType = z.infer<typeof CreateCourseSchema> & { slug: string };

export const UpdateCourseSchema = CreateCourseObject.extend({
    discount: z.number().min(0, { message: "discount can not be negative" }).max(100, { message: "discount can not be over han 100" }).optional(),
});

export type UpdateCourseSchemaType = z.infer<typeof UpdateCourseSchema>;
