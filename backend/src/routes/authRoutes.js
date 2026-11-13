import { Router } from "express";
import { 
  register, 
  login, 
  verifyOtp, 
  resendOtp, 
  googleAuth, 
  logout, 
  me, 
  getGoogleConfig,
  getTurnstileConfig
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
import { 
  registerRateLimiter, 
  loginRateLimiter, 
  otpVerifyRateLimiter, 
  otpResendRateLimiter, 
  googleAuthRateLimiter 
} from "../middleware/rateLimiter.js";
import { requireTurnstile } from "../middleware/requireTurnstile.js";

const router = Router();

// Public auth routes with separated, distributed rate limiting and bot protection
router.post("/register", registerRateLimiter, requireTurnstile, validateBody(registerSchema), register);
router.post("/login", loginRateLimiter, validateBody(loginSchema), login);
router.post("/verify-otp", otpVerifyRateLimiter, validateBody(verifyOtpSchema), verifyOtp);
router.post("/resend-otp", otpResendRateLimiter, requireTurnstile, validateBody(resendOtpSchema), resendOtp);
router.post("/google", googleAuthRateLimiter, validateBody(googleAuthSchema), googleAuth);

// Configuration routes (public, safe, no secrets)
router.get("/google/config", getGoogleConfig);
router.get("/turnstile/config", getTurnstileConfig);

// Protected / session-based auth routes
router.post("/logout", requireAuth, logout);
router.get("/me", optionalAuth, me);

export default router;

