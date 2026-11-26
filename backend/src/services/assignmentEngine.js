import { prisma } from "../lib/prisma.js";
import { getWorkspacePresenceMap, PRESENCE_STATES } from "./presenceService.js";

const PRIORITY_WEIGHTS = {
  URGENT: 3,
  HIGH: 2,
  MEDIUM: 1,
  LOW: 1,
};

/**
 * Deterministic Auto-Assignment Engine for Tickets
 * 
 * @param {Object} params
 * @param {string} params.ticketId
 * @param {string} params.workspaceId
 * @param {string} [params.category]
 * @param {string} [params.priority]
 * @param {Object} [params.tx] Optional prisma transaction client
 * @returns {Promise<{ assigned: boolean, agentId: string|null, reason: string }>}
 */
export async function autoAssignTicket({
  ticketId,
  workspaceId,
  category,
  priority = "MEDIUM",
  tx,
}) {
  const db = tx || prisma;

  // 1. Determine required skill (based on category or explicit rule)
  const normalizedCategory = category ? category.trim() : null;

  // 2. Query all agents with profiles in this workspace
  const profiles = await db.agentProfile.findMany({
    where: {
      workspaceId,
      availability: "AVAILABLE",
      autoAssignmentEnabled: true,
      user: {
        memberships: {
          some: {
            workspaceId,
            role: { in: ["AGENT", "MANAGER"] },
            status: "ACTIVE", // Suspended or archived agents must NEVER be assigned tickets
          },
        },
      },
    },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      skills: {
        where: {
          validatedAt: { not: null },
          skill: { isActive: true },
        },
        include: {
          skill: true,
        },
      },
    },
  });

  if (!profiles || profiles.length === 0) {
    // Keep ticket in pending assignment
    await db.ticket.update({
      where: { id: ticketId },
      data: {
        status: "PENDING_ASSIGNMENT",
        assignedAgentId: null,
      },
    });

    await db.ticketActivity.create({
      data: {
        ticketId,
        type: "ASSIGNMENT_PENDING",
        content: "Aucun agent disponible dans l'entreprise. Ticket placé dans la file d'attente d'attribution.",
      },
    });

    return {
      assigned: false,
      agentId: null,
      reason: "NO_AVAILABLE_AGENTS",
    };
  }

  // 3. Filter eligible agents by skill (if category requires specific validated skill)
  let eligibleProfiles = profiles;
  if (normalizedCategory) {
    const skillMatched = profiles.filter((p) =>
      p.skills.some(
        (s) =>
          s.skill.name.toLowerCase() === normalizedCategory.toLowerCase() ||
          normalizedCategory.toLowerCase().includes(s.skill.name.toLowerCase())
      )
    );
    // If specialists exist, restrict to specialists; otherwise fallback to generalist agents
    if (skillMatched.length > 0) {
      eligibleProfiles = skillMatched;
    }
  }

  // 4. Fetch live presence & calculate weighted load for each eligible candidate
  const presenceMap = await getWorkspacePresenceMap({
    workspaceId,
    userIds: eligibleProfiles.map((p) => p.userId),
  });
  const presenceRank = {
    [PRESENCE_STATES.ONLINE]: 0,
    [PRESENCE_STATES.AWAY]: 1,
    [PRESENCE_STATES.OFFLINE]: 2,
  };
  const candidateScores = [];

  for (const profile of eligibleProfiles) {
    const activeTickets = await db.ticket.findMany({
      where: {
        workspaceId,
        assignedAgentId: profile.userId,
        status: { in: ["OPEN", "IN_PROGRESS", "WAITING_CUSTOMER"] },
      },
      select: { priority: true },
    });

    // Check raw capacity limit
    if (activeTickets.length >= profile.maxCapacity) {
      continue; // Surchargé
    }

    // Weighted workload
    const weightedLoad = activeTickets.reduce((acc, t) => {
      const weight = PRIORITY_WEIGHTS[t.priority] || 1;
      return acc + weight;
    }, 0);

    const pState = presenceMap.get(profile.userId)?.state || PRESENCE_STATES.OFFLINE;

    candidateScores.push({
      userId: profile.userId,
      profileId: profile.id,
      presenceState: pState,
      presenceOrder: presenceRank[pState] ?? 2,
      ticketCount: activeTickets.length,
      weightedLoad,
      maxCapacity: profile.maxCapacity,
      userName: `${profile.user.firstName} ${profile.user.lastName}`,
    });
  }

  if (candidateScores.length === 0) {
    // All eligible agents have reached their max capacity
    await db.ticket.update({
      where: { id: ticketId },
      data: {
        status: "PENDING_ASSIGNMENT",
        assignedAgentId: null,
      },
    });

    await db.ticketActivity.create({
      data: {
        ticketId,
        type: "ASSIGNMENT_PENDING",
        content: "Tous les agents éligibles ont atteint leur capacité maximale de traitement. En attente de libération.",
      },
    });

    return {
      assigned: false,
      agentId: null,
      reason: "ALL_AGENTS_AT_MAX_CAPACITY",
    };
  }

  // 5. Pick the candidate with best presence (ONLINE > AWAY > OFFLINE), then lowest weighted load
  candidateScores.sort((a, b) => {
    if (a.presenceOrder !== b.presenceOrder) {
      return a.presenceOrder - b.presenceOrder;
    }
    if (a.weightedLoad !== b.weightedLoad) {
      return a.weightedLoad - b.weightedLoad;
    }
    if (a.ticketCount !== b.ticketCount) {
      return a.ticketCount - b.ticketCount;
    }
    return a.userId.localeCompare(b.userId);
  });

  const bestCandidate = candidateScores[0];

  // 6. Perform the atomic assignment
  await db.ticket.update({
    where: { id: ticketId },
    data: {
      assignedAgentId: bestCandidate.userId,
      status: "OPEN",
    },
  });

  await db.ticketAssignment.create({
    data: {
      ticketId,
      newAgentId: bestCandidate.userId,
      reason: `Attribution automatique déterministe (Charge: ${bestCandidate.weightedLoad} pts, ${bestCandidate.ticketCount}/${bestCandidate.maxCapacity} tickets)`,
    },
  });

  await db.ticketActivity.create({
    data: {
      ticketId,
      authorId: bestCandidate.userId,
      type: "ASSIGNMENT",
      content: `Ticket attribué automatiquement à ${bestCandidate.userName} selon ses compétences et sa disponibilité.`,
    },
  });

  return {
    assigned: true,
    agentId: bestCandidate.userId,
    agentName: bestCandidate.userName,
    reason: "AUTO_ASSIGNED",
  };
}
