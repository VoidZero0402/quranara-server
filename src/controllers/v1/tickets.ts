import { NextFunction, Request, Response } from "express";

import TicketModel from "@/models/Ticket";
import TicketMessageModel from "@/models/TicketMessage";

import { CreateTicketSchemaType, AnswerTicketSchemaType, GetAllTicketsQuerySchemaType } from "@/validators/tickets";
import { PaginationQuerySchemaType } from "@/validators/pagination";

import { RequestWithUser } from "@/types/request.types";

import { STATUS } from "@/constants/tickets";

import { ForbiddenException, NotFoundException } from "@/utils/exceptions";
import { SuccessResponse } from "@/utils/responses";
import { getTicketUnique } from "@/utils/metadata";

type RequestParamsWithID = { id: string };

export const getTickets = async (req: Request, res: Response, next: NextFunction) => {};
export const getAllTickets = async (req: Request, res: Response, next: NextFunction) => {};
export const getTicket = async (req: Request, res: Response, next: NextFunction) => {};

export const create = async (req: Request<{}, {}, CreateTicketSchemaType>, res: Response, next: NextFunction) => {
    try {
        const { title, content, type, course, attached } = req.body;

        const shortId = await getTicketUnique();

        const ticket = await TicketModel.create({
            title,
            course,
            type,
            user: (req as RequestWithUser).user._id,
            shortId,
        });

        const message = await TicketMessageModel.create({
            user: (req as RequestWithUser).user._id,
            content,
            ticket: ticket._id,
            attached,
        });

        SuccessResponse(res, 201, { ticket, message });
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

        const message = await TicketMessageModel.create({
            user: (req as RequestWithUser<RequestParamsWithID>).user._id,
            content,
            ticket: ticket._id,
            attached,
        });

        SuccessResponse(res, 201, { message });
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

        const message = await TicketMessageModel.create({
            user: (req as RequestWithUser<RequestParamsWithID>).user._id,
            content,
            ticket: ticket._id,
            attached,
        });

        SuccessResponse(res, 201, { message });
    } catch (err) {
        next(err);
    }
};
