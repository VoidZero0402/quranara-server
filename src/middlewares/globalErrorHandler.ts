import { NextFunction, Request, Response } from "express";

import { Exception } from "@/utils/exceptions";
import { ErrorResponse } from "@/utils/responses";
import mongoose from "mongoose";

const globalErrorHandler = (err: Error | Exception, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof Exception) {
        ErrorResponse(res, err.statusCode, err.message, err.data);
        return;
    }

    if (err instanceof mongoose.Error.CastError) {
        ErrorResponse(res, 400, "objectId is not valid");
        return;
    }

    if (err instanceof mongoose.Error.ValidationError) {
        ErrorResponse(res, 400, "database validation failed");
        return;
    }

    const message = err.message || "Internal Server Error";

    ErrorResponse(res, 500, message);
};

export default globalErrorHandler;
