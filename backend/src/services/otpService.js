import crypto from "crypto";
import { prisma } from "../lib/prisma.js";
import { env } from "../config/env.js";
import { sendOtpEmail } from "./zavuService.js";
import { logger } from "../utils/logger.js";
import { AuthError } from "./authService.js";

/**
 * Generate a cryptographically secure 6-digit numeric OTP
 */
export function generateOtpCode() {
  logger.info("[OTP] Generating OTP");
  return crypto.randomInt(100000, 1000000).toString();
}

/**
 * Securely hash the OTP with an identifier (email or userId) and application secret
 */
export function hashOtp(code, identifier) {
  return crypto
    .createHash("sha256")
    .update(`${code}:${identifier}:${env.SESSION_SECRET}`)
    .digest("hex");
}

/**
 * Generate a signed temporary challenge token for the 2-step OTP flow (valid 15 minutes)
 */
export function generateTempToken(identifier, email, purpose) {
  const payload = {
    identifier,
    email,
    purpose,
    timestamp: Date.now(),
  };

  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", env.SESSION_SECRET)
    .update(payloadB64)
    .digest("base64url");

  return `${payloadB64}.${signature}`;
}

/**
 * Verify and parse a signed temporary challenge token
 */
export function verifyTempToken(tempToken, expectedPurpose = null) {
  if (!tempToken || typeof tempToken !== "string") {
    throw new AuthError("Session de vérification invalide ou manquante.", 400);
  }

  const parts = tempToken.split(".");
  if (parts.length !== 2) {
    throw new AuthError("Jeton de vérification malformé.", 400);
  }

  const [payloadB64, signature] = parts;
  const expectedSignature = crypto
    .createHmac("sha256", env.SESSION_SECRET)
    .update(payloadB64)
    .digest("base64url");

  const sigBuffer = Buffer.from(signature);
  const expBuffer = Buffer.from(expectedSignature);

  if (sigBuffer.length !== expBuffer.length || !crypto.timingSafeEqual(sigBuffer, expBuffer)) {
    throw new AuthError("Jeton de vérification altéré ou invalide.", 400);
  }

  let payload;
  try {
    payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf-8"));
  } catch (err) {
    throw new AuthError("Jeton de vérification illisible.", 400);
  }

  // Token valid for 15 minutes
  const MAX_TEMP_TOKEN_AGE_MS = 15 * 60 * 1000;
  if (Date.now() - payload.timestamp > MAX_TEMP_TOKEN_AGE_MS) {
    throw new AuthError("La session de vérification a expiré. Veuillez recommencer.", 401);
  }

  if (expectedPurpose && payload.purpose !== expectedPurpose) {
    throw new AuthError("Contexte de vérification incompatible.", 400);
  }

  return payload;
}

/**
 * Cleanup expired pending registrations and old OTP tokens
 */
export async function cleanupExpiredRegistrations() {
  try {
    const now = new Date();
    const deletedPending = await prisma.pendingRegistration.deleteMany({
      where: { expiresAt: { lt: now } },
    });
    const deletedOtp = await prisma.otpToken.deleteMany({
      where: { expiresAt: { lt: now } },
    });

    if (deletedPending.count > 0 || deletedOtp.count > 0) {
      logger.info(`[CLEANUP] Nettoyage effectué: ${deletedPending.count} inscription(s) temporaire(s) expirée(s), ${deletedOtp.count} token(s) OTP expiré(s).`);
    }
  } catch (err) {
    logger.warn(`[CLEANUP] Erreur lors du nettoyage automatique: ${err.message}`);
  }
}

// -------------------------------------------------------------
// REGISTRATION OTP FLOW (Temporary Pending Registrations)
// -------------------------------------------------------------

/**
 * Initiate Registration: Generate OTP, send email, and store in pending_registrations
 */
