import { Request, Response } from "express";
import { sendError } from "../utils/response";

export function notFoundHandler(req: Request, res: Response): void {
  sendError(
    res,
    `Rute ${req.method} ${req.originalUrl} tidak ditemukan pada server PJLaundry.`,
    404
  );
}

