import { z } from "zod";

const types = ["image/jpeg", "image/png", "image/webp", "audio/mpeg", "audio/wav", "application/pdf", "application/zip", "application/x-compressed", "application/x-zip-compressed", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"] as const;

export const GetPreSignedUrlQuerySchema = z.object({
    filename: z.string({ required_error: "filename is required" }).min(1, { message: "filename should not be empty" }),
    type: z.enum(types, { message: "file type is not valid" }),
});

export type GetPreSignedUrlQuerySchemaType = z.infer<typeof GetPreSignedUrlQuerySchema>;
