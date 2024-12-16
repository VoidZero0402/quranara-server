import { NextFunction, Request, Response } from "express";

import TicketModel from "@/models/Ticket";
import TicketMessageModel from "@/models/TicketMessage";

import { CreateTicketSchemaType, AnswerTicketSchemaType, GetAllTicketsQuerySchemaType } from "@/validators/tickets";
import { PaginationQuerySchemaType } from "@/validators/pagination";

import { AuthenticatedRequest, RequestParamsWithID } from "@/types/request.types";

import { STATUS } from "@/constants/tickets";

import { ForbiddenException, NotFoundException } from "@/utils/exceptions";
import { SuccessResponse } from "@/utils/responses";
import { getTicketUnique } from "@/utils/metadata";
import { createPaginationData } from "@/utils/funcs";

export const getTickets = async (req: Request<{}, {}, {}, PaginationQuerySchemaType>, res: Response, next: NextFunction) => {
    try {
        const { page, limit } = req.query;

        const filters = { user: (req as AuthenticatedRequest).user._id };

        const tickets = await TicketModel.find(filters)
            .sort({ _id: -1 })
            .populate("course", "title")
            .skip((page - 1) * limit)
            .limit(limit);

        const ticketsCount = await TicketModel.countDocuments(filters);

        SuccessResponse(res, 200, { tickets, pagination: createPaginationData(page, limit, ticketsCount) });
    } catch (err) {
        next(err);
    }
};

export const getTicket = async (req: Request<RequestParamsWithID>, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        const ticket = await TicketModel.findById(id)
            .populate({ path: "messages", populate: { path: "user", select: "username role profile" } })
            .populate("course", "title")
            .lean();

        if (!ticket) {
            throw new NotFoundException("ticket not found");
        }
        
        if (ticket.user?.toString() !== (req as AuthenticatedRequest).user._id.toString()) {
            throw new ForbiddenException("you can not access this ticket");
        }

        SuccessResponse(res, 200, { ticket });
    } catch (err) {
        next(err);
    }
};

export const getAllTickets = async (req: Request<{}, {}, {}, GetAllTicketsQuerySchemaType>, res: Response, next: NextFunction) => {
    try {
        const { page, limit, status } = req.query;

        const filters = { status };

        const tickets = await TicketModel.find(filters)
            .sort({ _id: -1 })
            .populate("course", "title")
            .skip((page - 1) * limit)
            .limit(limit);

        const ticketsCount = await TicketModel.countDocuments(filters);

        SuccessResponse(res, 200, { tickets, pagination: createPaginationData(page, limit, ticketsCount) });
    } catch (err) {
        next(err);
    }
};

export const create = async (req: Request<{}, {}, CreateTicketSchemaType>, res: Response, next: NextFunction) => {
    try {
        const { title, content, type, course, attached } = req.body;

        const shortId = await getTicketUnique();

        const ticket = await TicketModel.create({
            title,
            description: content,
            course,
            type,
            user: (req as AuthenticatedRequest).user._id,
            shortId,
        });

        await TicketMessageModel.create({
            user: (req as AuthenticatedRequest).user._id,
            content,
            ticket: ticket._id,
            attached,
        });

        SuccessResponse(res, 201, { message: "ticket created successfully" });
    } catch (err) {
        next(err);
    }
};

export const message = async (req: Request<RequestParamsWithID, {}, AnswerTicketSchemaType>, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { content, attached } = req.body;

        const ticket = await TicketModel.findByIdAndUpdate(id, {
            $set: { status: STATUS.ACTIVE },
        });

        if (!ticket) {
            throw new NotFoundException("ticket not found");
        }

        await TicketMessageModel.create({
            user: (req as AuthenticatedRequest).user._id,
            content,
            ticket: ticket._id,
            attached,
        });

        SuccessResponse(res, 201, { message: "message submited successfully" });
    } catch (err) {
        next(err);
    }
};

export const answer = async (req: Request<RequestParamsWithID, {}, AnswerTicketSchemaType>, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { content, attached } = req.body;

        const ticket = await TicketModel.findByIdAndUpdate(id, {
            $set: { status: STATUS.SLEEP },
        });

        if (!ticket) {
            throw new NotFoundException("ticket not found");
        }

        await TicketMessageModel.create({
            user: (req as AuthenticatedRequest).user._id,
            content,
            ticket: ticket._id,
            attached,
        });

        SuccessResponse(res, 201, { message: "answer message submited successfully" });
    } catch (err) {
        next(err);
    }
};

export const close = async (req: Request<RequestParamsWithID>, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        const ticket = await TicketModel.findByIdAndUpdate(
            id,
            {
                $set: { status: STATUS.COLSED },
            },
            { new: true }
        );

        if (!ticket) {
            throw new NotFoundException("ticket not found");
        }

        SuccessResponse(res, 200, { message: "ticket closed successfully" });
    } catch (err) {
        next(err);
    }
};
