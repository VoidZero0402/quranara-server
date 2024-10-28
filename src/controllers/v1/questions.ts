import { NextFunction, Request, Response } from "express";

import QuestionModel from "@/models/Question";
import QuestionMessageModel from "@/models/QuestionMessage";
import SessionModel, { PopulatedCourse } from "@/models/Session";

import { CreateQuestionSchemaType, AnswerQuestionSchemaType } from "@/validators/questions";

import { RequestWithUser } from "@/types/request.types";

import { STATUS } from "@/constants/questions";

import { ForbiddenException, NotFoundException } from "@/utils/exceptions";
import { SuccessResponse } from "@/utils/responses";

type RequestParamsWithID = { id: string };

export const getQuestions = async (req: Request<{}, {}, CreateQuestionSchemaType>, res: Response, next: NextFunction) => {};

export const getAllQuestions = async (req: Request<{}, {}, CreateQuestionSchemaType>, res: Response, next: NextFunction) => {};

export const create = async (req: Request<{}, {}, CreateQuestionSchemaType>, res: Response, next: NextFunction) => {
    try {
        const user = (req as RequestWithUser).user;
        const { session: sessionId, content, attached } = req.body;

        const session = await SessionModel.findById(sessionId).populate<{ course: PopulatedCourse }>("course");

        if (!session) {
            throw new NotFoundException("session not found");
        }

        const hasAccess = await session.hasUserAccess(user._id);

        if (!hasAccess) {
            throw new ForbiddenException("you can not access to this action");
        }

        const title = `${session.course.title} - ${session.title}`;

        const question = await QuestionModel.create({
            session: session._id,
            user: user._id,
            title,
        });

        const message = await QuestionMessageModel.create({
            user: user._id,
            content,
            question: question._id,
            attached,
        });

        SuccessResponse(res, 201, { question, message });
    } catch (err) {
        next(err);
    }
};

export const message = async (req: Request<RequestParamsWithID, {}, CreateQuestionSchemaType>, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const user = (req as RequestWithUser<RequestParamsWithID>).user;
        const { session: sessionId, content, attached } = req.body;

        const session = await SessionModel.findById(sessionId);

        if (!session) {
            throw new NotFoundException("session not found");
        }

        const hasAccess = await session.hasUserAccess(user._id);

        if (!hasAccess) {
            throw new ForbiddenException("you can not access to this action");
        }

        const question = await QuestionModel.findByIdAndUpdate(id, {
            $set: { status: STATUS.ACTIVE },
        });

        if (!question) {
            throw new NotFoundException("question not found");
        }

        const message = await QuestionMessageModel.create({
            user: user._id,
            content,
            question: question._id,
            attached,
        });

        SuccessResponse(res, 201, { message });
    } catch (err) {
        next(err);
    }
};

export const answer = async (req: Request<RequestParamsWithID, {}, AnswerQuestionSchemaType>, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const user = (req as RequestWithUser<RequestParamsWithID>).user;
        const { content, attached } = req.body;

        const question = await QuestionModel.findByIdAndUpdate(id, {
            $set: { status: STATUS.SLEEP },
        });

        if (!question) {
            throw new NotFoundException("question not found");
        }

        const answer = await QuestionMessageModel.create({
            user: user._id,
            question: question._id,
            content,
            attached,
        });

        SuccessResponse(res, 201, { answer });
    } catch (err) {
        next(err);
    }
};
