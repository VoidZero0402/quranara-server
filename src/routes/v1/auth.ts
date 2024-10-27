import express from "express";
import { send, verify, getMe, refresh, logout } from "@/controllers/v1/auth";

import validator from '@/middlewares/validator'
import { SendOtpSchema, VerifyOtpSchema } from "@/validators/auth";
import auth from "@/middlewares/auth";

const router = express.Router();

router.post("/send", validator("body", SendOtpSchema), send);
router.post("/verify", validator('body', VerifyOtpSchema), verify);
router.get("/me", auth, getMe);
router.post("/refresh", refresh);
router.get("/logout", logout);

export default router;
