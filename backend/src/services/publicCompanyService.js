import { prisma } from "../lib/prisma.js";
import { cacheService } from "../cache/cacheService.js";

// Seed catalog purged: Only real SAVs linked to existing accounts are published
export const SEED_COMPANIES = [];

// Helper to ensure public companies exist in the DB (purged: dummy/test companies are disabled)
export async function ensureSeedCompanies() {
  return;
}

// Select only safe public fields
const PUBLIC_COMPANY_SELECT = {
  id: true,
  name: true,
  slug: true,
  description: true,
  category: true,
  logoUrl: true,
  coverUrl: true,
  brandColor: true,
  brandPalette: true,
  businessHours: true,
  verified: true,
  isPublic: true,
  website: true,
  supportPhone: true,
  supportEmail: true,
  supportWhatsApp: true,
  address: true,
  city: true,
  country: true,
  openingHours: true,
  supportCategories: true,
  createdAt: true,
};

/**
 * List / search public companies with filters
 * Strictly restricted to public workspaces linked to existing user accounts
 */
export async function getPublicCompanies({ search = "", category = "", city = "", limit = 20, offset = 0 } = {}) {
  const cacheKey = `public:companies:${search.toLowerCase().trim()}:${category.toLowerCase().trim()}:${city.toLowerCase().trim()}:${limit}:${offset}`;

  return cacheService.wrap(cacheKey, async () => {
    const where = {
      isPublic: true,
      memberships: {
        some: {},
      },
    };

    if (search && search.trim().length > 0) {
      const q = search.trim();
      where.OR = [
        { name: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
        { category: { contains: q, mode: "insensitive" } },
        { city: { contains: q, mode: "insensitive" } },
      ];
    }

    if (category && category.trim().length > 0 && category !== "all" && category !== "Toutes") {
      where.category = { equals: category.trim(), mode: "insensitive" };
    }

    if (city && city.trim().length > 0 && city !== "all") {
      where.city = { equals: city.trim(), mode: "insensitive" };
    }

    const [total, companies] = await Promise.all([
      prisma.workspace.count({ where }),
      prisma.workspace.findMany({
        where,
        select: PUBLIC_COMPANY_SELECT,
        orderBy: [{ verified: "desc" }, { name: "asc" }],
        take: Number(limit) || 20,
        skip: Number(offset) || 0,
      }),
    ]);

    return {
      companies,
      total,
      limit: Number(limit) || 20,
      offset: Number(offset) || 0,
    };
  }, 60);
}

/**
 * Get popular / featured companies (real workspaces only)
 */
export async function getPopularPublicCompanies() {
  const cacheKey = "public:companies:popular";

  return cacheService.wrap(cacheKey, async () => {
    return prisma.workspace.findMany({
      where: {
        isPublic: true,
        memberships: {
          some: {},
        },
      },
      select: PUBLIC_COMPANY_SELECT,
      orderBy: [{ verified: "desc" }, { createdAt: "asc" }],
      take: 12,
    });
  }, 120);
}

/**
 * Get category aggregates with counts (real workspaces only)
 */
export async function getPublicCategories() {
  const cacheKey = "public:companies:categories";

  return cacheService.wrap(cacheKey, async () => {
    const companies = await prisma.workspace.findMany({
      where: {
        isPublic: true,
        memberships: {
          some: {},
        },
      },
      select: { category: true },
    });

    const categoryMap = {};
    for (const c of companies) {
      const cat = c.category || "Autre";
      categoryMap[cat] = (categoryMap[cat] || 0) + 1;
    }

    return Object.entries(categoryMap).map(([name, count]) => ({
      name,
      count,
    })).sort((a, b) => b.count - a.count);
  }, 120);
}

/**
 * Get single public company by slug (real workspace only)
 */
export async function getPublicCompanyBySlug(slug) {
  if (!slug) return null;

  const cacheKey = `public:company:${slug.toLowerCase().trim()}`;

  return cacheService.wrap(cacheKey, async () => {
    return prisma.workspace.findFirst({
      where: {
        slug: slug.trim(),
        isPublic: true,
        memberships: {
          some: {},
        },
      },
      select: {
        ...PUBLIC_COMPANY_SELECT,
        establishments: {
          where: {
            isPublic: true,
            isActive: true,
          },
          select: {
            id: true,
            name: true,
            type: true,
            description: true,
            isMain: true,
            address: true,
            city: true,
            country: true,
            addressDetails: true,
            phone: true,
            email: true,
            whatsapp: true,
            openingHours: true,
            businessHours: true,
            services: true,
            practicalInfo: true,
            imageUrl: true,
            galleryImages: true,
          },
          orderBy: [
            { isMain: "desc" },
            { createdAt: "asc" },
          ],
        },
      },
    });
  }, 120);
}
