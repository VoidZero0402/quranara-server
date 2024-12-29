import { isValidObjectId, ObjectId } from "mongoose";
import { z } from "zod";
import sanitizeHtml from "sanitize-html";

export const validateObjectId = z.custom<ObjectId>((val) => isValidObjectId(val), { message: "objectId is invalid" });

export const sanitizeHtmlContent = (val: string): string => {
    const clean = sanitizeHtml(val, {
        allowedTags: ["div", "span", "a", "h1", "h2", "h3", "h4", "ul", "li", "img"],
    });

    return clean;
};
