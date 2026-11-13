import { prisma } from "../lib/prisma.js";
import { logger } from "../utils/logger.js";

/**
 * ZADESK COMMERCIAL & PRICING SERVICE
 * Source of truth for official SaaS pricing, plan tiers, and persistent commercial intents.
 */

export const OFFICIAL_PLANS = {
  DECOUVERTE: {
    id: "DECOUVERTE",
    name: "Découverte",
    priceXaf: 0,
    periodicity: "MONTHLY",
    periodLabel: "0 FCFA permanent",
    isPaid: false,
    maxAgents: 1,
    maxEstablishments: 1,
    tagline: "Offre gratuite permanente pour lancer sa relation client.",
    description: "Pour tester et lancer la relation client de son entreprise sans engagement financier.",
    features: [
      "1 agent connecté (propriétaire) [Disponible]",
      "1 établissement principal [Disponible]",
      "Espace public d'entreprise vérifié [Disponible]",
      "Messagerie web directe Zadesk sans compte client [Disponible]",
      "Boîte de réception partagée & historique unifié [Disponible]",
      "Attribution manuelle des conversations [Disponible]",
      "Assistance standard par e-mail [Disponible]",
    ],
  },
  STARTER: {
    id: "STARTER",
    name: "Starter",
    priceXaf: 10000,
    periodicity: "MONTHLY",
    periodLabel: "10 000 FCFA / mois",
    isPaid: true,
    maxAgents: 2,
    maxEstablishments: 1,
    tagline: "Pour structurer la relation client en ligne d'une PME ou boutique active.",
    description: "1 à 2 agents connectés, routage par compétences et assistance e-mail réactive.",
    features: [
      "1 à 2 agents connectés [Disponible]",
      "1 établissement principal [Disponible]",
      "Espace public de l'entreprise [Disponible]",
      "Messagerie web Zadesk haute réactivité [Disponible]",
      "Chat instantané sans compte ni application pour le client [Disponible]",
      "Boîte de réception partagée & historique unifié [Disponible]",
      "Attribution manuelle & organisation d'équipe [Disponible]",
      "Routage intelligent des demandes par compétences [Disponible]",
      "100 résolutions automatiques par IA / mois (En préparation)",
      "Assistance standard par e-mail [Disponible]",
    ],
  },
  PRO: {
    id: "PRO",
    name: "Pro",
    priceXaf: 45000,
    periodicity: "MONTHLY",
    periodLabel: "45 000 FCFA / mois",
    isPaid: true,
    maxAgents: 5,
    maxEstablishments: 3,
    tagline: "Pour les entreprises avec une équipe relation client active et points de vente physiques.",
    description: "Jusqu'à 5 agents spécialisés, multi-établissements (jusqu'à 3 agences) et assistance prioritaire.",
    features: [
      "Jusqu'à 5 agents avec rôles spécialisés (Admin, Manager, Agent) [Disponible]",
      "Gestion multi-établissements (jusqu'à 3 agences ou succursales) [Disponible]",
      "Messagerie Zadesk haute disponibilité [Disponible]",
      "Routage intelligent et prioritaire par compétences [Disponible]",
      "Mesure d'activité et charge des agents en temps réel [Disponible]",
      "IA connectée aux documents et catalogues de l'entreprise (En préparation)",
      "Génération de QR codes pour comptoirs & points de vente (En préparation)",
      "Assistance prioritaire dédiée [Disponible]",
    ],
  },
  ENTREPRISE: {
    id: "ENTREPRISE",
    name: "Entreprise",
    priceXaf: 150000,
    periodicity: "MONTHLY",
    periodLabel: "150 000 FCFA / mois",
    isPaid: true,
    maxAgents: 999,
    maxEstablishments: 999,
    tagline: "Pour les réseaux de distribution, cliniques et multi-agences régionales.",
    description: "Agents et agences sans limite logicielle, gestion multi-établissements et accompagnement dédié.",
    features: [
      "Agents, managers et agences sans limite logicielle [Disponible]",
      "Espaces multi-établissements et agences régionales [Disponible]",
      "Gestion des rôles et permissions d'équipe sur-mesure [Disponible]",
      "SLA personnalisés et garantis (En préparation)",
      "Intégration API personnalisée (En préparation)",
      "Responsable de compte Zadesk dédié (Prestation humaine)",
      "Formation complète des équipes sur site ou à distance (Prestation humaine)",
      "Étude personnalisée d'intégration avec vos outils tiers (Prestation humaine)",
    ],
  },
};

/**
 * Normalize and validate a plan identifier
 */
export function normalizePlanId(planId) {
  if (!planId || typeof planId !== "string") return null;
  const upper = planId.trim().toUpperCase();
  if (upper in OFFICIAL_PLANS) return upper;
  
  // Clean alias support (e.g. "free" -> "DECOUVERTE")
  if (upper === "FREE") return "DECOUVERTE";
  return null;
}

/**
 * Return official plans list
 */
export function getOfficialPlans() {
  return Object.values(OFFICIAL_PLANS);
}

/**
 * Return specific official plan
 */
export function getOfficialPlan(planId) {
  const normalized = normalizePlanId(planId);
  return normalized ? OFFICIAL_PLANS[normalized] : null;
}

/**
 * Compute the next renewal date while strictly preserving the monthly billing anchor day.
 * INVARIANT (Requirement 5):
 * - An anchor day of 31 on January 31 moves to February 28 (or 29 in leap year).
 * - Next renewal in March strictly returns to March 31.
 * - The original anchorDay is never mutated or replaced by an intermediate date.
 */
export function computeNextRenewalDate(fromDate, anchorDay) {
  if (!fromDate) throw new Error("fromDate est obligatoire.");
  const day = typeof anchorDay === "number" && anchorDay >= 1 && anchorDay <= 31 ? anchorDay : new Date(fromDate).getUTCDate();
  
  const date = new Date(fromDate);
  let targetYear = date.getUTCFullYear();
  let targetMonth = date.getUTCMonth() + 1; // move to next month
  if (targetMonth > 11) {
    targetMonth = 0;
    targetYear += 1;
  }

  // Last calendar day of the target month in UTC (month + 1 with day 0)
  const lastDayOfTargetMonth = new Date(Date.UTC(targetYear, targetMonth + 1, 0)).getUTCDate();
  const effectiveDay = Math.min(day, lastDayOfTargetMonth);

  return new Date(Date.UTC(
    targetYear,
    targetMonth,
    effectiveDay,
    date.getUTCHours(),
    date.getUTCMinutes(),
    date.getUTCSeconds(),
    date.getUTCMilliseconds()
  ));
}

/**
 * Determine the effective active commercial plan for a workspace.
 * Prior to Phase A migration and SasPay live confirmation, all workspaces
 * operate under the DECOUVERTE tier.
 */
