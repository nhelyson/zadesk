import crypto from "crypto";
import { prisma } from "../lib/prisma.js";
import { ROLES } from "../config/constants.js";
import { cacheService } from "../cache/cacheService.js";
import { normalizeCompanyName, normalizeCountryName } from "../utils/validation.js";
import { dispatchInvitationEmailJob, NOTIFICATION_JOB_TYPES } from "../jobs/notificationJobs.js";
import { createOutboxEvent, dispatchOutboxEvents } from "../outbox/outboxDispatcher.js";
import { QUEUE_NAMES } from "../queues/queueManager.js";
import { logger } from "../utils/logger.js";
import { listEstablishments } from "./establishmentService.js";
import { getWorkspaceActivePlan, OFFICIAL_PLANS } from "./commercialService.js";

/**
 * Generate a clean URL slug from name
 */
export function generateSlug(name) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 50);
}

/**
 * List all workspaces for a given user with role
 */
export async function listUserWorkspaces(userId) {
  const cacheKey = `user:${userId}:workspaces`;

  return cacheService.wrap(
    cacheKey,
    async () => {
      let memberships = await prisma.membership.findMany({
        where: { userId },
        include: {
          workspace: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      // Return user workspaces with roles
      return memberships.map((m) => ({
        id: m.workspace.id,
        name: m.workspace.name,
        slug: m.workspace.slug,
        role: m.role,
        createdAt: m.workspace.createdAt,
      }));
    },
    60 // 1 minute TTL
  );
}

/**
 * Create a new workspace and assign user as OWNER
 */
export async function createWorkspaceForUser(userId, data = {}) {
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
  } = data;

  const baseName = (name || "Mon Entreprise SAV").trim();
  const normalizedName = normalizeCompanyName(baseName);
  const finalCountry = normalizeCountryName(country);

  // Requirement: Ensure user does not already own an active workspace
  const existingOwnership = await prisma.membership.findFirst({
    where: {
      userId,
      role: ROLES.OWNER,
    },
    include: {
      workspace: true,
    },
  });

  if (existingOwnership) {
    const error = new Error(
      `Vous possédez déjà un espace actif (« ${existingOwnership.workspace.name} »). La création d'un second espace n'est pas autorisée.`
    );
    error.statusCode = 403;
    error.code = "WORKSPACE_ALREADY_EXISTS";
    throw error;
  }

  // Strict Uniqueness Check on (normalizedName, country)
  const nameCollision = await prisma.workspace.findFirst({
    where: {
      normalizedName,
      country: {
        equals: finalCountry,
        mode: "insensitive",
      },
    },
  });

  if (nameCollision) {
    const error = new Error(
      `Une entreprise nommée « ${nameCollision.name} » est déjà enregistrée pour ce pays (${finalCountry}). Veuillez choisir un nom distinct.`
    );
    error.statusCode = 409;
    error.code = "NAME_ALREADY_TAKEN";
    throw error;
  }

  let finalSlug = slug ? generateSlug(slug) : generateSlug(baseName);
  if (!finalSlug || finalSlug.trim().length === 0) {
    finalSlug = `sav-${Date.now().toString(36)}`;
  }

  // Check slug collision
  let existing = await prisma.workspace.findUnique({ where: { slug: finalSlug } });
  let count = 1;
  const originalSlug = finalSlug;
  while (existing) {
    finalSlug = `${originalSlug}-${count++}`;
    existing = await prisma.workspace.findUnique({ where: { slug: finalSlug } });
  }

  const result = await prisma.$transaction(async (tx) => {
    // 1. Lock the user row to serialize concurrent workspace creation for this user
    await tx.$queryRaw`SELECT id FROM "users" WHERE id = ${userId} FOR UPDATE`;

    // 2. Re-verify existing ownership inside transaction
    const doubleCheck = await tx.membership.findFirst({
      where: {
        userId,
        role: ROLES.OWNER,
      },
    });

    if (doubleCheck) {
      const error = new Error(
        "Vous possédez déjà un espace actif. La création simultanée d'un second espace n'est pas autorisée."
      );
      error.statusCode = 403;
      error.code = "WORKSPACE_ALREADY_EXISTS";
      throw error;
    }

    const workspace = await tx.workspace.create({
      data: {
        name: baseName,
        normalizedName,
        slug: finalSlug,
        hasExistingSav: Boolean(hasExistingSav),
        category: category || "Commerce et boutique",
        description: description || null,
        logoUrl: logoUrl || null,
        coverUrl: coverUrl || null,
        website: website || null,
        supportPhone: supportPhone || null,
        supportEmail: supportEmail || null,
        supportWhatsApp: supportWhatsApp || null,
        address: address || null,
        city: city || "Brazzaville",
        country: finalCountry,
        openingHours: openingHours || null,
        supportCategories: supportCategories
          ? (typeof supportCategories === "string" ? JSON.parse(supportCategories) : supportCategories)
          : ["Information", "Commande", "Réclamation", "Autre demande"],
        verified: true,
        isPublic: true,
      },
    });

    const membership = await tx.membership.create({
      data: {
        userId,
        workspaceId: workspace.id,
        role: ROLES.OWNER,
      },
    });

    // Create default AgentProfile for the creator (no simulated availability, standard capacity)
    await tx.agentProfile.upsert({
      where: {
        workspaceId_userId: {
          workspaceId: workspace.id,
          userId,
        },
      },
      update: {},
      create: {
        userId,
        workspaceId: workspace.id,
        availability: "OFFLINE",
        maxCapacity: 10,
        title: "Responsable",
      },
    });

    // Extract any selected commercial plan from creation payload or draft
    const existingDraft = await tx.onboardingDraft.findUnique({
      where: { userId },
    });
    const draftPlan = (data.selectedPlan || existingDraft?.data?.selectedPlan || "DECOUVERTE").toString().toUpperCase();

    // Invite initial agents if supplied (enforcing commercial limits at creation)
    if (Array.isArray(initialAgents) && initialAgents.length > 0) {
      const maxExtraAllowed = draftPlan === "STARTER" ? 1 : draftPlan === "PRO" ? 4 : draftPlan === "ENTREPRISE" ? 998 : 0;
      if (initialAgents.length > maxExtraAllowed) {
        const err = new Error(
          `La formule ${draftPlan || "DECOUVERTE"} ne permet pas d'inviter ${initialAgents.length} collaborateur(s) initialement (limite : ${maxExtraAllowed} invitation(s)).`
        );
        err.status = 403;
        err.code = "PLAN_LIMIT_EXCEEDED";
        throw err;
      }

      for (const agent of initialAgents) {
        if (agent.email && agent.email.trim()) {
          const invToken = crypto.randomBytes(32).toString("hex");
          const invExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
          await tx.workspaceInvitation.create({
            data: {
              workspaceId: workspace.id,
              invitedById: userId,
              email: agent.email.toLowerCase().trim(),
              role: (agent.role || ROLES.AGENT).toUpperCase(),
              token: invToken,
              expiresAt: invExpires,
            },
          });
        }
      }
    }

    // Persist commercial intent in OnboardingDraft store (compatible with current unmigrated PostgreSQL)
    if (draftPlan && draftPlan !== "DECOUVERTE") {
      const priceXaf = OFFICIAL_PLANS[draftPlan]?.priceXaf || 0;
      const currentDraftData = (existingDraft?.data && typeof existingDraft.data === "object")
        ? existingDraft.data
        : {};

      await tx.onboardingDraft.upsert({
        where: { userId },
        update: {
          step: 4, // Step 4 = Commercial Recap
          data: {
            ...currentDraftData,
            workspaceId: workspace.id,
            workspaceName: workspace.name,
            workspaceSlug: workspace.slug,
            selectedPlan: draftPlan,
            status: "WORKSPACE_CREATED",
            commercialIntent: {
              planId: draftPlan,
              workspaceId: workspace.id,
              workspaceName: workspace.name,
              priceXaf,
              currency: "XAF",
              status: "PENDING",
              createdAt: new Date().toISOString(),
            },
          },
        },
        create: {
          userId,
          step: 4,
          data: {
            workspaceId: workspace.id,
            workspaceName: workspace.name,
            workspaceSlug: workspace.slug,
            selectedPlan: draftPlan,
            status: "WORKSPACE_CREATED",
            commercialIntent: {
              planId: draftPlan,
              workspaceId: workspace.id,
              workspaceName: workspace.name,
              priceXaf,
              currency: "XAF",
              status: "PENDING",
              createdAt: new Date().toISOString(),
            },
          },
        },
      });
    } else {
      // Découverte plan: onboarding is completely finished, remove temporary draft
      await tx.onboardingDraft.deleteMany({
        where: { userId },
      });
    }

    return { workspace, membership };
  });

  // Invalidate user workspaces cache & public directory cache
  await cacheService.del(`user:${userId}:workspaces`);
  await cacheService.delByPrefix("public:companies:*");
  await cacheService.del("public:companies:categories");
  await cacheService.del("public:companies:popular");

  return result;
}

/**
 * Update an existing workspace
 */
export async function updateWorkspace(workspaceId, userId, updateData) {
  // Check authorization (OWNER or ADMIN)
  const membership = await prisma.membership.findFirst({
    where: {
      userId,
      workspaceId,
      role: { in: [ROLES.OWNER, ROLES.ADMIN] },
    },
  });

  if (!membership) {
    throw new Error("Vous n'avez pas les droits nécessaires pour modifier cet espace de travail.");
  }

  const {
    name,
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
    isPublic,
    brandColor,
    brandPalette,
    cannedResponses,
    businessHours,
  } = updateData;

  const dataToUpdate = {};
  if (name !== undefined) {
    dataToUpdate.name = name.trim();
    dataToUpdate.normalizedName = name.trim().toLowerCase();
  }
  if (category !== undefined) dataToUpdate.category = category;
  if (description !== undefined) dataToUpdate.description = description;
  if (logoUrl !== undefined) dataToUpdate.logoUrl = logoUrl;
  if (coverUrl !== undefined) dataToUpdate.coverUrl = coverUrl;
  if (website !== undefined) dataToUpdate.website = website;
  if (supportPhone !== undefined) dataToUpdate.supportPhone = supportPhone;
  if (supportEmail !== undefined) dataToUpdate.supportEmail = supportEmail;
  if (supportWhatsApp !== undefined) dataToUpdate.supportWhatsApp = supportWhatsApp;
  if (address !== undefined) dataToUpdate.address = address;
  if (city !== undefined) dataToUpdate.city = city;
  if (country !== undefined) dataToUpdate.country = country;
  if (openingHours !== undefined) dataToUpdate.openingHours = openingHours;
  if (isPublic !== undefined) dataToUpdate.isPublic = isPublic;
  if (brandColor !== undefined) dataToUpdate.brandColor = brandColor;
  if (brandPalette !== undefined) dataToUpdate.brandPalette = brandPalette;
  if (cannedResponses !== undefined) dataToUpdate.cannedResponses = cannedResponses;
  if (businessHours !== undefined) dataToUpdate.businessHours = businessHours;
  if (supportCategories !== undefined) {
    dataToUpdate.supportCategories = typeof supportCategories === "string"
      ? JSON.parse(supportCategories)
      : supportCategories;
  }

  // Get current workspace slug before update to ensure old cache keys are invalidated if slug changes
  const existing = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: { slug: true },
  });

  const updated = await prisma.workspace.update({
    where: { id: workspaceId },
    data: dataToUpdate,
  });

  // Invalidate caches with strictly normalized keys matching public query routes
  await cacheService.del(`workspace:${workspaceId}`);
  if (existing?.slug && existing.slug.toLowerCase().trim() !== updated.slug.toLowerCase().trim()) {
    const oldSlugNorm = existing.slug.toLowerCase().trim();
    await cacheService.del(`workspace:${existing.slug}`);
    await cacheService.del(`workspace:${oldSlugNorm}`);
    await cacheService.del(`public:company:${oldSlugNorm}`);
  }
  const currentSlugNorm = updated.slug.toLowerCase().trim();
  await cacheService.del(`workspace:${updated.slug}`);
  await cacheService.del(`workspace:${currentSlugNorm}`);
  await cacheService.del(`public:company:${currentSlugNorm}`);
  await cacheService.delByPrefix("public:companies:*");
  await cacheService.del("public:companies:popular");
  await cacheService.del("public:companies:categories");

  return updated;
}

