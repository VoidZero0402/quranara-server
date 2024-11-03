import { NextFunction, Request, Response } from "express";

import BlogLikeModel from "@/models/BlogLike";
import BlogSaveModel from "@/models/BlogSave";
import TvLikeModel from "@/models/TvLike";
import TvSaveModel from "@/models/TvSave";

import { PaginationQuerySchemaType } from "@/validators/pagination";

import { RequestWithUser } from "@/types/request.types";

import { ConflictException, NotFoundException } from "@/utils/exceptions";
import { SuccessResponse } from "@/utils/responses";
import { createPaginationData } from "@/utils/funcs";

export const getSavedBlog = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { page, limit } = req.query as unknown as PaginationQuerySchemaType;

        const filters = { user: (req as RequestWithUser).user._id };

        const saves = await BlogSaveModel.find(filters, "blog")
            .populate({
                path: "blog",
                select: "-content -relatedCourses -status",
                populate: [
                    { path: "author", select: "username profile" },
                    { path: "category", select: "title" },
                ],
            })
            .skip((page - 1) * limit)
            .limit(limit)
            .lean();

        const savesCount = await BlogSaveModel.countDocuments(filters);

        SuccessResponse(res, 200, { saves, pagination: createPaginationData(page, limit, savesCount) });
    } catch (err) {
        next(err);
    }
};

export const getSavedTv = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { page, limit } = req.query as unknown as PaginationQuerySchemaType;

        const filters = { user: (req as RequestWithUser).user._id };

        const saves = await TvSaveModel.find(filters, "tv")
            .populate({
                path: "tv",
                select: "-content -relatedCourses -status",
                populate: [
                    { path: "publisher", select: "username profile" },
                    { path: "category", select: "title" },
                ],
            })
            .skip((page - 1) * limit)
            .limit(limit)
            .lean();

        const savesCount = await TvSaveModel.countDocuments(filters);

        SuccessResponse(res, 200, { saves, pagination: createPaginationData(page, limit, savesCount) });
    } catch (err) {
        next(err);
    }
};

export const getLikedBlog = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { page, limit } = req.query as unknown as PaginationQuerySchemaType;

        const filters = { user: (req as RequestWithUser).user._id };

        const likes = await BlogLikeModel.find(filters, "blog")
            .populate({
                path: "blog",
                select: "-content -relatedCourses -status",
                populate: [
                    { path: "author", select: "username profile" },
                    { path: "category", select: "title" },
                ],
            })
            .skip((page - 1) * limit)
            .limit(limit)
            .lean();

        const likesCount = await BlogLikeModel.countDocuments(filters);

        SuccessResponse(res, 200, { likes, pagination: createPaginationData(page, limit, likesCount) });
    } catch (err) {
        next(err);
    }
};

export const getLikedTv = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { page, limit } = req.query as unknown as PaginationQuerySchemaType;

        const filters = { user: (req as RequestWithUser).user._id };

        const likes = await TvLikeModel.find(filters, "tv")
            .populate({
                path: "tv",
                select: "-content -attached -video",
                populate: [
                    { path: "publisher", select: "username profile" },
                    { path: "category", select: "title" },
                ],
            })
            .skip((page - 1) * limit)
            .limit(limit)
            .lean();

        const likesCount = await TvLikeModel.countDocuments(filters);

        SuccessResponse(res, 200, { likes, pagination: createPaginationData(page, limit, likesCount) });
    } catch (err) {
        next(err);
    }
};
