import { getRedisClient, isRedisReady } from "../config/redis.js";

const MAX_MEMORY_FALLBACK_ENTRIES = 1000;

/**
 * Zadesk Cache Layer
 * Provides fast in-memory caching with Redis and bounded local in-memory fallback.
 */
class CacheService {
  constructor() {
    this.memoryFallback = new Map();
    this.lastWriteErrorLoggedAt = 0;
  }

  /**
   * Prune expired entries from memory fallback
   */
  pruneMemoryFallback() {
    const now = Date.now();
    for (const [key, entry] of this.memoryFallback.entries()) {
      if (entry.expiresAt && entry.expiresAt < now) {
        this.memoryFallback.delete(key);
      }
    }
  }

  /**
   * Get parsed JSON value from cache
   * @param {string} key
   * @returns {Promise<any|null>}
   */
  async get(key) {
    if (isRedisReady()) {
      try {
        const client = getRedisClient();
        const raw = await client.get(key);
        if (raw) {
          return JSON.parse(raw);
        }
      } catch (err) {
        console.warn(`[Cache] Error reading key "${key}":`, err.message);
      }
    }

    // Local memory fallback (used if Redis is offline OR if a previous write fell back to local memory)
    const entry = this.memoryFallback.get(key);
    if (!entry) return null;
    if (entry.expiresAt && entry.expiresAt < Date.now()) {
      this.memoryFallback.delete(key);
      return null;
    }
    return entry.value;
  }

  /**
   * Set JSON value with TTL
   * @param {string} key
   * @param {any} value
   * @param {number} ttlSeconds - Default 300s (5m)
   */
  async set(key, value, ttlSeconds = 300) {
    if (value === undefined) return false;

    if (isRedisReady()) {
      try {
        const client = getRedisClient();
        const serialized = JSON.stringify(value);
        if (ttlSeconds && ttlSeconds > 0) {
          await client.set(key, serialized, "EX", ttlSeconds);
        } else {
          await client.set(key, serialized);
        }
        return true;
      } catch (err) {
        // Throttled logging (once per 30 seconds) to prevent log flooding under Redis OOM or saturation
        const now = Date.now();
        if (now - this.lastWriteErrorLoggedAt > 30000) {
          console.warn(`[Cache] Redis write error on "${key}": ${err.message}. Falling back to bounded in-memory cache.`);
          this.lastWriteErrorLoggedAt = now;
        }
      }
    }

    // Local memory fallback with bounded eviction and TTL
    this.pruneMemoryFallback();

    if (this.memoryFallback.size >= MAX_MEMORY_FALLBACK_ENTRIES) {
      // Evict oldest entry (FIFO/LRU)
      const oldestKey = this.memoryFallback.keys().next().value;
      if (oldestKey) {
        this.memoryFallback.delete(oldestKey);
      }
    }

    const expiresAt = ttlSeconds && ttlSeconds > 0 ? Date.now() + ttlSeconds * 1000 : null;
    this.memoryFallback.set(key, { value, expiresAt });
    return true;
  }

  /**
   * Delete a key from cache (uses non-blocking UNLINK if available)
   * @param {string} key
   */
  async del(key) {
    if (isRedisReady()) {
      try {
        const client = getRedisClient();
        if (typeof client.unlink === "function") {
          await client.unlink(key);
        } else {
          await client.del(key);
        }
      } catch (err) {
        console.warn(`[Cache] Error deleting key "${key}":`, err.message);
      }
    }

    this.memoryFallback.delete(key);
    return true;
  }

  /**
   * Delete all keys matching a prefix using non-blocking SCAN and UNLINK
   * @param {string} pattern E.g. "workspace:123:*"
   */
  async delByPrefix(pattern) {
    // 1. Clear matching keys from Redis non-blockingly
    if (isRedisReady()) {
      try {
        const client = getRedisClient();
        let cursor = "0";
        do {
          const [nextCursor, keys] = await client.scan(cursor, "MATCH", pattern, "COUNT", 100);
          cursor = nextCursor;
          if (keys.length > 0) {
            if (typeof client.unlink === "function") {
              await client.unlink(...keys);
            } else {
              await client.del(...keys);
            }
          }
        } while (cursor !== "0");
      } catch (err) {
        console.warn(`[Cache] Error deleting pattern "${pattern}":`, err.message);
      }
    }

    // 2. Clear matching keys from memory fallback
    try {
      const regexPattern = new RegExp("^" + pattern.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*") + "$");
      for (const key of this.memoryFallback.keys()) {
        if (regexPattern.test(key)) {
          this.memoryFallback.delete(key);
        }
      }
    } catch (_) {}

    return true;
  }

  /**
   * Safely clear ONLY application business cache keys without touching security/auth keys
   * Protected keys never touched: auth:*, turnstile:*, rl:*, rate_limit:*
   */
  async clearApplicationCache() {
    const applicationPrefixes = [
      "workspace:*",
      "public:company:*",
      "public:companies:*",
      "user:*",
    ];

    for (const prefix of applicationPrefixes) {
      await this.delByPrefix(prefix);
    }

    return true;
  }

  /**
   * Cache-Aside Wrapper: Return cached value or execute fallback fetch function
   * @param {string} key
   * @param {() => Promise<any>} fetchFn
   * @param {number} ttlSeconds
   */
  async wrap(key, fetchFn, ttlSeconds = 300) {
    const cached = await this.get(key);
    if (cached !== null) {
      return cached;
    }

    const data = await fetchFn();
    if (data !== undefined && data !== null) {
      // Background cache store (do not block return)
      this.set(key, data, ttlSeconds).catch(() => {});
    }
    return data;
  }
}

export const cacheService = new CacheService();
export default cacheService;
