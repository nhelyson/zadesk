import * as agentService from "../services/agentService.js";
import { ensureWorkspaceAgentSeed } from "../services/agentSeedService.js";
import { sendSuccess, sendError } from "../utils/response.js";
import { prisma } from "../lib/prisma.js";
import { streamPulseEvents } from "../services/pulseEventService.js";

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
    next(error);
  }
}

export async function listTeamMembers(req, res, next) {
  try {
    const { workspaceId } = getContext(req);
    const members = await prisma.membership.findMany({
      where: { workspaceId },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true, avatarUrl: true, createdAt: true },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    const profiles = await prisma.agentProfile.findMany({
      where: { workspaceId },
      include: {
        skills: {
          include: {
            skill: true,
          },
        },
      },
    });

    const result = members.map((m) => {
      const p = profiles.find((prof) => prof.userId === m.userId);
      const skills = (p?.skills || []).map((s) => ({
        id: s.skill.id,
        name: s.skill.name,
        description: s.skill.description,
        validatedAt: s.validatedAt,
      }));
      const specialties = skills.map((s) => s.name);

      return {
        id: m.user.id,
        membershipId: m.id,
        firstName: m.user.firstName,
        lastName: m.user.lastName,
        name: `${m.user.firstName || ''} ${m.user.lastName || ''}`.trim() || m.user.email.split('@')[0],
        email: m.user.email,
        avatarUrl: m.user.avatarUrl,
        role: m.role,
        membershipStatus: m.status || 'ACTIVE',
        isSuspended: m.status === 'SUSPENDED',
        suspendedAt: m.suspendedAt || null,
        suspendedReason: m.suspendedReason || null,
        joinedAt: m.createdAt,
        hasAgentProfile: Boolean(p),
        profileId: p?.id || null,
        title: p?.title || (m.role === 'OWNER' ? 'Propriétaire' : m.role === 'ADMIN' ? 'Administrateur' : m.role === 'MANAGER' ? 'Superviseur SAV' : 'Conseiller SAV'),
        phone: p?.phone || '',
        status: p?.availability || 'AVAILABLE',
        availability: p ? p.availability : null,
        maxCapacity: p?.maxCapacity || null,
        autoAssignmentEnabled: p ? p.autoAssignmentEnabled : null,
        skills,
        specialties,
      };
    });

    return sendSuccess(res, { team: result, members: result });
  } catch (error) {
    next(error);
  }
}
