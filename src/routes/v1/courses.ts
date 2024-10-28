import express from "express";
import { getAll, create, getOne, update, remove, createTopic, updateTopic, removeTopic } from "@/controllers/v1/courses";

import { ROLES } from "@/constants/roles";
import { createUploader } from "@/utils/multer";
import validator from "@/middlewares/validator";
import { CreateCourseSchema, UpdateCourseSchema } from "@/validators/courses";
import auth from "@/middlewares/auth";
import roleGuard from "@/middlewares/roleGuard";
import uploader from "@/middlewares/uploader";

const router = express.Router();

const upload = createUploader("public/uploads/courses/covers");

router.route("/").get(getAll).post(auth, roleGuard(ROLES.MANAGER), uploader(upload, "single", "cover", true), validator("body", CreateCourseSchema), create);
router.route("/:id").get(getOne).put(auth, roleGuard(ROLES.MANAGER), uploader(upload, "single", "cover"), validator("body", UpdateCourseSchema), update).delete(auth, roleGuard(ROLES.MANAGER), remove);
router.post("/:id/topics", createTopic);
router.route("/:id/topics/:topicId").put(updateTopic).delete(removeTopic);

export default router;
