import { Request, Response } from "express";
import { sendSuccess } from "../../utils/response";
import { GetPromosQuery } from "./promo.schema";
import { fetchAllPromos } from "./promo.service";

export async function listPromos(req: Request, res: Response): Promise<void> {
  const query = req.query as unknown as GetPromosQuery;
  const { data, total, isFallback } = await fetchAllPromos(query);

  sendSuccess(
    res,
    isFallback
      ? "Daftar promo berhasil diambil (fallback data)"
      : "Daftar promo berhasil diambil",
    data,
    200,
    { total }
  );
}

