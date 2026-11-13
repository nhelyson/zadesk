import crypto from "crypto";
import { prisma } from "../lib/prisma.js";
import { queueManager } from "../queues/queueManager.js";
import { logger } from "../utils/logger.js";

/**
 * Crée un événement Outbox dans la transaction PostgreSQL active.
 * Garantit l'atomicité stricte entre l'opération métier et la persistance de l'événement.
 *
 * @param {import('@prisma/client').Prisma.TransactionClient} tx
 * @param {Object} eventData
 * @returns {Promise<import('@prisma/client').OutboxEvent>}
 */
export async function createOutboxEvent(tx, {
  workspaceId,
  eventType,
  queueName,
  jobName,
  payload,
  jobId = null,
  maxAttempts = 5,
}) {
  if (!workspaceId || !eventType || !queueName || !jobName) {
    throw new Error("Paramètres obligatoires manquants pour createOutboxEvent.");
  }

  return tx.outboxEvent.create({
    data: {
      workspaceId,
      eventType,
      queueName,
      jobName,
      payload,
      jobId,
      maxAttempts,
      status: "PENDING",
    },
  });
}

/**
 * Traite et publie un lot d'événements Outbox vers les files BullMQ.
 *
 * Protocole :
 * 1. Réservation atomique sous FOR UPDATE SKIP LOCKED dans une transaction SQL très courte.
 * 2. Fermeture immédiate de la transaction SQL.
 * 3. Publication réseau vers Redis / BullMQ.
 * 4. Marquage PUBLISHED uniquement après confirmation de l'ajout dans BullMQ.
 * 5. En cas d'indisponibilité Redis, l'événement repasse en PENDING (ou FAILED si maxAttempts atteint).
 * 6. Récupération automatique des événements bloqués en PROCESSING dont le verrou a expiré.
 *
 * @param {Object} [options]
 * @param {number} [options.batchSize=50] - Nombre maximum d'événements traités par lot
 * @param {number} [options.lockTimeoutMinutes=5] - Durée de validité du verrou PROCESSING
 * @returns {Promise<{ processed: number, published: number, failed: number }>}
 */
export async function dispatchOutboxEvents({ batchSize = 50, lockTimeoutMinutes = 5 } = {}) {
  const lockId = `dispatcher-${process.pid}-${crypto.randomBytes(6).toString("hex")}`;
  const effectiveBatchSize = Math.min(Math.max(1, parseInt(batchSize, 10) || 50), 100);

  let reservedEvents = [];

  // Étape 1 & 2 : Réservation atomique en base fermée immédiatement
  try {
    reservedEvents = await prisma.$transaction(
      async (tx) => {
        const rows = await tx.$queryRawUnsafe(
          `WITH candidates AS (
            SELECT id FROM outbox_events
            WHERE (
              status = 'PENDING'
              OR (status = 'PROCESSING' AND "lockedAt" < NOW() - ($1 || ' minutes')::interval)
            )
            ORDER BY "createdAt" ASC
            LIMIT $2
            FOR UPDATE SKIP LOCKED
          )
          UPDATE outbox_events
          SET status = 'PROCESSING',
              "lockedBy" = $3,
              "lockedAt" = NOW()
          FROM candidates
          WHERE outbox_events.id = candidates.id
          RETURNING 
            outbox_events.id,
            outbox_events."workspaceId",
            outbox_events."eventType",
            outbox_events."queueName",
            outbox_events."jobName",
            outbox_events.payload,
            outbox_events."jobId",
            outbox_events.attempts,
            outbox_events."maxAttempts";`,
          String(lockTimeoutMinutes),
          effectiveBatchSize,
          lockId
        );
        return rows || [];
      },
      { timeout: 5000 }
    );
  } catch (err) {
    logger.error(`[OutboxDispatcher] Erreur lors de la réservation atomique: ${err.message}`, err);
    return { processed: 0, published: 0, failed: 0, error: err.message };
  }

  if (reservedEvents.length === 0) {
    return { processed: 0, published: 0, failed: 0 };
  }

  logger.info(`[OutboxDispatcher] ${reservedEvents.length} événements réservés (lockId: ${lockId})`);

  let publishedCount = 0;
  let failedCount = 0;

  // Étape 3, 4 & 5 : Publication BullMQ hors transaction SQL
  for (const event of reservedEvents) {
    try {
      const jobOpts = {};
      if (event.jobId) {
        jobOpts.jobId = event.jobId;
      }

      // Ajout du job dans BullMQ via QueueManager
      const addResult = await queueManager.addJob(
        event.queueName,
        event.jobName,
        event.payload,
        jobOpts
      );

      if (addResult.success) {
        // Confirmation BullMQ reçue : marquer PUBLISHED
        await prisma.outboxEvent.update({
          where: { id: event.id },
          data: {
            status: "PUBLISHED",
            publishedAt: new Date(),
            jobId: addResult.jobId || event.jobId,
            lockedBy: null,
            lockedAt: null,
            lastError: null,
          },
        });
        publishedCount++;
      } else {
        // Échec d'ajout Redis : incrémenter les tentatives et reprogrammer
        const newAttempts = (event.attempts || 0) + 1;
        const isExhausted = newAttempts >= (event.maxAttempts || 5);

        await prisma.outboxEvent.update({
          where: { id: event.id },
          data: {
            status: isExhausted ? "FAILED" : "PENDING",
            attempts: newAttempts,
            lastError: addResult.error || "Échec d'ajout à la file BullMQ",
            lockedBy: null,
            lockedAt: null,
          },
        });
        failedCount++;
      }
    } catch (publishErr) {
      logger.error(`[OutboxDispatcher] Erreur inattendue sur événement ${event.id}: ${publishErr.message}`);
      const newAttempts = (event.attempts || 0) + 1;
      const isExhausted = newAttempts >= (event.maxAttempts || 5);

      try {
        await prisma.outboxEvent.update({
          where: { id: event.id },
          data: {
            status: isExhausted ? "FAILED" : "PENDING",
            attempts: newAttempts,
            lastError: publishErr.message,
            lockedBy: null,
            lockedAt: null,
          },
        });
      } catch (_) {}
      failedCount++;
    }
  }

  logger.info(
    `[OutboxDispatcher] Lot terminé : ${publishedCount} publiés, ${failedCount} échoués / reprogrammés`
  );

  return {
    processed: reservedEvents.length,
    published: publishedCount,
    failed: failedCount,
  };
}

