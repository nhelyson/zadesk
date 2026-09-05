import { env } from "../config/env.js";
import { logger } from "../utils/logger.js";

/**
 * Mask email for secure logging (e.g. jo***@domain.com)
 */
function maskEmail(email) {
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

  if (!env.ZAVUDEV_API_KEY) {
    logger.warn("[ZAVU] ZAVU_API_KEY: missing");
    return {
      success: false,
      status: 500,
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
      return {
        success: false,
        status: response.status,
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
      error: "Erreur de connexion avec le service d'envoi d'email.",
    };
  }
}
