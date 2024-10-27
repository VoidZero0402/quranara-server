import { NextFunction, Request, Response } from "express";
import { Role } from "@/models/User";
import { RequestWithUser } from "@/types/request.types";
import { ForbiddenException } from "@/utils/exceptions";

const roleGuard = (role: Role) => (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!((req as RequestWithUser).user.role === role)) {
            throw new ForbiddenException("you can not access to this route");
        }

        next();
    } catch (err) {
        next(err);
    }
};

export default roleGuard;
