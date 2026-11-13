import {
  getOfficialPlans,
  getOfficialPlan,
  saveCommercialIntent,
  getCommercialIntent,
  getCommercialRecap,
  validateDowngradeRequirements,
  schedulePlanDowngrade,
  getWorkspaceDowngradeRequest,
  cancelPlanDowngrade,
  createUpgradeIntent,
  getUpgradeIntentStatus,
  abandonUpgradeIntent,
} from "../services/commercialService.js";
import { prisma } from "../lib/prisma.js";
import { successResponse, errorResponse } from "../utils/response.js";

/**
 * Commercial Controller
 * Multi-tenant enforced: strictly checks workspace membership and roles
 */

export async function listPlansController(req, res, next) {
  try {
    const plans = getOfficialPlans();
    return successResponse(res, { plans, message: "Grille tarifaire officielle Zadesk." });
  } catch (err) {
    next(err);
  }
}

export async function getPlanController(req, res, next) {
  try {
    const { planId } = req.params;
    const plan = getOfficialPlan(planId);
    if (!plan) {
      return errorResponse(res, `Formule « ${planId} » introuvable.`, 404);
    }
    return successResponse(res, { plan });
  } catch (err) {
    next(err);
  }
}

export async function saveIntentController(req, res, next) {
  try {
    const { planId, workspaceId } = req.body;
    if (workspaceId) {
      const membership = await prisma.membership.findUnique({
        where: {
          userId_workspaceId: {
            userId: req.user.id,
            workspaceId,
          },
        },
      });
      if (!membership || membership.role !== "OWNER") {
        return errorResponse(res, "Accès refusé. Seul le propriétaire peut définir l'intention commerciale pour cet espace.", 403);
      }
    }
    const result = await saveCommercialIntent(req.user.id, {
      planId,
      workspaceId,
    });
    return successResponse(res, {
      intent: result,
      message: "Intention commerciale enregistrée avec succès.",
    });
  } catch (err) {
    next(err);
  }
}

export async function getIntentController(req, res, next) {
  try {
    const { workspaceId } = req.query;
    if (workspaceId) {
      const membership = await prisma.membership.findUnique({
        where: {
          userId_workspaceId: {
            userId: req.user.id,
            workspaceId,
          },
        },
      });
      if (!membership) {
        return errorResponse(res, "Accès refusé. Vous n'êtes pas membre de cet espace de travail.", 403);
      }
    }
    const intent = await getCommercialIntent(req.user.id, workspaceId);
    return successResponse(res, { intent });
  } catch (err) {
    next(err);
  }
}

export async function getRecapController(req, res, next) {
  try {
    const { workspaceId } = req.query;
    if (workspaceId) {
      const membership = await prisma.membership.findUnique({
        where: {
          userId_workspaceId: {
            userId: req.user.id,
            workspaceId,
          },
        },
      });
      if (!membership) {
        return errorResponse(res, "Accès refusé. Vous n'êtes pas membre de cet espace de travail.", 403);
      }
    }
    const recap = await getCommercialRecap(req.user.id, workspaceId);
    return successResponse(res, { recap });
  } catch (err) {
    next(err);
  }
}

export async function validateDowngradeController(req, res, next) {
  try {
    const { workspaceId, targetPlanId } = req.body;
    if (!workspaceId) {
      return errorResponse(res, "workspaceId est requis.", 400);
    }
    const membership = await prisma.membership.findUnique({
      where: {
        userId_workspaceId: {
          userId: req.user.id,
          workspaceId,
        },
      },
    });
    if (!membership || !["OWNER", "ADMIN"].includes(membership.role)) {
      return errorResponse(res, "Accès refusé. Seuls les administrateurs et le propriétaire peuvent analyser les prérequis d'un changement d'offre.", 403);
    }

    const validation = await validateDowngradeRequirements(workspaceId, targetPlanId);
    return successResponse(res, { validation });
  } catch (err) {
    next(err);
  }
}

export async function scheduleDowngradeController(req, res, next) {
  try {
    const {
      workspaceId,
      targetPlanId,
      retainedMemberIds,
      retainedEstablishmentIds,
      revokedInvitationIds,
    } = req.body;

    if (!workspaceId) {
      return errorResponse(res, "workspaceId est requis.", 400);
    }

    const membership = await prisma.membership.findUnique({
      where: {
        userId_workspaceId: {
          userId: req.user.id,
          workspaceId,
        },
      },
    });
    if (!membership || membership.role !== "OWNER") {
      return errorResponse(res, "Accès refusé. Seul le propriétaire de l'espace de travail peut programmer une rétrogradation.", 403);
    }

    const result = await schedulePlanDowngrade(req.user.id, {
      workspaceId,
      targetPlanId,
      retainedMemberIds,
      retainedEstablishmentIds,
      revokedInvitationIds,
    });

    return successResponse(res, result);
  } catch (err) {
    if (err.statusCode === 409) {
      return errorResponse(res, err.message, 409);
    }
    next(err);
  }
}

