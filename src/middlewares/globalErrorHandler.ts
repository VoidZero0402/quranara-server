import { NextFunction, Request, Response } from "express";

import { Exception } from "@/utils/exceptions";
import { ErrorResponse } from "@/utils/responses";

const globalErrorHandler = (err: Error | Exception, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof Exception) {
        ErrorResponse(res, err.statusCode, err.message, err.data);
        return;
    }

    const message = err.message || "Internal Server Error";

    ErrorResponse(res, 500, message);
};

export default globalErrorHandler;
