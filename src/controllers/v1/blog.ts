import { NextFunction, Request, Response } from "express";

import BlogModel from "@/models/Blog";
import CommentModel from "@/models/Comment";
import BlogLikeModel from "@/models/BlogLike";
import BlogSaveModel from "@/models/BlogSave";

import { SORTING } from "@/constants/blog";
import { STATUS as COMMENT_STATUS } from "@/constants/comments";

import { CreateBlogSchemaType, GetAllBlogsQuerySchemaType, SearchBlogsQuerySchameType } from "@/validators/blog";
import { PaginationQuerySchemaType } from "@/validators/pagination";

import { AuthenticatedRequest, RequestParamsWithID, RequestParamsWithSlug } from "@/types/request.types";

import { ConflictException, NotFoundException } from "@/utils/exceptions";
import { SuccessResponse } from "@/utils/responses";
import { isDuplicateKeyError } from "@/utils/errors";
import { createPaginationData, getUser } from "@/utils/funcs";
import { decreaseBlogsUnique, getBlogUnique } from "@/utils/metadata";

export const getAll = async (req: Request<{}, {}, {}, GetAllBlogsQuerySchemaType>, res: Response, next: NextFunction) => {
    try {
        const { page, limit, category, sort, search } = req.query;

        const filters = { shown: true, ...(search && { $or: [{ title: { $regex: search } }, { description: { $regex: search } }] }), ...(category && { category: Array.isArray(category) ? { $in: category } : category }) };

        const sorting = { ...(sort === SORTING.NEWEST && { _id: -1 }), ...(sort === SORTING.POPULAR && { views: -1 }) } as any;

        const blogs = await BlogModel.find(filters, "-content -relatedCourses -headings -shown -status")
            .sort(sorting)
            .populate("author", "username profile")
            .populate("category", "title")
            .skip((page - 1) * limit)
            .limit(limit);

        const blogsCount = await BlogModel.countDocuments(filters);

        SuccessResponse(res, 200, { blogs, pagination: createPaginationData(page, limit, blogsCount) });
    } catch (err) {
        next(err);
    }
};

export const getAllRaw = async (req: Request<{}, {}, {}, GetAllBlogsQuerySchemaType>, res: Response, next: NextFunction) => {
    try {
        const { page, limit, category, sort, search } = req.query;

        const filters = { ...(search && { $or: [{ title: { $regex: search } }, { description: { $regex: search } }] }), ...(category && { category: Array.isArray(category) ? { $in: category } : category }) };

        const sorting = { ...(sort === SORTING.NEWEST && { _id: -1 }), ...(sort === SORTING.POPULAR && { views: -1 }) } as any;

        const blogs = await BlogModel.find(filters, "-content -relatedCourses -headings -status")
            .sort(sorting)
            .populate("author", "username profile")
            .populate("category", "title")
            .skip((page - 1) * limit)
            .limit(limit);

        const blogsCount = await BlogModel.countDocuments(filters);

        SuccessResponse(res, 200, { blogs, pagination: createPaginationData(page, limit, blogsCount) });
    } catch (err) {
        next(err);
    }
};

export const create = async (req: Request<{}, {}, CreateBlogSchemaType>, res: Response, next: NextFunction) => {
    try {
        const { title, description, slug, category, cover, content, headings, relatedCourses, shown } = req.body;

        const timeToRead = Math.ceil(content.length / 2500);

        const shortId = await getBlogUnique();

        await BlogModel.create({
            title,
            description,
            slug,
            category,
            author: (req as AuthenticatedRequest).user._id,
            cover,
            content,
            headings,
            timeToRead,
            relatedCourses,
            shortId,
            shown,
        });

        SuccessResponse(res, 201, { message: "blog created successfully" });
    } catch (err) {
        if (isDuplicateKeyError(err as Error)) {
            await decreaseBlogsUnique();
            next(new ConflictException("blog already exists with this information"));
        }
        next(err);
    }
};

export const search = async (req: Request<{}, {}, {}, SearchBlogsQuerySchameType>, res: Response, next: NextFunction) => {
    try {
        const { page, limit, q } = req.query;

        const filters = { shown: true, $or: [{ title: { $regex: q } }, { description: { $regex: q } }] };

        const blogs = await BlogModel.find(filters, "-content -relatedCourses -headings -shown -status")
            .sort({ _id: -1 })
            .populate("author", "username profile")
            .populate("category", "title")
            .skip((page - 1) * limit)
            .limit(limit);

        const blogsCount = await BlogModel.countDocuments(filters);

        SuccessResponse(res, 200, { blogs, pagination: createPaginationData(page, limit, blogsCount) });
    } catch (err) {
        next(err);
    }
};

export const getOne = async (req: Request<RequestParamsWithSlug>, res: Response, next: NextFunction) => {
    try {
        const { slug } = req.params;

        const blog = await BlogModel.findOne({ slug, shown: true }).populate("author", "username profile").populate("category", "title").populate("relatedCourses", "title slug description status metadata.rating metadata.students");

        if (!blog) {
            throw new NotFoundException("blog not found");
        }

        SuccessResponse(res, 200, { blog });
    } catch (err) {
        next(err);
    }
};

