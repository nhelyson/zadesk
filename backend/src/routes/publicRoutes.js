import { Router } from "express";
import {
  listPublicCompanies,
  listPopularCompanies,
  listPublicCategories,
  getCompanyProfile,
  sendPublicChatMessage,
  getPublicChatMessages,
  getPublicChatAttachment,
  getPublicPushVapidKey,
  subscribePublicPush,
  unsubscribePublicPush,
  savePublicNotificationEmail,
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
router.get("/companies/:slug/chat/:conversationId/attachments/:fileName", getPublicChatAttachment);

// Offline / Background Web Push & Email Notifications for Public Portal Customers
router.get("/push/vapid-key", getPublicPushVapidKey);
router.post("/companies/:slug/chat/:conversationId/push-subscribe", subscribePublicPush);
router.delete("/companies/:slug/chat/:conversationId/push-subscribe", unsubscribePublicPush);
router.post("/companies/:slug/chat/:conversationId/notify-email", savePublicNotificationEmail);

export default router;
