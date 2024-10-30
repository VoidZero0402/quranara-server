import express, { Router } from "express";
import { getAll, create, update, remove } from "@/controllers/v1/categories";

import { ROLES } from "@/constants/roles";
import validator from "@/middlewares/validator";
import { CreateCategorySchema, UpdateCategorySchema, GetAllCategoriesQuerySchema } from "@/validators/categories";
import auth from "@/middlewares/auth";
import roleGuard from "@/middlewares/roleGuard";

const router = express.Router();

router.route("/").get(getAll).post(create);
router.route("/:id").put(update).delete(remove);

export default router;
