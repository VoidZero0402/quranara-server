import express from "express";
import { getAll, create, getOne, update, remove, createTopic, updateTopic, removeTopic } from "@/controllers/v1/courses";

const router = express.Router();

router.route("/").get(getAll).post(create);
router.route("/:id").get(getOne).put(update).delete(remove);
router.post("/:id/topics", createTopic);
router.route("/:id/topics/:topicId").put(updateTopic).delete(removeTopic);

export default router;
