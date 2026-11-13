import { prisma } from "../lib/prisma.js";
import { normalizeCompanyName, normalizeCountryName } from "../utils/validation.js";

/**
 * Service managing user-specific onboarding drafts and enterprise uniqueness validation
 */

/**
 * Retrieve current user's onboarding draft
 */
export async function getOnboardingDraft(userId) {
  const draft = await prisma.onboardingDraft.findUnique({
    where: { userId },
  });

  if (!draft) {
    return {
      exists: false,
      step: 1,
      data: {
        companyName: "",
        sector: "Commerce et boutique",
        country: "Congo",
        city: "Brazzaville",
        supportWhatsApp: "",
      },
      updatedAt: null,
    };
  }

  return {
    exists: true,
    step: draft.step,
    data: draft.data,
    updatedAt: draft.updatedAt,
  };
}

/**
 * Upsert intermediate onboarding draft safely associated to authenticated user
 */
export async function saveOnboardingDraft(userId, { step = 1, data = {} }) {
  const currentStep = Math.min(Math.max(1, Number(step) || 1), 6);

  const updatedDraft = await prisma.onboardingDraft.upsert({
    where: { userId },
    update: {
      step: currentStep,
      data,
    },
    create: {
      userId,
      step: currentStep,
      data,
    },
  });

  return {
    success: true,
    exists: true,
    step: updatedDraft.step,
    data: updatedDraft.data,
    updatedAt: updatedDraft.updatedAt,
  };
}

/**
 * Check if a company name is available within a specified country
 */
export async function checkCompanyNameAvailability(name, country = "Congo", excludeWorkspaceId = null) {
  const trimmed = (name || "").trim();
  if (!trimmed || trimmed.length < 2) {
    return {
      available: false,
      reason: "Le nom de l'entreprise doit comporter au moins 2 caractères.",
    };
  }

  const normalized = normalizeCompanyName(trimmed);
  const normalizedCountry = normalizeCountryName(country);

  // Look for any existing workspace with the same normalized name in this country
  const existing = await prisma.workspace.findFirst({
    where: {
      normalizedName: normalized,
      country: {
        equals: normalizedCountry,
        mode: "insensitive",
      },
      NOT: excludeWorkspaceId ? { id: excludeWorkspaceId } : undefined,
    },
    select: {
      id: true,
      name: true,
      slug: true,
    },
  });

  if (existing) {
    return {
      available: false,
      normalizedName: normalized,
      reason: `Une entreprise nommée « ${existing.name} » est déjà enregistrée pour ce pays (${normalizedCountry}).`,
    };
  }

  return {
    available: true,
    normalizedName: normalized,
  };
}

/**
 * Purge user's onboarding draft after successful definitive workspace activation
 */
export async function deleteOnboardingDraft(userId) {
  try {
    await prisma.onboardingDraft.deleteMany({
      where: { userId },
    });
  } catch (err) {
    // Ignore if not present
  }
}
