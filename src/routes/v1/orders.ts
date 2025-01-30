import express from "express";
import { create, verify, getAll, getOne } from "@/controllers/v1/orders";

import { ROLES } from "@/constants/roles";
import validator from "@/middlewares/validator";
import { CreateOrderSchema } from "@/validators/orders";
import { PaginationQuerySchema } from "@/validators/pagination";
import auth from "@/middlewares/auth";
import roleGuard from "@/middlewares/roleGuard";

const router = express.Router();

router.get("/verify", verify);

router.use(auth);

router.post("/", validator("body", CreateOrderSchema), create);
router.get("/all", roleGuard(ROLES.MANAGER), validator("query", PaginationQuerySchema), getAll as any);
router.get("/check/:id", getOne);

export default router;
