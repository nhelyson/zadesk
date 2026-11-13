import { prisma } from "../lib/prisma.js";
import { autoAssignTicket } from "./assignmentEngine.js";
import { ROLES, PERMISSIONS, hasPermission } from "../security/permissions.js";
import { dispatchTicketNotificationJob, TICKET_JOB_TYPES } from "../jobs/ticketJobs.js";
import { dispatchMetricsRefreshJob } from "../jobs/metricsJobs.js";
import { createOutboxEvent, dispatchOutboxEvents } from "../outbox/outboxDispatcher.js";
import { QUEUE_NAMES } from "../queues/queueManager.js";
import { logger } from "../utils/logger.js";
import {
  publishPulseMessageEvent,
  publishPulseConversationEvent,
  PULSE_EVENT_TYPES,
} from "./pulseEventService.js";

/**
 * Ensure an agent profile exists for a user in a workspace
 */
export async function getOrCreateAgentProfile(workspaceId, userId) {
  let profile = await prisma.agentProfile.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId,
        userId,
      },
    },
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
      skills: {
        include: {
          skill: true,
        },
      },
    },
  });

  if (!profile) {
    profile = await prisma.agentProfile.create({
      data: {
        workspaceId,
        userId,
        availability: "AVAILABLE",
        maxCapacity: 10,
        autoAssignmentEnabled: true,
        title: "Agent SAV",
      },
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
        skills: {
          include: {
            skill: true,
          },
        },
      },
    });
  }

  return profile;
}

/**
 * Get live aggregated dashboard stats for an Agent
 */
