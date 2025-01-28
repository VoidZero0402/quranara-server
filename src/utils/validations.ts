import { isValidObjectId, ObjectId } from "mongoose";
import { z } from "zod";

export const validateObjectId = z.custom<ObjectId>((val) => isValidObjectId(val), { message: "objectId is invalid" });

export const transformToSlug = (value: string) => value.replaceAll(" ", "-");

export const transformToUploadPath = (value: string, path: string) => {
    const isAbsolutePath = value.startsWith(path) || value.startsWith("https://");

    if (isAbsolutePath) {
        return value;
    }

    return `${path}/${value}`;
};
