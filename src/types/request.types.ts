import { Request } from "express";
import { UserDocument } from "@/models/User";

export type RequestWithUser<P = any, ResBody = any, ReqBody = any, ReqQuery = any, Locals extends Record<string, any> = Record<string, any>> = Request<P, ReqBody, ReqBody, ReqQuery, Locals> & { user: UserDocument };
