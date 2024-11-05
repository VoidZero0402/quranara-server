import path from "path";
import fs from "fs";
import multer from "multer";

import { BadRequestException } from "./exceptions";

export const createUploader = (destination: string, allowedTypes = /jpg|jpeg|png|webp/) => {
    const storage = multer.diskStorage({
        destination: (_, __, callback) => {
            callback(null, destination);
        },

        filename: (_, file, callback) => {
            const unique = `${Date.now()}-${Math.floor(Math.random() * 1e9)}`;
            const extension = path.extname(file.originalname);

            callback(null, `${unique}${extension}`);
        },
    });

    const fileFilter = (_: Express.Request, file: Express.Multer.File, callback: multer.FileFilterCallback) => {
        if (file.mimetype.match(allowedTypes)) {
            return callback(null, true);
        }

        callback(new BadRequestException("file type not allowed!"));
    };

    const uploader = multer({ storage, limits: { fileSize: 5_242_880 }, fileFilter });

    return uploader;
};
