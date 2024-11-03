import { NextFunction, Request, Response } from "express";
import { hash } from "bcryptjs";

import UserModel from "@/models/User";
import BlogLikeModel from "@/models/BlogLike";
import BlogSaveModel from "@/models/BlogSave";
import TvLikeModel from "@/models/TvLike";
import TvSaveModel from "@/models/TvSave";

import { UpdateAccountSchemaType, ChangePasswordSchemaType } from "@/validators/me";
import { PaginationQuerySchemaType } from "@/validators/pagination";

import { RequestWithUser } from "@/types/request.types";

import { ConflictException, NotFoundException } from "@/utils/exceptions";
import { SuccessResponse } from "@/utils/responses";
import { createPaginationData } from "@/utils/funcs";
import { isDuplicateKeyError } from "@/utils/errors";
import { updateUserCredentialCookie } from "@/utils/auth";

export const updateAccount = async (req: Request<{}, {}, UpdateAccountSchemaType>, res: Response, next: NextFunction) => {
    try {
        const user = (req as RequestWithUser).user;
        const { fullname, username, profile } = req.body;

        const updatedUser = await UserModel.findByIdAndUpdate(
            user._id,
            {
                $set: {
                    fullname,
                    username,
                    profile,
                },
            },
            { new: true }
        );

        if (!updatedUser) {
            throw new NotFoundException("user not found");
        }

        await updateUserCredentialCookie(res, updatedUser);

        SuccessResponse(res, 200, { user: updatedUser });
    } catch (err) {
        if (isDuplicateKeyError(err as Error)) {
            next(new ConflictException("user already exists with this information", { field: Object.keys((err as any).keyPattern)[0] }));
        }
        next(err);
    }
};

export const changePassword = async (req: Request<{}, {}, ChangePasswordSchemaType>, res: Response, next: NextFunction) => {
    try {
        const user = (req as RequestWithUser).user;
        const { past, new: newPassword } = req.body;

        const isMatched = await user.comparePassword(past);

        if (!isMatched) {
            throw new ConflictException("past password is not matched");
        }

        const hashedPassword = await hash(newPassword, 12);

        const updatedUser = await UserModel.findByIdAndUpdate(user._id, {
            $set: {
                password: hashedPassword,
            },
        });

        SuccessResponse(res, 200, { user: updatedUser });
    } catch (err) {
        next(err);
    }
};

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
