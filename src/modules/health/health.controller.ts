import { Request, Response } from "express";
import { env } from "../../config/env";
import { supabasePublic } from "../../config/supabase";
import { sendSuccess } from "../../utils/response";

export async function getHealthStatus(req: Request, res: Response): Promise<void> {
  const startTime = Date.now();
  let dbStatus = "unknown";

  try {
    // Light ping to Supabase by checking version/public table or auth settings
    const { error } = await supabasePublic.from("services").select("id").limit(1);
    dbStatus = error ? `error: ${error.message}` : "connected";
  } catch (err) {
    dbStatus = err instanceof Error ? err.message : "unreachable";
  }

  const responseTimeMs = Date.now() - startTime;

  sendSuccess(res, "PJLaundry Backend Service is healthy", {
    status: "ok",
    service: "PJLaundry REST API",
    version: "1.0.0",
    environment: env.NODE_ENV,
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    database: {
      status: dbStatus,
      latencyMs: responseTimeMs,
    },
  });
}

