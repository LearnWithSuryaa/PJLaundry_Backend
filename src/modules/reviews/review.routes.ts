import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware";
import { validate } from "../../middleware/validate.middleware";
import { listReviews, submitReview } from "./review.controller";
import {
  createReviewBodySchema,
  getReviewsQuerySchema,
} from "./review.schema";

const router = Router();

router.get("/reviews", validate({ query: getReviewsQuerySchema }), listReviews);

router.post(
  "/reviews",
  requireAuth,
  validate({ body: createReviewBodySchema }),
  submitReview
);

export default router;

