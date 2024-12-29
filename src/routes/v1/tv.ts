import express from "express";
import { getAll, getAllRaw, create, search, getOne, getOneById, update, getRelated, getComments, getDetails, like, dislike, save, unsave, shown, unshown } from "@/controllers/v1/tv";

import { ROLES } from "@/constants/roles";
import validator from "@/middlewares/validator";
import { CreateTvSchema, GetAllTvsQuerySchema, SearchTvsQuerySchame } from "@/validators/tv";
import { PaginationQuerySchema } from "@/validators/pagination";
import auth from "@/middlewares/auth";
import roleGuard from "@/middlewares/roleGuard";

const router = express.Router();

router.get("/", validator("query", GetAllTvsQuerySchema), getAll);
router.get("/all", auth, roleGuard(ROLES.MANAGER), validator("query", GetAllTvsQuerySchema), getAllRaw);
router.get("/search", validator("query", SearchTvsQuerySchame), search);
router.get("/:slug", getOne);
router.get("/:slug/related", getRelated);
router.get("/:slug/comments", validator("query", PaginationQuerySchema), getComments);
router.get("/:id/details", getDetails);

router.use(auth);

router.post("/:id/like", like);
router.delete("/:id/dislike", dislike);
router.post("/:id/save", save);
router.delete("/:id/unsave", unsave);

router.use(roleGuard(ROLES.MANAGER));

router.post("/", validator("body", CreateTvSchema), create);
router.route("/:id").put(validator("body", CreateTvSchema), update);
router.get("/:id/raw", getOneById);
router.patch("/:id/shown", shown);
router.patch("/:id/unshown", unshown);

export default router;
