import { NextFunction, Request, Response } from "express";

import PollModel from "@/models/Poll";

import { CreatePollSchemaType, UpdatePollSchemaType, VoutePollSchemaType } from "@/validators/polls";
import { PaginationQuerySchemaType } from "@/validators/pagination";

import { RequestParamsWithID } from "@/types/request.types";

import { ConflictException, NotFoundException } from "@/utils/exceptions";
import { SuccessResponse } from "@/utils/responses";
import { createPaginationData } from "@/utils/funcs";
import { isDuplicateKeyError } from "@/utils/errors";

export const voute = async (req: Request<RequestParamsWithID, {}, VoutePollSchemaType>, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { option } = req.body;

        await PollModel.updateOne(
            { _id: id },
            {
                $inc: { "options.$[elem].votes": 1 },
            },
            { arrayFilters: [{ "elem.text": option }] }
        );

        SuccessResponse(res, 200, { message: "voute submit successfully" });
    } catch (err) {
        next(err);
    }
};

export const getAll = async (req: Request<{}, {}, {}, PaginationQuerySchemaType>, res: Response, next: NextFunction) => {
    try {
        const { page, limit } = req.query;

        const polls = await PollModel.find({})
            .sort({ _id: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        const pollsCount = await PollModel.countDocuments({});

        SuccessResponse(res, 200, { polls, pagination: createPaginationData(page, limit, pollsCount) });
    } catch (err) {
        next(err);
    }
};

export const create = async (req: Request<{}, {}, CreatePollSchemaType>, res: Response, next: NextFunction) => {
    try {
        const { title, identifier, description, ref, options } = req.body;

        await PollModel.create({
            title,
            identifier,
            description,
            ref,
            options,
        });

        SuccessResponse(res, 201, { message: "poll created successfully" });
    } catch (err) {
        if (isDuplicateKeyError(err as Error)) {
            next(new ConflictException("poll already exists with this information"));
        }
        next(err);
    }
};

export const getOne = async (req: Request<RequestParamsWithID>, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        const poll = await PollModel.findById(id);

        if (!poll) {
            throw new NotFoundException("poll not found");
        }

        SuccessResponse(res, 200, { poll });
    } catch (err) {
        next(err);
    }
};

export const update = async (req: Request<RequestParamsWithID, {}, UpdatePollSchemaType>, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { title, identifier, options, description } = req.body;

        const poll = await PollModel.findById(id);

        if (!poll) {
            throw new NotFoundException("poll not found");
        }

        poll.$set({ title, identifier, description });

        const indexedOptions = Object.fromEntries(poll.options.map((option) => [option.text, option.votes]));

        const updatedOptions = options.map(({ text }) => ({ text, votes: indexedOptions[text] ?? 0 }));

        poll.$set({ options: updatedOptions });

        await poll.save();

        SuccessResponse(res, 200, { message: "poll updated successfully" });
    } catch (err) {
        if (isDuplicateKeyError(err as Error)) {
            next(new ConflictException("poll already exists with this information"));
        }
        next(err);
    }
};

export const remove = async (req: Request<RequestParamsWithID>, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        const poll = await PollModel.findByIdAndDelete(id);

        if (!poll) {
            throw new NotFoundException("poll not found");
        }

        SuccessResponse(res, 200, { message: "poll removed successfully" });
    } catch (err) {
        next(err);
    }
};
