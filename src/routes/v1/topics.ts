import express from "express";
import { create, update, updateOrder, remove } from "@/controllers/v1/topics";

import { ROLES } from "@/constants/roles";
import validator from "@/middlewares/validator";
import { CreateTopicSchema, UpdateTopicSchema, UpdateTopicOrderSchema } from "@/validators/topics";
import auth from "@/middlewares/auth";
import roleGuard from "@/middlewares/roleGuard";

const router = express.Router();

router.use(auth, roleGuard(ROLES.MANAGER));

router.post("/", validator("body", CreateTopicSchema), create);
router.route("/:id").patch(validator("body", UpdateTopicSchema), update).delete(remove);
router.patch("/:id/order", validator("body", UpdateTopicOrderSchema), updateOrder);

export default router;
