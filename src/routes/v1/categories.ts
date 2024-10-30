import express from "express";
import { getAll, create, update, remove } from "@/controllers/v1/categories";

import { ROLES } from "@/constants/roles";
import validator from "@/middlewares/validator";
import { CreateCategorySchema, UpdateCategorySchema, GetAllCategoriesQuerySchema } from "@/validators/categories";
import auth from "@/middlewares/auth";
import roleGuard from "@/middlewares/roleGuard";

const router = express.Router();

router.route("/").get(validator("query", GetAllCategoriesQuerySchema), getAll).post(auth, roleGuard(ROLES.MANAGER), validator("body", CreateCategorySchema), create);
router.route("/:id").put(auth, roleGuard(ROLES.MANAGER), validator("body", UpdateCategorySchema), update).delete(auth, roleGuard(ROLES.MANAGER), remove);

export default router;
