import { Request, Response } from "express";
import { sendError, sendSuccess } from "../../utils/response";
import { GetServicesQuery } from "./service.schema";
import { fetchAllServices, fetchServiceById } from "./service.service";

export async function listServices(req: Request, res: Response): Promise<void> {
  const query = req.query as unknown as GetServicesQuery;
  const { data, total, isFallback } = await fetchAllServices(query);

  const totalPages = Math.ceil(total / query.limit);

  sendSuccess(
    res,
    isFallback
      ? "Katalog layanan berhasil diambil (fallback data)"
      : "Katalog layanan berhasil diambil",
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

export async function getServiceDetail(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const service = await fetchServiceById(id);

  if (!service) {
    sendError(res, `Layanan dengan ID '${id}' tidak ditemukan.`, 404);
    return;
  }

  sendSuccess(res, "Rincian layanan berhasil diambil", service);
}

