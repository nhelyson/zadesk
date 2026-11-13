import { queueManager, QUEUE_NAMES } from "../queues/queueManager.js";
import { logger } from "../utils/logger.js";

export const METRICS_JOB_TYPES = {
  REFRESH_WORKSPACE_STATS: "metrics:refresh_workspace_stats",
};

/**
 * Dispatch an asynchronous workspace metrics recomputation job.
 */
export async function dispatchMetricsRefreshJob({ workspaceId, triggeredBy = "event" }) {
  if (!workspaceId) {
    logger.warn("[MetricsJob:Producer] Rejet : workspaceId obligatoire");
    return { success: false, error: "workspaceId manquant" };
  }

  // Coalesce rapid updates to at most once every 10 seconds per workspace (no colons)
  const bucket = Math.floor(Date.now() / 10000);
  const idempotencyKey = `metrics-${workspaceId}-${bucket}`;

  return queueManager.addJob(
    QUEUE_NAMES.METRICS,
    METRICS_JOB_TYPES.REFRESH_WORKSPACE_STATS,
    {
      workspaceId,
      triggeredBy,
      enqueuedAt: new Date().toISOString(),
    },
    {
      jobId: idempotencyKey,
      attempts: 2,
    }
  );
}

