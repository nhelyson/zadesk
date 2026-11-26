import crypto from "crypto";
import { generateVAPIDKeys, setVapidDetails, sendNotification } from "web-push";
import { prisma } from "../lib/prisma.js";
import { env } from "../config/env.js";
import { logger } from "../utils/logger.js";

let cachedVapidKeys = null;
let vapidInitPromise = null;

/**
 * Resolve VAPID keys from environment or persist/retrieve them in SystemSetting
 * so Web Push works seamlessly out-of-the-box without manual .env edits.
 */
export async function ensureVapidKeys() {
  if (cachedVapidKeys) {
    return cachedVapidKeys;
  }

  if (vapidInitPromise) {
    return vapidInitPromise;
  }

  vapidInitPromise = (async () => {
    let publicKey = env.VAPID_PUBLIC_KEY?.trim();
    let privateKey = env.VAPID_PRIVATE_KEY?.trim();

    if (!publicKey || !privateKey) {
      try {
        const stored = await prisma.systemSetting.findUnique({
          where: { key: "vapid_keys" },
        });
        if (stored?.value) {
          const parsed = JSON.parse(stored.value);
          if (parsed?.publicKey && parsed?.privateKey) {
            publicKey = parsed.publicKey;
            privateKey = parsed.privateKey;
          }
        }
      } catch (err) {
        logger.warn(`[WebPush] Impossible de lire vapid_keys en base: ${err.message}`);
      }
    }

    if (!publicKey || !privateKey) {
      const generated = generateVAPIDKeys();
      publicKey = generated.publicKey;
      privateKey = generated.privateKey;
      try {
        await prisma.systemSetting.upsert({
          where: { key: "vapid_keys" },
          update: { value: JSON.stringify({ publicKey, privateKey }) },
          create: {
            key: "vapid_keys",
            value: JSON.stringify({ publicKey, privateKey }),
          },
        });
        logger.info("[WebPush] Paire de clés VAPID générée et persistée automatiquement.");
      } catch (err) {
        logger.warn(`[WebPush] Clés VAPID générées en mémoire uniquement: ${err.message}`);
      }
    }

    setVapidDetails(env.VAPID_SUBJECT || "mailto:support@zalisk.com", publicKey, privateKey);
    cachedVapidKeys = { publicKey, privateKey };
    return cachedVapidKeys;
  })();

  try {
    return await vapidInitPromise;
  } finally {
    vapidInitPromise = null;
  }
}

export async function getPublicVapidKey() {
  const { publicKey } = await ensureVapidKeys();
  return publicKey;
}

export function buildPushSubKey({ recipientType, workspaceId, userId, conversationId, endpoint }) {
  const scopeId = recipientType === "AGENT" ? userId : conversationId;
  const raw = `${recipientType}:${workspaceId}:${scopeId || "none"}:${endpoint}`;
  return crypto.createHash("sha256").update(raw).digest("hex");
}

export function validatePushSubscriptionPayload(subscription) {
  if (
    !subscription ||
    typeof subscription.endpoint !== "string" ||
    !subscription.endpoint.startsWith("https://") ||
    !subscription.keys ||
    typeof subscription.keys.p256dh !== "string" ||
    typeof subscription.keys.auth !== "string"
  ) {
    return false;
  }
  return true;
}

export async function upsertPushSubscription({
  recipientType,
  workspaceId,
  userId = null,
  conversationId = null,
  subscription,
  userAgent = null,
}) {
  if (!validatePushSubscriptionPayload(subscription)) {
    const err = new Error("Abonnement Web Push invalide (endpoint HTTPS et clés requis).");
    err.status = 400;
    throw err;
  }

  const endpoint = subscription.endpoint.trim();
  const subKey = buildPushSubKey({
    recipientType,
    workspaceId,
    userId,
    conversationId,
    endpoint,
  });

  return prisma.pushSubscription.upsert({
    where: { subKey },
    update: {
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
      userAgent: userAgent ? String(userAgent).slice(0, 255) : null,
      updatedAt: new Date(),
    },
    create: {
      subKey,
      recipientType,
      workspaceId,
      userId,
      conversationId,
      endpoint,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
      userAgent: userAgent ? String(userAgent).slice(0, 255) : null,
    },
  });
}

export async function removePushSubscription({
  recipientType,
  workspaceId,
  userId = null,
  conversationId = null,
  endpoint,
}) {
  if (!endpoint) return { count: 0 };
  const subKey = buildPushSubKey({
    recipientType,
    workspaceId,
    userId,
    conversationId,
    endpoint: endpoint.trim(),
  });
  return prisma.pushSubscription.deleteMany({
    where: { subKey },
  });
}

/**
 * Deliver a Web Push payload to a list of stored subscriptions.
 * Automatically purges expired/unsubscribed endpoints (HTTP 404/410).
 */
export async function sendWebPushToSubscriptions(subscriptions, payload) {
  if (!Array.isArray(subscriptions) || subscriptions.length === 0) {
    return { sent: 0, failed: 0, removed: 0 };
  }

  await ensureVapidKeys();
  const bodyString = JSON.stringify(payload);

  let sent = 0;
  let failed = 0;
  const expiredIds = [];

  await Promise.allSettled(
    subscriptions.map(async (sub) => {
      try {
        await sendNotification(
          {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.p256dh,
              auth: sub.auth,
            },
          },
          bodyString,
          { TTL: 3600 }
        );
        sent += 1;
      } catch (err) {
        failed += 1;
        const statusCode = err?.statusCode;
        if (statusCode === 404 || statusCode === 410) {
          expiredIds.push(sub.id);
        } else {
          logger.warn(`[WebPush] Échec envoi (${statusCode || "ERR"}): ${err.message}`);
        }
      }
    })
  );

  if (expiredIds.length > 0) {
    await prisma.pushSubscription
      .deleteMany({ where: { id: { in: expiredIds } } })
      .catch(() => {});
  }

  return { sent, failed, removed: expiredIds.length };
}
