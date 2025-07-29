import { NextFunction, Request, Response } from "express";

import { generatePreSignedUrl } from "@/services/cloud-space";

import { GetPreSignedUrlQuerySchemaType } from "@/validators/uploads";

import { SuccessResponse } from "@/utils/responses";

export const getPreSignedUrl = async (req: Request<{}, {}, {}, GetPreSignedUrlQuerySchemaType>, res: Response, next: NextFunction) => {
    try {
        const { filename, type } = req.query;

        const uniqueKey = `${Date.now()}-${filename}`;

        const url = await generatePreSignedUrl(uniqueKey, type);

        SuccessResponse(res, 200, { url, filename: uniqueKey });
    } catch (err) {
        next(err);
    }
};

export const uploadFile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (req.file) {
            const url = `https://quranara.com/api/${req.file.originalname}`;
            SuccessResponse(res, 200, { url });
        }
    } catch (err) {
        next(err);
    }
};
