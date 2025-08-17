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

export const getAll = async (req: Request<{}, {}, {}, GetAllTvsQuerySchemaType>, res: Response, next: NextFunction) => {
    try {
        const { page, limit, category, sort, search } = req.query;

        const filters = { shown: true, ...(search && { $or: [{ title: { $regex: search } }, { description: { $regex: search } }] }), ...(category && { category: Array.isArray(category) ? { $in: category } : category }) };

        const sorting = { ...(sort === SORTING.DEFAULT && { _id: -1 }), ...(sort === SORTING.NEWEST && { _id: -1 }), ...(sort === SORTING.POPULAR && { views: -1 }) } as any;

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

export const getAllRaw = async (req: Request<{}, {}, {}, GetAllTvsQuerySchemaType>, res: Response, next: NextFunction) => {
    try {
        const { page, limit, category, sort, search } = req.query;

        const filters = { ...(search && { $or: [{ title: { $regex: search } }, { description: { $regex: search } }] }), ...(category && { category: Array.isArray(category) ? { $in: category } : category }) };

        const sorting = { ...(sort === SORTING.DEFAULT && { _id: -1 }), ...(sort === SORTING.NEWEST && { _id: -1 }), ...(sort === SORTING.POPULAR && { views: -1 }) } as any;

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
        const { title, description, slug, category, cover, video, attached, content, shown } = req.body;

        await TvModel.create({
            title,
            description,
            slug,
            category,
            cover,
            video,
            publisher: (req as AuthenticatedRequest).user._id,
            attached,
            content,
            shown,
        });

        SuccessResponse(res, 201, { message: "tv created successfully" });
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

        const tv = await TvModel.findOne({ slug, shown: true }).populate("publisher", "username profile").populate("category");

        if (!tv) {
            throw new NotFoundException("tv not found");
        }

        SuccessResponse(res, 200, { tv });
    } catch (err) {
        next(err);
    }
};

export const getOneById = async (req: Request<RequestParamsWithID>, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        const tv = await TvModel.findById(id).populate("publisher", "username profile").populate("category");

        if (!tv) {
            throw new NotFoundException("tv not found");
        }

        SuccessResponse(res, 200, { tv });
    } catch (err) {
        next(err);
    }
};

export const update = async (req: Request<RequestParamsWithID, {}, CreateTvSchemaType>, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { title, description, slug, category, cover, video, attached, content, shown } = req.body;

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
                    shown,
                },
            },
            { new: true }
        );

        if (!tv) {
            throw new NotFoundException("tv not found");
        }

        SuccessResponse(res, 200, { message: "tv updated successfully" });
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

        let aggregation = await TvModel.aggregate([
            {
                $match: { shown: true, category: tv.category, _id: { $ne: tv._id } },
            },
            {
                $sample: { size: 4 },
            },
        ]);

        if (aggregation.length < 4) {
            const others = await TvModel.aggregate([
                {
                    $match: { shown: true, category: { $ne: tv.category }, _id: { $ne: tv._id } },
                },
                {
                    $sample: { size: 4 - aggregation.length },
                },
            ]);

            aggregation = aggregation.concat(others);
        }

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

        const isLiked = await TvLikeModel.exists({ user: user._id, tv: id });
        const isSaved = await TvSaveModel.exists({ user: user._id, tv: id });

        SuccessResponse(res, 200, { isLiked: Boolean(isLiked), isSaved: Boolean(isSaved), disabled: false });
    } catch (err) {
        next(err);
    }
};

export const like = async (req: Request<RequestParamsWithID>, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        await TvLikeModel.create({ tv: id, user: (req as AuthenticatedRequest).user._id });

        await TvModel.updateOne({ _id: id }, { $inc: { likes: 1 } });

        SuccessResponse(res, 201, { message: "tv liked successfully" });
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

        SuccessResponse(res, 200, { message: "tv disliked successfully" });
    } catch (err) {
        next(err);
    }
};

export const save = async (req: Request<RequestParamsWithID>, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        await TvSaveModel.create({ tv: id, user: (req as AuthenticatedRequest).user._id });

        SuccessResponse(res, 201, { message: "tv saved successfully" });
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

        SuccessResponse(res, 200, { message: "tv unsaved successfully" });
    } catch (err) {
        next(err);
    }
};

export const shown = async (req: Request<RequestParamsWithID>, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        await TvModel.updateOne(
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

        await TvModel.updateOne(
            { _id: id },
            {
                $set: { shown: false },
            }
        );

        SuccessResponse(res, 200, { message: "unshown set successfully" });
    } catch (err) {
        next(err);
    }
};
