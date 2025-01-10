import { Request, Response, NextFunction } from "express";

import { ErrorResponse } from "@/utils/responses";

const notFound = (req: Request, res: Response, next: NextFunction) => {
    ErrorResponse(res, 404, "the resource you requested could not be found.");
};

export default notFound;