export async function getWorkspaceActivePlan(workspaceId) {
  if (!workspaceId) return OFFICIAL_PLANS.DECOUVERTE;
  try {
    if (prisma.subscription) {
      const sub = await prisma.subscription.findUnique({
        where: { workspaceId },
      });
      if (sub && sub.status === "ACTIVE" && OFFICIAL_PLANS[sub.plan]) {
        return OFFICIAL_PLANS[sub.plan];
      }
    }
  } catch (_) {
    // Database tables not migrated yet; fallback safely to DECOUVERTE
  }
  return OFFICIAL_PLANS.DECOUVERTE;
}

/**
 * Save user commercial intent persistently
 * Backend validates the plan and enforces official pricing.
 * Persisted in OnboardingDraft store (compatible with all PostgreSQL states).
 */
export async function saveCommercialIntent(userId, { planId, workspaceId = null }) {
  const normalizedPlan = normalizePlanId(planId);
  if (!normalizedPlan) {
    const error = new Error("Formule tarifaire non reconnue ou invalide.");
    error.statusCode = 400;
    throw error;
  }

  const planInfo = OFFICIAL_PLANS[normalizedPlan];
  const officialPriceXaf = planInfo.priceXaf;

  // 1. Verify workspace ownership if workspaceId is provided
  let verifiedWorkspace = null;
  if (workspaceId) {
    const membership = await prisma.membership.findFirst({
      where: {
        userId,
        workspaceId,
      },
      include: { workspace: true },
    });

    if (!membership) {
      const error = new Error("Espace de travail non trouvé ou non autorisé.");
      error.statusCode = 403;
      throw error;
    }
    verifiedWorkspace = membership.workspace;
  }

  // 2. Persist intent in OnboardingDraft data store (guaranteed compatibility with existing PostgreSQL)
  try {
    const existingDraft = await prisma.onboardingDraft.findUnique({
      where: { userId },
    });

    const currentData = (existingDraft?.data && typeof existingDraft.data === "object")
      ? existingDraft.data
      : {};

    const updatedData = {
      ...currentData,
      selectedPlan: normalizedPlan,
      workspaceId: verifiedWorkspace?.id || currentData.workspaceId || null,
      workspaceName: verifiedWorkspace?.name || currentData.workspaceName || null,
      commercialIntent: {
        planId: normalizedPlan,
        planName: planInfo.name,
        priceXaf: officialPriceXaf,
        periodicity: planInfo.periodicity,
        isPaid: planInfo.isPaid,
        workspaceId: verifiedWorkspace?.id || null,
        workspaceName: verifiedWorkspace?.name || null,
        status: "PENDING",
        updatedAt: new Date().toISOString(),
      },
    };

    await prisma.onboardingDraft.upsert({
      where: { userId },
      update: { data: updatedData },
      create: {
        userId,
        step: 1,
        data: updatedData,
      },
    });
  } catch (err) {
    logger.warn(`Could not update onboarding draft commercial intent for user ${userId}: ${err.message}`);
  }

  return {
    success: true,
    plan: planInfo,
    priceXaf: officialPriceXaf,
    status: "PENDING",
    workspaceId: verifiedWorkspace?.id || null,
    workspaceName: verifiedWorkspace?.name || null,
    persistedIn: "DRAFT_STORE",
  };
}

/**
 * Retrieve user's current commercial intent
 */
export async function getCommercialIntent(userId, workspaceId = null) {
  // Check draft store first
  const draft = await prisma.onboardingDraft.findUnique({
    where: { userId },
  });

  const draftData = draft?.data || {};
  const selectedPlanId = draftData.selectedPlan || draftData.commercialIntent?.planId || "DECOUVERTE";
  const normalized = normalizePlanId(selectedPlanId) || "DECOUVERTE";
  const planInfo = OFFICIAL_PLANS[normalized];

  let workspace = null;
  if (workspaceId) {
    workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: { id: true, name: true, slug: true },
    });
  } else {
    // Check if user owns an active workspace
    const ownership = await prisma.membership.findFirst({
      where: { userId, role: "OWNER" },
      include: { workspace: true },
    });
    if (ownership) {
      workspace = ownership.workspace;
    }
  }

  return {
    plan: planInfo,
    priceXaf: planInfo.priceXaf,
    isPaid: planInfo.isPaid,
    workspace: workspace ? { id: workspace.id, name: workspace.name, slug: workspace.slug } : null,
    rawIntent: draftData.commercialIntent || null,
  };
}

/**
 * Get comprehensive commercial recap for a user/workspace
 */
export async function getCommercialRecap(userId, workspaceId = null) {
  const intentData = await getCommercialIntent(userId, workspaceId);
  const plan = intentData.plan;

  return {
    enterpriseName: intentData.workspace?.name || "Votre entreprise",
    workspaceId: intentData.workspace?.id || null,
    planId: plan.id,
    planName: plan.name,
    monthlyPriceXaf: plan.priceXaf,
    periodicity: "Abonnement mensuel sans engagement",
    totalDueNowXaf: plan.priceXaf,
    currency: "FCFA (XAF)",
    paymentMethods: "Airtel Money, MTN Mobile Money & Cartes bancaires (SasPay CEMAC)",
    isPaid: plan.isPaid,
    baseStatus: "ACTIVE", // Découverte is always active
    paymentGatewayStatus: "PREPARED", // Ready for SasPay live Phase D
    canAccessWorkspaceNow: true, // User can access Découverte immediately
  };
}

/**
 * Validate workspace resource requirements for a proposed downgrade.
 * Evaluates active members, pending invitations, active establishments,
 * and billing renewal period without mutating any resource.
 */
