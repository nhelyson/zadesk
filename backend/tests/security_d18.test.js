import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import {
  initializeGatewaySigner,
  configureSecurityBootstrap,
  getInternalGatewayCapabilityKey,
  issueGatewayProofToken,
  mintSimulationProofForTesting,
  verifyFinancialProofToken,
  recordConsumedFinancialProof,
} from "../src/security/financialTrustAuthority.js";
import {
  mintVerifiedPaymentProof,
  bootstrapSecurityGateway,
} from "../src/security/financialVerificationGateway.js";

console.log("==========================================================================");
console.log("=== TESTS DE SÉCURITÉ ET FRONTIÈRES ARCHITECTURALES PHASE D.1.8 ===");
console.log("==========================================================================\n");

// ---------------------------------------------------------------------------
// TEST 1 : Scénario obligatoire - Tentative de réclamation non autorisée avant le gateway
//          (Vérification dans un sous-processus Node.js vierge et isolé)
// ---------------------------------------------------------------------------
const isolatedTestScript = [
  'import assert from "node:assert";',
  'import * as fta from "./backend/src/security/financialTrustAuthority.js";',
  '',
  '// 1. Vérification que l\'import ordinaire n\'expose pas le jeton de bootstrap',
  'assert.strictEqual(fta.authorizedBootstrapToken, undefined, "Le jeton ne doit pas être exporté");',
  'assert.strictEqual(fta.bootstrapToken, undefined, "Le jeton ne doit pas être exporté");',
  '',
  '// 2. Appel non autorisé sans jeton dans un process vierge',
  'assert.throws(() => {',
  '  fta.initializeGatewaySigner();',
  '}, /(SECURITY_BOOTSTRAP_NOT_CONFIGURED|SECURITY_UNAUTHORIZED_BOOTSTRAP_ATTEMPT)/, "Un appel sans jeton doit échouer");',
  '',
  '// 3. Appel non autorisé avec jeton deviné',
  'assert.throws(() => {',
  '  fta.initializeGatewaySigner("fake_guess_attacker_token_12345678901234567890");',
  '}, /(SECURITY_BOOTSTRAP_NOT_CONFIGURED|SECURITY_UNAUTHORIZED_BOOTSTRAP_ATTEMPT)/, "Un jeton deviné doit être rejeté");',
  '',
  '// 4. Initialisation légitime ultérieure via le gateway',
  'const gw = await import("./backend/src/security/financialVerificationGateway.js");',
  'const signer = gw.bootstrapSecurityGateway();',
  'assert.strictEqual(typeof signer, "function", "Le bootstrap légitime doit réussir");',
  '',
  '// 5. Émission d\'une preuve vérifiée',
  'const proof = gw.mintVerifiedPaymentProof({',
  '  intentId: "intent-iso-1",',
  '  workspaceId: "ws-iso-1",',
  '  providerTransactionId: "tx-iso-1",',
  '  amountXaf: 10000,',
  '  paymentStatus: "SUCCESS",',
  '  currency: "XAF",',
  '  provider: "SASPAY"',
  '});',
  'assert.ok(proof && proof.proofId, "La preuve doit être émise");',
  '',
  '// 6. Toute tentative post-initialisation doit échouer',
  'assert.throws(() => {',
  '  fta.initializeGatewaySigner("another_token_123456789012345678901234567890");',
  '}, /SECURITY_GATEWAY_ALREADY_INITIALIZED/, "La réinitialisation doit échouer");',
  '',
  'console.log("ISOLATED_PROCESS_OK");'
].join("\n");

const isolatedProcessResult = spawnSync(
  process.execPath,
  ["--input-type=module", "-e", isolatedTestScript],
  {
    cwd: process.cwd(),
    encoding: "utf8",
    timeout: 10000,
  }
);

assert.strictEqual(
  isolatedProcessResult.status,
  0,
  `Le test en processus isolé a échoué :\nSTDOUT: ${isolatedProcessResult.stdout}\nSTDERR: ${isolatedProcessResult.stderr}`
);
assert.ok(
  isolatedProcessResult.stdout.includes("ISOLATED_PROCESS_OK"),
  "Le processus isolé doit confirmer le succès complet."
);
console.log("✓ D18-1. [Scénario Obligatoire Isolé] Rejet formel en processus vierge, non-exposition du jeton, bootstrap légitime unique et inviolabilité validés.");

// ---------------------------------------------------------------------------
// TEST 2 : Inviolabilité post-initialisation du signataire
// ---------------------------------------------------------------------------
assert.throws(
  () => {
    initializeGatewaySigner("another_token_123456789012345678901234567890");
  },
  /SECURITY_GATEWAY_ALREADY_INITIALIZED/,
  "Une deuxième initialisation du signataire doit être catégoriquement rejetée."
);

assert.throws(
  () => {
    configureSecurityBootstrap("another_token_123456789012345678901234567890");
  },
  /SECURITY_GATEWAY_ALREADY_INITIALIZED/,
  "La reconfiguration du bootstrap après initialisation doit être catégoriquement rejetée."
);
console.log("✓ D18-2. [Inviolabilité Post-Init] Rejet strict de toute tentative de réinitialisation ou vol après le démarrage du gateway validé.");

// ---------------------------------------------------------------------------
// TEST 3 : Rejet absolu des anciennes fonctions dépréciées / compromises
// ---------------------------------------------------------------------------
assert.throws(
  () => {
    getInternalGatewayCapabilityKey();
  },
  /SECURITY_GATEWAY_CAPABILITY_EXHAUSTED/,
  "L'accès à une clé de capacité doit être définitivement radié."
);

