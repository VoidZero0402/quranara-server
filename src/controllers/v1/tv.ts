import { NextFunction, Request, Response } from "express";

import TvModel from "@/models/Tv";
import CommentModel from "@/models/Comment";
import TvLikeModel from "@/models/TvLike";
import TvSaveModel from "@/models/TvSave";

import { STATUS } from "@/constants/comments";
import { SORTING } from "@/constants/tv";

import { CreateTvSchemaType, GetAllTvsQuerySchemaType, SearchTvsQuerySchameType } from "@/validators/tv";
import { PaginationQuerySchemaType } from "@/validators/pagination";

import { AuthenticatedRequest, RequestParamsWithID, RequestParamsWithSlug } from "@/types/request.types";

import { ConflictException, NotFoundException } from "@/utils/exceptions";
import { SuccessResponse } from "@/utils/responses";
import { isDuplicateKeyError } from "@/utils/errors";
import { createPaginationData, getUser } from "@/utils/funcs";
import { increaseViews } from "@/utils/metadata";

export const getAll = async (req: Request<{}, {}, {}, GetAllTvsQuerySchemaType>, res: Response, next: NextFunction) => {
    try {
        const { page, limit, category, sort, search } = req.query;

        const filters = { shown: true, ...(search && { $or: [{ title: { $regex: search } }, { description: { $regex: search } }] }), ...(category && { category: Array.isArray(category) ? { $in: category } : category }) };

        const sorting = { ...(sort === SORTING.NEWEST && { _id: -1 }), ...(sort === SORTING.POPULAR && { views: -1 }) } as any;

        const tvs = await TvModel.find(filters)
            .sort(sorting)
            .populate("publisher", "username profile")
            .populate("category", "title")
            .skip((page - 1) * limit)
            .limit(limit);

        const tvsCount = await TvModel.countDocuments(filters);

        SuccessResponse(res, 200, { tvs, pagination: createPaginationData(page, limit, tvsCount) });
    } catch (err) {
        next(err);
    }
};

export const create = async (req: Request<{}, {}, CreateTvSchemaType>, res: Response, next: NextFunction) => {
    try {
        const { title, description, slug, category, cover, video, attached, content } = req.body;

        const tv = await TvModel.create({
            title,
            description,
            slug,
            category,
            cover,
            video,
            publisher: (req as AuthenticatedRequest).user._id,
            attached,
            content,
        });

        SuccessResponse(res, 201, { tv });
    } catch (err) {
        if (isDuplicateKeyError(err as Error)) {
            next(new ConflictException("tv already exists with this information"));
        }
        next(err);
    }
};

export const search = async (req: Request<{}, {}, {}, SearchTvsQuerySchameType>, res: Response, next: NextFunction) => {
    try {
        const { page, limit, q } = req.query;

        const filters = { shown: true, $or: [{ title: { $regex: q } }, { description: { $regex: q } }] };

        const tvs = await TvModel.find(filters)
            .sort({ _id: -1 })
            .populate("publisher", "username profile")
            .populate("category", "title")
            .skip((page - 1) * limit)
            .limit(limit);

        const tvsCount = await TvModel.countDocuments(filters);

        SuccessResponse(res, 200, { tvs, pagination: createPaginationData(page, limit, tvsCount) });
    } catch (err) {
        next(err);
    }
};

export const getOne = async (req: Request<RequestParamsWithSlug>, res: Response, next: NextFunction) => {
    try {
        const { slug } = req.params;

        const tv = await TvModel.findOne({ slug }).populate("publisher").populate("category");

        if (!tv) {
            throw new NotFoundException("tv not found");
        }

        await increaseViews("tv", tv._id.toString());

        const user = await getUser(req);

        if (user) {
            const isLiked = await TvLikeModel.exists({ user: user._id, tv: tv._id });
            const isSaved = await TvSaveModel.exists({ user: user._id, tv: tv._id });

            SuccessResponse(res, 200, { blog: { ...tv.toObject(), isLiked: Boolean(isLiked), isSaved: Boolean(isSaved) } });
        } else {
            SuccessResponse(res, 200, { tv });
        }
    } catch (err) {
        next(err);
    }
};

