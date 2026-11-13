import Redis from "ioredis";
import { logger } from "../utils/logger.js";

const REDIS_URL = process.env.REDIS_URL || "redis://redis:6379";

/**
 * BullMQ dedicated Redis connection options.
 * CRITICAL REQUIREMENTS:
 * - maxRetriesPerRequest: null (required by BullMQ for blocking worker commands)
 * - enableReadyCheck: false (ensures worker doesn't throw during reconnection handshakes)
 */
export function getBullMQRedisOptions(overrides = {}) {
  return {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    retryStrategy(times) {
      if (times > 20) {
        logger.error("[BullMQ:Redis] Nombre maximal de tentatives de reconnexion dépassé.");
        return 10000;
      }
      return Math.min(times * 250, 3000);
    },
    ...overrides,
  };
}

/**
 * Creates a dedicated ioredis instance suitable for BullMQ Queues and Workers.
 * @param {string} clientName - Diagnostic label (e.g. 'queue-producer', 'worker-tickets')
 * @returns {Redis}
 */
export function createBullMQConnection(clientName = "bullmq-client") {
  const client = new Redis(REDIS_URL, getBullMQRedisOptions({
    connectionName: `zadesk:${clientName}`,
  }));

  client.on("connect", () => {
    logger.info(`[BullMQ:Redis] ${clientName} connecté à Redis`);
  });

  client.on("error", (err) => {
    logger.warn(`[BullMQ:Redis] ${clientName} erreur de connexion: ${err.message}`);
  });

  client.on("close", () => {
    logger.info(`[BullMQ:Redis] ${clientName} connexion fermée`);
  });

  return client;
}

/**
 * Standard Redis key prefix for all Zadesk BullMQ queues.
 * Uses hash tags {zadesk:bull} for safe Redis cluster or namespace isolation.
 */
export const BULLMQ_PREFIX = "{zadesk:bull}";