export const getOneById = async (req: Request<RequestParamsWithID>, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        const blog = await BlogModel.findById(id).populate("author", "username profile").populate("category", "title");

        if (!blog) {
            throw new NotFoundException("blog not found");
        }

        SuccessResponse(res, 200, { blog });
    } catch (err) {
        next(err);
    }
};

export const update = async (req: Request<RequestParamsWithID, {}, CreateBlogSchemaType>, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { title, description, slug, category, cover, content, headings, relatedCourses, shown } = req.body;

        const timeToRead = Math.ceil(content.length / 2500);

        const blog = await BlogModel.findByIdAndUpdate(id, {
            $set: {
                title,
                description,
                slug,
                category,
                cover,
                content,
                headings,
                timeToRead,
                relatedCourses,
                shown,
            },
        });

        if (!blog) {
            throw new NotFoundException("blog not found");
        }

        SuccessResponse(res, 200, { message: "blog updated successfully" });
    } catch (err) {
        next(err);
    }
};

export const getRelated = async (req: Request<RequestParamsWithSlug>, res: Response, next: NextFunction) => {
    try {
        const { slug } = req.params;

        const blog = await BlogModel.findOne({ slug, shown: true }, "_id category tags");

        if (!blog) {
            throw new NotFoundException("blog not found");
        }

        let aggragation = await BlogModel.aggregate([
            {
                $match: { shown: true, category: blog.category, _id: { $ne: blog._id } },
            },
            {
                $sample: { size: 4 },
            },
            {
                $project: { content: 0, relatedCourses: 0, headings: 0, shown: 0, status: 0 },
            },
        ]);

        if (aggragation.length < 4) {
            const others = await BlogModel.aggregate([
                {
                    $match: { shown: true, category: { $ne: blog.category }, _id: { $ne: blog._id } },
                },
                {
                    $sample: { size: 4 },
                },
                {
                    $project: { content: 0, relatedCourses: 0, headings: 0, shown: 0, status: 0 },
                },
            ]);

            aggragation = aggragation.concat(others);
        }

        const related = await BlogModel.populate(aggragation, [
            { path: "author", select: "username profile" },
            { path: "category", select: "title" },
        ]);

        SuccessResponse(res, 200, { blogs: related });
    } catch (err) {
        next(err);
    }
};

export const getComments = async (req: Request<RequestParamsWithSlug, {}, {}, PaginationQuerySchemaType>, res: Response, next: NextFunction) => {
    try {
        const { slug } = req.params;
        const { page, limit } = req.query;

        const blog = await BlogModel.findOne({ slug }, "_id");

        if (!blog) {
            throw new NotFoundException("blog not found");
        }

        const filters = { blog: blog._id, status: COMMENT_STATUS.ACCEPTED };

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

export const getDetails = async (req: Request<RequestParamsWithID>, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const user = await getUser(req);

        if (!user) {
            SuccessResponse(res, 200, { isLiked: false, isSaved: false, disabled: true });
            return;
        }

        const isLiked = await BlogLikeModel.exists({ user: user._id, blog: id });
        const isSaved = await BlogSaveModel.exists({ user: user._id, blog: id });

        SuccessResponse(res, 200, { isLiked: Boolean(isLiked), isSaved: Boolean(isSaved), disabled: false });
    } catch (err) {
        next(err);
    }
};

export const like = async (req: Request<RequestParamsWithID>, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        await BlogLikeModel.create({ blog: id, user: (req as AuthenticatedRequest).user._id });

        await BlogModel.updateOne({ _id: id }, { $inc: { likes: 1 } });

        SuccessResponse(res, 201, { message: "blog liked successfully" });
    } catch (err) {
        if (isDuplicateKeyError(err as Error)) {
            next(new ConflictException("like already exists with this information"));
        }
        next(err);
    }
};

export const dislike = async (req: Request<RequestParamsWithID>, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        const like = await BlogLikeModel.findOneAndDelete({ blog: id, user: (req as AuthenticatedRequest).user._id });

        if (!like) {
            throw new NotFoundException("like not found!");
        }

        await BlogModel.updateOne({ _id: id }, { $inc: { likes: -1 } });

        SuccessResponse(res, 200, { message: "blog disliked successfully" });
    } catch (err) {
        next(err);
    }
};

export const save = async (req: Request<RequestParamsWithID>, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        await BlogSaveModel.create({ blog: id, user: (req as AuthenticatedRequest).user._id });

        SuccessResponse(res, 201, { message: "blog saved successfully" });
    } catch (err) {
        if (isDuplicateKeyError(err as Error)) {
            next(new ConflictException("blog saved already with this information"));
        }
        next(err);
    }
};

export const unsave = async (req: Request<RequestParamsWithID>, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        const save = await BlogSaveModel.findOneAndDelete({ blog: id, user: (req as AuthenticatedRequest).user._id });

        if (!save) {
            throw new NotFoundException("saved blog not found!");
        }

        SuccessResponse(res, 200, { message: "blog unsaved successfully" });
    } catch (err) {
        next(err);
    }
};

export const shown = async (req: Request<RequestParamsWithID>, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        await BlogModel.updateOne(
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

        await BlogModel.updateOne(
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
