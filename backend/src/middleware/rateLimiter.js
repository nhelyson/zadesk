import rateLimit, { MemoryStore } from "express-rate-limit";
import { getRedisClient, isRedisReady } from "../config/redis.js";
import { logger } from "../utils/logger.js";

const LUA_INCR_SCRIPT = `
local count = redis.call('INCR', KEYS[1])
local pttl = redis.call('PTTL', KEYS[1])
if count == 1 or pttl < 0 then
  redis.call('PEXPIRE', KEYS[1], ARGV[1])
  pttl = tonumber(ARGV[1])
end
return { count, pttl }
`;

/**
 * Resilient Redis Store for express-rate-limit v7
 * - Atomic counter increments with PEXPIRE via Lua script
 * - Full multi-instance Redis cluster support (localKeys = false)
 * - Automatic, non-blocking fallback to in-memory store if Redis is unavailable
 */
export class RedisRateLimitStore {
  constructor({ prefix = "rl:" } = {}) {
    this.prefix = prefix;
    this.localKeys = false; // Informs express-rate-limit that keys are shared across servers
    this.windowMs = 60000;
    this.fallbackStore = new MemoryStore();
    this.isDegraded = false;
  }

  init(options) {
    this.windowMs = options.windowMs || 60000;
    this.fallbackStore.init(options);
  }

  async increment(key) {
    const fullKey = `${this.prefix}${key}`;

    if (isRedisReady()) {
      try {
        const client = getRedisClient();
        const [count, pttl] = await client.eval(
          LUA_INCR_SCRIPT,
          1,
          fullKey,
          String(this.windowMs)
        );

        if (this.isDegraded) {
          logger.info(`[RateLimit:RECOVERED] Redis connection restored for prefix "${this.prefix}". Resumed distributed rate limiting.`);
          this.isDegraded = false;
        }

        const resetTime = new Date(Date.now() + Math.max(0, Number(pttl) || this.windowMs));
        return {
          totalHits: Number(count),
          resetTime,
        };
      } catch (err) {
        if (!this.isDegraded) {
          logger.warn(`[RateLimit:DEGRADED] Redis error on "${fullKey}", fallback to local memory: ${err.message}. Rate limiting is temporarily NOT distributed across processes.`);
          this.isDegraded = true;
        }
      }
    } else {
      if (!this.isDegraded) {
        logger.warn(`[RateLimit:DEGRADED] Redis not ready for prefix "${this.prefix}", operating in local memory fallback mode. Quota is enforced locally per-process.`);
        this.isDegraded = true;
      }
    }

    // Graceful in-memory fallback: ensures auth is never left unprotected and users are not blocked with 500
    return this.fallbackStore.increment(key);
  }

  async decrement(key) {
    const fullKey = `${this.prefix}${key}`;
    if (isRedisReady()) {
      try {
        const client = getRedisClient();
        await client.decr(fullKey);
        return;
      } catch (err) {
        logger.warn(`[RateLimit] Redis decr error on "${fullKey}": ${err.message}`);
      }
    }
    await this.fallbackStore.decrement(key);
  }

  async resetKey(key) {
    const fullKey = `${this.prefix}${key}`;
    if (isRedisReady()) {
      try {
        const client = getRedisClient();
        if (typeof client.unlink === "function") {
          await client.unlink(fullKey);
        } else {
          await client.del(fullKey);
        }
        return;
      } catch (err) {
        logger.warn(`[RateLimit] Redis resetKey error on "${fullKey}": ${err.message}`);
      }
    }
    await this.fallbackStore.resetKey(key);
  }

  async resetAll() {
    if (isRedisReady()) {
      try {
        const client = getRedisClient();
        let cursor = "0";
        do {
          const [nextCursor, keys] = await client.scan(cursor, "MATCH", `${this.prefix}*`, "COUNT", 100);
          cursor = nextCursor;
          if (keys.length > 0) {
            await client.del(...keys);
          }
        } while (cursor !== "0");
      } catch (_) {}
    }
    await this.fallbackStore.resetAll();
  }
}

/**
 * Standard client IP resolver based on Express sanitized req.ip
 */
