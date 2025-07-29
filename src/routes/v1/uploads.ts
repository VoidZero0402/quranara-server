import path from "node:path";
import express from "express";
import multer from "multer";
import { getPreSignedUrl, uploadFile } from "@/controllers/v1/uploads";

import validator from "@/middlewares/validator";
import { GetPreSignedUrlQuerySchema } from "@/validators/uploads";
import multerStorage from "@/utils/uploader";

const uploader = multer({ storage: multerStorage(path.join(process.cwd(), "public")) });

const router = express.Router();

router.get("/pre-signed-url", validator("query", GetPreSignedUrlQuerySchema), getPreSignedUrl);
router.post("/", uploader.single("file"), uploadFile);

export default router;
