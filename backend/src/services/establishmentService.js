import { prisma } from "../lib/prisma.js";
import { cacheService } from "../cache/cacheService.js";
import { getWorkspaceActivePlan } from "./commercialService.js";

export const ESTABLISHMENT_TYPES = [
  "HEADQUARTERS",
  "BRANCH",
  "STORE",
  "POINT_OF_SALE",
  "SERVICE_POINT",
  "PICKUP_POINT",
  "TECH_CENTER",
  "OTHER",
];

/**
 * Idempotent migration helper:
 * If a workspace has an address in `Workspace` but 0 establishments,
 * automatically creates the initial Headquarters establishment so
 * existing users do not have to re-enter their location.
 */
export async function ensureWorkspaceEstablishments(workspaceId) {
  try {
    const count = await prisma.establishment.count({
      where: { workspaceId },
    });

    if (count > 0) return;

    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: {
        name: true,
        address: true,
        city: true,
        country: true,
        supportPhone: true,
        supportEmail: true,
        supportWhatsApp: true,
        openingHours: true,
        businessHours: true,
        supportCategories: true,
      },
    });

    if (workspace && workspace.address && workspace.address.trim().length > 0) {
      await prisma.establishment.create({
        data: {
          workspaceId,
          name: `${workspace.name} (Siège Social)`,
          type: "HEADQUARTERS",
          isMain: true,
          isPublic: true,
          isActive: true,
          address: workspace.address.trim(),
          city: workspace.city ? workspace.city.trim() : "Brazzaville",
          country: workspace.country ? workspace.country.trim() : "Congo",
          phone: workspace.supportPhone || null,
          email: workspace.supportEmail || null,
          whatsapp: workspace.supportWhatsApp || null,
          openingHours: workspace.openingHours || null,
          businessHours: workspace.businessHours || null,
          services: workspace.supportCategories || ["Accueil physique", "Support & Réclamations SAV"],
          practicalInfo: "Siège officiel et comptoir principal de prise en charge client.",
        },
      });
      console.log(`[Establishments] Idempotent migration applied for workspace: ${workspaceId}`);
    }
  } catch (error) {
    console.error(`[Establishments] Migration notice for workspace ${workspaceId}:`, error.message);
  }
}

/**
 * Invalidate Redis caches associated with establishments
 */
export async function invalidateEstablishmentCaches(workspaceId) {
  try {
    await cacheService.del(`workspace:${workspaceId}:establishments`);
    await cacheService.del(`workspace:${workspaceId}:agencies`);

    const ws = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: { slug: true },
    });

    if (ws?.slug) {
      const slugNorm = ws.slug.toLowerCase().trim();
      await cacheService.del(`public:company:${slugNorm}`);
      await cacheService.del(`public:company:${ws.slug}`);
    }
  } catch (e) {
    console.error("[Establishments] Cache invalidation error:", e.message);
  }
}

/**
 * List all establishments for a workspace
 */
export async function listEstablishments(workspaceId, { search = "", type = "", isActive, isPublic } = {}) {
  await ensureWorkspaceEstablishments(workspaceId);

  const where = { workspaceId };

  if (type && ESTABLISHMENT_TYPES.includes(type)) {
    where.type = type;
  }

  if (typeof isActive === "boolean") {
    where.isActive = isActive;
  }

  if (typeof isPublic === "boolean") {
    where.isPublic = isPublic;
  }

  if (search && search.trim().length > 0) {
    const q = search.trim();
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { address: { contains: q, mode: "insensitive" } },
      { city: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
    ];
  }

  const establishments = await prisma.establishment.findMany({
    where,
    orderBy: [
      { isMain: "desc" },
      { createdAt: "asc" },
    ],
  });

  return establishments;
}

/**
 * Get single establishment by ID within a workspace
 */
export async function getEstablishmentById(workspaceId, establishmentId) {
  const establishment = await prisma.establishment.findFirst({
    where: {
      id: establishmentId,
      workspaceId,
    },
  });

  if (!establishment) {
    const error = new Error("Établissement introuvable ou vous n'y avez pas accès.");
    error.statusCode = 404;
    error.code = "ESTABLISHMENT_NOT_FOUND";
    throw error;
  }

  return establishment;
}

/**
 * Create a new establishment
 */