export const update = async (req: Request<RequestParamsWithID, {}, CreateTvSchemaType>, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { title, description, slug, category, cover, video, attached, content } = req.body;

        const tv = await TvModel.findByIdAndUpdate(
            id,
            {
                $set: {
                    title,
                    description,
                    slug,
                    category,
                    cover,
                    video,
                    attached,
                    content,
                },
            },
            { new: true }
        );

        if (!tv) {
            throw new NotFoundException("tv not found");
        }

        SuccessResponse(res, 200, { tv });
    } catch (err) {
        if (isDuplicateKeyError(err as Error)) {
            next(new ConflictException("tv already exists with this information"));
        }
        next(err);
    }
};

export const getRelated = async (req: Request<RequestParamsWithSlug>, res: Response, next: NextFunction) => {
    try {
        const { slug } = req.params;

        const tv = await TvModel.findOne({ slug, shown: true });

        if (!tv) {
            throw new NotFoundException("tv not found");
        }

        const aggregation = await TvModel.aggregate([
            {
                $match: { shown: true, category: tv.category, _id: { $ne: tv._id } },
            },
            {
                $sample: { size: 8 },
            },
        ]);

        const related = await TvModel.populate(aggregation, [
            { path: "publisher", select: "username profile" },
            { path: "category", select: "title" },
        ]);

        SuccessResponse(res, 200, { tvs: related });
    } catch (err) {
        next(err);
    }
};

export const getComments = async (req: Request<RequestParamsWithSlug, {}, {}, PaginationQuerySchemaType>, res: Response, next: NextFunction) => {
    try {
        const { slug } = req.params;
        const { page, limit } = req.query;

        const tv = await TvModel.findOne({ slug, shown: true });

        if (!tv) {
            throw new NotFoundException("tv not found");
        }

        const filters = { tv: tv._id, status: STATUS.ACCEPTED };

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

        const like = await TvLikeModel.create({ tv: id, user: (req as AuthenticatedRequest).user._id });

        await TvModel.updateOne({ _id: id }, { $inc: { likes: 1 } });

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

        const like = await TvLikeModel.findOneAndDelete({ tv: id, user: (req as AuthenticatedRequest).user._id });

        if (!like) {
            throw new NotFoundException("like not found!");
        }

        await TvModel.updateOne({ _id: id }, { $inc: { likes: -1 } });

        SuccessResponse(res, 200, { like });
    } catch (err) {
        next(err);
    }
};

export const save = async (req: Request<RequestParamsWithID>, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        const save = await TvSaveModel.create({ tv: id, user: (req as AuthenticatedRequest).user._id });

        SuccessResponse(res, 201, { save });
    } catch (err) {
        if (isDuplicateKeyError(err as Error)) {
            next(new ConflictException("tv saved already with this information"));
        }
        next(err);
    }
};

export const unsave = async (req: Request<RequestParamsWithID>, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        const save = await TvSaveModel.findOneAndDelete({ tv: id, user: (req as AuthenticatedRequest).user._id });

        if (!save) {
            throw new NotFoundException("saved tv not found!");
        }

        SuccessResponse(res, 200, { save });
    } catch (err) {
        next(err);
    }
};

export const shown = async (req: Request<RequestParamsWithID>, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        const tv = await TvModel.findByIdAndUpdate(
            id,
            {
                $set: { shown: true },
            },
            { new: true }
        );

        SuccessResponse(res, 200, { tv });
    } catch (err) {
        next(err);
    }
};

export const unshown = async (req: Request<RequestParamsWithID>, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        const tv = await TvModel.findByIdAndUpdate(
            id,
            {
                $set: { shown: false },
            },
            { new: true }
        );

        SuccessResponse(res, 200, { tv });
    } catch (err) {
        next(err);
    }
};
