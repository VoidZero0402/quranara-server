import express from "express";
import { getAll, create, update, remove, available } from "@/controllers/v1/discounts";

import { ROLES } from "@/constants/roles";
import validator from "@/middlewares/validator";
import { CreateDiscountSchema, AvailableDiscountQuerySchema } from "@/validators/discounts";
import { PaginationQuerySchema } from "@/validators/pagination";
import auth from "@/middlewares/auth";
import roleGuard from "@/middlewares/roleGuard";

const router = express.Router();

router.route("/").get(auth, roleGuard(ROLES.MANAGER), validator("query", PaginationQuerySchema), getAll).post(auth, roleGuard(ROLES.MANAGER), validator("body", CreateDiscountSchema), create);
router.route("/:id").put(auth, roleGuard(ROLES.MANAGER), validator("body", CreateDiscountSchema), update).delete(auth, roleGuard(ROLES.MANAGER), remove);
router.get("/available", auth, validator("query", AvailableDiscountQuerySchema), available);

export default router;