export async function createAndSendRegistrationOtp({ firstName, lastName, email, passwordHash }) {
  const expirationMinutes = env.OTP_EXPIRATION_MINUTES || 15;
  const maxAttempts = env.OTP_MAX_ATTEMPTS || 5;
  const cooldownSeconds = env.OTP_RESEND_COOLDOWN_SECONDS || 60;
  const normalizedEmail = email.toLowerCase().trim();

  // Run cleanup of expired records
  cleanupExpiredRegistrations().catch(() => {});

  // Check if a recent pending registration exists and enforce cooldown
  const existingPending = await prisma.pendingRegistration.findUnique({
    where: { email: normalizedEmail },
  });

  if (existingPending) {
    const elapsedSeconds = (Date.now() - new Date(existingPending.updatedAt).getTime()) / 1000;
    if (elapsedSeconds < cooldownSeconds && new Date() < existingPending.expiresAt) {
      const waitTime = Math.ceil(cooldownSeconds - elapsedSeconds);
      throw new AuthError(`Veuillez patienter ${waitTime} seconde(s) avant de demander un nouveau code.`, 429);
    }
  }

  // 1. Generate new 6-digit code
  const otpCode = generateOtpCode();
  const otpHash = hashOtp(otpCode, normalizedEmail);
  const expiresAt = new Date(Date.now() + expirationMinutes * 60 * 1000);

  // 2. Dispatch email via Zavu
  const emailRes = await sendOtpEmail({
    to: normalizedEmail,
    otpCode,
    purpose: "REGISTRATION",
    firstName,
  });

  if (!emailRes.success) {
    throw new AuthError(
      emailRes.error || "Impossible d'envoyer l'email de vérification. Veuillez vérifier votre adresse email ou réessayer plus tard.",
      502
    );
  }

  // 3. Upsert temporary pending registration
  await prisma.pendingRegistration.upsert({
    where: { email: normalizedEmail },
    create: {
      email: normalizedEmail,
      firstName,
      lastName,
      passwordHash,
      otpHash,
      attempts: 0,
      maxAttempts,
      expiresAt,
    },
    update: {
      firstName,
      lastName,
      passwordHash,
      otpHash,
      attempts: 0,
      maxAttempts,
      expiresAt,
      updatedAt: new Date(),
    },
  });

  // 4. Generate signed challenge token
  const tempToken = generateTempToken(normalizedEmail, normalizedEmail, "REGISTRATION");

  logger.info(`[OTP] Inscription temporaire créée et email OTP accepté pour ${normalizedEmail}`);

  return {
    tempToken,
    email: normalizedEmail,
    purpose: "REGISTRATION",
    expiresAt,
  };
}

/**
 * Verify Registration OTP: Validate code, create definitive user in DB, and clean up pending_registration
 */
export async function verifyRegistrationOtp({ tempToken, otp }) {
  const { email } = verifyTempToken(tempToken, "REGISTRATION");
  const normalizedEmail = email.toLowerCase().trim();

  const cleanOtp = String(otp || "").trim();
  if (!/^\d{6}$/.test(cleanOtp)) {
    throw new AuthError("Le code de vérification doit comporter exactement 6 chiffres.", 400);
  }

  // Find active pending registration
  const pendingReg = await prisma.pendingRegistration.findUnique({
    where: { email: normalizedEmail },
  });

  if (!pendingReg) {
    throw new AuthError("Session d'inscription introuvable ou expirée. Veuillez recommencer votre inscription.", 400);
  }

  // Check expiration
  if (new Date() > pendingReg.expiresAt) {
    await prisma.pendingRegistration.delete({ where: { id: pendingReg.id } }).catch(() => {});
    throw new AuthError("Ce code de vérification a expiré. Veuillez recommencer votre inscription.", 400);
  }

  // Check attempts limit
  if (pendingReg.attempts >= pendingReg.maxAttempts) {
    await prisma.pendingRegistration.delete({ where: { id: pendingReg.id } }).catch(() => {});
    throw new AuthError("Nombre maximal de tentatives dépassé. Veuillez recommencer votre inscription.", 429);
  }

  // Compare hashes using constant-time equality
  const submittedHash = hashOtp(cleanOtp, normalizedEmail);
  const isMatch = crypto.timingSafeEqual(
    Buffer.from(submittedHash),
    Buffer.from(pendingReg.otpHash)
  );

  if (!isMatch) {
    const updatedAttempts = pendingReg.attempts + 1;
    if (updatedAttempts >= pendingReg.maxAttempts) {
      await prisma.pendingRegistration.delete({ where: { id: pendingReg.id } }).catch(() => {});
      throw new AuthError("Code incorrect. Nombre maximal d'essais atteint, veuillez recommencer votre inscription.", 429);
    } else {
      await prisma.pendingRegistration.update({
        where: { id: pendingReg.id },
        data: { attempts: updatedAttempts },
      });
      throw new AuthError("Code de vérification incorrect.", 400);
    }
  }

  // Double check if a user was created in parallel
  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  let user;
  if (existingUser) {
    user = existingUser;
  } else {
    // Create definitive verified user
    user = await prisma.user.create({
      data: {
        firstName: pendingReg.firstName,
        lastName: pendingReg.lastName,
        email: pendingReg.email,
        passwordHash: pendingReg.passwordHash,
        emailVerified: true,
      },
      include: {
        memberships: {
          include: {
            workspace: true,
          },
        },
      },
    });
  }

  // Delete the pending registration record (no incomplete data remains in database)
  await prisma.pendingRegistration.delete({
    where: { id: pendingReg.id },
  }).catch(() => {});

  logger.info(`[AUTH] Compte définitif créé avec succès pour ${user.id} (${normalizedEmail})`);

  return { user };
}

