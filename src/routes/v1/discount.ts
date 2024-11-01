import express from "express";
import { getAll, create, update, remove, available } from "@/controllers/v1/discount";

import { ROLES } from "@/constants/roles";
import validator from "@/middlewares/validator";
import { CreateDiscountSchema } from "@/validators/discount";
import auth from "@/middlewares/auth";
import roleGuard from "@/middlewares/roleGuard";

const router = express.Router();

router.route('/').get(getAll).post(create)
router.route("/:id").put(update).delete(remove)
router.get('/available', available)

export default router;