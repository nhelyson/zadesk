import rateLimit from "express-rate-limit";

/**
 * Strict rate limiter for sensitive authentication endpoints
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // Limit each IP to 30 auth requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Trop de tentatives de connexion ou d'inscription. Veuillez réessayer dans quelques minutes.",
  },
});
