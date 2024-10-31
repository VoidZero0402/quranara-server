import express from "express";
import { getAll, create, search, getOne, update, remove, getRelated } from "@/controllers/v1/blog";

import { ROLES } from "@/constants/roles";
import validator from "@/middlewares/validator";
import { CreateBlogSchema, CreateBlogQuerySchema, GetAllBlogsQuerySchema, SearchBlogsQuerySchame } from "@/validators/blog";
import auth from "@/middlewares/auth";
import roleGuard from "@/middlewares/roleGuard";

const router = express.Router();

router.route("/").get(getAll).post(create);
router.get("/search", search);
router.route("/:id").put(update).delete(remove);
router.get("/:slug", getOne);
router.get("/:slug/related", getRelated);

export default router;
