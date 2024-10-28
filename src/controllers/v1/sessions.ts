import { NextFunction, Request, Response } from "express";

import CourseModel from "@/models/Course";
import SessionModel from "@/models/Session";

import { CreateSessionSchemaType, UpdateSessionSchemaType, UpdateSessionOrderSchemaType } from "@/validators/sessions";

import { NotFoundException } from "@/utils/exceptions";
import { SuccessResponse } from "@/utils/responses";
import { getSessionsUnique } from "@/utils/metadata";

type RequestParamsWithID = { id: string };

export const create = async (req: Request<{}, {}, CreateSessionSchemaType>, res: Response, next: NextFunction) => {
    try {
        const { title, course: courseId, topic, video, time, attached } = req.body;

        const course = await CourseModel.findById(courseId);

        if (!course) {
            throw new NotFoundException("course not found");
        }

        const sessionUnique = await getSessionsUnique();

        const slug = `${course.shortId}-${sessionUnique}`;

        const sessionCounts = await SessionModel.countDocuments({ topic });

        const session = await SessionModel.create({
            title,
            slug,
            course: course._id,
            topic,
            order: sessionCounts + 1,
            video,
            time,
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
        const { title, video, time, attached } = req.body;

        const session = await SessionModel.findByIdAndUpdate(
            id,
            {
                $set: {
                    title,
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

export const updateOrder = async (req: Request, res: Response, next: NextFunction) => {};
export const getOne = async (req: Request, res: Response, next: NextFunction) => {};
export const remove = async (req: Request, res: Response, next: NextFunction) => {};
