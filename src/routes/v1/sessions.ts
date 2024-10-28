import express from "express";
import { create, update, updateOrder, getOne, remove } from "@/controllers/v1/sessions";

import { ROLES } from "@/constants/roles";
import validator from "@/middlewares/validator";
import {} from "@/validators/sessions";
import auth from "@/middlewares/auth";
import roleGuard from "@/middlewares/roleGuard";

const router = express.Router();

router.post("/", create);
router.route('/:id').put(update).delete(remove)
router.get('/:slug', getOne)
router.route('/:id/order').patch(updateOrder)

export default router;
