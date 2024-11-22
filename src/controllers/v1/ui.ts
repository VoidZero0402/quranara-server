import { NextFunction, Request, Response } from "express";

import CourseModel from "@/models/Course";
import CategoryModel from "@/models/Category";

import { REFERENCES } from "@/constants/categories";

import { SuccessResponse } from "@/utils/responses";

export const getMenus = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const courses = await CourseModel.find({}, "title slug").sort({ order: 1 }).limit(5);

        const blogCategories = await CategoryModel.find({ ref: REFERENCES.BLOG }, "title caption").sort({ _id: -1 }).limit(5);

        const tvCategories = await CategoryModel.find({ ref: REFERENCES.TV }, "title caption").sort({ _id: -1 }).limit(5);

        const categories = { blog: blogCategories, tv: tvCategories };

        SuccessResponse(res, 200, { courses, categories });
    } catch (err) {
        next(err);
    }
};
