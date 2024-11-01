import { z } from "zod";
import { slugRefiner } from "@/utils/validations";
import { STATUS } from "@/constants/courses";

const CreateCourseObject = z.object({
    title: z.string({ required_error: "title is required" }).min(1, { message: "title should not be empty" }).max(255, { message: "title should be has less than 255 character" }).trim(),
    slug: z.string().min(1, { message: "slug should not be empty" }).max(255, { message: "slug should be has less than 25 character" }).trim().optional(),
    description: z.string({ required_error: "description is required" }).min(1, { message: "description should not be empty" }).max(1024, { message: "description should be has less than 1024 character" }).trim(),
    price: z.coerce.number().positive({ message: "price can not be negative" }).default(0),
    status: z.enum([STATUS.PRE_SELL, STATUS.ON_PERFORMING, STATUS.REACHED], { message: "status only can be PRE_SELL, ON_PERFORMING or REACHED" }).default(STATUS.PRE_SELL),
    video: z.string().min(1, { message: "video should not be empty" }).trim().optional(),
    content: z.string().min(1, { message: "content should not be empty" }).trim().optional(),
});

export const CreateCourseSchema = CreateCourseObject.refine(slugRefiner);

export type CreateCourseSchemaType = z.infer<typeof CreateCourseSchema> & { slug: string };

export const UpdateCourseSchema = CreateCourseObject.extend({
    discount: z.number().min(0, { message: "discount can not be negative" }).max(100, { message: "discount can not be over han 100" }).optional(),
});

export type UpdateCourseSchemaType = z.infer<typeof UpdateCourseSchema>;
