import { NextFunction, Request, Response } from "express";

import CommentModel from "@/models/Comment";
import ReplyCommentModel from "@/models/ReplyComment";

import { STATUS, REPLIES_STATUS } from "@/constants/comments";

import { GetAllCommentsQuerySchemaType, CreateCommentSchemaType, ReplyCommentSchemaType, ActionsQuerySchemaType } from "@/validators/comments";

import { AuthenticatedRequest, RequestParamsWithID } from "@/types/request.types";

import { NotFoundException } from "@/utils/exceptions";
import { SuccessResponse } from "@/utils/responses";
import { createPaginationData } from "@/utils/funcs";

export const getAll = async (req: Request<{}, {}, {}, GetAllCommentsQuerySchemaType>, res: Response, next: NextFunction) => {
    try {
        const { page, limit, source, status } = req.query;

        const field = source.toLocaleLowerCase();

        const filters = { [field]: { $exists: true }, ...(status && { status }) };

        const comments = await CommentModel.find(filters)
            .sort({ updatedAt: -1 })
            .populate(field, "title")
            .populate("user", "username profile")
            .populate({ path: "_replies", populate: { path: "user", select: "username profile" } })
            .skip((page - 1) * limit)
            .limit(limit)
            .lean();

        const commentsCount = await CommentModel.countDocuments(filters);

        SuccessResponse(res, 200, { comments, pagination: createPaginationData(page, limit, commentsCount) });
    } catch (err) {
        next(err);
    }
};

export const create = async (req: Request<{}, {}, CreateCommentSchemaType>, res: Response, next: NextFunction) => {
    try {
        const { content, blog, course, tv } = req.body;

        await CommentModel.create({
            content,
            user: (req as AuthenticatedRequest).user._id,
            blog,
            course,
            tv,
        });

        SuccessResponse(res, 201, { message: "comment created successfully" });
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

        const comment = await CommentModel.findByIdAndUpdate(id, { $set: { repliesStatus: REPLIES_STATUS.PENDING } });

        if (!comment) {
            throw new NotFoundException("comment not found");
        }

        await ReplyCommentModel.create({
            content,
            user: (req as AuthenticatedRequest).user._id,
            replyTo: id,
        });

        SuccessResponse(res, 201, { message: "reply created successfully" });
    } catch (err) {
        next(err);
    }
};

export const answer = async (req: Request<RequestParamsWithID, {}, ReplyCommentSchemaType>, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { content } = req.body;

        await ReplyCommentModel.create({
            content,
            user: (req as AuthenticatedRequest).user._id,
            status: STATUS.ACCEPTED,
            replyTo: id,
        });

        await CommentModel.updateOne({ _id: id }, { $set: { status: STATUS.ACCEPTED } }, { timestamps: false });

        SuccessResponse(res, 201, { message: "reply answer created successfully" });
    } catch (err) {
        next(err);
    }
};

export const accept = async (req: Request<RequestParamsWithID, {}, {}, ActionsQuerySchemaType>, res: Response, next: NextFunction) => {
    try {
        const { isReply } = req.query;
        const { id } = req.params;

        if (isReply) {
            const reply = await ReplyCommentModel.findByIdAndUpdate(
                id,
                {
                    $set: { status: STATUS.ACCEPTED },
                },
                { new: true }
            );

            if (!reply) {
                throw new NotFoundException("reply not found");
            }

            SuccessResponse(res, 200, { reply });
        } else {
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

            SuccessResponse(res, 200, { message: "comment accepted successfully" });
        }
    } catch (err) {
        next(err);
    }
};

export const reject = async (req: Request<RequestParamsWithID, {}, {}, ActionsQuerySchemaType>, res: Response, next: NextFunction) => {
    try {
        const { isReply } = req.query;
        const { id } = req.params;

        if (isReply) {
            const reply = await ReplyCommentModel.findByIdAndUpdate(
                id,
                {
                    $set: { status: STATUS.REJECTED },
                },
                { new: true }
            );

            if (!reply) {
                throw new NotFoundException("reply not found");
            }

            SuccessResponse(res, 200, { reply });
        } else {
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

            SuccessResponse(res, 200, { message: "comment rejected successfully" });
        }
    } catch (err) {
        next(err);
    }
};

export const pin = async (req: Request<RequestParamsWithID>, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        const comment = await CommentModel.findByIdAndUpdate(
            id,
            {
                $set: { pin: true },
            },
            { new: true }
        );

        if (!comment) {
            throw new NotFoundException("comment not found");
        }

        SuccessResponse(res, 200, { message: "comment pinned successfully" });
    } catch (err) {
        next(err);
    }
};

export const unpin = async (req: Request<RequestParamsWithID>, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        const comment = await CommentModel.findByIdAndUpdate(
            id,
            {
                $set: { pin: false },
            },
            { new: true }
        );

        if (!comment) {
            throw new NotFoundException("comment not found");
        }

        SuccessResponse(res, 200, { message: "comment unpinned successfully" });
    } catch (err) {
        next(err);
    }
};

export const checkReplies = async (req: Request<RequestParamsWithID>, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        const comment = await CommentModel.findById(id);

        if (!comment) {
            throw new NotFoundException("comment not found");
        }

        const isExistsReplyInPendingStatus = Boolean(await ReplyCommentModel.exists({ replyTo: comment._id, status: STATUS.PENDING }));

        comment.$set({ repliesStatus: isExistsReplyInPendingStatus ? REPLIES_STATUS.PENDING : REPLIES_STATUS.NONE });

        await comment.save();

        SuccessResponse(res, 200, { message: "replies checked successfully" });
    } catch (err) {
        next(err);
    }
};
