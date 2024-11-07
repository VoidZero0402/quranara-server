import express from "express";
import { getAll, create, banUser, unbanUser, signingCourse } from "@/controllers/v1/users";

import { ROLES } from "@/constants/roles";
import validator from "@/middlewares/validator";
import { CreateUserSchema, BanUserSchema, UnbanUserSchema, SigningCourseSchema } from "@/validators/users";
import auth from "@/middlewares/auth";
import roleGuard from "@/middlewares/roleGuard";

const router = express.Router();

router.use(auth, roleGuard(ROLES.MANAGER));

router.route("/").get(getAll).post(create);
router.post("/ban", banUser);
router.post("/unban", unbanUser);
router.post("/:id/signing-course", signingCourse);

export default router;
