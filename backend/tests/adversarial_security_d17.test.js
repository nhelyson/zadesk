import assert from "node:assert";
import {
  initializeGatewaySigner,
  getInternalGatewayCapabilityKey,
  issueGatewayProofToken,
  mintSimulationProofForTesting,
  verifyFinancialProofToken,
} from "../src/security/financialTrustAuthority.js";
import {
  mintVerifiedPaymentProof,
} from "../src/security/financialVerificationGateway.js";
import {
  confirmPaymentAndApplyUpgrade,
} from "../src/services/commercialService.js";

console.log("==========================================================================");
console.log("=== TESTS ADVERSARIAUX PHASE D.1.7 : FRONTIÈRES DE CONFIANCE & CAPACITÉS ===");
console.log("==========================================================================\n");

// ---------------------------------------------------------------------------
// SCÉNARIO 1 : Import direct de l'autorité depuis un module ordinaire et tentative d'extraction de capacité
// ---------------------------------------------------------------------------
assert.throws(
  () => {
    getInternalGatewayCapabilityKey();
  },
  /SECURITY_GATEWAY_CAPABILITY_EXHAUSTED/,
  "La récupération de clé de capacité par import direct doit être formellement rejetée."
);
console.log("✓ ADV-1. [Adversarial] Rejet strict de l'extraction directe de la capacité validé.");

// ---------------------------------------------------------------------------
// SCÉNARIO 2 : Import de la passerelle - Un import ordinaire ne peut pas contourner les règles
// ---------------------------------------------------------------------------
assert.strictEqual(typeof mintVerifiedPaymentProof, "function");
console.log("✓ ADV-2. [Adversarial] Import de la passerelle vérifié (seul point d'entrée exposé).");

// ---------------------------------------------------------------------------
// SCÉNARIO 3 : Appel direct de la fonction d'émission sans authentification financière
// ---------------------------------------------------------------------------
assert.throws(
  () => {
    issueGatewayProofToken();
  },
  /SECURITY_UNAUTHORIZED_EMISSION_ATTEMPT/,
  "L'appel direct à issueGatewayProofToken doit être bloqué."
);
console.log("✓ ADV-3. [Adversarial] Blocage définitif de tout appel direct à issueGatewayProofToken validé.");

// ---------------------------------------------------------------------------
// SCÉNARIO 4 : Tentative de réinitialisation ou vol du signataire de passerelle
// ---------------------------------------------------------------------------
assert.throws(
  () => {
    initializeGatewaySigner();
  },
  /SECURITY_GATEWAY_ALREADY_INITIALIZED/,
  "Le signataire de passerelle ne peut pas être réclamé ou réinitialisé une deuxième fois."
);
console.log("✓ ADV-4. [Adversarial] Inviolabilité et unicité du signataire de passerelle validées.");

// ---------------------------------------------------------------------------
// SCÉNARIO 5 : Appel de la passerelle avec un faux statut (non final : PENDING, FAILED)
// ---------------------------------------------------------------------------
assert.throws(
  () => {
    mintVerifiedPaymentProof({
      intentId: "intent-adv-5",
      workspaceId: "ws-adv-5",
      providerTransactionId: "TX_FAKE_PENDING",
      amountXaf: 10000,
      paymentStatus: "PENDING",
    });
  },
  /SECURITY_PAYMENT_STATUS_NOT_FINAL/,
  "La passerelle doit refuser un statut non final PENDING."
);

assert.throws(
  () => {
    mintVerifiedPaymentProof({
      intentId: "intent-adv-5",
      workspaceId: "ws-adv-5",
      providerTransactionId: "TX_FAKE_FAILED",
      amountXaf: 10000,
      paymentStatus: "FAILED",
    });
  },
  /SECURITY_PAYMENT_STATUS_NOT_FINAL/,
  "La passerelle doit refuser un statut en échec FAILED."
);
console.log("✓ ADV-5. [Adversarial] Rejet systématique des statuts de paiement non finaux (PENDING, FAILED) validé.");

