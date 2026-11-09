import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { env } from "../config/env";
import { sendError } from "../utils/response";

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void {
  // 1. Zod Validation Errors
  if (err instanceof ZodError) {
    const formattedErrors = err.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
    }));
    sendError(res, "Validasi request gagal.", 400, formattedErrors);
    return;
  }

  // 2. SyntaxError (e.g. malformed JSON body)
  if (err instanceof SyntaxError && "body" in err) {
    sendError(res, "Format payload JSON tidak valid.", 400);
    return;
  }

  // 3. Generic Error Logging
  const errorMessage = err instanceof Error ? err.message : "Internal Server Error";
  console.error(`[Server Error] [${req.method} ${req.url}]:`, err);

  // 4. Secure Production Response (hide internal traces)
  const clientMessage =
    env.NODE_ENV === "production"
      ? "Terjadi kesalahan internal pada server. Silakan coba beberapa saat lagi."
      : errorMessage;

  sendError(res, clientMessage, 500);
}

