import { createApp } from "./app";
import { env } from "./config/env";

const app = createApp();

// Bind explicitly to 0.0.0.0 for Render Web Service compatibility
const server = app.listen(env.PORT, "0.0.0.0", () => {
  console.log(`====================================================`);
  console.log(`🚀 PJLaundry REST API is running!`);
  console.log(`📍 Environment : ${env.NODE_ENV}`);
  console.log(`📍 Address     : http://0.0.0.0:${env.PORT}`);
  console.log(`📍 Health Check: http://localhost:${env.PORT}/api/v1/health`);
  console.log(`====================================================`);
});

// Graceful Shutdown Handlers
process.on("SIGTERM", () => {
  console.log("[Shutdown] SIGTERM signal received. Closing HTTP server...");
  server.close(() => {
    console.log("[Shutdown] HTTP server successfully closed.");
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  console.log("[Shutdown] SIGINT signal received. Closing HTTP server...");
  server.close(() => {
    console.log("[Shutdown] HTTP server successfully closed.");
    process.exit(0);
  });
});

