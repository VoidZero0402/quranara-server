import express from "express";
import { getAll, create, update, remove, available } from "@/controllers/v1/discounts";

import { ROLES } from "@/constants/roles";
import validator from "@/middlewares/validator";
import { CreateDiscountSchema, UpdateDiscountSchema, AvailableDiscountQuerySchema } from "@/validators/discounts";
import { PaginationQuerySchema } from "@/validators/pagination";
import auth from "@/middlewares/auth";
import roleGuard from "@/middlewares/roleGuard";

const router = express.Router();

router.use(auth);

router.get("/available", validator("query", AvailableDiscountQuerySchema), available);

router.use(roleGuard(ROLES.MANAGER));

router.route("/").get(validator("query", PaginationQuerySchema), getAll).post(validator("body", CreateDiscountSchema), create);
router.route("/:id").put(validator("body", UpdateDiscountSchema), update).delete(remove);

export default router;
