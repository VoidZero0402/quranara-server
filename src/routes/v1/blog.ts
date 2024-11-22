import express from "express";
import { getAll, create, search, getOne, update, getRelated, getComments, getDetails, like, dislike, save, unsave, shown, unshown, getAllDrafted, getOneDrafted } from "@/controllers/v1/blog";

import { ROLES } from "@/constants/roles";
import validator from "@/middlewares/validator";
import { CreateBlogSchema, CreateBlogQuerySchema, GetAllBlogsQuerySchema, SearchBlogsQuerySchame } from "@/validators/blog";
import { PaginationQuerySchema } from "@/validators/pagination";
import auth from "@/middlewares/auth";
import roleGuard from "@/middlewares/roleGuard";

const router = express.Router();

router.get("/", validator("query", GetAllBlogsQuerySchema), getAll);
router.get("/search", validator("query", SearchBlogsQuerySchame), search);
router.get("/:slug", getOne);
router.get("/:slug/related", getRelated);
router.get("/:slug/comments", validator("query", PaginationQuerySchema), getComments);
router.get("/:id/details", getDetails)

router.use(auth);

router.post("/:id/like", like);
router.delete("/:id/dislike", dislike);
router.post("/:id/save", save);
router.delete("/:id/unsave", unsave);

router.use(roleGuard(ROLES.MANAGER));

router.post("/", validator("query", CreateBlogQuerySchema), validator("body", CreateBlogSchema), create);
router.get("/drafted", validator("query", PaginationQuerySchema), getAllDrafted);
router.get("/drafted/:id", getOneDrafted);
router.route("/:id").put(validator("query", CreateBlogQuerySchema), validator("body", CreateBlogSchema), update);
router.patch("/:id/shown", shown);
router.patch("/:id/unshown", unshown);

export default router;
