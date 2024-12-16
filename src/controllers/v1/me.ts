import { NextFunction, Request, Response } from "express";
import { hash } from "bcryptjs";

import UserModel from "@/models/User";
import CourseUserModel from "@/models/CourseUser";
import BlogLikeModel from "@/models/BlogLike";
import BlogSaveModel from "@/models/BlogSave";
import TvLikeModel from "@/models/TvLike";
import TvSaveModel from "@/models/TvSave";

import { UpdateAccountSchemaType, ChangePasswordSchemaType } from "@/validators/me";
import { PaginationQuerySchemaType } from "@/validators/pagination";

import { AuthenticatedRequest } from "@/types/request.types";

import { ConflictException, NotFoundException } from "@/utils/exceptions";
import { SuccessResponse } from "@/utils/responses";
import { createPaginationData } from "@/utils/funcs";
import { isDuplicateKeyError } from "@/utils/errors";
import { updateUserCredentialCookie } from "@/utils/auth";

export const updateAccount = async (req: Request<{}, {}, UpdateAccountSchemaType>, res: Response, next: NextFunction) => {
    try {
        const user = (req as AuthenticatedRequest).user;
        const { fullname, username, profile, age, city } = req.body;

        const updatedUser = await UserModel.findByIdAndUpdate(
            user._id,
            {
                $set: {
                    fullname,
                    username,
                    profile,
                    age,
                    city,
                },
            },
            { new: true }
        );

        if (!updatedUser) {
            throw new NotFoundException("user not found");
        }

        await updateUserCredentialCookie(res, updatedUser);

        SuccessResponse(res, 200, { message: "account updated successfully" });
    } catch (err) {
        if (isDuplicateKeyError(err as Error)) {
            next(new ConflictException("user already exists with this information", { field: Object.keys((err as any).keyPattern)[0] }));
        }
        next(err);
    }
};

export const changePassword = async (req: Request<{}, {}, ChangePasswordSchemaType>, res: Response, next: NextFunction) => {
    try {
        const user = (req as AuthenticatedRequest).user;
        const { past, new: newPassword } = req.body;

        const isMatched = await user.comparePassword(past);

        if (!isMatched) {
            throw new ConflictException("past password is not matched");
        }

        const hashedPassword = await hash(newPassword, 12);

        await UserModel.findByIdAndUpdate(user._id, {
            $set: {
                password: hashedPassword,
            },
        });

        SuccessResponse(res, 200, { message: "password updated successfully" });
    } catch (err) {
        next(err);
    }
};

export const getCourses = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const courseUsers = await CourseUserModel.find({ user: (req as AuthenticatedRequest).user._id })
            .sort({ _id: -1 })
            .populate("course", "metadata.students metadata.rating title slug description cover price discount status")
            .lean();

        const courses = [];

        for (const courseUser of courseUsers) {
            courses.push(courseUser.course);
        }

        SuccessResponse(res, 200, { courses });
    } catch (err) {
        next(err);
    }
};

export const getLastCourses = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const courseUsers = await CourseUserModel.find({ user: (req as AuthenticatedRequest).user._id })
            .sort({ _id: -1 })
            .populate("course", "metadata.students metadata.rating title slug description cover price discount status")
            .limit(4)
            .lean();

        const courses = [];

        for (const courseUser of courseUsers) {
            courses.push(courseUser.course);
        }

        SuccessResponse(res, 200, { courses });
    } catch (err) {
        next(err);
    }
};

export const getSavedBlog = async (req: Request<{}, {}, {}, PaginationQuerySchemaType>, res: Response, next: NextFunction) => {
    try {
        const { page, limit } = req.query;

        const filters = { user: (req as AuthenticatedRequest).user._id };

        const saves = await BlogSaveModel.find(filters, "blog")
            .sort({ _id: -1 })
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

        const savedBlogs = [];

        for (const save of saves) {
            savedBlogs.push(save.blog);
        }

        SuccessResponse(res, 200, { saves: savedBlogs, pagination: createPaginationData(page, limit, savesCount) });
    } catch (err) {
        next(err);
    }
};

export const getSavedTv = async (req: Request<{}, {}, {}, PaginationQuerySchemaType>, res: Response, next: NextFunction) => {
    try {
        const { page, limit } = req.query;

        const filters = { user: (req as AuthenticatedRequest).user._id };

        const saves = await TvSaveModel.find(filters, "tv")
            .sort({ _id: -1 })
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

        const savedTvs = [];

        for (const save of saves) {
            savedTvs.push(save.tv);
        }

        SuccessResponse(res, 200, { saves: savedTvs, pagination: createPaginationData(page, limit, savesCount) });
    } catch (err) {
        next(err);
    }
};

export const getLikedBlog = async (req: Request<{}, {}, {}, PaginationQuerySchemaType>, res: Response, next: NextFunction) => {
    try {
        const { page, limit } = req.query;

        const filters = { user: (req as AuthenticatedRequest).user._id };

        const likes = await BlogLikeModel.find(filters, "blog")
            .sort({ _id: -1 })
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

        const likedBlogs = [];

        for (const like of likes) {
            likedBlogs.push(like.blog);
        }

        SuccessResponse(res, 200, { likes: likedBlogs, pagination: createPaginationData(page, limit, likesCount) });
    } catch (err) {
        next(err);
    }
};

export const getLikedTv = async (req: Request<{}, {}, {}, PaginationQuerySchemaType>, res: Response, next: NextFunction) => {
    try {
        const { page, limit } = req.query;

        const filters = { user: (req as AuthenticatedRequest).user._id };

        const likes = await TvLikeModel.find(filters, "tv")
            .sort({ _id: -1 })
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

        const likedTvs = [];

        for (const like of likes) {
            likedTvs.push(like.tv);
        }

        SuccessResponse(res, 200, { likes: likedTvs, pagination: createPaginationData(page, limit, likesCount) });
    } catch (err) {
        next(err);
    }
};
