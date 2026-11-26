import crypto from "crypto";
import { env } from "../config/env.js";
import { logger } from "../utils/logger.js";
import { prisma } from "../lib/prisma.js";
import { mintVerifiedPaymentProof } from "../security/financialVerificationGateway.js";
import { confirmPaymentAndApplyUpgrade } from "./commercialService.js";

/**
 * SASPAY CLIENT SERVICE (Phase D.2 - Official OpenAPI & Skill Specification)
 * 
 * Invariants:
 * 1. Server-side only: API keys are strictly kept server-side (Bearer sk_test_... or sk_live_...).
 * 2. Amounts: strictly decimal strings formatted to 2 decimals (e.g. "10000.00"), never floating point numbers.
 * 3. Idempotency: Idempotency-Key sent for payments, payouts and retries.
 * 4. Verification: Only final 'SUCCESS' permits subscription activation.
 * 5. Webhook HMAC: HMAC-SHA256 on `${timestamp}.${rawBody}` verified in constant time with 300s window.
 * 6. Supported Country & Currency: Congo-Brazzaville (CG) with Central African Franc (XAF).
 */

export class SasPayError extends Error {
  constructor(message, { statusCode = 500, code = "SASPAY_ERROR", details = null, rawResponse = null } = {}) {
    super(message);
    this.name = "SasPayError";
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.rawResponse = rawResponse;
  }
}

/**
 * Format positive integer amount in XAF to decimal string (e.g. 10000 -> "10000.00")
 */
export function formatSasPayAmount(amountXaf) {
  if (typeof amountXaf !== "number" || !Number.isInteger(amountXaf) || amountXaf <= 0) {
    throw new SasPayError(`Montant invalide: ${amountXaf}. Le montant doit être un entier positif en FCFA.`, {
      statusCode: 400,
      code: "INVALID_AMOUNT",
    });
  }
  return `${amountXaf}.00`;
}

/**
 * Parse decimal string returned by SasPay to integer amount in XAF
 */
export function parseSasPayAmount(amountStr) {
  if (typeof amountStr === "number") return Math.round(amountStr);
  if (!amountStr || typeof amountStr !== "string") return 0;
  const parsed = parseFloat(amountStr);
  return Math.round(parsed);
}

/**
 * Executes an HTTP request against SasPay REST API
 */
async function callSasPayApi(endpoint, {
  method = "GET",
  body = null,
  idempotencyKey = null,
  apiKey = null,
} = {}) {
  const resolvedApiKey = apiKey || env.SASPAY_API_KEY;
  if (!resolvedApiKey) {
    throw new SasPayError("Clé API SasPay non configurée (SASPAY_API_KEY).", {
      statusCode: 500,
      code: "SASPAY_API_KEY_MISSING",
    });
  }

  const baseUrl = (env.SASPAY_API_BASE_URL || "https://api.saspay.me/api/v1").replace(/\/+$/, "");
  const normalizedEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const url = `${baseUrl}${normalizedEndpoint}`;

  const headers = {
    "Authorization": `Bearer ${resolvedApiKey}`,
    "Content-Type": "application/json",
    "Accept": "application/json",
  };

  if (idempotencyKey) {
    headers["Idempotency-Key"] = String(idempotencyKey);
  }

  const options = {
    method,
    headers,
  };

  if (body && ["POST", "PUT", "PATCH"].includes(method.toUpperCase())) {
    options.body = typeof body === "string" ? body : JSON.stringify(body);
  }

  try {
    const response = await fetch(url, options);
    const contentType = response.headers.get("content-type") || "";
    let data = null;

    if (contentType.includes("application/json")) {
      data = await response.json();
    } else {
      const text = await response.text();
      try {
        data = JSON.parse(text);
      } catch {
        data = { message: text };
      }
    }

    if (!response.ok) {
      const status = response.status;
      let errorCode = "SASPAY_API_ERROR";
      let errorMessage = `Erreur SasPay (${status})`;

      if (data && data.error) {
        if (typeof data.error === "string") {
          errorMessage = data.error;
        } else if (data.error.message) {
          errorMessage = data.error.message;
          errorCode = data.error.code || errorCode;
        } else if (data.error.detail) {
          errorMessage = data.error.detail;
        }
      } else if (data && data.message) {
        errorMessage = data.message;
      }

      // Handle specific HTTP statuses per SasPay Skill Section 7
      if (status === 400) errorCode = "SASPAY_BAD_REQUEST";
      else if (status === 401) errorCode = "SASPAY_UNAUTHORIZED";
      else if (status === 403) errorCode = "SASPAY_FORBIDDEN";
      else if (status === 404) errorCode = "SASPAY_NOT_FOUND";
      else if (status === 409) errorCode = "SASPAY_CONFLICT";
      else if (status === 410) errorCode = "SASPAY_GONE";
      else if (status === 422) errorCode = "SASPAY_UNPROCESSABLE";
      else if (status === 429) errorCode = "SASPAY_RATE_LIMIT_EXCEEDED";

      throw new SasPayError(errorMessage, {
        statusCode: status,
        code: errorCode,
        details: data,
        rawResponse: data,
      });
    }

    return data;
  } catch (err) {
    if (err instanceof SasPayError) throw err;
    throw new SasPayError(`Échec de communication réseau avec SasPay: ${err.message}`, {
      statusCode: 502,
      code: "SASPAY_NETWORK_ERROR",
      details: err,
    });
  }
}