/**
 * Resend Registration OTP
 */
export async function resendRegistrationOtp({ tempToken }) {
  const { email } = verifyTempToken(tempToken, "REGISTRATION");
  const normalizedEmail = email.toLowerCase().trim();
  const cooldownSeconds = env.OTP_RESEND_COOLDOWN_SECONDS || 60;
  const expirationMinutes = env.OTP_EXPIRATION_MINUTES || 15;

  const pendingReg = await prisma.pendingRegistration.findUnique({
    where: { email: normalizedEmail },
  });

  if (!pendingReg) {
    throw new AuthError("Session d'inscription expirée. Veuillez recommencer votre inscription.", 400);
  }

  // Check cooldown
  const elapsedSeconds = (Date.now() - new Date(pendingReg.updatedAt).getTime()) / 1000;
  if (elapsedSeconds < cooldownSeconds) {
    const waitTime = Math.ceil(cooldownSeconds - elapsedSeconds);
    throw new AuthError(`Veuillez patienter ${waitTime} seconde(s) avant de demander un nouveau code.`, 429);
  }

  // Generate new OTP
  const otpCode = generateOtpCode();
  const otpHash = hashOtp(otpCode, normalizedEmail);
  const expiresAt = new Date(Date.now() + expirationMinutes * 60 * 1000);

  // Send email via Zavu
  const emailRes = await sendOtpEmail({
    to: normalizedEmail,
    otpCode,
    purpose: "REGISTRATION",
    firstName: pendingReg.firstName,
  });

  if (!emailRes.success) {
    throw new AuthError(
      emailRes.error || "Impossible d'envoyer le code par email. Veuillez réessayer.",
      502
    );
  }

  // Update pending registration
  await prisma.pendingRegistration.update({
    where: { id: pendingReg.id },
    data: {
      otpHash,
      attempts: 0,
      expiresAt,
      updatedAt: new Date(),
    },
  });

  const newTempToken = generateTempToken(normalizedEmail, normalizedEmail, "REGISTRATION");

  return {
    tempToken: newTempToken,
    email: normalizedEmail,
    purpose: "REGISTRATION",
    expiresAt,
  };
}

// -------------------------------------------------------------
// LOGIN OTP FLOW (Existing Verified Accounts)
// -------------------------------------------------------------

/**
 * Create and send OTP for existing user Login
 */
export async function createAndSendLoginOtp({ user }) {
  const expirationMinutes = env.OTP_EXPIRATION_MINUTES || 15;
  const maxAttempts = env.OTP_MAX_ATTEMPTS || 5;

  // 1. Invalidate any existing unverified OTPs for this user and purpose
  await prisma.otpToken.deleteMany({
    where: {
      userId: user.id,
      purpose: "LOGIN",
      verifiedAt: null,
    },
  });

  // 2. Generate new 6-digit code
  const otpCode = generateOtpCode();
  const otpHash = hashOtp(otpCode, user.id);
  const expiresAt = new Date(Date.now() + expirationMinutes * 60 * 1000);

  // 3. Dispatch email via Zavu
  const emailRes = await sendOtpEmail({
    to: user.email,
    otpCode,
    purpose: "LOGIN",
    firstName: user.firstName,
  });

  if (!emailRes.success) {
    throw new AuthError(
      emailRes.error || "Impossible d'envoyer l'email de vérification. Veuillez réessayer plus tard.",
      502
    );
  }

  // 4. Save hashed OTP in database
  await prisma.otpToken.create({
    data: {
      userId: user.id,
      otpHash,
      purpose: "LOGIN",
      attempts: 0,
      maxAttempts,
      expiresAt,
    },
  });

  // 5. Generate signed temporary challenge token
  const tempToken = generateTempToken(user.id, user.email, "LOGIN");

  logger.info(`[OTP] Code de connexion généré pour l'utilisateur ${user.id}`);

  return {
    tempToken,
    email: user.email,
    purpose: "LOGIN",
    expiresAt,
  };
}

