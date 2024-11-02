import express from "express";
import { getCart, updateCart, removeItem } from "@/controllers/v1/cart";

import validator from "@/middlewares/validator";
import { UpdateCartSchema } from "@/validators/cart";
import auth from "@/middlewares/auth";

const router = express.Router();

router.get("/", auth, getCart);
router.patch("/add", auth, validator("body", UpdateCartSchema), updateCart);
router.patch("/remove", auth, validator("body", UpdateCartSchema), removeItem);

export default router;
