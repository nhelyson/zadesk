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
    throw new Error(data.message || `Erreur requête (${res.status})`);
  }

  return data;
}

// Workspace API service
export const workspaceApi = {
  getUserWorkspaces: async () => {
    const res = await apiRequest('/workspaces');
    return res.workspaces || [];
  },

  createWorkspace: async (data: { name: string; slug?: string }) => {
    const res = await apiRequest('/workspaces', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.workspace;
  },

  getDashboardStats: async (workspaceId: string) => {
    const res = await apiRequest(`/workspaces/${workspaceId}/dashboard-stats`);
    return res.stats;
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

  getAgencies: async (workspaceId: string) => {
    const res = await apiRequest(`/workspaces/${workspaceId}/agencies`);
    return res.agencies || [];
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
    return res.whatsappConfig;
  },

  getAnalytics: async (workspaceId: string) => {
    const res = await apiRequest(`/workspaces/${workspaceId}/analytics`);
    return res.analytics;
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
