import { z } from "zod";
import { PaginationQuerySchema } from "./pagination";
import { SORTING, STATUS } from "@/constants/courses";

export const CreateCourseSchema = z.object({
    title: z.string({ required_error: "title is required" }).min(1, { message: "title should not be empty" }).max(255, { message: "title should be has less than 255 character" }).trim(),
    slug: z
        .string()
        .min(1, { message: "slug should not be empty" })
        .max(255, { message: "slug should be has less than 255 character" })
        .trim()
        .transform((value) => value.replaceAll(" ", "-")),
    description: z.string({ required_error: "description is required" }).min(1, { message: "description should not be empty" }).max(1024, { message: "description should be has less than 1024 character" }).trim(),
    cover: z
        .string({ required_error: "cover is required" })
        .min(1, { message: "cover should not be empty" })
        .regex(/^[\w-\/\:\.]+\.(jpg|jpeg|png|webp)$/, { message: "cover has invalid signiture" })
        .trim(),
    price: z.number({ required_error: "price is required" }).min(0, { message: "price can not be negative" }),
    status: z.enum([STATUS.PRE_SELL, STATUS.ON_PERFORMING, STATUS.REACHED], { message: "status only can be PRE_SELL, ON_PERFORMING or REACHED" }).default(STATUS.PRE_SELL),
    shown: z.boolean({ required_error: "shown is required" }),
    introduction: z
        .object({
            video: z
                .string()
                .min(1, { message: "video should not be empty" })
                .regex(/^[\w-\/\:\.]+\.(mp4)$/, { message: "video has invalid signiture" })
                .trim()
                .optional(),
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

export type CreateCourseSchemaType = z.infer<typeof CreateCourseSchema> & { slug: string };

export const UpdateCourseSchema = CreateCourseSchema.extend({
    discount: z.number().min(0, { message: "discount can not be negative" }).max(100, { message: "discount can not be over han 100" }).optional(),
});

export type UpdateCourseSchemaType = z.infer<typeof UpdateCourseSchema>;

export const UpdateCourseOrderSchema = z
    .object({
        from: z.number({ required_error: "from is required" }).min(1, { message: "from can not be zero or negative" }),
        to: z.number({ required_error: "to is required" }).min(1, { message: "to can not be zero or negative" }),
    })
    .refine((values) => values.from !== values.to, { path: ["from-to"], params: ["from", "to"], message: "from and to can not be same" });

export type UpdateCourseOrderSchemaType = z.infer<typeof UpdateCourseOrderSchema>;

export const GetAllCoursesQuerySchema = PaginationQuerySchema.extend({
    sort: z.enum([SORTING.DEFAULT, SORTING.NEWSET, SORTING.OLDEST, SORTING.POPULAR]).default(SORTING.DEFAULT),
    search: z.string().min(1, { message: "search should not be empty" }).optional(),
});

export type GetAllCoursesQuerySchemaType = z.infer<typeof GetAllCoursesQuerySchema>;

export const SearchCoursesQuerySchame = PaginationQuerySchema.extend({
    q: z.string({ message: "q is required" }).min(1, { message: "q should not be empty" }).trim(),
});

export type SearchCoursesQuerySchameType = z.infer<typeof SearchCoursesQuerySchame>;

export const DiscountAllSchema = z.object({
    discount: z.number().min(0, { message: "discount can not be negative" }).max(100, { message: "discount can not be over han 100" }),
});

export type DiscountAllSchemaType = z.infer<typeof DiscountAllSchema>;
