import { Request, Response } from "express";
import { createApp } from "../src/app";

const app = createApp();

export default function handler(req: Request, res: Response): void {
  // Vercel may remove the /api function prefix before invoking the handler.
  if (req.url?.startsWith("/v1")) {
    req.url = `/api${req.url}`;
  }

  app(req, res);
}
