import { Router } from "express";
import {
  listPublicCompanies,
  listPopularCompanies,
  listPublicCategories,
  getCompanyProfile,
  sendPublicChatMessage,
  getPublicChatMessages,
} from "../controllers/publicCompanyController.js";
import { publicDirectoryRateLimiter } from "../middleware/rateLimiter.js";

const router = Router();

// Apply distributed public directory rate limiter to prevent scraping and cache exhaustion
router.use(publicDirectoryRateLimiter);

// Public routes - NO auth required
router.get("/companies/popular", listPopularCompanies);
router.get("/companies/categories", listPublicCategories);
router.get("/companies", listPublicCompanies);
router.get("/companies/:slug", getCompanyProfile);

// Real-time Public Customer SAV Chat endpoints
router.post("/companies/:slug/chat", sendPublicChatMessage);
router.get("/companies/:slug/chat/:conversationId", getPublicChatMessages);

export default router;