export async function getDowngradeStatusController(req, res, next) {
  try {
    const { workspaceId } = req.query;
    if (!workspaceId) {
      return errorResponse(res, "workspaceId est requis.", 400);
    }

    const membership = await prisma.membership.findUnique({
      where: {
        userId_workspaceId: {
          userId: req.user.id,
          workspaceId,
        },
      },
    });
    if (!membership) {
      return errorResponse(res, "Accès refusé. Vous n'êtes pas membre de cet espace de travail.", 403);
    }

    const request = await getWorkspaceDowngradeRequest(workspaceId);
    return successResponse(res, { request });
  } catch (err) {
    next(err);
  }
}

export async function cancelDowngradeController(req, res, next) {
  try {
    const { workspaceId } = req.body;
    if (!workspaceId) {
      return errorResponse(res, "workspaceId est requis.", 400);
    }

    const membership = await prisma.membership.findUnique({
      where: {
        userId_workspaceId: {
          userId: req.user.id,
          workspaceId,
        },
      },
    });
    if (!membership || membership.role !== "OWNER") {
      return errorResponse(res, "Accès refusé. Seul le propriétaire de l'espace peut annuler une demande de rétrogradation.", 403);
    }

    const result = await cancelPlanDowngrade(req.user.id, { workspaceId });
    return successResponse(res, result);
  } catch (err) {
    if (err.statusCode === 409) {
      return errorResponse(res, err.message, 409);
    }
    next(err);
  }
}

export async function createUpgradeIntentController(req, res, next) {
  try {
    const { workspaceId, targetPlanId, clientMutationKey } = req.body;
    if (!workspaceId || !targetPlanId) {
      return errorResponse(res, "workspaceId et targetPlanId sont requis.", 400);
    }

    const membership = await prisma.membership.findUnique({
      where: {
        userId_workspaceId: {
          userId: req.user.id,
          workspaceId,
        },
      },
    });
    if (!membership || !["OWNER", "ADMIN"].includes(membership.role)) {
      return errorResponse(res, "Accès refusé. Seul le propriétaire ou un administrateur peut initier une mise à niveau.", 403);
    }

    const result = await createUpgradeIntent(req.user.id, {
      workspaceId,
      targetPlanId,
      clientMutationKey,
    });

    return successResponse(res, result);
  } catch (err) {
    next(err);
  }
}

export async function getUpgradeStatusController(req, res, next) {
  try {
    const { workspaceId, intentId } = req.query;
    if (!workspaceId || !intentId) {
      return errorResponse(res, "workspaceId et intentId sont requis.", 400);
    }

    const membership = await prisma.membership.findUnique({
      where: {
        userId_workspaceId: {
          userId: req.user.id,
          workspaceId,
        },
      },
    });
    if (!membership) {
      return errorResponse(res, "Accès refusé. Vous n'êtes pas membre de cet espace.", 403);
    }

    const result = await getUpgradeIntentStatus(req.user.id, { workspaceId, intentId });
    return successResponse(res, result);
  } catch (err) {
    next(err);
  }
}

export async function abandonUpgradeIntentController(req, res, next) {
  try {
    const { workspaceId, intentId, reason } = req.body;
    if (!workspaceId || !intentId) {
      return errorResponse(res, "workspaceId et intentId sont requis.", 400);
    }

    const membership = await prisma.membership.findUnique({
      where: {
        userId_workspaceId: {
          userId: req.user.id,
          workspaceId,
        },
      },
    });
    if (!membership || !["OWNER", "ADMIN"].includes(membership.role)) {
      return errorResponse(res, "Accès refusé. Seul le propriétaire ou un administrateur peut abandonner une intention d'upgrade.", 403);
    }

    const result = await abandonUpgradeIntent(req.user.id, { workspaceId, intentId, reason });
    return successResponse(res, result);
  } catch (err) {
    if (err.statusCode === 409) {
      return errorResponse(res, err.message, 409);
    }
    next(err);
  }
}
