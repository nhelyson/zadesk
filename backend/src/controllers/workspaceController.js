import {
  listUserWorkspaces,
  createWorkspaceForUser,
  updateWorkspace as updateWorkspaceService,
  getWorkspaceById,
  getWorkspaceDashboardStats,
  getWorkspaceConversations,
  getWorkspaceTickets,
  getWorkspaceCustomers,
  getWorkspaceAgents,
  getWorkspaceAgencies,
  getWorkspaceAiConfig,
  getWorkspaceKnowledge,
  getWorkspaceAnalytics,
  createWorkspaceInvitation,
  getInvitationByToken,
  acceptWorkspaceInvitation,
  listWorkspaceInvitations,
  cancelWorkspaceInvitation,
  getWorkspaceSkills,
  createWorkspaceSkill,
  assignAgentSkill,
  removeAgentSkill,
  updateAgentStatus,
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
    const {
      name,
      slug,
      hasExistingSav,
      category,
      description,
      logoUrl,
      coverUrl,
      website,
      supportPhone,
      supportEmail,
      supportWhatsApp,
      address,
      city,
      country,
      openingHours,
      supportCategories,
      initialAgents,
      brandColor,
      selectedPlan,
    } = req.body;

    if (!name || name.trim().length === 0) {
      return sendError(res, 400, "Le nom de l'entreprise / espace SAV est requis.");
    }

    const result = await createWorkspaceForUser(req.user.id, {
      name: name.trim(),
      slug,
      hasExistingSav,
      category,
      description,
      logoUrl,
      coverUrl,
      website,
      supportPhone,
      supportEmail,
      supportWhatsApp,
      address,
      city,
      country,
      openingHours,
      supportCategories,
      initialAgents,
      brandColor,
      selectedPlan,
    });

    return res.status(201).json({
      success: true,
      message: "Espace de travail et SAV créés avec succès.",
      ...result,
    });
  } catch (error) {
    if (error.statusCode === 409 || error.code === "NAME_ALREADY_TAKEN") {
      return res.status(409).json({
        success: false,
        code: "NAME_ALREADY_TAKEN",
        message: error.message,
      });
    }
    if (error.statusCode === 403 || error.code === "WORKSPACE_ALREADY_EXISTS") {
      return res.status(403).json({
        success: false,
        code: "WORKSPACE_ALREADY_EXISTS",
        message: error.message,
      });
    }
    next(error);
  }
}

export async function updateWorkspace(req, res, next) {
  try {
    const { workspaceId } = req.params;
    const updated = await updateWorkspaceService(workspaceId, req.user.id, req.body);
    return sendSuccess(res, { workspace: updated }, "Espace de travail mis à jour avec succès.");
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
    return sendSuccess(res, { agencies, establishments: agencies });
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
    if (error.status) {
      return sendError(res, error.message, error.status);
    }
    next(error);
  }
}

export async function getInvitation(req, res, next) {
  try {
    const { token } = req.params;
    const invitation = await getInvitationByToken(token);
    return sendSuccess(res, { invitation });
  } catch (error) {
    return sendError(res, error.message || "Invitation invalide ou expirée.", error.status || 400);
  }
}

export async function acceptInvitation(req, res, next) {
  try {
    const { token } = req.params;
    const result = await acceptWorkspaceInvitation(token, req.user.id);
    return sendSuccess(res, result, "Vous avez rejoint l'espace de travail avec succès !");
  } catch (error) {
    return sendError(res, error.message || "Impossible d'accepter l'invitation.", error.status || 400);
  }
}

export async function listInvitations(req, res, next) {
  try {
    const { workspaceId } = req.params;
    const invitations = await listWorkspaceInvitations(workspaceId);
    return sendSuccess(res, { invitations });
  } catch (error) {
    next(error);
  }
}

export async function cancelInvitation(req, res, next) {
  try {
    const { workspaceId, invitationId } = req.params;
    await cancelWorkspaceInvitation(workspaceId, invitationId);
    return sendSuccess(res, null, "Invitation révoquée avec succès.");
  } catch (error) {
    if (error.status) {
      return sendError(res, error.message, error.status);
    }
    next(error);
  }
}

export async function getSkills(req, res, next) {
  try {
    const { workspaceId } = req.params;
    const skills = await getWorkspaceSkills(workspaceId);
    return sendSuccess(res, { skills });
  } catch (error) {
    next(error);
  }
}

export async function createSkill(req, res, next) {
  try {
    const { workspaceId } = req.params;
    const skill = await createWorkspaceSkill(workspaceId, req.body);
    return sendSuccess(res, { skill }, "Compétence créée avec succès.", 201);
  } catch (error) {
    return sendError(res, error.message || "Erreur création compétence.", 400);
  }
}

export async function assignSkillToAgent(req, res, next) {
  try {
    const { workspaceId, agentId } = req.params;
    const { skillId } = req.body;
    if (!skillId) {
      return sendError(res, "L'identifiant de compétence (skillId) est requis.", 400);
    }
    const agentSkill = await assignAgentSkill(workspaceId, agentId, skillId, req.user.id);
    return sendSuccess(res, { agentSkill }, "Compétence attribuée à l'agent.");
  } catch (error) {
    return sendError(res, error.message || "Erreur attribution compétence.", 400);
  }
}

export async function removeSkillFromAgent(req, res, next) {
  try {
    const { workspaceId, agentId, skillId } = req.params;
    await removeAgentSkill(workspaceId, agentId, skillId);
    return sendSuccess(res, null, "Compétence retirée de l'agent.");
  } catch (error) {
    next(error);
  }
}

export async function updateAgentProfileStatus(req, res, next) {
  try {
    const { workspaceId, agentId } = req.params;
    const profile = await updateAgentStatus(workspaceId, agentId, req.body);
    return sendSuccess(res, { profile }, "Profil agent mis à jour.");
  } catch (error) {
    return sendError(res, error.message || "Erreur mise à jour profil.", 400);
  }
}

