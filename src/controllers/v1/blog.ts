import { NextFunction, Request, Response } from "express";

import BlogModel from "@/models/Blog";
import CommentModel from "@/models/Comment";
import BlogLikeModel from "@/models/BlogLike";
import BlogSaveModel from "@/models/BlogSave";

import { STATUS, SORTING } from "@/constants/blog";
import { STATUS as COMMENT_STATUS } from "@/constants/comments";

import { CreateBlogSchemaType, CreateBlogQuerySchemaType, GetAllBlogsQuerySchemaType, SearchBlogsQuerySchameType } from "@/validators/blog";
import { PaginationQuerySchemaType } from "@/validators/pagination";

import { RequestWithUser } from "@/types/request.types";

import { ConflictException, NotFoundException } from "@/utils/exceptions";
import { SuccessResponse } from "@/utils/responses";
import { isDuplicateKeyError } from "@/utils/errors";
import { createPaginationData, getUser } from "@/utils/funcs";
import { decreaseBlogsUnique, getBlogUnique, increaseViews } from "@/utils/metadata";

type RequestParamsWithID = { id: string };
type RequestParamsWithSlug = { slug: string };

export const getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { page, limit, category, sort, search } = req.query as unknown as GetAllBlogsQuerySchemaType;

        const filters = { status: STATUS.PUBLISHED, ...(search && { $or: [{ title: { $regex: search } }, { description: { $regex: search } }] }), ...(category && { category: Array.isArray(category) ? { $in: category } : category }) };

        const sorting = { ...(sort === SORTING.NEWEST && { _id: -1 }), ...(sort === SORTING.POPULAR && { views: -1 }) } as any;

        const blogs = await BlogModel.find(filters)
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
        const { status } = req.query as unknown as CreateBlogQuerySchemaType;
        const { title, description, slug, category, cover, content, tags, relatedCourses } = req.body;

        const timeToRead = Math.ceil(content.length / 1500);
        const shortId = await getBlogUnique();

        const blog = await BlogModel.create({
            title,
            description,
            slug,
            category,
            author: (req as RequestWithUser).user._id,
            cover,
            content,
            status,
            tags,
            timeToRead,
            relatedCourses,
            shortId,
        });

        SuccessResponse(res, 201, { blog });
    } catch (err) {
        if (isDuplicateKeyError(err as Error)) {
            await decreaseBlogsUnique();
            next(new ConflictException("blog already exists with this information"));
        }
        next(err);
    }
};

export const search = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { page, limit, q } = req.query as unknown as SearchBlogsQuerySchameType;

        const filters = { $or: [{ title: { $regex: q } }, { description: { $regex: q } }], status: STATUS.PUBLISHED };

        const blogs = await BlogModel.find(filters)
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

        const blog = await BlogModel.findOne({ slug, status: STATUS.PUBLISHED }).populate("author", "username profile").populate("category", "title");

        if (!blog) {
            throw new NotFoundException("blog not found");
        }

        await increaseViews("blog", blog._id.toString());

        const user = await getUser(req);

        if (user) {
            const isLiked = await BlogLikeModel.exists({ user: user._id, blog: blog._id });
            const isSaved = await BlogSaveModel.exists({ user: user._id, blog: blog._id });

            SuccessResponse(res, 200, { blog: { ...blog.toObject(), isLiked: Boolean(isLiked), isSaved: Boolean(isSaved) } });
        } else {
            SuccessResponse(res, 200, { blog });
        }
    } catch (err) {
        next(err);
    }
};

export const update = async (req: Request<RequestParamsWithID, {}, CreateBlogSchemaType>, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { title, description, slug, category, cover, content, tags, relatedCourses } = req.body;

        const timeToRead = Math.ceil(content.length / 1500);

        const blog = await BlogModel.findByIdAndUpdate(
            id,
            {
                $set: {
                    title,
                    description,
                    slug,
                    category,
                    cover,
                    content,
                    tags,
                    timeToRead,
                    relatedCourses,
                },
            },
            { new: true }
        );

        if (!blog) {
            throw new NotFoundException("blog not found");
        }

        SuccessResponse(res, 200, { blog });
    } catch (err) {
        next(err);
    }
};

export const remove = async (req: Request<RequestParamsWithID>, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        const blog = await BlogModel.findByIdAndDelete(id);

        // TODO: handle delete blog side effects

        if (!blog) {
            throw new NotFoundException("blog not found");
        }

        SuccessResponse(res, 200, { blog });
    } catch (err) {
        next(err);
    }
};

export const getRelated = async (req: Request<RequestParamsWithSlug>, res: Response, next: NextFunction) => {
    try {
        const { slug } = req.params;

        const blog = await BlogModel.findOne({ slug, status: STATUS.PUBLISHED });

        if (!blog) {
            throw new NotFoundException("blog not found");
        }

        const aggragation = await BlogModel.aggregate([
            {
                $match: { $or: [{ category: blog.category }, { tags: { $in: blog.tags } }], status: STATUS.PUBLISHED, _id: { $ne: blog._id } },
            },
            {
                $sample: { size: 8 },
            },
        ]);

        const related = await BlogModel.populate(aggragation, [
            { path: "author", select: "username profile" },
            { path: "category", select: "title" },
        ]);

        SuccessResponse(res, 200, { blogs: related });
    } catch (err) {
        next(err);
    }
};

export const getComments = async (req: Request<RequestParamsWithSlug>, res: Response, next: NextFunction) => {
    try {
        const { slug } = req.params;
        const { page, limit } = req.query as unknown as PaginationQuerySchemaType;

        const blog = await BlogModel.findOne({ slug });

        if (!blog) {
            throw new NotFoundException("blog not found");
        }

        const filters = { blog: blog._id, status: COMMENT_STATUS.ACCEPTED };

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

export const like = async (req: Request<RequestParamsWithID>, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        const like = await BlogLikeModel.create({ blog: id, user: (req as RequestWithUser<RequestParamsWithID>).user._id });

        await BlogModel.updateOne({ _id: id }, { $inc: { likes: 1 } });

        SuccessResponse(res, 201, { like });
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

        const like = await BlogLikeModel.findOneAndDelete({ blog: id, user: (req as RequestWithUser<RequestParamsWithID>).user._id });

        if (!like) {
            throw new NotFoundException("like not found!");
        }

        await BlogModel.updateOne({ _id: id }, { $inc: { likes: -1 } });

        SuccessResponse(res, 200, { like });
    } catch (err) {
        next(err);
    }
};

export const save = async (req: Request<RequestParamsWithID>, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        const save = await BlogSaveModel.create({ blog: id, user: (req as RequestWithUser<RequestParamsWithID>).user._id });

        SuccessResponse(res, 201, { save });
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

        const save = await BlogSaveModel.findOneAndDelete({ blog: id, user: (req as RequestWithUser<RequestParamsWithID>).user._id });

        if (!save) {
            throw new NotFoundException("saved blog not found!");
        }

        SuccessResponse(res, 200, { save });
    } catch (err) {
        next(err);
    }
};
