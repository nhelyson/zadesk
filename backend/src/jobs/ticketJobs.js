import { queueManager, QUEUE_NAMES } from "../queues/queueManager.js";
import { logger } from "../utils/logger.js";

export const TICKET_JOB_TYPES = {
  NOTIFICATION: "ticket:notification",
  STATUS_AUDIT: "ticket:status_audit",
};

/**
 * Dispatch an asynchronous ticket notification job (assignment, sharing, update).
 * Strictly requires workspaceId for multi-tenant isolation.
 * Uses a deterministic idempotency key based on business event without timestamps.
 */
export async function dispatchTicketNotificationJob({
  workspaceId,
  ticketId,
  eventType,
  authorId,
  targetAgentId,
  content = "",
  eventId = null,
}) {
  if (!workspaceId || !ticketId || !eventType) {
    logger.warn("[TicketJob:Producer] Rejet : workspaceId, ticketId et eventType obligatoires");
    return { success: false, error: "Contexte multi-tenant incomplet." };
  }

  // Deterministic idempotency key: identifies exact business action without volatile timestamps
  // (BullMQ disallows colons ':' in custom job IDs)
  const safeEventType = String(eventType).toLowerCase().replace(/[^a-z0-9]/g, "-");
  const safeTarget = targetAgentId ? String(targetAgentId).replace(/[^a-z0-9]/g, "-") : "all";
  const idempotencyKey = eventId
    ? `ticket-notif-${String(eventId).replace(/[^a-z0-9]/g, "-")}`
    : `ticket-notif-${ticketId}-${safeEventType}-${safeTarget}`;

  return queueManager.addJob(
    QUEUE_NAMES.TICKETS,
    TICKET_JOB_TYPES.NOTIFICATION,
    {
      workspaceId,
      ticketId,
      eventType,
      authorId,
      targetAgentId,
      content,
      eventId,
      enqueuedAt: new Date().toISOString(),
    },
    {
      jobId: idempotencyKey,
    }
  );
}

