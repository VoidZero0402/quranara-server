import express from "express";
import { create, getOne, reply, answer, accept, reject } from "@/controllers/v1/comments";

import { ROLES } from "@/constants/roles";
import validator from "@/middlewares/validator";
import { CreateCommentSchema, ReplyCommentSchema } from "@/validators/comments";
import auth from "@/middlewares/auth";
import roleGuard from "@/middlewares/roleGuard";

const router = express.Router();

router.post("/", auth, validator("body", CreateCommentSchema), create);
router.get("/:id", getOne);
router.post("/:id/reply", auth, validator("body", ReplyCommentSchema), reply);
router.post("/:id/answer", auth, roleGuard(ROLES.MANAGER), validator("body", ReplyCommentSchema), answer);
router.patch("/:id/accept", auth, roleGuard(ROLES.MANAGER), accept);
router.patch("/:id/reject", auth, roleGuard(ROLES.MANAGER), reject);

export default router;