/**
 * 1. Create a Hosted Checkout Session (POST /checkout-sessions/)
 * Recommended universal flow for Zadesk subscriptions in Congo (XAF)
 */
export async function createCheckoutSession({
  intentId,
  workspaceId,
  amountXaf,
  customerEmail,
  customerName,
  customerPhone = "",
  description = "Abonnement Zadesk",
  returnUrl = null,
  metadata = {},
  feeChargeMode = "ADD_ON",
  expiresAt = null,
}) {
  const formattedAmount = formatSasPayAmount(amountXaf);
  const defaultReturnUrl = returnUrl || `${env.APP_URL}/app/billing?session_id={CHECKOUT_SESSION_ID}`;

  const payload = {
    amount: formattedAmount,
    currency: "XAF",
    country: "CG",
    customer_email: customerEmail,
    customer_name: customerName,
    description: description.slice(0, 255),
    return_url: defaultReturnUrl,
    metadata: {
      intentId,
      workspaceId,
      source: "ZADESK_BILLING_PORTAL",
      ...metadata,
    },
    fee_charge_mode: feeChargeMode,
  };

  if (customerPhone && typeof customerPhone === "string" && customerPhone.trim()) {
    payload.customer_phone = customerPhone.trim();
  }

  if (expiresAt) {
    payload.expires_at = new Date(expiresAt).toISOString();
  }

  const idempotencyKey = `zadesk_checkout_${intentId}_${amountXaf}`;

  const res = await callSasPayApi("/checkout-sessions/", {
    method: "POST",
    body: payload,
    idempotencyKey,
  });

  const sessionData = res.data || res;
  return {
    sessionId: sessionData.id,
    slug: sessionData.slug,
    checkoutUrl: sessionData.checkout_url,
    status: sessionData.status || "PENDING",
    expiresAt: sessionData.expires_at,
    raw: sessionData,
  };
}

/**
 * 2. Get status of a Checkout Session (GET /checkout-sessions/{id}/status/)
 */
export async function getCheckoutSessionStatus(sessionId) {
  if (!sessionId || typeof sessionId !== "string") {
    throw new SasPayError("L'identifiant de session est requis.", { statusCode: 400, code: "INVALID_SESSION_ID" });
  }

  const res = await callSasPayApi(`/checkout-sessions/${encodeURIComponent(sessionId)}/status/`, {
    method: "GET",
  });

  const data = res.data || res;
  return {
    id: data.id,
    slug: data.slug,
    status: data.status, // e.g. "PENDING", "PAID", "EXPIRED", "CANCELLED"
    transactionId: data.transaction_id || null,
    transactionStatus: data.transaction_status || null,
    transactionReference: data.transaction_reference || null,
    raw: data,
  };
}

/**
 * 3. Cancel a Checkout Session (POST /checkout-sessions/{id}/cancel/)
 */
export async function cancelCheckoutSession(sessionId) {
  if (!sessionId || typeof sessionId !== "string") {
    throw new SasPayError("L'identifiant de session est requis.", { statusCode: 400, code: "INVALID_SESSION_ID" });
  }

  const res = await callSasPayApi(`/checkout-sessions/${encodeURIComponent(sessionId)}/cancel/`, {
    method: "POST",
  });

  return res.data || res;
}

/**
 * 4. Verify a Payment Transaction (GET /payments/{payment_id}/verify/)
 * Official endpoint to confirm final transaction status before delivery
 */
