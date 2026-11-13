export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  user?: T;
  data?: T;
  workspaces?: any[];
  workspace?: any;
  stats?: any;
  conversations?: any[];
  tickets?: any[];
  customers?: any[];
  agents?: any[];
  agencies?: any[];
  establishments?: any[];
  establishment?: any;
  aiConfig?: any;
  articles?: any[];
  whatsappConfig?: any;
  analytics?: any;
  errors?: Array<{ field: string; message: string }>;
  [key: string]: any;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "/api";

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = endpoint.startsWith("http")
    ? endpoint
    : `${API_BASE}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;

  const headers = new Headers(options.headers || {});
  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(url, {
    ...options,
    headers,
    credentials: "include", // Required to send and receive HttpOnly session cookies
  });

  const data = await res.json().catch(() => ({
    success: false,
    message: "Réponse serveur invalide.",
  }));

  if (!res.ok) {
    const error: any = new Error(data.message || `Erreur requête (${res.status})`);
    error.status = res.status;
    error.code = data.code;
    error.data = data;
    throw error;
  }

  return data;
}

// Workspace API service
export const workspaceApi = {
  getUserWorkspaces: async () => {
    const res = await apiRequest('/workspaces');
    return res.data?.workspaces || res.workspaces || [];
  },

  getOnboardingDraft: async () => {
    const res = await apiRequest('/workspaces/onboarding/draft');
    return res.data || res;
  },

  saveOnboardingDraft: async (step: number, data: any) => {
    const res = await apiRequest('/workspaces/onboarding/draft', {
      method: 'PUT',
      body: JSON.stringify({ step, data }),
    });
    return res.data || res;
  },

  checkCompanyName: async (name: string, country = 'Congo') => {
    const params = new URLSearchParams({ name, country });
    const res = await apiRequest(`/workspaces/check-name?${params.toString()}`);
    return res.data || res;
  },

  createWorkspace: async (data: {
    name: string;
    slug?: string;
    category?: string;
    description?: string;
    logoUrl?: string;
    supportWhatsApp?: string;
    supportPhone?: string;
    supportEmail?: string;
    address?: string;
    city?: string;
    country?: string;
    openingHours?: string;
    supportCategories?: string[];
    initialAgents?: Array<{ email: string; role: string }>;
    [key: string]: any;
  }) => {
    const res = await apiRequest('/workspaces', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.data?.workspace || res.workspace || res.data;
  },

  getWorkspace: async (workspaceId: string) => {
    const res = await apiRequest(`/workspaces/${workspaceId}`);
    return res.data?.workspace || res.workspace || res.data;
  },

  updateWorkspace: async (workspaceId: string, data: Record<string, any>) => {
    const res = await apiRequest(`/workspaces/${workspaceId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    return res.data?.workspace || res.workspace || res.data;
  },

  getDashboardStats: async (workspaceId: string) => {
    const res = await apiRequest(`/workspaces/${workspaceId}/dashboard`);
    return res.data?.stats || res.stats || res.data || res;
  },

  getConversations: async (workspaceId: string) => {
    const res = await apiRequest(`/workspaces/${workspaceId}/conversations`);
    return res.conversations || [];
  },

  getTickets: async (workspaceId: string) => {
    const res = await apiRequest(`/workspaces/${workspaceId}/tickets`);
    return res.tickets || [];
  },

  getCustomers: async (workspaceId: string) => {
    const res = await apiRequest(`/workspaces/${workspaceId}/customers`);
    return res.customers || [];
  },

  getAgents: async (workspaceId: string) => {
    const res = await apiRequest(`/workspaces/${workspaceId}/agents`);
    return res.agents || [];
  },

  getTeamMembers: async (workspaceId: string) => {
    const res = await apiRequest(`/workspaces/${workspaceId}/agent/team`);
    return res.team || res.members || [];
  },

  updateAgentStatus: async (
    workspaceId: string,
    agentId: string,
    data: { availability?: string; maxCapacity?: number; autoAssignmentEnabled?: boolean; title?: string; phone?: string }
  ) => {
    const res = await apiRequest(`/workspaces/${workspaceId}/agents/${agentId}/status`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    return res.profile;
  },

  getSkills: async (workspaceId: string) => {
    const res = await apiRequest(`/workspaces/${workspaceId}/skills`);
    return res.skills || [];
  },

  createSkill: async (workspaceId: string, data: { name: string; description?: string }) => {
    const res = await apiRequest(`/workspaces/${workspaceId}/skills`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.skill;
  },

  assignAgentSkill: async (workspaceId: string, agentId: string, skillId: string) => {
    return apiRequest(`/workspaces/${workspaceId}/agents/${agentId}/skills`, {
      method: 'POST',
      body: JSON.stringify({ skillId }),
    });
  },

  removeAgentSkill: async (workspaceId: string, agentId: string, skillId: string) => {
    return apiRequest(`/workspaces/${workspaceId}/agents/${agentId}/skills/${skillId}`, {
      method: 'DELETE',
    });
  },

  getInvitations: async (workspaceId: string) => {
    const res = await apiRequest(`/workspaces/${workspaceId}/invitations`);
    return res.invitations || [];
  },

  createInvitation: async (workspaceId: string, email: string, role: string) => {
    return apiRequest(`/workspaces/${workspaceId}/invitations`, {
      method: 'POST',
      body: JSON.stringify({ email, role }),
    });
  },

  cancelInvitation: async (workspaceId: string, invitationId: string) => {
    return apiRequest(`/workspaces/${workspaceId}/invitations/${invitationId}`, {
      method: 'DELETE',
    });
  },

  getAgencies: async (workspaceId: string) => {
    const res = await apiRequest(`/workspaces/${workspaceId}/agencies`);
    return res.agencies || res.establishments || [];
  },

  getEstablishments: async (
    workspaceId: string,
    params?: { search?: string; type?: string; isActive?: boolean; isPublic?: boolean }
  ) => {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.type) query.append('type', params.type);
    if (params?.isActive !== undefined) query.append('isActive', String(params.isActive));
    if (params?.isPublic !== undefined) query.append('isPublic', String(params.isPublic));

    const queryString = query.toString();
    const endpoint = `/workspaces/${workspaceId}/establishments${queryString ? `?${queryString}` : ''}`;
    const res = await apiRequest(endpoint);
    return {
      establishments: res.establishments || res.data?.establishments || [],
      total: res.total || res.data?.total || 0,
      types: res.types || res.data?.types || [],
    };
  },

  getEstablishment: async (workspaceId: string, establishmentId: string) => {
    const res = await apiRequest(`/workspaces/${workspaceId}/establishments/${establishmentId}`);
    return res.establishment || res.data?.establishment || res.data;
  },

  createEstablishment: async (workspaceId: string, data: Record<string, any>) => {
    const res = await apiRequest(`/workspaces/${workspaceId}/establishments`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.establishment || res.data?.establishment || res.data;
  },

  updateEstablishment: async (
    workspaceId: string,
    establishmentId: string,
    data: Record<string, any>
  ) => {
    const res = await apiRequest(`/workspaces/${workspaceId}/establishments/${establishmentId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    return res.establishment || res.data?.establishment || res.data;
  },

  deleteEstablishment: async (workspaceId: string, establishmentId: string) => {
    return apiRequest(`/workspaces/${workspaceId}/establishments/${establishmentId}`, {
      method: 'DELETE',
    });
  },

  getAiConfig: async (workspaceId: string) => {
    const res = await apiRequest(`/workspaces/${workspaceId}/ai`);
    return res.aiConfig;
  },

  getKnowledge: async (workspaceId: string) => {
    const res = await apiRequest(`/workspaces/${workspaceId}/knowledge`);
    return res.articles || [];
  },

  getWhatsAppConfig: async (workspaceId: string) => {
    const res = await apiRequest(`/workspaces/${workspaceId}/whatsapp`);
    return res.data || res;
  },

  connectWhatsApp: async (
    workspaceId: string,
    data: { code: string; wabaId?: string; phoneNumberId?: string }
  ) => {
    return apiRequest(`/workspaces/${workspaceId}/whatsapp/connect`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  disconnectWhatsApp: async (workspaceId: string) => {
    return apiRequest(`/workspaces/${workspaceId}/whatsapp/disconnect`, {
      method: 'POST',
    });
  },

  getAnalytics: async (workspaceId: string) => {
    const res = await apiRequest(`/workspaces/${workspaceId}/analytics`);
    return res.analytics;
  },
};

// Agent Space API service
export const agentApi = {
  getDashboardStats: async (workspaceId: string) => {
    const res = await apiRequest(`/workspaces/${workspaceId}/agent/dashboard`);
    return res.data;
  },

  getMyTickets: async (
    workspaceId: string,
    params?: { status?: string; priority?: string; search?: string; page?: number; limit?: number }
  ) => {
    const query = new URLSearchParams();
    if (params?.status) query.set('status', params.status);
    if (params?.priority) query.set('priority', params.priority);
    if (params?.search) query.set('search', params.search);
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));
    const qs = query.toString();
    const res = await apiRequest(`/workspaces/${workspaceId}/agent/tickets${qs ? `?${qs}` : ''}`);
    return res.data;
  },

  getSharedTickets: async (workspaceId: string) => {
    const res = await apiRequest(`/workspaces/${workspaceId}/agent/tickets/shared`);
    return res.data || [];
  },

  getHistoryTickets: async (workspaceId: string) => {
    const res = await apiRequest(`/workspaces/${workspaceId}/agent/tickets/history`);
    return res.data || [];
  },

  getTicketDetails: async (workspaceId: string, ticketId: string) => {
    const res = await apiRequest(`/workspaces/${workspaceId}/agent/tickets/${ticketId}`);
    return res.data;
  },

  createTicket: async (
    workspaceId: string,
    data: {
      title: string;
      description: string;
      category: string;
      priority?: string;
      customerName: string;
      customerPhone?: string;
      customerEmail?: string;
      dueAt?: string;
    }
  ) => {
    const res = await apiRequest(`/workspaces/${workspaceId}/agent/tickets`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.data;
  },

  updateTicketStatus: async (workspaceId: string, ticketId: string, status: string) => {
    const res = await apiRequest(`/workspaces/${workspaceId}/agent/tickets/${ticketId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    return res.data;
  },

  shareTicket: async (
    workspaceId: string,
    ticketId: string,
    data: { targetAgentId: string; accessLevel: 'READ_ONLY' | 'CONTRIBUTE'; expiresAt?: string }
  ) => {
    const res = await apiRequest(`/workspaces/${workspaceId}/agent/tickets/${ticketId}/share`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.data;
  },

  reassignTicket: async (
    workspaceId: string,
    ticketId: string,
    data: { newAgentId: string; reason?: string }
  ) => {
    const res = await apiRequest(`/workspaces/${workspaceId}/agent/tickets/${ticketId}/reassign`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.data;
  },

  getConversations: async (workspaceId: string) => {
    const res = await apiRequest(`/workspaces/${workspaceId}/agent/conversations`);
    return res.conversations || res.data?.conversations || (Array.isArray(res.data) ? res.data : []);
  },

  getConversationDetails: async (workspaceId: string, conversationId: string) => {
    const res = await apiRequest(`/workspaces/${workspaceId}/agent/conversations/${conversationId}`);
    return res.conversation || res.data?.conversation || res.data;
  },

  sendMessage: async (
    workspaceId: string,
    conversationId: string,
    data: { content: string; isInternalNote?: boolean }
  ) => {
    const res = await apiRequest(
      `/workspaces/${workspaceId}/agent/conversations/${conversationId}/messages`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
    return res.data;
  },

  createConversation: async (
    workspaceId: string,
    data: {
      customerName: string;
      customerPhone?: string;
      customerEmail?: string;
      category?: string;
      priority?: string;
      initialMessage?: string;
    }
  ) => {
    const res = await apiRequest(`/workspaces/${workspaceId}/agent/conversations`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.conversation || res.data?.conversation || res.data;
  },

  receiveCustomerMessage: async (
    workspaceId: string,
    conversationId: string,
    data: { content: string; customerName?: string }
  ) => {
    const res = await apiRequest(
      `/workspaces/${workspaceId}/agent/conversations/${conversationId}/customer-messages`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
    return res.message || res.data?.message || res.data;
  },

  getPulseStreamUrl: (workspaceId: string) => {
    const base = process.env.NEXT_PUBLIC_API_URL || '/api';
    return `${base}/workspaces/${workspaceId}/agent/pulse/stream`;
  },

  linkConversationTicket: async (
    workspaceId: string,
    conversationId: string,
    data: { title?: string; priority?: string; category?: string; ticketId?: string }
  ) => {
    const res = await apiRequest(
      `/workspaces/${workspaceId}/agent/conversations/${conversationId}/ticket`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
    return res.data;
  },

  getProfile: async (workspaceId: string) => {
    const res = await apiRequest(`/workspaces/${workspaceId}/agent/profile`);
    return res.data;
  },

  updateProfile: async (
    workspaceId: string,
    data: { availability?: string; maxCapacity?: number; notificationPreferences?: any }
  ) => {
    const res = await apiRequest(`/workspaces/${workspaceId}/agent/profile`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    return res.data;
  },
};

// Auth API service
export const authApi = {
  getMe: async () => {
    const res = await apiRequest('/auth/me');
    return res.user;
  },

  logout: async () => {
    return apiRequest('/auth/logout', { method: 'POST' });
  },
};

