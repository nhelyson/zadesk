import { findUserByEmail, findUserByGoogleId, createUser, linkGoogleAccount } from "./userService.js";
import { createSession, revokeSession } from "./sessionService.js";
import { 
  createAndSendRegistrationOtp, 
  verifyRegistrationOtp, 
  resendRegistrationOtp,
  createAndSendLoginOtp,
  verifyLoginOtp,
  resendLoginOtp
} from "./otpService.js";
import { hashPassword, verifyPassword } from "../lib/password.js";
import { verifyGoogleIdToken } from "../lib/google.js";
import { logger } from "../utils/logger.js";

export const NEUTRAL_AUTH_ERROR_MESSAGE =
  "Impossible de poursuivre avec ces informations. Si tu possèdes déjà un compte, essaie de te connecter. Sinon, tu peux créer un compte.";

export class AuthError extends Error {
  constructor(message, statusCode = 400, code = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
  }
}

/**
 * Step 1: Register a new user and initiate OTP verification with temporary pending registration
 */
export async function registerUser({ firstName, lastName, email, password }) {
  const normalizedEmail = email.toLowerCase().trim();

  // Check if active account already exists in users table
  const existingUser = await findUserByEmail(normalizedEmail);
  if (existingUser) {
    throw new AuthError(
      "Un compte existe déjà avec cette adresse email. Connectez-vous plutôt.",
      409,
      "ACCOUNT_ALREADY_EXISTS"
    );
  }

  // Hash password securely (never stored in plain text)
  const passwordHash = await hashPassword(password);

  // Generate and send registration OTP, stored in pending_registrations
  const otpResult = await createAndSendRegistrationOtp({
    firstName,
    lastName,
    email: normalizedEmail,
    passwordHash,
  });

  return {
    requiresOtp: true,
    tempToken: otpResult.tempToken,
    email: otpResult.email,
    purpose: "REGISTRATION",
    message: "Un code de vérification à 6 chiffres a été envoyé à votre adresse email.",
    devCode: otpResult.devCode,
  };
}

/**
 * Step 1: Validate email & password and initiate OTP verification for existing account
 */
export async function loginUser({ email, password }) {
  const normalizedEmail = email.toLowerCase().trim();

  const user = await findUserByEmail(normalizedEmail);

  // If user registered only via Google (has googleId but no password)
  if (user && !user.passwordHash && user.googleId) {
    throw new AuthError(
      "Ce compte a été créé avec Google. Veuillez vous connecter en utilisant 'Continuer avec Google'.",
      400,
      "GOOGLE_ACCOUNT_NO_PASSWORD"
    );
  }

  // If user does not exist or has no password set
  if (!user || !user.passwordHash) {
    throw new AuthError("Identifiants incorrects. Veuillez vérifier votre email et mot de passe.", 401, "INVALID_CREDENTIALS");
  }

  const isPasswordValid = await verifyPassword(password, user.passwordHash);
  if (!isPasswordValid) {
    throw new AuthError("Identifiants incorrects. Veuillez vérifier votre email et mot de passe.", 401, "INVALID_CREDENTIALS");
  }

  logger.info(`Identifiants vérifiés pour ${user.id}, envoi du code OTP.`);

  // Generate and send login OTP
  const otpResult = await createAndSendLoginOtp({ user });

  return {
    requiresOtp: true,
    tempToken: otpResult.tempToken,
    email: user.email,
    purpose: "LOGIN",
    message: "Identifiants valides. Un code de vérification à 6 chiffres a été envoyé à votre adresse email.",
    devCode: otpResult.devCode,
  };
}

/**
 * Step 2: Finalize authentication by verifying OTP and issuing definitive session
 */
export async function finalizeAuthWithOtp({ tempToken, otp, purpose }) {
  let user;

  if (purpose === "REGISTRATION") {
    const result = await verifyRegistrationOtp({ tempToken, otp });
    user = result.user;
  } else {
    const result = await verifyLoginOtp({ tempToken, otp });
    user = result.user;
  }

  // Create definitive session in database
  const { sessionToken, expiresAt } = await createSession(user.id);

  logger.info(`Session définitive créée avec succès pour l'utilisateur: ${user.id}`);

  return {
    user,
    sessionToken,
    expiresAt,
  };
}

