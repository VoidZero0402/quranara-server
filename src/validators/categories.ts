import { z } from "zod";
import { REFERENCES } from "@/constants/categories";
import { PaginationQuerySchema } from "./pagination";

export const CreateCategorySchema = z.object({
    title: z.string({ required_error: "title is required" }).min(1, { message: "title should not be empty" }).max(255, { message: "title should be has less than 25 character" }).trim(),
    caption: z.string({ required_error: "title is required" }).min(1, { message: "title should not be empty" }).max(255, { message: "title should be has less than 25 character" }).trim(),
    ref: z.enum([REFERENCES.BLOG, REFERENCES.TV, REFERENCES.COURSE], { message: "ref only can be BLOG, TV or COURSE" }),
});

export type CreateCategorySchemaType = z.infer<typeof CreateCategorySchema>;

export const UpdateCategorySchema = CreateCategorySchema.omit({ ref: true });

export type UpdateCategorySchemaType = z.infer<typeof UpdateCategorySchema>;

export const GetAllCategoriesQuerySchema = PaginationQuerySchema.extend({
    ref: z.enum([REFERENCES.BLOG, REFERENCES.TV, REFERENCES.COURSE], { message: "ref only can be BLOG, TV or COURSE" }).default(REFERENCES.BLOG),
});

export type GetAllCategoriesQuerySchemaType = z.infer<typeof GetAllCategoriesQuerySchema>;
