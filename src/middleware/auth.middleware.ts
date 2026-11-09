import { Request, Response, NextFunction } from "express";
import { supabasePublic } from "../config/supabase";
import { sendError } from "../utils/response";

/**
 * Authentication Middleware:
 * Extracts Bearer token from Authorization header and verifies it with Supabase Auth.
 * Rejects with HTTP 401 if missing or invalid.
 */
export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    sendError(
      res,
      "Akses ditolak. Token otentikasi (Bearer token) tidak disertakan.",
      401
    );
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const { data, error } = await supabasePublic.auth.getUser(token);

    if (error || !data.user) {
      sendError(
        res,
        "Sesi tidak valid atau telah kedaluwarsa. Silakan masuk kembali.",
        401
      );
      return;
    }

    // Attach verified user and token to request context
    req.user = {
      id: data.user.id,
      email: data.user.email,
      role: data.user.role,
      phone: data.user.phone,
    };
    req.token = token;

    next();
  } catch (err) {
    console.error("[Auth Middleware Error]:", err);
    sendError(res, "Gagal memverifikasi identitas pengguna.", 401);
  }
}

