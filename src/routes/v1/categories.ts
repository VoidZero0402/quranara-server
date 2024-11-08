import express from "express";
import { getAll, create, update } from "@/controllers/v1/categories";

import { ROLES } from "@/constants/roles";
import validator from "@/middlewares/validator";
import { CreateCategorySchema, UpdateCategorySchema, GetAllCategoriesQuerySchema } from "@/validators/categories";
import auth from "@/middlewares/auth";
import roleGuard from "@/middlewares/roleGuard";

const router = express.Router();

router.get("/", validator("query", GetAllCategoriesQuerySchema), getAll);

router.use(auth, roleGuard(ROLES.MANAGER));

router.post("/", validator("body", CreateCategorySchema), create);
router.route("/:id").put(validator("body", UpdateCategorySchema), update)

export default router;
