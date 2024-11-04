import { NextFunction, Request, Response } from "express";

import DiscountModel from "@/models/Discount";
import CartModel, { PopulatedCourse } from "@/models/Cart";
import OrderModel from "@/models/Order";
import CourseUserModel from "@/models/CourseUser";

import { createPayment, verifyPayment } from "@/services/zarinpal";

import { STATUS } from "@/constants/orders";

import { CreateOrderSchemaType } from "@/validators/orders";

import { RequestWithUser } from "@/types/request.types";

import { ForbiddenException, NotFoundException, ConflictException, BadRequestException } from "@/utils/exceptions";
import { SuccessResponse } from "@/utils/responses";
import { getOrdersUnique } from "@/utils/metadata";

export const create = async (req: Request<{}, {}, CreateOrderSchemaType>, res: Response, next: NextFunction) => {
    try {
        const { discountCode } = req.body;

        let discount = 0;

        if (discountCode) {
            const discountDoc = await DiscountModel.findOne({ code: discountCode });

            if (!discountDoc) {
                throw new NotFoundException("discount not found");
            }

            if (discountDoc.uses === discountDoc.max) {
                throw new ForbiddenException("discount max uses is executed");
            }

            discount = discountDoc.percent;
        }

        const cart = await CartModel.findOne({ user: (req as RequestWithUser).user._id })
            .populate<{ items: PopulatedCourse[] }>("items", "price discount")
            .lean();

        if (!cart) {
            throw new NotFoundException("cart not found");
        }

        let payableAmount = 0;

        for (let course of cart.items) {
            payableAmount += course.price - (course.price * course.discount) / 100;
        }

        payableAmount = payableAmount - (payableAmount * discount) / 100;

        const shortId = await getOrdersUnique();

        const orderInstance = new OrderModel({
            user: (req as RequestWithUser).user._id,
            items: cart.items,
            amount: payableAmount,
            shortId,
        });

        const payment = await createPayment({ amount: payableAmount, description: `سفارش با شناسه #${shortId}`, mobile: (req as RequestWithUser).user.phone, email: (req as RequestWithUser).user.email });

        orderInstance.authority = payment.authority;

        const order = await orderInstance.save();

        SuccessResponse(res, 201, { order, paymentUrl: payment.paymentUrl });
    } catch (err) {
        next(err);
    }
};

export const verify = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { Authority: authority } = req.query as unknown as { Authority: string };

        const order = await OrderModel.findOne({ authority, status: STATUS.PAYING });

        if (!order) {
            throw new NotFoundException("order not found");
        }

        try {
            const payment = await verifyPayment({ authority, amount: order.amount });

            if (payment.code !== 100 && payment.code !== 101) {
                throw new BadRequestException("payment verification failed");
            }

            const courseUsers = order.items.map((course) => ({ user: order.user, course }));

            await CourseUserModel.insertMany(courseUsers);

            await CartModel.updateOne({ user: order.user }, { $set: { items: [] } });

            order.status = STATUS.SUCCESSFUL;

            await order.save();
        } finally {
            res.redirect(`${process.env.FRONTEND_URL}/orders/${order.shortId}`);
        }
    } catch (err) {
        res.redirect(process.env.FRONTEND_URL as string);
    }
};

export const getAll = async (req: Request, res: Response, next: NextFunction) => {};

export const getOne = async (req: Request, res: Response, next: NextFunction) => {};
