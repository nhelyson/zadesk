import { Worker } from "bullmq";
import { createBullMQConnection, BULLMQ_PREFIX } from "../config/bullmqRedis.js";
import { QUEUE_NAMES } from "../queues/queueManager.js";
import { prisma } from "../lib/prisma.js";
import { logger } from "../utils/logger.js";

/**
 * Processor for TICKETS_QUEUE jobs.
 * Enforces strict multi-tenant boundary checks.
 */
export async function processTicketJob(job) {
  const startTime = Date.now();
  const { workspaceId, ticketId, eventType, authorId, targetAgentId, content } = job.data;

  logger.info(`[Worker:Tickets] Début traitement job ${job.id} (${job.name})`, {
    workspaceId,
    ticketId,
    eventType,
  });

  // 1. Multi-tenant Verification: Scope query directly to workspaceId (defense-in-depth)
  const ticket = await prisma.ticket.findFirst({
    where: {
      id: ticketId,
      workspaceId,
    },
    select: { id: true, workspaceId: true, reference: true, title: true, status: true },
  });

  if (!ticket) {
    // Explicit cross-tenant detection: check if ticket exists under another workspace
    const crossTenantCheck = await prisma.ticket.findUnique({
      where: { id: ticketId },
      select: { workspaceId: true },
    });

    if (crossTenantCheck && crossTenantCheck.workspaceId !== workspaceId) {
      const errorMsg = `[SECURITY_VIOLATION] Tentative d'accès cross-tenant: ticket ${ticketId} appartient à ${crossTenantCheck.workspaceId}, pas à ${workspaceId}`;
      logger.error(errorMsg);
      throw new Error(errorMsg);
    }

    logger.warn(`[Worker:Tickets] Ticket ${ticketId} introuvable pour workspace ${workspaceId}. Job ignoré.`);
    return { success: false, reason: "TICKET_NOT_FOUND" };
  }

  // 2. Target Agent Verification (if notification targets a specific agent)
  if (targetAgentId) {
    const membership = await prisma.membership.findUnique({
      where: {
        userId_workspaceId: {
          userId: targetAgentId,
          workspaceId,
        },
      },
    });

    if (!membership) {
      logger.warn(`[Worker:Tickets] L'agent ${targetAgentId} n'appartient pas au workspace ${workspaceId}.`);
      return { success: false, reason: "TARGET_AGENT_NOT_IN_WORKSPACE" };
    }
  }

  // 3. Process the notification activity log
  const activity = await prisma.ticketActivity.create({
    data: {
      ticketId,
      authorId: authorId || null,
      type: "TICKET_NOTIFICATION_DISPATCHED",
      content: content || `Notification envoyée pour l'événement ${eventType}`,
    },
  });

  const durationMs = Date.now() - startTime;
  logger.info(`[Worker:Tickets] Job ${job.id} traité avec succès en ${durationMs}ms`, {
    ticketId,
    activityId: activity.id,
  });

  return {
    success: true,
    reference: ticket.reference,
    activityId: activity.id,
    durationMs,
  };
}

/**
 * Creates and initializes the Tickets Worker.
 * @returns {Worker}
 */
export function createTicketWorker(connectionOverrides = {}) {
  const connection = createBullMQConnection("worker-tickets");

  const worker = new Worker(
    QUEUE_NAMES.TICKETS,
    processTicketJob,
    {
      connection,
      prefix: BULLMQ_PREFIX,
      concurrency: 5,
    }
  );

  worker.on("completed", (job, result) => {
    logger.info(`[Worker:Tickets] Job complété avec succès`, { jobId: job.id, result });
  });

  worker.on("failed", (job, err) => {
    logger.error(`[Worker:Tickets] Job échoué (tentative ${job?.attemptsMade}/${job?.opts?.attempts}): ${err.message}`, err);
  });

  return worker;
}

