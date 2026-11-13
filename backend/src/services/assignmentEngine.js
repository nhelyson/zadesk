import { prisma } from "../lib/prisma.js";

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

  // 4. Calculate weighted load for each eligible candidate
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

    candidateScores.push({
      userId: profile.userId,
      profileId: profile.id,
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

  // 5. Pick the candidate with lowest weighted load
  // Deterministic sort: 1) weightedLoad ascending, 2) ticketCount ascending, 3) userId alphabetically (tie-breaker)
  candidateScores.sort((a, b) => {
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
