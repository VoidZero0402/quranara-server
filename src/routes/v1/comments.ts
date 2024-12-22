import express from "express";
import { getAll, getOne, create, reply, answer, accept, reject, pin, unpin, checkReplies } from "@/controllers/v1/comments";

import { ROLES } from "@/constants/roles";
import validator from "@/middlewares/validator";
import { GetAllCommentsQuerySchema, CreateCommentSchema, ReplyCommentSchema, ActionsQuerySchema } from "@/validators/comments";
import auth from "@/middlewares/auth";
import roleGuard from "@/middlewares/roleGuard";

const router = express.Router();

router.use(auth);

router.post("/", validator("body", CreateCommentSchema), create);
router.post("/:id/reply", validator("body", ReplyCommentSchema), reply);

router.use(roleGuard(ROLES.MANAGER));

router.get("/all", validator("query", GetAllCommentsQuerySchema), getAll);
router.get("/:id", getOne);
router.post("/:id/answer", validator("body", ReplyCommentSchema), answer);
router.patch("/:id/accept", validator("query", ActionsQuerySchema), accept);
router.patch("/:id/reject", validator("query", ActionsQuerySchema), reject);
router.patch("/:id/pin", pin);
router.patch("/:id/unpin", unpin);
router.patch("/:id/check-replies", checkReplies);

export default router;
