import express from "express";
import { getAllShown, getAll, getOne, create, update, remove, shown, unshown } from "@/controllers/v1/news";

import { ROLES } from "@/constants/roles";
import validator from "@/middlewares/validator";
import { CreateNewsSchema, UpdateNewsSchema } from "@/validators/news";
import { PaginationQuerySchema } from "@/validators/pagination";
import auth from "@/middlewares/auth";
import roleGuard from "@/middlewares/roleGuard";

const router = express.Router();

router.get("/", getAllShown);

router.use(auth, roleGuard(ROLES.MANAGER));

router.post("/", validator("body", CreateNewsSchema), create);
router.get("/all", validator("query", PaginationQuerySchema), getAll);
router.route("/:id").get(getOne).put(validator("body", UpdateNewsSchema), update).delete(remove);
router.patch("/:id/shown", shown);
router.patch("/:id/unshown", unshown);

export default router;
