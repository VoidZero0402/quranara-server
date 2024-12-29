import { NextFunction, Request, Response } from "express";

import CourseModel from "@/models/Course";
import CommentModel from "@/models/Comment";
import TopicModel from "@/models/Topic";
import CourseUserModel from "@/models/CourseUser";

import { SORTING } from "@/constants/courses";
import { STATUS as COMMENT_STATUS } from "@/constants/comments";
import { ROLES } from "@/constants/roles";

import { CreateCourseSchemaType, UpdateCourseSchemaType, GetAllCoursesQuerySchemaType, SearchCoursesQuerySchameType, DiscountAllSchemaType } from "@/validators/courses";
import { PaginationQuerySchemaType } from "@/validators/pagination";

import { AuthenticatedRequest, RequestParamsWithID, RequestParamsWithSlug } from "@/types/request.types";

import { ConflictException, NotFoundException } from "@/utils/exceptions";
import { SuccessResponse } from "@/utils/responses";
import { decreaseCoursesUnique, getCoursesUnique } from "@/utils/metadata";
import { isDuplicateKeyError } from "@/utils/errors";
import { createPaginationData, getUser } from "@/utils/funcs";

export const getAll = async (req: Request<{}, {}, {}, GetAllCoursesQuerySchemaType>, res: Response, next: NextFunction) => {
    try {
        const { page, limit, sort, search } = req.query;

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

export const getAllRaw = async (req: Request<{}, {}, {}, GetAllCoursesQuerySchemaType>, res: Response, next: NextFunction) => {
    try {
        const { page, limit, sort, search } = req.query;

        const filters = { ...(search && { $or: [{ title: { $regex: search } }, { description: { $regex: search } }] }) };

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

export const getAllSummary = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const courses = await CourseModel.find({}, "title").lean();

        SuccessResponse(res, 200, { courses });
    } catch (err) {
        next(err);
    }
};

export const create = async (req: Request<{}, {}, CreateCourseSchemaType>, res: Response, next: NextFunction) => {
    try {
        const { title, slug, cover, description, price, status, shown, introduction, metadata } = req.body;

        const shortId = await getCoursesUnique();

        const order = await CourseModel.countDocuments({});

        await CourseModel.create({
            title,
            slug,
            description,
            cover,
            price,
            status,
            shown,
            order: order + 1,
            teacher: (req as AuthenticatedRequest).user._id,
            introduction,
            metadata,
            shortId,
        });

        SuccessResponse(res, 201, { message: "course created successfully" });
    } catch (err) {
        if (isDuplicateKeyError(err as Error)) {
            await decreaseCoursesUnique();
            next(new ConflictException("course already exists with this information"));
        }
        next(err);
    }
};

export const search = async (req: Request<{}, {}, {}, SearchCoursesQuerySchameType>, res: Response, next: NextFunction) => {
    try {
        const { page, limit, q } = req.query;

        const filters = { shown: true, $or: [{ title: { $regex: q } }, { description: { $regex: q } }] };

        const courses = await CourseModel.find(filters, "metadata.students metadata.rating title slug description cover price discount status")
            .sort({ order: 1 })
            .populate("teacher", "username profile")
            .skip((page - 1) * limit)
            .limit(limit);

        const coursesCount = await CourseModel.countDocuments(filters);

        SuccessResponse(res, 200, { courses, pagination: createPaginationData(page, limit, coursesCount) });
    } catch (err) {
        next(err);
    }
};

export const getOne = async (req: Request<RequestParamsWithSlug>, res: Response, next: NextFunction) => {
    try {
        const { slug } = req.params;

        const course = await CourseModel.findOne({ slug, shown: true }).populate("teacher", "username profile");

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

export const getOneById = async (req: Request<RequestParamsWithID>, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        const course = await CourseModel.findById(id).populate("teacher", "username profile");

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

        SuccessResponse(res, 200, { message: "course updated successfully" });
    } catch (err) {
        if (isDuplicateKeyError(err as Error)) {
            next(new ConflictException("course already exists with this information"));
        }
        next(err);
    }
};

export const getComments = async (req: Request<RequestParamsWithSlug, {}, {}, PaginationQuerySchemaType>, res: Response, next: NextFunction) => {
    try {
        const { slug } = req.params;
        const { page, limit } = req.query;

        const course = await CourseModel.findOne({ slug }, "_id");

        if (!course) {
            throw new NotFoundException("course not found");
        }

        const filters = { course: course._id, status: COMMENT_STATUS.ACCEPTED };

        const comments = await CommentModel.find(filters)
            .sort({ pin: -1, _id: -1 })
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

export const getTopics = async (req: Request<RequestParamsWithSlug>, res: Response, next: NextFunction) => {
    try {
        const { slug } = req.params;

        const course = await CourseModel.findOne({ slug }, "_id");

        if (!course) {
            throw new NotFoundException("course not found");
        }

        const topics = await TopicModel.find({ course: course._id })
            .populate({ path: "sessions", select: "title slug order time isPublic", options: { sort: { order: 1 } } })
            .sort({ order: 1 })
            .lean();

        SuccessResponse(res, 200, { topics });
    } catch (err) {
        next(err);
    }
};

export const checkAccess = async (req: Request<RequestParamsWithID>, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const user = await getUser(req);

        if (!user) {
            SuccessResponse(res, 200, { hasAccess: false });
            return;
        }

        if (user.role === ROLES.MANAGER) {
            SuccessResponse(res, 200, { hasAccess: true });
            return;
        }

        const existCourseUser = await CourseUserModel.exists({ course: id, user: user._id });

        SuccessResponse(res, 200, { hasAccess: Boolean(existCourseUser) });
    } catch (err) {
        next(err);
    }
};

export const shown = async (req: Request<RequestParamsWithID>, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        await CourseModel.updateOne(
            { _id: id },
            {
                $set: { shown: true },
            }
        );

        SuccessResponse(res, 200, { message: "shown set successfully" });
    } catch (err) {
        next(err);
    }
};

export const unshown = async (req: Request<RequestParamsWithID>, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        await CourseModel.updateOne(
            { _id: id },
            {
                $set: { shown: false },
            }
        );

        SuccessResponse(res, 200, { message: "shown unset successfully" });
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

export const applyDiscountAll = async (req: Request<{}, {}, DiscountAllSchemaType>, res: Response, next: NextFunction) => {
    try {
        const { discount } = req.body;

        await CourseModel.updateMany({ shown: true }, { $set: { discount } });

        SuccessResponse(res, 200, { message: "discount apply successfully" });
    } catch (err) {
        next(err);
    }
};

export const removeDiscountAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await CourseModel.updateMany({}, { $set: { discount: 0 } });

        SuccessResponse(res, 200, { message: "discount remove successfully" });
    } catch (err) {
        next(err);
    }
};
