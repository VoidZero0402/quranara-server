import express from "express";
import { signup, sendOtp, loginWithOtp, loginWithEmail, getMe, logout } from "@/controllers/v1/auth";

import validator from "@/middlewares/validator";
import { SignupShcema, SendOtpSchema, LoginWithOtpSchema, LoginWithEmailSchema } from "@/validators/auth";
import auth from "@/middlewares/auth";

const router = express.Router();

router.post("/signup", signup);
router.post("/send-otp", sendOtp);
router.post("/login/with-otp", loginWithOtp);
router.post("/login/with-email", loginWithEmail);
router.get("/me", getMe);
router.get("/logout", logout);

export default router;
