export type Role = "OWNER" | "ADMIN" | "MANAGER" | "AGENT";
export type PresenceState = "ONLINE" | "AWAY" | "OFFLINE";
export type AvailabilityState = "AVAILABLE" | "BUSY" | "DND";
export type AccountStatus = "ACTIVE" | "SUSPENDED" | "ARCHIVED";

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  role: Role;
  description?: string | null;
  category?: string | null;
  logoUrl?: string | null;
  coverUrl?: string | null;
  verified?: boolean;
  isPublic?: boolean;
  website?: string | null;
  supportPhone?: string | null;
  supportEmail?: string | null;
  supportWhatsApp?: string | null;
  address?: string | null;
  city?: string | null;
  country?: string | null;
  openingHours?: string | null;
  supportCategories?: string[] | null;
  brandColor?: string | null;
  brandPalette?: any;
  cannedResponses?: Array<{
    id: string;
    title: string;
    content: string;
    category: string;
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;
  }>;
  businessHours?: {
    timezone: string;
    isTemporarilyClosed: boolean;
    temporaryClosureMessage?: string;
    schedule: Record<string, { isOpen: boolean; slots: Array<{ open: string; close: string }> }>;
  };
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  avatarUrl?: string | null;
  memberships?: Array<{
    id: string;
    workspaceId: string;
    role: Role;
    workspace: {
      id: string;
      name: string;
      slug: string;
    };
  }>;
}

export interface DashboardStats {
  overview: {
    activeConversations: number;
    waitingAgent: number;
    openTickets: number;
    totalTickets?: number;
    ticketBreakdown?: {
      OPEN: number;
      IN_PROGRESS: number;
      WAITING_CUSTOMER: number;
      RESOLVED: number;
      CLOSED: number;
    };
    aiResolutionRate: number | null;
    avgResolutionTimeMinutes: number | null;
    customerSatisfactionScore: number | null;
  };
  priorityQueue: Array<{
    id: string;
    customerName: string;
    phone: string;
    channel: string;
    lastMessage: string;
    category: string;
    urgency: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    status: "WAITING_AGENT" | "AI_HANDLED" | "ESCALATED" | "RESOLVED";
    timeAgo: string;
    unreadCount: number;
  }>;
  recentActivity: Array<{
    id: string;
    type: "AI_RESOLVED" | "AGENT_ASSIGNED" | "TICKET_CREATED" | "KNOWLEDGE_UPDATED" | "RESOLUTION" | "ASSIGNMENT" | "STATUS_CHANGE" | "NOTE" | "TICKET_EVENT" | string;
    title: string;
    description: string;
    timestamp: string;
  }>;
  volumeTrend: Array<{
    time: string;
    total: number;
    aiResolved: number;
    escalated: number;
  }>;
}

export interface ConversationMessage {
  id: string;
  sender: "customer" | "ai" | "agent";
  text: string;
  time: string;
}

export interface Conversation {
  id: string;
  customerName: string;
  phone: string;
  avatar: string;
  channel: string;
  lastMessage: string;
  lastMessageTime: string;
  status: "WAITING_AGENT" | "AI_HANDLED" | "ESCALATED" | "RESOLVED";
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  assignedAgent: string;
  unread: number;
  category: string;
  messages: ConversationMessage[];
}

export interface Ticket {
  id: string;
  customerName: string;
  customerPhone: string;
  subject: string;
  category: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  status: "OPEN" | "IN_PROGRESS" | "IN_AGENCY" | "RESOLVED" | "CLOSED";
  assignedAgency: string;
  assignedAgent: string;
  aiSummary: string;
  createdAt: string;
  updatedAt: string;
  history: Array<{
    date: string;
    author: string;
    text: string;
  }>;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  city: string;
  country: string;
  conversationsCount: number;
  ticketsCount: number;
  lastInteraction: string;
  status: string;
  tags: string[];
}

