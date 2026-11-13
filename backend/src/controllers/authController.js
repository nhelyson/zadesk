import crypto from "crypto";
import { 
  registerUser, 
  loginUser, 
  finalizeAuthWithOtp, 
  resendAuthOtp, 
  authenticateWithGoogle, 
  logoutUser,
  AuthError,
  NEUTRAL_AUTH_ERROR_MESSAGE
} from "../services/authService.js";
import { setSessionCookie, clearSessionCookie } from "../services/sessionService.js";
import { verifyTurnstileToken } from "../services/turnstileService.js";
import { cacheService } from "../cache/cacheService.js";
import { formatPublicUser, successResponse } from "../utils/response.js";
import { env } from "../config/env.js";
import { logger } from "../utils/logger.js";

const MAX_FAILED_LOGINS_BEFORE_CAPTCHA = 3;
const FAILED_LOGIN_TTL_SECONDS = 900; // 15 minutes

/**
 * Register step 1: Validate input, create unverified user, send OTP
 */
export async function register(req, res, next) {
  try {
    const { firstName, lastName, email, password } = req.body;
    const result = await registerUser({
      firstName,
      lastName,
      email,
      password,
    });

    const isLocal = env.FRONTEND_URL.includes("localhost") || env.FRONTEND_URL.includes("127.0.0.1");
    let message = "Compte pré-créé. Un code de vérification à 6 chiffres a été envoyé à votre adresse email.";
    if (result.devCode && isLocal) {
      message = `Quota email atteint (100/j). En local, votre code OTP est : ${result.devCode}`;
    }

    return successResponse(
      res,
      {
        requiresOtp: true,
        tempToken: result.tempToken,
        email: result.email,
        purpose: result.purpose,
        message,
        devCode: isLocal ? result.devCode : undefined,
      },
      200
    );
  } catch (error) {
    next(error);
  }
}

/**
 * Login step 1: Validate credentials, send OTP
 * Features adaptive Cloudflare Turnstile verification after failed attempts.
 */
export async function login(req, res, next) {
  // Use Express-sanitized req.ip (backed by app.set('trust proxy', 1) and Nginx)
  // to prevent client-spoofed X-Forwarded-For headers from bypassing the failed login counter
  const clientIp = req.ip || req.socket?.remoteAddress || "unknown";

  const { email, password, turnstileToken } = req.body;
  const emailHash = crypto.createHash("sha256").update(email.toLowerCase().trim()).digest("hex");
  const failedAttemptsKey = `auth:failed_logins:${clientIp}:${emailHash}`;

  try {
    const failedCount = (await cacheService.get(failedAttemptsKey)) || 0;

    // Turnstile désactivé temporairement
    /*
    if (failedCount >= MAX_FAILED_LOGINS_BEFORE_CAPTCHA) {
      if (!turnstileToken) {
        return res.status(403).json({
          success: false,
          requiresCaptcha: true,
          message: "Trop de tentatives de connexion échouées. Veuillez valider le test de sécurité pour continuer.",
          code: "CAPTCHA_REQUIRED",
        });
      }
    }
    */

    const result = await loginUser({
      email,
      password,
    });

    // Reset failed attempts upon successful authentication
    await cacheService.del(failedAttemptsKey);

    const isLocal = env.FRONTEND_URL.includes("localhost") || env.FRONTEND_URL.includes("127.0.0.1");
    let message = "Identifiants valides. Un code de vérification à 6 chiffres a été envoyé à votre adresse email.";
    if (result.devCode && isLocal) {
      message = `Quota email atteint (100/j). En local, votre code OTP est : ${result.devCode}`;
    }

    return successResponse(res, {
      requiresOtp: true,
      tempToken: result.tempToken,
      email: result.email,
      purpose: result.purpose,
      message,
      devCode: isLocal ? result.devCode : undefined,
    });
  } catch (error) {
    // Record failed login attempt in cache
    const currentFailed = ((await cacheService.get(failedAttemptsKey)) || 0) + 1;
    await cacheService.set(failedAttemptsKey, currentFailed, FAILED_LOGIN_TTL_SECONDS);

    const requiresCaptchaNow = currentFailed >= MAX_FAILED_LOGINS_BEFORE_CAPTCHA;

    if (requiresCaptchaNow) {
      return res.status(error.statusCode || 401).json({
        success: false,
        requiresCaptcha: true,
        message: error.message || "Identifiants incorrects.",
        code: "INVALID_CREDENTIALS",
      });
    }

    next(error);
  }
}

