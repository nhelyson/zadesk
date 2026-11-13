import { AuthError } from "../services/authService.js";
import { logger } from "../utils/logger.js";
import { env } from "../config/env.js";

/**
 * Centralized error handler
 */
export function errorHandler(err, req, res, next) {
  logger.error(`Erreur sur ${req.method} ${req.originalUrl}:`, err);

  // Custom Auth Error
  if (err instanceof AuthError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(err.code ? { code: err.code } : {}),
    });
  }

  // Prisma unique constraint violation error
  if (err.code === "P2002") {
    const target = err.meta?.target || [];
    const isUserConflict = Array.isArray(target)
      ? target.some((t) => String(t).includes("email") || String(t).includes("googleId"))
      : String(target).includes("email") || String(target).includes("googleId");

    if (isUserConflict) {
      return res.status(409).json({
        success: false,
        message: "Un compte existe déjà avec cette adresse email. Connectez-vous plutôt.",
        code: "ACCOUNT_ALREADY_EXISTS",
      });
    }

    return res.status(409).json({
      success: false,
      message: `Une ressource avec ce(s) champ(s) existe déjà : ${Array.isArray(target) ? target.join(", ") : target}.`,
      code: "UNIQUE_CONSTRAINT_VIOLATION",
    });
  }

  // Default fallback internal error
  const statusCode = err.statusCode || 500;
  const message = env.IS_PROD && statusCode === 500
    ? "Une erreur interne est survenue. Veuillez réessayer plus tard."
    : (err.message || "Une erreur est survenue.");

  return res.status(statusCode).json({
    success: false,
    message,
    ...(err.code ? { code: err.code } : {}),
    ...(env.IS_PROD ? {} : { stack: err.stack }),
  });
}