export interface Agent {
  id: string;
  name: string;
  email: string;
  role: Role;
  presence?: PresenceState;
  availability?: AvailabilityState;
  accountStatus?: AccountStatus;
  status: "AVAILABLE" | "BUSY" | "DND" | "AWAY" | "OFFLINE";
  skills: string[];
  activeConversations: number;
  resolvedToday: number;
  avgResponseTime: string;
}

export interface Agency {
  id: string;
  name: string;
  city: string;
  address: string;
  phone: string;
  manager: string;
  openTickets: number;
  hours: string;
  services: string[];
}

export interface AiConfig {
  autonomyMode: "ASSISTED" | "SEMI_AUTONOMOUS" | "FULL_AUTONOMOUS";
  language: string;
  tone: string;
  knowledgeBaseSources: string[];
  escalationTriggers: {
    frustrationKeywords: boolean;
    claimAmountThreshold: number;
    unresolvedAfterMessages: number;
    explicitAgentRequest: boolean;
  };
  stats: {
    totalHandledThisMonth: number;
    resolvedWithoutHuman: number;
    accuracyRate: number;
  };
}

export interface KnowledgeArticle {
  id: string;
  category: string;
  title: string;
  summary: string;
  updatedAt: string;
  status: "INDEXED" | "DRAFT" | "OUTDATED";
  readsCount: number;
}

export interface WhatsAppConfig {
  isConnected: boolean;
  phoneNumber: string;
  displayName: string;
  provider: string;
  webhookStatus: string;
  templatesCount: number;
  autoReplyEnabled: boolean;
  businessHoursGreeting: string;
  offHoursGreeting: string;
}

export interface AnalyticsData {
  period: string;
  kpis: Array<{
    label: string;
    value: string;
    change: string;
  }>;
  topIssues: Array<{
    category: string;
    percentage: number;
  }>;
  agentPerformance: Array<{
    name: string;
    handled: number;
    avgTime: string;
    satisfaction: string;
  }>;
}

export interface AgentDashboardStats {
  assignedOpenTickets: number;
  urgentOrNearDueTickets: number;
  waitingCustomerTickets: number;
  activeConversations: number;
  resolvedRecentlyCount: number;
  profile: {
    availability: 'AVAILABLE' | 'BUSY' | 'AWAY' | 'OFFLINE';
    maxCapacity: number;
    skills: Array<{ skill: { id: string; name: string; code: string; category?: string } }>;
  } | null;
  recentAssignedTickets: AgentTicket[];
  notifications: Array<{
    id: string;
    type: string;
    title: string;
    message: string;
    createdAt: string;
    read: boolean;
  }>;
}

