import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";
import { BadRequestException } from "@/utils/exceptions";

type Type = "body" | "params" | "query";

const validator = (type: Type, schema: ZodSchema) => async (req: Request, res: Response, next: NextFunction) => {
    const raw = req[type];

    const { success, error, data } = await schema.safeParseAsync(raw);

    if (!success) {
        next(new BadRequestException(`Request ${type} is not valid!`, { errors: error.flatten().fieldErrors }));
    }

    if (type !== "params") {
        req[type] = data;
    }

    next();
};

export default validator;