/**
 * Step 2: Verify OTP and establish definitive session
 */
export async function verifyOtp(req, res, next) {
  try {
    const { tempToken, otp, purpose } = req.body;
    const { user, sessionToken, expiresAt } = await finalizeAuthWithOtp({
      tempToken,
      otp,
      purpose,
    });

    // Set definitive HttpOnly session cookie
    setSessionCookie(res, sessionToken, expiresAt);

    const hasWorkspace = Boolean(user.memberships && user.memberships.length > 0);
    const redirectTo = hasWorkspace ? "/app" : "/app/onboarding";

    return successResponse(res, {
      message: "Authentification réussie.",
      user: formatPublicUser(user),
      hasWorkspace,
      redirectTo,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Resend OTP code
 */
export async function resendOtp(req, res, next) {
  try {
    const { tempToken, purpose } = req.body;
    const result = await resendAuthOtp({
      tempToken,
      purpose,
    });

    return successResponse(res, {
      message: "Un nouveau code de vérification a été envoyé par email.",
      tempToken: result.tempToken,
      expiresAt: result.expiresAt,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Google OAuth Direct Login/Register
 */
export async function googleAuth(req, res, next) {
  try {
    let { credential, mode } = req.body;

    // Protection anti-désynchronisation SPA : si la requête provient de /login, forcer mode = "login"
    const referer = req.headers.referer || "";
    if (referer.includes("/login")) {
      mode = "login";
    } else if (referer.includes("/register")) {
      mode = "register";
    }

    const { user, sessionToken, expiresAt, isNewUser } = await authenticateWithGoogle(credential, mode);

    setSessionCookie(res, sessionToken, expiresAt);

    const hasWorkspace = Boolean(user.memberships && user.memberships.length > 0);
    const redirectTo = hasWorkspace ? "/app" : "/app/onboarding";

    return successResponse(
      res,
      {
        message: isNewUser
          ? "Compte créé avec succès via Google."
          : "Connexion réussie via Google.",
        user: formatPublicUser(user),
        isNewUser,
        hasWorkspace,
        redirectTo,
      },
      isNewUser ? 201 : 200
    );
  } catch (error) {
    if (error instanceof AuthError && (error.code === "ACCOUNT_ALREADY_EXISTS" || error.code === "USER_NOT_FOUND")) {
      return res.status(409).json({
        success: false,
        message: NEUTRAL_AUTH_ERROR_MESSAGE,
        ...(process.env.NODE_ENV === "test" && error.code ? { code: error.code } : {}),
      });
    }
    next(error);
  }
}

/**
 * Logout
 */
export async function logout(req, res, next) {
  try {
    const sessionToken = req.sessionToken;
    if (sessionToken) {
      await logoutUser(sessionToken);
    }

    clearSessionCookie(res);

    return successResponse(res, {
      message: "Déconnexion réussie.",
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get current session user profile
 */
export async function me(req, res, next) {
  try {
    if (!req.user) {
      return res.status(200).json({
        authenticated: false,
      });
    }

    const hasWorkspace = Boolean(req.user.memberships && req.user.memberships.length > 0);
    const redirectTo = hasWorkspace ? "/app" : "/app/onboarding";

    return res.status(200).json({
      authenticated: true,
      user: formatPublicUser(req.user),
      hasWorkspace,
      redirectTo,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Public Google Client ID endpoint
 */
export async function getGoogleConfig(req, res) {
  return res.status(200).json({
    clientId: env.GOOGLE_CLIENT_ID || "",
  });
}

/**
 * Public Cloudflare Turnstile Site Key endpoint (safe, no secret)
 */
export async function getTurnstileConfig(req, res) {
  return res.status(200).json({
    siteKey: env.TURNSTILE_SITE_KEY || "",
  });
}

