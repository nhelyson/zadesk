import { z } from "zod";

export const registerSchema = z.object({
  firstName: z
    .string({ required_error: "Le prénom est requis." })
    .trim()
    .min(1, "Le prénom ne peut pas être vide.")
    .max(100, "Le prénom est trop long."),
  lastName: z
    .string({ required_error: "Le nom est requis." })
    .trim()
    .min(1, "Le nom ne peut pas être vide.")
    .max(100, "Le nom est trop long."),
  email: z
    .string({ required_error: "L'adresse email est requise." })
    .trim()
    .toLowerCase()
    .email("Adresse email professionnelle invalide."),
  password: z
    .string({ required_error: "Le mot de passe est requis." })
    .min(8, "Le mot de passe doit contenir au moins 8 caractères.")
    .max(128, "Le mot de passe est trop long."),
  turnstileToken: z.string().optional(),
});

export const loginSchema = z.object({
  email: z
    .string({ required_error: "L'adresse email est requise." })
    .trim()
    .toLowerCase()
    .email("Adresse email invalide."),
  password: z
    .string({ required_error: "Le mot de passe est requis." })
    .min(1, "Le mot de passe est requis."),
  turnstileToken: z.string().optional(),
});

export const verifyOtpSchema = z.object({
  tempToken: z
    .string({ required_error: "Le jeton temporaire de vérification est requis." })
    .min(1, "Le jeton ne peut pas être vide."),
  otp: z
    .string({ required_error: "Le code de vérification est requis." })
    .trim()
    .regex(/^\d{6}$/, "Le code de vérification doit comporter exactement 6 chiffres."),
  purpose: z
    .enum(["REGISTRATION", "LOGIN", "EMAIL_VERIFICATION", "PASSWORD_RESET"])
    .default("LOGIN"),
});

export const resendOtpSchema = z.object({
  tempToken: z
    .string({ required_error: "Le jeton temporaire de vérification est requis." })
    .min(1, "Le jeton ne peut pas être vide."),
  purpose: z
    .enum(["REGISTRATION", "LOGIN", "EMAIL_VERIFICATION", "PASSWORD_RESET"])
    .default("LOGIN"),
  turnstileToken: z.string().optional(),
});

export const googleAuthSchema = z.object({
  credential: z
    .string({ required_error: "Le jeton d'authentification Google est requis." })
    .min(1, "Le jeton Google ne peut pas être vide."),
  mode: z
    .enum(["login", "register"], {
      invalid_type_error: "Le mode doit être soit 'login' soit 'register'.",
    })
    .default("login"),
});

export const createWorkspaceSchema = z.object({
  name: z
    .string({ required_error: "Le nom de l'entreprise est requis." })
    .trim()
    .min(2, "Le nom doit comporter au moins 2 caractères.")
    .max(100, "Le nom est trop long."),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9-]+$/, "Le slug ne peut contenir que des lettres minuscules, chiffres et tirets.")
    .optional(),
  country: z.string().trim().optional(),
  hasExistingSav: z.boolean().optional(),
  selectedPlan: z
    .string()
    .trim()
    .toUpperCase()
    .pipe(z.enum(["DECOUVERTE", "STARTER", "PRO", "ENTREPRISE"]))
    .optional(),
});

/**
 * Normalizes a company name for duplicate detection and uniqueness constraint:
 * 1. Unicode NFD decomposition + removes diacritical marks (e.g. "É" -> "E")
 * 2. Lowercase conversion
 * 3. Strips punctuation, quotes, symbols (retains letters and numbers)
 * 4. Collapses multiple whitespace into a single space
 * 5. Trims leading/trailing whitespace
 */
export function normalizeCompanyName(name) {
  if (!name || typeof name !== "string") return "";
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove accents/diacritics
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")     // replace punctuation and symbols with space
    .replace(/\s+/g, " ")             // collapse multiple spaces into one
    .trim();
}

const COUNTRY_MAP = {
  cg: "Congo",
  congo: "Congo",
  "congo-brazzaville": "Congo",
  "republique du congo": "Congo",
  cm: "Cameroun",
  cameroun: "Cameroun",
  cameroon: "Cameroun",
  ga: "Gabon",
  gabon: "Gabon",
  cd: "RDC",
  rdc: "RDC",
  drc: "RDC",
  "congo-kinshasa": "RDC",
  td: "Tchad",
  tchad: "Tchad",
  chad: "Tchad",
  cf: "RCA",
  rca: "RCA",
  ci: "Côte d'Ivoire",
  sn: "Sénégal",
  fr: "France",
};

export function normalizeCountryName(country) {
  if (!country || typeof country !== "string") return "Congo";
  const raw = country.trim().toLowerCase();
  return COUNTRY_MAP[raw] || country.trim();
}

export const onboardingDraftSchema = z.object({
  step: z.number().int().min(1).max(6).default(1),
  data: z.record(z.any()),
});

