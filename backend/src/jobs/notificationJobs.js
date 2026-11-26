import { queueManager, QUEUE_NAMES } from "../queues/queueManager.js";
import { logger } from "../utils/logger.js";

export const NOTIFICATION_JOB_TYPES = {
  INVITATION_EMAIL: "notification:invitation_email",
  AGENT_ALERT: "notification:agent_alert",
  CUSTOMER_REPLY_ALERT: "notification:customer_reply_alert",
  AGENT_MESSAGE_ALERT: "notification:agent_message_alert",
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

/**
 * Notify a portal customer (Web Push + Email fallback) when an agent replies.
 */
export async function dispatchCustomerReplyAlertJob({
  workspaceId,
  conversationId,
  messageId,
  senderName,
  contentPreview,
}) {
  if (!workspaceId || !conversationId || !messageId) return { success: false };

  return queueManager.addJob(
    QUEUE_NAMES.NOTIFICATIONS,
    NOTIFICATION_JOB_TYPES.CUSTOMER_REPLY_ALERT,
    {
      workspaceId,
      conversationId,
      messageId,
      senderName: senderName || "Conseiller SAV",
      contentPreview: (contentPreview || "").slice(0, 140),
      enqueuedAt: new Date().toISOString(),
    },
    {
      jobId: `cust-reply-${messageId}`,
      attempts: 2,
      backoff: { type: "exponential", delay: 1500 },
    }
  );
}

/**
 * Notify assigned/available agents (Web Push + Email fallback) when a client sends a message.
 */
export async function dispatchAgentMessageAlertJob({
  workspaceId,
  conversationId,
  messageId,
  customerName,
  assignedAgentId = null,
  contentPreview = "",
  isNewConversation = false,
}) {
  if (!workspaceId || !conversationId || !messageId) return { success: false };

  return queueManager.addJob(
    QUEUE_NAMES.NOTIFICATIONS,
    NOTIFICATION_JOB_TYPES.AGENT_MESSAGE_ALERT,
    {
      workspaceId,
      conversationId,
      messageId,
      customerName: customerName || "Client",
      assignedAgentId,
      contentPreview: (contentPreview || "").slice(0, 140),
      isNewConversation: Boolean(isNewConversation),
      enqueuedAt: new Date().toISOString(),
    },
    {
      jobId: `agent-msg-${messageId}`,
      attempts: 2,
      backoff: { type: "exponential", delay: 1500 },
    }
  );
}

