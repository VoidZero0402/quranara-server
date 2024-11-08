import { NextFunction, Request, Response } from "express";

import TopicModel from "@/models/Topic";

import { CreateTopicSchemaType, UpdateTopicOrderSchemaType, UpdateTopicSchemaType } from "@/validators/topics";

import { RequestParamsWithID } from "@/types/request.types";

import { NotFoundException } from "@/utils/exceptions";
import { SuccessResponse } from "@/utils/responses";

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

        SuccessResponse(res, 200, { topic: updatedTopic });
    } catch (err) {
        next(err);
    }
};

export const updateOrder = async (req: Request<RequestParamsWithID, {}, UpdateTopicOrderSchemaType>, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { from, to } = req.body;

        const fromTopic = await TopicModel.findOne({ _id: id, order: from });

        if (!fromTopic) {
            throw new NotFoundException("from topic not found");
        }

        const toTopic = await TopicModel.findOne({ order: to, course: fromTopic.course });

        if (!toTopic) {
            throw new NotFoundException("to topic not found");
        }

        const fromTopicOrder = fromTopic.order;

        fromTopic.order = toTopic.order;
        toTopic.order = fromTopicOrder;

        await fromTopic.save();
        await toTopic.save();

        SuccessResponse(res, 200, { message: "order changed successfully" });
    } catch (err) {
        next(err);
    }
};

export const remove = async (req: Request<RequestParamsWithID>, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        const topic = await TopicModel.findByIdAndDelete(id);

        // TODO: handle side effects

        if (!topic) {
            throw new NotFoundException("topic not found");
        }

        await TopicModel.updateMany(
            { course: topic.course, order: { $gt: topic.order } },
            {
                $inc: { order: -1 },
            }
        );

        SuccessResponse(res, 200, { topic });
    } catch (err) {
        next(err);
    }
};
