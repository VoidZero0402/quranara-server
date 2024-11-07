import express from "express";
import { create, update, updateOrder, getOne, getQuestion, remove } from "@/controllers/v1/sessions";

import { ROLES } from "@/constants/roles";
import validator from "@/middlewares/validator";
import { CreateSessionSchema, UpdateSessionSchema, UpdateSessionOrderSchema } from "@/validators/sessions";
import auth from "@/middlewares/auth";
import roleGuard from "@/middlewares/roleGuard";

const router = express.Router();

router.post("/", auth, roleGuard(ROLES.MANAGER), validator("body", CreateSessionSchema), create);
router.route("/:id").put(auth, roleGuard(ROLES.MANAGER), validator("body", UpdateSessionSchema), update).delete(auth, roleGuard(ROLES.MANAGER), remove);
router.get("/:slug", getOne);
router.get("/:slug/question", getQuestion);
router.route("/:id/order").patch(auth, roleGuard(ROLES.MANAGER), validator("body", UpdateSessionOrderSchema), updateOrder);

export default router;
