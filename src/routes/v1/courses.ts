import express from "express";
import { getAll, getAllRaw, getAllSummary, create, search, getOne, getOneById, update, getComments, getTopics, checkAccess, shown, unshown, updateOrder, applyDiscountAll, removeDiscountAll } from "@/controllers/v1/courses";

import { ROLES } from "@/constants/roles";
import validator from "@/middlewares/validator";
import { CreateCourseSchema, UpdateCourseSchema, UpdateCourseOrderSchema, GetAllCoursesQuerySchema, SearchCoursesQuerySchame, DiscountAllSchema } from "@/validators/courses";
import { PaginationQuerySchema } from "@/validators/pagination";
import auth from "@/middlewares/auth";
import roleGuard from "@/middlewares/roleGuard";

const router = express.Router();

router.get("/", validator("query", GetAllCoursesQuerySchema), getAll);
router.get("/all", validator("query", GetAllCoursesQuerySchema), getAllRaw);
router.get("/summary", getAllSummary);
router.get("/search", validator("query", SearchCoursesQuerySchame), search);
router.get("/:slug", getOne);
router.get("/:slug/comments", validator("query", PaginationQuerySchema), getComments);
router.get("/:slug/topics", getTopics);
router.get("/:id/check-access", checkAccess);

router.use(auth, roleGuard(ROLES.MANAGER));

router.post("/", validator("body", CreateCourseSchema), create);
router.put("/:id", validator("body", UpdateCourseSchema), update);
router.get("/:id/raw", getOneById);
router.patch("/:id/shown", shown);
router.patch("/:id/unshown", unshown);
router.patch("/:id/order", validator("body", UpdateCourseOrderSchema), updateOrder);
router.patch("/all/discount/apply", validator("body", DiscountAllSchema), applyDiscountAll);
router.patch("/all/discount/remove", removeDiscountAll);

export default router;
