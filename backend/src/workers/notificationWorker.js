import { Worker } from "bullmq";
import { createBullMQConnection, BULLMQ_PREFIX } from "../config/bullmqRedis.js";
import { QUEUE_NAMES } from "../queues/queueManager.js";
import { NOTIFICATION_JOB_TYPES } from "../jobs/notificationJobs.js";
import { prisma } from "../lib/prisma.js";
import { getRedisClient, isRedisReady } from "../config/redis.js";
import {
  sendInvitationEmail,
  sendNotificationAlertEmail,
  RateLimitError,
  maskEmail,
} from "../services/zavuService.js";
import { sendWebPushToSubscriptions } from "../services/pushNotificationService.js";
import { env } from "../config/env.js";
import { logger } from "../utils/logger.js";

/**
 * Stratégie de backoff personnalisée pour BullMQ.
 * Respecte le délai Retry-After (HTTP 429) ou applique un backoff exponentiel.
 */
export const notificationBackoffStrategy = (attemptsMade, type, err, job) => {
  if (err instanceof RateLimitError || err?.name === "RateLimitError" || err?.status === 429) {
    if (err.retryAfterMs && err.retryAfterMs > 0) {
      return err.retryAfterMs;
    }
    return 60000;
  }
  return Math.round(Math.pow(2, Math.max(0, attemptsMade - 1)) * 2000 + Math.random() * 500);
};

/**
 * Nettoie de manière cohérente l'état de dispatch d'une invitation déjà acceptée.
 * Garantit que l'invitation ne reste pas bloquée en SENDING, ne repasse jamais en PENDING,
 * et ne sera jamais réexpédiée.
 */
export async function cleanupAcceptedInvitationDispatchState({
  invitationId,
  workspaceId,
  invitation,
  tx = prisma,
}) {
  if (invitation) {
    invitation.dispatchLockedBy = null;
    if (invitation.dispatchStatus === "SENDING") {
      invitation.dispatchStatus = "SENT";
    }
  }

  try {
    await tx.workspaceInvitation.updateMany({
      where: { id: invitationId, workspaceId, acceptedAt: { not: null } },
      data: {
        dispatchLockedBy: null,
        dispatchStatus: "SENT",
      },
    });
  } catch (_) {}
}

async function checkAndSetEmailCooldown(cooldownKey, ttlSeconds = 900) {
  if (!isRedisReady()) return false;
  try {
    const redis = getRedisClient();
    const exists = await redis.get(cooldownKey);
    if (exists) return true; // throttled
    await redis.set(cooldownKey, "1", "EX", ttlSeconds);
    return false;
  } catch {
    return false;
  }
}

async function processCustomerReplyAlertJob(job) {
  const { workspaceId, conversationId, messageId, senderName, contentPreview } = job.data;

  const conversation = await prisma.conversation.findFirst({
    where: { id: conversationId, workspaceId },
    include: {
      workspace: { select: { id: true, name: true, slug: true } },
    },
  });

  if (!conversation || !conversation.workspace) {
    return { success: false, reason: "CONVERSATION_NOT_FOUND" };
  }

  const companyName = conversation.workspace.name;
  const targetUrl = `/entreprises/${conversation.workspace.slug}?conv=${conversationId}`;
  const fullUrl = `${env.FRONTEND_URL}${targetUrl}`;

  const pushSubs = await prisma.pushSubscription.findMany({
    where: {
      workspaceId,
      conversationId,
      recipientType: "CUSTOMER",
    },
  });

  let pushResult = { sent: 0, failed: 0, removed: 0 };
  if (pushSubs.length > 0) {
    pushResult = await sendWebPushToSubscriptions(pushSubs, {
      title: `${companyName} vous a répondu`,
      body: contentPreview || `${senderName || "Un conseiller"} vient de vous répondre.`,
      url: targetUrl,
      tag: `zalisk-msg-${messageId}`,
      icon: "/icons/icon-192x192.png",
    });
  }

  let emailSent = false;
  if (pushResult.sent === 0 && conversation.customerEmail) {
    const throttled = await checkAndSetEmailCooldown(
      `zadesk:notif:email:customer:${conversationId}`,
      900
    );
    if (!throttled) {
      const emailRes = await sendNotificationAlertEmail({
        to: conversation.customerEmail,
        subject: `Nouvelle réponse de ${companyName} — Zalisk`,
        heading: `Bonjour ${conversation.customerName || ""},\n\nLe service client de ${companyName} a répondu à votre demande :`,
        body: `« ${contentPreview || "Consultez votre fil de discussion en ligne."} »`,
        ctaLabel: "Voir la réponse et continuer l'échange",
        ctaUrl: fullUrl,
        workspaceName: companyName,
      });
      emailSent = Boolean(emailRes?.success);
    }
  }

  return { success: true, pushResult, emailSent };
}