assert.throws(
  () => {
    issueGatewayProofToken();
  },
  /SECURITY_UNAUTHORIZED_EMISSION_ATTEMPT/,
  "L'émission directe doit être définitivement radiée."
);
console.log("✓ D18-3. [Radiations] Rejet permanent de getInternalGatewayCapabilityKey et issueGatewayProofToken validé.");

// ---------------------------------------------------------------------------
// TEST 4 : Validations strictes de la passerelle financière
// ---------------------------------------------------------------------------
assert.throws(
  () => {
    mintVerifiedPaymentProof({
      intentId: "intent-d18-status",
      workspaceId: "ws-d18-status",
      providerTransactionId: "TX_D18_PENDING",
      amountXaf: 10000,
      paymentStatus: "PENDING",
    });
  },
  /SECURITY_PAYMENT_STATUS_NOT_FINAL/,
  "La passerelle doit refuser un statut non final."
);

assert.throws(
  () => {
    mintVerifiedPaymentProof({
      intentId: "intent-d18-amount",
      workspaceId: "ws-d18-amount",
      providerTransactionId: "TX_D18_AMOUNT",
      amountXaf: 10000.75,
      paymentStatus: "SUCCESS",
    });
  },
  /SECURITY_INVALID_AMOUNT/,
  "La passerelle doit refuser un montant non entier."
);

assert.throws(
  () => {
    mintVerifiedPaymentProof({
      intentId: "intent-d18-currency",
      workspaceId: "ws-d18-currency",
      providerTransactionId: "TX_D18_EUR",
      amountXaf: 10000,
      currency: "EUR",
      paymentStatus: "SUCCESS",
    });
  },
  /SECURITY_INVALID_CURRENCY/,
  "La passerelle doit refuser toute devise étrangère."
);
console.log("✓ D18-4. [Passerelle Validante] Rejet formel des statuts non finaux, montants décimaux et devises étrangères validé.");

// ---------------------------------------------------------------------------
// TEST 5 : Règle architecturale statique - Aucun import non autorisé du gateway
// ---------------------------------------------------------------------------
const srcDir = path.resolve(process.cwd(), "backend", "src");

function scanDirectory(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      scanDirectory(filePath, fileList);
    } else if (file.endsWith(".js")) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

const allSrcFiles = scanDirectory(srcDir);
const forbiddenImporters = [];

for (const filePath of allSrcFiles) {
  const relativePath = path.relative(srcDir, filePath).replace(/\\/g, "/");

  // Seuls les composants de sécurité, le composition root, le service SasPay et le contrôleur de webhook SasPay sont autorisés
  const isAuthorized =
    relativePath.startsWith("security/") ||
    relativePath === "server.js" ||
    relativePath === "services/saspayService.js" ||
    relativePath === "controllers/saspayWebhookController.js";

  if (!isAuthorized) {
    const content = fs.readFileSync(filePath, "utf8");
    if (
      content.includes("financialVerificationGateway") ||
      content.includes("mintVerifiedPaymentProof")
    ) {
      forbiddenImporters.push({ file: relativePath, reason: "Import non autorisé de financialVerificationGateway" });
    }
    if (content.includes("issueGatewayProofToken") || content.includes("initializeGatewaySigner")) {
      forbiddenImporters.push({ file: relativePath, reason: "Import non autorisé des fonctions d'initialisation de l'autorité" });
    }
  }
}

assert.strictEqual(
  forbiddenImporters.length,
  0,
  `Violation architecturale détectée dans: ${JSON.stringify(forbiddenImporters, null, 2)}`
);
console.log("✓ D18-5. [Règle Architecturale Statique] Zéro import non autorisé de financialVerificationGateway dans controllers/services/workers/routes validé.");

// ---------------------------------------------------------------------------
// TEST 6 : Absence absolue de route HTTP de confirmation ou de génération de preuve
// ---------------------------------------------------------------------------
const commercialRoutesPath = path.resolve(srcDir, "routes", "commercialRoutes.js");
const commercialRoutesContent = fs.readFileSync(commercialRoutesPath, "utf8");

assert.ok(
  !commercialRoutesContent.includes("/upgrade/confirm"),
  "La route /upgrade/confirm ne doit absolument pas exister."
);
assert.ok(
  !commercialRoutesContent.includes("confirmUpgradeController"),
  "Aucun contrôleur HTTP de confirmation ne doit être rattaché aux routes."
);
console.log("✓ D18-6. [Surface d'Attaque HTTP] Absence absolue de route ou contrôleur d'auto-confirmation validée.");

// ---------------------------------------------------------------------------
// TEST 7 : Isolation physique absolue de la simulation en production
// ---------------------------------------------------------------------------
const prevEnv = process.env.NODE_ENV;
try {
  process.env.NODE_ENV = "production";
  assert.throws(
    () => {
      mintSimulationProofForTesting({
        intentId: "intent-d18-prod",
        workspaceId: "ws-d18-prod",
        providerTransactionId: "TX_SIM_PROD",
        amountXaf: 10000,
      });
    },
    /SECURITY_VIOLATION: TEST_SIMULATION is strictly prohibited in production/,
    "La simulation en production doit déclencher une exception fatale immédiate."
  );
} finally {
  process.env.NODE_ENV = prevEnv;
}
console.log("✓ D18-7. [Isolation Production] Interdiction matérielle de simulation en production validée.");

console.log("\n==========================================================================");
console.log("=== TOUS LES 7 TESTS DE SÉCURITÉ ET D'ARCHITECTURE D.1.8 SONT VALIDÉS ===");
console.log("==========================================================================\n");