export async function validateDowngradeRequirements(workspaceId, targetPlanId) {
  const normalizedTarget = normalizePlanId(targetPlanId);
  if (!normalizedTarget) {
    const error = new Error("Formule cible non reconnue ou invalide.");
    error.statusCode = 400;
    throw error;
  }

  const targetPlan = OFFICIAL_PLANS[normalizedTarget];
  const currentPlan = await getWorkspaceActivePlan(workspaceId);

  // 1. Fetch active members
  const members = await prisma.membership.findMany({
    where: { workspaceId },
    include: {
      user: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  // 2. Fetch valid pending invitations (neither accepted nor revoked nor expired)
  const pendingInvitations = await prisma.workspaceInvitation.findMany({
    where: {
      workspaceId,
      acceptedAt: null,
      revokedAt: null,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "asc" },
  });

  // 3. Fetch active establishments
  const establishments = await prisma.establishment.findMany({
    where: { workspaceId, isActive: true },
    orderBy: [{ isMain: "desc" }, { createdAt: "asc" }],
  });

  // 4. Inspect official billing renewal date from Subscription (if available)
  let effectiveDate = null;
  try {
    if (prisma.subscription) {
      const sub = await prisma.subscription.findUnique({
        where: { workspaceId },
      });
      if (sub && sub.status === "ACTIVE" && sub.currentPeriodEnd) {
        effectiveDate = sub.currentPeriodEnd.toISOString();
      }
    }
  } catch (_) {
    // Unmigrated or unconfigured billing tables
  }

  const totalSeatsInUse = members.length + pendingInvitations.length;
  const surplusMembers = Math.max(0, members.length - targetPlan.maxAgents);
  const surplusSeats = Math.max(0, totalSeatsInUse - targetPlan.maxAgents);
  const surplusEstablishments = Math.max(0, establishments.length - targetPlan.maxEstablishments);
  const requiresSelection = surplusSeats > 0 || surplusEstablishments > 0;

  // 5. Evaluate technical feasibility and blocking conditions
  let isBlocked = false;
  let blockedReason = null;

  if (!effectiveDate) {
    // No active paid subscription cycle with an official renewal date
    isBlocked = true;
    blockedReason = `Aucun abonnement payant avec date d'échéance active n'a été détecté pour cet espace (forfait Découverte ou en attente d'activation SasPay). La date d'effet ne peut être calculée artificiellement sans cycle de facturation effectif.`;
  }

  const status = isBlocked ? "BLOCKED" : requiresSelection ? "DRAFT" : "READY";

  return {
    workspaceId,
    currentPlan,
    targetPlan,
    status,
    isBlocked,
    blockedReason,
    effectiveDate,
    limits: {
      maxAgents: targetPlan.maxAgents,
      maxEstablishments: targetPlan.maxEstablishments,
    },
    currentCounts: {
      membersCount: members.length,
      pendingInvitesCount: pendingInvitations.length,
      totalSeatsInUse,
      establishmentsCount: establishments.length,
    },
    surplus: {
      members: surplusMembers,
      seats: surplusSeats,
      establishments: surplusEstablishments,
    },
    requiresSelection,
    canDowngradeDirectly: !requiresSelection && !isBlocked,
    resources: {
      members: members.map((m) => ({
        id: m.id,
        userId: m.userId,
        role: m.role,
        isOwner: m.role === "OWNER",
        name: [m.user?.firstName, m.user?.lastName].filter(Boolean).join(" ") || m.user?.email || "Membre",
        email: m.user?.email,
      })),
      pendingInvitations: pendingInvitations.map((inv) => ({
        id: inv.id,
        email: inv.email,
        role: inv.role,
        expiresAt: inv.expiresAt,
      })),
      establishments: establishments.map((e) => ({
        id: e.id,
        name: e.name,
        type: e.type,
        isMain: e.isMain,
        city: e.city,
      })),
    },
  };
}

/**
 * Retrieve the latest persistent commercial downgrade request for a workspace.
 * Queries PostgreSQL AuditLog (durable, survives logout, keyed by workspace).
 */
export async function getWorkspaceDowngradeRequest(workspaceId) {
  if (!workspaceId) return null;

  try {
    if (prisma.commercialDowngradeRequest) {
      const record = await prisma.commercialDowngradeRequest.findFirst({
        where: { workspaceId },
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      });
      if (record) return record;
    }
  } catch (_) {}

  const latestLog = await prisma.auditLog.findFirst({
    where: {
      workspaceId,
      entityType: "COMMERCIAL_DOWNGRADE",
      entityId: `downgrade_${workspaceId}`,
      action: { in: ["DOWNGRADE_REQUESTED", "DOWNGRADE_BLOCKED", "DOWNGRADE_SCHEDULED", "DOWNGRADE_CANCELLED", "DOWNGRADE_APPLIED", "DOWNGRADE_OBSOLETE_CANCELLED"] },
    },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
  });

  return latestLog?.details || null;
}

/**
 * Request a workspace plan downgrade.
 * INVARIANT: Strictly deferred. NEVER mutates or deactivates any resource immediately.
 * Zero immediate branch deactivation, zero immediate invitation revocation, zero member modification.
 * Persisted durably in PostgreSQL AuditLog.
 */
export async function requestPlanDowngrade(userId, {
  workspaceId,
  targetPlanId,
  retainedMemberIds = [],
  retainedEstablishmentIds = [],
  revokedInvitationIds = [],
}) {
  if (!workspaceId) {
    const error = new Error("workspaceId est obligatoire.");
    error.statusCode = 400;
    throw error;
  }

  // 1. Verify owner authorization
  const ownership = await prisma.membership.findFirst({
    where: {
      userId,
      workspaceId,
      role: "OWNER",
    },
  });

  if (!ownership) {
    const error = new Error("Seul le propriétaire de l'espace est autorisé à demander une rétrogradation.");
    error.statusCode = 403;
    throw error;
  }

  const normalizedTarget = normalizePlanId(targetPlanId);
  if (!normalizedTarget) {
    const error = new Error("Formule cible non reconnue.");
    error.statusCode = 400;
    throw error;
  }

  // 2. Validate downgrade requirements and detect blockers
  const validation = await validateDowngradeRequirements(workspaceId, normalizedTarget);
  const targetPlan = validation.targetPlan;

  // 3. Strict Invariant Checks:
  // - Owner can NEVER be excluded or removed
  const ownerMember = validation.resources.members.find((m) => m.isOwner);
  if (ownerMember && retainedMemberIds.length > 0 && !retainedMemberIds.includes(ownerMember.id) && !retainedMemberIds.includes(ownerMember.userId)) {
    const error = new Error("Le propriétaire de l'espace (OWNER) ne peut jamais être exclu des collaborateurs conservés.");
    error.statusCode = 400;
    throw error;
  }

  // - Main establishment (Headquarters) can NEVER be deactivated
  const mainEstablishment = validation.resources.establishments.find((e) => e.isMain);
  if (mainEstablishment && retainedEstablishmentIds.length > 0 && !retainedEstablishmentIds.includes(mainEstablishment.id)) {
    const error = new Error("L'établissement principal (siège social) ne peut jamais être désactivé.");
    error.statusCode = 400;
    throw error;
  }

  if (retainedMemberIds.length > targetPlan.maxAgents) {
    const error = new Error(
      `Le nombre de collaborateurs conservés (${retainedMemberIds.length}) dépasse la limite de la formule ${targetPlan.name} (${targetPlan.maxAgents}).`
    );
    error.statusCode = 400;
    throw error;
  }

  if (retainedEstablishmentIds.length > targetPlan.maxEstablishments) {
    const error = new Error(
      `Le nombre d'établissements conservés (${retainedEstablishmentIds.length}) dépasse la limite de la formule ${targetPlan.name} (${targetPlan.maxEstablishments}).`
    );
    error.statusCode = 400;
    throw error;
  }

  // 4. Construct durable downgrade request representation
  let activeSubscriptionId = null;
  let activeSubscriptionVersion = 1;
  try {
    if (prisma.subscription) {
      const sub = await prisma.subscription.findUnique({ where: { workspaceId } });
      if (sub) {
        activeSubscriptionId = sub.id;
        activeSubscriptionVersion = sub.version;
      }
    }
  } catch (_) {}

  const finalStatus = validation.isBlocked ? "BLOCKED" : "SCHEDULED";
  const downgradeRecord = {
    workspaceId,
    subscriptionId: activeSubscriptionId,
    expectedSubscriptionVersion: activeSubscriptionVersion,
    currentPlanId: validation.currentPlan.id,
    currentPlanName: validation.currentPlan.name,
    targetPlanId: targetPlan.id,
    targetPlanName: targetPlan.name,
    targetPriceXaf: targetPlan.priceXaf,
    status: finalStatus,
    isBlocked: validation.isBlocked,
    blockedReason: validation.blockedReason,
    effectiveDate: validation.effectiveDate,
    retainedMemberIds,
    retainedEstablishmentIds,
    revokedInvitationIds,
    requestedByUserId: userId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // 5. Persist durably in PostgreSQL AuditLog within uniform locking order
  await prisma.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT id FROM "workspaces" WHERE id = ${workspaceId} FOR UPDATE`;

    // Concurrency Check (Scenario A):
    // If scheduling a downgrade, verify no active SCHEDULED downgrade already exists.
    if (finalStatus === "SCHEDULED") {
      const existingLog = await tx.auditLog.findFirst({
        where: {
          workspaceId,
          entityType: "COMMERCIAL_DOWNGRADE",
          entityId: `downgrade_${workspaceId}`,
          action: { in: ["DOWNGRADE_SCHEDULED", "DOWNGRADE_APPLIED", "DOWNGRADE_CANCELLED", "DOWNGRADE_OBSOLETE_CANCELLED"] },
        },
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      });

      if (existingLog && existingLog.action === "DOWNGRADE_SCHEDULED" && existingLog.details?.status === "SCHEDULED") {
        const conflictErr = new Error(
          `Une rétrogradation est déjà programmée pour cet espace vers la formule ${existingLog.details.targetPlanName || existingLog.details.targetPlanId} pour le ${existingLog.details.effectiveDate}. Vous devez annuler la demande existante avant d'en programmer une nouvelle.`
        );
        conflictErr.statusCode = 409;
        conflictErr.code = "DOWNGRADE_ALREADY_SCHEDULED";
        conflictErr.existingRequest = existingLog.details;
        throw conflictErr;
      }
    }

    if (tx.commercialDowngradeRequest && finalStatus === "SCHEDULED" && validation.effectiveDate) {
      try {
        await tx.commercialDowngradeRequest.create({
          data: {
            workspaceId,
            requestedByUserId: userId,
            currentPlanId: validation.currentPlan.id,
            targetPlanId: targetPlan.id,
            status: finalStatus,
            effectiveDate: new Date(validation.effectiveDate),
            isBlocked: validation.isBlocked,
            blockedReason: validation.blockedReason,
            retainedMemberIds,
            retainedEstablishmentIds,
            revokedInvitationIds,
          },
        });
      } catch (_) {
        // Safe fallback if relational table not yet migrated
      }
    }

    await tx.auditLog.create({
      data: {
        workspaceId,
        userId,
        action: finalStatus === "BLOCKED" ? "DOWNGRADE_BLOCKED" : "DOWNGRADE_SCHEDULED",
        entityType: "COMMERCIAL_DOWNGRADE",
        entityId: `downgrade_${workspaceId}`,
        details: downgradeRecord,
      },
    });
  });

  // 6. Absolute Invariant Enforcement:
  // ZERO IMMEDIATE RESOURCE DEACTIVATION OR REVOCATION.
  // Current plan rights, establishments, and invitations remain 100% functional.

  if (validation.isBlocked) {
    return {
      success: false,
      blocked: true,
      status: "BLOCKED",
      message: validation.blockedReason,
      request: downgradeRecord,
    };
  }

  return {
    success: true,
    blocked: false,
    status: "SCHEDULED",
    effectiveDate: validation.effectiveDate,
    message: `La rétrogradation vers la formule ${targetPlan.name} est enregistrée pour le ${validation.effectiveDate}. Vos accès actuels (${validation.currentPlan.name}) restent intégralement préservés jusqu'à cette date.`,
    request: downgradeRecord,
  };
}

