import express from "express";
import { getQuestions, getQuestion, getAllQuestions, create, message, answer } from "@/controllers/v1/questions";

import { ROLES } from "@/constants/roles";
import validator from "@/middlewares/validator";
import { CreateQuestionSchema, AnswerQuestionSchema, GetAllQuestionsQuerySchema } from "@/validators/questions";
import { PaginationQuerySchema } from "@/validators/pagination";
import auth from "@/middlewares/auth";
import roleGuard from "@/middlewares/roleGuard";

const router = express.Router();

router.route("/").get(auth, validator("query", PaginationQuerySchema), getQuestions).post(auth, validator("body", CreateQuestionSchema), create);
router.get("/all", auth, roleGuard(ROLES.MANAGER), validator("query", GetAllQuestionsQuerySchema), getAllQuestions);
router.get("/:id", auth, getQuestion);
router.post("/:id/message", auth, validator("body", CreateQuestionSchema), message);
router.post("/:id/answer", auth, roleGuard(ROLES.MANAGER), validator("body", AnswerQuestionSchema), answer);

export default router;
