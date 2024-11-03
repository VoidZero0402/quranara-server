import express from "express";
import { signup, send, loginWithOtp, loginWithEmail, getMe, logout } from "@/controllers/v1/auth";

import validator from "@/middlewares/validator";
import { SignupShcema, SendOtpSchema, LoginWithOtpSchema, LoginWithEmailSchema } from "@/validators/auth";
import auth from "@/middlewares/auth";

const router = express.Router();

router.post("/signup", validator("body", SignupShcema), signup);
router.post("/send-otp", validator("body", SendOtpSchema), send);
router.post("/login/with-otp", loginWithOtp);
router.post("/login/with-email", loginWithEmail);
router.get("/me", getMe);
router.get("/logout", logout);

export default router;
