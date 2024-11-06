import { z } from "zod";
import { slugRefiner } from "@/utils/validations";
import { STATUS } from "@/constants/courses";

const CreateCourseObject = z.object({
    title: z.string({ required_error: "title is required" }).min(1, { message: "title should not be empty" }).max(255, { message: "title should be has less than 255 character" }).trim(),
    slug: z.string().min(1, { message: "slug should not be empty" }).max(255, { message: "slug should be has less than 25 character" }).trim().optional(),
    description: z.string({ required_error: "description is required" }).min(1, { message: "description should not be empty" }).max(1024, { message: "description should be has less than 1024 character" }).trim(),
    cover: z.string({ required_error: "cover is required" }).min(1, { message: "cover should not be empty" }).regex(/^[\w-]+\.(jpg|jpeg|png|webp)$/, { message: "cover has invalid signiture" }).trim(),
    price: z.number({ required_error: "price is required" }).min(0, { message: "price can not be negative" }),
    status: z.enum([STATUS.PRE_SELL, STATUS.ON_PERFORMING, STATUS.REACHED], { message: "status only can be PRE_SELL, ON_PERFORMING or REACHED" }).default(STATUS.PRE_SELL),
    introduction: z
        .object({
            video: z.string().min(1, { message: "video should not be empty" }).regex(/^[\w-]+\.(mp4)$/, { message: "video has invalid signiture" }).trim().optional(),
            content: z.string().min(1, { message: "content should not be empty" }).trim().optional(),
        })
        .optional(),
    metadata: z.object(
        {
            support: z.string({ required_error: "metadata.support is required" }).min(1, { message: "title should not be empty" }),
            preRequisite: z.string({ required_error: "metadata.preRequisite is required" }).min(1, { message: "preRequisite should not be empty" }),
            present: z.string({ required_error: "metadata.present is required" }).min(1, { message: "present should not be empty" }),
            hours: z.number({ required_error: "metadata.hours is required" }).positive({ message: "metadata.hours can not be negative" }),
        },
        { required_error: "metadata is required" }
    ),
});

export const CreateCourseSchema = CreateCourseObject.refine(slugRefiner);

export type CreateCourseSchemaType = z.infer<typeof CreateCourseSchema> & { slug: string };

export const UpdateCourseSchema = CreateCourseObject.extend({
    discount: z.number().min(0, { message: "discount can not be negative" }).max(100, { message: "discount can not be over han 100" }).optional(),
});

export type UpdateCourseSchemaType = z.infer<typeof UpdateCourseSchema>;
