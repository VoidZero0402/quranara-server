import express from "express";
import { getAll, create, getOne, update, remove, getComments, getTopics } from "@/controllers/v1/courses";

import { ROLES } from "@/constants/roles";
import validator from "@/middlewares/validator";
import { CreateCourseSchema, UpdateCourseSchema } from "@/validators/courses";
import { PaginationQuerySchema } from "@/validators/pagination";
import auth from "@/middlewares/auth";
import roleGuard from "@/middlewares/roleGuard";

const router = express.Router();

router.route("/").get(getAll).post(auth, roleGuard(ROLES.MANAGER), validator("body", CreateCourseSchema), create);
router.route("/:id").put(auth, roleGuard(ROLES.MANAGER), validator("body", UpdateCourseSchema), update).delete(auth, roleGuard(ROLES.MANAGER), remove);
router.get("/:slug", getOne);
router.get("/:slug/comments", validator("query", PaginationQuerySchema), getComments);
router.get("/:id/topics", getTopics);

export default router;
