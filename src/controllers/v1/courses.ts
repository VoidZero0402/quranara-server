import { NextFunction, Request, Response } from "express";

import CourseModel from "@/models/Course";

import { STATUS } from "@/constants/courses";

import { CreateCourseSchemaType, UpdateCourseSchemaType } from "@/validators/courses";

import { RequestWithUser } from "@/types/request.types";

import { ConflictException, NotFoundException } from "@/utils/exceptions";
import { SuccessResponse } from "@/utils/responses";
import { decreaseCoursesUnique, getCoursesUnique } from "@/utils/metadata";
import { isDuplicateKeyError } from "@/utils/errors";
import { removeFile } from "@/utils/funcs";

type RequestParamsWithID = { id: string };

export const getAll = async (req: Request, res: Response, next: NextFunction) => {};

export const create = async (req: Request<{}, {}, CreateCourseSchemaType>, res: Response, next: NextFunction) => {
    try {
        const { title, slug, description, price, status, video, content } = req.body;

        const shortId = await getCoursesUnique();

        const course = await CourseModel.create({
            title,
            slug,
            description,
            cover: (req.file as Express.Multer.File).filename,
            price,
            status,
            teacher: (req as RequestWithUser).user._id,
            introduction: { video, content },
            shortId,
        });

        SuccessResponse(res, 201, { course });
    } catch (err) {
        if (isDuplicateKeyError(err as Error)) {
            await decreaseCoursesUnique();
            await removeFile((req.file as Express.Multer.File).path);
            next(new ConflictException("course already exists with this information"));
        }
        next(err);
    }
};

export const getOne = async (req: Request, res: Response, next: NextFunction) => {};

export const update = async (req: Request<RequestParamsWithID, {}, UpdateCourseSchemaType>, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { title, slug, description, price, status, video, content } = req.body;

        const updatedCourse = await CourseModel.findByIdAndUpdate(
            id,
            {
                $set: {
                    title,
                    slug,
                    description,
                    ...(req.file?.filename && { cover: req.file.filename }),
                    price,
                    status,
                    introduction: { video, content },
                },
            },
            { new: true }
        );

        if (!updatedCourse) {
            throw new NotFoundException("course not found");
        }

        SuccessResponse(res, 200, { course: updatedCourse });
    } catch (err) {
        if (isDuplicateKeyError(err as Error)) {
            next(new ConflictException("course already exists with this information"));
        }
        next(err);
    }
};

export const remove = async (req: Request<RequestParamsWithID>, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        const course = await CourseModel.findByIdAndDelete(id);

        // TODO: handle delete course side effects

        if (!course) {
            throw new NotFoundException("course not found");
        }

        SuccessResponse(res, 200, { course });
    } catch (err) {
        next(err);
    }
};