/**
 * Cancel a previously requested downgrade.
 * Atomic and serialized under row-level lock (Scenario B).
 */
export async function cancelPlanDowngrade(userId, { workspaceId }) {
  if (!workspaceId) {
    const error = new Error("workspaceId est obligatoire.");
    error.statusCode = 400;
    throw error;
  }

  const ownership = await prisma.membership.findFirst({
    where: {
      userId,
      workspaceId,
      role: "OWNER",
    },
  });

  if (!ownership) {
    const error = new Error("Seul le propriétaire de l'espace peut annuler une demande de rétrogradation.");
    error.statusCode = 403;
    throw error;
  }

  return await prisma.$transaction(async (tx) => {
    // 1. Uniform lock on workspace to serialize with concurrent apply/schedule
    await tx.$queryRaw`SELECT id FROM "workspaces" WHERE id = ${workspaceId} FOR UPDATE`;

    // 2. Fetch latest request state under lock
    const latestLog = await tx.auditLog.findFirst({
      where: {
        workspaceId,
        entityType: "COMMERCIAL_DOWNGRADE",
        entityId: `downgrade_${workspaceId}`,
        action: { in: ["DOWNGRADE_SCHEDULED", "DOWNGRADE_APPLIED", "DOWNGRADE_CANCELLED", "DOWNGRADE_OBSOLETE_CANCELLED"] },
      },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    });

    const current = latestLog?.details;
    if (!current || ["CANCELLED", "OBSOLETE_CANCELLED"].includes(current.status) || latestLog.action === "DOWNGRADE_CANCELLED") {
      return {
        success: true,
        message: "Aucune demande de rétrogradation active à annuler.",
      };
    }

    // Strict Illegal Transition check (Scenario B):
    // Cannot cancel a downgrade that has already been applied!
    if (current.status === "APPLIED" || latestLog.action === "DOWNGRADE_APPLIED") {
      const err = new Error("Impossible d'annuler cette demande : la rétrogradation a déjà été appliquée à l'échéance.");
      err.statusCode = 409;
      err.code = "DOWNGRADE_ALREADY_APPLIED";
      throw err;
    }

    if (current.status !== "SCHEDULED") {
      const err = new Error("Aucune demande de rétrogradation programmée active ne peut être annulée.");
      err.statusCode = 400;
      throw err;
    }

    const updatedRecord = {
      ...current,
      status: "CANCELLED",
      cancelledAt: new Date().toISOString(),
      cancelledByUserId: userId,
    };

    if (tx.commercialDowngradeRequest) {
      try {
        await tx.commercialDowngradeRequest.updateMany({
          where: { workspaceId, status: "SCHEDULED" },
          data: {
            status: "CANCELLED",
            cancelledAt: new Date(),
            cancelledByUserId: userId,
          },
        });
      } catch (_) {}
    }

    await tx.auditLog.create({
      data: {
        workspaceId,
        userId,
        action: "DOWNGRADE_CANCELLED",
        entityType: "COMMERCIAL_DOWNGRADE",
        entityId: `downgrade_${workspaceId}`,
        details: updatedRecord,
      },
    });

    return {
      success: true,
      message: "La demande de rétrogradation a été annulée avec succès. Vos conditions actuelles sont maintenues.",
      request: updatedRecord,
    };
  });
}

