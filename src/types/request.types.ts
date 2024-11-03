import { Request } from "express";
import * as core from "express-serve-static-core";
import { UserDocument } from "@/models/User";

export type RequestWithUser<P = core.ParamsDictionary, ResBody = any, ReqBody = any, ReqQuery = qs.ParsedQs, Locals extends Record<string, any> = Record<string, any>> = Request<P, ReqBody, ReqBody, ReqQuery, Locals> & { user: UserDocument };
