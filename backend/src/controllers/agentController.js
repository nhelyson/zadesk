import * as agentService from "../services/agentService.js";
import { getWorkspaceAgents } from "../services/workspaceService.js";
import { ensureWorkspaceAgentSeed } from "../services/agentSeedService.js";
import { sendSuccess, sendError } from "../utils/response.js";
import { prisma } from "../lib/prisma.js";
import { streamPulseEvents } from "../services/pulseEventService.js";
import { resolveChatAttachmentFile } from "../utils/chatAttachments.js";
import {
  recordHeartbeat,
  leavePresence,
  getUserPresence,
  getPresenceConfig,
} from "../services/presenceService.js";
import {
  getPublicVapidKey,
  upsertPushSubscription,
  removePushSubscription,
} from "../services/pushNotificationService.js";

function getContext(req) {
  const workspaceId = req.params.workspaceId || req.headers["x-workspace-id"];
  const userId = req.user.id;
  const userRole = req.currentMembership?.role || "AGENT";
  return { workspaceId, userId, userRole };
}

export async function getDashboard(req, res, next) {
  try {
    const { workspaceId, userId } = getContext(req);
    await ensureWorkspaceAgentSeed(workspaceId, userId);
    const stats = await agentService.getAgentDashboardStats(workspaceId, userId);
    return sendSuccess(res, stats);
  } catch (error) {
    next(error);
  }
}

