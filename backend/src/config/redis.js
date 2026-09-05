import Redis from "ioredis";

const REDIS_URL = process.env.REDIS_URL || "redis://redis:6379";

let redisClient = null;
let isConnected = false;

try {
  redisClient = new Redis(REDIS_URL, {
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
      if (times > 10) {
        console.warn("[Redis] Reached maximum reconnect attempts. Backing off...");
        return 10000; // Retry every 10 seconds
      }
      const delay = Math.min(times * 500, 3000);
      return delay;
    },
    lazyConnect: true,
    enableReadyCheck: true,
  });

  redisClient.on("connect", () => {
    isConnected = true;
    console.log("[Redis] Client connected to cache server");
  });

  redisClient.on("ready", () => {
    isConnected = true;
    console.log("[Redis] Cache engine ready for commands");
  });

  redisClient.on("error", (err) => {
    isConnected = false;
    console.warn("[Redis] Cache warning/connection issue:", err.message);
  });

  redisClient.on("close", () => {
    isConnected = false;
    console.log("[Redis] Connection closed. Falling back to PostgreSQL.");
  });

  redisClient.on("reconnecting", () => {
    console.log("[Redis] Attempting to reconnect to cache server...");
  });

  // Attempt initial connect asynchronously without blocking backend boot
  redisClient.connect().catch((err) => {
    console.warn("[Redis] Initial connection attempt deferred:", err.message);
  });
} catch (error) {
  console.warn("[Redis] Failed to initialize Redis client:", error.message);
  redisClient = null;
  isConnected = false;
}

export const getRedisClient = () => redisClient;
export const isRedisReady = () => isConnected && redisClient?.status === "ready";
