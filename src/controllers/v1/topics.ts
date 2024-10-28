import { NextFunction, Request, Response } from "express";

import TopicModel from "@/models/Topic";

import { CreateTopicSchemaType, UpdateTopicOrderSchemaType, UpdateTopicSchemaType } from "@/validators/topics";

import { NotFoundException } from "@/utils/exceptions";
import { SuccessResponse } from "@/utils/responses";

type RequestParamsWithID = { id: string };

export const create = async (req: Request<{}, {}, CreateTopicSchemaType>, res: Response, next: NextFunction) => {
    try {
        const { title, course } = req.body;

        const topicCounts = await TopicModel.countDocuments({ course });

        const topic = await TopicModel.create({ title, order: topicCounts + 1, course });

        SuccessResponse(res, 201, { topic });
    } catch (err) {
        next(err);
    }
};

export const update = async (req: Request<RequestParamsWithID, {}, UpdateTopicSchemaType>, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { title } = req.body;

        const updatedTopic = await TopicModel.findByIdAndUpdate(
            id,
            {
                $set: { title },
            },
            { new: true }
        );

        if (!updatedTopic) {
            throw new NotFoundException("topic not found");
        }

        SuccessResponse(res, 200, { topic: updatedTopic });
    } catch (err) {
        next(err);
    }
};

export const updateOrder = async (req: Request, res: Response, next: NextFunction) => {};

export const remove = async (req: Request, res: Response, next: NextFunction) => {};
