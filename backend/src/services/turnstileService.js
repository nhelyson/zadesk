import crypto from "crypto";
import { env } from "../config/env.js";
import { cacheService } from "../cache/cacheService.js";
import { logger } from "../utils/logger.js";

const TURNSTILE_VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
const TURNSTILE_TIMEOUT_MS = 5000;
const REPLAY_CACHE_TTL_SECONDS = 300; // 5 minutes

/**
 * Validates Cloudflare Turnstile token server-side.
 * Follows strict fail-closed policy, timeout handling and anti-replay protection.
 *
 * @param {Object} options
 * @param {string} options.token - Cloudflare Turnstile response token
 * @param {string} [options.remoteIp] - Client IP address
 * @returns {Promise<{ success: boolean, error?: string, code?: string, errorCodes?: string[] }>}
 */
export async function verifyTurnstileToken({ token, remoteIp = "" }) {
  // 1. Token presence check
  if (!token || typeof token !== "string" || !token.trim()) {
    return {
      success: false,
      error: "La vérification de sécurité est requise. Veuillez compléter le CAPTCHA.",
      code: "MISSING_TOKEN",
    };
  }

  const cleanToken = token.trim();
  const isDevMode = !env.IS_PROD || env.TURNSTILE_BYPASS_DEV === true;

  // In development mode or when bypass is enabled, accept dev-bypass-token immediately
  if (isDevMode && cleanToken === "dev-bypass-token") {
    logger.info("[TURNSTILE] Jeton de contournement dev accepté avec succès.");
    return {
      success: true,
      hostname: "localhost",
      challengeTs: new Date().toISOString(),
    };
  }

  // 2. Anti-replay protection: Check if token has already been consumed
  const tokenHash = crypto.createHash("sha256").update(cleanToken).digest("hex");
  const replayKey = `turnstile:used:${tokenHash}`;

  const isReplayed = await cacheService.get(replayKey);
  if (isReplayed) {
    logger.warn("[TURNSTILE] Replay attempt detected for token hash: %s", tokenHash.substring(0, 8));
    return {
      success: false,
      error: "Ce jeton de sécurité a déjà été utilisé. Veuillez revalider le CAPTCHA.",
      code: "TOKEN_ALREADY_USED",
    };
  }

  // 3. Secret key availability (Fail-Closed)
  const secretKey = env.TURNSTILE_SECRET_KEY;
  if (!secretKey) {
    logger.error("[TURNSTILE] TURNSTILE_SECRET_KEY is missing on server");
    return {
      success: false,
      error: "Le service de vérification de sécurité est temporairement indisponible. Veuillez réessayer plus tard.",
      code: "CONFIG_ERROR",
    };
  }

  // 4. Verify with Cloudflare siteverify endpoint (Strict timeout & Fail-Closed)
  try {
    const formData = new URLSearchParams();
    formData.append("secret", secretKey);
    formData.append("response", cleanToken);
    if (remoteIp) {
      formData.append("remoteip", remoteIp);
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TURNSTILE_TIMEOUT_MS);

    const response = await fetch(TURNSTILE_VERIFY_URL, {
      method: "POST",
      body: formData,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      logger.error("[TURNSTILE] HTTP error from Cloudflare siteverify (Status: %d)", response.status);
      return {
        success: false,
        error: "La vérification de sécurité est temporairement indisponible. Veuillez patienter quelques instants puis réessayer.",
        code: "UPSTREAM_ERROR",
      };
    }

    const data = await response.json().catch(() => ({}));

    if (data.success === true) {
      // Mark token as consumed in cache to prevent replay within TTL window
      await cacheService.set(replayKey, { verifiedAt: Date.now() }, REPLAY_CACHE_TTL_SECONDS);

      logger.info("[TURNSTILE] Security challenge verified successfully (hostname: %s)", data.hostname || "unknown");
      return {
        success: true,
        hostname: data.hostname,
        challengeTs: data.challenge_ts,
      };
    }

    // Challenge failed
    const errorCodes = data["error-codes"] || [];
    logger.warn("[TURNSTILE] Verification rejected by Cloudflare: %j", errorCodes);

    return {
      success: false,
      error: "La vérification de sécurité a échoué. Veuillez réessayer.",
      code: "VALIDATION_FAILED",
      errorCodes,
    };
  } catch (error) {
    if (error.name === "AbortError") {
      logger.error("[TURNSTILE] Request to Cloudflare timed out after %d ms", TURNSTILE_TIMEOUT_MS);
    } else {
      logger.error("[TURNSTILE] Network error communicating with Cloudflare: %s", error.message);
    }

    // In development mode, fail-open on network/timeout error so dev environments are never blocked
    if (isDevMode) {
      logger.warn("[TURNSTILE] Mode dev: échec réseau Cloudflare (%s), validation tolérée en local.", error.message);
      return {
        success: true,
        hostname: "localhost",
        challengeTs: new Date().toISOString(),
      };
    }

    // Fail-Closed policy: Do not grant access on timeout or network error in production
    return {
      success: false,
      error: "La vérification de sécurité est temporairement indisponible. Veuillez patienter quelques instants puis réessayer.",
      code: "NETWORK_ERROR",
    };
  }
}
