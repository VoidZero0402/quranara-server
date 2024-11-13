import express from "express";
import { getQuestions, getQuestion, getAllQuestions, create, message, answer, close } from "@/controllers/v1/questions";

import { ROLES } from "@/constants/roles";
import validator from "@/middlewares/validator";
import { CreateQuestionSchema, AnswerQuestionSchema, GetAllQuestionsQuerySchema } from "@/validators/questions";
import { PaginationQuerySchema } from "@/validators/pagination";
import auth from "@/middlewares/auth";
import roleGuard from "@/middlewares/roleGuard";

const router = express.Router();

router.use(auth);

router.route("/").get(validator("query", PaginationQuerySchema), getQuestions).post(validator("body", CreateQuestionSchema), create);
router.get("/:id", getQuestion);
router.post("/:id/message", validator("body", CreateQuestionSchema), message);

router.use(roleGuard(ROLES.MANAGER));

router.get("/all", validator("query", GetAllQuestionsQuerySchema), getAllQuestions);
router.post("/:id/answer", validator("body", AnswerQuestionSchema), answer);
router.post("/:id/close", close);

export default router;
