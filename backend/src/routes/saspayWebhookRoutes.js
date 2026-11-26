import { Router } from "express";
import { handleSasPayWebhook } from "../controllers/saspayWebhookController.js";

const router = Router();

// Public webhook endpoint called by SasPay servers
// Cryptographic HMAC-SHA256 signature is verified in the controller
router.post("/", handleSasPayWebhook);

export default router;
