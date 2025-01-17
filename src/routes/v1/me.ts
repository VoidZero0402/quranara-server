import express from "express";
import { updateAccount, changePassword, getCourses, getLastCourses, getSavedBlog, getSavedTv, getLikedBlog, getLikedTv } from "@/controllers/v1/me";

import validator from "@/middlewares/validator";
import { UpdateAccountSchema, ChangePasswordSchema } from "@/validators/me";
import { PaginationQuerySchema } from "@/validators/pagination";
import auth from "@/middlewares/auth";

const router = express.Router();

router.use(auth);

router.put("/update-account", validator("body", UpdateAccountSchema), updateAccount);
router.patch("/change-password", validator("body", ChangePasswordSchema), changePassword);
router.get("/courses", getCourses)
router.get("/last-courses", getLastCourses)
router.get("/saved-blog", validator("query", PaginationQuerySchema), getSavedBlog as any);
router.get("/saved-tv", validator("query", PaginationQuerySchema), getSavedTv as any);
router.get("/liked-blog", validator("query", PaginationQuerySchema), getLikedBlog as any);
router.get("/liked-tv", validator("query", PaginationQuerySchema), getLikedTv as any);

export default router;