/**
 * Idempotent execution engine contract for applying a due downgrade.
 * Prepared for Phase D billing worker:
 * - Executes only when status is SCHEDULED and effectiveDate is reached.
 * - Detects plan drift (Scenario D) and marks request OBSOLETE_CANCELLED if plan changed.
 * - Atomic mutations within transaction rollback on failure (Scenario E).
 * - Never executes twice (idempotence, Scenario C).
 */
export async function applyScheduledDowngrade(workspaceId) {
  return await prisma.$transaction(async (tx) => {
    // 1. Uniform lock on workspace
    await tx.$queryRaw`SELECT id FROM "workspaces" WHERE id = ${workspaceId} FOR UPDATE`;

    // 2. Fetch latest downgrade state under lock
    const latestLog = await tx.auditLog.findFirst({
      where: {
        workspaceId,
        entityType: "COMMERCIAL_DOWNGRADE",
        entityId: `downgrade_${workspaceId}`,
        action: { in: ["DOWNGRADE_SCHEDULED", "DOWNGRADE_APPLIED", "DOWNGRADE_CANCELLED", "DOWNGRADE_OBSOLETE_CANCELLED"] },
      },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    });

    const request = latestLog?.details;
    if (!request || request.status !== "SCHEDULED") {
      if (latestLog?.action === "DOWNGRADE_APPLIED" || request?.status === "APPLIED") {
        return { applied: false, reason: "ALREADY_APPLIED", appliedAt: request?.appliedAt || null };
      }
      if (latestLog?.action === "DOWNGRADE_CANCELLED" || request?.status === "CANCELLED") {
        return { applied: false, reason: "DOWNGRADE_CANCELLED" };
      }
      if (latestLog?.action === "DOWNGRADE_OBSOLETE_CANCELLED" || request?.status === "OBSOLETE_CANCELLED") {
        return { applied: false, reason: "OBSOLETE_PLAN_CHANGED" };
      }
      return { applied: false, reason: "NO_SCHEDULED_DOWNGRADE_FOUND" };
    }

    // 3. Verify effective date is reached
    if (request.effectiveDate && new Date(request.effectiveDate) > new Date()) {
      return {
        applied: false,
        reason: "EFFECTIVE_DATE_NOT_REACHED",
        effectiveDate: request.effectiveDate,
      };
    }

    // 4. Scenario D: Verify active plan & subscription version have not drifted
    const currentPlan = await getWorkspaceActivePlan(workspaceId);
    let hasSubscriptionVersionDrift = false;
    let currentSubVersion = null;
    if (tx.subscription && request.subscriptionId) {
      try {
        const sub = await tx.subscription.findUnique({ where: { workspaceId } });
        if (sub && typeof request.expectedSubscriptionVersion === "number" && sub.version !== request.expectedSubscriptionVersion) {
          hasSubscriptionVersionDrift = true;
          currentSubVersion = sub.version;
        }
      } catch (_) {}
    }

    if (currentPlan.id !== request.currentPlanId || hasSubscriptionVersionDrift) {
      const reasonMsg = hasSubscriptionVersionDrift
        ? `L'abonnement a évolué vers une version supérieure (v${currentSubVersion}) depuis la demande de rétrogradation (v${request.expectedSubscriptionVersion}).`
        : `Le forfait actif de l'espace a évolué (${currentPlan.name}) par rapport à la demande initiale (${request.currentPlanName || request.currentPlanId}).`;

      const obsoleteRecord = {
        ...request,
        status: "OBSOLETE_CANCELLED",
        obsoleteAt: new Date().toISOString(),
        reason: reasonMsg,
      };

      if (tx.commercialDowngradeRequest) {
        try {
          await tx.commercialDowngradeRequest.updateMany({
            where: { workspaceId, status: "SCHEDULED" },
            data: { status: "OBSOLETE_CANCELLED" },
          });
        } catch (_) {}
      }

      await tx.auditLog.create({
        data: {
          workspaceId,
          userId: request.requestedByUserId,
          action: "DOWNGRADE_OBSOLETE_CANCELLED",
          entityType: "COMMERCIAL_DOWNGRADE",
          entityId: `downgrade_${workspaceId}`,
          details: obsoleteRecord,
        },
      });
      return {
        applied: false,
        reason: "OBSOLETE_PLAN_CHANGED",
        message: obsoleteRecord.reason,
      };
    }

    // 5. Apply non-destructive adjustments at due date
    // - Reversible suspension of surplus members (Phase D.1)
    if (Array.isArray(request.retainedMemberIds) && request.retainedMemberIds.length > 0) {
      await tx.membership.updateMany({
        where: {
          workspaceId,
          status: "ACTIVE",
          role: { not: "OWNER" }, // Absolute Invariant: OWNER can NEVER be suspended
          AND: [
            { id: { notIn: request.retainedMemberIds } },
            { userId: { notIn: request.retainedMemberIds } },
          ],
        },
        data: {
          status: "SUSPENDED",
          suspendedAt: new Date(),
          suspendedReason: "COMMERCIAL_DOWNGRADE",
        },
      });
    }

    // - Deactivate surplus secondary establishments
    if (Array.isArray(request.retainedEstablishmentIds) && request.retainedEstablishmentIds.length > 0) {
      await tx.establishment.updateMany({
        where: {
          workspaceId,
          id: { notIn: request.retainedEstablishmentIds },
          isMain: false, // Headquarters is never automatically deactivated
        },
        data: { isActive: false },
      });
    }

    // - Revoke surplus unaccepted invitations
    if (Array.isArray(request.revokedInvitationIds) && request.revokedInvitationIds.length > 0) {
      await tx.workspaceInvitation.updateMany({
        where: {
          workspaceId,
          id: { in: request.revokedInvitationIds },
          acceptedAt: null,
        },
        data: { revokedAt: new Date() },
      });
    }

    const appliedRecord = {
      ...request,
      status: "APPLIED",
      appliedAt: new Date().toISOString(),
    };

    if (tx.commercialDowngradeRequest) {
      try {
        await tx.commercialDowngradeRequest.updateMany({
          where: { workspaceId, status: "SCHEDULED" },
          data: {
            status: "APPLIED",
            appliedAt: new Date(),
          },
        });
      } catch (_) {}
    }

    await tx.auditLog.create({
      data: {
        workspaceId,
        userId: request.requestedByUserId,
        action: "DOWNGRADE_APPLIED",
        entityType: "COMMERCIAL_DOWNGRADE",
        entityId: `downgrade_${workspaceId}`,
        details: appliedRecord,
      },
    });

    return {
      applied: true,
      workspaceId,
      targetPlanId: request.targetPlanId,
      appliedAt: appliedRecord.appliedAt,
    };
  });
}