async function processAgentMessageAlertJob(job) {
  const {
    workspaceId,
    conversationId,
    messageId,
    customerName,
    assignedAgentId,
    contentPreview,
    isNewConversation,
  } = job.data;

  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: { id: true, name: true },
  });
  if (!workspace) {
    return { success: false, reason: "WORKSPACE_NOT_FOUND" };
  }

  let targetUserIds = [];
  if (assignedAgentId) {
    targetUserIds = [assignedAgentId];
  } else {
    // Unassigned conversations are only visible to supervision roles in REST: never leak preview content to AGENTs
    const supervisorMembers = await prisma.membership.findMany({
      where: {
        workspaceId,
        status: "ACTIVE",
        role: { in: ["OWNER", "ADMIN", "MANAGER"] },
      },
      select: { userId: true },
      take: 15,
    });
    targetUserIds = supervisorMembers.map((m) => m.userId);
  }

  if (targetUserIds.length === 0) {
    return { success: true, recipients: 0 };
  }

  const [users, profiles, allSubs] = await Promise.all([
    prisma.user.findMany({
      where: { id: { in: targetUserIds } },
      select: { id: true, email: true, firstName: true },
    }),
    prisma.agentProfile.findMany({
      where: { workspaceId, userId: { in: targetUserIds } },
      select: { userId: true, notificationApp: true, notificationEmail: true },
    }),
    prisma.pushSubscription.findMany({
      where: { workspaceId, recipientType: "AGENT", userId: { in: targetUserIds } },
    }),
  ]);

  const profileMap = new Map(profiles.map((p) => [p.userId, p]));
  const subsByUser = new Map();
  for (const sub of allSubs) {
    if (!subsByUser.has(sub.userId)) subsByUser.set(sub.userId, []);
    subsByUser.get(sub.userId).push(sub);
  }

  const targetUrl = `/app/conversations?id=${conversationId}`;
  const fullUrl = `${env.FRONTEND_URL}${targetUrl}`;

  let totalPushSent = 0;
  let totalEmailsSent = 0;

  for (const u of users) {
    const profile = profileMap.get(u.id);
    const allowPush = profile ? profile.notificationApp !== false : true;
    const allowEmail = profile ? profile.notificationEmail !== false : true;
    const userSubs = subsByUser.get(u.id) || [];

    let userPushSent = 0;
    if (allowPush && userSubs.length > 0) {
      const res = await sendWebPushToSubscriptions(userSubs, {
        title: isNewConversation
          ? `Nouveau client · ${customerName}`
          : `${customerName} vous a écrit`,
        body: contentPreview || "Nouveau message client sur Zalisk.",
        url: targetUrl,
        tag: `zalisk-msg-${messageId}`,
        icon: "/icons/icon-192x192.png",
      });
      userPushSent = res.sent;
      totalPushSent += res.sent;
    }

    if (userPushSent === 0 && allowEmail && u.email) {
      const throttled = await checkAndSetEmailCooldown(
        `zadesk:notif:email:agent:${u.id}:${conversationId}`,
        900
      );
      if (!throttled) {
        const emailRes = await sendNotificationAlertEmail({
          to: u.email,
          subject: `[${workspace.name}] ${
            isNewConversation ? `Nouvelle demande de ${customerName}` : `Nouveau message de ${customerName}`
          }`,
          heading: `Bonjour ${u.firstName || "Conseiller"},\n\nLe client ${customerName} attend votre réponse sur ${workspace.name} :`,
          body: `« ${contentPreview || "Nouveau message reçu."} »`,
          ctaLabel: "Répondre dans Zalisk",
          ctaUrl: fullUrl,
          workspaceName: workspace.name,
        });
        if (emailRes?.success) totalEmailsSent += 1;
      }
    }
  }

  return { success: true, totalPushSent, totalEmailsSent };
}

