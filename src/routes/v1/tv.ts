import express from "express";
import { getAll, create, search, getOne, update, remove, getRelated, getComments, like, dislike, save, unsave } from "@/controllers/v1/tv";

import { ROLES } from "@/constants/roles";
import validator from "@/middlewares/validator";
import { CreateTvSchema, GetAllTvsQuerySchema, SearchTvsQuerySchame } from "@/validators/tv";
import { PaginationQuerySchema } from "@/validators/pagination";
import auth from "@/middlewares/auth";
import roleGuard from "@/middlewares/roleGuard";

const router = express.Router();

router.route("/").get(validator("query", GetAllTvsQuerySchema), getAll).post(auth, roleGuard(ROLES.MANAGER), validator("body", CreateTvSchema), create);
router.get("/search", validator("query", SearchTvsQuerySchame), search);
router.route("/:id").put(auth, roleGuard(ROLES.MANAGER), validator("body", CreateTvSchema), update).delete(auth, roleGuard(ROLES.MANAGER), remove);
router.get("/:slug", getOne);
router.get("/:slug/related", getRelated);
router.get("/:slug/comments", validator("query", PaginationQuerySchema), getComments);
router.post("/:id/like", auth, like);
router.delete("/:id/dislike", auth, dislike);
router.post("/:id/save", auth, save);
router.delete("/:id/unsave", auth, unsave);

export default router;
