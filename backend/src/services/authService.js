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

export class AuthError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
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
    throw new AuthError("Un compte existe déjà avec cette adresse email.", 409);
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
  };
}

/**
 * Step 1: Validate email & password and initiate OTP verification for existing account
 */
export async function loginUser({ email, password }) {
  const normalizedEmail = email.toLowerCase().trim();

  const user = await findUserByEmail(normalizedEmail);

  // If user does not exist or has no password set (e.g. Google-only account)
  if (!user || !user.passwordHash) {
    throw new AuthError("Identifiants incorrects. Veuillez vérifier votre email et mot de passe.", 401);
  }

  const isPasswordValid = await verifyPassword(password, user.passwordHash);
  if (!isPasswordValid) {
    throw new AuthError("Identifiants incorrects. Veuillez vérifier votre email et mot de passe.", 401);
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
 */
export async function authenticateWithGoogle(credential) {
  let googleData;
  try {
    googleData = await verifyGoogleIdToken(credential);
  } catch (err) {
    logger.warn(`Échec de validation du token Google: ${err.message}`);
    throw new AuthError("Jeton d'authentification Google invalide ou expiré.", 401);
  }

  const { sub, email, given_name, family_name, picture, email_verified } = googleData;

  // 1. Check if user already exists with this googleId
  let user = await findUserByGoogleId(sub);

  if (user) {
    logger.info(`Connexion Google pour l'utilisateur existant: ${user.id}`);
  } else {
    // 2. Check if user exists with this email
    const existingByEmail = await findUserByEmail(email);

    if (existingByEmail) {
      // Safe linking: Google has verified this email address
      if (email_verified) {
        user = await linkGoogleAccount(existingByEmail.id, {
          googleId: sub,
          avatarUrl: existingByEmail.avatarUrl || picture,
          emailVerified: true,
        });
        logger.info(`Compte Google lié à l'utilisateur existant: ${user.id}`);
      } else {
        throw new AuthError("L'adresse email Google n'est pas vérifiée.", 400);
      }
    } else {
      // 3. Create a brand new user from Google profile
      user = await createUser({
        firstName: given_name || "Utilisateur",
        lastName: family_name || "",
        email,
        googleId: sub,
        avatarUrl: picture,
        emailVerified: Boolean(email_verified),
        passwordHash: null,
      });
      logger.info(`Nouvel utilisateur créé via Google: ${user.id}`);
    }
  }

  // Create session
  const { sessionToken, expiresAt } = await createSession(user.id);

  return { user, sessionToken, expiresAt };
}

/**
 * Logout and revoke session
 */
export async function logoutUser(sessionToken) {
  if (sessionToken) {
    await revokeSession(sessionToken);
  }
}