export async function createEstablishment(workspaceId, data) {
  const {
    name,
    type = "BRANCH",
    description,
    isMain = false,
    isPublic = true,
    isActive = true,
    address,
    city = "Brazzaville",
    country = "Congo",
    addressDetails,
    phone,
    email,
    whatsapp,
    openingHours,
    businessHours,
    services,
    practicalInfo,
    imageUrl,
    galleryImages,
  } = data;

  if (!name || name.trim().length < 2) {
    const error = new Error("Le nom de l'établissement est obligatoire (au moins 2 caractères).");
    error.statusCode = 400;
    error.code = "INVALID_NAME";
    throw error;
  }

  if (!address || address.trim().length < 3) {
    const error = new Error("L'adresse de l'établissement est obligatoire.");
    error.statusCode = 400;
    error.code = "INVALID_ADDRESS";
    throw error;
  }

  if (!city || city.trim().length < 2) {
    const error = new Error("La ville de l'établissement est obligatoire.");
    error.statusCode = 400;
    error.code = "INVALID_CITY";
    throw error;
  }

  const validMain = Boolean(isMain);
  const validType = ESTABLISHMENT_TYPES.includes(type) ? type : "BRANCH";

  const result = await prisma.$transaction(async (tx) => {
    // 1. Uniform lock order: Lock workspace row FIRST to eliminate race conditions
    await tx.$queryRaw`SELECT id FROM "workspaces" WHERE id = ${workspaceId} FOR UPDATE`;

    // 2. Resolve active plan inside transaction
    const activePlan = await getWorkspaceActivePlan(workspaceId);

    // 3. Count establishments atomically inside transaction
    const currentEstablishmentsCount = await tx.establishment.count({
      where: { workspaceId },
    });

    // 4. Enforce quota limits strictly
    if (currentEstablishmentsCount >= activePlan.maxEstablishments) {
      const error = new Error(
        `Votre formule actuelle (${activePlan.name}) est limitée à ${activePlan.maxEstablishments} établissement(s) ou succursale(s). Veuillez passer à la formule Pro ou Entreprise pour gérer des points de vente supplémentaires.`
      );
      error.statusCode = 403;
      error.code = "PLAN_LIMIT_EXCEEDED";
      error.details = {
        currentPlan: activePlan.id,
        maxEstablishments: activePlan.maxEstablishments,
        currentCount: currentEstablishmentsCount,
      };
      throw error;
    }

    // 5. If setting as main establishment, unset isMain on all others in this workspace
    if (validMain) {
      await tx.establishment.updateMany({
        where: { workspaceId, isMain: true },
        data: { isMain: false },
      });
    }

    const created = await tx.establishment.create({
      data: {
        workspaceId,
        name: name.trim(),
        type: validType,
        description: description ? description.trim() : null,
        isMain: validMain,
        isPublic: isPublic !== false,
        isActive: isActive !== false,
        address: address.trim(),
        city: city.trim(),
        country: country ? country.trim() : "Congo",
        addressDetails: addressDetails ? addressDetails.trim() : null,
        phone: phone ? phone.trim() : null,
        email: email ? email.trim() : null,
        whatsapp: whatsapp ? whatsapp.trim() : null,
        openingHours: openingHours ? openingHours.trim() : null,
        businessHours: businessHours || null,
        services: Array.isArray(services) ? services : (services ? [services] : null),
        practicalInfo: practicalInfo ? practicalInfo.trim() : null,
        imageUrl: imageUrl ? imageUrl.trim() : null,
        galleryImages: Array.isArray(galleryImages) ? galleryImages : (galleryImages ? [galleryImages] : null),
      },
    });

    return created;
  });

  await invalidateEstablishmentCaches(workspaceId);
  return result;
}

/**
 * Update an existing establishment
 */
