import crypto from "crypto";
import { prisma } from "../lib/prisma.js";
import { queueManager } from "../queues/queueManager.js";
import { logger } from "../utils/logger.js";

/**
 * Assure la compatibilité d'initialisation de la table Outbox (gérée par migration Prisma).
 */
export async function ensureOutboxTable() {
  // Géré nativement par la migration Prisma 20261102000000_add_transactional_outbox
  return true;
}

/**
 * Rejeu administratif sécurisé des événements Outbox en échec.
 * Implémente une réservation atomique persistante pour éliminer tout risque de double exécution concurrente.
 *
 * @param {Object} params
 * @param {string} params.userId - Identifiant de l'administrateur exécutant le rejeu
 * @param {string} params.workspaceId - Identifiant du workspace cible (isolation multi-tenant stricte)
 * @param {number} [params.limit=50] - Nombre maximum d'événements à rejouer
 * @param {number} [params.timeoutMinutes=10] - Durée de validité du verrou de réservation
 * @returns {Promise<{ replayedCount: number, releasedCount: number, reservationId: string }>}
 */
export async function retryFailedOutboxEvents({
  userId,
  workspaceId,
  limit = 50,
  timeoutMinutes = 10,
}) {
  if (!userId || !workspaceId) {
    const err = new Error("L'identifiant utilisateur et l'identifiant du workspace sont obligatoires.");
    err.status = 400;
    throw err;
  }

  // 1. Contrôle d'autorisation strict : Seul OWNER ou ADMIN du workspace peut rejouer les événements
  const membership = await prisma.membership.findUnique({
    where: {
      userId_workspaceId: { userId, workspaceId },
    },
    include: { user: { select: { email: true } } },
  });

  if (!membership || (membership.role !== "OWNER" && membership.role !== "ADMIN")) {
    const err = new Error("Accès refusé : Seul le propriétaire ou un administrateur du workspace peut rejouer les événements en échec.");
    err.status = 403;
    throw err;
  }

  const effectiveLimit = Math.min(Math.max(1, parseInt(limit, 10) || 50), 100);
  const reservationId = `replay-${Date.now()}-${crypto.randomBytes(6).toString("hex")}`;

  // 2. Réservation atomique persistante en base (dans une transaction SQL très courte)
  // Utilisation de FOR UPDATE SKIP LOCKED combiné à un passage en PROCESSING + lockedBy = reservationId
  let reservedEvents = [];
  try {
    reservedEvents = await prisma.$transaction(
      async (tx) => {
        const rows = await tx.$queryRawUnsafe(
          `WITH candidates AS (
            SELECT id FROM outbox_events
            WHERE "workspaceId" = $1
              AND (
                status = 'FAILED'
                OR (status = 'PROCESSING' AND "lockedAt" < NOW() - ($2 || ' minutes')::interval)
              )
            ORDER BY "createdAt" ASC
            LIMIT $3
            FOR UPDATE SKIP LOCKED
          )
          UPDATE outbox_events
          SET status = 'PROCESSING',
              "lockedBy" = $4,
              "lockedAt" = NOW()
          FROM candidates
          WHERE outbox_events.id = candidates.id
          RETURNING outbox_events.id, outbox_events."jobId", outbox_events."queueName";`,
          workspaceId,
          String(timeoutMinutes),
          effectiveLimit,
          reservationId
        );
        return rows || [];
      },
      { timeout: 5000 }
    );
  } catch (txErr) {
    logger.error(`[Outbox:AdminReplay] Échec de la réservation atomique: ${txErr.message}`, txErr);
    throw txErr;
  }

  if (reservedEvents.length === 0) {
    return { replayedCount: 0, releasedCount: 0, reservationId };
  }

  const idsToReplay = [];
  const idsToRelease = [];

  // 3. Vérification de l'état BullMQ et purge de Redis hors transaction SQL
  try {
    for (const event of reservedEvents) {
      if (event.jobId && event.queueName) {
        try {
          const queue = queueManager.getQueue(event.queueName);
          if (queue) {
            const existingJob = await queue.getJob(event.jobId);
            if (existingJob) {
              const state = await existingJob.getState();
              // RÈGLE ABSOLUE : Ne jamais interrompre un job en cours d'exécution active dans BullMQ
              if (state === "active") {
                logger.warn(
                  `[Outbox:AdminReplay] Job ${event.jobId} actuellement actif dans BullMQ. Rejeu ignoré pour cet événement.`
                );
                idsToRelease.push(event.id);
                continue;
              }
              // Purge du job inactif dans Redis
              await existingJob.remove();
            }
          }
          idsToReplay.push(event.id);
        } catch (queueErr) {
          logger.warn(
            `[Outbox:AdminReplay] Erreur BullMQ sur job ${event.jobId} (${queueErr.message}). Libération sans rejeu.`
          );
          idsToRelease.push(event.id);
        }
      } else {
        idsToReplay.push(event.id);
      }
    }

    // 4. Finalisation atomique des statuts en base
    // Les événements vérifiés basculent en PENDING pour traitement par le dispatcher
    if (idsToReplay.length > 0) {
      await prisma.$executeRawUnsafe(
        `UPDATE outbox_events
         SET status = 'PENDING',
             attempts = 0,
             "lockedBy" = NULL,
             "lockedAt" = NULL,
             "lastError" = NULL,
             "updatedAt" = NOW()
         WHERE id = ANY($1::text[]) AND "lockedBy" = $2`,
        idsToReplay,
        reservationId
      );
    }

    // Les événements non rejouables (actifs ou en erreur) sont libérés et restent FAILED
    if (idsToRelease.length > 0) {
      await prisma.$executeRawUnsafe(
        `UPDATE outbox_events
         SET status = 'FAILED',
             "lockedBy" = NULL,
             "lockedAt" = NULL,
             "updatedAt" = NOW()
         WHERE id = ANY($1::text[]) AND "lockedBy" = $2`,
        idsToRelease,
        reservationId
      );
    }

    logger.info(
      `[Outbox:AdminReplay] Rejeu complété : ${idsToReplay.length} remis en PENDING, ${idsToRelease.length} libérés FAILED`,
      {
        workspaceId,
        initiatedBy: membership.user.email,
        reservationId,
      }
    );

    return {
      replayedCount: idsToReplay.length,
      releasedCount: idsToRelease.length,
      reservationId,
    };
  } catch (err) {
    // 5. En cas d'exception inattendue, libérer immédiatement les réservations détenues
    logger.error(
      `[Outbox:AdminReplay] Erreur durant le traitement, libération des réservations de ${reservationId}: ${err.message}`
    );
    try {
      await prisma.$executeRawUnsafe(
        `UPDATE outbox_events
         SET status = 'FAILED',
             "lockedBy" = NULL,
             "lockedAt" = NULL,
             "updatedAt" = NOW()
         WHERE "lockedBy" = $1`,
        reservationId
      );
    } catch (cleanupErr) {
      logger.error(`[Outbox:AdminReplay] Échec de libération de secours: ${cleanupErr.message}`);
    }
    throw err;
  }
}