/**
 * Get workspace details by ID or Slug
 */
export async function getWorkspaceById(workspaceId) {
  const cacheKey = `workspace:${workspaceId}`;

  return cacheService.wrap(
    cacheKey,
    async () => {
      const workspace = await prisma.workspace.findFirst({
        where: {
          OR: [{ id: workspaceId }, { slug: workspaceId }],
        },
        include: {
          memberships: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                  avatarUrl: true,
                },
              },
            },
          },
        },
      });

      return workspace;
    },
    900 // 15 minutes TTL
  );
}

/**
 * Standard cache key for live SAV Operational Dashboard statistics
 */
export const getDashboardStatsCacheKey = (workspaceId) => `workspace:${workspaceId}:dashboard`;

/**
 * Get live SAV Operational Dashboard statistics
 */
export async function getWorkspaceDashboardStats(workspaceId) {
  const cacheKey = getDashboardStatsCacheKey(workspaceId);

  return cacheService.wrap(
    cacheKey,
    async () => {
      // Real database aggregates from PostgreSQL
      const [
        activeConversationsCount,
        waitingAgentCount,
        openTicketsCount,
        totalTicketsCount,
        realConversations,
        recentTickets,
      ] = await Promise.all([
        prisma.conversation.count({
          where: { workspaceId, status: "ACTIVE" },
        }),
        prisma.conversation.count({
          where: { workspaceId, status: "ACTIVE", assignedAgentId: null },
        }),
        prisma.ticket.count({
          where: {
            workspaceId,
            status: { in: ["OPEN", "IN_PROGRESS", "WAITING_CUSTOMER"] },
          },
        }),
        prisma.ticket.count({
          where: { workspaceId },
        }),
        prisma.conversation.findMany({
          where: { workspaceId, status: "ACTIVE" },
          orderBy: [{ priority: "desc" }, { lastMessageAt: "desc" }],
          take: 5,
          include: {
            messages: {
              take: 1,
              orderBy: { createdAt: "desc" },
              select: { content: true, createdAt: true },
            },
          },
        }),
        prisma.ticket.findMany({
          where: { workspaceId },
          orderBy: { createdAt: "desc" },
          take: 5,
          select: {
            id: true,
            reference: true,
            title: true,
            status: true,
            category: true,
            createdAt: true,
          },
        }),
      ]);

      const priorityQueue = realConversations.map((c) => ({
        id: c.id,
        customerName: c.customerName || "Visiteur web",
        phone: c.customerPhone || null,
        channel: c.channel || "PORTAL",
        lastMessage: c.messages[0]?.content || "Conversation initiée",
        category: c.category || "Général",
        urgency: c.priority || "MEDIUM",
        status: c.assignedAgentId ? "ASSIGNED" : "WAITING_AGENT",
        timeAgo: c.lastMessageAt ? new Date(c.lastMessageAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }) : "Récemment",
        unreadCount: 0,
      }));

      const recentActivity = recentTickets.map((t) => ({
        id: `act-${t.id}`,
        type: "TICKET_EVENT",
        title: `Ticket ${t.reference} : ${t.title}`,
        description: `Catégorie : ${t.category || "Général"} • Statut : ${t.status}`,
        timestamp: new Date(t.createdAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
      }));

      return {
        overview: {
          activeConversations: activeConversationsCount,
          waitingAgent: waitingAgentCount,
          openTickets: openTicketsCount,
          totalTickets: totalTicketsCount,
          aiResolutionRate: null, // Moteur IA en préparation (non simulé)
          avgResolutionTimeMinutes: null, // Données insuffisantes pour un calcul de durée moyen
          customerSatisfactionScore: null, // Enquête CSAT en préparation
        },
        priorityQueue,
        recentActivity,
        volumeTrend: [], // Tendance horaire dynamique (vide sans historique suffisant)
      };
    },
    60 // 60s TTL for live dashboard
  );
}

