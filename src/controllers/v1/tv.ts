import { NextFunction, Request, Response } from "express";

import TvModel from "@/models/Tv";

import { CreateTvSchemaType, GetAllTvsQuerySchemaType, SearchTvsQuerySchameType } from "@/validators/tv";

import { RequestWithUser } from "@/types/request.types";

import { ConflictException, NotFoundException } from "@/utils/exceptions";
import { SuccessResponse } from "@/utils/responses";
import { isDuplicateKeyError } from "@/utils/errors";

type RequestParamsWithID = { id: string };

export const getAll = async (req: Request, res: Response, next: NextFunction) => {};

export const create = async (req: Request<{}, {}, CreateTvSchemaType>, res: Response, next: NextFunction) => {
    try {
        const { title, description, category, cover, video, attached, content } = req.body;

        const tv = await TvModel.create({
            title,
            description,
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

export const search = async (req: Request, res: Response, next: NextFunction) => {};
export const getOne = async (req: Request, res: Response, next: NextFunction) => {};

export const update = async (req: Request<RequestParamsWithID, {}, CreateTvSchemaType>, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { title, description, category, cover, video, attached, content } = req.body;

        const tv = await TvModel.findByIdAndUpdate(
            id,
            {
                $set: {
                    title,
                    description,
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

export const getRelated = async (req: Request, res: Response, next: NextFunction) => {};