export async function getAgentDashboardStats(workspaceId, userId) {
  const [
    assignedOpen,
    urgentTickets,
    waitingCustomer,
    activeConversations,
    recentlyResolved,
    sharedCount,
    recentActivities,
  ] = await Promise.all([
    // 1. My open or in-progress tickets
    prisma.ticket.count({
      where: {
        workspaceId,
        assignedAgentId: userId,
        status: { in: ["OPEN", "IN_PROGRESS"] },
      },
    }),

    // 2. Urgent or High priority tickets
    prisma.ticket.count({
      where: {
        workspaceId,
        assignedAgentId: userId,
        priority: { in: ["URGENT", "HIGH"] },
        status: { notIn: ["RESOLVED", "CLOSED"] },
      },
    }),

    // 3. Waiting customer response
    prisma.ticket.count({
      where: {
        workspaceId,
        assignedAgentId: userId,
        status: "WAITING_CUSTOMER",
      },
    }),

    // 4. My active conversations
    prisma.conversation.count({
      where: {
        workspaceId,
        assignedAgentId: userId,
        status: { in: ["ACTIVE", "WAITING_CUSTOMER"] },
      },
    }),

    // 5. Resolved recently (last 7 days)
    prisma.ticket.count({
      where: {
        workspaceId,
        assignedAgentId: userId,
        status: { in: ["RESOLVED", "CLOSED"] },
        updatedAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
    }),

    // 6. Tickets shared with me
    prisma.ticketShare.count({
      where: {
        agentId: userId,
        ticket: { workspaceId },
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
    }),

    // 7. Recent activities on my tickets
    prisma.ticketActivity.findMany({
      where: {
        ticket: {
          workspaceId,
          OR: [
            { assignedAgentId: userId },
            { shares: { some: { agentId: userId } } },
          ],
        },
      },
      include: {
        author: {
          select: { firstName: true, lastName: true },
        },
        ticket: {
          select: { id: true, reference: true, title: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
  ]);

  return {
    assignedOpenTickets: assignedOpen,
    urgentTickets,
    waitingCustomerTickets: waitingCustomer,
    activeConversations,
    recentlyResolvedTickets: recentlyResolved,
    sharedTicketsCount: sharedCount,
    recentActivities: recentActivities.map((a) => ({
      id: a.id,
      ticketId: a.ticket.id,
      ticketReference: a.ticket.reference,
      ticketTitle: a.ticket.title,
      type: a.type,
      content: a.content,
      author: a.author ? `${a.author.firstName} ${a.author.lastName}` : "Système Zadesk",
      createdAt: a.createdAt,
    })),
  };
}

/**
 * Get tickets assigned to current agent
 */
export async function getMyAssignedTickets(workspaceId, userId, options = {}) {
  const {
    search = "",
    status,
    priority,
    category,
    limit = 20,
    offset = 0,
    orderBy = "updatedAt",
    orderDir = "desc",
  } = options;

  const where = {
    workspaceId,
    assignedAgentId: userId,
    status: { notIn: ["RESOLVED", "CLOSED"] },
  };

  if (status) {
    where.status = status;
  }
  if (priority) {
    where.priority = priority;
  }
  if (category) {
    where.category = category;
  }
  if (search.trim()) {
    where.OR = [
      { reference: { contains: search.trim(), mode: "insensitive" } },
      { title: { contains: search.trim(), mode: "insensitive" } },
      { customerName: { contains: search.trim(), mode: "insensitive" } },
      { customerPhone: { contains: search.trim(), mode: "insensitive" } },
    ];
  }

  const [total, tickets] = await Promise.all([
    prisma.ticket.count({ where }),
    prisma.ticket.findMany({
      where,
      include: {
        assignedAgent: {
          select: { id: true, firstName: true, lastName: true, avatarUrl: true },
        },
        shares: {
          select: { id: true, agentId: true, accessLevel: true },
        },
      },
      orderBy: { [orderBy]: orderDir },
      skip: parseInt(offset, 10),
      take: parseInt(limit, 10),
    }),
  ]);

  return { total, tickets, limit, offset };
}

/**
 * Get tickets shared with current agent
 */
export async function getMySharedTickets(workspaceId, userId, options = {}) {
  const { search = "", limit = 20, offset = 0 } = options;

  const where = {
    ticket: {
      workspaceId,
    },
    agentId: userId,
    OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
  };

  if (search.trim()) {
    where.ticket.OR = [
      { reference: { contains: search.trim(), mode: "insensitive" } },
      { title: { contains: search.trim(), mode: "insensitive" } },
      { customerName: { contains: search.trim(), mode: "insensitive" } },
    ];
  }

  const [total, shares] = await Promise.all([
    prisma.ticketShare.count({ where }),
    prisma.ticketShare.findMany({
      where,
      include: {
        ticket: {
          include: {
            assignedAgent: {
              select: { id: true, firstName: true, lastName: true },
            },
          },
        },
        sharedBy: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: parseInt(offset, 10),
      take: parseInt(limit, 10),
    }),
  ]);

  const tickets = shares.map((s) => ({
    ...s.ticket,
    shareInfo: {
      shareId: s.id,
      accessLevel: s.accessLevel,
      sharedBy: `${s.sharedBy.firstName} ${s.sharedBy.lastName}`,
      sharedAt: s.createdAt,
      expiresAt: s.expiresAt,
    },
  }));

  return { total, tickets, limit, offset };
}

/**
 * Get tickets resolved/closed by or assigned to agent (History)
 */
export async function getAgentTicketHistory(workspaceId, userId, options = {}) {
  const { search = "", limit = 20, offset = 0 } = options;

  const where = {
    workspaceId,
    assignedAgentId: userId,
    status: { in: ["RESOLVED", "CLOSED"] },
  };

  if (search.trim()) {
    where.OR = [
      { reference: { contains: search.trim(), mode: "insensitive" } },
      { title: { contains: search.trim(), mode: "insensitive" } },
      { customerName: { contains: search.trim(), mode: "insensitive" } },
    ];
  }

  const [total, tickets] = await Promise.all([
    prisma.ticket.count({ where }),
    prisma.ticket.findMany({
      where,
      include: {
        assignedAgent: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
      orderBy: { resolvedAt: "desc" },
      skip: parseInt(offset, 10),
      take: parseInt(limit, 10),
    }),
  ]);

  return { total, tickets, limit, offset };
}

/**
 * Get ticket details with strict permission verification
 */
export async function getTicketDetails(workspaceId, ticketId, userId, userRole) {
  const ticket = await prisma.ticket.findFirst({
    where: {
      id: ticketId,
      workspaceId,
    },
    include: {
      assignedAgent: {
        select: { id: true, firstName: true, lastName: true, avatarUrl: true },
      },
      createdBy: {
        select: { id: true, firstName: true, lastName: true },
      },
      conversation: {
        select: { id: true, status: true, channel: true },
      },
      assignments: {
        include: {
          previousAgent: { select: { firstName: true, lastName: true } },
          newAgent: { select: { firstName: true, lastName: true } },
          assignedBy: { select: { firstName: true, lastName: true } },
        },
        orderBy: { createdAt: "desc" },
      },
      shares: {
        include: {
          agent: { select: { id: true, firstName: true, lastName: true } },
          sharedBy: { select: { firstName: true, lastName: true } },
        },
      },
      activities: {
        include: {
          author: { select: { firstName: true, lastName: true } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!ticket) {
    const error = new Error("Ticket introuvable.");
    error.status = 404;
    throw error;
  }

  // Permission Check
  const isSupervisorOrAbove = [ROLES.OWNER, ROLES.ADMIN, ROLES.MANAGER].includes(userRole);
  const isAssignedAgent = ticket.assignedAgentId === userId;
  const userShare = ticket.shares.find(
    (s) => s.agent.id === userId && (!s.expiresAt || new Date(s.expiresAt) > new Date())
  );

  if (!isSupervisorOrAbove && !isAssignedAgent && !userShare) {
    const error = new Error("Accès refusé. Vous n'avez pas l'autorisation d'accéder à ce ticket.");
    error.status = 403;
    throw error;
  }

  const accessLevel = isSupervisorOrAbove || isAssignedAgent
    ? "FULL"
    : userShare.accessLevel; // 'READ_ONLY' or 'CONTRIBUTE'

  return {
    ticket,
    permissions: {
      canUpdate: accessLevel !== "READ_ONLY",
      canResolve: isSupervisorOrAbove || isAssignedAgent || accessLevel === "CONTRIBUTE",
      canShare: isSupervisorOrAbove || isAssignedAgent,
      canReassign: isSupervisorOrAbove,
      accessLevel,
    },
  };
}

/**
 * Create a new ticket with automatic or explicit assignment
 */
export async function createTicket(workspaceId, createdById, ticketData) {
  const {
    title,
    description,
    category,
    priority = "MEDIUM",
    customerName,
    customerPhone,
    customerEmail,
    conversationId,
    assignedAgentId,
  } = ticketData;

  // Transaction atomique : création du ticket, assignation et événement Outbox
  const ticket = await prisma.$transaction(async (tx) => {
    const count = await tx.ticket.count({ where: { workspaceId } });
    const reference = `TK-${new Date().getFullYear()}-${String(count + 1).padStart(4, "0")}`;

    const created = await tx.ticket.create({
      data: {
        workspaceId,
        createdById,
        reference,
        title: title.trim(),
        description: description.trim(),
        category: category ? category.trim() : null,
        priority,
        status: "PENDING_ASSIGNMENT",
        customerName: customerName.trim(),
        customerPhone: customerPhone ? customerPhone.trim() : null,
        customerEmail: customerEmail ? customerEmail.trim() : null,
        conversationId: conversationId || null,
        slaDueAt: new Date(Date.now() + 48 * 60 * 60 * 1000), // Default 48h SLA
      },
    });

    let finalAssignedAgentId = assignedAgentId;

    if (assignedAgentId) {
      await tx.ticket.update({
        where: { id: created.id },
        data: {
          assignedAgentId,
          status: "OPEN",
        },
      });

      await tx.ticketAssignment.create({
        data: {
          ticketId: created.id,
          newAgentId: assignedAgentId,
          assignedById: createdById,
          reason: "Attribution manuelle lors de la création",
        },
      });
    } else {
      const assignmentResult = await autoAssignTicket({
        ticketId: created.id,
        workspaceId,
        category,
        priority,
        tx,
      });
      if (assignmentResult?.agentId) {
        finalAssignedAgentId = assignmentResult.agentId;
      }
    }

    // Événement Outbox garanti dans la même transaction
    const safeTarget = finalAssignedAgentId ? String(finalAssignedAgentId).replace(/[^a-z0-9]/g, "-") : "all";
    const deterministicJobId = `ticket-notif-${created.id}-assigned-${safeTarget}`;

    await createOutboxEvent(tx, {
      workspaceId,
      eventType: "TICKET_ASSIGNED",
      queueName: QUEUE_NAMES.TICKETS,
      jobName: TICKET_JOB_TYPES.NOTIFICATION,
      payload: {
        workspaceId,
        ticketId: created.id,
        eventType: "ASSIGNED",
        authorId: createdById,
        targetAgentId: finalAssignedAgentId || null,
      },
      jobId: deterministicJobId,
    });

    return created;
  });

  // Déclenchement asynchrone non-bloquant du dispatcher (fire-and-forget)
  dispatchOutboxEvents().catch((e) => logger.warn(`[OutboxDispatcher] Déclenchement automatique différé: ${e.message}`));
  dispatchMetricsRefreshJob({
    workspaceId,
    triggeredBy: "ticket_created",
  }).catch((e) => console.warn("[Queue:Error]", e.message));

  return prisma.ticket.findUnique({
    where: { id: ticket.id },
    include: {
      assignedAgent: {
        select: { id: true, firstName: true, lastName: true },
      },
    },
  });
}

/**
 * Update ticket status, resolution note, or fields
 */
export async function updateTicket(workspaceId, ticketId, userId, userRole, updateData) {
  const { ticket, permissions } = await getTicketDetails(workspaceId, ticketId, userId, userRole);

  if (!permissions.canUpdate) {
    const error = new Error("Modification non autorisée. Votre accès sur ce dossier est en lecture seule.");
    error.status = 403;
    throw error;
  }

  const { status, priority, note } = updateData;
  const updates = {};

  if (status && status !== ticket.status) {
    updates.status = status;
    if (status === "RESOLVED") {
      updates.resolvedAt = new Date();
    } else if (status === "CLOSED") {
      updates.closedAt = new Date();
    }

    await prisma.ticketActivity.create({
      data: {
        ticketId,
        authorId: userId,
        type: "STATUS_CHANGE",
        content: `Statut modifié de ${ticket.status} à ${status}`,
      },
    });
  }

  if (priority && priority !== ticket.priority) {
    updates.priority = priority;
    await prisma.ticketActivity.create({
      data: {
        ticketId,
        authorId: userId,
        type: "PRIORITY_CHANGE",
        content: `Priorité modifiée de ${ticket.priority} à ${priority}`,
      },
    });
  }

  if (note && note.trim()) {
    await prisma.ticketActivity.create({
      data: {
        ticketId,
        authorId: userId,
        type: "NOTE",
        content: note.trim(),
      },
    });
  }

  if (Object.keys(updates).length > 0) {
    return prisma.ticket.update({
      where: { id: ticketId },
      data: updates,
    });
  }

  return ticket;
}

/**
 * Explicitly share a ticket with another agent
 */
export async function shareTicket(workspaceId, ticketId, currentUserId, userRole, { targetAgentId, accessLevel = "READ_ONLY", expiresAt }) {
  const { ticket, permissions } = await getTicketDetails(workspaceId, ticketId, currentUserId, userRole);

  if (!permissions.canShare) {
    const error = new Error("Vous n'avez pas l'autorisation de partager ce ticket.");
    error.status = 403;
    throw error;
  }

  // Verify target is an agent in the same workspace
  const targetMembership = await prisma.membership.findUnique({
    where: {
      userId_workspaceId: {
        userId: targetAgentId,
        workspaceId,
      },
    },
    include: {
      user: { select: { firstName: true, lastName: true } },
    },
  });

  if (!targetMembership) {
    const error = new Error("L'agent cible n'appartient pas à cette entreprise.");
    error.status = 400;
    throw error;
  }

  if (targetMembership.status === "SUSPENDED" || targetMembership.status === "ARCHIVED") {
    const error = new Error("Impossible de partager le ticket avec un collaborateur suspendu ou archivé.");
    error.status = 400;
    throw error;
  }

  const share = await prisma.$transaction(async (tx) => {
    const createdShare = await tx.ticketShare.upsert({
      where: {
        ticketId_agentId: {
          ticketId,
          agentId: targetAgentId,
        },
      },
      create: {
        ticketId,
        agentId: targetAgentId,
        sharedById: currentUserId,
        accessLevel,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
      update: {
        accessLevel,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
    });

    await tx.ticketActivity.create({
      data: {
        ticketId,
        authorId: currentUserId,
        type: "TICKET_SHARED",
        content: `Dossier partagé avec ${targetMembership.user.firstName} ${targetMembership.user.lastName} (${accessLevel === "CONTRIBUTE" ? "Contribution" : "Lecture seule"})`,
      },
    });

    const safeTarget = targetAgentId ? String(targetAgentId).replace(/[^a-z0-9]/g, "-") : "all";
    const deterministicJobId = `ticket-notif-${ticketId}-shared-${safeTarget}`;

    await createOutboxEvent(tx, {
      workspaceId,
      eventType: "TICKET_SHARED",
      queueName: QUEUE_NAMES.TICKETS,
      jobName: TICKET_JOB_TYPES.NOTIFICATION,
      payload: {
        workspaceId,
        ticketId,
        eventType: "SHARED",
        authorId: currentUserId,
        targetAgentId,
        content: `Dossier partagé avec ${targetMembership.user.firstName} ${targetMembership.user.lastName}`,
      },
      jobId: deterministicJobId,
    });

    return createdShare;
  });

  dispatchOutboxEvents().catch((e) => logger.warn(`[OutboxDispatcher] Déclenchement automatique différé: ${e.message}`));

  return share;
}

/**
 * Reassign a ticket to another agent (Supervisor / Owner / Admin only)
 */
export async function reassignTicket(workspaceId, ticketId, currentUserId, userRole, { newAgentId, reason }) {
  const isSupervisorOrAbove = [ROLES.OWNER, ROLES.ADMIN, ROLES.MANAGER].includes(userRole);
  if (!isSupervisorOrAbove) {
    const error = new Error("Seul un superviseur ou un administrateur peut réaffecter un ticket.");
    error.status = 403;
    throw error;
  }

  const ticket = await prisma.ticket.findFirst({
    where: { id: ticketId, workspaceId },
  });

  if (!ticket) {
    const error = new Error("Ticket introuvable.");
    error.status = 404;
    throw error;
  }

  // Verify new agent belongs to workspace
  const newAgentMembership = await prisma.membership.findUnique({
    where: {
      userId_workspaceId: {
        userId: newAgentId,
        workspaceId,
      },
    },
    include: {
      user: { select: { firstName: true, lastName: true } },
    },
  });

  if (!newAgentMembership) {
    const error = new Error("Le nouvel agent n'appartient pas à cette entreprise.");
    error.status = 400;
    throw error;
  }

  if (newAgentMembership.status === "SUSPENDED" || newAgentMembership.status === "ARCHIVED") {
    const error = new Error("Impossible d'assigner le ticket à un collaborateur suspendu ou archivé.");
    error.status = 400;
    throw error;
  }

  const previousAgentId = ticket.assignedAgentId;

  const result = await prisma.$transaction(async (tx) => {
    const updated = await tx.ticket.update({
      where: { id: ticketId },
      data: {
        assignedAgentId: newAgentId,
        status: ticket.status === "PENDING_ASSIGNMENT" ? "OPEN" : ticket.status,
      },
    });

    await tx.ticketAssignment.create({
      data: {
        ticketId,
        previousAgentId,
        newAgentId,
        assignedById: currentUserId,
        reason: reason || "Réaffectation manuelle par un superviseur",
      },
    });

    await tx.ticketActivity.create({
      data: {
        ticketId,
        authorId: currentUserId,
        type: "REASSIGNMENT",
        content: `Dossier réaffecté à ${newAgentMembership.user.firstName} ${newAgentMembership.user.lastName}. Motif : ${reason || "Réaffectation opérationnelle"}`,
      },
    });

    const safeTarget = newAgentId ? String(newAgentId).replace(/[^a-z0-9]/g, "-") : "all";
    const deterministicJobId = `ticket-notif-${ticketId}-reassigned-${safeTarget}`;

    await createOutboxEvent(tx, {
      workspaceId,
      eventType: "TICKET_REASSIGNED",
      queueName: QUEUE_NAMES.TICKETS,
      jobName: TICKET_JOB_TYPES.NOTIFICATION,
      payload: {
        workspaceId,
        ticketId,
        eventType: "REASSIGNED",
        authorId: currentUserId,
        targetAgentId: newAgentId,
        content: `Dossier réaffecté: ${reason || "Réaffectation"}`,
      },
      jobId: deterministicJobId,
    });

    return updated;
  });

  dispatchOutboxEvents().catch((e) => logger.warn(`[OutboxDispatcher] Déclenchement automatique différé: ${e.message}`));

  dispatchMetricsRefreshJob({
    workspaceId,
    triggeredBy: "ticket_reassigned",
  }).catch((e) => console.warn("[Queue:Error]", e.message));

  return result;
}

/**
 * Get conversations assigned or shared with current agent
 */
export async function getMyConversations(workspaceId, userId, userRole, options = {}) {
  const { search = "", status, limit = 20, offset = 0 } = options;

  const isSupervisorOrAbove = [ROLES.OWNER, ROLES.ADMIN, ROLES.MANAGER].includes(userRole);

  const where = {
    workspaceId,
  };

  if (!isSupervisorOrAbove) {
    // Restrict agent strictly to assigned or shared
    where.OR = [
      { assignedAgentId: userId },
      { shares: { some: { agentId: userId } } },
    ];
  }

  if (status) {
    where.status = status;
  }

  if (search.trim()) {
    where.customerName = { contains: search.trim(), mode: "insensitive" };
  }

  const [total, conversations] = await Promise.all([
    prisma.conversation.count({ where }),
    prisma.conversation.findMany({
      where,
      include: {
        assignedAgent: {
          select: { id: true, firstName: true, lastName: true },
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: { lastMessageAt: "desc" },
      skip: parseInt(offset, 10),
      take: parseInt(limit, 10),
    }),
  ]);

  return { total, conversations, limit, offset };
}

/**
 * Get conversation details and all message history (including internal notes)
 */
export async function getConversationDetails(workspaceId, conversationId, userId, userRole) {
  const conversation = await prisma.conversation.findFirst({
    where: { id: conversationId, workspaceId },
    include: {
      assignedAgent: {
        select: { id: true, firstName: true, lastName: true },
      },
      shares: {
        include: {
          agent: { select: { id: true, firstName: true, lastName: true } },
        },
      },
      tickets: {
        select: { id: true, reference: true, title: true, status: true },
      },
      messages: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!conversation) {
    const error = new Error("Conversation introuvable.");
    error.status = 404;
    throw error;
  }

  const isSupervisorOrAbove = [ROLES.OWNER, ROLES.ADMIN, ROLES.MANAGER].includes(userRole);
  const isAssigned = conversation.assignedAgentId === userId;
  const isShared = conversation.shares.some((s) => s.agent.id === userId);

  if (!isSupervisorOrAbove && !isAssigned && !isShared) {
    const error = new Error("Accès refusé à cette conversation.");
    error.status = 403;
    throw error;
  }

  return conversation;
}

/**
 * Send a message or internal note in a conversation (Operational without WhatsApp)
 */
export async function sendConversationMessage(workspaceId, conversationId, userId, { content, isInternalNote = false }) {
  const conversation = await prisma.conversation.findFirst({
    where: { id: conversationId, workspaceId },
  });

  if (!conversation) {
    const error = new Error("Conversation introuvable.");
    error.status = 404;
    throw error;
  }

  const senderUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { firstName: true, lastName: true },
  });

  const senderName = senderUser ? `${senderUser.firstName} ${senderUser.lastName}` : "Agent";

  const message = await prisma.conversationMessage.create({
    data: {
      conversationId,
      senderId: userId,
      senderType: isInternalNote ? "INTERNAL_NOTE" : "AGENT_REPLY",
      senderName,
      content: content.trim(),
      isInternalNote: Boolean(isInternalNote),
    },
  });

  await prisma.conversation.update({
    where: { id: conversationId },
    data: {
      lastMessageAt: new Date(),
      status: isInternalNote ? conversation.status : "WAITING_CUSTOMER",
    },
  });

  // Diffuser l'événement en temps réel sur Pulse
  publishPulseMessageEvent(workspaceId, {
    conversationId,
    messageId: message.id,
    senderType: message.senderType,
    senderName: message.senderName,
    content: message.content,
    isInternalNote: message.isInternalNote,
    assignedAgentId: conversation.assignedAgentId,
    customerName: conversation.customerName,
    category: conversation.category || "Général",
  }).catch((e) => logger.warn(`[Pulse] Échec diffusion message: ${e.message}`));

  return message;
}

/**
 * Enregistre un véritable message client entrant dans une conversation et diffuse le Pulse
 */
export async function createCustomerMessage(workspaceId, conversationId, { content, customerName }) {
  const conversation = await prisma.conversation.findFirst({
    where: { id: conversationId, workspaceId },
  });

  if (!conversation) {
    const error = new Error("Conversation introuvable.");
    error.status = 404;
    throw error;
  }

  const name = customerName || conversation.customerName || "Client";

  const message = await prisma.conversationMessage.create({
    data: {
      conversationId,
      senderType: "CUSTOMER",
      senderName: name,
      content: content.trim(),
      isInternalNote: false,
    },
  });

  await prisma.conversation.update({
    where: { id: conversationId },
    data: {
      lastMessageAt: new Date(),
      status: "ACTIVE",
    },
  });

  publishPulseMessageEvent(workspaceId, {
    conversationId,
    messageId: message.id,
    senderType: "CUSTOMER",
    senderName: name,
    content: message.content,
    isInternalNote: false,
    assignedAgentId: conversation.assignedAgentId,
    customerName: name,
    category: conversation.category || "Général",
  }).catch((e) => logger.warn(`[Pulse] Échec diffusion message client: ${e.message}`));

  return message;
}

/**
 * Crée une véritable nouvelle conversation assignée et diffuse l'événement NEW NODE
 */
export async function createAgentConversation(workspaceId, userId, conversationData) {
  const { customerName, customerPhone, customerEmail, category = "Assistance SAV", priority = "MEDIUM", initialMessage } = conversationData;

  if (!customerName || !customerName.trim()) {
    const error = new Error("Le nom du client est obligatoire.");
    error.status = 400;
    throw error;
  }

  const conversation = await prisma.conversation.create({
    data: {
      workspaceId,
      assignedAgentId: userId,
      customerName: customerName.trim(),
      customerPhone: customerPhone ? customerPhone.trim() : null,
      customerEmail: customerEmail ? customerEmail.trim() : null,
      category: category.trim(),
      priority,
      status: "ACTIVE",
    },
  });

  if (initialMessage && initialMessage.trim()) {
    await prisma.conversationMessage.create({
      data: {
        conversationId: conversation.id,
        senderType: "CUSTOMER",
        senderName: customerName.trim(),
        content: initialMessage.trim(),
      },
    });
  }

  publishPulseConversationEvent(workspaceId, {
    type: PULSE_EVENT_TYPES.CONVERSATION_CREATED,
    conversationId: conversation.id,
    customerName: conversation.customerName,
    customerPhone: conversation.customerPhone,
    status: conversation.status,
    priority: conversation.priority,
    category: conversation.category,
    assignedAgentId: conversation.assignedAgentId,
  }).catch((e) => logger.warn(`[Pulse] Échec diffusion nouvelle conversation: ${e.message}`));

  return conversation;
}

/**
 * Update Agent Profile (availability, capacity, phone)
 */
export async function updateAgentProfile(workspaceId, userId, profileData) {
  const { availability, phone, title, notificationEmail, notificationApp } = profileData;

  const data = {};
  if (availability && ["AVAILABLE", "BUSY", "AWAY", "OFFLINE"].includes(availability)) {
    data.availability = availability;
  }
  if (typeof phone === "string") {
    data.phone = phone.trim();
  }
  if (typeof title === "string") {
    data.title = title.trim();
  }
  if (typeof notificationEmail === "boolean") {
    data.notificationEmail = notificationEmail;
  }
  if (typeof notificationApp === "boolean") {
    data.notificationApp = notificationApp;
  }

  return prisma.agentProfile.upsert({
    where: {
      workspaceId_userId: { workspaceId, userId },
    },
    create: {
      workspaceId,
      userId,
      ...data,
    },
    update: data,
    include: {
      skills: {
        include: { skill: true },
      },
    },
  });
}
