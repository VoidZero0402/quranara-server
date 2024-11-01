import { NextFunction, Request, Response } from "express";

import CourseModel from "@/models/Course";
import CommentModel from "@/models/Comment";
import TopicModel from "@/models/Topic";

import { STATUS } from "@/constants/comments";

import { CreateCourseSchemaType, UpdateCourseSchemaType } from "@/validators/courses";
import { PaginationQuerySchemaType } from "@/validators/pagination";

import { RequestWithUser } from "@/types/request.types";

import { ConflictException, NotFoundException } from "@/utils/exceptions";
import { SuccessResponse } from "@/utils/responses";
import { decreaseCoursesUnique, getCoursesUnique } from "@/utils/metadata";
import { isDuplicateKeyError } from "@/utils/errors";
import { createPaginationData, removeFile } from "@/utils/funcs";

type RequestParamsWithID = { id: string };
type RequestParamsWithSlug = { slug: string };

export const getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { page, limit } = req.query as unknown as PaginationQuerySchemaType;

        // TODO: handle course getters
    } catch (err) {
        next(err);
    }
};

export const create = async (req: Request<{}, {}, CreateCourseSchemaType>, res: Response, next: NextFunction) => {
    try {
        const { title, slug, description, price, status, video, content } = req.body;

        const shortId = await getCoursesUnique();

        const course = await CourseModel.create({
            title,
            slug,
            description,
            cover: (req.file as Express.Multer.File).filename,
            price,
            status,
            teacher: (req as RequestWithUser).user._id,
            introduction: { video, content },
            shortId,
        });

        SuccessResponse(res, 201, { course });
    } catch (err) {
        if (isDuplicateKeyError(err as Error)) {
            await decreaseCoursesUnique();
            await removeFile((req.file as Express.Multer.File).path);
            next(new ConflictException("course already exists with this information"));
        }
        next(err);
    }
};

export const getOne = async (req: Request<RequestParamsWithSlug>, res: Response, next: NextFunction) => {
    try {
        const { slug } = req.params;

        const course = await CourseModel.findOne({ slug }).populate("teacher");

        if (!course) {
            throw new NotFoundException("course not found");
        }

        SuccessResponse(res, 200, { course });
    } catch (err) {
        next(err);
    }
};

export const update = async (req: Request<RequestParamsWithID, {}, UpdateCourseSchemaType>, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { title, slug, description, price, status, video, content } = req.body;

        const updatedCourse = await CourseModel.findByIdAndUpdate(
            id,
            {
                $set: {
                    title,
                    slug,
                    description,
                    ...(req.file?.filename && { cover: req.file.filename }),
                    price,
                    status,
                    introduction: { video, content },
                },
            },
            { new: true }
        );

        if (!updatedCourse) {
            throw new NotFoundException("course not found");
        }

        SuccessResponse(res, 200, { course: updatedCourse });
    } catch (err) {
        if (isDuplicateKeyError(err as Error)) {
            next(new ConflictException("course already exists with this information"));
        }
        next(err);
    }
};

export const remove = async (req: Request<RequestParamsWithID>, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        const course = await CourseModel.findByIdAndDelete(id);

        // TODO: handle delete course side effects

        if (!course) {
            throw new NotFoundException("course not found");
        }

        SuccessResponse(res, 200, { course });
    } catch (err) {
        next(err);
    }
};

export const getComments = async (req: Request<RequestParamsWithSlug>, res: Response, next: NextFunction) => {
    try {
        const { slug } = req.params;
        const { page, limit } = req.query as unknown as PaginationQuerySchemaType;

        const course = await CourseModel.findOne({ slug });

        if (!course) {
            throw new NotFoundException("course not found");
        }

        const filters = { course: course._id, status: STATUS.ACCEPTED };

        const comments = await CommentModel.find(filters)
            .populate("user", "username profile")
            .populate({ path: "replies", populate: { path: "user", select: "username profile" } })
            .skip((page - 1) * limit)
            .limit(limit)
            .lean();

        const commentsCount = await CommentModel.countDocuments(filters);

        SuccessResponse(res, 200, { comments, pagination: createPaginationData(page, limit, commentsCount) });
    } catch (err) {
        next(err);
    }
};

export const getTopics = async (req: Request<RequestParamsWithID>, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        const topics = await TopicModel.find({ course: id })
            .populate({ path: "sessions", select: "title slug order time isPublic", options: { sort: { order: 1 } } })
            .sort({ order: 1 })
            .lean();

        SuccessResponse(res, 200, { topics });
    } catch (err) {
        next(err);
    }
};
