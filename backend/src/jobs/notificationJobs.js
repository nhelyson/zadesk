import { queueManager, QUEUE_NAMES } from "../queues/queueManager.js";
import { logger } from "../utils/logger.js";

export const NOTIFICATION_JOB_TYPES = {
  INVITATION_EMAIL: "notification:invitation_email",
  AGENT_ALERT: "notification:agent_alert",
};

/**
 * Dispatch an asynchronous workspace invitation email job.
 * Strictly preserves workspace tenant context and avoids blocking the HTTP API.
 */
export async function dispatchInvitationEmailJob({
  workspaceId,
  invitationId,
  email,
  role,
  invitedById,
}) {
  if (!workspaceId || !invitationId || !email) {
    logger.warn("[NotificationJob:Producer] Rejet : paramètres d'invitation incomplets");
    return { success: false, error: "Contexte d'invitation incomplet." };
  }

  // Idempotency: Exactly one invitation email job per invitation ID (no colons)
  const idempotencyKey = `invite-email-${invitationId}`;

  return queueManager.addJob(
    QUEUE_NAMES.NOTIFICATIONS,
    NOTIFICATION_JOB_TYPES.INVITATION_EMAIL,
    {
      workspaceId,
      invitationId,
      email: email.toLowerCase().trim(),
      role,
      invitedById,
      enqueuedAt: new Date().toISOString(),
    },
    {
      jobId: idempotencyKey,
      attempts: 3,
      backoff: { type: "exponential", delay: 2000 },
    }
  );
}

