import test from 'node:test';
import assert from 'node:assert/strict';

// Test implementation of the normalization logic directly to verify contracts
function normalizeDashboardStats(rawStats, userRole, currentUserId, agents = []) {
  const isAgent = userRole === 'AGENT';

  const operationalAgents = agents.filter(
    (a) => a.role === 'AGENT' || a.title?.toLowerCase().includes('conseiller')
  );
  const targetAgentPool = operationalAgents.length > 0 ? operationalAgents : agents;

  const availableOperationalCount = targetAgentPool.filter(
    (a) => a.status === 'AVAILABLE'
  ).length;
  const totalOperationalCount = targetAgentPool.length;
  const totalMembersCount = agents.length;
  const activeLoadCount = agents.reduce((acc, a) => acc + (a.activeChats || 0), 0);

  if (isAgent) {
    const assignedOpen = Number(rawStats?.assignedOpenTickets ?? 0);
    const urgentCount = Number(rawStats?.urgentTickets ?? 0);
    const waitingCustomer = Number(rawStats?.waitingCustomerTickets ?? 0);
    const activeConvs = Number(rawStats?.activeConversations ?? 0);
    const resolvedCount = Number(rawStats?.recentlyResolvedTickets ?? 0);

    const openTickets = assignedOpen;
    const waitingAgent = 0;
    const totalTickets = assignedOpen + resolvedCount;
    const isBrandNew = openTickets === 0 && activeConvs === 0 && totalTickets === 0;

    const recentActivitiesRaw = Array.isArray(rawStats?.recentActivities)
      ? rawStats.recentActivities
      : [];
    const recentActivity = recentActivitiesRaw.map((a) => ({
      id: a.id || `act-${Math.random()}`,
      type: a.type || 'TICKET_EVENT',
      title: a.ticketReference
        ? `${a.type === 'RESOLUTION' ? 'Résolution' : 'Action'} • ${a.ticketReference}`
        : a.ticketTitle || 'Dossier SAV',
      description: a.content || a.ticketTitle || 'Activité enregistrée',
      timestamp: 'Récemment',
    }));

    let focalIncident = null;
    if (urgentCount > 0) {
      focalIncident = {
        id: 'agent-urgent-focus',
        reference: `TK-AGENT`,
        title: `${urgentCount} dossier(s) prioritaire(s)`,
        customerName: 'Dossier Prioritaire',
        channel: 'Portail Client Web',
        lastMessage: 'Prioritaire',
        category: 'SAV Prioritaire',
        urgency: 'CRITICAL',
        status: 'IN_PROGRESS',
        timeAgo: 'Prioritaire',
        isUrgent: true,
        isWaitingAgent: false,
      };
    }

    const teamCapacity = {
      availableOperationalCount,
      totalOperationalCount,
      totalMembersCount,
      activeLoadCount,
      waitingCount: waitingCustomer,
      state: urgentCount > 0 ? 'BUSY' : availableOperationalCount > 0 ? 'NOMINAL' : 'UNAVAILABLE',
    };

    return {
      isAgent: true,
      isBrandNew,
      metrics: {
        openTickets,
        waitingAgent,
        activeConversations: activeConvs,
        totalTickets,
        resolvedTickets: resolvedCount,
      },
      focalIncident,
      dispatchQueue: [],
      teamCapacity,
      recentActivity,
    };
  }

  // Supervisor
  const overview = rawStats?.overview;
  const openTickets = Number(overview?.openTickets ?? 0);
  const waitingAgent = Number(overview?.waitingAgent ?? 0);
  const activeConversations = Number(overview?.activeConversations ?? 0);
  const totalTickets = Number(overview?.totalTickets ?? openTickets);
  const resolvedTickets = Number(overview?.ticketBreakdown?.RESOLVED ?? 0);

  const isBrandNew = openTickets === 0 && activeConversations === 0 && totalTickets === 0;
  const rawQueue = Array.isArray(rawStats?.priorityQueue) ? rawStats.priorityQueue : [];

  let focalIncident = null;
  let remainingQueue = [...rawQueue];

  if (rawQueue.length > 0) {
    const priorityIndex = rawQueue.findIndex(
      (item) =>
        item.urgency === 'CRITICAL' ||
        item.urgency === 'HIGH' ||
        item.urgency === 'URGENT' ||
        item.status === 'WAITING_AGENT'
    );

    const chosenIndex = priorityIndex !== -1 ? priorityIndex : waitingAgent > 0 ? 0 : -1;

    if (chosenIndex !== -1) {
      const top = rawQueue[chosenIndex];
      const isUrgent = top.urgency === 'HIGH' || top.urgency === 'CRITICAL' || top.urgency === 'URGENT';
      const isWaiting = top.status === 'WAITING_AGENT';

      focalIncident = {
        id: top.id,
        reference: `#TK-${top.id}`,
        title: top.subject || top.lastMessage || 'Demande client',
        customerName: top.customerName || 'Client Zadesk',
        channel: 'Portail Client Web',
        lastMessage: top.lastMessage || 'Message',
        category: top.category || 'Général',
        urgency: top.urgency || 'MEDIUM',
        status: top.status || 'IN_PROGRESS',
        timeAgo: top.timeAgo || 'Récent',
        isUrgent,
        isWaitingAgent: isWaiting,
      };

      remainingQueue = rawQueue.filter((_, idx) => idx !== chosenIndex);
    }
  }

  const dispatchQueue = remainingQueue.slice(0, 5).map((item) => ({
    id: item.id,
    reference: `#TK-${item.id}`,
    customerName: item.customerName || 'Client Zadesk',
    subject: item.lastMessage || 'Demande',
    timeAgo: item.timeAgo || 'Récent',
    status: item.status === 'WAITING_AGENT' ? 'À assigner' : 'En cours',
    urgency: item.urgency || 'MEDIUM',
  }));

  const teamCapacityState =
    waitingAgent > 0
      ? 'BUSY'
      : availableOperationalCount > 0
      ? 'NOMINAL'
      : 'UNAVAILABLE';

  const teamCapacity = {
    availableOperationalCount,
    totalOperationalCount,
    totalMembersCount,
    activeLoadCount,
    waitingCount: waitingAgent,
    state: teamCapacityState,
  };

  return {
    isAgent: false,
    isBrandNew,
    metrics: {
      openTickets,
      waitingAgent,
      activeConversations,
      totalTickets,
      resolvedTickets,
    },
    focalIncident,
    dispatchQueue,
    teamCapacity,
    recentActivity: [],
  };
}

