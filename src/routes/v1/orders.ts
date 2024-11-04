import express from "express";
import { create, verify, getAll } from "@/controllers/v1/orders";

import { ROLES } from "@/constants/roles";
import validator from "@/middlewares/validator";
import { CreateOrderSchema } from "@/validators/orders";
import { PaginationQuerySchema } from "@/validators/pagination";
import auth from "@/middlewares/auth";
import roleGuard from "@/middlewares/roleGuard";

const router = express.Router();

router.use(auth);

router.post("/", create);
router.get("/verify", verify);
router.get("/all", getAll);

export default router;
