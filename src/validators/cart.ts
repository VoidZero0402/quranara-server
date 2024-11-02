import { z } from "zod";
import { validateObjectId } from "@/utils/validations";

export const UpdateCartSchema = z.object({
    course: validateObjectId,
});

export type UpdateCartSchemaType = z.infer<typeof UpdateCartSchema>;
