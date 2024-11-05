import express from "express";
import { create, getOne, reply, answer, accept, reject, pin, unpin } from "@/controllers/v1/comments";

import { ROLES } from "@/constants/roles";
import validator from "@/middlewares/validator";
import { CreateCommentSchema, ReplyCommentSchema, ActionsQuerySchema } from "@/validators/comments";
import auth from "@/middlewares/auth";
import roleGuard from "@/middlewares/roleGuard";

const router = express.Router();

router.post("/", auth, validator("body", CreateCommentSchema), create);
router.get("/:id", auth, roleGuard(ROLES.MANAGER), getOne);
router.post("/:id/reply", auth, validator("body", ReplyCommentSchema), reply);
router.post("/:id/answer", auth, roleGuard(ROLES.MANAGER), validator("body", ReplyCommentSchema), answer);
router.patch("/:id/accept", auth, roleGuard(ROLES.MANAGER), validator("query", ActionsQuerySchema), accept);
router.patch("/:id/reject", auth, roleGuard(ROLES.MANAGER), validator("query", ActionsQuerySchema), reject);
router.patch("/:id/pin", auth, roleGuard(ROLES.MANAGER), pin);
router.patch("/:id/unpin", auth, roleGuard(ROLES.MANAGER), unpin);

export default router;
