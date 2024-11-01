import { NextFunction, Request, Response } from "express";

import CommentModel from "@/models/Comment";

import { STATUS } from "@/constants/comments";

import { CreateCommentSchemaType, ReplyCommentSchemaType } from "@/validators/comments";

import { RequestWithUser } from "@/types/request.types";

import { NotFoundException } from "@/utils/exceptions";
import { SuccessResponse } from "@/utils/responses";

type RequestParamsWithID = { id: string };

export const create = async (req: Request<{}, {}, CreateCommentSchemaType>, res: Response, next: NextFunction) => {
    try {
        const { content, rating, blog, course, tv } = req.body;

        const comment = await CommentModel.create({
            content,
            rating,
            user: (req as RequestWithUser).user._id,
            blog,
            course,
            tv,
        });

        SuccessResponse(res, 201, { comment });
    } catch (err) {
        next(err);
    }
};

export const getOne = async (req: Request<RequestParamsWithID, {}, ReplyCommentSchemaType>, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        const comment = await CommentModel.findById(id)
            .populate("user", "username profile")
            .populate({ path: "replies", populate: { path: "user", select: "username profile" } })
            .lean();

        if (!comment) {
            throw new NotFoundException("comment not found");
        }

        SuccessResponse(res, 200, { comment });
    } catch (err) {
        next(err);
    }
};

export const reply = async (req: Request<RequestParamsWithID, {}, ReplyCommentSchemaType>, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { content } = req.body;

        const reply = await CommentModel.create({
            content,
            user: (req as RequestWithUser<RequestParamsWithID>).user._id,
            replyTo: id,
        });

        SuccessResponse(res, 201, { reply });
    } catch (err) {
        next(err);
    }
};

export const answer = async (req: Request<RequestParamsWithID, {}, ReplyCommentSchemaType>, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { content } = req.body;

        const reply = await CommentModel.create({
            content,
            user: (req as RequestWithUser<RequestParamsWithID>).user._id,
            status: STATUS.ACCEPTED,
            replyTo: id,
        });

        SuccessResponse(res, 201, { reply });
    } catch (err) {
        next(err);
    }
};

export const accept = async (req: Request<RequestParamsWithID>, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        const comment = await CommentModel.findByIdAndUpdate(
            id,
            {
                $set: { status: STATUS.ACCEPTED },
            },
            { new: true }
        );

        if (!comment) {
            throw new NotFoundException("comment not found");
        }

        SuccessResponse(res, 200, { comment });
    } catch (err) {
        next(err);
    }
};

export const reject = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        const comment = await CommentModel.findByIdAndUpdate(
            id,
            {
                $set: { status: STATUS.REJECTED },
            },
            { new: true }
        );

        if (!comment) {
            throw new NotFoundException("comment not found");
        }

        SuccessResponse(res, 200, { comment });
    } catch (err) {
        next(err);
    }
};