export async function verifyPayment(paymentId) {
  if (!paymentId || typeof paymentId !== "string") {
    throw new SasPayError("L'identifiant de transaction (paymentId) est requis.", {
      statusCode: 400,
      code: "INVALID_PAYMENT_ID",
    });
  }

  const res = await callSasPayApi(`/payments/${encodeURIComponent(paymentId)}/verify/`, {
    method: "GET",
  });

  const tx = res.data || res;
  return {
    id: tx.id,
    reference: tx.reference,
    externalReference: tx.external_reference || null,
    status: tx.status, // e.g. "SUCCESS", "PENDING", "FAILED"
    requestedAmount: tx.requested_amount,
    debitedAmount: tx.debited_amount,
    netAmount: tx.net_amount,
    amountXaf: parseSasPayAmount(tx.requested_amount),
    netAmountXaf: parseSasPayAmount(tx.net_amount),
    currency: tx.currency,
    description: tx.description,
    paymentMethod: tx.network || tx.transaction_type || "MOBILE_MONEY",
    createdAt: tx.created_at,
    updatedAt: tx.updated_at,
    raw: tx,
  };
}

/**
 * 5. Direct Softpay Payment (POST /payments/softpay/)
 * For direct Mobile Money push when country and network are known
 */
export async function initiateSoftpayPayment({
  intentId,
  workspaceId,
  amountXaf,
  customer,
  network,
  description = "Abonnement Zadesk",
  metadata = {},
  feeChargeMode = "ADD_ON",
}) {
  const formattedAmount = formatSasPayAmount(amountXaf);

  if (!customer || !customer.email || !customer.phone || !customer.first_name || !customer.last_name) {
    throw new SasPayError("Les informations complètes du client (email, phone, first_name, last_name) sont requises.", {
      statusCode: 400,
      code: "INVALID_CUSTOMER_DATA",
    });
  }

  if (!network || typeof network !== "string") {
    throw new SasPayError("Le réseau Mobile Money (network) est requis pour un paiement direct.", {
      statusCode: 400,
      code: "INVALID_NETWORK",
    });
  }

  const payload = {
    amount: formattedAmount,
    currency: "XAF",
    country: "CG",
    network,
    description: description.slice(0, 255),
    customer: {
      email: customer.email,
      first_name: customer.first_name,
      last_name: customer.last_name,
      phone: customer.phone,
    },
    metadata: {
      intentId,
      workspaceId,
      source: "ZADESK_SOFTPAY",
      ...metadata,
    },
    fee_charge_mode: feeChargeMode,
  };

  const idempotencyKey = `zadesk_softpay_${intentId}_${amountXaf}`;

  const res = await callSasPayApi("/payments/softpay/", {
    method: "POST",
    body: payload,
    idempotencyKey,
  });

  const data = res.data || res;
  return {
    paymentId: data.id,
    status: data.status || "PENDING",
    checkoutUrl: data.checkout_url || null,
    raw: data,
  };
}

/**
 * 6. Cryptographic Webhook Verification (HMAC-SHA256)
 * Strict implementation of SasPay Skill Section 6:
 * - Signature: HMAC-SHA256 hex digest of `${timestamp}.${rawBody}`
 * - Timestamp tolerance: <= 300 seconds
 * - Constant-time comparison
 */
export function verifyWebhookSignature({
  rawBody,
  signature,
  timestamp,
  secret = null,
}) {
  const signingSecret = secret || env.SASPAY_WEBHOOK_SECRET;
  if (!signingSecret) {
    logger.warn("[SasPay:Webhook] Secret de webhook non configuré (SASPAY_WEBHOOK_SECRET).");
    return { valid: false, reason: "WEBHOOK_SECRET_NOT_CONFIGURED" };
  }

  if (!signature || typeof signature !== "string") {
    return { valid: false, reason: "MISSING_SIGNATURE" };
  }

  if (!timestamp) {
    return { valid: false, reason: "MISSING_TIMESTAMP" };
  }

  const numericTimestamp = parseInt(timestamp, 10);
  if (isNaN(numericTimestamp)) {
    return { valid: false, reason: "INVALID_TIMESTAMP_FORMAT" };
  }

  // 300 seconds maximum clock skew window
  const currentUnixSeconds = Math.floor(Date.now() / 1000);
  const timeDifference = Math.abs(currentUnixSeconds - numericTimestamp);
  if (timeDifference > 300) {
    return { valid: false, reason: `TIMESTAMP_OUT_OF_BOUNDS: skew was ${timeDifference}s (max 300s)` };
  }

  // Prepare signed payload buffer
  const rawBodyBuffer = Buffer.isBuffer(rawBody)
    ? rawBody
    : Buffer.from(typeof rawBody === "string" ? rawBody : JSON.stringify(rawBody || {}), "utf8");

  const prefixBuffer = Buffer.from(`${timestamp}.`, "utf8");
  const fullPayloadBuffer = Buffer.concat([prefixBuffer, rawBodyBuffer]);

  const expectedSignatureHex = crypto
    .createHmac("sha256", signingSecret)
    .update(fullPayloadBuffer)
    .digest("hex")
    .toLowerCase();

  const cleanSignature = signature.trim().toLowerCase();

  if (cleanSignature.length !== expectedSignatureHex.length) {
    return { valid: false, reason: "SIGNATURE_LENGTH_MISMATCH" };
  }

  const isMatch = crypto.timingSafeEqual(
    Buffer.from(cleanSignature, "utf8"),
    Buffer.from(expectedSignatureHex, "utf8")
  );

  if (!isMatch) {
    return { valid: false, reason: "SIGNATURE_MISMATCH" };
  }

  return { valid: true };
}

