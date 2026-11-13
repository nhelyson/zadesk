import { env } from "../config/env.js";
import { logger } from "../utils/logger.js";

/**
 * Erreur spécifique levée lors d'un dépassement de quota (HTTP 429).
 */
export class RateLimitError extends Error {
  constructor(message = "Quota Zavu atteint", retryAfterMs = 60000) {
    super(message);
    this.name = "RateLimitError";
    this.status = 429;
    this.retryAfterMs = retryAfterMs;
  }
}

/**
 * Extrait et parse le délai de réessai depuis l'en-tête HTTP Retry-After.
 * @param {Response} response
 * @returns {number} Délai en millisecondes
 */
export function parseRetryAfter(response) {
  const header = response?.headers?.get?.("retry-after");
  if (!header) return 60000;
  const parsedSeconds = parseInt(header, 10);
  if (!isNaN(parsedSeconds) && parsedSeconds > 0) {
    return parsedSeconds * 1000;
  }
  const parsedDate = Date.parse(header);
  if (!isNaN(parsedDate) && parsedDate > Date.now()) {
    return parsedDate - Date.now();
  }
  return 60000;
}

/**
 * Mask email for secure logging (e.g. jo***@domain.com)
 */
export function maskEmail(email) {
  if (!email || typeof email !== "string") return "***";
  const [local, domain] = email.split("@");
  if (!domain) return "***";
  const maskedLocal = local.length <= 2 ? local : `${local.slice(0, 2)}***`;
  return `${maskedLocal}@${domain}`;
}

/**
 * Send an OTP verification email using Zavu REST API
 * Endpoint: POST https://api.zavu.dev/v1/messages
 */
export async function sendOtpEmail({ to, otpCode, purpose = "LOGIN", firstName = "" }) {
  if (!to || !otpCode) {
    throw new Error("L'adresse email et le code OTP sont obligatoires pour l'envoi.");
  }

  const expirationMinutes = env.OTP_EXPIRATION_MINUTES || 15;
  const greeting = firstName ? `Bonjour ${firstName},` : "Bonjour,";
  
  let subject = "Votre code de vérification Zadesk";
  if (purpose === "REGISTRATION") {
    subject = "Confirmez votre inscription sur Zadesk";
  } else if (purpose === "PASSWORD_RESET") {
    subject = "Réinitialisation de votre mot de passe Zadesk";
  }

  const textBody = `${greeting}\n\nVotre code de vérification Zadesk est :\n\n${otpCode}\n\nCe code expire dans ${expirationMinutes} minutes.\n\nSi vous n'êtes pas à l'origine de cette demande, ignorez simplement cet email.\n\nL'équipe Zadesk\nhttps://zadesk.com`;

  logger.info(`[OTP] Sending email to ${maskEmail(to)} (${purpose})`);

  // En environnement de test automatisé, simuler l'envoi pour préserver le quota Zavu
  if (process.env.NODE_ENV === "test") {
    if (to.includes("simulate-429")) {
      return {
        success: false,
        status: 429,
        temporary: true,
        retryAfterMs: 30000,
        error: "Quota Zavu atteint (Simulation HTTP 429)",
      };
    }
    logger.info(`[ZAVU:TEST] Envoi OTP simulé en suite de test (${maskEmail(to)})`);
    return {
      success: true,
      status: 200,
      data: { simulated: true, devCode: otpCode },
    };
  }

  if (!env.ZAVUDEV_API_KEY) {
    logger.warn("[ZAVU] ZAVU_API_KEY: missing");
    return {
      success: false,
      status: 500,
      temporary: true,
      error: "Clé API Zavu non configurée.",
    };
  }

  logger.info("[ZAVU] ZAVU_API_KEY: configured");
  logger.info("[ZAVU] Request initiated");

  try {
    const senderId = env.ZAVU_SENDER_ID || "kd7a0za0kdsrc381rvnfp3nszd8ds0c6";

    const payload = {
      to,
      channel: "email",
      subject,
      text: textBody,
    };

    const headers = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${env.ZAVUDEV_API_KEY}`,
      "Zavu-Sender": senderId,
    };

    const response = await fetch("https://api.zavu.dev/v1/messages", {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });

    logger.info(`[ZAVU] Response status: ${response.status}`);

    const isSuccess = response.ok || response.status === 200 || response.status === 201 || response.status === 202;

    if (!isSuccess) {
      const errorJson = await response.json().catch(() => ({}));
      const errorMsg = errorJson.message || `HTTP ${response.status}`;
      logger.error(`[ZAVU] Email request failed (HTTP ${response.status}): ${errorMsg}`);

      if (response.status === 429) {
        const retryAfterMs = parseRetryAfter(response);
        logger.warn(`[ZAVU:QUOTA] Quota d'emails Zavu atteint (HTTP 429). Retry-After: ${retryAfterMs}ms`);
        return {
          success: false,
          status: 429,
          temporary: true,
          retryAfterMs,
          error: `Quota d'envoi atteint (HTTP 429)`,
        };
      }

      const isTemporary = response.status >= 500;
      return {
        success: false,
        status: response.status,
        temporary: isTemporary,
        error: `Erreur du service d'email (${errorMsg})`,
      };
    }

    const result = await response.json().catch(() => ({}));
    logger.info("[OTP] Email successfully accepted by Zavu");
    return {
      success: true,
      status: response.status,
      data: result,
    };
  } catch (error) {
    logger.error(`[ZAVU] Network error during communication: ${error.message}`);
    return {
      success: false,
      status: 500,
      temporary: true,
      error: "Erreur de connexion avec le service d'envoi d'email.",
    };
  }
}