/**
 * Get Workspace Conversations (Inbox)
 */
export async function getWorkspaceConversations(workspaceId) {
  const cacheKey = `workspace:${workspaceId}:conversations`;

  return cacheService.wrap(
    cacheKey,
    async () => {
      const conversations = await prisma.conversation.findMany({
        where: { workspaceId },
        orderBy: [{ lastMessageAt: "desc" }],
        include: {
          messages: {
            orderBy: { createdAt: "asc" },
            take: 20,
          },
          assignedAgent: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
        },
      });

      return conversations.map((c) => {
        const lastMsg = c.messages[c.messages.length - 1];
        const assignedName = c.assignedAgent
          ? [c.assignedAgent.firstName, c.assignedAgent.lastName].filter(Boolean).join(" ") || c.assignedAgent.email
          : "Non assigné";

        return {
          id: c.id,
          customerName: c.customerName || "Visiteur web",
          phone: c.customerPhone || null,
          avatar: (c.customerName || "V")[0].toUpperCase(),
          channel: c.channel || "PORTAL",
          lastMessage: lastMsg?.content || "Conversation initiée",
          lastMessageTime: lastMsg ? new Date(lastMsg.createdAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }) : "",
          status: c.status,
          priority: c.priority,
          assignedAgent: assignedName,
          unread: 0,
          category: c.category || "Général",
          messages: c.messages.map((m) => ({
            id: m.id,
            sender: m.senderType === "CUSTOMER" ? "customer" : "agent",
            text: m.content,
            time: new Date(m.createdAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
          })),
        };
      });
    },
    60
  );
}

/**
 * Get Workspace Continuous Tickets
 */
