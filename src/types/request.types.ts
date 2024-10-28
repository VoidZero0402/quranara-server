import { Request } from "express";
import * as core from "express-serve-static-core";
import { Document, ObjectId } from "mongoose";
import { IUser } from "@/models/User";

export type UserDocument = Document<unknown, {}, IUser> & IUser & { _id: ObjectId };

export type RequestWithUser<P = core.ParamsDictionary, ResBody = any, ReqBody = any, ReqQuery = qs.ParsedQs, Locals extends Record<string, any> = Record<string, any>> = Request<P, ReqBody, ReqBody, ReqQuery, Locals> & { user: UserDocument };
