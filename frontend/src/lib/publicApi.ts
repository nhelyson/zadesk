import { PublicCompany, PublicCategory, PublicCompanyListResponse } from "@/types/public";

const API_BASE = typeof window !== "undefined" ? "/api/public" : (process.env.INTERNAL_API_URL || "http://backend:4000/api/public");

/**
 * Fetch list of public companies with search and filters
 */
export async function fetchPublicCompanies(params: {
  search?: string;
  category?: string;
  city?: string;
  limit?: number;
  offset?: number;
} = {}): Promise<PublicCompanyListResponse> {
  const query = new URLSearchParams();
  if (params.search) query.set("search", params.search);
  if (params.category && params.category !== "all" && params.category !== "Toutes") query.set("category", params.category);
  if (params.city && params.city !== "all") query.set("city", params.city);
  if (params.limit) query.set("limit", String(params.limit));
  if (params.offset) query.set("offset", String(params.offset));

  try {
    const res = await fetch(`${API_BASE}/companies?${query.toString()}`, {
      next: { revalidate: 60 },
    });
    const json = await res.json();
    if (json.success) {
      if (json.companies) {
        return {
          companies: json.companies,
          total: json.total || json.companies.length,
          limit: json.limit || 20,
          offset: json.offset || 0,
        };
      }
      if (json.data?.companies) {
        return json.data;
      }
    }
    return { companies: [], total: 0, limit: 20, offset: 0 };
  } catch (err) {
    console.error("Failed to fetch public companies:", err);
    return { companies: [], total: 0, limit: 20, offset: 0 };
  }
}

/**
 * Fetch popular companies
 */
export async function fetchPopularCompanies(): Promise<PublicCompany[]> {
  try {
    const res = await fetch(`${API_BASE}/companies/popular`, {
      next: { revalidate: 120 },
    });
    const json = await res.json();
    if (json.success) {
      return json.companies || json.data?.companies || [];
    }
    return [];
  } catch (err) {
    console.error("Failed to fetch popular companies:", err);
    return [];
  }
}

/**
 * Fetch categories with counts
 */
export async function fetchPublicCategories(): Promise<PublicCategory[]> {
  try {
    const res = await fetch(`${API_BASE}/companies/categories`, {
      next: { revalidate: 300 },
    });
    const json = await res.json();
    if (json.success) {
      return json.categories || json.data?.categories || [];
    }
    return [];
  } catch (err) {
    console.error("Failed to fetch public categories:", err);
    return [];
  }
}

/**
 * Fetch single company by slug (always fresh to immediately reflect workspace settings)
 */
export async function fetchCompanyBySlug(slug: string): Promise<PublicCompany | null> {
  try {
    const res = await fetch(`${API_BASE}/companies/${encodeURIComponent(slug)}`, {
      cache: "no-store",
    });
    const json = await res.json();
    if (json.success) {
      return json.company || json.data?.company || null;
    }
    return null;
  } catch (err) {
    console.error(`Failed to fetch company ${slug}:`, err);
    return null;
  }
}

/**
 * Send real chat message to company SAV desk from public portal
 */
export async function sendPublicChatMessage(
  slug: string,
  data: {
    message: string;
    conversationId?: string | null;
    customerName?: string;
    customerPhone?: string;
    customerEmail?: string;
    token?: string | null;
  }
): Promise<{ success: boolean; conversationId?: string; sessionToken?: string; customerName?: string; message?: any; error?: string }> {
  try {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (data.token) {
      headers["x-conversation-token"] = data.token;
    }
    const res = await fetch(`${API_BASE}/companies/${encodeURIComponent(slug)}/chat`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        message: data.message,
        conversationId: data.conversationId,
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        customerEmail: data.customerEmail,
      }),
    });
    return await res.json();
  } catch (err: any) {
    console.error(`Failed to send public chat message to ${slug}:`, err);
    return { success: false, error: err.message };
  }
}

/**
 * Fetch real chat history from company SAV desk
 */
export async function fetchPublicChatMessages(
  slug: string,
  conversationId: string,
  token?: string | null
): Promise<{ success: boolean; messages?: any[]; conversation?: any; error?: string }> {
  try {
    const headers: Record<string, string> = {};
    if (token) {
      headers["x-conversation-token"] = token;
    }
    const res = await fetch(
      `${API_BASE}/companies/${encodeURIComponent(slug)}/chat/${encodeURIComponent(conversationId)}`,
      {
        cache: "no-store",
        headers,
      }
    );
    return await res.json();
  } catch (err: any) {
    console.error(`Failed to fetch public chat messages for ${slug}:`, err);
    return { success: false, error: err.message };
  }
}
