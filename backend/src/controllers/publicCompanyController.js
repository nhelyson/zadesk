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
    const { message, conversationId, customerName, customerPhone, customerEmail } = req.body;
    const clientToken = req.headers["x-conversation-token"];

    if (!message || typeof message !== "string" || !message.trim()) {
      return sendError(res, "Le message ne peut pas être vide.", 400);
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

    // Save conversation message in PostgreSQL
    const savedMessage = await prisma.conversationMessage.create({
      data: {
        conversationId: conversation.id,
        senderType: "CUSTOMER",
        senderName: conversation.customerName,
        content: message.trim(),
        isInternalNote: false,
      },
    });

    // Publish Real-time Pulse Event
    if (isNewConversation) {
      await publishPulseEvent(workspace.id, {
        type: PULSE_EVENT_TYPES.CONVERSATION_CREATED,
        conversationId: conversation.id,
        customerName: conversation.customerName,
        category: conversation.category,
        assignedAgentId: conversation.assignedAgentId,
        isClientMessage: true,
        contentPreview: message.trim().slice(0, 100),
        status: conversation.status,
      });
    }

    await publishPulseEvent(workspace.id, {
      type: PULSE_EVENT_TYPES.MESSAGE_CREATED,
      conversationId: conversation.id,
      messageId: savedMessage.id,
      senderType: "CUSTOMER",
      senderName: savedMessage.senderName,
      contentPreview: savedMessage.content.slice(0, 100),
      isInternalNote: false,
      customerName: conversation.customerName,
      category: conversation.category,
      isClientMessage: true,
      assignedAgentId: conversation.assignedAgentId,
      status: conversation.status,
    });

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
          content: savedMessage.content,
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

    return sendSuccess(res, {
      conversation: {
        id: conversation.id,
        customerName: conversation.customerName,
        status: conversation.status,
        channel: conversation.channel,
        category: conversation.category,
        assignedAgent: conversation.assignedAgent,
      },
      messages,
    });
  } catch (error) {
    next(error);
  }
}