/**
 * Resend OTP code
 */
export async function resendAuthOtp({ tempToken, purpose }) {
  if (purpose === "REGISTRATION") {
    return resendRegistrationOtp({ tempToken });
  }
  return resendLoginOtp({ tempToken });
}

/**
 * Authenticate with Google Identity Services ID Token (Direct OAuth session)
 * @param {string} credential - Google ID Token
 * @param {"login" | "register"} mode - Authentication intent mode
 */
export async function authenticateWithGoogle(credential, mode = "login") {
  let googleData;
  try {
    googleData = await verifyGoogleIdToken(credential);
  } catch (err) {
    logger.warn(`Échec de validation du token Google: ${err.message}`);
    throw new AuthError("Jeton d'authentification Google invalide ou expiré.", 401);
  }

  const { sub, email, given_name, family_name, picture, email_verified } = googleData;

  // Strict Security Policy: Never accept unverified Google emails for authentication or linking
  if (!email_verified) {
    logger.warn(`Tentative d'authentification Google rejetée : adresse email non vérifiée (${email})`);
    throw new AuthError(
      "Cette adresse email n'est pas vérifiée par Google. Veuillez valider votre email sur Google avant de continuer.",
      403
    );
  }

  const cleanEmail = email.toLowerCase().trim();

  // 1. Check if user already exists with this googleId
  let existingUser = await findUserByGoogleId(sub);

  // 2. If not found by googleId, check if user exists with this email (Account Linking Policy)
  if (!existingUser) {
    existingUser = await findUserByEmail(cleanEmail);
  }

  // -------------------------------------------------------------
  // A. INTENTION D'INSCRIPTION (/register)
  // -------------------------------------------------------------
  if (mode === "register") {
    // Si un compte existe déjà avec cette identité Google ou cette adresse e-mail : REFUSER !
    if (existingUser) {
      logger.info(`Tentative d'inscription Google rejetée : un compte existe déjà pour ${cleanEmail} (ID: ${existingUser.id})`);
      throw new AuthError(
        NEUTRAL_AUTH_ERROR_MESSAGE,
        409,
        "ACCOUNT_ALREADY_EXISTS"
      );
    }

    // Création d'un nouvel utilisateur uniquement
    const user = await createUser({
      firstName: given_name || "Utilisateur",
      lastName: family_name || "",
      email: cleanEmail,
      googleId: sub,
      avatarUrl: picture,
      emailVerified: true,
      passwordHash: null,
    });
    logger.info(`Nouvel utilisateur créé via Google (/register): ${user.id} (${cleanEmail})`);

    const { sessionToken, expiresAt } = await createSession(user.id);
    return { user, sessionToken, expiresAt, isNewUser: true };
  }

  // -------------------------------------------------------------
  // B. INTENTION DE CONNEXION (/login)
  // -------------------------------------------------------------
  if (mode === "login") {
    // Si aucun compte n'est trouvé : REFUSER la connexion (orienter vers l'inscription)
    if (!existingUser) {
      logger.info(`Tentative de connexion Google rejetée : aucun compte trouvé pour ${cleanEmail}`);
      throw new AuthError(
        NEUTRAL_AUTH_ERROR_MESSAGE,
        409,
        "USER_NOT_FOUND"
      );
    }

    let user = existingUser;

    // Securely attach or refresh googleId if missing or mismatched
    if (!user.googleId || user.googleId !== sub) {
      user = await linkGoogleAccount(user.id, {
        googleId: sub,
        avatarUrl: user.avatarUrl || picture,
        emailVerified: true,
      });
      logger.info(`Compte Google (${sub}) lié avec succès à l'utilisateur existant (/login): ${user.id} (${cleanEmail})`);
    } else {
      logger.info(`Connexion Google directe réussie pour l'utilisateur existant (/login): ${user.id}`);
    }

    // Create session for the real user identity
    const { sessionToken, expiresAt } = await createSession(user.id);
    return { user, sessionToken, expiresAt, isNewUser: false };
  }

  throw new AuthError("Mode d'authentification invalide.", 400, "INVALID_AUTH_MODE");
}

/**
 * Logout and revoke session
 */
export async function logoutUser(sessionToken) {
  if (sessionToken) {
    await revokeSession(sessionToken);
  }
}
