import { Request } from "express";
import { Document, ObjectId } from "mongoose";
import { IUser } from "@/models/User";

export type UserDocument = Document<unknown, {}, IUser> & IUser & { _id: ObjectId };

export type RequestWithUser = Request & { user: UserDocument };
