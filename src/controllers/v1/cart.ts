import { NextFunction, Request, Response } from "express";

import CartModel, { PopulatedCourse } from "@/models/Cart";

import { UpdateCartSchemaType } from "@/validators/cart";

import { RequestWithUser } from "@/types/request.types";

import { ConflictException, NotFoundException } from "@/utils/exceptions";
import { SuccessResponse } from "@/utils/responses";

export const getCart = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const cart = await CartModel.findOne({ user: (req as RequestWithUser).user._id }).populate("items", "title slug cover price discount").lean();

        if (!cart) {
            throw new NotFoundException("cart not found");
        }

        SuccessResponse(res, 200, { cart });
    } catch (err) {
        next(err);
    }
};

export const updateCart = async (req: Request<{}, {}, UpdateCartSchemaType>, res: Response, next: NextFunction) => {
    try {
        const { course } = req.body;

        const cart = await CartModel.findOne({ user: (req as RequestWithUser).user._id });

        if (!cart) {
            throw new NotFoundException("cart not found");
        }

        const isExistCourceInCart = cart.items.includes(course as any);

        if (isExistCourceInCart) {
            throw new ConflictException("course already exist in cart");
        }

        cart.items.push(course as any);

        const updatedCart = await cart.save();

        SuccessResponse(res, 200, { cart: updatedCart });
    } catch (err) {
        next(err);
    }
};

export const removeItem = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { course } = req.body;

        const cart = await CartModel.findOneAndUpdate(
            { user: (req as RequestWithUser).user._id },
            {
                $pull: { items: course },
            },
            {
                new: true,
            }
        );

        SuccessResponse(res, 200, { cart });
    } catch (err) {
        next(err);
    }
};
