import express from "express";
import { getAll, create, getAllBan, banUser, unbanUser, signingCourse } from "@/controllers/v1/users";

import { ROLES } from "@/constants/roles";
import validator from "@/middlewares/validator";
import { CreateUserSchema, BanUserSchema, UnbanUserSchema, SigningCourseSchema, GetAllUsersQuerySchema } from "@/validators/users";
import { PaginationQuerySchema } from "@/validators/pagination";
import auth from "@/middlewares/auth";
import roleGuard from "@/middlewares/roleGuard";

const router = express.Router();

router.use(auth, roleGuard(ROLES.MANAGER));

router.route("/").get(validator("query", GetAllUsersQuerySchema), getAll as any).post(validator("body", CreateUserSchema), create);
router.route("/ban").get(validator("query", PaginationQuerySchema), getAllBan as any).post(validator("body", BanUserSchema), banUser);
router.post("/unban", validator("body", UnbanUserSchema), unbanUser);
router.post("/signing-course", validator("body", SigningCourseSchema), signingCourse);

export default router;
