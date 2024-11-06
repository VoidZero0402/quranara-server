import express from "express";
import { getAll, create, getOne, update, getComments, getTopics, shown, unshown, updateOrder } from "@/controllers/v1/courses";

import { ROLES } from "@/constants/roles";
import validator from "@/middlewares/validator";
import { CreateCourseSchema, UpdateCourseSchema, UpdateCourseOrderSchema } from "@/validators/courses";
import { PaginationQuerySchema } from "@/validators/pagination";
import auth from "@/middlewares/auth";
import roleGuard from "@/middlewares/roleGuard";

const router = express.Router();

router.route("/").get(validator("query", PaginationQuerySchema), getAll).post(auth, roleGuard(ROLES.MANAGER), validator("body", CreateCourseSchema), create);
router.put("/:id", auth, roleGuard(ROLES.MANAGER), validator("body", UpdateCourseSchema), update);
router.get("/:slug", getOne);
router.get("/:slug/comments", validator("query", PaginationQuerySchema), getComments);
router.get("/:id/topics", getTopics);
router.patch("/:id/shown", auth, roleGuard(ROLES.MANAGER), shown);
router.patch("/:id/unshown", auth, roleGuard(ROLES.MANAGER), unshown);
router.patch("/:id/order", auth, roleGuard(ROLES.MANAGER), validator("body", UpdateCourseOrderSchema), updateOrder);

export default router;
