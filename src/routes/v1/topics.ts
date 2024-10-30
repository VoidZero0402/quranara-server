import express from "express";
import { create, update, updateOrder, remove } from "@/controllers/v1/topics";

import { ROLES } from "@/constants/roles";
import validator from "@/middlewares/validator";
import { CreateTopicSchema, UpdateTopicSchema, UpdateTopicOrderSchema } from "@/validators/topics";
import auth from "@/middlewares/auth";
import roleGuard from "@/middlewares/roleGuard";

const router = express.Router();

router.post("/", auth, roleGuard(ROLES.MANAGER), validator("body", CreateTopicSchema), create);
router.route("/:id").patch(auth, roleGuard(ROLES.MANAGER), validator("body", UpdateTopicSchema), update).delete(auth, roleGuard(ROLES.MANAGER), remove);
router.patch("/:id/order", auth, roleGuard(ROLES.MANAGER), validator("body", UpdateTopicOrderSchema), updateOrder);

export default router;
