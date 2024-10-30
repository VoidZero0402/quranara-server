import { NextFunction, Request, Response } from "express";
import multer from "multer";

import { BadRequestException, RequestTooLongException } from "@/utils/exceptions";

const uploader = (multerUploader: multer.Multer, method: "single" | "array", field: string, required?: boolean) => (req: Request, res: Response, next: NextFunction) => {
    try {
        const upload = multerUploader[method](field);

        upload(req, res, function (err) {
            try {
                if (err) {
                    if (err instanceof multer.MulterError) {
                        switch (err.code) {
                            case "LIMIT_FILE_SIZE": {
                                throw new RequestTooLongException("file to large", { error: err.message });
                            }

                            default: {
                                throw new BadRequestException(err.message, { error: err.message });
                            }
                        }
                    }

                    throw err;
                }

                if (required) {
                    if (method === "single") {
                        if (!req.file) {
                            throw new BadRequestException(`upload ${field} is required`);
                        }
                    } else if (method === "array") {
                        if (!req.files?.length) {
                            throw new BadRequestException(`upload ${field} is required`);
                        }
                    }
                }
            } catch (err) {
                next(err);
            }

            next();
        });
    } catch (err) {
        next(err);
    }
};

export default uploader;
