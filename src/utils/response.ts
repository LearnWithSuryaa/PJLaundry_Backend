import { Response } from "express";
import { ApiResponse, ApiErrorResponse } from "../types/api.types";

export function sendSuccess<T>(
  res: Response,
  message: string,
  data: T,
  statusCode = 200,
  meta?: ApiResponse["meta"]
): Response {
  const body: ApiResponse<T> = {
    success: true,
    message,
    data,
    ...(meta ? { meta } : {}),
  };
  return res.status(statusCode).json(body);
}

export function sendError(
  res: Response,
  message: string,
  statusCode = 400,
  errors?: ApiErrorResponse["errors"]
): Response {
  const body: ApiErrorResponse = {
    success: false,
    message,
    data: null,
    ...(errors && errors.length > 0 ? { errors } : {}),
  };
  return res.status(statusCode).json(body);
}

