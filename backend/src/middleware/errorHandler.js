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
    });
  }

  // Prisma unique constraint violation error
  if (err.code === "P2002") {
    const target = err.meta?.target || [];
    return res.status(409).json({
      success: false,
      message: `Une ressource avec ce(s) champ(s) existe déjà : ${Array.isArray(target) ? target.join(", ") : target}.`,
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
    ...(env.IS_PROD ? {} : { stack: err.stack }),
  });
}
