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
});

export const googleAuthSchema = z.object({
  credential: z
    .string({ required_error: "Le jeton d'authentification Google est requis." })
    .min(1, "Le jeton Google ne peut pas être vide."),
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
});
