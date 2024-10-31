import { NextFunction, Request, Response } from "express";

import BlogModel from "@/models/Blog";

import { CreateBlogSchemaType, CreateBlogQuerySchemaType, GetAllBlogsQuerySchemaType, SearchBlogsQuerySchameType } from "@/validators/blog";

import { RequestWithUser } from "@/types/request.types";

import { ConflictException, NotFoundException } from "@/utils/exceptions";
import { SuccessResponse } from "@/utils/responses";
import { isDuplicateKeyError } from "@/utils/errors";
import { createPaginationData } from "@/utils/funcs";
import { decreaseBlogsUnique, getBlogUnique } from "@/utils/metadata";

type RequestParamsWithID = { id: string };
type RequestParamsWithSlug = { slug: string };

export const getAll = async (req: Request, res: Response, next: NextFunction) => {};

export const create = async (req: Request<{}, {}, CreateBlogSchemaType>, res: Response, next: NextFunction) => {
    try {
        const { status } = req.query as unknown as CreateBlogQuerySchemaType;
        const { title, description, slug, category, cover, content, tags, relatedCourses } = req.body;

        const timeToRead = Math.ceil(content.length / 1500);
        const shortId = await getBlogUnique();

        const blog = await BlogModel.create({
            title,
            description,
            slug,
            category,
            author: (req as RequestWithUser).user._id,
            cover,
            content,
            status,
            tags,
            timeToRead,
            relatedCourses,
            shortId,
        });

        SuccessResponse(res, 201, { blog });
    } catch (err) {
        if (isDuplicateKeyError(err as Error)) {
            await decreaseBlogsUnique();
            next(new ConflictException("blog already exists with this information"));
        }
        next(err);
    }
};

export const search = async (req: Request, res: Response, next: NextFunction) => {};
export const getOne = async (req: Request, res: Response, next: NextFunction) => {};

export const update = async (req: Request<RequestParamsWithID, {}, CreateBlogSchemaType>, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { title, description, slug, category, cover, content, tags, relatedCourses } = req.body;

        const timeToRead = Math.ceil(content.length / 1500);

        const blog = await BlogModel.findByIdAndUpdate(
            id,
            {
                $set: {
                    title,
                    description,
                    slug,
                    category,
                    cover,
                    content,
                    tags,
                    timeToRead,
                    relatedCourses,
                },
            },
            { new: true }
        );

        if (!blog) {
            throw new NotFoundException("blog not found");
        }

        SuccessResponse(res, 200, { blog });
    } catch (err) {
        next(err);
    }
};

export const remove = async (req: Request<RequestParamsWithID>, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        const blog = await BlogModel.findByIdAndDelete(id);

        // TODO: handle delete blog side effects

        if (!blog) {
            throw new NotFoundException("blog not found");
        }

        SuccessResponse(res, 200, { blog });
    } catch (err) {
        next(err);
    }
};

export const getRelated = async (req: Request, res: Response, next: NextFunction) => {};
