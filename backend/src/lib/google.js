import { OAuth2Client } from "google-auth-library";
import { env } from "../config/env.js";

const client = new OAuth2Client(env.GOOGLE_CLIENT_ID);

/**
 * Verify Google ID Token server-side
 * @param {string} idToken 
 * @returns {Promise<{ sub: string, email: string, email_verified?: boolean, given_name?: string, family_name?: string, name?: string, picture?: string }>}
 */
export async function verifyGoogleIdToken(idToken) {
  if (!idToken) {
    throw new Error("Token Google manquant.");
  }

  if (!env.GOOGLE_CLIENT_ID) {
    throw new Error("GOOGLE_CLIENT_ID non configuré sur le serveur.");
  }

  const ticket = await client.verifyIdToken({
    idToken,
    audience: env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();

  if (!payload || !payload.sub) {
    throw new Error("Payload de token Google invalide.");
  }

  return {
    sub: payload.sub,
    email: (payload.email || "").toLowerCase().trim(),
    email_verified: Boolean(payload.email_verified),
    given_name: payload.given_name || payload.name?.split(" ")[0] || "",
    family_name: payload.family_name || payload.name?.split(" ").slice(1).join(" ") || "",
    name: payload.name || "",
    picture: payload.picture || null,
  };
}
