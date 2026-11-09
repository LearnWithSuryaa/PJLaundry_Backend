import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import { env } from "./config/env";
import { errorHandler } from "./middleware/error.middleware";
import { notFoundHandler } from "./middleware/not-found.middleware";
import healthRoutes from "./modules/health/health.routes";
import serviceRoutes from "./modules/services/service.routes";
import promoRoutes from "./modules/promos/promo.routes";
import outletRoutes from "./modules/outlets/outlet.routes";
import reviewRoutes from "./modules/reviews/review.routes";
import orderRoutes from "./modules/orders/order.routes";

export function createApp(): Application {
  const app = express();

  // 1. Security Headers
  app.use(helmet());

  // 2. CORS Handling
  const allowedOrigins =
    env.CORS_ORIGINS === "*"
      ? "*"
      : env.CORS_ORIGINS.split(",").map((o) => o.trim());

  app.use(
    cors({
      origin: allowedOrigins,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
      credentials: true,
    })
  );

  // 3. Body Parsers
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true, limit: "1mb" }));

  // 4. Request Logging (Minimalistic & Safe)
  if (env.NODE_ENV !== "test") {
    app.use((req, res, next) => {
      const start = Date.now();
      res.on("finish", () => {
        const duration = Date.now() - start;
        console.log(`[HTTP] ${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`);
      });
      next();
    });
  }

  // 5. Base Route
  app.get("/", (req, res) => {
    res.json({
      name: "PJLaundry API Service",
      version: "1.0.0",
      docs: "/api/v1/health",
    });
  });

  // 6. Mount Modules under /api/v1
  app.use("/api/v1", healthRoutes);
  app.use("/api/v1", serviceRoutes);
  app.use("/api/v1", promoRoutes);
  app.use("/api/v1", outletRoutes);
  app.use("/api/v1", reviewRoutes);
  app.use("/api/v1", orderRoutes);

  // 7. 404 & Centralized Error Handlers
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
