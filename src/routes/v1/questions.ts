import express from "express";
import { getQuestions, getAllQuestions, create, message, answer } from "@/controllers/v1/questions";

import { ROLES } from "@/constants/roles";
import validator from "@/middlewares/validator";
import { CreateQuestionSchema, AnswerQuestionSchema } from "@/validators/questions";
import auth from "@/middlewares/auth";
import roleGuard from "@/middlewares/roleGuard";

const router = express.Router();

router.get("/", auth, getQuestions)
router.get("/all", auth, roleGuard(ROLES.MANAGER), getAllQuestions)
router.post("/", auth, validator("body", CreateQuestionSchema), create);
router.post("/:id/message", auth, validator("body", CreateQuestionSchema), message);
router.post("/:id/answer", auth, roleGuard(ROLES.MANAGER), validator("body", AnswerQuestionSchema), answer);

export default router;
