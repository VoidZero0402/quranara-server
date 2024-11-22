import { NextFunction, Request, Response } from "express";

import CartModel, { PopulatedCourse } from "@/models/Cart";
import CourseModel from "@/models/Course";
import CourseUserModel from "@/models/CourseUser";

import { UpdateCartSchemaType } from "@/validators/cart";

import { AuthenticatedRequest } from "@/types/request.types";

import { ConflictException, NotFoundException } from "@/utils/exceptions";
import { SuccessResponse } from "@/utils/responses";

export const getCart = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const cart = await CartModel.findOne({ user: (req as AuthenticatedRequest).user._id }, "items")
            .populate<{ items: PopulatedCourse[] }>("items", "title description slug cover price discount")
            .lean();

        if (!cart) {
            throw new NotFoundException("cart not found");
        }

        let totalPrice = 0;
        let discount = 0;

        for (const course of cart.items) {
            totalPrice += course.price;
            discount += (course.price * course.discount) / 100;
        }

        const payableAmount = totalPrice - discount;

        SuccessResponse(res, 200, { cart: { ...cart, totalPrice, discount, payableAmount } });
    } catch (err) {
        next(err);
    }
};

export const updateCart = async (req: Request<{}, {}, UpdateCartSchemaType>, res: Response, next: NextFunction) => {
    try {
        const { course: courseId } = req.body;

        const course = await CourseModel.findById(courseId);

        if (!course) {
            throw new NotFoundException("course not found");
        }

        const isFreeCourse = course.price === 0 || course.discount === 100;

        if (isFreeCourse) {
            await CourseUserModel.create({ user: (req as AuthenticatedRequest).user._id, course: course._id });
            SuccessResponse(res, 201, { messsage: "course added to your account" });
            return;
        }

        const cart = await CartModel.findOne({ user: (req as AuthenticatedRequest).user._id });

        if (!cart) {
            throw new NotFoundException("cart not found");
        }

        const isExistCourceInCart = cart.items.includes(course._id);

        if (isExistCourceInCart) {
            throw new ConflictException("course already exist in cart");
        }

        cart.items.push(course._id);

        await cart.save();

        SuccessResponse(res, 200, { message: "cart updated successfully" });
    } catch (err) {
        next(err);
    }
};

export const removeItem = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { course } = req.body;

        const cart = await CartModel.findOneAndUpdate(
            { user: (req as AuthenticatedRequest).user._id },
            {
                $pull: { items: course },
            },
            {
                new: true,
            }
        );

        SuccessResponse(res, 200, { message: "cart updated successfully" });
    } catch (err) {
        next(err);
    }
};