// -------------------------------------------------------------
// TESTS
// -------------------------------------------------------------

test('1. Supervisor with Active Queue elects Incident Bay and builds Dispatch Table', () => {
  const mockStats = {
    overview: {
      openTickets: 14,
      waitingAgent: 3,
      activeConversations: 5,
      totalTickets: 25,
      ticketBreakdown: { OPEN: 6, IN_PROGRESS: 5, WAITING_CUSTOMER: 3, RESOLVED: 7, CLOSED: 4 },
    },
    priorityQueue: [
      { id: '8021', customerName: 'Alain T.', lastMessage: 'Colis introuvable', urgency: 'CRITICAL', status: 'WAITING_AGENT', timeAgo: '28 min' },
      { id: '8019', customerName: 'Béatrice N.', lastMessage: 'Duplicata facture', urgency: 'MEDIUM', status: 'WAITING_AGENT', timeAgo: '14 min' },
      { id: '8018', customerName: 'Mamadou T.', lastMessage: 'Garantie groupe', urgency: 'LOW', status: 'ASSIGNED', timeAgo: '1h' },
    ],
  };

  const agents = [
    { id: '1', name: 'Marc E.', role: 'AGENT', status: 'AVAILABLE', activeChats: 3 },
    { id: '2', name: 'Sophie M.', role: 'AGENT', status: 'AVAILABLE', activeChats: 2 },
    { id: '3', name: 'Owner', role: 'OWNER', status: 'AVAILABLE', activeChats: 0 },
  ];

  const result = normalizeDashboardStats(mockStats, 'ADMIN', 'user-admin', agents);

  assert.equal(result.isAgent, false);
  assert.equal(result.isBrandNew, false);
  assert.equal(result.metrics.openTickets, 14);
  assert.equal(result.metrics.waitingAgent, 3);
  assert.equal(result.metrics.resolvedTickets, 7);

  // Focal Incident
  assert.ok(result.focalIncident !== null);
  assert.equal(result.focalIncident.id, '8021');
  assert.equal(result.focalIncident.customerName, 'Alain T.');
  assert.equal(result.focalIncident.isUrgent, true);

  // Dispatch queue excludes focal incident
  assert.equal(result.dispatchQueue.length, 2);
  assert.equal(result.dispatchQueue[0].id, '8019');

  // Team capacity only counts operational agents (not Owner)
  assert.equal(result.teamCapacity.totalOperationalCount, 2);
  assert.equal(result.teamCapacity.availableOperationalCount, 2);
  assert.equal(result.teamCapacity.state, 'BUSY'); // waitingAgent > 0
});

test('2. Supervisor with No Urgent Items triggers Calm State (focalIncident = null)', () => {
  const mockStats = {
    overview: {
      openTickets: 2,
      waitingAgent: 0,
      activeConversations: 2,
      totalTickets: 20,
      ticketBreakdown: { RESOLVED: 18 },
    },
    priorityQueue: [],
  };

  const agents = [
    { id: '1', name: 'Marc E.', role: 'AGENT', status: 'AVAILABLE', activeChats: 2 },
  ];

  const result = normalizeDashboardStats(mockStats, 'OWNER', 'user-owner', agents);

  assert.equal(result.focalIncident, null);
  assert.equal(result.metrics.waitingAgent, 0);
  assert.equal(result.teamCapacity.state, 'NOMINAL');
});

test('3. Brand New Workspace with 0 tickets and 0 conversations', () => {
  const mockStats = {
    overview: {
      openTickets: 0,
      waitingAgent: 0,
      activeConversations: 0,
      totalTickets: 0,
    },
    priorityQueue: [],
  };

  const result = normalizeDashboardStats(mockStats, 'OWNER', 'user-new', []);

  assert.equal(result.isBrandNew, true);
  assert.equal(result.focalIncident, null);
  assert.equal(result.metrics.openTickets, 0);
});

test('4. Agent Role correctly maps agentApi response without 0-counter bugs', () => {
  const agentStats = {
    assignedOpenTickets: 5,
    urgentTickets: 1,
    waitingCustomerTickets: 2,
    activeConversations: 3,
    recentlyResolvedTickets: 4,
    recentActivities: [
      { id: 'a1', type: 'RESOLUTION', ticketReference: 'TK-100', content: 'Dossier résolu' },
    ],
  };

  const result = normalizeDashboardStats(agentStats, 'AGENT', 'user-agent', []);

  assert.equal(result.isAgent, true);
  assert.equal(result.metrics.openTickets, 5); // Correctly mapped from assignedOpenTickets
  assert.equal(result.metrics.activeConversations, 3);
  assert.equal(result.metrics.resolvedTickets, 4);
  assert.ok(result.focalIncident !== null); // urgentTickets > 0 elects a focal incident
  assert.equal(result.focalIncident.urgency, 'CRITICAL');
});
