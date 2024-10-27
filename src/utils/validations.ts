import { isValidObjectId, ObjectId } from "mongoose";
import { z } from "zod";

export const validateObjectId = z.custom<ObjectId>((val) => isValidObjectId(val), { message: "objectId is invalid" });