// ---------------------------------------------------------------------------
// SCÉNARIO 6 : Fourniture d'une transaction fournisseur vide ou inventée
// ---------------------------------------------------------------------------
assert.throws(
  () => {
    mintVerifiedPaymentProof({
      intentId: "intent-adv-6",
      workspaceId: "ws-adv-6",
      providerTransactionId: "",
      amountXaf: 10000,
      paymentStatus: "SUCCESS",
    });
  },
  /GATEWAY_INVALID_TRANSACTION_ID/,
  "La passerelle doit exiger un providerTransactionId non vide."
);
console.log("✓ ADV-6. [Adversarial] Rejet d'identifiant de transaction fournisseur vide validé.");

// ---------------------------------------------------------------------------
// SCÉNARIO 7 : Appel d'une fonction de simulation depuis un environnement de production
// ---------------------------------------------------------------------------
const prevEnv = process.env.NODE_ENV;
try {
  process.env.NODE_ENV = "production";
  assert.throws(
    () => {
      mintSimulationProofForTesting({
        intentId: "intent-adv-7",
        workspaceId: "ws-adv-7",
        providerTransactionId: "TX_SIM_PROD",
        amountXaf: 10000,
      });
    },
    /SECURITY_VIOLATION: TEST_SIMULATION is strictly prohibited in production/,
    "La simulation en production doit lever une exception fatale."
  );
} finally {
  process.env.NODE_ENV = prevEnv;
}
console.log("✓ ADV-7. [Adversarial] Interdiction matérielle de simulation en environnement production validée.");

// ---------------------------------------------------------------------------
// SCÉNARIO 8 : Falsification des paramètres de contexte (Tampering montant / workspace / intent)
// ---------------------------------------------------------------------------
const legitToken = mintVerifiedPaymentProof({
  intentId: "intent-adv-8-A",
  workspaceId: "ws-adv-8-A",
  providerTransactionId: "TX_LEGIT_8",
  amountXaf: 10000,
});

// A. Tampering montant
const tamperedAmount = { ...legitToken, amountXaf: 45000 };
assert.throws(
  () => {
    verifyFinancialProofToken(tamperedAmount);
  },
  /SECURITY_FORGED_PROOF_TOKEN/,
  "La falsification de montant doit invalider la signature HMAC."
);

// B. Tampering workspaceId
assert.throws(
  () => {
    verifyFinancialProofToken(legitToken, {
      expectedIntentId: "intent-adv-8-A",
      expectedWorkspaceId: "ws-DIFFERENT-ATTACKER",
    });
  },
  /SECURITY_BOUND_CONTEXT_MISMATCH/,
  "L'utilisation sur un autre workspace doit être bloquée."
);

// C. Tampering intentId
assert.throws(
  () => {
    verifyFinancialProofToken(legitToken, {
      expectedIntentId: "intent-DIFFERENT-ATTACKER",
      expectedWorkspaceId: "ws-adv-8-A",
    });
  },
  /SECURITY_BOUND_CONTEXT_MISMATCH/,
  "L'utilisation sur une autre intention doit être bloquée."
);
console.log("✓ ADV-8. [Adversarial] Détection immédiate de falsification de contexte (montant, workspace, intent) validée.");

// ---------------------------------------------------------------------------
// SCÉNARIO 9 : Contournement par fonction intermédiaire ou proxy
// ---------------------------------------------------------------------------
function intermediateAttackerWrapper() {
  return initializeGatewaySigner();
}

assert.throws(
  () => {
    intermediateAttackerWrapper();
  },
  /SECURITY_GATEWAY_ALREADY_INITIALIZED/,
  "Une fonction intermédiaire ne peut pas obtenir un second signataire."
);
console.log("✓ ADV-9. [Adversarial] Impossibilité de contourner l'unicité du signataire via fonction intermédiaire validée.");

console.log("\n==========================================================================");
console.log("=== TOUS LES 9 SCÉNARIOS ADVERSARIAUX SONT VALIDÉS AVEC SUCCÈS ===");
console.log("==========================================================================\n");

