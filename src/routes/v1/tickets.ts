import express from "express";
import { getTickets, getAllTickets, getTicket, create, message, answer } from "@/controllers/v1/tickets";

import { ROLES } from "@/constants/roles";
import validator from "@/middlewares/validator";
import { CreateTicketSchema, AnswerTicketSchema, GetAllTicketsQuerySchema } from "@/validators/tickets";
import { PaginationQuerySchema } from "@/validators/pagination";
import auth from "@/middlewares/auth";
import roleGuard from "@/middlewares/roleGuard";

const router = express.Router();

router.route("/").get(getTickets).post(create);
router.get("/all", getAllTickets);
router.get("/:id", getTicket);
router.post("/:id/message", message);
router.post("/:id/answer", answer);

export default router;
