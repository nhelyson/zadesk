import { Router } from "express";
import { 
  register, 
  login, 
  verifyOtp, 
  resendOtp, 
  googleAuth, 
  logout, 
  me, 
  getGoogleConfig 
} from "../controllers/authController.js";
import { validateBody } from "../middleware/validate.js";
import { 
  registerSchema, 
  loginSchema, 
  verifyOtpSchema, 
  resendOtpSchema, 
  googleAuthSchema 
} from "../utils/validation.js";
import { requireAuth, optionalAuth } from "../middleware/requireAuth.js";
import { authRateLimiter } from "../middleware/rateLimiter.js";

const router = Router();

// Public auth routes with rate limiting
router.post("/register", authRateLimiter, validateBody(registerSchema), register);
router.post("/login", authRateLimiter, validateBody(loginSchema), login);
router.post("/verify-otp", authRateLimiter, validateBody(verifyOtpSchema), verifyOtp);
router.post("/resend-otp", authRateLimiter, validateBody(resendOtpSchema), resendOtp);
router.post("/google", authRateLimiter, validateBody(googleAuthSchema), googleAuth);

// Configuration route for Google OAuth client ID (public, no secret)
router.get("/google/config", getGoogleConfig);

// Protected / session-based auth routes
router.post("/logout", requireAuth, logout);
router.get("/me", optionalAuth, me);

export default router;