/**
 * Processor for NOTIFICATIONS_QUEUE jobs.
 * Enforces strict multi-tenant boundary checks, idempotency, resilient state transitions,
 * and zero secret exposure in logs.
 */
export async function processNotificationJob(job) {
  if (job?.name === NOTIFICATION_JOB_TYPES.CUSTOMER_REPLY_ALERT) {
    return processCustomerReplyAlertJob(job);
  }
  if (job?.name === NOTIFICATION_JOB_TYPES.AGENT_MESSAGE_ALERT) {
    return processAgentMessageAlertJob(job);
  }

  const startTime = Date.now();
  const { workspaceId, invitationId, email, role, invitedById } = job.data;
  const workerInstanceId = `worker-${process.pid}-${Date.now()}`;
  const now = new Date();

  logger.info(`[Worker:Notifications] Début traitement job ${job.id} (${job.name})`, {
    workspaceId,
    invitationId,
    recipient: maskEmail(email),
  });

  // 1. Contrôle multi-tenant strict & lecture préalable
  const invitation = await prisma.workspaceInvitation.findFirst({
    where: {
      id: invitationId,
      workspaceId,
    },
    include: {
      workspace: { select: { id: true, name: true } },
      invitedBy: { select: { id: true, firstName: true, lastName: true } },
    },
  });

  if (!invitation) {
    const crossTenantCheck = await prisma.workspaceInvitation.findUnique({
      where: { id: invitationId },
      select: { workspaceId: true },
    });

    if (crossTenantCheck && crossTenantCheck.workspaceId !== workspaceId) {
      const errorMsg = `[SECURITY_VIOLATION] Tentative d'accès cross-tenant: invitation ${invitationId} appartient à ${crossTenantCheck.workspaceId}, pas à ${workspaceId}`;
      logger.error(errorMsg);
      throw new Error(errorMsg);
    }

    logger.warn(`[Worker:Notifications] Invitation ${invitationId} introuvable pour workspace ${workspaceId}. Job ignoré.`);
    return { success: false, reason: "INVITATION_NOT_FOUND" };
  }

  // 2. CORRECTION 1 — Idempotency Check & Nettoyage d'état si déjà acceptée
  if (invitation.acceptedAt) {
    logger.info(`[Worker:Notifications] L'invitation ${invitationId} a déjà été acceptée.`);
    await cleanupAcceptedInvitationDispatchState({
      invitationId,
      workspaceId,
      invitation,
    });
    return { success: true, reason: "ALREADY_ACCEPTED" };
  }

  // Vérification d'expiration
  if (now > new Date(invitation.expiresAt)) {
    logger.warn(`[Worker:Notifications] L'invitation ${invitationId} a expiré.`);
    try {
      await prisma.workspaceInvitation.updateMany({
        where: { id: invitationId, workspaceId, dispatchStatus: { not: "SENT" } },
        data: {
          dispatchStatus: "FAILED",
          dispatchError: "EXPIRED_BEFORE_DISPATCH",
          dispatchLockedBy: null,
        },
      });
    } catch (_) {}
    return { success: false, reason: "INVITATION_EXPIRED" };
  }

  // Idempotence : si l'invitation a déjà le statut SENT
  if (invitation.dispatchStatus === "SENT") {
    logger.info(`[Worker:Notifications] L'invitation ${invitationId} a déjà le statut SENT.`);
    return { success: true, reason: "ALREADY_SENT", alreadyDispatched: true };
  }

  // 3. Robust Idempotency Check for Retries (AuditLog)
  const existingAudit = await prisma.auditLog.findFirst({
    where: {
      workspaceId,
      entityId: invitationId,
      action: "INVITATION_EMAIL_DISPATCHED",
    },
  });

  if (existingAudit) {
    logger.info(`[Worker:Notifications] Email d'invitation déjà expédié pour ${invitationId} (AuditLog #${existingAudit.id}). Idempotence assurée sans re-dispatch.`);
    try {
      await prisma.workspaceInvitation.updateMany({
        where: { id: invitationId, workspaceId },
        data: { dispatchStatus: "SENT", dispatchLockedBy: null },
      });
    } catch (_) {}
    return {
      success: true,
      invitationId,
      email,
      alreadyDispatched: true,
      auditLogId: existingAudit.id,
      durationMs: Date.now() - startTime,
    };
  }

  // 4. Réservation conditionnelle (SENDING)
  try {
    const lockResult = await prisma.workspaceInvitation.updateMany({
      where: {
        id: invitationId,
        workspaceId,
        acceptedAt: null,
        expiresAt: { gt: now },
        OR: [
          { dispatchStatus: "PENDING" },
          { dispatchStatus: null },
          {
            dispatchStatus: "SENDING",
            dispatchStartedAt: { lt: new Date(Date.now() - 5 * 60 * 1000) },
          },
        ],
      },
      data: {
        dispatchStatus: "SENDING",
        dispatchStartedAt: now,
        dispatchLockedBy: workerInstanceId,
        dispatchAttempts: { increment: 1 },
      },
    });

    if (lockResult.count === 0 && invitation.dispatchStatus === "SENDING" && invitation.dispatchLockedBy !== workerInstanceId) {
      logger.warn(`[Worker:Notifications] Invitation ${invitationId} verrouillée par un autre worker (${invitation.dispatchLockedBy}).`);
      return { success: true, reason: "CONCURRENT_DISPATCH_LOCKED" };
    }
  } catch (_) {}

  // 5. Expédition externe via Zavu
  const inviteLink = `${env.FRONTEND_URL}/invite/${invitation.token}`;
  const inviterName = invitation.invitedBy
    ? `${invitation.invitedBy.firstName} ${invitation.invitedBy.lastName}`.trim()
    : "L'équipe Zadesk";

  const emailRes = await sendInvitationEmail({
    to: email,
    inviterName,
    workspaceName: invitation.workspace?.name || "Zadesk",
    inviteLink,
    role: invitation.role,
  });

  // 6. Gestion des réponses d'échec
  if (!emailRes.success) {
    // 6.1 Quota Zavu (HTTP 429) : échec temporaire avec respect de Retry-After
    if (emailRes.status === 429) {
      const retryAfterMs = emailRes.retryAfterMs || 60000;
      try {
        await prisma.workspaceInvitation.updateMany({
          where: { id: invitationId, workspaceId },
          data: {
            dispatchStatus: "PENDING",
            nextRetryAt: new Date(Date.now() + retryAfterMs),
            dispatchLockedBy: null,
            dispatchError: "[HTTP 429] Quota Zavu atteint",
          },
        });
      } catch (_) {}
      throw new RateLimitError("Quota Zavu atteint (HTTP 429)", retryAfterMs);
    }

    // 6.2 Erreurs permanentes 4xx (hors 429) : échec définitif, pas de retry
    if (emailRes.status >= 400 && emailRes.status < 500) {
      try {
        await prisma.workspaceInvitation.updateMany({
          where: { id: invitationId, workspaceId },
          data: {
            dispatchStatus: "FAILED",
            dispatchLockedBy: null,
            dispatchError: `[Permanent HTTP ${emailRes.status}] ${emailRes.error}`,
          },
        });
      } catch (_) {}
      return {
        success: false,
        reason: "PERMANENT_CLIENT_ERROR",
        status: emailRes.status,
      };
    }

    // 6.3 Erreurs temporaires 5xx ou coupures réseau : retentative avec backoff
    const backoffMs = Math.round(Math.pow(2, (invitation.dispatchAttempts || 1)) * 2000);
    try {
      await prisma.workspaceInvitation.updateMany({
        where: { id: invitationId, workspaceId },
        data: {
          dispatchStatus: "PENDING",
          nextRetryAt: new Date(Date.now() + backoffMs),
          dispatchLockedBy: null,
          dispatchError: `[HTTP ${emailRes.status}] ${emailRes.error}`,
        },
      });
    } catch (_) {}
    throw new Error(`[TransientError] Zavu indisponible (${emailRes.status}): ${emailRes.error}`);
  }

  // 7. CORRECTION 2 — Contrôle explicite de postState après l'envoi
  let postState;
  if (job && job._testPostState !== undefined) {
    postState = job._testPostState;
  } else {
    postState = await prisma.workspaceInvitation.findUnique({
      where: { id: invitationId },
      select: { id: true, acceptedAt: true, dispatchLockedBy: true },
    });
  }

  if (!postState) {
    logger.warn(`[Worker:Notifications] Invitation ${invitationId} introuvable post-envoi (postState null).`);
    try {
      await prisma.workspaceInvitation.updateMany({
        where: { id: invitationId, workspaceId, dispatchLockedBy: workerInstanceId },
        data: { dispatchLockedBy: null },
      });
    } catch (_) {}
    return { success: false, reason: "INVITATION_NOT_FOUND_POST_DISPATCH" };
  }

  let validUserId = null;
  if (invitedById) {
    const userExists = await prisma.user.findUnique({
      where: { id: invitedById },
      select: { id: true },
    });
    if (userExists) validUserId = userExists.id;
  }

  // Cas où l'invitation a été acceptée PENDANT l'appel HTTP Zavu
  if (postState.acceptedAt !== null && postState.acceptedAt !== undefined) {
    logger.info(`[Worker:Notifications] Invitation ${invitationId} acceptée pendant l'envoi externe.`);
    try {
      await prisma.workspaceInvitation.updateMany({
        where: { id: invitationId, workspaceId },
        data: {
          dispatchStatus: "SENT",
          dispatchLockedBy: null,
          dispatchError: null,
        },
      });
    } catch (_) {}

    const auditPost = await prisma.auditLog.create({
      data: {
        workspaceId,
        userId: validUserId,
        action: "INVITATION_EMAIL_DISPATCHED_POST_ACCEPTANCE",
        entityType: "WORKSPACE_INVITATION",
        entityId: invitationId,
        details: {
          recipientEmail: maskEmail(email),
          role: invitation.role,
          sentStatus: emailRes.status,
        },
      },
    });

    return {
      success: true,
      reason: "ACCEPTED_DURING_HTTP_CALL",
      invitationId,
      email,
      auditLogId: auditPost.id,
      durationMs: Date.now() - startTime,
    };
  }

  // 8. Cas nominal standard : enregistrement de l'état SENT et de l'AuditLog
  try {
    await prisma.workspaceInvitation.updateMany({
      where: { id: invitationId, workspaceId },
      data: {
        dispatchStatus: "SENT",
        dispatchLockedBy: null,
        dispatchError: null,
      },
    });
  } catch (_) {}

  const audit = await prisma.auditLog.create({
    data: {
      workspaceId,
      userId: validUserId,
      action: "INVITATION_EMAIL_DISPATCHED",
      entityType: "WORKSPACE_INVITATION",
      entityId: invitationId,
      details: {
        recipientEmail: maskEmail(email),
        role: invitation.role,
        sentStatus: emailRes.status,
      },
    },
  });

  const durationMs = Date.now() - startTime;
  logger.info(`[Worker:Notifications] Email d'invitation traité pour ${maskEmail(email)} en ${durationMs}ms`);

  return {
    success: true,
    invitationId,
    email,
    auditLogId: audit.id,
    durationMs,
  };
}

/**
 * Creates and initializes the Notifications Worker.
 * @returns {Worker}
 */
export function createNotificationWorker(connectionOverrides = {}) {
  const connection = createBullMQConnection("worker-notifications");

  const worker = new Worker(
    QUEUE_NAMES.NOTIFICATIONS,
    processNotificationJob,
    {
      connection,
      prefix: BULLMQ_PREFIX,
      concurrency: 5,
      settings: {
        backoffStrategies: {
          custom: notificationBackoffStrategy,
        },
      },
    }
  );

  worker.on("completed", (job, result) => {
    logger.info(`[Worker:Notifications] Job complété avec succès`, { jobId: job.id, result });
  });

  worker.on("failed", (job, err) => {
    logger.error(`[Worker:Notifications] Job échoué (tentative ${job?.attemptsMade}/${job?.opts?.attempts}): ${err.message}`, err);
  });

  return worker;
}
