/**
 * ZADESK — DIRECTION 4 OPERATIONAL EDITORIAL SYSTEM
 * Dashboard Data Types & Normalization Contracts
 */

export interface DashboardIncident {
  id: string;
  reference: string;
  title: string;
  customerName: string;
  customerPhone?: string | null;
  channel: string;
  lastMessage: string;
  category: string;
  urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: string;
  timeAgo: string;
  isUrgent: boolean;
  isWaitingAgent: boolean;
}

export interface DashboardDispatchItem {
  id: string;
  reference: string;
  customerName: string;
  subject: string;
  timeAgo: string;
  status: string;
  urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  category?: string;
}

export interface DashboardActivity {
  id: string;
  type: string;
  title: string;
  description: string;
  timestamp: string;
}

export interface TeamCapacitySummary {
  availableOperationalCount: number;
  totalOperationalCount: number;
  totalMembersCount: number;
  activeLoadCount: number;
  waitingCount: number;
  state: 'NOMINAL' | 'BUSY' | 'UNAVAILABLE';
}

export interface NormalizedDashboardData {
  isAgent: boolean;
  isBrandNew: boolean;
  metrics: {
    openTickets: number;
    waitingAgent: number;
    activeConversations: number;
    totalTickets: number;
    resolvedTickets: number;
  };
  focalIncident: DashboardIncident | null;
  dispatchQueue: DashboardDispatchItem[];
  teamCapacity: TeamCapacitySummary;
  recentActivity: DashboardActivity[];
}
