import { NextFunction, Request, Response } from "express";

import CourseModel from "@/models/Course";
import TopicModel from "@/models/Topic";

import { STATUS } from "@/constants/courses";

import { CreateCourseSchemaType } from "@/validators/courses";

import { RequestWithUser } from "@/types/request.types";

import { BadRequestException, ConflictException } from "@/utils/exceptions";
import { SuccessResponse } from "@/utils/responses";
import { decreaseCoursesUnique, getCoursesUnique } from "@/utils/metadata";
import { isDuplicateKeyError } from "@/utils/errors";
import { removeFile } from "@/utils/funcs";

export const getAll = async (req: Request, res: Response, next: NextFunction) => {};

export const create = async (req: Request<{}, {}, CreateCourseSchemaType>, res: Response, next: NextFunction) => {
    try {
        const { title, slug, description, price, isPresell, video, content } = req.body;

        const shortId = await getCoursesUnique();

        const course = await CourseModel.create({
            title,
            slug,
            description,
            cover: (req.file as Express.Multer.File).filename,
            price,
            status: isPresell ? STATUS.PRE_SELL : STATUS.PUBLISH,
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

export const update = async (req: Request, res: Response, next: NextFunction) => {};

export const remove = async (req: Request, res: Response, next: NextFunction) => {};

export const createTopic = async (req: Request, res: Response, next: NextFunction) => {};

export const updateTopic = async (req: Request, res: Response, next: NextFunction) => {};

export const removeTopic = async (req: Request, res: Response, next: NextFunction) => {};
