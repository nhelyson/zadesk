import assert from "node:assert";
import { PrismaClient } from "@prisma/client";
import {
  createUpgradeIntent,
  confirmPaymentAndApplyUpgrade,
  prepareLegacyWorkspaceDecouverteSubscription,
  getWorkspaceActivePlan,
  OFFICIAL_PLANS,
} from "../src/services/commercialService.js";
import {
  issueGatewayProofToken,
  _resetConsumedProofsForTesting,
} from "../src/security/financialTrustAuthority.js";
import {
  mintVerifiedPaymentProof,
} from "../src/security/financialVerificationGateway.js";

const TARGET_DB_URL = process.env.TEST_DATABASE_URL || "postgresql://zadesk:test_secret@localhost:5434/zadesk_blank_d15?schema=public";

console.log("==========================================================================");
console.log(`=== TESTS D'INTÉGRATION POSTGRESQL RÉEL D.1.5 ===`);
console.log(`Target: ${TARGET_DB_URL}`);
console.log("==========================================================================\n");

const pgPrisma = new PrismaClient({
  datasources: {
    db: { url: TARGET_DB_URL },
  },
});

async function main() {
  try {
    await pgPrisma.$connect();
    console.log("✓ Connecté avec succès à PostgreSQL.");

    // Nettoyage préalable des tables de test
    await pgPrisma.$executeRawUnsafe(`TRUNCATE TABLE 
      "consumed_financial_proofs",
      "subscription_history_logs",
      "payment_transactions",
      "provider_receipt_audit_logs",
      "provider_receipt_events",
      "provider_payment_receipts",
      "payment_attempts",
      "subscription_intents",
      "subscriptions",
      "memberships",
      "workspace_invitations",
      "establishments",
      "audit_logs",
      "workspaces",
      "users"
      CASCADE;`);
    console.log("✓ Tables de test réinitialisées.");

    // Création utilisateur & workspace
    const user = await pgPrisma.user.create({
      data: {
        id: "usr_d15_owner",
        email: "d15_owner@zadesk.com",
        firstName: "Propriétaire",
        lastName: "Zadesk",
        passwordHash: "$2b$10$fakehashford15testing",
      },
    });

    const workspace = await pgPrisma.workspace.create({
      data: {
        id: "ws_d15_test",
        name: "Workspace D15 Audit",
        slug: "workspace-d15-audit",
      },
    });

    await pgPrisma.membership.create({
      data: {
        id: "mem_d15_owner",
        userId: user.id,
        workspaceId: workspace.id,
        role: "OWNER",
        status: "ACTIVE",
      },
    });

    // 1. Initialisation canonique Découverte v1
    const initRes = await prepareLegacyWorkspaceDecouverteSubscription(workspace.id, { tx: pgPrisma });
    assert.strictEqual(initRes.converted, true);
    assert.strictEqual(initRes.subscription.plan, "DECOUVERTE");
    assert.strictEqual(initRes.subscription.version, 1);
    console.log("✓ D15-1. [PostgreSQL Réel] Création d'abonnement canonique Découverte v1 validée.");

    // 2. Création de l'intention d'upgrade
    const intentRes = await createUpgradeIntent(user.id, {
      workspaceId: workspace.id,
      targetPlanId: "STARTER",
      tx: pgPrisma,
    });
    assert.strictEqual(intentRes.success, true);
    assert.strictEqual(intentRes.intent.status, "PENDING");
    assert.strictEqual(intentRes.intent.priceXaf, 10000);
    const intentId = intentRes.intent.id;
    console.log("✓ D15-2. [PostgreSQL Réel] Création persistante de SubscriptionIntent (10 000 FCFA) validée.");

    // 3. Sécurité : Rejet immédiat de toute émission sans clé de passerelle
    assert.throws(
      () => {
        issueGatewayProofToken({
          gatewayCapabilityKey: "UNAUTHORIZED_KEY_HACK",
          intentId,
          workspaceId: workspace.id,
          providerTransactionId: "TX_HACK_EMIT",
          amountXaf: 10000,
          source: "SERVER_VERIFIED_GATEWAY",
        });
      },
      /SECURITY_UNAUTHORIZED_EMISSION_ATTEMPT/,
      "L'émission sans clé de passerelle doit être rejetée."
    );
    console.log("✓ D15-3. [Sécurité / Autorité Restreinte] Rejet strict de l'émission non autorisée validé.");

    // 4. Émission légitime via le composant Passerelle certifié
    const legitProof = mintVerifiedPaymentProof({
      intentId,
      workspaceId: workspace.id,
      providerTransactionId: "SASPAY_REAL_D15_TX_01",
      amountXaf: 10000,
      source: "SERVER_VERIFIED_GATEWAY",
    });

    // Confirmation sur PostgreSQL réel
    const confirmRes = await confirmPaymentAndApplyUpgrade(user.id, {
      workspaceId: workspace.id,
      intentId,
      financialProof: legitProof,
    }, { tx: pgPrisma });

    assert.strictEqual(confirmRes.success, true);
    assert.strictEqual(confirmRes.newPlan, "STARTER");
    assert.strictEqual(confirmRes.newVersion, 2);

    // Vérification de la persistance dans `consumed_financial_proofs`
    const consumedRecord = await pgPrisma.consumedFinancialProof.findUnique({
      where: { proofId: legitProof.proofId },
    });
    assert.ok(consumedRecord, "La preuve doit être persistée dans consumed_financial_proofs.");
    assert.strictEqual(consumedRecord.intentId, intentId);
    assert.strictEqual(consumedRecord.workspaceId, workspace.id);
    assert.strictEqual(consumedRecord.amountXaf, 10000);
    console.log("✓ D15-4. [PostgreSQL Réel / Anti-Rejeu Persistant] Enregistrement transactionnel dans consumed_financial_proofs validé.");

    // 5. Anti-Rejeu Multi-Processus / Concurrence : Rejet immédiat de la réutilisation de la même preuve
    await assert.rejects(
      async () => {
        await confirmPaymentAndApplyUpgrade(user.id, {
          workspaceId: workspace.id,
          intentId,
          financialProof: legitProof,
        }, { tx: pgPrisma });
      },
      /SECURITY_PROOF_ALREADY_CONSUMED/,
      "Toute réutilisation d'un même jeton doit être bloquée de manière étanche."
    );
    console.log("✓ D15-5. [PostgreSQL Réel / Anti-Rejeu] Rejet immédiat de preuve déjà consommée en base validé.");

    // 6. Simulation de concurrence multi-processus sur un nouveau jeton
    const intentResPro = await createUpgradeIntent(user.id, {
      workspaceId: workspace.id,
      targetPlanId: "PRO",
      tx: pgPrisma,
    });
    const intentIdPro = intentResPro.intent.id;

    const concurrentProof = mintVerifiedPaymentProof({
      intentId: intentIdPro,
      workspaceId: workspace.id,
      providerTransactionId: "SASPAY_CONCURRENT_RACE_TX",
      amountXaf: 45000,
      source: "SERVER_VERIFIED_GATEWAY",
    });

    // On vide le cache mémoire local pour simuler deux processus Node.js distincts (Processus A et Processus B)
    _resetConsumedProofsForTesting();

    // Deux processus exécutent simultanément confirmPaymentAndApplyUpgrade
    const [p1Result, p2Result] = await Promise.allSettled([
      confirmPaymentAndApplyUpgrade(user.id, {
        workspaceId: workspace.id,
        intentId: intentIdPro,
        financialProof: concurrentProof,
      }, { tx: pgPrisma }),
      confirmPaymentAndApplyUpgrade(user.id, {
        workspaceId: workspace.id,
        intentId: intentIdPro,
        financialProof: concurrentProof,
      }, { tx: pgPrisma }),
    ]);

    // Exactement un seul doit réussir, le second doit être rejeté par la contrainte unique de consumed_financial_proofs ou du reçu
    const successes = [p1Result, p2Result].filter((r) => r.status === "fulfilled");
    const rejections = [p1Result, p2Result].filter((r) => r.status === "rejected");

    assert.strictEqual(successes.length, 1, "Exactement une confirmation doit réussir.");
    assert.strictEqual(rejections.length, 1, "La seconde confirmation concurrente doit échouer.");
    assert.ok(
      rejections[0].reason.message.includes("SECURITY_PROOF_ALREADY_CONSUMED") ||
      rejections[0].reason.message.includes("déjà été enregistrée") ||
      rejections[0].reason.code === "DUPLICATE_PAYMENT_TRANSACTION",
      "L'échec doit être explicitement causé par l'anti-rejeu ou la contrainte unique."
    );
    console.log("✓ D15-6. [PostgreSQL Réel / Concurrence Multi-Processus] Course concurrente : exactement 1 vainqueur et rejet du second validés.");

    // 7. Test d'atomicité et Rollback intégral PostgreSQL
    const intentResEnt = await createUpgradeIntent(user.id, {
      workspaceId: workspace.id,
      targetPlanId: "ENTREPRISE",
      tx: pgPrisma,
    });
    const intentIdEnt = intentResEnt.intent.id;

    const rollbackProof = mintVerifiedPaymentProof({
      intentId: intentIdEnt,
      workspaceId: workspace.id,
      providerTransactionId: "SASPAY_ROLLBACK_TX_D15",
      amountXaf: 150000,
      source: "SERVER_VERIFIED_GATEWAY",
    });

    let crashCaught = false;
    try {
      await pgPrisma.$transaction(async (tx) => {
        await confirmPaymentAndApplyUpgrade(user.id, {
          workspaceId: workspace.id,
          intentId: intentIdEnt,
          financialProof: rollbackProof,
        }, { tx });
        throw new Error("SIMULATED_CRASH_BEFORE_COMMIT_D15");
      });
    } catch (err) {
      if (err.message.includes("SIMULATED_CRASH_BEFORE_COMMIT_D15")) {
        crashCaught = true;
      } else {
        throw err;
      }
    }
    assert.strictEqual(crashCaught, true);

    // Vérification : aucun reçu, aucune transaction, aucune consommation enregistrée en base
    const uncommittedConsumed = await pgPrisma.consumedFinancialProof.findUnique({
      where: { proofId: rollbackProof.proofId },
    });
    assert.strictEqual(uncommittedConsumed, null, "La consommation ne doit pas être enregistrée en base après rollback.");

    const uncommittedReceipt = await pgPrisma.providerPaymentReceipt.findUnique({
      where: {
        provider_providerTransactionId: {
          provider: "SASPAY",
          providerTransactionId: "SASPAY_ROLLBACK_TX_D15",
        },
      },
    });
    assert.strictEqual(uncommittedReceipt, null, "Le reçu ne doit pas exister en base après rollback.");

    console.log("✓ D15-7. [PostgreSQL Réel / Atomicité] Rollback intégral sous crash transactionnel validé.");

    // 8. Réactivation sélective des membres
    const agentComm = await pgPrisma.user.create({
      data: { id: "usr_comm_d15", email: "comm@zadesk.com", firstName: "Agent", lastName: "Commercial", passwordHash: "dummy" },
    });
    const agentManual = await pgPrisma.user.create({
      data: { id: "usr_man_d15", email: "manual@zadesk.com", firstName: "Agent", lastName: "Manuel", passwordHash: "dummy" },
    });

    const memComm = await pgPrisma.membership.create({
      data: {
        id: "mem_comm_d15",
        userId: agentComm.id,
        workspaceId: workspace.id,
        role: "AGENT",
        status: "SUSPENDED",
        suspendedReason: "COMMERCIAL_DOWNGRADE",
      },
    });

    const memManual = await pgPrisma.membership.create({
      data: {
        id: "mem_man_d15",
        userId: agentManual.id,
        workspaceId: workspace.id,
        role: "AGENT",
        status: "SUSPENDED",
        suspendedReason: "MANUAL_ADMIN",
      },
    });

    // Ré-exécution propre vers ENTREPRISE
    _resetConsumedProofsForTesting();
    const legitProofEnt = mintVerifiedPaymentProof({
      intentId: intentIdEnt,
      workspaceId: workspace.id,
      providerTransactionId: "SASPAY_VALID_ENTREPRISE_TX",
      amountXaf: 150000,
      source: "SERVER_VERIFIED_GATEWAY",
    });

    await confirmPaymentAndApplyUpgrade(user.id, {
      workspaceId: workspace.id,
      intentId: intentIdEnt,
      financialProof: legitProofEnt,
    }, { tx: pgPrisma });

    const reloadedComm = await pgPrisma.membership.findUnique({ where: { id: memComm.id } });
    const reloadedManual = await pgPrisma.membership.findUnique({ where: { id: memManual.id } });

    assert.strictEqual(reloadedComm.status, "ACTIVE", "Le membre suspendu commercialement doit être réactivé.");
    assert.strictEqual(reloadedComm.suspendedReason, null);

    assert.strictEqual(reloadedManual.status, "SUSPENDED", "Le membre suspendu manuellement doit rester SUSPENDED.");
    assert.strictEqual(reloadedManual.suspendedReason, "MANUAL_ADMIN");

    console.log("✓ D15-8. [PostgreSQL Réel / Quotas & Sécurité] Réactivation sélective exclusive de COMMERCIAL_DOWNGRADE sans toucher à MANUAL_ADMIN validée.");

    console.log("\n==========================================================================");
    console.log("=== TOUS LES 8 TESTS D'INTÉGRATION POSTGRESQL D.1.5 SONT VALIDÉS AVEC SUCCÈS ===");
    console.log("==========================================================================\n");
  } finally {
    await pgPrisma.$disconnect();
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("FATAL ERROR IN POSTGRESQL INTEGRATION TEST D15:", err);
    process.exit(1);
  });

