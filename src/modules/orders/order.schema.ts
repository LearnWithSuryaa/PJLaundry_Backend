import { z } from "zod";

export const orderItemInputSchema = z.object({
  service_id: z.string().min(1, "Service ID is required"),
  quantity: z.number().positive("Quantity must be greater than 0"),
  notes: z.string().max(255).optional(),
});

export const createOrderBodySchema = z.object({
  outlet_id: z.string().uuid("Invalid Outlet UUID").optional(),
  pickup_address: z.string().min(5, "Alamat penjemputan minimal 5 karakter"),
  pickup_date: z.string().min(1, "Tanggal penjemputan harus dipilih"),
  pickup_slot: z.string().min(1, "Slot waktu penjemputan harus dipilih"),
  order_notes: z.string().max(500).optional(),
  items: z
    .array(orderItemInputSchema)
    .min(1, "Minimal 1 layanan harus dipilih")
    .max(50, "Maksimal 50 layanan dapat dipesan"),
});

export const getMyOrdersQuerySchema = z.object({
  status: z
    .enum([
      "all",
      "pending",
      "confirmed",
      "pickup_scheduled",
      "processing",
      "completed",
      "cancelled",
    ])
    .optional()
    .default("all"),
  page: z
    .string()
    .optional()
    .default("1")
    .transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val) && val > 0, { message: "Page must be a positive integer" }),
  limit: z
    .string()
    .optional()
    .default("10")
    .transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val) && val > 0 && val <= 50, {
      message: "Limit must be between 1 and 50",
    }),
});

export const getOrderDetailParamsSchema = z.object({
  id: z.string().uuid("Invalid Order UUID format"),
});

export type CreateOrderBody = z.infer<typeof createOrderBodySchema>;
export type GetMyOrdersQuery = z.infer<typeof getMyOrdersQuerySchema>;
export type GetOrderDetailParams = z.infer<typeof getOrderDetailParamsSchema>;
