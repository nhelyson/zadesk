import { Worker } from "bullmq";
import { createBullMQConnection, BULLMQ_PREFIX } from "../config/bullmqRedis.js";
import { QUEUE_NAMES } from "../queues/queueManager.js";
import { getWorkspaceDashboardStats, getDashboardStatsCacheKey } from "../services/workspaceService.js";
import { cacheService } from "../cache/cacheService.js";
import { logger } from "../utils/logger.js";

/**
 * Processor for METRICS_QUEUE jobs.
 * Recomputes and warms up dashboard KPI caches asynchronously.
 */
export async function processMetricsJob(job) {
  const startTime = Date.now();
  const { workspaceId, triggeredBy } = job.data;

  logger.info(`[Worker:Metrics] Début rafraîchissement métriques (Job ${job.id})`, {
    workspaceId,
    triggeredBy,
  });

  try {
    const stats = await getWorkspaceDashboardStats(workspaceId);
    
    // Warm up the application cache using the identical key consumed by the HTTP route
    const cacheKey = getDashboardStatsCacheKey(workspaceId);
    await cacheService.set(cacheKey, stats, 300); // 5 minutes TTL

    const durationMs = Date.now() - startTime;
    logger.info(`[Worker:Metrics] Métriques rafraîchies pour workspace ${workspaceId} en ${durationMs}ms`);

    return {
      success: true,
      workspaceId,
      cached: true,
      cacheKey,
      durationMs,
    };
  } catch (err) {
    logger.error(`[Worker:Metrics] Erreur calcul métriques pour ${workspaceId}: ${err.message}`, err);
    throw err;
  }
}

/**
 * Creates and initializes the Metrics Worker.
 * @returns {Worker}
 */
export function createMetricsWorker(connectionOverrides = {}) {
  const connection = createBullMQConnection("worker-metrics");

  const worker = new Worker(
    QUEUE_NAMES.METRICS,
    processMetricsJob,
    {
      connection,
      prefix: BULLMQ_PREFIX,
      concurrency: 3,
    }
  );

  worker.on("completed", (job, result) => {
    logger.info(`[Worker:Metrics] Job complété avec succès`, { jobId: job.id, result });
  });

  worker.on("failed", (job, err) => {
    logger.error(`[Worker:Metrics] Job échoué (tentative ${job?.attemptsMade}/${job?.opts?.attempts}): ${err.message}`, err);
  });

  return worker;
}

