import { NextFunction, Request, Response } from "express";

import CategoryModel from "@/models/Category";

import { CreateCategorySchemaType, UpdateCategorySchemaType, GetAllCategoriesQuerySchemaType } from "@/validators/categories";

import { RequestParamsWithID } from "@/types/request.types";

import { NotFoundException } from "@/utils/exceptions";
import { SuccessResponse } from "@/utils/responses";
import { createPaginationData } from "@/utils/funcs";

export const getAll = async (req: Request<{}, {}, {}, GetAllCategoriesQuerySchemaType>, res: Response, next: NextFunction) => {
    try {
        const { page, limit, ref } = req.query;

        const filters = { ref };

        const categories = await CategoryModel.find(filters)
            .skip((page - 1) * limit)
            .limit(limit);

        const categoriesCount = await CategoryModel.countDocuments(filters);

        SuccessResponse(res, 200, { categories, pagination: createPaginationData(page, limit, categoriesCount) });
    } catch (err) {
        next(err);
    }
};

export const create = async (req: Request<{}, {}, CreateCategorySchemaType>, res: Response, next: NextFunction) => {
    try {
        const { title, caption, ref } = req.body;

        const category = await CategoryModel.create({
            title,
            caption,
            ref,
        });

        SuccessResponse(res, 201, { category });
    } catch (err) {
        next(err);
    }
};

export const update = async (req: Request<RequestParamsWithID, {}, UpdateCategorySchemaType>, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { title, caption } = req.body;

        const category = await CategoryModel.findByIdAndUpdate(
            id,
            {
                $set: { title, caption },
            },
            { new: true }
        );

        if (!category) {
            throw new NotFoundException("category not found");
        }

        SuccessResponse(res, 200, { category });
    } catch (err) {
        next(err);
    }
};

export const remove = async (req: Request<RequestParamsWithID>, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        const category = await CategoryModel.findByIdAndDelete(id);

        if (!category) {
            throw new NotFoundException("category not found");
        }

        SuccessResponse(res, 200, { category });
    } catch (err) {
        next(err);
    }
};