/**
 * Send a Workspace invitation email using Zavu REST API
 * Endpoint: POST https://api.zavu.dev/v1/messages
 */
export async function sendInvitationEmail({
  to,
  inviterName = "Un administrateur",
  workspaceName = "Zadesk",
  inviteLink,
  role = "AGENT",
}) {
  if (!to || !inviteLink) {
    throw new Error("L'adresse email et le lien d'invitation sont obligatoires.");
  }

  const subject = `Invitation à rejoindre l'espace « ${workspaceName} » sur Zadesk`;
  const textBody = `Bonjour,\n\n${inviterName} vous invite à rejoindre l'espace « ${workspaceName} » sur Zadesk en tant que ${role}.\n\nPour accepter cette invitation et configurer votre accès, veuillez cliquer sur le lien suivant :\n\n${inviteLink}\n\nCe lien est sécurisé et valable pour une durée limitée.\n\nSi vous ne vous attendiez pas à cette invitation, vous pouvez ignorer cet email.\n\nL'équipe Zadesk\nhttps://zadesk.com`;

  logger.info(`[Invitation] Sending email to ${maskEmail(to)} for workspace "${workspaceName}"`);

  // En environnement de test automatisé, simulation déterministe
  if (process.env.NODE_ENV === "test") {
    if (to.includes("simulate-429")) {
      const retryAfterMs = 45000;
      return {
        success: false,
        status: 429,
        temporary: true,
        retryAfterMs,
        error: "Quota Zavu atteint (Simulation HTTP 429)",
      };
    }
    if (to.includes("simulate-500")) {
      return {
        success: false,
        status: 500,
        temporary: true,
        error: "Erreur serveur Zavu (Simulation HTTP 500)",
      };
    }
    if (to.includes("simulate-400")) {
      return {
        success: false,
        status: 400,
        temporary: false,
        error: "Requête invalide Zavu (Simulation HTTP 400)",
      };
    }
    logger.info(`[ZAVU:TEST] Envoi invitation simulé en suite de test (${maskEmail(to)})`);
    return {
      success: true,
      status: 200,
      data: { simulated: true },
    };
  }

  if (!env.ZAVUDEV_API_KEY) {
    logger.warn("[ZAVU] ZAVU_API_KEY: missing");
    return {
      success: false,
      status: 500,
      temporary: true,
      error: "Clé API Zavu non configurée.",
    };
  }

  try {
    const senderId = env.ZAVU_SENDER_ID || "kd7a0za0kdsrc381rvnfp3nszd8ds0c6";

    const payload = {
      to,
      channel: "email",
      subject,
      text: textBody,
    };

    const headers = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${env.ZAVUDEV_API_KEY}`,
      "Zavu-Sender": senderId,
    };

    const response = await fetch("https://api.zavu.dev/v1/messages", {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });

    logger.info(`[ZAVU] Invitation response status: ${response.status}`);

    const isSuccess = response.ok || response.status === 200 || response.status === 201 || response.status === 202;

    if (!isSuccess) {
      const errorJson = await response.json().catch(() => ({}));
      const errorMsg = errorJson.message || `HTTP ${response.status}`;
      logger.error(`[ZAVU] Invitation email request failed (HTTP ${response.status}): ${errorMsg}`);

      if (response.status === 429) {
        const retryAfterMs = parseRetryAfter(response);
        logger.warn(`[ZAVU:QUOTA] Quota d'emails Zavu atteint (HTTP 429). Retry-After: ${retryAfterMs}ms`);
        return {
          success: false,
          status: 429,
          temporary: true,
          retryAfterMs,
          error: "Quota Zavu atteint (HTTP 429)",
        };
      }

      const isTemporary = response.status >= 500;
      return {
        success: false,
        status: response.status,
        temporary: isTemporary,
        error: `Erreur du service d'email (${errorMsg})`,
      };
    }

    const result = await response.json().catch(() => ({}));
    logger.info("[Invitation] Email successfully accepted by Zavu");
    return {
      success: true,
      status: response.status,
      data: result,
    };
  } catch (error) {
    logger.error(`[ZAVU] Network error during invitation email: ${error.message}`);
    return {
      success: false,
      status: 500,
      temporary: true,
      error: "Erreur de connexion avec le service d'envoi d'email.",
    };
  }
}
