import express from "express";
import { create, message, answer } from "@/controllers/v1/questions";

import { ROLES } from "@/constants/roles";
import validator from "@/middlewares/validator";
import {  } from "@/validators/questions";
import auth from "@/middlewares/auth";
import roleGuard from "@/middlewares/roleGuard";

const router = express.Router();

router.post('/', create)
router.post('/:id/message', message)
router.post('/:id/answer', answer)

export default router;
