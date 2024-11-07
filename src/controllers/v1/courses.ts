import { NextFunction, Request, Response } from "express";

import CourseModel from "@/models/Course";
import CommentModel from "@/models/Comment";
import TopicModel from "@/models/Topic";

import { SORTING } from "@/constants/courses";
import { STATUS as COMMENT_STATUS } from "@/constants/comments";

import { CreateCourseSchemaType, UpdateCourseSchemaType, GetAllCoursesQuerySchemaType, SearchCoursesQuerySchameType } from "@/validators/courses";
import { PaginationQuerySchemaType } from "@/validators/pagination";

import { RequestWithUser } from "@/types/request.types";

import { ConflictException, NotFoundException } from "@/utils/exceptions";
import { SuccessResponse } from "@/utils/responses";
import { decreaseCoursesUnique, getCoursesUnique } from "@/utils/metadata";
import { isDuplicateKeyError } from "@/utils/errors";
import { createPaginationData } from "@/utils/funcs";

type RequestParamsWithID = { id: string };
type RequestParamsWithSlug = { slug: string };

export const getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { page, limit, sort, search } = req.query as unknown as GetAllCoursesQuerySchemaType;

        const filters = { shown: true, ...(search && { $or: [{ title: { $regex: search } }, { description: { $regex: search } }] }) };

        const sorting = { ...(sort === SORTING.DEFAULT && { order: 1 }), ...(sort === SORTING.NEWSET && { _id: -1 }), ...(sort === SORTING.POPULAR && { "metadata.students": 1 }) } as any;

        const courses = await CourseModel.find(filters, "metadata.students metadata.rating title slug description cover price discount status")
            .sort(sorting)
            .populate("teacher", "username profile")
            .skip((page - 1) * limit)
            .limit(limit);

        const coursesCount = await CourseModel.countDocuments(filters);

        SuccessResponse(res, 200, { courses, pagination: createPaginationData(page, limit, coursesCount) });
    } catch (err) {
        next(err);
    }
};

export const create = async (req: Request<{}, {}, CreateCourseSchemaType>, res: Response, next: NextFunction) => {
    try {
        const { title, slug, cover, description, price, status, shown, introduction, metadata } = req.body;

        const shortId = await getCoursesUnique();

        const order = await CourseModel.countDocuments({});

        const course = await CourseModel.create({
            title,
            slug,
            description,
            cover,
            price,
            status,
            shown,
            order: order + 1,
            teacher: (req as RequestWithUser).user._id,
            introduction,
            metadata,
            shortId,
        });

        SuccessResponse(res, 201, { course });
    } catch (err) {
        if (isDuplicateKeyError(err as Error)) {
            await decreaseCoursesUnique();
            next(new ConflictException("course already exists with this information"));
        }
        next(err);
    }
};

export const search = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { page, limit, q } = req.query as unknown as SearchCoursesQuerySchameType;

        const filters = { $or: [{ title: { $regex: q } }, { description: { $regex: q } }], shown: true };

        const blogs = await CourseModel.find(filters, "metadata.students metadata.rating title slug description cover price discount status")
            .sort({ order: 1 })
            .populate("teacher", "username profile")
            .skip((page - 1) * limit)
            .limit(limit);

        const blogsCount = await CourseModel.countDocuments(filters);

        SuccessResponse(res, 200, { blogs, pagination: createPaginationData(page, limit, blogsCount) });
    } catch (err) {
        next(err);
    }
};

export const getOne = async (req: Request<RequestParamsWithSlug>, res: Response, next: NextFunction) => {
    try {
        const { slug } = req.params;

        const course = await CourseModel.findOne({ slug }).populate("teacher", "username profile");

        if (!course) {
            throw new NotFoundException("course not found");
        }

        const time = await course.getTime();

        const defredTime = time[0] + time[1] ? 1 : 0;

        const progress = course.getProgress(defredTime);

        SuccessResponse(res, 200, { course: { ...course.toObject(), time, progress } });
    } catch (err) {
        next(err);
    }
};

export const update = async (req: Request<RequestParamsWithID, {}, UpdateCourseSchemaType>, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { title, slug, description, cover, price, status, introduction, metadata, discount } = req.body;

        const updatedCourse = await CourseModel.findByIdAndUpdate(
            id,
            {
                $set: {
                    title,
                    slug,
                    description,
                    cover,
                    price,
                    status,
                    introduction,
                    metadata,
                    ...(discount && { discount }),
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

export const getComments = async (req: Request<RequestParamsWithSlug>, res: Response, next: NextFunction) => {
    try {
        const { slug } = req.params;
        const { page, limit } = req.query as unknown as PaginationQuerySchemaType;

        const course = await CourseModel.findOne({ slug });

        if (!course) {
            throw new NotFoundException("course not found");
        }

        const filters = { course: course._id, status: COMMENT_STATUS.ACCEPTED, pin: false };

        const comments = await CommentModel.find(filters)
            .sort({ pin: -1, createdAt: -1 })
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

export const shown = async (req: Request<RequestParamsWithID>, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        const course = await CourseModel.findByIdAndUpdate(
            id,
            {
                $set: { shown: true },
            },
            { new: true }
        );

        SuccessResponse(res, 200, { course });
    } catch (err) {
        next(err);
    }
};

export const unshown = async (req: Request<RequestParamsWithID>, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        const course = await CourseModel.findByIdAndUpdate(
            id,
            {
                $set: { shown: false },
            },
            { new: true }
        );

        SuccessResponse(res, 200, { course });
    } catch (err) {
        next(err);
    }
};

export const updateOrder = async (req: Request<RequestParamsWithID>, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { from, to } = req.body;

        const fromCourse = await CourseModel.findOne({ _id: id, order: from });

        if (!fromCourse) {
            throw new NotFoundException("from course not found");
        }

        const toCourse = await CourseModel.findOne({ order: to });

        if (!toCourse) {
            throw new NotFoundException("to topic not found");
        }

        const fromCourseOrder = fromCourse.order;

        fromCourse.order = toCourse.order;
        toCourse.order = fromCourseOrder;

        await fromCourse.save();
        await toCourse.save();

        SuccessResponse(res, 200, { message: "order changed successfully" });
    } catch (err) {
        next(err);
    }
};
