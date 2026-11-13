import { prisma } from "../lib/prisma.js";
import { cacheService } from "../cache/cacheService.js";
import { env } from "../config/env.js";

const GRAPH_BASE_URL = "https://graph.facebook.com";

/**
 * Exchange OAuth authorization code with Meta Graph API for an access token
 */
export async function exchangeMetaOAuthCode(code) {
  if (!env.META_APP_ID || !env.META_APP_SECRET) {
    throw new Error(
      "Configuration Meta manquante sur le serveur (META_APP_ID ou META_APP_SECRET non configuré)."
    );
  }

  const url = new URL(`${GRAPH_BASE_URL}/${env.META_API_VERSION}/oauth/access_token`);
  url.searchParams.set("client_id", env.META_APP_ID);
  url.searchParams.set("client_secret", env.META_APP_SECRET);
  url.searchParams.set("code", code);

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  const data = await response.json();

  if (!response.ok || data.error) {
    const errorMsg = data.error?.message || "Échec de l'échange de token Meta.";
    throw new Error(`Erreur Meta API: ${errorMsg}`);
  }

  return {
    accessToken: data.access_token,
    tokenType: data.token_type,
    expiresIn: data.expires_in,
  };
}

/**
 * Fetch phone number details from Meta Graph API
 */
export async function fetchPhoneNumberDetails(phoneNumberId, accessToken) {
  const url = new URL(`${GRAPH_BASE_URL}/${env.META_API_VERSION}/${phoneNumberId}`);
  url.searchParams.set(
    "fields",
    "id,verified_name,display_phone_number,quality_rating,code_verification_status,name_status"
  );
  url.searchParams.set("access_token", accessToken);

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  const data = await response.json();

  if (!response.ok || data.error) {
    const errorMsg = data.error?.message || "Impossible de récupérer les détails du numéro WhatsApp.";
    throw new Error(`Erreur Meta API (Numéro): ${errorMsg}`);
  }

  return {
    phoneNumberId: data.id,
    displayPhoneNumber: data.display_phone_number || "",
    verifiedName: data.verified_name || "",
    qualityRating: data.quality_rating,
    codeVerificationStatus: data.code_verification_status,
  };
}

/**
 * Fetch phone numbers associated with a WABA ID from Meta Graph API
 */
export async function fetchWabaPhoneNumbers(wabaId, accessToken) {
  const url = new URL(`${GRAPH_BASE_URL}/${env.META_API_VERSION}/${wabaId}/phone_numbers`);
  url.searchParams.set(
    "fields",
    "id,verified_name,display_phone_number,quality_rating,code_verification_status"
  );
  url.searchParams.set("access_token", accessToken);

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  const data = await response.json();

  if (!response.ok || data.error) {
    const errorMsg = data.error?.message || "Impossible de récupérer les numéros du compte WABA.";
    throw new Error(`Erreur Meta API (WABA): ${errorMsg}`);
  }

  return data.data || [];
}

/**
 * Get the active WhatsApp connection for a workspace (Strictly sanitized, no tokens exposed)
 */
