import express from "express";
import { getMenus } from "@/controllers/v1/ui";

const router = express.Router();

router.get("/menus", getMenus);

export default router;
