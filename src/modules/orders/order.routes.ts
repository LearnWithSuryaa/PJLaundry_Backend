import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware";
import { validate } from "../../middleware/validate.middleware";
import {
  handleCreateOrder,
  handleGetMyOrders,
  handleGetOrderDetail,
} from "./order.controller";
import {
  createOrderBodySchema,
  getMyOrdersQuerySchema,
  getOrderDetailParamsSchema,
} from "./order.schema";

const router = Router();

router.post(
  "/orders",
  requireAuth,
  validate({ body: createOrderBodySchema }),
  handleCreateOrder
);

router.get(
  "/orders/me",
  requireAuth,
  validate({ query: getMyOrdersQuerySchema }),
  handleGetMyOrders
);

router.get(
  "/orders/:id",
  requireAuth,
  validate({ params: getOrderDetailParamsSchema }),
  handleGetOrderDetail
);

export default router;

