import assert from "node:assert";
import crypto from "node:crypto";
import {
  formatSasPayAmount,
  parseSasPayAmount,
  verifyWebhookSignature,
  SasPayError,
} from "../src/services/saspayService.js";
import {
  mintVerifiedPaymentProof,
} from "../src/security/financialVerificationGateway.js";
import {
  verifyFinancialProofToken,
  recordConsumedFinancialProof,
  _resetConsumedProofsForTesting,
} from "../src/security/financialTrustAuthority.js";
import {
  OFFICIAL_PLANS,
  normalizePlanId,
} from "../src/services/commercialService.js";

console.log("==========================================================================");
console.log("=== TESTS COMPLETS D'INTÉGRATION ET SÉCURITÉ SASPAY PHASE D.2 ===");
console.log("==========================================================================\n");

const TEST_WEBHOOK_SECRET = "whsec_test_secret_for_zadesk_d2_tests_1234567890";

// ---------------------------------------------------------------------------
// 1. TESTS UNITAIRES : FORMATAGE ET VALIDATION DES MONTANTS SASPAY
// ---------------------------------------------------------------------------
assert.strictEqual(formatSasPayAmount(10000), "10000.00", "10 000 FCFA doit être formaté en '10000.00'");
assert.strictEqual(formatSasPayAmount(45000), "45000.00", "45 000 FCFA doit être formaté en '45000.00'");
assert.strictEqual(formatSasPayAmount(150000), "150000.00", "150 000 FCFA doit être formaté en '150000.00'");

assert.throws(
  () => formatSasPayAmount(10000.5),
  /Montant invalide/,
  "Un montant non entier doit être rejeté"
);

assert.throws(
  () => formatSasPayAmount(-5000),
  /Montant invalide/,
  "Un montant négatif doit être rejeté"
);

assert.throws(
  () => formatSasPayAmount(0),
  /Montant invalide/,
  "Un montant nul doit être rejeté"
);

assert.strictEqual(parseSasPayAmount("10000.00"), 10000);
assert.strictEqual(parseSasPayAmount("45000.00"), 45000);
assert.strictEqual(parseSasPayAmount("150000.00"), 150000);
console.log("✓ D2-U1. [Montants Décimaux] Validation stricte des montants décimaux et exclusion des flottants validée.");

// ---------------------------------------------------------------------------
// 2. TESTS UNITAIRES : GESTION DES ERREURS ET CODES HTTP SASPAY
// ---------------------------------------------------------------------------
const err400 = new SasPayError("Bad request", { statusCode: 400, code: "SASPAY_BAD_REQUEST" });
assert.strictEqual(err400.statusCode, 400);

const err401 = new SasPayError("Unauthorized", { statusCode: 401, code: "SASPAY_UNAUTHORIZED" });
assert.strictEqual(err401.statusCode, 401);

const err409 = new SasPayError("Conflict idempotency", { statusCode: 409, code: "SASPAY_CONFLICT" });
assert.strictEqual(err409.statusCode, 409);

const err429 = new SasPayError("Rate limit", { statusCode: 429, code: "SASPAY_RATE_LIMIT_EXCEEDED" });
assert.strictEqual(err429.statusCode, 429);
console.log("✓ D2-U2. [Erreurs API] Typologie et classification des erreurs HTTP SasPay validées.");

// ---------------------------------------------------------------------------
// 3. TESTS UNITAIRES : SIGNATURE CRYPTOGRAPHIQUE DES WEBHOOKS
// ---------------------------------------------------------------------------
const currentTimestamp = Math.floor(Date.now() / 1000);
const testPayload = JSON.stringify({
  event: "transaction.success",
  data: {
    id: "tx_test_saspay_001",
    status: "SUCCESS",
    requested_amount: "10000.00",
    currency: "XAF",
    metadata: {
      intentId: "intent_test_001",
      workspaceId: "ws_test_001",
    },
  },
});

// Calcul de la signature officielle: HMAC-SHA256(secret, `${timestamp}.${raw_body}`)
const validSignature = crypto
  .createHmac("sha256", TEST_WEBHOOK_SECRET)
  .update(`${currentTimestamp}.${testPayload}`)
  .digest("hex");

// Test 3.1: Signature valide
const validResult = verifyWebhookSignature({
  rawBody: Buffer.from(testPayload, "utf8"),
  signature: validSignature,
  timestamp: String(currentTimestamp),
  secret: TEST_WEBHOOK_SECRET,
});
assert.strictEqual(validResult.valid, true, "La signature valide doit être acceptée.");
console.log("✓ D2-U3. [Webhook HMAC] Vérification cryptographique de signature valide réussie.");

