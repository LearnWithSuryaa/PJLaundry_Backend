import { z } from "zod";

export const getServicesQuerySchema = z.object({
  category: z.enum(["all", "kiloan", "satuan", "special"]).optional().default("all"),
  search: z.string().optional(),
  page: z
    .string()
    .optional()
    .default("1")
    .transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val) && val > 0, { message: "Page must be a positive integer" }),
  limit: z
    .string()
    .optional()
    .default("20")
    .transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val) && val > 0 && val <= 100, {
      message: "Limit must be between 1 and 100",
    }),
});

export const getServiceDetailParamsSchema = z.object({
  id: z.string().min(1, "Service ID is required"),
});

export type GetServicesQuery = z.infer<typeof getServicesQuerySchema>;
export type GetServiceDetailParams = z.infer<typeof getServiceDetailParamsSchema>;

