import { createScopedSupabaseClient, supabasePublic } from "../../config/supabase";
import { ReviewRow } from "../../types/database.types";
import { CreateReviewBody, GetReviewsQuery } from "./review.schema";

export const STATIC_REVIEWS_FALLBACK: ReviewRow[] = [
  {
    id: "r1111111-1111-1111-1111-111111111111",
    user_id: "u1111111-1111-1111-1111-111111111111",
    order_id: null,
    rating: 5,
    comment: "Hasil cuci kiloan wangi tahan lama, setrika uap rapi sekali!",
    user_display_name: "Budi Santoso",
    is_published: true,
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: "r2222222-2222-2222-2222-222222222222",
    user_id: "u2222222-2222-2222-2222-222222222222",
    order_id: null,
    rating: 5,
    comment: "Layanan express 24 jam sangat membantu saat ada urusan kantor mendesak.",
    user_display_name: "Siti Rahma",
    is_published: true,
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
];

export async function fetchPublishedReviews(query: GetReviewsQuery): Promise<{
  data: ReviewRow[];
  total: number;
  isFallback?: boolean;
}> {
  const { page, limit } = query;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  try {
    const { data, count, error } = await supabasePublic
      .from("reviews")
      .select("*", { count: "exact" })
      .eq("is_published", true)
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error || !data) {
      return {
        data: STATIC_REVIEWS_FALLBACK,
        total: STATIC_REVIEWS_FALLBACK.length,
        isFallback: true,
      };
    }

    return {
      data: data as ReviewRow[],
      total: count ?? data.length,
      isFallback: false,
    };
  } catch {
    return {
      data: STATIC_REVIEWS_FALLBACK,
      total: STATIC_REVIEWS_FALLBACK.length,
      isFallback: true,
    };
  }
}

export async function createNewReview(
  token: string,
  userId: string,
  payload: CreateReviewBody
): Promise<ReviewRow> {
  const client = createScopedSupabaseClient(token);

  const newRow = {
    user_id: userId,
    order_id: payload.order_id || null,
    rating: payload.rating,
    comment: payload.comment,
    user_display_name: payload.user_display_name || "Pelanggan PJLaundry",
    is_published: true,
  };

  const { data, error } = await client
    .from("reviews")
    .insert(newRow)
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(error?.message || "Gagal menyimpan ulasan pelanggan");
  }

  return data as ReviewRow;
}
