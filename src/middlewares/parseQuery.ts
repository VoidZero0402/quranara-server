import { NextFunction, Request, Response } from "express";

const parseQuery = async (req: Request, res: Response, next: NextFunction) => {
    try {
        for (const key in req.query) {
            if (req.query[key].includes(",")) {
                req.query[key] = req.query[key].split(",");
            }
        }

        next();
    } catch (err) {
        next(err);
    }
};

export default parseQuery;