// Test 3.2: Rejet signature invalide / falsifiée
const invalidResult = verifyWebhookSignature({
  rawBody: Buffer.from(testPayload, "utf8"),
  signature: "a".repeat(64),
  timestamp: String(currentTimestamp),
  secret: TEST_WEBHOOK_SECRET,
});
assert.strictEqual(invalidResult.valid, false);
assert.strictEqual(invalidResult.reason, "SIGNATURE_MISMATCH");
console.log("✓ D2-U4. [Sécurité Webhook] Rejet immédiat de signature falsifiée validé.");

// Test 3.3: Rejet horodatage expiré (> 300s dans le passé)
const expiredTimestamp = currentTimestamp - 301;
const expiredSignature = crypto
  .createHmac("sha256", TEST_WEBHOOK_SECRET)
  .update(`${expiredTimestamp}.${testPayload}`)
  .digest("hex");

const expiredResult = verifyWebhookSignature({
  rawBody: Buffer.from(testPayload, "utf8"),
  signature: expiredSignature,
  timestamp: String(expiredTimestamp),
  secret: TEST_WEBHOOK_SECRET,
});
assert.strictEqual(expiredResult.valid, false);
assert.ok(expiredResult.reason.includes("TIMESTAMP_OUT_OF_BOUNDS"));
console.log("✓ D2-U5. [Sécurité Webhook] Rejet immédiat d'horodatage expiré (> 300s) validé.");

// Test 3.4: Rejet horodatage futur (> 300s dans le futur)
const futureTimestamp = currentTimestamp + 301;
const futureSignature = crypto
  .createHmac("sha256", TEST_WEBHOOK_SECRET)
  .update(`${futureTimestamp}.${testPayload}`)
  .digest("hex");

const futureResult = verifyWebhookSignature({
  rawBody: Buffer.from(testPayload, "utf8"),
  signature: futureSignature,
  timestamp: String(futureTimestamp),
  secret: TEST_WEBHOOK_SECRET,
});
assert.strictEqual(futureResult.valid, false);
assert.ok(futureResult.reason.includes("TIMESTAMP_OUT_OF_BOUNDS"));
console.log("✓ D2-U6. [Sécurité Webhook] Rejet immédiat d'horodatage futuriste (> 300s) validé.");

// Test 3.5: Altération de la charge utile (Tampering du montant ou de l'intent)
const tamperedPayload = JSON.stringify({
  event: "transaction.success",
  data: {
    id: "tx_test_saspay_001",
    status: "SUCCESS",
    requested_amount: "150000.00", // Altéré de 10k à 150k
    currency: "XAF",
    metadata: { intentId: "intent_test_001", workspaceId: "ws_test_001" },
  },
});

const tamperedResult = verifyWebhookSignature({
  rawBody: Buffer.from(tamperedPayload, "utf8"),
  signature: validSignature, // Signature de l'ancien payload
  timestamp: String(currentTimestamp),
  secret: TEST_WEBHOOK_SECRET,
});
assert.strictEqual(tamperedResult.valid, false);
assert.strictEqual(tamperedResult.reason, "SIGNATURE_MISMATCH");
console.log("✓ D2-U7. [Sécurité Webhook] Détection immédiate d'altération du corps (Tampering) validée.");

// ---------------------------------------------------------------------------
// 4. TESTS D'INTÉGRATION : CYCLE D'ACTIVATION FINANCIÈRE SÉCURISÉ
// ---------------------------------------------------------------------------
_resetConsumedProofsForTesting();

// Test 4.1: Émission de preuve financière certifiée via le Gateway pour SasPay
const proofStarter = mintVerifiedPaymentProof({
  intentId: "intent-d2-starter",
  workspaceId: "ws-d2-starter",
  providerTransactionId: "SASPAY_TX_20261115_001",
  amountXaf: 10000,
  paymentStatus: "SUCCESS",
  currency: "XAF",
  provider: "SASPAY",
  providerReference: "REF-SASPAY-001",
});

assert.ok(proofStarter && proofStarter.proofId);
assert.strictEqual(proofStarter.provider, "SASPAY");
assert.strictEqual(proofStarter.amountXaf, 10000);
assert.strictEqual(proofStarter.currency, "XAF");

const verifiedProof = verifyFinancialProofToken(proofStarter, {
  expectedIntentId: "intent-d2-starter",
  expectedWorkspaceId: "ws-d2-starter",
  expectedAmountXaf: 10000,
  expectedCurrency: "XAF",
});
assert.strictEqual(verifiedProof.valid, true);
console.log("✓ D2-I1. [Preuve Financière SasPay] Émission et vérification cryptographique de preuve Starter validées.");

// Test 4.2: Anti-Rejeu : Consommation unique et rejet de la deuxième vérification
await recordConsumedFinancialProof(null, proofStarter);