export interface AgentTicket {
  id: string;
  reference: string;
  title: string;
  description: string;
  category: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'OPEN' | 'IN_PROGRESS' | 'WAITING_CUSTOMER' | 'RESOLVED' | 'CLOSED';
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  dueAt?: string;
  resolvedAt?: string;
  closedAt?: string;
  assignedAgent?: {
    id: string;
    userId: string;
    user?: {
      id: string;
      firstName?: string;
      lastName?: string;
      email: string;
    };
  } | null;
  isShared?: boolean;
  myAccessLevel?: 'READ_ONLY' | 'CONTRIBUTE';
  shares?: Array<{
    id: string;
    accessLevel: 'READ_ONLY' | 'CONTRIBUTE';
    expiresAt?: string;
    createdAt: string;
    sharedWithAgent?: {
      user?: {
        firstName?: string;
        lastName?: string;
        email: string;
      };
    };
    sharedByUser?: {
      firstName?: string;
      lastName?: string;
      email: string;
    };
  }>;
  activities?: Array<{
    id: string;
    action: string;
    details?: any;
    createdAt: string;
    user?: {
      firstName?: string;
      lastName?: string;
      email: string;
    };
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface AgentConversationItem {
  id: string;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  status: 'OPEN' | 'ASSIGNED' | 'WAITING_CUSTOMER' | 'RESOLVED' | 'CLOSED';
  category?: string;
  externalChannel?: string;
  ticketId?: string;
  ticket?: {
    id: string;
    reference: string;
    title: string;
    status: string;
  } | null;
  assignedAgent?: {
    id: string;
    firstName?: string | null;
    lastName?: string | null;
    email?: string | null;
    user?: {
      firstName?: string;
      lastName?: string;
      email: string;
    };
  } | null;
  messages: Array<{
    id: string;
    senderType: 'CUSTOMER' | 'AGENT' | 'AI' | 'INTERNAL_NOTE';
    senderName?: string;
    content: string;
    isInternalNote: boolean;
    createdAt: string;
  }>;
  lastMessage?: string;
  lastMessageAt?: string;
  isShared?: boolean;
  myAccessLevel?: 'READ_ONLY' | 'CONTRIBUTE';
  createdAt: string;
  updatedAt: string;
}

export interface AgentProfileData {
  id: string;
  availability: AvailabilityState;
  presence?: PresenceState;
  presenceInfo?: {
    state: PresenceState;
    activeSessions: number;
    lastHeartbeatAt: string | null;
    lastActivityAt: string | null;
  };
  accountStatus?: AccountStatus;
  role?: Role;
  maxCapacity: number;
  notificationEmail?: boolean;
  notificationApp?: boolean;
  notificationPreferences?: Record<string, boolean>;
  user: {
    id: string;
    firstName?: string;
    lastName?: string;
    email: string;
  };
  skills: Array<{
    id: string;
    isPrimary?: boolean;
    verifiedAt?: string;
    validatedAt?: string;
    skill: {
      id: string;
      name: string;
      description?: string | null;
      isActive?: boolean;
      code?: string;
      category?: string;
    };
  }>;
}

export type EstablishmentType =
  | 'HEADQUARTERS'
  | 'BRANCH'
  | 'STORE'
  | 'POINT_OF_SALE'
  | 'SERVICE_POINT'
  | 'PICKUP_POINT'
  | 'TECH_CENTER'
  | 'OTHER';

export interface Establishment {
  id: string;
  workspaceId?: string;
  name: string;
  type: EstablishmentType;
  description?: string | null;
  isMain: boolean;
  isActive: boolean;
  isPublic: boolean;
  address: string;
  addressDetails?: string | null;
  city: string;
  country: string;
  phone?: string | null;
  email?: string | null;
  whatsapp?: string | null;
  openingHours?: string | null;
  businessHours?: {
    timezone?: string;
    schedule?: Record<string, { isOpen: boolean; slots: Array<{ open: string; close: string }> }>;
  } | null;
  services: string[];
  practicalInfo?: string | null;
  imageUrl?: string | null;
  galleryImages?: string[] | null;
  latitude?: number | null;
  longitude?: number | null;
  createdAt: string;
  updatedAt: string;
}

export type QuotaStatus = 'OK' | 'WARNING' | 'REACHED';

export interface QuotaMetric {
  key: 'agents' | 'establishments' | 'storage' | string;
  label: string;
  used: number;
  limit: number | null;
  unit: string;
  unlimited: boolean;
  percentage: number;
  remaining: number | null;
  status: QuotaStatus;
  breakdown?: Record<string, any>;
}

export interface QuotaAlertItem {
  key: string;
  severity: 'WARNING' | 'REACHED';
  title: string;
  message: string;
}

export interface WorkspaceUsageSummary {
  workspaceId: string;
  plan: {
    id: 'DECOUVERTE' | 'STARTER' | 'PRO' | 'ENTREPRISE' | string;
    name: string;
    priceXaf: number;
    periodLabel: string;
    isPaid: boolean;
    currentPeriodStart?: string | null;
    currentPeriodEnd?: string | null;
    nextRecommendedPlanId?: string | null;
  };
  metrics: {
    agents: QuotaMetric;
    establishments: QuotaMetric;
    storage: QuotaMetric;
  };
  peakPercentage: number;
  globalSeverity: QuotaStatus;
  alerts: QuotaAlertItem[];
  monthlyActivity: {
    periodStart: string;
    ticketsCount: number;
    conversationsCount: number;
    messagesCount: number;
  };
  computedAt: string;
}