/**
 * Backward compatibility alias for schedulePlanDowngrade
 */
export async function schedulePlanDowngrade(userId, params) {
  return await requestPlanDowngrade(userId, params);
}

/**
 * Retrieve all workspaces with an active scheduled downgrade that has reached its effective date.
 * Used by the recurring billing worker (BullMQ).
 */
export async function findDueScheduledDowngrades() {
  const now = new Date();
  // 1. Try relational table first
  try {
    if (prisma.commercialDowngradeRequest) {
      const records = await prisma.commercialDowngradeRequest.findMany({
        where: {
          status: "SCHEDULED",
          effectiveDate: { lte: now },
        },
        select: { workspaceId: true, effectiveDate: true },
      });
      if (records && records.length > 0) return records;
    }
  } catch (_) {}

  // 2. Fallback to AuditLog
  const scheduledLogs = await prisma.auditLog.findMany({
    where: {
      entityType: "COMMERCIAL_DOWNGRADE",
      action: "DOWNGRADE_SCHEDULED",
    },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
  });

  const due = [];
  const seenWorkspaces = new Set();
  for (const log of scheduledLogs) {
    if (seenWorkspaces.has(log.workspaceId)) continue;
    seenWorkspaces.add(log.workspaceId);
    if (log.details?.status === "SCHEDULED" && log.details?.effectiveDate) {
      if (new Date(log.details.effectiveDate) <= now) {
        due.push({ workspaceId: log.workspaceId, effectiveDate: log.details.effectiveDate });
      }
    }
  }
  return due;
}

/**
 * Conversion logique d'un ancien workspace vers son abonnement canonique DECOUVERTE.
 * Idempotent : Ne crée pas de doublon si une souscription existe déjà.
 * Ne modifie aucune donnée existante.
 */
export async function prepareLegacyWorkspaceDecouverteSubscription(workspaceId, { tx = prisma } = {}) {
  if (!workspaceId) throw new Error("workspaceId est obligatoire.");

  // 1. Vérifier si une souscription existe déjà
  if (tx.subscription) {
    const existing = await tx.subscription.findUnique({
      where: { workspaceId },
    });
    if (existing) {
      return {
        converted: false,
        reason: "ALREADY_EXISTS",
        subscription: existing,
      };
    }

    // 2. Création de la souscription DECOUVERTE canonique
    const now = new Date();
    const newSub = await tx.subscription.create({
      data: {
        workspaceId,
        plan: "DECOUVERTE",
        status: "ACTIVE",
        activePriceXaf: 0,
        currentPeriodStart: now,
        currentPeriodEnd: null, // Forfait gratuit permanent
        billingAnchorDay: null,
        version: 1,
      },
    });

    return {
      converted: true,
      subscription: newSub,
    };
  }

  return {
    converted: false,
    reason: "PRISMA_SUBSCRIPTION_TABLE_NOT_AVAILABLE",
  };
}

/**
 * Préparation de la conversion de tous les workspaces orphelins de souscription.
 * Ne lance aucun backfill automatique sur la base réelle, utilisable pour les migrations programmées.
 */
export async function prepareAllLegacyWorkspacesDecouverteSubscriptions({ tx = prisma } = {}) {
  if (!tx.workspace || !tx.subscription) {
    return { count: 0, converted: [] };
  }

  const workspacesWithoutSub = await tx.workspace.findMany({
    where: { subscription: null },
    select: { id: true, name: true },
  });

  const converted = [];
  for (const ws of workspacesWithoutSub) {
    const res = await prepareLegacyWorkspaceDecouverteSubscription(ws.id, { tx });
    if (res.converted) {
      converted.push({ workspaceId: ws.id, name: ws.name, subscriptionId: res.subscription.id });
    }
  }

  return {
    count: converted.length,
    converted,
  };
}

/**
 * Création d'une intention d'upgrade vers un forfait payant supérieur.
 * Enregistre l'intention (SubscriptionIntent) au statut PENDING et initialise PaymentAttempt.
 * Invariant : Aucun changement d'abonnement n'a lieu avant confirmation financière validée.
 */
