import crypto from "crypto";
import {
  getPublicCompanies,
  getPopularPublicCompanies,
  getPublicCategories,
  getPublicCompanyBySlug,
} from "../services/publicCompanyService.js";
import { sendSuccess, sendError } from "../utils/response.js";
import { prisma } from "../lib/prisma.js";
import { publishPulseEvent, PULSE_EVENT_TYPES } from "../services/pulseEventService.js";
import { dispatchAgentMessageAlertJob } from "../jobs/notificationJobs.js";
import {
  getPublicVapidKey,
  upsertPushSubscription,
  removePushSubscription,
} from "../services/pushNotificationService.js";
import {
  savePublicChatAttachments,
  encodeMessageWithAttachments,
  parseMessageWithAttachments,
  resolveChatAttachmentFile,
} from "../utils/chatAttachments.js";

function hashToken(rawToken) {
  return crypto.createHash("sha256").update(String(rawToken)).digest("hex");
}

function verifyTokenHash(rawToken, storedHash) {
  if (!rawToken || !storedHash) return false;
  const computedHash = hashToken(rawToken);
  try {
    return crypto.timingSafeEqual(Buffer.from(computedHash, "hex"), Buffer.from(storedHash, "hex"));
  } catch {
    return false;
  }
}

/**
 * GET /api/public/companies
 * Query params: search, category, city, limit, offset
 */