export function defaultKeyGenerator(req) {
  return req.ip || req.socket?.remoteAddress || "unknown";
}

/**
 * Factory helper to construct distributed rate limiters with standardized error responses
 */
export function createRateLimiter({
  windowMs,
  max,
  prefix,
  message,
  keyGenerator = defaultKeyGenerator,
  isSensitive = false,
}) {
  const store = new RedisRateLimitStore({ prefix });

  return rateLimit({
    windowMs,
    limit: (req) => {
      // In automated test suite, allow high throughput unless explicitly testing rate limit enforcement
      if (req.headers && req.headers["x-enforce-rate-limit"]) {
        return max;
      }
      if (process.env.NODE_ENV === "test") {
        return 1000;
      }
      // Adaptive local quota in degraded mode for sensitive routes:
      // Mitigates multi-worker quota multiplication across backend processes
      if (isSensitive && store.isDegraded) {
        return Math.max(2, Math.floor(max / 2));
      }
      return max;
    },
    standardHeaders: true,
    legacyHeaders: false,
    store,
    keyGenerator,
    message: {
      success: false,
      message,
    },
  });
}

// -------------------------------------------------------------
// DEDICATED RATE LIMITERS PER OPERATION
// -------------------------------------------------------------

const isTest = process.env.NODE_ENV === "test";

// 1. Inscription : 10 requêtes par 30 minutes (Sensible)
export const registerRateLimiter = createRateLimiter({
  windowMs: 30 * 60 * 1000,
  max: isTest ? 100 : 10,
  prefix: "rl:register:",
  isSensitive: true,
  message: "Trop de tentatives d'inscription. Veuillez réessayer dans quelques minutes.",
});

// 2. Connexion : 15 requêtes par 15 minutes (Sensible)
export const loginRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: isTest ? 100 : 15,
  prefix: "rl:login:",
  isSensitive: true,
  message: "Trop de tentatives de connexion échouées. Veuillez patienter 15 minutes avant de réessayer.",
});

// 3. Validation OTP : 15 requêtes par 10 minutes (Sensible)
export const otpVerifyRateLimiter = createRateLimiter({
  windowMs: 10 * 60 * 1000,
  max: isTest ? 100 : 15,
  prefix: "rl:otp_verify:",
  isSensitive: true,
  message: "Trop de tentatives de validation du code de sécurité. Veuillez demander un nouveau code.",
});

// 4. Renvoi OTP : 5 requêtes par 15 minutes (Sensible)
export const otpResendRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: isTest ? 50 : 5,
  prefix: "rl:otp_resend:",
  isSensitive: true,
  message: "Trop de demandes d'envoi de code de vérification. Veuillez patienter avant de renouveler votre demande.",
});

// 5. Google OAuth : 25 requêtes par 15 minutes (Sensible)
export const googleAuthRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: isTest ? 100 : 25,
  prefix: "rl:google:",
  isSensitive: true,
  message: "Trop de requêtes d'authentification Google. Veuillez patienter quelques instants.",
});

// 6. Vérification de nom / slug : 40 requêtes par 5 minutes
export const checkNameRateLimiter = createRateLimiter({
  windowMs: 5 * 60 * 1000,
  max: isTest ? 150 : 40,
  prefix: "rl:check_name:",
  message: "Trop de vérifications de nom d'entreprise. Veuillez ralentir votre saisie.",
});

// 7. Vérification d'invitation : 20 requêtes par 10 minutes
export const invitationRateLimiter = createRateLimiter({
  windowMs: 10 * 60 * 1000,
  max: isTest ? 100 : 20,
  prefix: "rl:invitation:",
  message: "Trop de vérifications de jeton d'invitation. Veuillez patienter quelques minutes.",
});

// 8. Annuaire public : 120 requêtes par 5 minutes
export const publicDirectoryRateLimiter = createRateLimiter({
  windowMs: 5 * 60 * 1000,
  max: isTest ? 300 : 120,
  prefix: "rl:public_dir:",
  message: "Trop de requêtes sur l'annuaire public. Veuillez patienter quelques instants.",
});

// Backwards compatibility alias for existing imports
export const authRateLimiter = loginRateLimiter;
