import { apiRequest, ApiResponse } from "./api";

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  emailVerified: boolean;
  createdAt: string;
  memberships?: Array<{
    id: string;
    role: "OWNER" | "ADMIN" | "MANAGER" | "AGENT";
    workspace?: {
      id: string;
      name: string;
      slug: string;
    };
  }>;
}

export interface AuthResponse extends ApiResponse<UserProfile> {
  requiresOtp?: boolean;
  requiresCaptcha?: boolean;
  tempToken?: string;
  email?: string;
  purpose?: "REGISTRATION" | "LOGIN" | "EMAIL_VERIFICATION" | "PASSWORD_RESET";
  isNewUser?: boolean;
  hasWorkspace?: boolean;
  redirectTo?: string;
}

export interface MeResponse {
  authenticated: boolean;
  user?: UserProfile;
  hasWorkspace?: boolean;
  redirectTo?: string;
}

export async function registerApi(data: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  turnstileToken?: string;
}): Promise<AuthResponse> {
  return (await apiRequest<UserProfile>("/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  })) as AuthResponse;
}

export async function loginApi(data: {
  email: string;
  password: string;
  turnstileToken?: string;
}): Promise<AuthResponse> {
  return (await apiRequest<UserProfile>("/auth/login", {
    method: "POST",
    body: JSON.stringify(data),
  })) as AuthResponse;
}

export async function verifyOtpApi(data: {
  tempToken: string;
  otp: string;
  purpose?: "REGISTRATION" | "LOGIN" | "EMAIL_VERIFICATION" | "PASSWORD_RESET";
}): Promise<AuthResponse> {
  return (await apiRequest<UserProfile>("/auth/verify-otp", {
    method: "POST",
    body: JSON.stringify(data),
  })) as AuthResponse;
}

export async function resendOtpApi(data: {
  tempToken: string;
  purpose?: "REGISTRATION" | "LOGIN" | "EMAIL_VERIFICATION" | "PASSWORD_RESET";
  turnstileToken?: string;
}): Promise<{ success: boolean; message?: string; tempToken?: string; expiresAt?: string }> {
  return apiRequest("/auth/resend-otp", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export const NEUTRAL_AUTH_ERROR_MESSAGE =
  "Impossible de poursuivre avec ces informations. Si tu possèdes déjà un compte, essaie de te connecter. Sinon, tu peux créer un compte.";

export const GOOGLE_AUTH_REGISTER_EXISTS_ERROR =
  "Cette adresse Google est déjà enregistrée sur Zadesk.";

export const GOOGLE_AUTH_LOGIN_NOT_FOUND_ERROR =
  "Aucun compte n'est encore associé à cette adresse Google.";

export async function googleAuthApi(
  credential: string,
  mode: "login" | "register" = "login"
): Promise<AuthResponse> {
  return (await apiRequest<UserProfile>("/auth/google", {
    method: "POST",
    body: JSON.stringify({ credential, mode }),
  })) as AuthResponse;
}

export async function logoutApi(): Promise<{ success: boolean; message?: string }> {
  return apiRequest("/auth/logout", {
    method: "POST",
  });
}

export async function getMeApi(): Promise<MeResponse> {
  try {
    const res = await fetch("/api/auth/me", {
      credentials: "include",
    });
    if (!res.ok) {
      return { authenticated: false };
    }
    return await res.json();
  } catch (err) {
    return { authenticated: false };
  }
}

export async function fetchGoogleClientId(): Promise<string> {
  if (process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) {
    return process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  }
  try {
    const res = await fetch("/api/auth/google/config", { credentials: "include" });
    if (res.ok) {
      const data = await res.json();
      return data.clientId || "";
    }
  } catch (err) {
    // ignore
  }
  return "";
}

export async function fetchTurnstileSiteKey(): Promise<string> {
  if (process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY) {
    return process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  }
  try {
    const res = await fetch("/api/auth/turnstile/config", { credentials: "include" });
    if (res.ok) {
      const data = await res.json();
      return data.siteKey || "";
    }
  } catch (err) {
    // ignore
  }
  // In dev / localhost: default to Cloudflare dummy test key
  if (typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")) {
    return "1x00000000000000000000AA";
  }
  return "";
}

