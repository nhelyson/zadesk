import { Worker } from "bullmq";
import { createBullMQConnection, BULLMQ_PREFIX } from "../config/bullmqRedis.js";
import { QUEUE_NAMES } from "../queues/queueManager.js";
import { prisma } from "../lib/prisma.js";
import { dispatchOutboxEvents } from "../outbox/outboxDispatcher.js";
import { findDueScheduledDowngrades, applyScheduledDowngrade } from "../services/commercialService.js";
import { logger } from "../utils/logger.js";

/**
 * Processor for MAINTENANCE_QUEUE jobs.
 * Cleans expired temporary data, periodically dispatches outbox events,
 * and processes due scheduled commercial plan downgrades.
 */
export async function processMaintenanceJob(job) {
  const startTime = Date.now();
  const now = new Date();

  // 0. Traitement des rétrogradations échues (Billing Worker Phase D.1)
  if (job.name === "billing:process_scheduled_downgrades") {
    logger.info(`[Worker:Maintenance] Exécution planifiée du traitement des rétrogradations (Job ${job.id})`);
    const dueDowngrades = await findDueScheduledDowngrades();
    let appliedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const item of dueDowngrades) {
      try {
        const result = await applyScheduledDowngrade(item.workspaceId);
        if (result.applied) {
          appliedCount++;
        } else {
          skippedCount++;
        }
      } catch (err) {
        errorCount++;
        logger.error(`[Worker:Maintenance] Échec d'application pour workspace ${item.workspaceId}: ${err.message}`, err);
      }
    }

    return {
      success: true,
      type: "billing_downgrade_processing",
      processedCount: dueDowngrades.length,
      appliedCount,
      skippedCount,
      errorCount,
      durationMs: Date.now() - startTime,
    };
  }

  // 0.1 Traitement du dispatcher Transactional Outbox
  if (job.name === "outbox:dispatch_pending" || job.name === "maintenance:outbox_dispatch") {
    logger.info(`[Worker:Maintenance] Exécution planifiée du dispatcher Outbox (Job ${job.id})`);
    const outboxResult = await dispatchOutboxEvents({ batchSize: 50, lockTimeoutMinutes: 5 });
    return {
      success: true,
      type: "outbox_dispatch",
      ...outboxResult,
      durationMs: Date.now() - startTime,
    };
  }

  logger.info(`[Worker:Maintenance] Début de maintenance/nettoyage (Job ${job.id})`);

  let deletedPendingRegs = 0;
  let deletedOtpTokens = 0;
  let deletedTicketShares = 0;
  let deletedSessions = 0;

  try {
    // 1. Expired pending registrations
    const pendingResult = await prisma.pendingRegistration.deleteMany({
      where: { expiresAt: { lt: now } },
    });
    deletedPendingRegs = pendingResult.count;

    // 2. Expired OTP tokens
    const otpResult = await prisma.otpToken.deleteMany({
      where: { expiresAt: { lt: now } },
    });
    deletedOtpTokens = otpResult.count;

    // 3. Expired temporary ticket shares
    const sharesResult = await prisma.ticketShare.deleteMany({
      where: {
        expiresAt: {
          not: null,
          lt: now,
        },
      },
    });
    deletedTicketShares = sharesResult.count;

    // 4. Expired user sessions (strictly lt: now, active sessions are never touched)
    const sessionsResult = await prisma.session.deleteMany({
      where: { expiresAt: { lt: now } },
    });
    deletedSessions = sessionsResult.count;
  } catch (err) {
    logger.error(`[Worker:Maintenance] Erreur lors du nettoyage: ${err.message}`, err);
    throw err;
  }

  const durationMs = Date.now() - startTime;
  logger.info(`[Worker:Maintenance] Nettoyage terminé en ${durationMs}ms`, {
    deletedPendingRegs,
    deletedOtpTokens,
    deletedTicketShares,
    deletedSessions,
  });

  return {
    success: true,
    deletedPendingRegs,
    deletedOtpTokens,
    deletedTicketShares,
    deletedSessions,
    durationMs,
  };
}

/**
 * Creates and initializes the Maintenance Worker.
 * @returns {Worker}
 */
export function createMaintenanceWorker(connectionOverrides = {}) {
  const connection = createBullMQConnection("worker-maintenance");

  const worker = new Worker(
    QUEUE_NAMES.MAINTENANCE,
    processMaintenanceJob,
    {
      connection,
      prefix: BULLMQ_PREFIX,
      concurrency: 1, // Single concurrency to prevent concurrent lock contention
    }
  );

  worker.on("completed", (job, result) => {
    logger.info(`[Worker:Maintenance] Job complété avec succès`, { jobId: job.id, result });
  });

  worker.on("failed", (job, err) => {
    logger.error(`[Worker:Maintenance] Job échoué (tentative ${job?.attemptsMade}/${job?.opts?.attempts}): ${err.message}`, err);
  });

  return worker;
}

