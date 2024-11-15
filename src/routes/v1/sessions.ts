import express from "express";
import { create, update, updateOrder, getOne, getQuestion, remove } from "@/controllers/v1/sessions";

import { ROLES } from "@/constants/roles";
import validator from "@/middlewares/validator";
import { CreateSessionSchema, UpdateSessionSchema, UpdateSessionOrderSchema } from "@/validators/sessions";
import auth from "@/middlewares/auth";
import roleGuard from "@/middlewares/roleGuard";

const router = express.Router();

router.get("/:slug", getOne);
router.get("/:slug/question", getQuestion);

router.use(auth, roleGuard(ROLES.MANAGER));

router.post("/", validator("body", CreateSessionSchema), create);
router.route("/:id").put(validator("body", UpdateSessionSchema), update).delete(remove);
router.patch("/:id/order", validator("body", UpdateSessionOrderSchema), updateOrder);

export default router;
