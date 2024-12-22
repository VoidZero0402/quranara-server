import { NextFunction, Request, Response } from "express";

import DiscountModel from "@/models/Discount";

import { CreateDiscountSchemaType, UpdateDiscountSchemaType, AvailableDiscountQuerySchemaType } from "@/validators/discounts";
import { PaginationQuerySchemaType } from "@/validators/pagination";

import { AuthenticatedRequest, RequestParamsWithID } from "@/types/request.types";

import { NotFoundException, ConflictException, ForbiddenException } from "@/utils/exceptions";
import { SuccessResponse } from "@/utils/responses";
import { isDuplicateKeyError } from "@/utils/errors";
import { createPaginationData } from "@/utils/funcs";

export const getAll = async (req: Request<{}, {}, {}, PaginationQuerySchemaType>, res: Response, next: NextFunction) => {
    try {
        const { page, limit } = req.query;

        const discounts = await DiscountModel.find()
            .sort({ _id: -1 })
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

        await DiscountModel.create({
            code,
            percent,
            course,
            creator: (req as AuthenticatedRequest).user._id,
            max,
            expireAt,
        });

        SuccessResponse(res, 201, { message: "discount created successfully" });
    } catch (err) {
        if (isDuplicateKeyError(err as Error)) {
            next(new ConflictException("discount already exists with this information"));
        }
        next(err);
    }
};

export const update = async (req: Request<RequestParamsWithID, {}, UpdateDiscountSchemaType>, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { code, percent, course, max, expireAtTime } = req.body;

        const expireAt = expireAtTime && new Date(expireAtTime);

        const discount = await DiscountModel.findByIdAndUpdate(
            id,
            {
                $set: {
                    code,
                    percent,
                    course,
                    max,
                    ...(expireAt && { expireAt }),
                },
            },
            { new: true }
        );

        if (!discount) {
            throw new NotFoundException("discount not found");
        }

        SuccessResponse(res, 200, { message: "discount updated successfully" });
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

        SuccessResponse(res, 200, { message: "discount removed successfully" });
    } catch (err) {
        next(err);
    }
};

export const available = async (req: Request<{}, {}, {}, AvailableDiscountQuerySchemaType>, res: Response, next: NextFunction) => {
    try {
        const { code, course } = req.query;

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