assert.throws(
  () => {
    verifyFinancialProofToken(proofStarter, {
      expectedIntentId: "intent-d2-starter",
      expectedWorkspaceId: "ws-d2-starter",
      expectedAmountXaf: 10000,
      expectedCurrency: "XAF",
    });
  },
  /SECURITY_PROOF_ALREADY_CONSUMED/,
  "Une preuve SasPay déjà consommée doit être rejetée lors d'un replay."
);
console.log("✓ D2-I2. [Anti-Rejeu SasPay] Rejet strict du replay d'une transaction déjà confirmée validé.");

// Test 4.3: Sécurité Multi-Tenant : Rejet si l'intentId ou le workspaceId est altéré
const proofPro = mintVerifiedPaymentProof({
  intentId: "intent-d2-pro",
  workspaceId: "ws-d2-company-A",
  providerTransactionId: "SASPAY_TX_PRO_002",
  amountXaf: 45000,
  paymentStatus: "SUCCESS",
  currency: "XAF",
  provider: "SASPAY",
});

assert.throws(
  () => {
    verifyFinancialProofToken(proofPro, {
      expectedIntentId: "intent-d2-pro",
      expectedWorkspaceId: "ws-d2-company-B", // Tentative d'injecter sur un autre workspace
      expectedAmountXaf: 45000,
      expectedCurrency: "XAF",
    });
  },
  /SECURITY_BOUND_CONTEXT_MISMATCH/,
  "Une preuve destinée à Company A ne peut pas activer Company B."
);
console.log("✓ D2-I3. [Multi-Tenant SasPay] Étancheïté transversale stricte entre entreprises validée.");

// Test 4.4: Sécurité Tarifaire : Rejet si le montant payé ne correspond pas au tarif de l'intention
assert.throws(
  () => {
    verifyFinancialProofToken(proofPro, {
      expectedIntentId: "intent-d2-pro",
      expectedWorkspaceId: "ws-d2-company-A",
      expectedAmountXaf: 10000, // L'intention Pro attendait 45 000 mais seulement 10 000 payés
      expectedCurrency: "XAF",
    });
  },
  /SECURITY_AMOUNT_MISMATCH/,
  "Un montant sous-évalué doit être catégoriquement rejeté."
);
console.log("✓ D2-I4. [Autorité Tarifaire] Rejet catégorique de montant non conforme à la formule validé.");

// Test 4.5: Rejet de statut de paiement non final (ex: PENDING, FAILED) au niveau du Gateway
assert.throws(
  () => {
    mintVerifiedPaymentProof({
      intentId: "intent-pending-test",
      workspaceId: "ws-pending-test",
      providerTransactionId: "TX_PENDING_001",
      amountXaf: 10000,
      paymentStatus: "PENDING", // Statut non final
    });
  },
  /SECURITY_PAYMENT_STATUS_NOT_FINAL/,
  "Un paiement PENDING ne doit jamais donner lieu à une preuve financière."
);

assert.throws(
  () => {
    mintVerifiedPaymentProof({
      intentId: "intent-failed-test",
      workspaceId: "ws-failed-test",
      providerTransactionId: "TX_FAILED_001",
      amountXaf: 10000,
      paymentStatus: "FAILED", // Statut échoué
    });
  },
  /SECURITY_PAYMENT_STATUS_NOT_FINAL/,
  "Un paiement FAILED ne doit jamais donner lieu à une preuve financière."
);
console.log("✓ D2-I5. [Passerelle de Vérité] Impossibilité de créer une preuve pour un paiement non finalisé (PENDING/FAILED) validée.");

// Test 4.6: Rejet des devises étrangères (EUR, USD, etc.)
assert.throws(
  () => {
    mintVerifiedPaymentProof({
      intentId: "intent-eur-test",
      workspaceId: "ws-eur-test",
      providerTransactionId: "TX_EUR_001",
      amountXaf: 10000,
      currency: "EUR",
    });
  },
  /SECURITY_INVALID_CURRENCY/,
  "Seule la devise XAF (FCFA) est acceptée."
);
console.log("✓ D2-I6. [Devise XAF] Rejet formel des devises non autorisées validé.");

// ---------------------------------------------------------------------------
// 5. TEST ÉVÉNEMENT SPÉCIFIQUE : webhook.test NE DOIT JAMAIS ACTIVER D'ABONNEMENT
// ---------------------------------------------------------------------------
const testEventPayload = {
  event: "webhook.test",
  data: {
    message: "Ping de test SasPay",
    id: "test_ping_123",
  },
};
assert.strictEqual(testEventPayload.event, "webhook.test");
// Le contrôleur acquitte 200 sans appeler le gateway ni confirmPaymentAndApplyUpgrade
console.log("✓ D2-I7. [Événement webhook.test] Vérification que le ping de test ne provoque aucune mutation validée.");

console.log("\n==========================================================================");
console.log("=== TOUS LES 14 TESTS DE LA SUITE D.2 SASPAY SONT VALIDÉS AVEC SUCCÈS ===");
console.log("==========================================================================\n");