/**
 * Verify Login OTP against database hash
 */
export async function verifyLoginOtp({ tempToken, otp }) {
  const { identifier: userId } = verifyTempToken(tempToken, "LOGIN");

  const cleanOtp = String(otp || "").trim();
  if (!/^\d{6}$/.test(cleanOtp)) {
    throw new AuthError("Le code de vérification doit comporter exactement 6 chiffres.", 400);
  }

  // Find active OTP token
  const activeOtp = await prisma.otpToken.findFirst({
    where: {
      userId,
      purpose: "LOGIN",
      verifiedAt: null,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (!activeOtp) {
    throw new AuthError("Aucun code actif trouvé. Veuillez en demander un nouveau.", 400);
  }

  // Check expiration
  if (new Date() > activeOtp.expiresAt) {
    await prisma.otpToken.delete({ where: { id: activeOtp.id } }).catch(() => {});
    throw new AuthError("Ce code de vérification a expiré. Veuillez en demander un nouveau.", 400);
  }

  // Check attempts limit
  if (activeOtp.attempts >= activeOtp.maxAttempts) {
    await prisma.otpToken.delete({ where: { id: activeOtp.id } }).catch(() => {});
    throw new AuthError("Nombre maximal de tentatives dépassé. Veuillez demander un nouveau code.", 429);
  }

  // Compare hashes using constant-time equality
  const submittedHash = hashOtp(cleanOtp, userId);
  const isMatch = crypto.timingSafeEqual(
    Buffer.from(submittedHash),
    Buffer.from(activeOtp.otpHash)
  );

  if (!isMatch) {
    const updatedAttempts = activeOtp.attempts + 1;
    if (updatedAttempts >= activeOtp.maxAttempts) {
      await prisma.otpToken.delete({ where: { id: activeOtp.id } }).catch(() => {});
      throw new AuthError("Code incorrect. Nombre maximal d'essais atteint, demandez un nouveau code.", 429);
    } else {
      await prisma.otpToken.update({
        where: { id: activeOtp.id },
        data: { attempts: updatedAttempts },
      });
      throw new AuthError("Code de vérification incorrect.", 400);
    }
  }

  // Delete used OTP token so it can never be reused
  await prisma.otpToken.delete({
    where: { id: activeOtp.id },
  }).catch(() => {});

  // Fetch verified user
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      memberships: {
        include: {
          workspace: true,
        },
      },
    },
  });

  if (!user) {
    throw new AuthError("Utilisateur introuvable.", 404);
  }

  logger.info(`[OTP] Code validé avec succès pour l'utilisateur ${userId}`);

  return { user };
}

/**
 * Resend Login OTP
 */
export async function resendLoginOtp({ tempToken }) {
  const { identifier: userId } = verifyTempToken(tempToken, "LOGIN");
  const cooldownSeconds = env.OTP_RESEND_COOLDOWN_SECONDS || 60;

  const lastOtp = await prisma.otpToken.findFirst({
    where: {
      userId,
      purpose: "LOGIN",
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (lastOtp) {
    const elapsedSeconds = (Date.now() - new Date(lastOtp.createdAt).getTime()) / 1000;
    if (elapsedSeconds < cooldownSeconds) {
      const waitTime = Math.ceil(cooldownSeconds - elapsedSeconds);
      throw new AuthError(`Veuillez patienter ${waitTime} seconde(s) avant de demander un nouveau code.`, 429);
    }
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new AuthError("Utilisateur introuvable.", 404);
  }

  return createAndSendLoginOtp({ user });
}

