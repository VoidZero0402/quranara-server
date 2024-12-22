import { z } from "zod";
import { PaginationQuerySchema } from "./pagination";
import { REFERENCES } from "@/constants/categories";

export const CreateCategorySchema = z.object({
    title: z.string({ required_error: "title is required" }).min(1, { message: "title should not be empty" }).max(255, { message: "title should be has less than 25 character" }).trim(),
    caption: z.string({ required_error: "title is required" }).min(1, { message: "title should not be empty" }).max(255, { message: "title should be has less than 25 character" }).trim(),
    ref: z.enum([REFERENCES.BLOG, REFERENCES.TV, REFERENCES.COURSE, REFERENCES.DISCUSSION], { message: "ref only can be BLOG, TV, COURSE or DISCUSSION" }),
});

export type CreateCategorySchemaType = z.infer<typeof CreateCategorySchema>;

export const UpdateCategorySchema = CreateCategorySchema.omit({ ref: true });

export type UpdateCategorySchemaType = z.infer<typeof UpdateCategorySchema>;

export const GetAllCategoriesQuerySchema = PaginationQuerySchema.extend({
    ref: z.enum([REFERENCES.BLOG, REFERENCES.TV, REFERENCES.COURSE, REFERENCES.DISCUSSION], { message: "ref only can be BLOG, TV, COURSE or DISCUSSION" }).optional(),
});

export type GetAllCategoriesQuerySchemaType = z.infer<typeof GetAllCategoriesQuerySchema>;

export const GetCategoriesSummarySchema = GetAllCategoriesQuerySchema.pick({ ref: true });

export type GetCategoriesSummarySchemaType = z.infer<typeof GetCategoriesSummarySchema>;
