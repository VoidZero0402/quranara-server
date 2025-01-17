import express from "express";
import { getAll, getAllRaw, create, search, getOne, getOneById, update, getRelated, getComments, getDetails, like, dislike, save, unsave, shown, unshown } from "@/controllers/v1/blog";

import { ROLES } from "@/constants/roles";
import validator from "@/middlewares/validator";
import { CreateBlogSchema, GetAllBlogsQuerySchema, SearchBlogsQuerySchame } from "@/validators/blog";
import { PaginationQuerySchema } from "@/validators/pagination";
import auth from "@/middlewares/auth";
import roleGuard from "@/middlewares/roleGuard";

const router = express.Router();

router.get("/", validator("query", GetAllBlogsQuerySchema), getAll as any);
router.get("/all", auth, roleGuard(ROLES.MANAGER), validator("query", GetAllBlogsQuerySchema), getAllRaw as any);
router.get("/search", validator("query", SearchBlogsQuerySchame), search as any);
router.get("/:slug", getOne);
router.get("/:slug/related", getRelated);
router.get("/:slug/comments", validator("query", PaginationQuerySchema), getComments as any);
router.get("/:id/details", getDetails);

router.use(auth);

router.post("/:id/like", like);
router.delete("/:id/dislike", dislike);
router.post("/:id/save", save);
router.delete("/:id/unsave", unsave);

router.use(roleGuard(ROLES.MANAGER));

router.post("/", validator("body", CreateBlogSchema), create);
router.route("/:id").put(validator("body", CreateBlogSchema), update);
router.get("/:id/raw", getOneById);
router.patch("/:id/shown", shown);
router.patch("/:id/unshown", unshown);

export default router;