/**
 * 7. Active Server-Side Session Verification & Confirmation
 * Queries SasPay GET /checkout-sessions/{id}/status/ and GET /payments/{payment_id}/verify/
 * If confirmed SUCCESS, mints a financial proof via the gateway and activates the subscription.
 */
export async function verifyAndConfirmPaymentSession({
  userId,
  workspaceId,
  sessionId,
}) {
  if (!sessionId || typeof sessionId !== "string") {
    throw new SasPayError("L'identifiant de session est requis.", { statusCode: 400, code: "INVALID_SESSION_ID" });
  }

  // 1. Fetch current session status from SasPay
  const session = await getCheckoutSessionStatus(sessionId);

  // Find corresponding payment attempt in database
  const attempt = await prisma.paymentAttempt.findFirst({
    where: {
      providerSessionId: sessionId,
      workspaceId,
    },
    include: {
      intent: true,
    },
  });

  if (!attempt || !attempt.intent) {
    throw new SasPayError("Aucune tentative de paiement locale associée à cette session.", {
      statusCode: 404,
      code: "ATTEMPT_NOT_FOUND",
    });
  }

  const intent = attempt.intent;

  // If already confirmed in DB, return idempotent success
  if (intent.status === "COMPLETED" || attempt.status === "PAYMENT_CONFIRMED") {
    const currentSub = await prisma.subscription.findUnique({ where: { workspaceId } });
    return {
      success: true,
      status: "PAID",
      alreadyApplied: true,
      plan: currentSub?.plan || intent.targetPlan,
      version: currentSub?.version || 1,
    };
  }

  // 2. Check if SasPay marks session as PAID
  if (session.status !== "PAID" && session.transactionStatus !== "SUCCESS") {
    return {
      success: false,
      status: session.status || "PENDING",
      transactionStatus: session.transactionStatus || "PENDING",
      message: "Le paiement est en cours de traitement ou n'a pas encore été finalisé sur SasPay.",
    };
  }

  // 3. Obtain verified payment details
  const transactionId = session.transactionId || attempt.providerSessionId;
  const verifiedTx = await verifyPayment(transactionId);

  if (verifiedTx.status !== "SUCCESS") {
    return {
      success: false,
      status: verifiedTx.status,
      message: `Statut de transaction non finalisé chez SasPay : ${verifiedTx.status}`,
    };
  }

  if (verifiedTx.currency !== "XAF") {
    throw new SasPayError(`Devise non conforme: ${verifiedTx.currency}. Seul le XAF est supporté.`, {
      statusCode: 400,
      code: "INVALID_CURRENCY",
    });
  }

  // 4. Mint verified financial proof capability token
  const financialProof = mintVerifiedPaymentProof({
    intentId: intent.id,
    workspaceId,
    providerTransactionId: verifiedTx.id,
    amountXaf: intent.priceXaf,
    paymentStatus: "SUCCESS",
    currency: "XAF",
    provider: "SASPAY",
    providerReference: verifiedTx.reference || null,
    paymentMethod: verifiedTx.paymentMethod || "SASPAY_CHECKOUT",
    rawPayload: { session, verifiedTx },
  });

  // 5. Execute atomic transaction & anti-replay confirmation
  const confirmResult = await confirmPaymentAndApplyUpgrade(userId, {
    workspaceId,
    intentId: intent.id,
    financialProof,
  });

  // 6. Update local attempt status
  await prisma.paymentAttempt.update({
    where: { id: attempt.id },
    data: {
      status: "PAYMENT_CONFIRMED",
    },
  });

  logger.info(`[SasPay:ActiveVerify] Session ${sessionId} vérifiée avec succès. Workspace ${workspaceId} activé en ${confirmResult.newPlan}.`);

  return {
    success: true,
    status: "PAID",
    plan: confirmResult.newPlan,
    version: confirmResult.newVersion,
  };
}

