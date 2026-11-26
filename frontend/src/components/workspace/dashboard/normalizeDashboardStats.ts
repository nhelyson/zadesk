import { Role, DashboardStats } from '@/types/workspace';
import { DashboardAgentItem } from '../AppDashboardView';
import {
  NormalizedDashboardData,
  DashboardIncident,
  DashboardDispatchItem,
  DashboardActivity,
  TeamCapacitySummary,
} from './types';

export function normalizeDashboardStats(
  rawStats: any | null,
  userRole: Role,
  currentUserId?: string,
  agents: DashboardAgentItem[] = []
): NormalizedDashboardData {
  const isAgent = userRole === 'AGENT';

  // 1. Calculs des Effectifs et de la Capacité Opérationnelle
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

  // 2. Traitement selon le Rôle : Conseiller SAV (AGENT)
  if (isAgent) {
    const assignedOpen = Number(rawStats?.assignedOpenTickets ?? 0);
    const urgentCount = Number(rawStats?.urgentTickets ?? 0);
    const waitingCustomer = Number(rawStats?.waitingCustomerTickets ?? 0);
    const activeConvs = Number(rawStats?.activeConversations ?? 0);
    const resolvedCount = Number(rawStats?.recentlyResolvedTickets ?? 0);

    const openTickets = assignedOpen;
    const waitingAgent = 0; // Un conseiller voit ses dossiers, les non assignés sont au niveau superviseur
    const totalTickets = assignedOpen + resolvedCount;
    const isBrandNew = openTickets === 0 && activeConvs === 0 && totalTickets === 0;

    // Normalisation des activités spécifiques de l'agent
    const recentActivitiesRaw = Array.isArray(rawStats?.recentActivities)
      ? rawStats.recentActivities
      : [];
    const recentActivity: DashboardActivity[] = recentActivitiesRaw.map((a: any) => ({
      id: a.id || `act-${Math.random()}`,
      type: a.type || 'TICKET_EVENT',
      title: a.ticketReference
        ? `${a.type === 'RESOLUTION' ? 'Résolution' : a.type === 'STATUS_CHANGE' ? 'Mise à jour' : 'Action'} • ${a.ticketReference}`
        : a.ticketTitle || 'Dossier SAV',
      description: a.content || a.ticketTitle || 'Activité enregistrée',
      timestamp: a.createdAt
        ? new Date(a.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
        : 'Récemment',
    }));

    // Élection Incident Bay pour l'agent
    let focalIncident: DashboardIncident | null = null;
    if (urgentCount > 0) {
      focalIncident = {
        id: 'agent-urgent-focus',
        reference: `TK-${new Date().getFullYear()}`,
        title: `${urgentCount} dossier${urgentCount > 1 ? 's' : ''} prioritaire${urgentCount > 1 ? 's' : ''} assigné${urgentCount > 1 ? 's' : ''} à votre charge`,
        customerName: 'Dossier Prioritaire',
        customerPhone: null,
        channel: 'Portail Client Web',
        lastMessage: 'Ce dossier requiert une réponse prioritaire selon le niveau de service convenu.',
        category: 'SAV Prioritaire',
        urgency: 'CRITICAL',
        status: 'IN_PROGRESS',
        timeAgo: 'Prioritaire',
        isUrgent: true,
        isWaitingAgent: false,
      };
    }

    const teamCapacity: TeamCapacitySummary = {
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

  // 3. Traitement Superviseur / Responsable (OWNER, ADMIN, MANAGER)
  const overview = rawStats?.overview;
  const openTickets = Number(overview?.openTickets ?? 0);
  const waitingAgent = Number(overview?.waitingAgent ?? 0);
  const activeConversations = Number(overview?.activeConversations ?? 0);
  const totalTickets = Number(overview?.totalTickets ?? openTickets);
  const resolvedTickets = Number(overview?.ticketBreakdown?.RESOLVED ?? 0);

  const isBrandNew = openTickets === 0 && activeConversations === 0 && totalTickets === 0;

  // File de priorité réelle (PostgreSQL Conversation / Ticket)
  const rawQueue: any[] = Array.isArray(rawStats?.priorityQueue) ? rawStats.priorityQueue : [];

  // Élection du dossier Incident Bay :
  // Recherche d'un dossier URGENT/CRITICAL ou d'une conversation WAITING_AGENT
  let focalIncident: DashboardIncident | null = null;
  let remainingQueue: any[] = [...rawQueue];

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
        reference: top.channel === 'PORTAL' && top.id?.length > 6
          ? `#TK-${top.id.slice(-4).toUpperCase()}`
          : `#TK-${top.id || 'SAV'}`,
        title: top.subject || top.lastMessage || 'Demande client en cours',
        customerName: top.customerName || 'Client',
        customerPhone: top.phone || null,
        channel: 'Portail Client Web',
        lastMessage: top.lastMessage || 'Conversation initiée sur le portail client.',
        category: top.category || 'Général',
        urgency: (top.urgency as any) || (isUrgent ? 'CRITICAL' : 'MEDIUM'),
        status: top.status || (isWaiting ? 'WAITING_AGENT' : 'IN_PROGRESS'),
        timeAgo: top.timeAgo || 'Récent',
        isUrgent,
        isWaitingAgent: isWaiting,
      };

      // Le dossier élu n'est pas répété dans la dispatch table
      remainingQueue = rawQueue.filter((_, idx) => idx !== chosenIndex);
    }
  }

  // Dispatch table à partir des dossiers suivants
  const dispatchQueue: DashboardDispatchItem[] = remainingQueue.slice(0, 5).map((item) => ({
    id: item.id,
    reference: item.channel === 'PORTAL' && item.id?.length > 6
      ? `#TK-${item.id.slice(-4).toUpperCase()}`
      : `#TK-${item.id || 'SAV'}`,
    customerName: item.customerName || 'Client',
    subject: item.lastMessage || item.subject || 'Demande d’assistance',
    timeAgo: item.timeAgo || 'Récent',
    status: item.status === 'WAITING_AGENT' ? 'À assigner' : 'En cours',
    urgency: (item.urgency as any) || 'MEDIUM',
    category: item.category || 'Général',
  }));

  // Activités récentes
  const recentActivitiesRaw: any[] = Array.isArray(rawStats?.recentActivity)
    ? rawStats.recentActivity
    : [];
  const recentActivity: DashboardActivity[] = recentActivitiesRaw.slice(0, 6).map((a) => ({
    id: a.id || `act-${Math.random()}`,
    type: a.type || 'TICKET_EVENT',
    title: a.title || 'Mise à jour dossier',
    description: a.description || 'Activité enregistrée',
    timestamp: a.timestamp || 'Récemment',
  }));

  // Statut de capacité textuel qualitatif
  const teamCapacityState: 'NOMINAL' | 'BUSY' | 'UNAVAILABLE' =
    waitingAgent > 0
      ? 'BUSY'
      : availableOperationalCount > 0
      ? 'NOMINAL'
      : 'UNAVAILABLE';

  const teamCapacity: TeamCapacitySummary = {
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
    recentActivity,
  };
}
