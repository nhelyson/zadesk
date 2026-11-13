import { Router } from "express";
import authRoutes from "./authRoutes.js";
import workspaceRoutes from "./workspaceRoutes.js";
import publicRoutes from "./publicRoutes.js";
import commercialRoutes from "./commercialRoutes.js";
import { isRedisReady } from "../config/redis.js";
import { prisma } from "../lib/prisma.js";
import { queueManager } from "../queues/queueManager.js";

const apiRouter = Router();

// Resilient Healthcheck endpoint: Distinguishes process readiness vs dependency state
apiRouter.get("/health", async (req, res) => {
  let dbStatus = "unknown";
  try {
    await prisma.$queryRaw`SELECT 1`;
    dbStatus = "connected";
  } catch {
    dbStatus = "disconnected";
  }

  const cacheStatus = isRedisReady() ? "connected" : "fallback";
  const isHealthy = dbStatus === "connected";

  // Returns 200 if DB is healthy (even if Redis is in fallback mode, as CacheService degrades gracefully)
  // Returns 503 only if core database is disconnected
  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? (cacheStatus === "connected" ? "ok" : "degraded") : "unhealthy",
    service: "zadesk-api",
    timestamp: new Date().toISOString(),
    services: {
      database: dbStatus,
      cache: cacheStatus,
    },
  });
});

// BullMQ Queue Observability & Health
apiRouter.get("/health/queues", async (req, res) => {
  try {
    const metrics = await queueManager.getAllQueueMetrics();
    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      queues: metrics,
    });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

// Public Company Directory Routes: /api/public/* (No Auth)
apiRouter.use("/public", publicRoutes);

// Auth Routes: /api/auth/*
apiRouter.use("/auth", authRoutes);

// Commercial & Billing Routes: /api/commercial/* and /api/billing/*
apiRouter.use("/commercial", commercialRoutes);
apiRouter.use("/billing", commercialRoutes);

// Workspace & SAV Modules: /api/workspaces/*
apiRouter.use("/workspaces", workspaceRoutes);

export default apiRouter;