export async function listPublicCompanies(req, res, next) {
  try {
    const { search, category, city, limit, offset } = req.query;
    const data = await getPublicCompanies({
      search: search || "",
      category: category || "",
      city: city || "",
      limit: limit ? parseInt(limit, 10) : 20,
      offset: offset ? parseInt(offset, 10) : 0,
    });
    return sendSuccess(res, data);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/public/companies/popular
 */
export async function listPopularCompanies(req, res, next) {
  try {
    const companies = await getPopularPublicCompanies();
    return sendSuccess(res, { companies });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/public/companies/categories
 */
export async function listPublicCategories(req, res, next) {
  try {
    const categories = await getPublicCategories();
    return sendSuccess(res, { categories });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/public/companies/:slug
 */
export async function getCompanyProfile(req, res, next) {
  try {
    const { slug } = req.params;
    const company = await getPublicCompanyBySlug(slug);

    if (!company) {
      return sendError(res, "Entreprise introuvable ou profil non public.", 404);
    }

    return sendSuccess(res, { company });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/public/companies/:slug/chat
 * Body: { message, conversationId, customerName, customerPhone, customerEmail }
 */
export async function sendPublicChatMessage(req, res, next) {
  try {
    const { slug } = req.params;
    const { message, attachments, conversationId, customerName, customerPhone, customerEmail } = req.body;
    const clientToken = req.headers["x-conversation-token"];

    const cleanMessage = typeof message === "string" ? message.trim() : "";
    const hasAttachments = Array.isArray(attachments) && attachments.length > 0;

    if (!cleanMessage && !hasAttachments) {
      return sendError(res, "Veuillez saisir un message ou joindre au moins un fichier.", 400);
    }

    const workspace = await prisma.workspace.findFirst({
      where: {
        slug: slug.trim(),
        isPublic: true,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        category: true,
      },
    });

    if (!workspace) {
      return sendError(res, "Entreprise introuvable ou service SAV non disponible.", 404);
    }

    let conversation = null;
    let isNewConversation = false;
    let sessionToken = clientToken;

    if (conversationId) {
      conversation = await prisma.conversation.findFirst({
        where: {
          id: conversationId,
          workspaceId: workspace.id,
        },
      });

      if (conversation && conversation.publicTokenHash) {
        // Enforce cryptographic token verification on write
        if (!verifyTokenHash(clientToken, conversation.publicTokenHash)) {
          return sendError(res, "Accès non autorisé à cette conversation.", 403);
        }
      }
    }

    if (!conversation) {
      isNewConversation = true;
      const rawToken = crypto.randomBytes(32).toString("hex");
      const tokenHash = hashToken(rawToken);
      sessionToken = rawToken;

      // Look for an assigned agent (available agent with active membership or active owner)
      const primaryAgent = await prisma.agentProfile.findFirst({
        where: {
          workspaceId: workspace.id,
          availability: "AVAILABLE",
          user: {
            memberships: {
              some: {
                workspaceId: workspace.id,
                status: "ACTIVE",
              },
            },
          },
        },
        select: { userId: true },
      });

      const fallbackOwner = primaryAgent?.userId
        ? null
        : await prisma.membership.findFirst({
            where: { workspaceId: workspace.id, role: "OWNER", status: "ACTIVE" },
            select: { userId: true },
          });

      const assignedAgentId = primaryAgent?.userId || fallbackOwner?.userId || null;

      conversation = await prisma.conversation.create({
        data: {
          workspaceId: workspace.id,
          customerName: (customerName || "Visiteur Web").trim(),
          customerPhone: customerPhone?.trim() || null,
          customerEmail: customerEmail?.trim() || null,
          category: workspace.category || "Assistance SAV",
          channel: "PORTAL",
          status: "ACTIVE",
          assignedAgentId,
          publicTokenHash: tokenHash,
          lastMessageAt: new Date(),
        },
      });
    } else {
      const updateData = {
        lastMessageAt: new Date(),
        status: "ACTIVE",
      };
      if (customerName && customerName.trim() && conversation.customerName === "Visiteur Web") {
        updateData.customerName = customerName.trim();
      }
      if (customerPhone && customerPhone.trim() && !conversation.customerPhone) {
        updateData.customerPhone = customerPhone.trim();
      }
      if (customerEmail && customerEmail.trim() && !conversation.customerEmail) {
        updateData.customerEmail = customerEmail.trim();
      }

      // Backfill token for legacy conversation if missing
      if (!conversation.publicTokenHash) {
        const rawToken = clientToken || crypto.randomBytes(32).toString("hex");
        const tokenHash = hashToken(rawToken);
        sessionToken = rawToken;
        updateData.publicTokenHash = tokenHash;
      }

      conversation = await prisma.conversation.update({
        where: { id: conversation.id },
        data: updateData,
      });
    }

    // Save uploaded attachments safely on disk before creating message
    let savedAttachments = [];
    if (hasAttachments) {
      try {
        savedAttachments = await savePublicChatAttachments(conversation.id, attachments);
      } catch (uploadErr) {
        return sendError(res, uploadErr.message || "Erreur lors de l'envoi des pièces jointes.", uploadErr.status || 400);
      }
    }

    const encodedContent = encodeMessageWithAttachments(cleanMessage, savedAttachments);
    const buildPublicAttachmentUrl = (fileName) => {
      const base = `/api/public/companies/${encodeURIComponent(workspace.slug)}/chat/${conversation.id}/attachments/${encodeURIComponent(fileName)}`;
      return sessionToken ? `${base}?token=${encodeURIComponent(sessionToken)}` : base;
    };
    const parsedSaved = parseMessageWithAttachments(encodedContent, buildPublicAttachmentUrl);

    // Save conversation message in PostgreSQL
    const savedMessage = await prisma.conversationMessage.create({
      data: {
        conversationId: conversation.id,
        senderType: "CUSTOMER",
        senderName: conversation.customerName,
        content: encodedContent,
        isInternalNote: false,
      },
    });

    const previewText = cleanMessage
      ? cleanMessage.slice(0, 100)
      : `📎 ${savedAttachments.length} pièce(s) jointe(s)`;

    // Publish Real-time Pulse Event
    if (isNewConversation) {
      await publishPulseEvent(workspace.id, {
        type: PULSE_EVENT_TYPES.CONVERSATION_CREATED,
        conversationId: conversation.id,
        customerName: conversation.customerName,
        category: conversation.category,
        assignedAgentId: conversation.assignedAgentId,
        isClientMessage: true,
        contentPreview: previewText,
        status: conversation.status,
      });
    }

    await publishPulseEvent(workspace.id, {
      type: PULSE_EVENT_TYPES.MESSAGE_CREATED,
      conversationId: conversation.id,
      messageId: savedMessage.id,
      senderType: "CUSTOMER",
      senderName: savedMessage.senderName,
      contentPreview: previewText,
      isInternalNote: false,
      customerName: conversation.customerName,
      category: conversation.category,
      isClientMessage: true,
      assignedAgentId: conversation.assignedAgentId,
      status: conversation.status,
    });

    dispatchAgentMessageAlertJob({
      workspaceId: workspace.id,
      conversationId: conversation.id,
      messageId: savedMessage.id,
      customerName: conversation.customerName,
      assignedAgentId: conversation.assignedAgentId,
      contentPreview: previewText,
      isNewConversation,
    }).catch(() => {});

    return sendSuccess(
      res,
      {
        conversationId: conversation.id,
        sessionToken, // Returned ONLY in HTTP response body, never in URL
        customerName: conversation.customerName,
        message: {
          id: savedMessage.id,
          senderType: savedMessage.senderType,
          senderName: savedMessage.senderName,
          content: parsedSaved.content,
          attachments: parsedSaved.attachments,
          createdAt: savedMessage.createdAt,
        },
      },
      201
    );
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/public/companies/:slug/chat/:conversationId
 */
export async function getPublicChatMessages(req, res, next) {
  try {
    const { slug, conversationId } = req.params;
    const clientToken = req.headers["x-conversation-token"];

    const workspace = await prisma.workspace.findFirst({
      where: {
        slug: slug.trim(),
        isPublic: true,
      },
      select: { id: true },
    });

    if (!workspace) {
      return sendError(res, "Entreprise introuvable.", 404);
    }

    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        workspaceId: workspace.id,
      },
      select: {
        id: true,
        customerName: true,
        status: true,
        channel: true,
        category: true,
        publicTokenHash: true,
        assignedAgent: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
      },
    });

    if (!conversation) {
      return sendError(res, "Session de conversation introuvable.", 404);
    }

    // Enforce cryptographic token verification on read if token hash exists
    if (conversation.publicTokenHash) {
      if (!verifyTokenHash(clientToken, conversation.publicTokenHash)) {
        return sendError(res, "Accès non autorisé à cette conversation.", 403);
      }
    }

    const messages = await prisma.conversationMessage.findMany({
      where: {
        conversationId,
        isInternalNote: false, // Strict privacy: client never sees internal agent notes
      },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        senderType: true,
        senderName: true,
        content: true,
        createdAt: true,
      },
    });

    const buildPublicAttachmentUrl = (fileName) => {
      const base = `/api/public/companies/${encodeURIComponent(slug.trim())}/chat/${conversationId}/attachments/${encodeURIComponent(fileName)}`;
      return clientToken ? `${base}?token=${encodeURIComponent(clientToken)}` : base;
    };

    const hydratedMessages = messages.map((m) => {
      const parsed = parseMessageWithAttachments(m.content, buildPublicAttachmentUrl);
      return {
        ...m,
        content: parsed.content,
        attachments: parsed.attachments,
      };
    });

    return sendSuccess(res, {
      conversation: {
        id: conversation.id,
        customerName: conversation.customerName,
        status: conversation.status,
        channel: conversation.channel,
        category: conversation.category,
        assignedAgent: conversation.assignedAgent,
      },
      messages: hydratedMessages,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/public/companies/:slug/chat/:conversationId/attachments/:fileName
 */
export async function getPublicChatAttachment(req, res, next) {
  try {
    const { slug, conversationId, fileName } = req.params;
    const clientToken = req.headers["x-conversation-token"] || req.query.token;

    const workspace = await prisma.workspace.findFirst({
      where: {
        slug: slug.trim(),
        isPublic: true,
      },
      select: { id: true },
    });

    if (!workspace) {
      return sendError(res, "Entreprise introuvable.", 404);
    }

    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        workspaceId: workspace.id,
      },
      select: {
        id: true,
        publicTokenHash: true,
      },
    });

    if (!conversation) {
      return sendError(res, "Session de conversation introuvable.", 404);
    }

    if (conversation.publicTokenHash && !verifyTokenHash(clientToken, conversation.publicTokenHash)) {
      return sendError(res, "Accès non autorisé à cette pièce jointe.", 403);
    }

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
    next(error);
  }
}

/**
 * Helper: authorize a public customer access to their conversation via x-conversation-token
 */
async function authorizePublicConversation(slug, conversationId, clientToken) {
  const workspace = await prisma.workspace.findFirst({
    where: { slug: slug.trim(), isPublic: true },
    select: { id: true },
  });
  if (!workspace) {
    return { error: "Entreprise introuvable.", status: 404 };
  }

  const conversation = await prisma.conversation.findFirst({
    where: { id: conversationId, workspaceId: workspace.id },
    select: { id: true, workspaceId: true, publicTokenHash: true, customerEmail: true },
  });
  if (!conversation) {
    return { error: "Session de conversation introuvable.", status: 404 };
  }

  if (conversation.publicTokenHash && !verifyTokenHash(clientToken, conversation.publicTokenHash)) {
    return { error: "Accès non autorisé à cette conversation.", status: 403 };
  }

  return { workspace, conversation };
}

export async function getPublicPushVapidKey(req, res, next) {
  try {
    const publicKey = await getPublicVapidKey();
    return sendSuccess(res, { publicKey });
  } catch (error) {
    next(error);
  }
}

export async function subscribePublicPush(req, res, next) {
  try {
    const { slug, conversationId } = req.params;
    const clientToken = req.headers["x-conversation-token"];
    const { subscription } = req.body || {};

    const auth = await authorizePublicConversation(slug, conversationId, clientToken);
    if (auth.error) {
      return sendError(res, auth.error, auth.status);
    }

    await upsertPushSubscription({
      recipientType: "CUSTOMER",
      workspaceId: auth.workspace.id,
      conversationId: auth.conversation.id,
      subscription,
      userAgent: req.headers["user-agent"],
    });

    return sendSuccess(res, { subscribed: true }, "Alertes navigateur activées.");
  } catch (error) {
    if (error.status) return sendError(res, error.message, error.status);
    next(error);
  }
}

export async function unsubscribePublicPush(req, res, next) {
  try {
    const { slug, conversationId } = req.params;
    const clientToken = req.headers["x-conversation-token"];
    const { endpoint } = req.body || {};

    const auth = await authorizePublicConversation(slug, conversationId, clientToken);
    if (auth.error) {
      return sendError(res, auth.error, auth.status);
    }

    await removePushSubscription({
      recipientType: "CUSTOMER",
      workspaceId: auth.workspace.id,
      conversationId: auth.conversation.id,
      endpoint,
    });

    return sendSuccess(res, { subscribed: false }, "Alertes navigateur désactivées.");
  } catch (error) {
    next(error);
  }
}

export async function savePublicNotificationEmail(req, res, next) {
  try {
    const { slug, conversationId } = req.params;
    const clientToken = req.headers["x-conversation-token"];
    const rawEmail = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";

    if (!rawEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rawEmail)) {
      return sendError(res, "Veuillez saisir une adresse email valide.", 400);
    }

    const auth = await authorizePublicConversation(slug, conversationId, clientToken);
    if (auth.error) {
      return sendError(res, auth.error, auth.status);
    }

    await prisma.conversation.update({
      where: { id: auth.conversation.id },
      data: { customerEmail: rawEmail },
    });

    return sendSuccess(res, { emailSaved: true }, "Vous serez averti par email dès qu'un conseiller répondra.");
  } catch (error) {
    next(error);
  }
}
