import crypto from "crypto";
import {
  configureSecurityBootstrap,
  initializeGatewaySigner,
} from "./financialTrustAuthority.js";

/**
 * FINANCIAL VERIFICATION GATEWAY (Phase D.1.8 - Deterministic Composition Bootstrap)
 * 
 * Trusted internal gateway component authorized to mint financial proof capability tokens.
 * Separates external payment verification from the internal subscription confirmation engine.
 * 
 * Invariants:
 * 1. Synchronously configures and claims the signing capability with a single-use 256-bit token
 *    upon module bootstrap, invalidating the bootstrap capability immediately.
 * 2. Ordinary controllers, services, or workers cannot issue proofs directly.
 * 3. Enforces strict preliminary validation of payment parameters (status, amount, provider)
 *    prior to invoking the cryptographic signing authority.
 */

let signProof = null;

export function bootstrapSecurityGateway() {
  if (signProof) return signProof;

  // Single-use 256-bit entropy token generated and consumed in the same atomic synchronous tick
  const oneTimeToken = crypto.randomBytes(32).toString("hex");
  configureSecurityBootstrap(oneTimeToken);
  signProof = initializeGatewaySigner(oneTimeToken);
  return signProof;
}

// Automatically eager-initialize on module evaluation
bootstrapSecurityGateway();

function getSigner() {
  if (!signProof) {
    bootstrapSecurityGateway();
  }
  return signProof;
}

const APPROVED_FINAL_STATUSES = new Set(["SUCCESS", "PAID", "COMPLETED"]);

/**
 * Mint an authentic financial proof token following external verification of payment funds.
 * Validates payment parameters and rejects any non-final status, malformed transaction or invalid amount.
 */
export function mintVerifiedPaymentProof({
  intentId,
  workspaceId,
  providerTransactionId,
  amountXaf,
  paymentStatus = "SUCCESS",
  currency = "XAF",
  provider = "SASPAY",
  source = "SERVER_VERIFIED_GATEWAY",
  providerReference = null,
  paymentMethod = "MOBILE_MONEY",
  operatorReference = null,
  rawPayload = {},
  ttlMs = 5 * 60 * 1000,
}) {
  // 1. Mandatory identifiers check
  if (!intentId || typeof intentId !== "string" || !intentId.trim()) {
    const err = new Error("GATEWAY_INVALID_INTENT: intentId is mandatory.");
    err.statusCode = 400;
    err.code = "GATEWAY_INVALID_INTENT";
    throw err;
  }

  if (!workspaceId || typeof workspaceId !== "string" || !workspaceId.trim()) {
    const err = new Error("GATEWAY_INVALID_WORKSPACE: workspaceId is mandatory.");
    err.statusCode = 400;
    err.code = "GATEWAY_INVALID_WORKSPACE";
    throw err;
  }

  if (!providerTransactionId || typeof providerTransactionId !== "string" || !providerTransactionId.trim()) {
    const err = new Error("GATEWAY_INVALID_TRANSACTION_ID: providerTransactionId is mandatory.");
    err.statusCode = 400;
    err.code = "GATEWAY_INVALID_TRANSACTION_ID";
    throw err;
  }

  // 2. Final payment status check
  const normalizedStatus = String(paymentStatus || "").toUpperCase().trim();
  if (!APPROVED_FINAL_STATUSES.has(normalizedStatus)) {
    const err = new Error(`SECURITY_PAYMENT_STATUS_NOT_FINAL: Payment status '${paymentStatus}' is not an approved final state.`);
    err.statusCode = 400;
    err.code = "SECURITY_PAYMENT_STATUS_NOT_FINAL";
    throw err;
  }

  // 3. Amount integrity check
  if (typeof amountXaf !== "number" || !Number.isInteger(amountXaf) || amountXaf <= 0) {
    const err = new Error(`SECURITY_INVALID_AMOUNT: amountXaf must be a positive integer.`);
    err.statusCode = 400;
    err.code = "SECURITY_INVALID_AMOUNT";
    throw err;
  }

  // 4. Currency and provider checks
  if (currency !== "XAF") {
    const err = new Error(`SECURITY_INVALID_CURRENCY: Currency '${currency}' is not supported. Only XAF is allowed.`);
    err.statusCode = 400;
    err.code = "SECURITY_INVALID_CURRENCY";
    throw err;
  }

  if (provider !== "SASPAY") {
    const err = new Error(`SECURITY_INVALID_PROVIDER: Provider '${provider}' is not supported.`);
    err.statusCode = 400;
    err.code = "SECURITY_INVALID_PROVIDER";
    throw err;
  }

  const activeSigner = getSigner();

  return activeSigner({
    intentId: intentId.trim(),
    workspaceId: workspaceId.trim(),
    providerTransactionId: providerTransactionId.trim(),
    amountXaf,
    currency,
    provider,
    providerReference,
    paymentMethod,
    operatorReference,
    rawPayload,
    ttlMs,
  });
}
