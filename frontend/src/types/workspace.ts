export type Role = "OWNER" | "ADMIN" | "MANAGER" | "AGENT";

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  role: Role;
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
    aiResolutionRate: number;
    avgResolutionTimeMinutes: number;
    customerSatisfactionScore: number;
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
    type: "AI_RESOLVED" | "AGENT_ASSIGNED" | "TICKET_CREATED" | "KNOWLEDGE_UPDATED";
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
  status: "AVAILABLE" | "BUSY" | "AWAY" | "OFFLINE";
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