export async function updateEstablishment(workspaceId, establishmentId, data) {
  // Strict multi-tenant verification
  const existing = await prisma.establishment.findFirst({
    where: {
      id: establishmentId,
      workspaceId,
    },
  });

  if (!existing) {
    const error = new Error("Établissement introuvable ou vous n'y avez pas accès.");
    error.statusCode = 404;
    error.code = "ESTABLISHMENT_NOT_FOUND";
    throw error;
  }

  const dataToUpdate = {};

  if (data.name !== undefined) {
    if (data.name.trim().length < 2) {
      const error = new Error("Le nom de l'établissement doit comporter au moins 2 caractères.");
      error.statusCode = 400;
      error.code = "INVALID_NAME";
      throw error;
    }
    dataToUpdate.name = data.name.trim();
  }

  if (data.type !== undefined) {
    dataToUpdate.type = ESTABLISHMENT_TYPES.includes(data.type) ? data.type : existing.type;
  }

  if (data.description !== undefined) {
    dataToUpdate.description = data.description ? data.description.trim() : null;
  }

  if (data.isPublic !== undefined) dataToUpdate.isPublic = Boolean(data.isPublic);
  if (data.isActive !== undefined) dataToUpdate.isActive = Boolean(data.isActive);

  if (data.address !== undefined) {
    if (data.address.trim().length < 3) {
      const error = new Error("L'adresse de l'établissement doit comporter au moins 3 caractères.");
      error.statusCode = 400;
      error.code = "INVALID_ADDRESS";
      throw error;
    }
    dataToUpdate.address = data.address.trim();
  }

  if (data.city !== undefined) dataToUpdate.city = data.city.trim();
  if (data.country !== undefined) dataToUpdate.country = data.country.trim();
  if (data.addressDetails !== undefined) dataToUpdate.addressDetails = data.addressDetails ? data.addressDetails.trim() : null;
  if (data.phone !== undefined) dataToUpdate.phone = data.phone ? data.phone.trim() : null;
  if (data.email !== undefined) dataToUpdate.email = data.email ? data.email.trim() : null;
  if (data.whatsapp !== undefined) dataToUpdate.whatsapp = data.whatsapp ? data.whatsapp.trim() : null;
  if (data.openingHours !== undefined) dataToUpdate.openingHours = data.openingHours ? data.openingHours.trim() : null;
  if (data.businessHours !== undefined) dataToUpdate.businessHours = data.businessHours || null;
  if (data.services !== undefined) {
    dataToUpdate.services = Array.isArray(data.services) ? data.services : (data.services ? [data.services] : null);
  }
  if (data.practicalInfo !== undefined) dataToUpdate.practicalInfo = data.practicalInfo ? data.practicalInfo.trim() : null;
  if (data.imageUrl !== undefined) dataToUpdate.imageUrl = data.imageUrl ? data.imageUrl.trim() : null;
  if (data.galleryImages !== undefined) {
    dataToUpdate.galleryImages = Array.isArray(data.galleryImages) ? data.galleryImages : (data.galleryImages ? [data.galleryImages] : null);
  }

  const result = await prisma.$transaction(async (tx) => {
    // 1. Uniform lock order: Lock workspace row FIRST
    await tx.$queryRaw`SELECT id FROM "workspaces" WHERE id = ${workspaceId} FOR UPDATE`;

    // 2. If reactivating an inactive establishment, enforce plan limits atomically
    if (data.isActive === true && existing.isActive === false) {
      const activePlan = await getWorkspaceActivePlan(workspaceId);
      const activeCount = await tx.establishment.count({
        where: { workspaceId, isActive: true },
      });
      if (activeCount >= activePlan.maxEstablishments) {
        const error = new Error(
          `Votre formule actuelle (${activePlan.name}) est limitée à ${activePlan.maxEstablishments} établissement(s) actif(s).`
        );
        error.statusCode = 403;
        error.code = "PLAN_LIMIT_EXCEEDED";
        throw error;
      }
    }

    if (data.isMain === true) {
      // Unset isMain on all other establishments in this workspace
      await tx.establishment.updateMany({
        where: {
          workspaceId,
          isMain: true,
          id: { not: establishmentId },
        },
        data: { isMain: false },
      });
      dataToUpdate.isMain = true;
    } else if (data.isMain === false) {
      dataToUpdate.isMain = false;
    }

    const updated = await tx.establishment.update({
      where: { id: establishmentId },
      data: dataToUpdate,
    });

    return updated;
  });

  await invalidateEstablishmentCaches(workspaceId);
  return result;
}

/**
 * Delete an establishment
 */
export async function deleteEstablishment(workspaceId, establishmentId) {
  // Strict multi-tenant verification
  const existing = await prisma.establishment.findFirst({
    where: {
      id: establishmentId,
      workspaceId,
    },
  });

  if (!existing) {
    const error = new Error("Établissement introuvable ou vous n'y avez pas accès.");
    error.statusCode = 404;
    error.code = "ESTABLISHMENT_NOT_FOUND";
    throw error;
  }

  await prisma.establishment.delete({
    where: { id: establishmentId },
  });

  await invalidateEstablishmentCaches(workspaceId);
  return { success: true };
}

