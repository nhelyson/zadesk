import {
  getWorkspaceWhatsAppConnection,
  connectWorkspaceWhatsApp,
  disconnectWorkspaceWhatsApp,
} from "../services/whatsappService.js";
import { sendSuccess, sendError } from "../utils/response.js";

/**
 * Get WhatsApp Business configuration and connection status for a workspace
 */
export async function getWhatsApp(req, res, next) {
  try {
    const { workspaceId } = req.params;
    const whatsappData = await getWorkspaceWhatsAppConnection(workspaceId);
    return sendSuccess(res, whatsappData);
  } catch (error) {
    next(error);
  }
}

/**
 * Connect WhatsApp Business to a workspace using Meta Embedded Signup code
 */
export async function connectWhatsApp(req, res, next) {
  try {
    const { workspaceId } = req.params;
    const { code, wabaId, phoneNumberId } = req.body;

    if (!code) {
      return sendError(res, "Le code d'autorisation Meta est manquant.", 400);
    }

    const connection = await connectWorkspaceWhatsApp(workspaceId, {
      code,
      wabaId,
      phoneNumberId,
    });

    return sendSuccess(
      res,
      { connection, isConnected: true },
      "WhatsApp Business connecté avec succès à votre organisation !",
      200
    );
  } catch (error) {
    return sendError(
      res,
      error.message || "Impossible de connecter le compte WhatsApp Business.",
      400
    );
  }
}

/**
 * Disconnect WhatsApp Business from a workspace
 */
export async function disconnectWhatsApp(req, res, next) {
  try {
    const { workspaceId } = req.params;
    const result = await disconnectWorkspaceWhatsApp(workspaceId);
    return sendSuccess(res, result, "WhatsApp Business a été déconnecté de Zadesk.");
  } catch (error) {
    return sendError(
      res,
      error.message || "Impossible de déconnecter WhatsApp Business.",
      400
    );
  }
}
