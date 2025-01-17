import express from "express";
import { getUnseenNotifications, getLastUnseenNotification, getSeenNotifications, getNotificationsCount, getAllNotifications, sendAll, sendCourseRegisters, sendOne, update, remove, seen } from "@/controllers/v1/notifications";

import { ROLES } from "@/constants/roles";
import validator from "@/middlewares/validator";
import { CreateNotificationSchema, SendAllNotificationSchema, SendCourseRegistersNotificationSchema, SendOneNotificationSchema } from "@/validators/notifications";
import { PaginationQuerySchema } from "@/validators/pagination";
import auth from "@/middlewares/auth";
import roleGuard from "@/middlewares/roleGuard";

const router = express.Router();

router.use(auth);

router.get("/unseen", getUnseenNotifications);
router.get("/unseen/last", getLastUnseenNotification);
router.get("/seen", getSeenNotifications);
router.get("/count", getNotificationsCount);
router.patch("/:id/seen", seen);

router.use(roleGuard(ROLES.MANAGER));

router.get("/all", validator("query", PaginationQuerySchema), getAllNotifications as any);
router.post("/send-all", validator("body", SendAllNotificationSchema), sendAll);
router.post("/send-course-registers", validator("body", SendCourseRegistersNotificationSchema), sendCourseRegisters);
router.post("/send-one", validator("body", SendOneNotificationSchema), sendOne);
router.route("/:id").put(validator("body", CreateNotificationSchema), update).delete(remove);

export default router;
