import { 
  registerUser, 
  loginUser, 
  finalizeAuthWithOtp, 
  resendAuthOtp, 
  authenticateWithGoogle, 
  logoutUser 
} from "../services/authService.js";
import { setSessionCookie, clearSessionCookie } from "../services/sessionService.js";
import { formatPublicUser, successResponse } from "../utils/response.js";
import { env } from "../config/env.js";

/**
 * Register step 1: Validate input, create unverified user, send OTP
 */
export async function register(req, res, next) {
  try {
    const { firstName, lastName, email, password } = req.body;
    const result = await registerUser({
      firstName,
      lastName,
      email,
      password,
    });

    return successResponse(
      res,
      {
        requiresOtp: true,
        tempToken: result.tempToken,
        email: result.email,
        purpose: result.purpose,
        message: "Compte pré-créé. Un code de vérification à 6 chiffres a été envoyé à votre adresse email.",
      },
      200
    );
  } catch (error) {
    next(error);
  }
}

/**
 * Login step 1: Validate credentials, send OTP
 */
export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const result = await loginUser({
      email,
      password,
    });

    return successResponse(res, {
      requiresOtp: true,
      tempToken: result.tempToken,
      email: result.email,
      purpose: result.purpose,
      message: "Identifiants valides. Un code de vérification à 6 chiffres a été envoyé à votre adresse email.",
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Step 2: Verify OTP and establish definitive session
 */
export async function verifyOtp(req, res, next) {
  try {
    const { tempToken, otp, purpose } = req.body;
    const { user, sessionToken, expiresAt } = await finalizeAuthWithOtp({
      tempToken,
      otp,
      purpose,
    });

    // Set definitive HttpOnly session cookie
    setSessionCookie(res, sessionToken, expiresAt);

    return successResponse(res, {
      message: "Authentification réussie.",
      user: formatPublicUser(user),
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Resend OTP code
 */
export async function resendOtp(req, res, next) {
  try {
    const { tempToken, purpose } = req.body;
    const result = await resendAuthOtp({
      tempToken,
      purpose,
    });

    return successResponse(res, {
      message: "Un nouveau code de vérification a été envoyé par email.",
      tempToken: result.tempToken,
      expiresAt: result.expiresAt,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Google OAuth Direct Login/Register
 */
export async function googleAuth(req, res, next) {
  try {
    const { credential } = req.body;
    const { user, sessionToken, expiresAt } = await authenticateWithGoogle(credential);

    setSessionCookie(res, sessionToken, expiresAt);

    return successResponse(res, {
      message: "Authentification Google réussie.",
      user: formatPublicUser(user),
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Logout
 */
export async function logout(req, res, next) {
  try {
    const sessionToken = req.sessionToken;
    if (sessionToken) {
      await logoutUser(sessionToken);
    }

    clearSessionCookie(res);

    return successResponse(res, {
      message: "Déconnexion réussie.",
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get current session user profile
 */
export async function me(req, res, next) {
  try {
    if (!req.user) {
      return res.status(200).json({
        authenticated: false,
      });
    }

    return res.status(200).json({
      authenticated: true,
      user: formatPublicUser(req.user),
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Public Google Client ID endpoint
 */
export async function getGoogleConfig(req, res) {
  return res.status(200).json({
    clientId: env.GOOGLE_CLIENT_ID || "",
  });
}