export async function getWorkspaceTickets(workspaceId) {
  const cacheKey = `workspace:${workspaceId}:tickets`;

  return cacheService.wrap(
    cacheKey,
    async () => {
      const tickets = await prisma.ticket.findMany({
        where: { workspaceId },
        orderBy: { createdAt: "desc" },
        include: {
          assignedAgent: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
          activities: {
            orderBy: { createdAt: "desc" },
            take: 5,
          },
        },
      });

      return tickets.map((t) => {
        const agentName = t.assignedAgent
          ? [t.assignedAgent.firstName, t.assignedAgent.lastName].filter(Boolean).join(" ") || t.assignedAgent.email
          : "Non assigné";

        return {
          id: t.reference,
          ticketId: t.id,
          customerName: t.customerName,
          customerPhone: t.customerPhone,
          subject: t.title,
          category: t.category || "Général",
          priority: t.priority,
          status: t.status,
          assignedAgent: agentName,
          aiSummary: t.description,
          createdAt: new Date(t.createdAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" }),
          updatedAt: new Date(t.updatedAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" }),
          history: t.activities.map((a) => ({
            date: new Date(a.createdAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" }),
            author: "Système",
            text: a.description || a.action,
          })),
        };
      });
    },
    60
  );
}

/**
 * Get Workspace Customers Directory
 */
export async function getWorkspaceCustomers(workspaceId) {
  const cacheKey = `workspace:${workspaceId}:customers`;

  return cacheService.wrap(
    cacheKey,
    async () => {
      // Aggregate real customer interactions from conversations and tickets
      const conversations = await prisma.conversation.findMany({
        where: { workspaceId },
        select: {
          id: true,
          customerName: true,
          customerPhone: true,
          customerEmail: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { updatedAt: "desc" },
      });

      const customerMap = new Map();

      for (const c of conversations) {
        const key = c.customerPhone || c.customerEmail || c.customerName;
        if (!key) continue;

        if (!customerMap.has(key)) {
          customerMap.set(key, {
            id: `cust-${c.id}`,
            name: c.customerName || "Visiteur web",
            phone: c.customerPhone || null,
            email: c.customerEmail || null,
            conversationsCount: 1,
            ticketsCount: 0,
            lastInteraction: new Date(c.updatedAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" }),
            status: "ACTIVE",
            tags: ["Web"],
          });
        } else {
          const existing = customerMap.get(key);
          existing.conversationsCount++;
        }
      }

      return Array.from(customerMap.values());
    },
    120
  );
}

/**
 * Get Workspace Agents (Real dynamic team members, profiles & skills)
 */
export async function getWorkspaceAgents(workspaceId) {
  const cacheKey = `workspace:${workspaceId}:agents`;

  return cacheService.wrap(
    cacheKey,
    async () => {
      // 1. Query all members of this workspace
      const members = await prisma.membership.findMany({
        where: { workspaceId },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              avatarUrl: true,
            },
          },
        },
        orderBy: { createdAt: "asc" },
      });

      if (!members || members.length === 0) {
        return [];
      }

      const userIds = members.map((m) => m.userId);

      // 2. Query agent profiles with validated skills
      const profiles = await prisma.agentProfile.findMany({
        where: {
          workspaceId,
          userId: { in: userIds },
        },
        include: {
          skills: {
            include: {
              skill: true,
            },
          },
        },
      });

      // 3. Compute real-time active tickets and resolved today
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      const [activeTicketsByAgent, resolvedTodayByAgent] = await Promise.all([
        prisma.ticket.groupBy({
          by: ["assignedAgentId"],
          where: {
            workspaceId,
            assignedAgentId: { in: userIds },
            status: { in: ["OPEN", "IN_PROGRESS", "WAITING_CUSTOMER"] },
          },
          _count: { id: true },
        }),
        prisma.ticket.groupBy({
          by: ["assignedAgentId"],
          where: {
            workspaceId,
            assignedAgentId: { in: userIds },
            status: { in: ["RESOLVED", "CLOSED"] },
            updatedAt: { gte: startOfDay },
          },
          _count: { id: true },
        }),
      ]);

      const activeMap = new Map(activeTicketsByAgent.map((t) => [t.assignedAgentId, t._count.id]));
      const resolvedMap = new Map(resolvedTodayByAgent.map((t) => [t.assignedAgentId, t._count.id]));

      // 4. Map and auto-create missing profiles
      const agents = await Promise.all(
        members.map(async (m) => {
          let profile = profiles.find((p) => p.userId === m.userId);
          if (!profile) {
            profile = await prisma.agentProfile.upsert({
              where: { workspaceId_userId: { workspaceId, userId: m.userId } },
              create: {
                workspaceId,
                userId: m.userId,
                availability: "AVAILABLE",
                maxCapacity: 10,
                autoAssignmentEnabled: true,
                title: m.role === "MANAGER" ? "Superviseur SAV" : m.role === "ADMIN" || m.role === "OWNER" ? "Responsable SAV" : "Conseiller SAV",
              },
              update: {},
              include: {
                skills: {
                  include: { skill: true },
                },
              },
            });
          }

          const activeChats = activeMap.get(m.userId) || 0;
          const resolvedToday = resolvedMap.get(m.userId) || 0;
          const skills = (profile.skills || []).map((s) => s.skill.name);

          return {
            id: m.user.id,
            profileId: profile.id,
            name: `${m.user.firstName || ''} ${m.user.lastName || ''}`.trim() || m.user.email.split('@')[0],
            email: m.user.email,
            avatarUrl: m.user.avatarUrl,
            phone: profile.phone || '',
            title: profile.title || 'Conseiller SAV',
            role: m.role,
            status: profile.availability || 'AVAILABLE', // AVAILABLE, BUSY, AWAY, OFFLINE
            maxCapacity: profile.maxCapacity || 10,
            autoAssignmentEnabled: profile.autoAssignmentEnabled !== false,
            specialties: skills.length > 0 ? skills : ['Support Général'],
            skills: (profile.skills || []).map((s) => ({
              id: s.skill.id,
              name: s.skill.name,
              description: s.skill.description,
              validatedAt: s.validatedAt,
            })),
            activeChats,
            resolvedToday,
            rating: 5.0,
            joinedAt: m.joinedAt,
          };
        })
      );

      return agents;
    },
    15 // Cache for 15 seconds to remain fresh
  );
}

/**
 * Get Workspace Physical Agencies / Establishments (Backward-compatible wrapper)
 */
export async function getWorkspaceAgencies(workspaceId) {
  return listEstablishments(workspaceId);
}

/**
 * Get AI Autonomy & Escalation Configuration
 */
export async function getWorkspaceAiConfig(workspaceId) {
  const cacheKey = `workspace:${workspaceId}:ai-config`;

  return cacheService.wrap(
    cacheKey,
    async () => {
      return {
        autonomyMode: "SEMI_AUTONOMOUS", // ASSISTED, SEMI_AUTONOMOUS, FULL_AUTONOMOUS
        language: "fr",
        tone: "PROFESSIONAL_EMPATHETIC",
        knowledgeBaseSources: ["FAQ Produits", "Politiques Retours", "Mobile Money", "Horaires Agences"],
        escalationTriggers: {
          frustrationKeywords: true,
          claimAmountThreshold: 50000, // XAF
          unresolvedAfterMessages: 4,
          explicitAgentRequest: true,
        },
        stats: {
          totalHandledThisMonth: 1248,
          resolvedWithoutHuman: 978,
          accuracyRate: 98.2,
        },
      };
    },
    600
  );
}

/**
 * Get Workspace Knowledge Base
 */
export async function getWorkspaceKnowledge(workspaceId) {
  const cacheKey = `workspace:${workspaceId}:knowledge`;

  return cacheService.wrap(
    cacheKey,
    async () => {
      return [
        {
          id: "kb-1",
          category: "Produits & Matériel",
          title: "Procédure d'échange standard sous garantie 14 jours",
          summary: "Guide pour tester et remplacer un terminal défectueux en agence physique sans frais client.",
          updatedAt: "Il y a 2 jours",
          status: "INDEXED", // INDEXED, DRAFT, OUTDATED
          readsCount: 420,
        },
        {
          id: "kb-2",
          category: "Paiements & Mobile Money",
          title: "Vérification des transactions MTN et Airtel Money",
          summary: "Format des identifiants de transaction, délais de compensation et réclamations bancaires.",
          updatedAt: "Il y a 5 jours",
          status: "INDEXED",
          readsCount: 685,
        },
        {
          id: "kb-3",
          category: "Agences & Horaires",
          title: "Coordonnées et adresses des points relais au Congo",
          summary: "Liste complète des adresses à Brazzaville et Pointe-Noire avec numéros directs des responsables.",
          updatedAt: "01 Sept. 2026",
          status: "INDEXED",
          readsCount: 1120,
        },
        {
          id: "kb-4",
          category: "FAQ Générale",
          title: "Comment suivre l'avancement d'un dossier de SAV ?",
          summary: "Instructions simples données aux clients pour consulter l'état de leur ticket par WhatsApp.",
          updatedAt: "28 Août 2026",
          status: "INDEXED",
          readsCount: 310,
        },
      ];
    },
    600
  );
}


/**
 * Get Workspace Business Analytics
 */
export async function getWorkspaceAnalytics(workspaceId) {
  const cacheKey = `workspace:${workspaceId}:analytics`;

  return cacheService.wrap(
    cacheKey,
    async () => {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

      // 1. Real queries on actual conversations, tickets, and team members
      const [
        totalRequests,
        escalatedTickets,
        resolvedTickets,
        categoryGroups,
        activeMembers,
      ] = await Promise.all([
        prisma.conversation.count({
          where: { workspaceId, createdAt: { gte: thirtyDaysAgo } },
        }),
        prisma.ticket.count({
          where: { workspaceId, createdAt: { gte: thirtyDaysAgo } },
        }),
        prisma.ticket.count({
          where: { workspaceId, status: "RESOLVED", createdAt: { gte: thirtyDaysAgo } },
        }),
        prisma.ticket.groupBy({
          by: ["category"],
          where: {
            workspaceId,
            createdAt: { gte: thirtyDaysAgo },
            category: { not: null },
          },
          _count: { id: true },
        }),
        prisma.membership.findMany({
          where: { workspaceId },
          include: {
            user: {
              select: { id: true, firstName: true, lastName: true, email: true },
            },
          },
        }),
      ]);

      const totalCategorized = categoryGroups.reduce((acc, g) => acc + g._count.id, 0);
      const topIssues = categoryGroups.map((g) => ({
        category: g.category,
        count: g._count.id,
        percentage: totalCategorized > 0 ? Math.round((g._count.id / totalCategorized) * 100) : 0,
      }));

      // Agent performance computed from real assignments
      const agentPerformance = await Promise.all(
        activeMembers.map(async (m) => {
          const handled = await prisma.ticket.count({
            where: {
              workspaceId,
              assignedAgentId: m.userId,
              createdAt: { gte: thirtyDaysAgo },
            },
          });
          const resolved = await prisma.ticket.count({
            where: {
              workspaceId,
              assignedAgentId: m.userId,
              status: "RESOLVED",
              createdAt: { gte: thirtyDaysAgo },
            },
          });
          const name = [m.user?.firstName, m.user?.lastName].filter(Boolean).join(" ") || m.user?.email || "Agent";
          return {
            agentId: m.userId,
            name,
            role: m.role,
            handled,
            resolved,
            avgTime: null, // Données de temps moyen indisponibles sans volume d'escalade
            satisfaction: null, // Sondages CSAT en cours de développement
          };
        })
      );

      return {
        period: "Derniers 30 jours",
        kpis: [
          { label: "Total Demandes", value: String(totalRequests), change: null },
          { label: "Résolues par IA", value: "0 (En préparation)", change: null },
          { label: "Tickets Créés", value: String(escalatedTickets), change: null },
          { label: "Tickets Résolus", value: String(resolvedTickets), change: null },
        ],
        topIssues,
        agentPerformance,
      };
    },
    300
  );
}

/**
 * Create a team invitation for a workspace
 */
export async function createWorkspaceInvitation(workspaceId, invitedById, { email, role = ROLES.AGENT }) {
  if (!email || !email.trim()) {
    const err = new Error("L'adresse e-mail est obligatoire.");
    err.status = 400;
    throw err;
  }

  const normalizedEmail = email.toLowerCase().trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(normalizedEmail)) {
    const err = new Error("L'adresse e-mail saisie n'est pas valide.");
    err.status = 400;
    throw err;
  }

  const normalizedRole = (role || "AGENT").toUpperCase();
  const allowedRoles = [ROLES.ADMIN, ROLES.MANAGER, ROLES.AGENT];
  if (!allowedRoles.includes(normalizedRole)) {
    const err = new Error("Rôle d'invitation non autorisé.");
    err.status = 400;
    throw err;
  }

  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  const invitation = await prisma.$transaction(async (tx) => {
    // 1. Uniform lock order: Lock workspace row FIRST
    await tx.$queryRaw`SELECT id FROM "workspaces" WHERE id = ${workspaceId} FOR UPDATE`;

    // 2. Verify if user is already an active member of this workspace
    const existingMember = await tx.membership.findFirst({
      where: {
        workspaceId,
        user: { email: normalizedEmail },
      },
    });

    if (existingMember) {
      const err = new Error("Cet utilisateur est déjà membre de cet espace de travail.");
      err.status = 400;
      throw err;
    }

    // 3. Handle duplicate pending invitations cleanly inside transaction
    const existingPending = await tx.workspaceInvitation.findFirst({
      where: {
        workspaceId,
        email: normalizedEmail,
        acceptedAt: null,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
    });

    // 4. Verify workspace active plan limits on agents / seats atomically inside transaction
    const activePlan = await getWorkspaceActivePlan(workspaceId);
    const currentMembersCount = await tx.membership.count({
      where: {
        workspaceId,
        status: "ACTIVE",
      },
    });
    const pendingInvitesCount = await tx.workspaceInvitation.count({
      where: {
        workspaceId,
        acceptedAt: null,
        revokedAt: null,
        expiresAt: { gt: new Date() },
        ...(existingPending ? { id: { not: existingPending.id } } : {}),
      },
    });

    if (currentMembersCount + pendingInvitesCount >= activePlan.maxAgents) {
      const err = new Error(
        `La formule ${activePlan.name} est limitée à ${activePlan.maxAgents} collaborateur(s) au total (${currentMembersCount} actif(s), ${pendingInvitesCount} invitation(s) en attente). Veuillez faire évoluer votre formule vers un forfait supérieur pour ajouter des agents.`
      );
      err.status = 403;
      err.code = "PLAN_LIMIT_EXCEEDED";
      err.details = {
        currentPlan: activePlan.id,
        maxAgents: activePlan.maxAgents,
        currentMembersCount,
        pendingInvitesCount,
      };
      throw err;
    }

    let inv;
    if (existingPending) {
      // Refresh token, update role/expiration and dispatch email via Zavu
      inv = await tx.workspaceInvitation.update({
        where: { id: existingPending.id },
        data: {
          role: normalizedRole,
          token,
          expiresAt,
          invitedById,
          dispatchStatus: "PENDING",
        },
        include: {
          workspace: {
            select: { id: true, name: true, slug: true },
          },
          invitedBy: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
        },
      });
    } else {
      inv = await tx.workspaceInvitation.create({
        data: {
          workspaceId,
          invitedById,
          email: normalizedEmail,
          role: normalizedRole,
          token,
          expiresAt,
          dispatchStatus: "PENDING",
        },
        include: {
          workspace: {
            select: { id: true, name: true, slug: true },
          },
          invitedBy: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
        },
      });
    }

    const deterministicJobId = `invite-email-${inv.id}-${Date.now()}`;
    await createOutboxEvent(tx, {
      workspaceId,
      eventType: "INVITATION_CREATED",
      queueName: QUEUE_NAMES.NOTIFICATIONS,
      jobName: NOTIFICATION_JOB_TYPES.INVITATION_EMAIL,
      payload: {
        workspaceId,
        invitationId: inv.id,
        email: inv.email,
        role: inv.role,
        invitedById,
      },
      jobId: deterministicJobId,
    });

    return inv;
  });

  // Asynchronously dispatch invitation through Outbox
  dispatchOutboxEvents().catch((e) => logger.warn(`[OutboxDispatcher] Déclenchement automatique différé: ${e.message}`));

  return invitation;
}

/**
 * Get invitation details by secure token
 */
export async function getInvitationByToken(token) {
  if (!token || typeof token !== "string") {
    const err = new Error("Jeton d'invitation manquant ou invalide.");
    err.status = 400;
    throw err;
  }

  const invitation = await prisma.workspaceInvitation.findUnique({
    where: { token },
    include: {
      workspace: {
        select: { id: true, name: true, slug: true, logoUrl: true },
      },
      invitedBy: {
        select: { id: true, firstName: true, lastName: true },
      },
    },
  });

  if (!invitation) {
    const err = new Error("Invitation introuvable ou lien expiré.");
    err.status = 404;
    throw err;
  }

  if (invitation.revokedAt) {
    const err = new Error("Cette invitation a été révoquée par l'administrateur.");
    err.status = 410;
    throw err;
  }

  if (invitation.acceptedAt) {
    const err = new Error("Cette invitation a déjà été acceptée.");
    err.status = 409;
    throw err;
  }

  if (new Date() > new Date(invitation.expiresAt)) {
    const err = new Error("Cette invitation a expiré.");
    err.status = 410;
    throw err;
  }

  return invitation;
}

/**
 * Accept an invitation and link user to workspace membership
 */
export async function acceptWorkspaceInvitation(token, userId) {
  const invitation = await getInvitationByToken(token);

  // 1. Fetch authenticated user and verify email matching strictly
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, firstName: true, lastName: true },
  });

  if (!user) {
    const err = new Error("Utilisateur authentifié introuvable.");
    err.status = 401;
    throw err;
  }

  if (user.email.toLowerCase().trim() !== invitation.email.toLowerCase().trim()) {
    const err = new Error(
      `Cette invitation est réservée à l'adresse e-mail ${invitation.email}. Vous êtes actuellement connecté avec ${user.email}.`
    );
    err.status = 403;
    throw err;
  }

  // 2. Perform atomic transaction to avoid race conditions or duplicate joins
  const result = await prisma.$transaction(async (tx) => {
    // Uniform lock order: Lock workspace row FIRST to eliminate race conditions
    await tx.$queryRaw`SELECT id FROM "workspaces" WHERE id = ${invitation.workspaceId} FOR UPDATE`;

    // Re-lock / re-fetch invitation inside transaction
    const inv = await tx.workspaceInvitation.findUnique({
      where: { id: invitation.id },
    });

    if (!inv || inv.acceptedAt || inv.revokedAt || new Date() > new Date(inv.expiresAt)) {
      const err = new Error("L'invitation n'est plus valide ou a déjà été acceptée/révoquée.");
      err.status = 400;
      throw err;
    }

    // Check if membership already exists
    let membership = await tx.membership.findUnique({
      where: {
        userId_workspaceId: {
          userId,
          workspaceId: inv.workspaceId,
        },
      },
    });

    if (!membership) {
      // Re-verify seat quota inside atomic transaction to prevent concurrent overages
      const activePlan = await getWorkspaceActivePlan(inv.workspaceId);
      const activeMembersCount = await tx.membership.count({
        where: {
          workspaceId: inv.workspaceId,
          status: "ACTIVE",
        },
      });

      if (activeMembersCount >= activePlan.maxAgents) {
        const err = new Error(
          `L'espace de travail a atteint son quota maximum de ${activePlan.maxAgents} collaborateur(s) autorisé(s) par sa formule ${activePlan.name}. L'administrateur doit faire évoluer le forfait pour valider de nouveaux accès.`
        );
        err.status = 403;
        err.code = "PLAN_LIMIT_EXCEEDED";
        err.details = {
          currentPlan: activePlan.id,
          maxAgents: activePlan.maxAgents,
          activeMembersCount,
        };
        throw err;
      }

      membership = await tx.membership.create({
        data: {
          userId,
          workspaceId: inv.workspaceId,
          role: inv.role,
        },
      });
    }

    // Mark invitation as accepted
    await tx.workspaceInvitation.update({
      where: { id: inv.id },
      data: { acceptedAt: new Date() },
    });

    // If role is SAV-related, ensure AgentProfile is initialized
    if (["AGENT", "MANAGER", "ADMIN"].includes(inv.role)) {
      await tx.agentProfile.upsert({
        where: {
          workspaceId_userId: {
            workspaceId: inv.workspaceId,
            userId,
          },
        },
        create: {
          workspaceId: inv.workspaceId,
          userId,
          availability: "AVAILABLE",
          maxCapacity: 10,
          autoAssignmentEnabled: true,
          title:
            inv.role === "MANAGER"
              ? "Superviseur SAV"
              : inv.role === "ADMIN"
              ? "Responsable SAV"
              : "Conseiller SAV",
        },
        update: {},
      });
    }

    return { membership, workspace: invitation.workspace };
  });

  // Invalidate cache
  await cacheService.del(`user:${userId}:workspaces`);
  await cacheService.del(`workspace:${invitation.workspaceId}:agents`);
  await cacheService.del(`workspace:${invitation.workspaceId}:team`);

  return result;
}

