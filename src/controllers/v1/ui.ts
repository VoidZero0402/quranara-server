import { NextFunction, Request, Response } from "express";

import CourseModel from "@/models/Course";
import CategoryModel from "@/models/Category";
import UserModel from "@/models/User";
import BlogModel from "@/models/Blog";
import TvModel from "@/models/Tv";
import CommentModel from "@/models/Comment";
import TicketModel from "@/models/Ticket";
import QuestionModel from "@/models/Question";
import OrderModel from "@/models/Order";

import { REFERENCES } from "@/constants/categories";
import { STATUS as COMMENT_STATUS } from "@/constants/comments";
import { STATUS as TICKET_STATUS } from "@/constants/tickets";
import { STATUS as QUESTION_STATUS } from "@/constants/questions";
import { STATUS as ORDER_STATUS } from "@/constants/orders";

import { SuccessResponse } from "@/utils/responses";

export const getMenus = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const courses = await CourseModel.find({}, "title description slug").sort({ _id: -1 }).limit(5);

        const blogCategories = await CategoryModel.find({ ref: REFERENCES.BLOG }, "title caption").sort({ _id: -1 }).limit(5);

        const tvCategories = await CategoryModel.find({ ref: REFERENCES.TV }, "title caption").sort({ _id: -1 }).limit(5);

        const categories = { blog: blogCategories, tv: tvCategories };

        SuccessResponse(res, 200, { courses, categories });
    } catch (err) {
        next(err);
    }
};

export const getManagementPanelDatas = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const promises = [UserModel.countDocuments({}), CourseModel.countDocuments({}), BlogModel.countDocuments({}), TvModel.countDocuments({}), CommentModel.countDocuments({ status: COMMENT_STATUS.PENDING }), TicketModel.countDocuments({ status: TICKET_STATUS.ACTIVE }), QuestionModel.countDocuments({ status: QUESTION_STATUS.ACTIVE }), UserModel.find({ isBanned: false }).sort({ _id: -1 }).limit(5), OrderModel.find({ status: ORDER_STATUS.SUCCESSFUL }).sort({ createdAt: -1 }).populate("user", "phone username profile").limit(5)];

        const [usersCount, coursesCount, blogsCount, tvsCount, commentsCount, ticketsCount, questionsCount, lastUsers, lastOrders] = await Promise.all(promises);

        SuccessResponse(res, 200, { usersCount, coursesCount, blogsCount, tvsCount, commentsCount, ticketsCount, questionsCount, lastUsers, lastOrders });
    } catch (err) {
        next(err);
    }
};
