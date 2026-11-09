import { z } from "zod";

export const getOutletsQuerySchema = z.object({
  search: z.string().optional(),
});

export type GetOutletsQuery = z.infer<typeof getOutletsQuerySchema>;

