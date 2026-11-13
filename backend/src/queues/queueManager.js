import { Queue } from "bullmq";
import { createBullMQConnection, BULLMQ_PREFIX } from "../config/bullmqRedis.js";
import { logger } from "../utils/logger.js";

export const QUEUE_NAMES = {
  TICKETS: "tickets",
  NOTIFICATIONS: "notifications",
  MAINTENANCE: "maintenance",
  METRICS: "metrics",
};

/**
 * Standard job retention and retry configuration.
 * Prevents memory bloat in Redis (128MB ceiling with noeviction).
 */
export const DEFAULT_JOB_OPTIONS = {
  attempts: 3,
  backoff: {
    type: "exponential",
    delay: 2000, // 2s -> 4s -> 8s
  },
  removeOnComplete: {
    count: 100,  // Keep max 100 latest completed jobs
    age: 3600,   // or max 1 hour old
  },
  removeOnFail: {
    count: 500,  // Keep up to 500 failed jobs for incident diagnosis
    age: 86400,  // max 24 hours
  },
};

class QueueManager {
  constructor() {
    this.queues = new Map();
    this.redisConnections = new Map();
  }

  /**
   * Lazily initialize and return a BullMQ Queue instance.
   * @param {string} queueName
   * @returns {Queue}
   */
  getQueue(queueName) {
    if (this.queues.has(queueName)) {
      return this.queues.get(queueName);
    }

    // Producer connection for this queue
    const connection = createBullMQConnection(`queue-producer:${queueName}`);
    this.redisConnections.set(queueName, connection);

    const queue = new Queue(queueName, {
      connection,
      prefix: BULLMQ_PREFIX,
      defaultJobOptions: DEFAULT_JOB_OPTIONS,
    });

    this.queues.set(queueName, queue);
    logger.info(`[BullMQ:QueueManager] File d'attente "${queueName}" initialisée`);
    return queue;
  }

  /**
   * Safe job addition wrapper with error handling.
   * Ensures backend fails gracefully if Redis is OOM or disconnected.
   */
  async addJob(queueName, jobName, data, customOpts = {}) {
    try {
      const queue = this.getQueue(queueName);
      const job = await queue.add(jobName, data, {
        ...DEFAULT_JOB_OPTIONS,
        ...customOpts,
      });

      logger.info(`[BullMQ:Producer] Job ajouté à "${queueName}"`, {
        jobId: job.id,
        jobName,
        workspaceId: data.workspaceId || "global",
      });

      return { success: true, jobId: job.id };
    } catch (err) {
      logger.error(`[BullMQ:Producer] Échec d'ajout du job "${jobName}" à "${queueName}": ${err.message}`, err);
      return { success: false, error: err.message };
    }
  }

  /**
   * Observability: Retrieve metrics (waiting, active, completed, failed, delayed) for all queues.
   * Guarantees all standard queues appear immediately even if no jobs were enqueued yet.
   */
  async getAllQueueMetrics() {
    const metrics = {};
    for (const name of Object.values(QUEUE_NAMES)) {
      try {
        const queue = this.getQueue(name);
        const counts = await queue.getJobCounts("waiting", "active", "completed", "failed", "delayed", "paused");
        metrics[name] = {
          ...counts,
          status: "healthy",
        };
      } catch (err) {
        metrics[name] = {
          waiting: 0,
          active: 0,
          completed: 0,
          failed: 0,
          delayed: 0,
          paused: 0,
          status: "unavailable",
          error: err.message,
        };
      }
    }
    return metrics;
  }

  /**
   * Graceful shutdown of all queue producers and connections.
   */
  async closeAll() {
    logger.info("[BullMQ:QueueManager] Fermeture de toutes les files d'attente...");
    for (const [name, queue] of this.queues.entries()) {
      try {
        await queue.close();
      } catch (e) {
        logger.warn(`[BullMQ:QueueManager] Erreur lors de la fermeture de la file ${name}: ${e.message}`);
      }
    }
    this.queues.clear();

    for (const [name, connection] of this.redisConnections.entries()) {
      try {
        await connection.quit();
      } catch (e) {
        logger.warn(`[BullMQ:QueueManager] Erreur lors de la déconnexion Redis ${name}: ${e.message}`);
      }
    }
    this.redisConnections.clear();
    logger.info("[BullMQ:QueueManager] Toutes les files d'attente ont été fermées proprement.");
  }
}

export const queueManager = new QueueManager();

