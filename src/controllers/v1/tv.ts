import { NextFunction, Request, Response } from "express";

import TvModel from "@/models/Tv";
import CommentModel from "@/models/Comment";
import TvLikeModel from "@/models/TvLike";
import TvSaveModel from "@/models/TvSave";

import { STATUS } from "@/constants/comments";

import { CreateTvSchemaType, GetAllTvsQuerySchemaType, SearchTvsQuerySchameType } from "@/validators/tv";
import { PaginationQuerySchemaType } from "@/validators/pagination";

import { RequestWithUser } from "@/types/request.types";

import { ConflictException, NotFoundException } from "@/utils/exceptions";
import { SuccessResponse } from "@/utils/responses";
import { isDuplicateKeyError } from "@/utils/errors";
import { createPaginationData } from "@/utils/funcs";
import { increaseViews } from "@/utils/metadata";

type RequestParamsWithID = { id: string };
type RequestParamsWithSlug = { slug: string };

export const getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { page, limit, category } = req.query as unknown as GetAllTvsQuerySchemaType;

        const filters = { ...(category && { category }) };

        const tvs = await TvModel.find(filters)
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
            publisher: (req as RequestWithUser).user._id,
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

export const search = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { page, limit, q } = req.query as unknown as SearchTvsQuerySchameType;

        const filters = { $or: [{ title: { $regex: q } }, { description: { $regex: q } }] };

        const tvs = await TvModel.find(filters)
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

        SuccessResponse(res, 200, { tv });
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

export const remove = async (req: Request<RequestParamsWithID>, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        const tv = await TvModel.findByIdAndDelete(id);

        // TODO: handle delete tv side effects

        if (!tv) {
            throw new NotFoundException("tv not found");
        }

        SuccessResponse(res, 200, { tv });
    } catch (err) {
        next(err);
    }
};

export const getRelated = async (req: Request<RequestParamsWithSlug>, res: Response, next: NextFunction) => {
    try {
        const { slug } = req.params;

        const tv = await TvModel.findOne({ slug });

        if (!tv) {
            throw new NotFoundException("tv not found");
        }

        const aggregation = await TvModel.aggregate([
            {
                $match: { category: tv.category, _id: { $ne: tv._id } },
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

export const getComments = async (req: Request<RequestParamsWithSlug>, res: Response, next: NextFunction) => {
    try {
        const { slug } = req.params;
        const { page, limit } = req.query as unknown as PaginationQuerySchemaType;

        const tv = await TvModel.findOne({ slug });

        if (!tv) {
            throw new NotFoundException("tv not found");
        }

        const filters = { tv: tv._id, status: STATUS.ACCEPTED };

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

export const like = async (req: Request<RequestParamsWithID>, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        const like = await TvLikeModel.create({ tv: id, user: (req as RequestWithUser<RequestParamsWithID>).user._id });

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

        const like = await TvLikeModel.findOneAndDelete({ tv: id, user: (req as RequestWithUser<RequestParamsWithID>).user._id });

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

        const save = await TvSaveModel.create({ tv: id, user: (req as RequestWithUser<RequestParamsWithID>).user._id });

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

        const save = await TvSaveModel.findOneAndDelete({ tv: id, user: (req as RequestWithUser<RequestParamsWithID>).user._id });

        if (!save) {
            throw new NotFoundException("saved tv not found!");
        }

        SuccessResponse(res, 200, { save });
    } catch (err) {
        next(err);
    }
};
