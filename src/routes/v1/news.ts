import express from "express";
import { getAll, create, update, remove, shown, unshown } from "@/controllers/v1/news";

import { ROLES } from "@/constants/roles";
import validator from "@/middlewares/validator";
import { CreateNewsSchema, UpdateNewsSchema } from "@/validators/news";
import auth from "@/middlewares/auth";
import roleGuard from "@/middlewares/roleGuard";

const router = express.Router();

router.get("/", getAll);

router.use(auth, roleGuard(ROLES.MANAGER));

router.post("/", validator("body", CreateNewsSchema), create);
router.route("/:id").put(validator("body", UpdateNewsSchema), update).delete(remove);
router.patch("/:id/shown", shown);
router.patch("/:id/unshown", unshown);

export default router;
