import express from "express";
import { getPreSignedUrl } from "@/controllers/v1/uploads";

import validator from "@/middlewares/validator";
import { GetPreSignedUrlQuerySchema } from "@/validators/uploads";

const router = express.Router();

router.get("/pre-signed-url", validator("query", GetPreSignedUrlQuerySchema), getPreSignedUrl);

export default router;
