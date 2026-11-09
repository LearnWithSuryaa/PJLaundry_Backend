import { Request, Response } from "express";
import { sendError, sendSuccess } from "../../utils/response";
import { CreateReviewBody, GetReviewsQuery } from "./review.schema";
import { createNewReview, fetchPublishedReviews } from "./review.service";

export async function listReviews(req: Request, res: Response): Promise<void> {
  const query = req.query as unknown as GetReviewsQuery;
  const { data, total, isFallback } = await fetchPublishedReviews(query);

  const totalPages = Math.ceil(total / query.limit);

  sendSuccess(
    res,
    isFallback
      ? "Ulasan pelanggan berhasil diambil (fallback data)"
      : "Ulasan pelanggan berhasil diambil",
    data,
    200,
    {
      total,
      page: query.page,
      limit: query.limit,
      totalPages,
    }
  );
}

export async function submitReview(req: Request, res: Response): Promise<void> {
  if (!req.user || !req.token) {
    sendError(res, "Otentikasi diperlukan untuk menambahkan ulasan.", 401);
    return;
  }

  try {
    const payload = req.body as CreateReviewBody;
    const review = await createNewReview(req.token, req.user.id, payload);

    sendSuccess(res, "Ulasan berhasil dikirimkan.", review, 201);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Gagal mengirim ulasan";
    sendError(res, message, 400);
  }
}

