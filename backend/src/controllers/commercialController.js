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
  getWorkspaceUsageSummary,
} from "../services/commercialService.js";
import {
  createCheckoutSession,
  verifyAndConfirmPaymentSession,
  getCheckoutSessionStatus,
} from "../services/saspayService.js";
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

/**
 * Initiates a SasPay Hosted Checkout Session for subscription upgrade
 * POST /api/commercial/upgrade/checkout-session
 */
export async function createUpgradeCheckoutSessionController(req, res, next) {
  try {
    const { workspaceId, targetPlanId, returnUrl } = req.body;
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
      include: {
        user: true,
        workspace: true,
      },
    });

    if (!membership || !["OWNER", "ADMIN"].includes(membership.role)) {
      return errorResponse(res, "Accès refusé. Seul le propriétaire ou un administrateur peut souscrire à un abonnement.", 403);
    }

    // 1. Create or resolve pending SubscriptionIntent
    const intentResult = await createUpgradeIntent(req.user.id, {
      workspaceId,
      targetPlanId,
    });

    const intent = intentResult.intent;

    // 2. Call SasPay to create Hosted Checkout Session
    const user = membership.user;
    const customerName = `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email.split("@")[0];

    const session = await createCheckoutSession({
      intentId: intent.id,
      workspaceId,
      amountXaf: intent.priceXaf,
      customerEmail: user.email,
      customerName,
      customerPhone: user.phone || "",
      description: `Zadesk - Formule ${intent.targetPlan}`,
      returnUrl,
    });

    // 3. Record PaymentAttempt (idempotent sur providerSessionId)
    let attempt = await prisma.paymentAttempt.findFirst({
      where: {
        providerSessionId: session.sessionId,
      },
    });

    if (!attempt) {
      const attemptCount = await prisma.paymentAttempt.count({
        where: { intentId: intent.id },
      });

      attempt = await prisma.paymentAttempt.create({
        data: {
          intentId: intent.id,
          workspaceId,
          attemptNumber: attemptCount + 1,
          provider: "SASPAY",
          providerSessionId: session.sessionId,
          checkoutUrl: session.checkoutUrl,
          status: "CHECKOUT_CREATED",
          localAttemptKey: session.sessionId,
          expiresAt: session.expiresAt ? new Date(session.expiresAt) : null,
        },
      });
    }

    const responsePayload = {
      checkoutUrl: session.checkoutUrl,
      sessionId: session.sessionId,
      intentId: intent.id,
      amountXaf: intent.priceXaf,
      plan: intent.targetPlan,
      attemptId: attempt.id,
    };

    return successResponse(res, {
      ...responsePayload,
      data: responsePayload,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Actively checks and verifies session status from SasPay
 * GET /api/commercial/upgrade/verify-session
 */
export async function verifyUpgradeSessionController(req, res, next) {
  try {
    const { workspaceId, sessionId } = req.query;
    if (!workspaceId || !sessionId) {
      return errorResponse(res, "workspaceId et sessionId sont requis.", 400);
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

    const result = await verifyAndConfirmPaymentSession({
      userId: req.user.id,
      workspaceId,
      sessionId,
    });

    return successResponse(res, result);
  } catch (err) {
    next(err);
  }
}

/**
 * Returns commercial and payment history for workspace
 * GET /api/commercial/history
 */
export async function getCommercialHistoryController(req, res, next) {
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
      return errorResponse(res, "Accès refusé.", 403);
    }

    const [subscription, receipts, intents, usage] = await Promise.all([
      prisma.subscription.findUnique({
        where: { workspaceId },
        include: { history: { orderBy: { createdAt: "desc" }, take: 10 } },
      }),
      prisma.providerPaymentReceipt.findMany({
        where: { workspaceId },
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
      prisma.subscriptionIntent.findMany({
        where: { workspaceId },
        orderBy: { createdAt: "desc" },
        take: 10,
        include: { attempts: true },
      }),
      getWorkspaceUsageSummary(workspaceId),
    ]);

    return successResponse(res, {
      subscription,
      usage,
      receipts: receipts.map((r) => ({
        id: r.id,
        providerTransactionId: r.providerTransactionId,
        amountXaf: r.amountXaf,
        currency: r.currency,
        status: r.reconciliationStatus,
        paymentMethod: r.paymentMethod,
        paidAt: r.paidAt || r.createdAt,
      })),
      intents: intents.map((i) => ({
        id: i.id,
        targetPlan: i.targetPlan,
        priceXaf: i.priceXaf,
        status: i.status,
        createdAt: i.createdAt,
        attemptsCount: i.attempts.length,
      })),
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Returns live workspace quota consumption and alert summary
 * GET /api/commercial/usage?workspaceId=...
 */
export async function getWorkspaceUsageController(req, res, next) {
  try {
    const { workspaceId } = req.query;
    if (!workspaceId || typeof workspaceId !== "string") {
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

    if (!membership || membership.status !== "ACTIVE") {
      return errorResponse(res, "Accès refusé. Vous n'êtes pas membre actif de cet espace.", 403);
    }

    const usage = await getWorkspaceUsageSummary(workspaceId);
    return successResponse(res, { usage });
  } catch (err) {
    if (err.statusCode) {
      return errorResponse(res, err.message, err.statusCode);
    }
    next(err);
  }
}
