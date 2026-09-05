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
  tempToken?: string;
  email?: string;
  purpose?: "REGISTRATION" | "LOGIN" | "EMAIL_VERIFICATION" | "PASSWORD_RESET";
}

export interface MeResponse {
  authenticated: boolean;
  user?: UserProfile;
}

export async function registerApi(data: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}): Promise<AuthResponse> {
  return (await apiRequest<UserProfile>("/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  })) as AuthResponse;
}

export async function loginApi(data: {
  email: string;
  password: string;
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
}): Promise<{ success: boolean; message?: string; tempToken?: string; expiresAt?: string }> {
  return apiRequest("/auth/resend-otp", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function googleAuthApi(credential: string): Promise<AuthResponse> {
  return (await apiRequest<UserProfile>("/auth/google", {
    method: "POST",
    body: JSON.stringify({ credential }),
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
