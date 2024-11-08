import { NextFunction, Request, Response } from "express";

import DiscountModel from "@/models/Discount";
import CartModel, { PopulatedCourse } from "@/models/Cart";
import OrderModel from "@/models/Order";
import CourseUserModel from "@/models/CourseUser";

import { createPayment, verifyPayment } from "@/services/zarinpal";

import { STATUS } from "@/constants/orders";

import { CreateOrderSchemaType } from "@/validators/orders";
import { PaginationQuerySchemaType } from "@/validators/pagination";

import { AuthenticatedRequest, RequestParamsWithID } from "@/types/request.types";

import { ForbiddenException, NotFoundException, BadRequestException } from "@/utils/exceptions";
import { SuccessResponse } from "@/utils/responses";
import { getOrdersUnique } from "@/utils/metadata";
import { createPaginationData } from "@/utils/funcs";

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

        const user = (req as AuthenticatedRequest).user;

        const cart = await CartModel.findOne({ user: user._id }).populate<{ items: PopulatedCourse[] }>("items", "price discount").lean();

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
            user: user._id,
            items: cart.items,
            amount: payableAmount,
            shortId,
        });

        const payment = await createPayment({ amount: payableAmount, description: `سفارش با شناسه #${shortId}`, mobile: user.phone, email: user.email });

        orderInstance.authority = payment.authority;

        const order = await orderInstance.save();

        SuccessResponse(res, 201, { order, paymentUrl: payment.paymentUrl });
    } catch (err) {
        next(err);
    }
};

export const verify = async (req: Request<{}, {}, {}, { Authority: string }>, res: Response, next: NextFunction) => {
    try {
        const { Authority: authority } = req.query;

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

export const getAll = async (req: Request<{}, {}, {}, PaginationQuerySchemaType>, res: Response, next: NextFunction) => {
    try {
        const { page, limit } = req.query;

        const filters = { status: STATUS.SUCCESSFUL };

        const orders = await OrderModel.find(filters)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .lean();

        const ordersCount = await OrderModel.countDocuments(filters);

        SuccessResponse(res, 200, { orders, pagination: createPaginationData(page, limit, ordersCount) });
    } catch (err) {
        next(err);
    }
};

export const getOne = async (req: Request<RequestParamsWithID>, res: Response, next: NextFunction) => {
    try {
        const user = (req as AuthenticatedRequest).user;
        const { id } = req.params;

        const order = await OrderModel.findOne({ shortId: id }).populate<{ items: PopulatedCourse[] }>("items", "title description slug cover price discount").lean();

        if (!order) {
            throw new NotFoundException("order not found");
        }

        if (!(order.user === user._id)) {
            throw new ForbiddenException("you can not access to this route");
        }

        SuccessResponse(res, 200, { order });
    } catch (err) {
        next(err);
    }
};