/**
 * List all invitations for a workspace with real lifecycle status
 */
export async function listWorkspaceInvitations(workspaceId) {
  const invitations = await prisma.workspaceInvitation.findMany({
    where: { workspaceId },
    include: {
      invitedBy: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const now = new Date();

  return invitations.map((inv) => {
    let status = "PENDING";
    if (inv.acceptedAt) {
      status = "ACCEPTED";
    } else if (inv.revokedAt) {
      status = "REVOKED";
    } else if (now > new Date(inv.expiresAt)) {
      status = "EXPIRED";
    }

    return {
      id: inv.id,
      email: inv.email,
      role: inv.role,
      token: inv.token,
      expiresAt: inv.expiresAt,
      createdAt: inv.createdAt,
      acceptedAt: inv.acceptedAt,
      revokedAt: inv.revokedAt,
      status, // 'PENDING' | 'ACCEPTED' | 'EXPIRED' | 'REVOKED'
      dispatchStatus: inv.dispatchStatus,
      invitedBy: inv.invitedBy,
    };
  });
}

/**
 * Cancel / Revoke a pending invitation
 */
export async function cancelWorkspaceInvitation(workspaceId, invitationId) {
  return await prisma.$transaction(async (tx) => {
    // Uniform lock order: Lock workspace row FIRST
    await tx.$queryRaw`SELECT id FROM "workspaces" WHERE id = ${workspaceId} FOR UPDATE`;

    const invitation = await tx.workspaceInvitation.findFirst({
      where: {
        id: invitationId,
        workspaceId,
      },
    });

    if (!invitation) {
      const err = new Error("Invitation introuvable.");
      err.status = 404;
      throw err;
    }

    if (invitation.acceptedAt) {
      const err = new Error("Impossible de révoquer une invitation déjà acceptée.");
      err.status = 400;
      throw err;
    }

    await tx.workspaceInvitation.update({
      where: { id: invitationId },
      data: { revokedAt: new Date() },
    });

    return { success: true };
  });
}

/**
 * Get all available skills in a workspace (with auto-seeding if empty)
 */
export async function getWorkspaceSkills(workspaceId) {
  let skills = await prisma.skill.findMany({
    where: { workspaceId },
    include: {
      _count: {
        select: { agents: true },
      },
    },
    orderBy: { name: "asc" },
  });

  if (skills.length === 0) {
    const defaultSkills = [
      { name: "Support Mobile Money & Paiement", description: "Déblocage, vérification de transactions Wave, Orange Money, MoMo" },
      { name: "Assistance Matérielle & SAV", description: "Diagnostic pannes, échange standard, retours et garanties" },
      { name: "Facturation & Litiges", description: "Régularisation comptes, avoirs, contestations et remboursements" },
      { name: "Support Réseau & Fibre", description: "Configuration routeurs, suivi des coupures et de la qualité de service" },
      { name: "Commandes & Expéditions", description: "Suivi livraison colis, retards transporteurs et réclamations" },
    ];

    for (const ds of defaultSkills) {
      await prisma.skill.upsert({
        where: { workspaceId_name: { workspaceId, name: ds.name } },
        create: { workspaceId, name: ds.name, description: ds.description },
        update: {},
      });
    }

    skills = await prisma.skill.findMany({
      where: { workspaceId },
      include: {
        _count: { select: { agents: true } },
      },
      orderBy: { name: "asc" },
    });
  }

  return skills;
}

/**
 * Create a new custom skill in a workspace
 */
export async function createWorkspaceSkill(workspaceId, { name, description }) {
  if (!name || !name.trim()) {
    throw new Error("Le nom de la compétence est requis.");
  }

  const skill = await prisma.skill.create({
    data: {
      workspaceId,
      name: name.trim(),
      description: description ? description.trim() : null,
    },
  });

  await cacheService.del(`workspace:${workspaceId}:agents`);
  return skill;
}

/**
 * Assign a skill to an agent
 */
export async function assignAgentSkill(workspaceId, agentUserId, skillId, validatedById) {
  let profile = await prisma.agentProfile.findUnique({
    where: { workspaceId_userId: { workspaceId, userId: agentUserId } },
  });

  if (!profile) {
    profile = await prisma.agentProfile.create({
      data: {
        workspaceId,
        userId: agentUserId,
        availability: "AVAILABLE",
        maxCapacity: 10,
        autoAssignmentEnabled: true,
      },
    });
  }

  const agentSkill = await prisma.agentSkill.upsert({
    where: {
      agentProfileId_skillId: {
        agentProfileId: profile.id,
        skillId,
      },
    },
    create: {
      agentProfileId: profile.id,
      skillId,
      validatedById,
      validatedAt: new Date(),
    },
    update: {
      validatedById,
      validatedAt: new Date(),
    },
    include: {
      skill: true,
    },
  });

  await cacheService.del(`workspace:${workspaceId}:agents`);
  return agentSkill;
}

/**
 * Remove a skill from an agent
 */
export async function removeAgentSkill(workspaceId, agentUserId, skillId) {
  const profile = await prisma.agentProfile.findUnique({
    where: { workspaceId_userId: { workspaceId, userId: agentUserId } },
  });

  if (profile) {
    await prisma.agentSkill.deleteMany({
      where: {
        agentProfileId: profile.id,
        skillId,
      },
    });
  }

  await cacheService.del(`workspace:${workspaceId}:agents`);
  return { success: true };
}

/**
 * Update agent availability / capacity / settings
 */
export async function updateAgentStatus(workspaceId, agentUserId, data = {}) {
  const updateData = {};
  if (data.availability && ["AVAILABLE", "BUSY", "AWAY", "OFFLINE"].includes(data.availability)) {
    updateData.availability = data.availability;
  }
  if (typeof data.maxCapacity === "number" && data.maxCapacity > 0) {
    updateData.maxCapacity = data.maxCapacity;
  }
  if (typeof data.autoAssignmentEnabled === "boolean") {
    updateData.autoAssignmentEnabled = data.autoAssignmentEnabled;
  }
  if (typeof data.title === "string") {
    updateData.title = data.title.trim();
  }
  if (typeof data.phone === "string") {
    updateData.phone = data.phone.trim();
  }

  const profile = await prisma.agentProfile.upsert({
    where: { workspaceId_userId: { workspaceId, userId: agentUserId } },
    create: {
      workspaceId,
      userId: agentUserId,
      availability: "AVAILABLE",
      maxCapacity: 10,
      autoAssignmentEnabled: true,
      ...updateData,
    },
    update: updateData,
  });

  await cacheService.del(`workspace:${workspaceId}:agents`);
  return profile;
}

/**
 * Suspend a workspace member (Reversible Suspension, Phase D.1).
 * INVARIANTS:
 * - Owner can NEVER be suspended.
 * - Non-destructive: member history, ticket assignments and profile remain 100% intact.
 * - Suspended member cannot access workspace endpoints (enforced in requireWorkspaceRole).
 * - Suspended member is released from active seat quota count.
 */
export async function suspendWorkspaceMember(actingUserId, { workspaceId, targetUserId, reason = "ADMIN_SUSPENSION" }) {
  return await prisma.$transaction(async (tx) => {
    // 1. Lock workspace
    await tx.$queryRaw`SELECT id FROM "workspaces" WHERE id = ${workspaceId} FOR UPDATE`;

    // 2. Verify acting user permissions (OWNER or ADMIN)
    const actingMembership = await tx.membership.findUnique({
      where: { userId_workspaceId: { userId: actingUserId, workspaceId } },
    });
    if (!actingMembership || !["OWNER", "ADMIN"].includes(actingMembership.role)) {
      const err = new Error("Seul le propriétaire ou un administrateur peut suspendre un collaborateur.");
      err.statusCode = 403;
      throw err;
    }

    // 3. Fetch target membership
    const targetMembership = await tx.membership.findUnique({
      where: { userId_workspaceId: { userId: targetUserId, workspaceId } },
      include: { user: true },
    });
    if (!targetMembership) {
      const err = new Error("Collaborateur introuvable dans cet espace.");
      err.statusCode = 404;
      throw err;
    }

    // 4. Absolute Invariant: Owner can NEVER be suspended
    if (targetMembership.role === "OWNER") {
      const err = new Error("Le propriétaire de l'espace (OWNER) ne peut jamais être suspendu.");
      err.statusCode = 400;
      throw err;
    }

    if (targetMembership.status === "SUSPENDED") {
      return { success: true, message: "Le collaborateur est déjà suspendu.", membership: targetMembership };
    }

    const updated = await tx.membership.update({
      where: { id: targetMembership.id },
      data: {
        status: "SUSPENDED",
        suspendedAt: new Date(),
        suspendedReason: reason,
      },
      include: { user: true },
    });

    await tx.auditLog.create({
      data: {
        workspaceId,
        userId: actingUserId,
        action: "MEMBER_SUSPENDED",
        entityType: "MEMBERSHIP",
        entityId: targetMembership.id,
        details: {
          targetUserId,
          targetEmail: targetMembership.user?.email,
          reason,
          suspendedAt: updated.suspendedAt,
        },
      },
    });

    await cacheService.del(`workspace:${workspaceId}:agents`);
    return { success: true, message: "Collaborateur suspendu avec succès.", membership: updated };
  });
}

/**
 * Reactivate a suspended workspace member.
 * INVARIANTS:
 * - Checks active seat quota under row-level lock against active commercial plan.
 * - If quota is exceeded, rejects with PLAN_LIMIT_EXCEEDED (requires plan upgrade or seat clearance).
 */
export async function reactivateWorkspaceMember(actingUserId, { workspaceId, targetUserId }) {
  return await prisma.$transaction(async (tx) => {
    // 1. Lock workspace
    await tx.$queryRaw`SELECT id FROM "workspaces" WHERE id = ${workspaceId} FOR UPDATE`;

    // 2. Verify acting user permissions
    const actingMembership = await tx.membership.findUnique({
      where: { userId_workspaceId: { userId: actingUserId, workspaceId } },
    });
    if (!actingMembership || !["OWNER", "ADMIN"].includes(actingMembership.role)) {
      const err = new Error("Seul le propriétaire ou un administrateur peut réactiver un collaborateur.");
      err.statusCode = 403;
      throw err;
    }

    // 3. Fetch target membership
    const targetMembership = await tx.membership.findUnique({
      where: { userId_workspaceId: { userId: targetUserId, workspaceId } },
      include: { user: true },
    });
    if (!targetMembership) {
      const err = new Error("Collaborateur introuvable dans cet espace.");
      err.statusCode = 404;
      throw err;
    }

    if (targetMembership.status === "ACTIVE") {
      return { success: true, message: "Le collaborateur est déjà actif.", membership: targetMembership };
    }

    // 4. Verify seat quota under lock
    const activePlan = await getWorkspaceActivePlan(workspaceId);
    const activeMembersCount = await tx.membership.count({
      where: { workspaceId, status: "ACTIVE" },
    });
    const pendingInvitesCount = await tx.workspaceInvitation.count({
      where: {
        workspaceId,
        acceptedAt: null,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
    });

    if (activeMembersCount + pendingInvitesCount >= activePlan.maxAgents) {
      const err = new Error(
        `Impossible de réactiver ce collaborateur : la formule ${activePlan.name} est limitée à ${activePlan.maxAgents} collaborateur(s). Veuillez faire évoluer votre offre ou libérer un accès actif.`
      );
      err.statusCode = 403;
      err.code = "PLAN_LIMIT_EXCEEDED";
      throw err;
    }

    const updated = await tx.membership.update({
      where: { id: targetMembership.id },
      data: {
        status: "ACTIVE",
        suspendedAt: null,
        suspendedReason: null,
      },
      include: { user: true },
    });

    await tx.auditLog.create({
      data: {
        workspaceId,
        userId: actingUserId,
        action: "MEMBER_REACTIVATED",
        entityType: "MEMBERSHIP",
        entityId: targetMembership.id,
        details: {
          targetUserId,
          targetEmail: targetMembership.user?.email,
          reactivatedAt: new Date().toISOString(),
        },
      },
    });

    await cacheService.del(`workspace:${workspaceId}:agents`);
    return { success: true, message: "Collaborateur réactivé avec succès.", membership: updated };
  });
}

/**
 * Reactivate members who were suspended exclusively due to a commercial downgrade.
 * INVARIANTS (Requirement 3):
 * - NEVER reactivates members who were suspended manually by an admin (suspendedReason !== "COMMERCIAL_DOWNGRADE").
 * - Verifies available seat quota under row-level lock against active plan.
 * - Non-destructive and audited in AuditLog.
 */
export async function reactivateCommercialSuspensions(actingUserId, { workspaceId, maxToReactivate = null }, externalTx = null) {
  const executeReactivation = async (tx) => {
    // 1. Lock workspace
    await tx.$queryRaw`SELECT id FROM "workspaces" WHERE id = ${workspaceId} FOR UPDATE`;

    // 2. Verify acting user permissions (OWNER or ADMIN)
    const actingMembership = await tx.membership.findUnique({
      where: { userId_workspaceId: { userId: actingUserId, workspaceId } },
    });
    if (!actingMembership || !["OWNER", "ADMIN"].includes(actingMembership.role)) {
      const err = new Error("Seul le propriétaire ou un administrateur peut réactiver les collaborateurs.");
      err.statusCode = 403;
      throw err;
    }

    // 3. Compute available seats under lock
    const activePlan = await getWorkspaceActivePlan(workspaceId);
    const activeCount = await tx.membership.count({
      where: { workspaceId, status: "ACTIVE" },
    });
    const pendingCount = await tx.workspaceInvitation.count({
      where: {
        workspaceId,
        acceptedAt: null,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
    });

    const availableSeats = Math.max(0, activePlan.maxAgents - (activeCount + pendingCount));
    if (availableSeats <= 0) {
      return {
        success: false,
        reactivatedCount: 0,
        message: `Aucun siège disponible dans la formule active ${activePlan.name} (${activePlan.maxAgents} max).`,
        reactivatedMembers: [],
      };
    }

    // 4. Fetch ONLY members suspended for COMMERCIAL_DOWNGRADE
    // Members suspended for MANUAL_ADMIN or other reasons are STRICTLY excluded!
    const commercialSuspended = await tx.membership.findMany({
      where: {
        workspaceId,
        status: "SUSPENDED",
        suspendedReason: "COMMERCIAL_DOWNGRADE",
      },
      include: { user: true },
      orderBy: { createdAt: "asc" },
    });

    const manualSuspendedCount = await tx.membership.count({
      where: {
        workspaceId,
        status: "SUSPENDED",
        suspendedReason: { not: "COMMERCIAL_DOWNGRADE" },
      },
    });

    const limit = maxToReactivate ? Math.min(availableSeats, maxToReactivate) : availableSeats;
    const candidatesToReactivate = commercialSuspended.slice(0, limit);

    const reactivated = [];
    for (const mem of candidatesToReactivate) {
      const updated = await tx.membership.update({
        where: { id: mem.id },
        data: {
          status: "ACTIVE",
          suspendedAt: null,
          suspendedReason: null,
        },
        include: { user: true },
      });

      await tx.auditLog.create({
        data: {
          workspaceId,
          userId: actingUserId,
          action: "MEMBER_COMMERCIAL_REACTIVATED",
          entityType: "MEMBERSHIP",
          entityId: mem.id,
          details: {
            targetUserId: mem.userId,
            targetEmail: mem.user?.email,
            previousReason: "COMMERCIAL_DOWNGRADE",
            reactivatedAt: new Date().toISOString(),
          },
        },
      });

      reactivated.push(updated);
    }

    await cacheService.del(`workspace:${workspaceId}:agents`);

    return {
      success: true,
      reactivatedCount: reactivated.length,
      reactivatedMembers: reactivated,
      manualSuspendedUnchanged: manualSuspendedCount,
      remainingCommercialSuspended: commercialSuspended.length - reactivated.length,
      message: `${reactivated.length} collaborateur(s) réactivé(s) avec succès. ${manualSuspendedCount} collaborateur(s) suspendu(s) manuellement sont restés inchangés.`,
    };
  };

  if (externalTx) {
    return await executeReactivation(externalTx);
  }
  return await prisma.$transaction(executeReactivation);
}




