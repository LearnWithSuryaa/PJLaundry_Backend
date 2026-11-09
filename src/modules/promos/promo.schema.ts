import { z } from "zod";

export const getPromosQuerySchema = z.object({
  activeOnly: z
    .string()
    .optional()
    .default("true")
    .transform((val) => val === "true"),
});

export type GetPromosQuery = z.infer<typeof getPromosQuerySchema>;

