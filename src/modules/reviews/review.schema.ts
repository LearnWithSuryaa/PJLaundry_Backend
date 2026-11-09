import { z } from "zod";

export const getReviewsQuerySchema = z.object({
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

export const createReviewBodySchema = z.object({
  order_id: z.string().uuid("Invalid Order UUID").optional(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(3, "Komentar minimal 3 karakter").max(500),
  user_display_name: z.string().max(100).optional(),
});

export type GetReviewsQuery = z.infer<typeof getReviewsQuerySchema>;
export type CreateReviewBody = z.infer<typeof createReviewBodySchema>;

