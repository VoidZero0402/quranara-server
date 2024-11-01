import { NextFunction, Request, Response } from "express";

import DiscountModel from "@/models/Discount";

import { CreateDiscountSchemaType, AvailableDiscountQuerySchemaType } from "@/validators/discounts";
import { PaginationQuerySchemaType } from "@/validators/pagination";

import { RequestWithUser } from "@/types/request.types";

import { NotFoundException, ConflictException, ForbiddenException } from "@/utils/exceptions";
import { SuccessResponse } from "@/utils/responses";
import { isDuplicateKeyError } from "@/utils/errors";
import { createPaginationData } from "@/utils/funcs";

type RequestParamsWithID = { id: string };

export const getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { page, limit } = req.query as unknown as PaginationQuerySchemaType;

        const discounts = await DiscountModel.find()
            .populate("creator", "username profile")
            .skip((page - 1) * limit)
            .limit(limit);

        const discountsCount = await DiscountModel.countDocuments();

        SuccessResponse(res, 200, { discounts, pagination: createPaginationData(page, limit, discountsCount) });
    } catch (err) {
        next(err);
    }
};

export const create = async (req: Request<{}, {}, CreateDiscountSchemaType>, res: Response, next: NextFunction) => {
    try {
        const { code, percent, course, max, expireAtTime } = req.body;

        const expireAt = new Date(expireAtTime);

        const discount = await DiscountModel.create({
            code,
            percent,
            course,
            creator: (req as RequestWithUser).user._id,
            max,
            expireAt,
        });

        SuccessResponse(res, 201, { discount });
    } catch (err) {
        if (isDuplicateKeyError(err as Error)) {
            next(new ConflictException("discount already exists with this information"));
        }
        next(err);
    }
};

export const update = async (req: Request<RequestParamsWithID, {}, CreateDiscountSchemaType>, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { code, percent, course, max, expireAtTime } = req.body;

        const expireAt = new Date(expireAtTime);

        const discount = await DiscountModel.findByIdAndUpdate(
            id,
            {
                $set: {
                    code,
                    percent,
                    course,
                    max,
                    expireAt,
                },
            },
            { new: true }
        );

        if (!discount) {
            throw new NotFoundException("discount not found");
        }

        SuccessResponse(res, 200, { discount });
    } catch (err) {
        if (isDuplicateKeyError(err as Error)) {
            next(new ConflictException("discount already exists with this information"));
        }
        next(err);
    }
};

export const remove = async (req: Request<RequestParamsWithID>, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        const discount = await DiscountModel.findByIdAndDelete(id);

        if (!discount) {
            throw new NotFoundException("discount not found");
        }

        SuccessResponse(res, 200, { discount });
    } catch (err) {
        next(err);
    }
};

export const available = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { code, course } = req.query as unknown as AvailableDiscountQuerySchemaType;

        const discount = await DiscountModel.findOne({ code, ...(course && { course }) });

        if (!discount) {
            throw new NotFoundException("discount not found");
        }

        if (discount.uses === discount.max) {
            throw new ForbiddenException("discount max uses is executed", { available: false, discount });
        }

        SuccessResponse(res, 200, { available: true, discount });
    } catch (err) {
        next(err);
    }
};
