import { Request, Response } from "express";
import { sendError, sendSuccess } from "../../utils/response";
import { CreateOrderBody, GetMyOrdersQuery } from "./order.schema";
import {
  createOrder,
  fetchUserOrderById,
  fetchUserOrders,
} from "./order.service";

export async function handleCreateOrder(
  req: Request,
  res: Response
): Promise<void> {
  if (!req.user || !req.token) {
    sendError(res, "Otentikasi diperlukan untuk membuat pesanan.", 401);
    return;
  }

  try {
    const payload = req.body as CreateOrderBody;
    const order = await createOrder(req.token, payload);

    sendSuccess(res, "Pesanan berhasil dibuat.", order, 201);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Gagal memproses pembuatan pesanan";
    sendError(res, message, 400);
  }
}

export async function handleGetMyOrders(
  req: Request,
  res: Response
): Promise<void> {
  if (!req.user || !req.token) {
    sendError(res, "Otentikasi diperlukan.", 401);
    return;
  }

  try {
    const query = req.query as unknown as GetMyOrdersQuery;
    const { data, total } = await fetchUserOrders(
      req.token,
      req.user.id,
      query
    );

    const totalPages = Math.ceil(total / query.limit);

    sendSuccess(res, "Riwayat pesanan berhasil diambil.", data, 200, {
      total,
      page: query.page,
      limit: query.limit,
      totalPages,
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Gagal mengambil riwayat pesanan";
    sendError(res, message, 500);
  }
}

export async function handleGetOrderDetail(
  req: Request,
  res: Response
): Promise<void> {
  if (!req.user || !req.token) {
    sendError(res, "Otentikasi diperlukan.", 401);
    return;
  }

  try {
    const { id } = req.params;
    const order = await fetchUserOrderById(req.token, req.user.id, id);

    if (!order) {
      sendError(
        res,
        `Pesanan tidak ditemukan atau Anda tidak memiliki akses ke pesanan ini.`,
        404
      );
      return;
    }

    sendSuccess(res, "Detail pesanan berhasil diambil.", order);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Gagal mengambil detail pesanan";
    sendError(res, message, 500);
  }
}
