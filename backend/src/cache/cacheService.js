import { getRedisClient, isRedisReady } from "../config/redis.js";

/**
 * Zadesk Cache Layer
 * Provides fast in-memory caching with graceful, transparent PostgreSQL fallback.
 */
class CacheService {
  /**
   * Get parsed JSON value from cache
   * @param {string} key
   * @returns {Promise<any|null>}
   */
  async get(key) {
    if (!isRedisReady()) return null;

    try {
      const client = getRedisClient();
      const raw = await client.get(key);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (err) {
      console.warn(`[Cache] Error reading key "${key}":`, err.message);
      return null;
    }
  }

  /**
   * Set JSON value with TTL
   * @param {string} key
   * @param {any} value
   * @param {number} ttlSeconds - Default 300s (5m)
   */
  async set(key, value, ttlSeconds = 300) {
    if (!isRedisReady() || value === undefined) return false;

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
      console.warn(`[Cache] Error setting key "${key}":`, err.message);
      return false;
    }
  }

  /**
   * Delete a key from cache
   * @param {string} key
   */
  async del(key) {
    if (!isRedisReady()) return false;

    try {
      const client = getRedisClient();
      await client.del(key);
      return true;
    } catch (err) {
      console.warn(`[Cache] Error deleting key "${key}":`, err.message);
      return false;
    }
  }

  /**
   * Delete all keys matching a prefix using non-blocking SCAN
   * @param {string} pattern E.g. "workspace:123:*"
   */
  async delByPrefix(pattern) {
    if (!isRedisReady()) return false;

    try {
      const client = getRedisClient();
      let cursor = "0";
      do {
        const [nextCursor, keys] = await client.scan(cursor, "MATCH", pattern, "COUNT", 100);
        cursor = nextCursor;
        if (keys.length > 0) {
          await client.del(...keys);
        }
      } while (cursor !== "0");
      return true;
    } catch (err) {
      console.warn(`[Cache] Error deleting pattern "${pattern}":`, err.message);
      return false;
    }
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
