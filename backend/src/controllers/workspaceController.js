import {
  listUserWorkspaces,
  createWorkspaceForUser,
  getWorkspaceById,
  getWorkspaceDashboardStats,
  getWorkspaceConversations,
  getWorkspaceTickets,
  getWorkspaceCustomers,
  getWorkspaceAgents,
  getWorkspaceAgencies,
  getWorkspaceAiConfig,
  getWorkspaceKnowledge,
  getWorkspaceWhatsAppConfig,
  getWorkspaceAnalytics,
  createWorkspaceInvitation,
  getInvitationByToken,
  acceptWorkspaceInvitation,
} from "../services/workspaceService.js";
import { sendSuccess, sendError } from "../utils/response.js";

export async function listWorkspaces(req, res, next) {
  try {
    const workspaces = await listUserWorkspaces(req.user.id);
    return sendSuccess(res, { workspaces });
  } catch (error) {
    next(error);
  }
}

export async function createWorkspace(req, res, next) {
  try {
    const { name, slug } = req.body;
    if (!name || name.trim().length === 0) {
      return sendError(res, "Le nom de l'espace de travail est requis.", 400);
    }

    const result = await createWorkspaceForUser(req.user.id, { name: name.trim(), slug });
    return sendSuccess(res, result, "Espace de travail créé avec succès.", 201);
  } catch (error) {
    next(error);
  }
}

export async function getWorkspace(req, res, next) {
  try {
    const { workspaceId } = req.params;
    const workspace = await getWorkspaceById(workspaceId);
    if (!workspace) {
      return sendError(res, "Espace de travail introuvable.", 404);
    }
    return sendSuccess(res, { workspace });
  } catch (error) {
    next(error);
  }
}

export async function getDashboard(req, res, next) {
  try {
    const { workspaceId } = req.params;
    const stats = await getWorkspaceDashboardStats(workspaceId);
    return sendSuccess(res, stats);
  } catch (error) {
    next(error);
  }
}

export async function getConversations(req, res, next) {
  try {
    const { workspaceId } = req.params;
    const conversations = await getWorkspaceConversations(workspaceId);
    return sendSuccess(res, { conversations });
  } catch (error) {
    next(error);
  }
}

export async function getTickets(req, res, next) {
  try {
    const { workspaceId } = req.params;
    const tickets = await getWorkspaceTickets(workspaceId);
    return sendSuccess(res, { tickets });
  } catch (error) {
    next(error);
  }
}

export async function getCustomers(req, res, next) {
  try {
    const { workspaceId } = req.params;
    const customers = await getWorkspaceCustomers(workspaceId);
    return sendSuccess(res, { customers });
  } catch (error) {
    next(error);
  }
}

export async function getAgents(req, res, next) {
  try {
    const { workspaceId } = req.params;
    const agents = await getWorkspaceAgents(workspaceId);
    return sendSuccess(res, { agents });
  } catch (error) {
    next(error);
  }
}

export async function getAgencies(req, res, next) {
  try {
    const { workspaceId } = req.params;
    const agencies = await getWorkspaceAgencies(workspaceId);
    return sendSuccess(res, { agencies });
  } catch (error) {
    next(error);
  }
}

export async function getAiConfig(req, res, next) {
  try {
    const { workspaceId } = req.params;
    const aiConfig = await getWorkspaceAiConfig(workspaceId);
    return sendSuccess(res, { aiConfig });
  } catch (error) {
    next(error);
  }
}

export async function getKnowledge(req, res, next) {
  try {
    const { workspaceId } = req.params;
    const knowledge = await getWorkspaceKnowledge(workspaceId);
    return sendSuccess(res, { knowledge });
  } catch (error) {
    next(error);
  }
}

export async function getWhatsApp(req, res, next) {
  try {
    const { workspaceId } = req.params;
    const whatsapp = await getWorkspaceWhatsAppConfig(workspaceId);
    return sendSuccess(res, { whatsapp });
  } catch (error) {
    next(error);
  }
}

export async function getAnalytics(req, res, next) {
  try {
    const { workspaceId } = req.params;
    const analytics = await getWorkspaceAnalytics(workspaceId);
    return sendSuccess(res, { analytics });
  } catch (error) {
    next(error);
  }
}

export async function createInvitation(req, res, next) {
  try {
    const { workspaceId } = req.params;
    const { email, role } = req.body;

    if (!email) {
      return sendError(res, "L'adresse email est requise.", 400);
    }

    const invitation = await createWorkspaceInvitation(workspaceId, req.user.id, {
      email,
      role: role || "AGENT",
    });

    return sendSuccess(res, { invitation }, "Invitation créée avec succès.", 201);
  } catch (error) {
    next(error);
  }
}

export async function getInvitation(req, res, next) {
  try {
    const { token } = req.params;
    const invitation = await getInvitationByToken(token);
    return sendSuccess(res, { invitation });
  } catch (error) {
    return sendError(res, error.message || "Invitation invalide ou expirée.", 400);
  }
}

export async function acceptInvitation(req, res, next) {
  try {
    const { token } = req.params;
    const result = await acceptWorkspaceInvitation(token, req.user.id);
    return sendSuccess(res, result, "Vous avez rejoint l'espace de travail avec succès !");
  } catch (error) {
    return sendError(res, error.message || "Impossible d'accepter l'invitation.", 400);
  }
}
