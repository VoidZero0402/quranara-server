import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";

import { BadRequestException } from "@/utils/exceptions";

type Type = "body" | "params" | "query";

const validator = (type: Type, schema: ZodSchema) => async (req: Request, res: Response, next: NextFunction) => {
    try {
        const raw = req[type];

        const { success, error, data } = await schema.safeParseAsync(raw);

        if (!success) {
            throw new BadRequestException(`Request ${type} is not valid!`, { errors: error.flatten().fieldErrors, key: "validation" });
        }

        if (type !== "params") {
            req[type] = data;
        }

        next();
    } catch (err) {
        next(err);
    }
};

export default validator;
