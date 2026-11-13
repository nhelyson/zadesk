import { queueManager, QUEUE_NAMES } from "../queues/queueManager.js";

export const MAINTENANCE_JOB_TYPES = {
  CLEANUP_EXPIRED: "maintenance:cleanup_expired",
};

/**
 * Dispatch an asynchronous database cleanup job for expired temporary data.
 */
export async function dispatchMaintenanceCleanupJob({ triggeredBy = "system" } = {}) {
  // Idempotent window-based job ID (one cleanup per 5-minute bucket, no colons)
  const bucket = Math.floor(Date.now() / (5 * 60 * 1000));
  const idempotencyKey = `cleanup-bucket-${bucket}`;

  return queueManager.addJob(
    QUEUE_NAMES.MAINTENANCE,
    MAINTENANCE_JOB_TYPES.CLEANUP_EXPIRED,
    {
      triggeredBy,
      timestamp: Date.now(),
    },
    {
      jobId: idempotencyKey,
      attempts: 2,
    }
  );
}

/**
 * Register a cluster-wide recurring maintenance scheduler using BullMQ native repeatability.
 * Persists in Redis and prevents duplicate executions across multiple backend instances.
 */
export async function scheduleRecurringMaintenance() {
  const queue = queueManager.getQueue(QUEUE_NAMES.MAINTENANCE);
  
  if (typeof queue.upsertJobScheduler === "function") {
    return queue.upsertJobScheduler(
      "recurring-maintenance-cleanup",
      { every: 10 * 60 * 1000 }, // Every 10 minutes
      {
        name: MAINTENANCE_JOB_TYPES.CLEANUP_EXPIRED,
        data: { triggeredBy: "scheduled_cron" },
        opts: {
          attempts: 2,
          removeOnComplete: { count: 20 },
          removeOnFail: { count: 50 },
        },
      }
    );
  } else {
    return queue.add(
      MAINTENANCE_JOB_TYPES.CLEANUP_EXPIRED,
      { triggeredBy: "scheduled_cron" },
      {
        repeat: { every: 10 * 60 * 1000 },
        jobId: "recurring-maintenance-cleanup",
        attempts: 2,
      }
    );
  }
}

/**
 * Enregistre le planificateur récurrent natif BullMQ pour le dispatcher Transactional Outbox.
 * S'exécute périodiquement de manière distribuée sans setInterval in-memory.
 */
export async function scheduleRecurringOutboxDispatcher({ intervalMs = 15000 } = {}) {
  const queue = queueManager.getQueue(QUEUE_NAMES.MAINTENANCE);

  if (typeof queue.upsertJobScheduler === "function") {
    return queue.upsertJobScheduler(
      "recurring-outbox-dispatcher",
      { every: intervalMs },
      {
        name: "outbox:dispatch_pending",
        data: { triggeredBy: "scheduled_outbox_cron" },
        opts: {
          attempts: 1,
          removeOnComplete: { count: 20 },
          removeOnFail: { count: 50 },
        },
      }
    );
  } else {
    return queue.add(
      "outbox:dispatch_pending",
      { triggeredBy: "scheduled_outbox_cron" },
      {
        repeat: { every: intervalMs },
        jobId: "recurring-outbox-dispatcher",
        attempts: 1,
      }
    );
  }
}

/**
 * Enregistre le planificateur récurrent natif BullMQ pour le traitement des rétrogradations échues (Phase D.1).
 * Exécute applyScheduledDowngrade de manière distribuée, idempotente et sans duplication.
 */
export async function scheduleRecurringDowngradeProcessor({ intervalMs = 60000 } = {}) {
  const queue = queueManager.getQueue(QUEUE_NAMES.MAINTENANCE);

  if (typeof queue.upsertJobScheduler === "function") {
    return queue.upsertJobScheduler(
      "recurring-downgrade-processor",
      { every: intervalMs },
      {
        name: "billing:process_scheduled_downgrades",
        data: { triggeredBy: "scheduled_billing_cron" },
        opts: {
          attempts: 2,
          removeOnComplete: { count: 20 },
          removeOnFail: { count: 50 },
        },
      }
    );
  } else {
    return queue.add(
      "billing:process_scheduled_downgrades",
      { triggeredBy: "scheduled_billing_cron" },
      {
        repeat: { every: intervalMs },
        jobId: "recurring-downgrade-processor",
        attempts: 2,
      }
    );
  }
}




