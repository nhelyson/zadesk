import assert from "node:assert";
import { PrismaClient } from "@prisma/client";
import {
  createUpgradeIntent,
  confirmPaymentAndApplyUpgrade,
  prepareLegacyWorkspaceDecouverteSubscription,
  OFFICIAL_PLANS,
} from "../src/services/commercialService.js";
import {
  issueFinancialProofToken,
  _resetConsumedProofsForTesting,
} from "../src/security/financialTrustAuthority.js";

console.log("==========================================================================");
console.log("=== TESTS D'INTÉGRATION POSTGRESQL RÉEL (PORT 5433) - PHASE D.1.4 ===");
console.log("==========================================================================\n");

const TEMP_PG_URL = "postgresql://zadesk:test_secret@localhost:5433/zadesk_temp_d14?schema=public";

const pgPrisma = new PrismaClient({
  datasources: {
    db: { url: TEMP_PG_URL },
  },
});

async function main() {
  try {
    // 0. Test de connectivité
    await pgPrisma.$connect();
    console.log("✓ Connecté avec succès à PostgreSQL temporaire (port 5433).");

    // Nettoyage préalable des tables de test
    await pgPrisma.$executeRawUnsafe(`TRUNCATE TABLE 
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

    // Création d'un utilisateur et d'un workspace
    const user = await pgPrisma.user.create({
      data: {
        id: "usr_d14_test",
        email: "d14_audit@zadesk.com",
        firstName: "Testeur",
        lastName: "Intégration",
        passwordHash: "$2b$10$fakehashford14integrationtestingonly",
      },
    });

    const workspace = await pgPrisma.workspace.create({
      data: {
        id: "ws_d14_test",
        name: "Espace Audit D14",
        slug: "espace-audit-d14",
      },
    });

    const ownerMembership = await pgPrisma.membership.create({
      data: {
        id: "mem_d14_owner",
        userId: user.id,
        workspaceId: workspace.id,
        role: "OWNER",
        status: "ACTIVE",
      },
    });

    // 1. Initialisation canonique de l'abonnement Découverte dans PostgreSQL réel
    const initRes = await prepareLegacyWorkspaceDecouverteSubscription(workspace.id, { tx: pgPrisma });
    assert.strictEqual(initRes.converted, true);
    assert.strictEqual(initRes.subscription.plan, "DECOUVERTE");
    assert.strictEqual(initRes.subscription.version, 1);
    console.log("✓ PG-1. [PostgreSQL Réel] Création d'un abonnement canonique Découverte v1 validée.");

    // 2. Création d'une intention d'upgrade dans PostgreSQL réel
    const intentRes = await createUpgradeIntent(user.id, {
      workspaceId: workspace.id,
      targetPlanId: "STARTER",
      tx: pgPrisma,
    });
    assert.strictEqual(intentRes.success, true);
    assert.strictEqual(intentRes.intent.status, "PENDING");
    assert.strictEqual(intentRes.intent.priceXaf, 10000);
    const intentId = intentRes.intent.id;
    console.log("✓ PG-2. [PostgreSQL Réel] Création persistante de SubscriptionIntent (10 000 FCFA) validée.");

    // 3. Sécurité : Rejet d'un POJO falsifié non signé sur PostgreSQL réel
    await assert.rejects(
      async () => {
        await confirmPaymentAndApplyUpgrade(user.id, {
          workspaceId: workspace.id,
          intentId,
          financialProof: {
            source: "SASPAY_SECURE_WEBHOOK",
            provider: "SASPAY",
            providerTransactionId: "TX_UNAUTHORIZED_POJO",
            amountXaf: 10000,
            currency: "XAF",
          },
        }, { tx: pgPrisma });
      },
      /SECURITY_INVALID_PROOF_STRUCTURE/,
      "PostgreSQL réel doit rejeter tout objet non certifié par l'autorité cryptographique."
    );
    console.log("✓ PG-3. [PostgreSQL Réel / Sécurité] Rejet formel d'un faux reçu Javascript POJO validé.");

    // 4. Confirmation légitime avec capacité cryptographique signée
    const legitProof = issueFinancialProofToken({
      intentId,
      workspaceId: workspace.id,
      providerTransactionId: "SASPAY_REAL_PG_TX_001",
      amountXaf: 10000,
      source: "SERVER_VERIFIED_GATEWAY",
    });

    const confirmRes = await confirmPaymentAndApplyUpgrade(user.id, {
      workspaceId: workspace.id,
      intentId,
      financialProof: legitProof,
    }, { tx: pgPrisma });

    assert.strictEqual(confirmRes.success, true);
    assert.strictEqual(confirmRes.upgraded, true);
    assert.strictEqual(confirmRes.newPlan, "STARTER");
    assert.strictEqual(confirmRes.newVersion, 2);

    // Vérification de la persistance réelle en base
    const savedReceipt = await pgPrisma.providerPaymentReceipt.findUnique({
      where: {
        provider_providerTransactionId: {
          provider: "SASPAY",
          providerTransactionId: "SASPAY_REAL_PG_TX_001",
        },
      },
    });
    assert.ok(savedReceipt, "Le reçu doit être persistant en base.");
    assert.strictEqual(savedReceipt.validationStatus, "VALID");
    assert.strictEqual(savedReceipt.reconciliationStatus, "MATCHED_AND_APPLIED");

    const savedTx = await pgPrisma.paymentTransaction.findFirst({
      where: { receiptId: savedReceipt.id },
    });
    assert.ok(savedTx, "La transaction de paiement doit être persistante en base.");
    assert.strictEqual(savedTx.amountXaf, 10000);

    const savedSub = await pgPrisma.subscription.findUnique({
      where: { workspaceId: workspace.id },
    });
    assert.strictEqual(savedSub.plan, "STARTER");
    assert.strictEqual(savedSub.version, 2);

    console.log("✓ PG-4. [PostgreSQL Réel] Persistance transactionnelle complète (Reçu, Transaction, Version Subscription v2) validée.");

    // 5. Anti-rejeu de la capacité cryptographique
    await assert.rejects(
      async () => {
        await confirmPaymentAndApplyUpgrade(user.id, {
          workspaceId: workspace.id,
          intentId,
          financialProof: legitProof,
        }, { tx: pgPrisma });
      },
      /SECURITY_PROOF_ALREADY_CONSUMED/,
      "La preuve financière déjà consommée doit être rejetée avant toute exécution."
    );
    console.log("✓ PG-5. [PostgreSQL Réel / Anti-Rejeu] Rejet immédiat de la capacité cryptographique déjà consommée validé.");

    // 6. Test d'atomicité et Rollback intégral sur PostgreSQL
    // On crée une nouvelle intention
    const intentRes2 = await createUpgradeIntent(user.id, {
      workspaceId: workspace.id,
      targetPlanId: "PRO",
      tx: pgPrisma,
    });
    const intentId2 = intentRes2.intent.id;

    const legitProof2 = issueFinancialProofToken({
      intentId: intentId2,
      workspaceId: workspace.id,
      providerTransactionId: "SASPAY_REAL_PG_ROLLBACK_TX",
      amountXaf: 45000,
      source: "SERVER_VERIFIED_GATEWAY",
    });

    // Mock tx qui échoue délibérément lors de la dernière étape
    let rollbackExecuted = false;
    try {
      await pgPrisma.$transaction(async (tx) => {
        await confirmPaymentAndApplyUpgrade(user.id, {
          workspaceId: workspace.id,
          intentId: intentId2,
          financialProof: legitProof2,
        }, { tx });
        // Injection d'une erreur fatale dans la même transaction
        throw new Error("SIMULATED_CRASH_TRIGGERING_POSTGRES_ROLLBACK");
      });
    } catch (err) {
      if (err.message.includes("SIMULATED_CRASH_TRIGGERING_POSTGRES_ROLLBACK")) {
        rollbackExecuted = true;
      } else {
        throw err;
      }
    }
    assert.strictEqual(rollbackExecuted, true, "Le rollback PostgreSQL a bien été déclenché.");

    // Vérification qu'AUCUNE donnée partielle n'a été conservée dans PostgreSQL
    const uncommittedReceipt = await pgPrisma.providerPaymentReceipt.findUnique({
      where: {
        provider_providerTransactionId: {
          provider: "SASPAY",
          providerTransactionId: "SASPAY_REAL_PG_ROLLBACK_TX",
        },
      },
    });
    assert.strictEqual(uncommittedReceipt, null, "Le reçu ne doit pas exister en base après rollback.");

    const untouchedSub = await pgPrisma.subscription.findUnique({
      where: { workspaceId: workspace.id },
    });
    assert.strictEqual(untouchedSub.plan, "STARTER", "Le plan doit rester STARTER après rollback.");
    assert.strictEqual(untouchedSub.version, 2, "La version doit rester 2 après rollback.");

    console.log("✓ PG-6. [PostgreSQL Réel / Atomicité] Rollback intégral sous crash transactionnel validé.");

    // 7. Test de réactivation sélective en base de données réelle
    // Ajout de 2 membres suspendus :
    // - User 2 : suspendu pour COMMERCIAL_DOWNGRADE
    // - User 3 : suspendu pour MANUAL_ADMIN
    const user2 = await pgPrisma.user.create({
      data: { id: "usr_agent_comm", email: "agent_comm@zadesk.com", firstName: "Agent", lastName: "Commercial", passwordHash: "dummy" },
    });
    const user3 = await pgPrisma.user.create({
      data: { id: "usr_agent_manual", email: "agent_manual@zadesk.com", firstName: "Agent", lastName: "Manuel", passwordHash: "dummy" },
    });

    const memCommercial = await pgPrisma.membership.create({
      data: {
        id: "mem_agent_comm",
        userId: user2.id,
        workspaceId: workspace.id,
        role: "AGENT",
        status: "SUSPENDED",
        suspendedReason: "COMMERCIAL_DOWNGRADE",
      },
    });

    const memManual = await pgPrisma.membership.create({
      data: {
        id: "mem_agent_manual",
        userId: user3.id,
        workspaceId: workspace.id,
        role: "AGENT",
        status: "SUSPENDED",
        suspendedReason: "MANUAL_ADMIN",
      },
    });

    // Nouvelle tentative valide vers PRO (max 5 agents)
    _resetConsumedProofsForTesting();
    const legitProofPro = issueFinancialProofToken({
      intentId: intentId2,
      workspaceId: workspace.id,
      providerTransactionId: "SASPAY_REAL_PG_PRO_TX",
      amountXaf: 45000,
      source: "SERVER_VERIFIED_GATEWAY",
    });

    await confirmPaymentAndApplyUpgrade(user.id, {
      workspaceId: workspace.id,
      intentId: intentId2,
      financialProof: legitProofPro,
    }, { tx: pgPrisma });

    // Vérification sélective des statuts en base
    const reloadedComm = await pgPrisma.membership.findUnique({ where: { id: memCommercial.id } });
    const reloadedManual = await pgPrisma.membership.findUnique({ where: { id: memManual.id } });

    assert.strictEqual(reloadedComm.status, "ACTIVE", "Le membre suspendu commercialement doit être réactivé.");
    assert.strictEqual(reloadedComm.suspendedReason, null);

    assert.strictEqual(reloadedManual.status, "SUSPENDED", "Le membre suspendu administrativement (MANUAL_ADMIN) ne doit JAMAIS être réactivé.");
    assert.strictEqual(reloadedManual.suspendedReason, "MANUAL_ADMIN");

    console.log("✓ PG-7. [PostgreSQL Réel / Quotas] Réactivation sélective exclusive de COMMERCIAL_DOWNGRADE sans toucher à MANUAL_ADMIN validée.");

    console.log("\n==========================================================================");
    console.log("=== TOUS LES 7 TESTS D'INTÉGRATION POSTGRESQL RÉELS SONT VALIDÉS AVEC SUCCÈS ===");
    console.log("==========================================================================\n");
  } finally {
    await pgPrisma.$disconnect();
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("FATAL ERROR IN POSTGRESQL INTEGRATION TEST:", err);
    process.exit(1);
  });
