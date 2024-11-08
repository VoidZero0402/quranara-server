import express from "express";
import { voute, getAll, create, getOne, update, remove } from "@/controllers/v1/poll";

import { ROLES } from "@/constants/roles";
import validator from "@/middlewares/validator";
import { CreatePollSchema, UpdatePollSchema, VoutePollSchema } from "@/validators/poll";
import { PaginationQuerySchema } from "@/validators/pagination";
import auth from "@/middlewares/auth";
import roleGuard from "@/middlewares/roleGuard";

const router = express.Router();

router.post("/:id/voute", voute);

router.use(auth, roleGuard(ROLES.MANAGER));

router.route("/").get(getAll).post(create);
router.route("/:id").get(getOne).put(update).delete(remove);

export default router;
