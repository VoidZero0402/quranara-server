import express from "express";
import { getAll, create, search, getOne, update, remove, getRelated } from "@/controllers/v1/blog";

import { ROLES } from "@/constants/roles";
import validator from "@/middlewares/validator";
import { CreateBlogSchema, CreateBlogQuerySchema, GetAllBlogsQuerySchema, SearchBlogsQuerySchame } from "@/validators/blog";
import auth from "@/middlewares/auth";
import roleGuard from "@/middlewares/roleGuard";

const router = express.Router();

router.route("/").get(validator("query", GetAllBlogsQuerySchema), getAll).post(auth, roleGuard(ROLES.MANAGER), validator("query", CreateBlogQuerySchema), validator("body", CreateBlogSchema), create);
router.get("/search", validator("query", SearchBlogsQuerySchame), search);
router.route("/:id").put(auth, roleGuard(ROLES.MANAGER), validator("body", CreateBlogSchema), update).delete(auth, roleGuard(ROLES.MANAGER), remove);
router.get("/:slug", getOne);
router.get("/:slug/related", getRelated);

export default router;
