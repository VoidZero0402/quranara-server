import express from "express";
import { send, verify, getMe, refresh, logout } from "@/controllers/v1/auth";

const router = express.Router();

router.post("/send", send);
router.post("/verify", verify);
router.get("/me", getMe);
router.post("/refresh", refresh);
router.get("/logout", logout);

export default router;