export async function createUpgradeIntent(userId, { workspaceId, targetPlanId, clientMutationKey = null, tx = prisma }) {
  if (!workspaceId) throw new Error("workspaceId est obligatoire.");
  const normalizedTarget = normalizePlanId(targetPlanId);
  if (!normalizedTarget || normalizedTarget === "DECOUVERTE") {
    const err = new Error("La formule cible d'un upgrade doit être une formule payante reconnue (STARTER, PRO, ENTREPRISE).");
    err.statusCode = 400;
    throw err;
  }

  const targetPlan = OFFICIAL_PLANS[normalizedTarget];

  // Vérifier rôle OWNER ou ADMIN
  const membership = await tx.membership.findFirst({
    where: { userId, workspaceId, role: { in: ["OWNER", "ADMIN"] } },
  });
  if (!membership) {
    const err = new Error("Seul le propriétaire ou un administrateur peut initier une mise à niveau.");
    err.statusCode = 403;
    throw err;
  }

  // Récupérer la souscription active existante (ou initialiser DECOUVERTE)
  let sub = null;
  if (tx.subscription) {
    sub = await tx.subscription.findUnique({ where: { workspaceId } });
    if (!sub) {
      const initRes = await prepareLegacyWorkspaceDecouverteSubscription(workspaceId, { tx });
      sub = initRes.subscription;
    }
  }

  if (!sub) {
    const err = new Error("Impossible d'associer l'intention : table d'abonnement inaccessible.");
    err.statusCode = 500;
    throw err;
  }

  // Idempotence : si un clientMutationKey est fourni et existe déjà
  const mutationKey = clientMutationKey || `upg_${workspaceId}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  if (tx.subscriptionIntent) {
    const existingIntent = await tx.subscriptionIntent.findUnique({
      where: { clientMutationKey: mutationKey },
      include: { attempts: true },
    });
    if (existingIntent) {
      return {
        success: true,
        isIdempotent: true,
        intent: existingIntent,
        targetPlan,
      };
    }

    const intent = await tx.subscriptionIntent.create({
      data: {
        workspaceId,
        subscriptionId: sub.id,
        userId,
        intentType: "UPGRADE",
        targetPlan: targetPlan.id,
        priceXaf: targetPlan.priceXaf,
        currency: "XAF",
        status: "PENDING",
        clientMutationKey: mutationKey,
        expectedSubscriptionVersion: sub.version,
      },
    });

    const attempt = await tx.paymentAttempt.create({
      data: {
        intentId: intent.id,
        workspaceId,
        attemptNumber: 1,
        provider: "SASPAY",
        status: "INITIATED",
        localAttemptKey: `att_${intent.id}_1`,
      },
    });

    return {
      success: true,
      intent,
      attempt,
      targetPlan,
      subscriptionVersion: sub.version,
    };
  }

  return {
    success: false,
    message: "Modèles financiers non disponibles.",
  };
}

/**
 * Consultation sécurisée du statut d'une intention d'upgrade (Action utilisateur autorisée)
 */
export async function getUpgradeIntentStatus(userId, { workspaceId, intentId }) {
  if (!workspaceId || !intentId) {
    const err = new Error("workspaceId et intentId sont requis.");
    err.statusCode = 400;
    throw err;
  }

  const intent = await prisma.subscriptionIntent.findUnique({
    where: { id: intentId },
    include: {
      subscription: { select: { id: true, plan: true, status: true, version: true } },
      attempts: { select: { id: true, attemptNumber: true, status: true, checkoutUrl: true, createdAt: true } },
    },
  });

  if (!intent || intent.workspaceId !== workspaceId) {
    const err = new Error("Intention introuvable.");
    err.statusCode = 404;
    throw err;
  }

  return {
    id: intent.id,
    workspaceId: intent.workspaceId,
    targetPlan: intent.targetPlan,
    priceXaf: intent.priceXaf,
    currency: intent.currency,
    status: intent.status,
    createdAt: intent.createdAt,
    updatedAt: intent.updatedAt,
    subscription: intent.subscription,
    attempts: intent.attempts,
  };
}

/**
 * Abandon explicite d'une intention d'upgrade par l'utilisateur (Action utilisateur autorisée)
 */
export async function abandonUpgradeIntent(userId, { workspaceId, intentId, reason = "USER_CANCELLED" }) {
  if (!workspaceId || !intentId) {
    const err = new Error("workspaceId et intentId sont requis.");
    err.statusCode = 400;
    throw err;
  }

  return await prisma.$transaction(async (tx) => {
    const intent = await tx.subscriptionIntent.findUnique({
      where: { id: intentId },
    });

    if (!intent || intent.workspaceId !== workspaceId) {
      const err = new Error("Intention introuvable.");
      err.statusCode = 404;
      throw err;
    }

    if (intent.status === "COMPLETED") {
      const err = new Error("Impossible d'abandonner une intention dont le paiement a déjà été validé et appliqué.");
      err.statusCode = 409;
      throw err;
    }

    if (intent.status === "ABANDONED") {
      return { success: true, message: "Intention déjà abandonnée.", intent };
    }

    const updated = await tx.subscriptionIntent.update({
      where: { id: intent.id },
      data: { status: "ABANDONED" },
    });

    await tx.auditLog.create({
      data: {
        workspaceId,
        userId,
        action: "UPGRADE_INTENT_ABANDONED",
        entityType: "SUBSCRIPTION_INTENT",
        entityId: intent.id,
        details: { reason, abandonedAt: new Date().toISOString() },
      },
    });

    return {
      success: true,
      message: "Intention d'upgrade abandonnée avec succès.",
      intent: updated,
    };
  });
}

/**
 * Générateur de preuve financière simulée exclusivement réservé aux tests unitaires/simulés.
 * Interdit formellement en production.
 */
export function buildSimulatedVerifiedFinancialProof({
  providerTransactionId,
  amountXaf,
  providerReference = null,
  paymentMethod = "MOBILE_MONEY",
  operatorReference = null,
  rawPayload = {},
}) {
  if (process.env.NODE_ENV === "production") {
    throw new Error("SECURITY_VIOLATION: Les preuves simulées sont formellement interdites en environnement de production.");
  }
  return {
    source: "TEST_SIMULATION",
    provider: "SASPAY",
    providerTransactionId,
    providerReference: providerReference || `REF_${Date.now()}`,
    amountXaf,
    currency: "XAF",
    paymentMethod,
    operatorReference,
    verifiedAt: new Date().toISOString(),
    rawPayload,
  };
}

/**
 * Validation du reçu financier et exécution atomique de l'upgrade et des réactivations.
 * RÈGLE ABSOLUE DE SÉCURITÉ (Phase D.1.3) :
 * - Fonction de service interne uniquement (JAMAIS directement appelée par le client).
 * - Exige une preuve financière authentifiée (financialProof) émise par une source certifiée.
 * - Rejette toute source arbitraire, toute devise invalide et tout montant non certifié.
 * - Transaction atomique PostgreSQL sous verrou pessimiste (SELECT ... FOR UPDATE).
 * - Validation stricte du montant officiel (priceXaf) face au catalogue.
 * - Rejet formel des intentions expirées (EXPIRED) ou abandonnées (ABANDONED).
 * - Idempotence stricte (zéro double application si reçu ou intention déjà complétés).
 * - Incrémentation monotone de version d'abonnement (sub.version + 1).
 * - Réactivation sélective des membres suspendus pour COMMERCIAL_DOWNGRADE.
 * - ZÉRO réactivation des membres suspendus manuellement (MANUAL_ADMIN).
 * - ZÉRO dépassement de quota du nouveau forfait.
 */
export async function confirmPaymentAndApplyUpgrade(actingUserId, {
  workspaceId,
  intentId,
  financialProof,
}, { tx: externalTx = null } = {}) {
  // 0. VÉRIFICATION STRICTE DE LA PREUVE FINANCIÈRE (SÉCURITÉ D.1.3)
  if (!financialProof || typeof financialProof !== "object") {
    const secErr = new Error("SECURITY_UNVERIFIED_PAYMENT_PROOF: Aucune preuve financière fournie. Impossible de confirmer l'upgrade.");
    secErr.statusCode = 403;
    secErr.code = "SECURITY_UNVERIFIED_PAYMENT_PROOF";
    throw secErr;
  }

  const {
    source,
    provider = "SASPAY",
    providerTransactionId,
    providerReference,
    amountXaf,
    currency = "XAF",
    paymentMethod = "MOBILE_MONEY",
    operatorReference,
    verifiedAt,
    rawPayload = {},
  } = financialProof;

  const ALLOWED_PRODUCTION_SOURCES = ["SASPAY_SECURE_WEBHOOK", "SERVER_VERIFIED_GATEWAY"];
  const isProd = process.env.NODE_ENV === "production";

  if (!ALLOWED_PRODUCTION_SOURCES.includes(source)) {
    if (source === "TEST_SIMULATION" && !isProd) {
      // Autorisé exclusivement dans les tests en environnement non-production
    } else {
      const secErr = new Error(`SECURITY_UNTRUSTED_FINANCIAL_SOURCE: La source '${source}' n'est pas une source financière de confiance autorisée.`);
      secErr.statusCode = 403;
      secErr.code = "SECURITY_UNTRUSTED_FINANCIAL_SOURCE";
      throw secErr;
    }
  }

  if (!providerTransactionId || typeof providerTransactionId !== "string" || !providerTransactionId.trim()) {
    const secErr = new Error("SECURITY_INVALID_PROOF: providerTransactionId manquant ou invalide.");
    secErr.statusCode = 400;
    throw secErr;
  }

  if (currency !== "XAF") {
    const secErr = new Error(`SECURITY_INVALID_CURRENCY: La devise '${currency}' est non conforme (XAF requis).`);
    secErr.statusCode = 400;
    throw secErr;
  }

  if (!amountXaf || typeof amountXaf !== "number" || amountXaf <= 0) {
    const secErr = new Error("SECURITY_INVALID_AMOUNT: Le montant de la preuve financière est invalide.");
    secErr.statusCode = 400;
    throw secErr;
  }

  const executeUpgrade = async (tx) => {
    // 1. Verrou pessimiste sur le workspace
    await tx.$queryRaw`SELECT id FROM "workspaces" WHERE id = ${workspaceId} FOR UPDATE`;

    // 2. Récupérer l'intention d'upgrade
    const intent = await tx.subscriptionIntent.findUnique({
      where: { id: intentId },
      include: { subscription: true, attempts: true },
    });

    if (!intent || intent.workspaceId !== workspaceId) {
      const err = new Error("Intention de souscription introuvable pour cet espace.");
      err.statusCode = 404;
      throw err;
    }

    // 3. Contrôle des statuts d'intention
    if (intent.status === "COMPLETED") {
      return {
        success: true,
        alreadyCompleted: true,
        message: "Cet upgrade a déjà été confirmé et appliqué précédemment.",
        subscription: intent.subscription,
      };
    }

    if (intent.status === "EXPIRED") {
      const err = new Error("SECURITY_EXPIRED_INTENT: Cette intention d'upgrade a expiré et ne peut plus être confirmée.");
      err.statusCode = 400;
      err.code = "EXPIRED_INTENT_PAID";
      throw err;
    }

    if (intent.status === "ABANDONED") {
      const err = new Error("SECURITY_ABANDONED_INTENT: Cette intention d'upgrade a été abandonnée et ne peut plus être confirmée.");
      err.statusCode = 400;
      err.code = "ABANDONED_INTENT_PAID";
      throw err;
    }

    if (intent.status !== "PENDING") {
      const err = new Error(`L'intention n'est plus en attente de paiement (statut: ${intent.status}).`);
      err.statusCode = 400;
      throw err;
    }

    // 4. Validation stricte du montant financier face au catalogue officiel
    const targetPlan = OFFICIAL_PLANS[intent.targetPlan];
    if (!targetPlan) {
      const err = new Error(`Formule cible inconnue: ${intent.targetPlan}`);
      err.statusCode = 400;
      throw err;
    }

    if (amountXaf !== targetPlan.priceXaf) {
      const err = new Error(`Montant du paiement non conforme. Attendu: ${targetPlan.priceXaf} FCFA, Reçu: ${amountXaf} FCFA.`);
      err.statusCode = 400;
      throw err;
    }

    // 5. Vérifier unicité du reçu de paiement
    const existingReceipt = await tx.providerPaymentReceipt.findUnique({
      where: {
        provider_providerTransactionId: {
          provider,
          providerTransactionId,
        },
      },
    });

    if (existingReceipt) {
      const err = new Error(`Une transaction avec l'identifiant ${providerTransactionId} a déjà été enregistrée.`);
      err.statusCode = 409;
      err.code = "DUPLICATE_PAYMENT_TRANSACTION";
      throw err;
    }

    // 6. Enregistrement du reçu de paiement validé
    const now = new Date();
    const receipt = await tx.providerPaymentReceipt.create({
      data: {
        provider,
        providerTransactionId,
        providerReference: providerReference || `REF_${Date.now()}`,
        amountXaf,
        currency,
        paidAt: verifiedAt ? new Date(verifiedAt) : now,
        paymentMethod,
        operatorReference,
        validationStatus: "VALID",
        reconciliationStatus: "MATCHED_AND_APPLIED",
        workspaceId,
        intentId: intent.id,
        attemptId: intent.attempts?.[0]?.id || null,
        rawPayload,
      },
    });

    // 7. Création de la transaction financière
    await tx.paymentTransaction.create({
      data: {
        receiptId: receipt.id,
        workspaceId,
        subscriptionId: intent.subscriptionId,
        intentId: intent.id,
        attemptId: intent.attempts?.[0]?.id || null,
        provider,
        providerTransactionId,
        amountXaf,
        currency,
        paymentMethod,
        operatorReference,
        status: "APPLIED_TO_SUBSCRIPTION",
        paidAt: verifiedAt ? new Date(verifiedAt) : now,
      },
    });

    // 8. Mise à jour de la tentative et de l'intention
    await tx.paymentAttempt.updateMany({
      where: { intentId: intent.id },
      data: { status: "PAYMENT_CONFIRMED" },
    });

    await tx.subscriptionIntent.update({
      where: { id: intent.id },
      data: { status: "COMPLETED" },
    });

    // 9. Mise à jour atomique de Subscription et incrémentation de version
    const currentSub = await tx.subscription.findUnique({
      where: { id: intent.subscriptionId },
    });

    const anchorDay = now.getUTCDate();
    const periodEnd = computeNextRenewalDate(now, anchorDay);
    const oldPlan = currentSub.plan;
    const newVersion = (currentSub.version || 1) + 1;

    const updatedSub = await tx.subscription.update({
      where: { id: intent.subscriptionId },
      data: {
        plan: intent.targetPlan,
        status: "ACTIVE",
        activePriceXaf: targetPlan.priceXaf,
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
        billingAnchorDay: anchorDay,
        version: newVersion,
      },
    });

    // 10. Audit historique de souscription
    await tx.subscriptionHistoryLog.create({
      data: {
        subscriptionId: updatedSub.id,
        workspaceId,
        actorUserId: actingUserId,
        fromPlan: oldPlan,
        toPlan: intent.targetPlan,
        reason: "UPGRADE_CONFIRMED_SASPAY",
        periodStart: now,
        periodEnd,
      },
    });

    // 11. Réactivation sélective des membres suspendus pour COMMERCIAL_DOWNGRADE
    const { reactivateCommercialSuspensions } = await import("./workspaceService.js");
    let reactivationResult = null;
    try {
      reactivationResult = await reactivateCommercialSuspensions(
        actingUserId,
        { workspaceId },
        tx // passe la transaction courante pour atomicité absolue
      );
    } catch (reactivationErr) {
      logger.warn(`[Commercial:Upgrade] Avertissement lors de la réactivation automatique: ${reactivationErr.message}`);
      // L'erreur dans la réactivation fait échouer l'ensemble de la transaction pour garantir l'atomicité
      throw reactivationErr;
    }

    return {
      success: true,
      upgraded: true,
      previousPlan: oldPlan,
      newPlan: intent.targetPlan,
      newVersion: updatedSub.version,
      subscription: updatedSub,
      receiptId: receipt.id,
      reactivation: reactivationResult,
      message: `Abonnement mis à niveau avec succès vers ${targetPlan.name} (v${updatedSub.version}).`,
    };
  };

  if (externalTx) {
    return await executeUpgrade(externalTx);
  }
  return await prisma.$transaction(executeUpgrade);
}

