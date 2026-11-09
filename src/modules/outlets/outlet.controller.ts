import { Request, Response } from "express";
import { sendSuccess } from "../../utils/response";
import { GetOutletsQuery } from "./outlet.schema";
import { fetchAllOutlets } from "./outlet.service";

export async function listOutlets(req: Request, res: Response): Promise<void> {
  const query = req.query as unknown as GetOutletsQuery;
  const { data, total, isFallback } = await fetchAllOutlets(query);

  sendSuccess(
    res,
    isFallback
      ? "Daftar cabang outlet berhasil diambil (fallback data)"
      : "Daftar cabang outlet berhasil diambil",
    data,
    200,
    { total }
  );
}

