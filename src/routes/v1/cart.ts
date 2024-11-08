import express from "express";
import { getCart, updateCart, removeItem } from "@/controllers/v1/cart";

import validator from "@/middlewares/validator";
import { UpdateCartSchema } from "@/validators/cart";
import auth from "@/middlewares/auth";

const router = express.Router();

router.use(auth);

router.get("/", getCart);
router.patch("/add", validator("body", UpdateCartSchema), updateCart);
router.patch("/remove", validator("body", UpdateCartSchema), removeItem);

export default router;
