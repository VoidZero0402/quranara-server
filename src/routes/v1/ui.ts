import express from "express";
import { getMenus, getManagementPanelDatas } from "@/controllers/v1/ui";

import { ROLES } from "@/constants/roles";
import auth from "@/middlewares/auth";
import roleGuard from "@/middlewares/roleGuard";

const router = express.Router();

router.get("/menus", getMenus);

router.get("/m-panel", auth, roleGuard(ROLES.MANAGER), getManagementPanelDatas);

export default router;
