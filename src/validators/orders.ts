import { z } from "zod";

export const CreateOrderSchema = z.object({
    discountCode: z.string().min(1, { message: "discount code should not be empty" }).optional(),
});

export type CreateOrderSchemaType = z.infer<typeof CreateOrderSchema>;
