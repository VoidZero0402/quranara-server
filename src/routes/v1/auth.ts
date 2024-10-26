import express from "express";
import { send, verify, getMe, refresh, logout } from "@/controllers/v1/auth";

import validator from '@/middlewares/validator'
import { SendOtpSchema } from "@/validators/auth";

const router = express.Router();

router.post("/send", validator("body", SendOtpSchema), send);
router.post("/verify", verify);
router.get("/me", getMe);
router.post("/refresh", refresh);
router.get("/logout", logout);

export default router;
