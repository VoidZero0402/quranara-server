import { NextFunction, Request, Response } from "express";

import CourseModel from "@/models/Course";
import SessionModel from "@/models/Session";
import QuestionModel from "@/models/Question";

import { CreateSessionSchemaType, UpdateSessionSchemaType, UpdateSessionOrderSchemaType } from "@/validators/sessions";

import { ROLES } from "@/constants/roles";

import { ForbiddenException, NotFoundException, UnauthorizedException } from "@/utils/exceptions";
import { SuccessResponse } from "@/utils/responses";
import { getSessionsUnique } from "@/utils/metadata";
import { getUser, timeToSeconds } from "@/utils/funcs";

type RequestParamsWithID = { id: string };
type RequestParamsWithSlug = { slug: string };

export const create = async (req: Request<{}, {}, CreateSessionSchemaType>, res: Response, next: NextFunction) => {
    try {
        const { title, course: courseId, topic, isPublic, video, time, attached } = req.body;

        const course = await CourseModel.findById(courseId);

        if (!course) {
            throw new NotFoundException("course not found");
        }

        const sessionUnique = await getSessionsUnique();

        const slug = `${course.shortId}-${sessionUnique}`;

        const sessionCounts = await SessionModel.countDocuments({ topic });

        const seconds = timeToSeconds(time);

        const session = await SessionModel.create({
            title,
            slug,
            course: course._id,
            topic,
            order: sessionCounts + 1,
            isPublic,
            video,
            time,
            seconds,
            attached,
        });

        SuccessResponse(res, 201, { session });
    } catch (err) {
        next(err);
    }
};

export const update = async (req: Request<RequestParamsWithID, {}, UpdateSessionSchemaType>, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { title, isPublic, video, time, attached } = req.body;

        const session = await SessionModel.findByIdAndUpdate(
            id,
            {
                $set: {
                    title,
                    isPublic,
                    video,
                    time,
                    attached,
                },
            },
            { new: true }
        );

        SuccessResponse(res, 200, { session });
    } catch (err) {
        next(err);
    }
};

export const updateOrder = async (req: Request<RequestParamsWithID, {}, UpdateSessionOrderSchemaType>, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { from, to } = req.body;

        const fromSession = await SessionModel.findOne({ _id: id, order: from });

        if (!fromSession) {
            throw new NotFoundException("from session not found");
        }

        const toSession = await SessionModel.findOne({ order: to, topic: fromSession.topic });

        if (!toSession) {
            throw new NotFoundException("to session not found");
        }

        const fromSessionOrder = fromSession.order;

        fromSession.order = toSession.order;
        toSession.order = fromSessionOrder;

        await fromSession.save();
        await toSession.save();

        SuccessResponse(res, 200, { message: "order changed successfully" });
    } catch (err) {
        next(err);
    }
};

export const getOne = async (req: Request<RequestParamsWithSlug>, res: Response, next: NextFunction) => {
    try {
        const { slug } = req.params;

        const session = await SessionModel.findOne({ slug });

        if (!session) {
            throw new NotFoundException("session not found");
        }

        const user = await getUser(req);

        if (!session.isPublic) {
            if (!user) {
                throw new UnauthorizedException("user is unauthorized");
            }

            if (user.role === ROLES.USER) {
                const hasAccess = await session.hasUserAccess(user._id);

                if (!hasAccess) {
                    throw new ForbiddenException("you can not access to this session");
                }
            }
        }

        const question = user && (await QuestionModel.findOne({ session: session._id, user: user._id }).populate("messages").lean());

        SuccessResponse(res, 200, { session, ...(question && { question }) });
    } catch (err) {
        next(err);
    }
};

export const remove = async (req: Request<RequestParamsWithID>, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        const session = await SessionModel.findByIdAndDelete(id);

        if (!session) {
            throw new NotFoundException("session not found");
        }

        await SessionModel.updateMany(
            { topic: session.topic, order: { $gt: session.order } },
            {
                $inc: { order: -1 },
            }
        );

        SuccessResponse(res, 200, { session });
    } catch (err) {
        next(err);
    }
};