export async function getMyTickets(req, res, next) {
  try {
    const { workspaceId, userId } = getContext(req);
    const result = await agentService.getMyAssignedTickets(workspaceId, userId, req.query);
    return sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
}

export async function getSharedTickets(req, res, next) {
  try {
    const { workspaceId, userId } = getContext(req);
    const result = await agentService.getMySharedTickets(workspaceId, userId, req.query);
    return sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
}

export async function getTicketHistory(req, res, next) {
  try {
    const { workspaceId, userId } = getContext(req);
    const result = await agentService.getAgentTicketHistory(workspaceId, userId, req.query);
    return sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
}

export async function getTicket(req, res, next) {
  try {
    const { workspaceId, userId, userRole } = getContext(req);
    const { ticketId } = req.params;
    const result = await agentService.getTicketDetails(workspaceId, ticketId, userId, userRole);
    return sendSuccess(res, result);
  } catch (error) {
    if (error.status) {
      return sendError(res, error.message, error.status);
    }
    next(error);
  }
}

export async function createTicket(req, res, next) {
  try {
    const { workspaceId, userId } = getContext(req);
    const { title, description, customerName } = req.body;

    if (!title || !description || !customerName) {
      return sendError(res, "Le titre, la description et le nom du client sont obligatoires.", 400);
    }

    const ticket = await agentService.createTicket(workspaceId, userId, req.body);
    return sendSuccess(res, { ticket }, "Ticket créé avec succès.", 201);
  } catch (error) {
    next(error);
  }
}

export async function updateTicket(req, res, next) {
  try {
    const { workspaceId, userId, userRole } = getContext(req);
    const { ticketId } = req.params;
    const result = await agentService.updateTicket(workspaceId, ticketId, userId, userRole, req.body);
    return sendSuccess(res, { ticket: result }, "Ticket mis à jour avec succès.");
  } catch (error) {
    if (error.status) {
      return sendError(res, error.message, error.status);
    }
    next(error);
  }
}

export async function shareTicket(req, res, next) {
  try {
    const { workspaceId, userId, userRole } = getContext(req);
    const { ticketId } = req.params;
    const { targetAgentId, accessLevel, expiresAt } = req.body;

    if (!targetAgentId) {
      return sendError(res, "L'identifiant de l'agent cible est obligatoire.", 400);
    }

    const share = await agentService.shareTicket(workspaceId, ticketId, userId, userRole, {
      targetAgentId,
      accessLevel,
      expiresAt,
    });

    return sendSuccess(res, { share }, "Dossier partagé avec succès.");
  } catch (error) {
    if (error.status) {
      return sendError(res, error.message, error.status);
    }
    next(error);
  }
}

export async function reassignTicket(req, res, next) {
  try {
    const { workspaceId, userId, userRole } = getContext(req);
    const { ticketId } = req.params;
    const { newAgentId, reason } = req.body;

    if (!newAgentId) {
      return sendError(res, "L'identifiant du nouvel agent est obligatoire.", 400);
    }

    const updated = await agentService.reassignTicket(workspaceId, ticketId, userId, userRole, {
      newAgentId,
      reason,
    });

    return sendSuccess(res, { ticket: updated }, "Ticket réaffecté avec succès.");
  } catch (error) {
    if (error.status) {
      return sendError(res, error.message, error.status);
    }
    next(error);
  }
}

export async function getConversations(req, res, next) {
  try {
    const { workspaceId, userId, userRole } = getContext(req);
    const result = await agentService.getMyConversations(workspaceId, userId, userRole, req.query);
    return sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
}

export async function createConversation(req, res, next) {
  try {
    const { workspaceId, userId } = getContext(req);
    const conversation = await agentService.createAgentConversation(workspaceId, userId, req.body);
    return sendSuccess(res, { conversation }, "Nouvelle conversation créée avec succès.", 201);
  } catch (error) {
    if (error.status) {
      return sendError(res, error.message, error.status);
    }
    next(error);
  }
}

export async function receiveCustomerMessage(req, res, next) {
  try {
    const { workspaceId } = getContext(req);
    const { conversationId } = req.params;
    const { content, customerName } = req.body;
    if (!content || !content.trim()) {
      return sendError(res, "Le contenu du message ne peut pas être vide.", 400);
    }
    const message = await agentService.createCustomerMessage(workspaceId, conversationId, {
      content,
      customerName,
    });
    return sendSuccess(res, { message }, "Message client reçu et consigné avec succès.", 201);
  } catch (error) {
    if (error.status) {
      return sendError(res, error.message, error.status);
    }
    next(error);
  }
}

export async function getConversation(req, res, next) {
  try {
    const { workspaceId, userId, userRole } = getContext(req);
    const { conversationId } = req.params;
    const conversation = await agentService.getConversationDetails(workspaceId, conversationId, userId, userRole);
    return sendSuccess(res, { conversation });
  } catch (error) {
    if (error.status) {
      return sendError(res, error.message, error.status);
    }
    next(error);
  }
}

export async function getConversationAttachment(req, res, next) {
  try {
    const { workspaceId, userId, userRole } = getContext(req);
    const { conversationId, fileName } = req.params;
    await agentService.getConversationDetails(workspaceId, conversationId, userId, userRole);

    const fileInfo = await resolveChatAttachmentFile(conversationId, fileName);
    if (!fileInfo) {
      return sendError(res, "Pièce jointe introuvable.", 404);
    }

    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Cache-Control", "private, max-age=3600");
    res.setHeader("Content-Type", fileInfo.mimeType);
    res.setHeader(
      "Content-Disposition",
      `${fileInfo.isImage ? "inline" : "attachment"}; filename="${fileInfo.fileName}"`
    );
    return res.sendFile(fileInfo.fullPath);
  } catch (error) {
    if (error.status) {
      return sendError(res, error.message, error.status);
    }
    next(error);
  }
}

export async function sendConversationMessage(req, res, next) {
  try {
    const { workspaceId, userId } = getContext(req);
    const { conversationId } = req.params;
    const { content, isInternalNote } = req.body;

    if (!content || !content.trim()) {
      return sendError(res, "Le contenu du message ne peut pas être vide.", 400);
    }

    const message = await agentService.sendConversationMessage(workspaceId, conversationId, userId, {
      content,
      isInternalNote,
    });

    return sendSuccess(res, { message }, isInternalNote ? "Note interne ajoutée." : "Message envoyé.");
  } catch (error) {
    if (error.status) {
      return sendError(res, error.message, error.status);
    }
    next(error);
  }
}

export async function streamPulse(req, res, next) {
  try {
    await streamPulseEvents(req, res);
  } catch (error) {
    next(error);
  }
}

export async function getProfile(req, res, next) {
  try {
    const { workspaceId, userId } = getContext(req);
    const profile = await agentService.getOrCreateAgentProfile(workspaceId, userId);
    return sendSuccess(res, { profile });
  } catch (error) {
    next(error);
  }
}

export async function updateProfile(req, res, next) {
  try {
    const { workspaceId, userId } = getContext(req);
    const updated = await agentService.updateAgentProfile(workspaceId, userId, req.body);
    return sendSuccess(res, { profile: updated }, "Profil mis à jour avec succès.");
  } catch (error) {
    if (error.status) {
      return sendError(res, error.message, error.status);
    }
    next(error);
  }
}

export async function heartbeatPresence(req, res, next) {
  try {
    const { workspaceId, userId } = getContext(req);
    const { tabId, idleMs } = req.body || {};
    const presence = await recordHeartbeat({
      workspaceId,
      userId,
      sessionToken: req.sessionToken,
      tabId: typeof tabId === "string" && tabId.trim() ? tabId.trim() : "default",
      idleMs: Number(idleMs) || 0,
    });
    return sendSuccess(res, { presence, config: getPresenceConfig() });
  } catch (error) {
    if (error.status) {
      return sendError(res, error.message, error.status);
    }
    next(error);
  }
}

export async function leavePresenceController(req, res, next) {
  try {
    const { workspaceId, userId } = getContext(req);
    let body = req.body || {};
    if (typeof body === "string") {
      try {
        body = JSON.parse(body);
      } catch {
        body = {};
      }
    }
    const tabId = typeof body.tabId === "string" && body.tabId.trim() ? body.tabId.trim() : "default";
    await leavePresence({
      workspaceId,
      userId,
      sessionToken: req.sessionToken,
      tabId,
    });
    return sendSuccess(res, { left: true });
  } catch (error) {
    next(error);
  }
}

export async function getMyPresence(req, res, next) {
  try {
    const { workspaceId, userId } = getContext(req);
    const presence = await getUserPresence({ workspaceId, userId });
    return sendSuccess(res, { presence, config: getPresenceConfig() });
  } catch (error) {
    next(error);
  }
}

export async function listTeamMembers(req, res, next) {
  try {
    const { workspaceId } = getContext(req);
    const result = await getWorkspaceAgents(workspaceId);
    return sendSuccess(res, { team: result, members: result });
  } catch (error) {
    next(error);
  }
}

export async function getPushVapidKey(req, res, next) {
  try {
    const publicKey = await getPublicVapidKey();
    return sendSuccess(res, { publicKey });
  } catch (error) {
    next(error);
  }
}

export async function getPushStatus(req, res, next) {
  try {
    const { workspaceId, userId } = getContext(req);
    const endpoint = typeof req.query?.endpoint === "string" ? req.query.endpoint.trim() : "";

    const [profile, subscriptions] = await Promise.all([
      prisma.agentProfile.findUnique({
        where: { workspaceId_userId: { workspaceId, userId } },
        select: { notificationApp: true, notificationEmail: true },
      }),
      prisma.pushSubscription.findMany({
        where: { recipientType: "AGENT", userId },
        select: { id: true, endpoint: true },
      }),
    ]);

    const currentDeviceSubscribed = endpoint
      ? subscriptions.some((s) => s.endpoint === endpoint)
      : subscriptions.length > 0;

    return sendSuccess(res, {
      subscribed: currentDeviceSubscribed,
      deviceCount: subscriptions.length,
      notificationApp: profile ? profile.notificationApp : true,
      notificationEmail: profile ? profile.notificationEmail : true,
    });
  } catch (error) {
    next(error);
  }
}

export async function subscribePush(req, res, next) {
  try {
    const { workspaceId, userId } = getContext(req);
    const { subscription } = req.body || {};

    await upsertPushSubscription({
      recipientType: "AGENT",
      workspaceId,
      userId,
      subscription,
      userAgent: req.headers["user-agent"],
    });

    return sendSuccess(res, { subscribed: true }, "Alertes bureau activées sur cet appareil.");
  } catch (error) {
    if (error.status) return sendError(res, error.message, error.status);
    next(error);
  }
}

export async function unsubscribePush(req, res, next) {
  try {
    const { workspaceId, userId } = getContext(req);
    const { endpoint } = req.body || {};

    if (endpoint) {
      await removePushSubscription({
        recipientType: "AGENT",
        workspaceId,
        userId,
        endpoint,
      });
    } else {
      await prisma.pushSubscription.deleteMany({
        where: { recipientType: "AGENT", userId },
      });
    }

    return sendSuccess(res, { subscribed: false }, "Alertes bureau désactivées.");
  } catch (error) {
    next(error);
  }
}
