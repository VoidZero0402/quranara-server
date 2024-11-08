import { Request } from "express";
import { UserDocument } from "@/models/User";

export interface AuthenticatedRequest<P = any, ResBody = any, ReqBody = any, ReqQuery = any> extends Request<P, ResBody, ReqBody, ReqQuery> {
    user: UserDocument;
}

export type RequestParamsWithID = { id: string }

export type RequestParamsWithSlug = { slug: string }