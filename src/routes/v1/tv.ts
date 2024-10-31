import express from "express";
import { getAll, create, search, getOne, update, remove, getRelated } from "@/controllers/v1/tv";

import { ROLES } from "@/constants/roles";
import validator from "@/middlewares/validator";
import { CreateTvSchema, GetAllTvsQuerySchema, SearchTvsQuerySchame } from "@/validators/tv";
import auth from "@/middlewares/auth";
import roleGuard from "@/middlewares/roleGuard";

const router = express.Router();

router.route("/").get(getAll).post(create);
router.get('/search', search)
router.route("/:id").get(getOne).put(update).delete(remove);
router.get("/:id/related", getRelated);

export default router;
