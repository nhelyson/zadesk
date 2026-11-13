import { OAuth2Client } from "google-auth-library";
import { env } from "../config/env.js";

/**
 * Verify Google ID Token server-side
 * @param {string} idToken 
 * @param {OAuth2Client} [customClient] - Optional injected client for testing cryptographic flow
 * @returns {Promise<{ sub: string, email: string, email_verified?: boolean, given_name?: string, family_name?: string, name?: string, picture?: string }>}
 */
export async function verifyGoogleIdToken(idToken, customClient = null) {
  if (!idToken || typeof idToken !== "string") {
    throw new Error("Token Google manquant ou invalide.");
  }

  // 1. Strict containment of simulated mock tokens to automated test environment (NODE_ENV === "test")
  if (process.env.NODE_ENV === "test" && idToken.startsWith("mock-google-token:")) {
    const parts = idToken.split(":");
    const sub = parts[1];
    const email = (parts[2] || "").toLowerCase().trim();
    const email_verified = parts[3] === "true";
    const given_name = parts[4] || "Test";
    const family_name = parts[5] || "User";
    return {
      sub,
      email,
      email_verified,
      given_name,
      family_name,
      name: `${given_name} ${family_name}`.trim(),
      picture: null,
    };
  }

  // 2. Security guard: mock tokens are categorically forbidden outside NODE_ENV === "test"
  if (idToken.startsWith("mock-google-token:")) {
    throw new Error("Les jetons Google simulés (mock) sont formellement interdits en dehors de l'environnement de test.");
  }

  // 3. Ensure GOOGLE_CLIENT_ID is properly configured
  const clientId = process.env.GOOGLE_CLIENT_ID !== undefined
    ? process.env.GOOGLE_CLIENT_ID
    : env.GOOGLE_CLIENT_ID;
  if (!clientId || clientId.trim() === "") {
    throw new Error("GOOGLE_CLIENT_ID non configuré sur le serveur.");
  }

  // 4. Cryptographic verification via official google-auth-library
  const client = customClient || new OAuth2Client(clientId);

  const ticket = await client.verifyIdToken({
    idToken,
    audience: clientId,
  });

  const payload = ticket.getPayload();

  // 5. Strict payload claims verification
  if (!payload || !payload.sub || typeof payload.sub !== "string") {
    throw new Error("Payload de token Google invalide : identifiant 'sub' manquant.");
  }

  if (!payload.email || typeof payload.email !== "string") {
    throw new Error("Payload de token Google invalide : adresse 'email' manquante.");
  }

  // Verify issuer (iss)
  const validIssuers = ["accounts.google.com", "https://accounts.google.com"];
  if (payload.iss && !validIssuers.includes(payload.iss)) {
    throw new Error(`Émetteur de jeton Google non reconnu: ${payload.iss}`);
  }

  // Verify audience (aud)
  if (payload.aud && payload.aud !== clientId) {
    throw new Error("L'audience du jeton ne correspond pas au client ID Zadesk.");
  }

  // Verify expiration (exp)
  if (payload.exp && payload.exp * 1000 < Date.now()) {
    throw new Error("Le jeton Google est expiré.");
  }

  // Explicit boolean check for email_verified
  const emailVerified = payload.email_verified === true || payload.email_verified === "true";

  return {
    sub: payload.sub,
    email: payload.email.toLowerCase().trim(),
    email_verified: emailVerified,
    given_name: payload.given_name || payload.name?.split(" ")[0] || "",
    family_name: payload.family_name || payload.name?.split(" ").slice(1).join(" ") || "",
    name: payload.name || "",
    picture: payload.picture || null,
  };
}
