import express from "express";
import { create, reply, accept, reject } from "@/controllers/v1/comments";

import { ROLES } from "@/constants/roles";
import validator from "@/middlewares/validator";
import { CommentQuerySchema, CreateCommentSchema, ReplyCommentSchema } from "@/validators/comments";
import auth from "@/middlewares/auth";
import roleGuard from "@/middlewares/roleGuard";

const router = express.Router();

router.post("/", create);
router.post("/:id/reply", reply);
router.patch("/:id/accept", accept);
router.patch("/:id/reject", reject);

export default router;