export async function getWorkspaceWhatsAppConnection(workspaceId) {
  const cacheKey = `workspace:${workspaceId}:whatsapp_connection`;

  return cacheService.wrap(
    cacheKey,
    async () => {
      const connection = await prisma.whatsAppConnection.findUnique({
        where: { workspaceId },
        select: {
          id: true,
          workspaceId: true,
          wabaId: true,
          phoneNumberId: true,
          displayPhoneNumber: true,
          verifiedName: true,
          status: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!connection || connection.status !== "CONNECTED") {
        return {
          isConnected: false,
          connection: null,
          metaAppId: env.META_APP_ID || "",
          metaConfigId: env.META_CONFIG_ID || "",
        };
      }

      return {
        isConnected: true,
        connection,
        metaAppId: env.META_APP_ID || "",
        metaConfigId: env.META_CONFIG_ID || "",
      };
    },
    60 // Cache for 60 seconds
  );
}

/**
 * Connect/Register a WhatsApp Business account to a workspace
 */
export async function connectWorkspaceWhatsApp(workspaceId, { code, wabaId, phoneNumberId }) {
  if (!code) {
    throw new Error("Le code d'autorisation Meta est requis pour lier le compte.");
  }

  // 1. Server-to-server token exchange with Meta
  const { accessToken } = await exchangeMetaOAuthCode(code);

  let resolvedPhoneNumberId = phoneNumberId;
  let resolvedWabaId = wabaId;
  let displayPhoneNumber = "";
  let verifiedName = "";

  // 2. If phoneNumberId was provided, fetch details directly
  if (resolvedPhoneNumberId) {
    const phoneDetails = await fetchPhoneNumberDetails(resolvedPhoneNumberId, accessToken);
    displayPhoneNumber = phoneDetails.displayPhoneNumber;
    verifiedName = phoneDetails.verifiedName;
  } else if (resolvedWabaId) {
    // If only WABA ID was provided, discover associated phone numbers
    const numbers = await fetchWabaPhoneNumbers(resolvedWabaId, accessToken);
    if (numbers && numbers.length > 0) {
      resolvedPhoneNumberId = numbers[0].id;
      displayPhoneNumber = numbers[0].display_phone_number || "";
      verifiedName = numbers[0].verified_name || "";
    }
  }

  if (!resolvedPhoneNumberId || !resolvedWabaId) {
    throw new Error(
      "Impossible d'identifier le numéro ou le compte WhatsApp Business à associer."
    );
  }

  // 3. Multi-tenant security check: Ensure this phone number is not bound to another active workspace
  const existingOtherConnection = await prisma.whatsAppConnection.findFirst({
    where: {
      phoneNumberId: resolvedPhoneNumberId,
      workspaceId: { not: workspaceId },
      status: "CONNECTED",
    },
    include: {
      workspace: { select: { name: true } },
    },
  });

  if (existingOtherConnection) {
    throw new Error(
      `Ce numéro WhatsApp est déjà associé à l'organisation "${existingOtherConnection.workspace.name}". Veuillez d'abord le déconnecter de l'autre espace.`
    );
  }

  // 4. Save or update the WhatsAppConnection for this workspace
  const connection = await prisma.whatsAppConnection.upsert({
    where: { workspaceId },
    create: {
      workspaceId,
      wabaId: resolvedWabaId,
      phoneNumberId: resolvedPhoneNumberId,
      displayPhoneNumber: displayPhoneNumber || "Numéro WhatsApp",
      verifiedName: verifiedName || null,
      accessToken,
      status: "CONNECTED",
    },
    update: {
      wabaId: resolvedWabaId,
      phoneNumberId: resolvedPhoneNumberId,
      displayPhoneNumber: displayPhoneNumber || "Numéro WhatsApp",
      verifiedName: verifiedName || null,
      accessToken,
      status: "CONNECTED",
    },
    select: {
      id: true,
      workspaceId: true,
      wabaId: true,
      phoneNumberId: true,
      displayPhoneNumber: true,
      verifiedName: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  // 5. Invalidate caches
  await cacheService.del(`workspace:${workspaceId}:whatsapp_connection`);
  await cacheService.del(`workspace:${workspaceId}:whatsapp`);

  return connection;
}

/**
 * Disconnect WhatsApp Business from a workspace (Local association removed only)
 */
export async function disconnectWorkspaceWhatsApp(workspaceId) {
  const existing = await prisma.whatsAppConnection.findUnique({
    where: { workspaceId },
  });

  if (!existing) {
    throw new Error("Aucune connexion WhatsApp active trouvée pour cette organisation.");
  }

  // Remove the connection record
  await prisma.whatsAppConnection.delete({
    where: { workspaceId },
  });

  // Invalidate caches
  await cacheService.del(`workspace:${workspaceId}:whatsapp_connection`);
  await cacheService.del(`workspace:${workspaceId}:whatsapp`);

  return { success: true, message: "WhatsApp Business déconnecté avec succès de Zadesk." };
}
