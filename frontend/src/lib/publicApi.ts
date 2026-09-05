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
 * Fetch single company by slug
 */
export async function fetchCompanyBySlug(slug: string): Promise<PublicCompany | null> {
  try {
    const res = await fetch(`${API_BASE}/companies/${encodeURIComponent(slug)}`, {
      next: { revalidate: 60 },
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
