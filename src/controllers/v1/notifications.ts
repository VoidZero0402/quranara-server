import { NextFunction, Request, Response } from "express";

import NotificationModel from "@/models/Notification";
import NotificationUserModel from "@/models/NotificationUser";
import UserModel from "@/models/User";
import CourseUserModel from "@/models/CourseUser";

import { CreateNotificationSchemaType, SendAllNotificationSchemaType, SendCourseRegistersNotificationSchemaType, SendOneNotificationSchemaType } from "@/validators/notifications";
import { PaginationQuerySchemaType } from "@/validators/pagination";

import { TYPES } from "@/constants/notifications";

import { AuthenticatedRequest, RequestParamsWithID, RequestParamsWithSlug } from "@/types/request.types";

import { NotFoundException } from "@/utils/exceptions";
import { SuccessResponse } from "@/utils/responses";
import { createPaginationData } from "@/utils/funcs";

export const getUnseenNotifications = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const notificationUsers = await NotificationUserModel.find({ user: (req as AuthenticatedRequest).user._id, isSeen: false })
            .populate("notification")
            .lean();

        const notifications = [];

        for (const notificationUser of notificationUsers) {
            notifications.push(notificationUser.notification);
        }

        SuccessResponse(res, 200, { notifications });
    } catch (err) {
        next(err);
    }
};

export const getSeenNotifications = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const notificationUsers = await NotificationUserModel.find({ user: (req as AuthenticatedRequest).user._id, isSeen: true })
            .populate("notification")
            .lean();

        const notifications = [];

        for (const notificationUser of notificationUsers) {
            notifications.push(notificationUser.notification);
        }

        SuccessResponse(res, 200, { notifications });
    } catch (err) {
        next(err);
    }
};

export const getNotificationsCount = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const count = await NotificationUserModel.countDocuments({ user: (req as AuthenticatedRequest).user._id, isSeen: false });

        SuccessResponse(res, 200, { count });
    } catch (err) {
        next(err);
    }
};

export const seen = async (req: Request<RequestParamsWithID>, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        const notification = await NotificationUserModel.findByIdAndUpdate(id, {
            $set: {
                isSeen: true,
            },
        });

        if (!notification) {
            throw new NotFoundException("notification not found");
        }

        SuccessResponse(res, 200, { message: "notification seened successfully" });
    } catch (err) {
        next(err);
    }
};

export const getAllNotifications = async (req: Request<{}, {}, {}, PaginationQuerySchemaType>, res: Response, next: NextFunction) => {
    try {
        const { page, limit } = req.query;

        const notifications = await NotificationModel.find({})
            .sort({ _id: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        const notificationsCount = await NotificationModel.countDocuments({});

        SuccessResponse(res, 200, { notifications, pagination: createPaginationData(page, limit, notificationsCount) });
    } catch (err) {
        next(err);
    }
};

export const sendAll = async (req: Request<{}, {}, SendAllNotificationSchemaType>, res: Response, next: NextFunction) => {
    try {
        const { title, description } = req.body;

        const notification = await NotificationModel.create({
            title,
            description,
            type: TYPES.GLOBAL,
        });

        const users = await UserModel.find({}, "_id");

        const bulkOperations = users.map((user) => ({
            insertOne: {
                document: {
                    user: user._id,
                    notification: notification._id,
                },
            },
        }));

        await NotificationUserModel.bulkWrite(bulkOperations);

        SuccessResponse(res, 201, { message: "notifications sent successfully" });
    } catch (err) {
        next(err);
    }
};

export const sendCourseRegisters = async (req: Request<{}, {}, SendCourseRegistersNotificationSchemaType>, res: Response, next: NextFunction) => {
    try {
        const { title, description, course } = req.body;

        const notification = await NotificationModel.create({
            title,
            description,
            type: TYPES.COURSE_REGISTERS,
        });

        const courseUsers = await CourseUserModel.find({ course }, "user");

        const bulkOperations = courseUsers.map((courseUser) => ({
            insertOne: {
                document: {
                    user: courseUser.user,
                    notification: notification._id,
                },
            },
        }));

        await NotificationUserModel.bulkWrite(bulkOperations);

        SuccessResponse(res, 201, { message: "notifications sent successfully" });
    } catch (err) {
        next(err);
    }
};

export const sendOne = async (req: Request<{}, {}, SendOneNotificationSchemaType>, res: Response, next: NextFunction) => {
    try {
        const { title, description, user } = req.body;

        const notification = await NotificationModel.create({
            title,
            description,
            type: TYPES.ONE_USER,
        });

        await NotificationUserModel.create({ user, notification: notification._id });

        SuccessResponse(res, 201, { message: "notification sent successfully" });
    } catch (err) {
        next(err);
    }
};

export const update = async (req: Request<RequestParamsWithID, {}, CreateNotificationSchemaType>, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { title, description } = req.body;

        const notification = await NotificationModel.findByIdAndUpdate(id, {
            $set: {
                title,
                description,
            },
        });

        if (!notification) {
            throw new NotFoundException("notification not found");
        }

        SuccessResponse(res, 200, { message: "notification updated successfully" });
    } catch (err) {
        next(err);
    }
};

export const remove = async (req: Request<RequestParamsWithID>, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        const notification = await NotificationModel.findOneAndDelete({ _id: id });

        if (!notification) {
            throw new NotFoundException("notification not found");
        }

        SuccessResponse(res, 200, { message: "notification removed successfully" });
    } catch (err) {
        next(err);
    }
};
