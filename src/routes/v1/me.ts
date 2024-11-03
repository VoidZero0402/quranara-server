import express from "express";
import { getSavedBlog, getSavedTv, getLikedBlog, getLikedTv } from "@/controllers/v1/me";

import validator from "@/middlewares/validator";
import { PaginationQuerySchema } from "@/validators/pagination";
import auth from "@/middlewares/auth";

const router = express.Router();

router.get("/saved-blog", auth, validator("query", PaginationQuerySchema), getSavedBlog);
router.get("/saved-tv", auth, validator("query", PaginationQuerySchema), getSavedTv);
router.get("/liked-blog", auth, validator("query", PaginationQuerySchema), getLikedBlog);
router.get("/liked-tv", auth, validator("query", PaginationQuerySchema), getLikedTv);

export default router;
