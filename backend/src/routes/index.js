import { Router } from "express";
import authRoutes from "./authRoutes.js";
import workspaceRoutes from "./workspaceRoutes.js";
import publicRoutes from "./publicRoutes.js";

const apiRouter = Router();

// Healthcheck endpoint
apiRouter.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "zadesk-api",
    timestamp: new Date().toISOString(),
  });
});

// Public Company Directory Routes: /api/public/* (No Auth)
apiRouter.use("/public", publicRoutes);

// Auth Routes: /api/auth/*
apiRouter.use("/auth", authRoutes);

// Workspace & SAV Modules: /api/workspaces/*
apiRouter.use("/workspaces", workspaceRoutes);

export default apiRouter;
