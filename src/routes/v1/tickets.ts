import express from "express";
import { getTickets, getAllTickets, getTicket, create, message, answer, close } from "@/controllers/v1/tickets";

import { ROLES } from "@/constants/roles";
import validator from "@/middlewares/validator";
import { CreateTicketSchema, AnswerTicketSchema, GetAllTicketsQuerySchema } from "@/validators/tickets";
import { PaginationQuerySchema } from "@/validators/pagination";
import auth from "@/middlewares/auth";
import roleGuard from "@/middlewares/roleGuard";

const router = express.Router();

router.use(auth);

router.route("/").get(validator("query", PaginationQuerySchema), getTickets).post(validator("body", CreateTicketSchema), create);
router.get("/:id", getTicket);
router.post("/:id/message", validator("body", AnswerTicketSchema), message);

router.use(roleGuard(ROLES.MANAGER));

router.get("/all", validator("query", GetAllTicketsQuerySchema), getAllTickets);
router.post("/:id/answer", validator("body", AnswerTicketSchema), answer);
router.patch("/:id/close", close);

export default router;
