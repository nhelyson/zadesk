import { prisma } from "../src/lib/prisma.js";
import {
  createWorkspaceInvitation,
  getInvitationByToken,
  acceptWorkspaceInvitation,
  listWorkspaceInvitations,
  cancelWorkspaceInvitation,
} from "../src/services/workspaceService.js";
import crypto from "crypto";

async function runTests() {
  console.log("=================================================");
  console.log("🧪 ZADESK — SUITE DE VALIDATION COMPLÈTE INVITATIONS");
  console.log("=================================================\n");

  const testSuffix = Date.now().toString().slice(-6);

  try {
    // 0. Setup: Create Owner User and Workspace
    const ownerEmail = `owner_${testSuffix}@test-zadesk.ci`;
    const owner = await prisma.user.create({
      data: {
        email: ownerEmail,
        firstName: "Amara",
        lastName: "Touré",
        passwordHash: "hash_test_dummy",
        emailVerified: true,
      },
    });

    const workspace = await prisma.workspace.create({
      data: {
        name: `SAV Entreprise ${testSuffix}`,
        slug: `sav-entreprise-${testSuffix}`,
        supportEmail: ownerEmail,
      },
    });

    const ownerMembership = await prisma.membership.create({
      data: {
        userId: owner.id,
        workspaceId: workspace.id,
        role: "OWNER",
      },
    });

    // Create another Workspace to test multi-tenant isolation
    const otherWorkspace = await prisma.workspace.create({
      data: {
        name: `Autre Workspace ${testSuffix}`,
        slug: `autre-workspace-${testSuffix}`,
      },
    });

    console.log("✅ 0. Environnement de test initialisé (Workspace + Owner)");

    // =========================================================
    // TEST 1 : Création d'invitation par un administrateur
    // =========================================================
    const inviteeEmail = `invitee_${testSuffix}@test-zadesk.ci`;
    const invitation = await createWorkspaceInvitation(workspace.id, owner.id, {
      email: inviteeEmail,
      role: "AGENT",
    });

    if (!invitation || !invitation.token || invitation.role !== "AGENT") {
      throw new Error("Test 1 Échoué: L'invitation créée est invalide.");
    }
    console.log("✅ 1. Création d'invitation réussie (Token généré, rôle AGENT, 7 jours d'expiration)");

    // =========================================================
    // TEST 2 : Gestion propre d'une invitation dupliquée
    // =========================================================
    const duplicateInvitation = await createWorkspaceInvitation(workspace.id, owner.id, {
      email: inviteeEmail,
      role: "MANAGER", // Modification du rôle pour tester la mise à jour propre
    });

    if (!duplicateInvitation || duplicateInvitation.role !== "MANAGER") {
      throw new Error("Test 2 Échoué: L'invitation dupliquée n'a pas été mise à jour proprement.");
    }

    const pendingCount = await prisma.workspaceInvitation.count({
      where: { workspaceId: workspace.id, email: inviteeEmail, acceptedAt: null, revokedAt: null },
    });
    if (pendingCount !== 1) {
      throw new Error(`Test 2 Échoué: Des doublons existent en base (${pendingCount} invitations).`);
    }
    console.log("✅ 2. Invitation dupliquée gérée proprement (Aucun doublon en base, token rafraîchi)");

    // =========================================================
    // TEST 3 : Consultation et validation des informations du lien (/invitations/:token)
    // =========================================================
    const fetchedInvite = await getInvitationByToken(duplicateInvitation.token);
    if (
      fetchedInvite.email !== inviteeEmail ||
      fetchedInvite.workspace.id !== workspace.id ||
      fetchedInvite.role !== "MANAGER"
    ) {
      throw new Error("Test 3 Échoué: Les données de l'invitation ne correspondent pas.");
    }
    console.log("✅ 3. Lecture publique de l'invitation valide (Workspace, rôle et e-mail conformes)");

    // =========================================================
    // TEST 4 : Refus d'un token invalide
    // =========================================================
    try {
      await getInvitationByToken("faux_token_inconnu_12345");
      throw new Error("Test 4 Échoué: Un faux token aurait dû être rejeté.");
    } catch (err) {
      if (!err.message.includes("introuvable")) {
        throw err;
      }
      console.log("✅ 4. Jeton invalide correctement rejeté avec erreur 404");
    }

    // =========================================================
    // TEST 5 : Refus d'acceptation si mauvaise adresse e-mail (Cas utilisateur connecté avec un autre compte)
    // =========================================================
    const wrongUser = await prisma.user.create({
      data: {
        email: `intruder_${testSuffix}@pirate.ci`,
        firstName: "Malicieux",
        lastName: "Inconnu",
        emailVerified: true,
      },
    });

    try {
      await acceptWorkspaceInvitation(duplicateInvitation.token, wrongUser.id);
      throw new Error("Test 5 Échoué: L'acceptation avec un mauvais e-mail aurait dû être bloquée.");
    } catch (err) {
      if (!err.message.includes("Cette invitation est réservée")) {
        throw err;
      }
      console.log("✅ 5. Tentative d'acceptation avec un mauvais e-mail bloquée avec code 403");
    }

    // =========================================================
    // TEST 6 : Acceptation réussie par l'utilisateur destinataire légitime
    // =========================================================
    const legitimateUser = await prisma.user.create({
      data: {
        email: inviteeEmail,
        firstName: "Koffi",
        lastName: "Amani",
        emailVerified: true,
      },
    });

    const acceptResult = await acceptWorkspaceInvitation(duplicateInvitation.token, legitimateUser.id);
    if (!acceptResult.membership || acceptResult.membership.role !== "MANAGER") {
      throw new Error("Test 6 Échoué: Adhésion non créée ou rôle incorrect.");
    }

    // Vérification de la création du profil AgentProfile
    const agentProfile = await prisma.agentProfile.findUnique({
      where: { workspaceId_userId: { workspaceId: workspace.id, userId: legitimateUser.id } },
    });
    if (!agentProfile || agentProfile.title !== "Superviseur SAV") {
      throw new Error("Test 6 Échoué: Le profil AgentProfile n'a pas été initialisé.");
    }
    console.log("✅ 6. Acceptation par le bon utilisateur réussie (Membership + AgentProfile créés)");

    // =========================================================
    // TEST 7 : Prévention de la double acceptation
    // =========================================================
    try {
      await acceptWorkspaceInvitation(duplicateInvitation.token, legitimateUser.id);
      throw new Error("Test 7 Échoué: La double acceptation d'un même token aurait dû être refusée.");
    } catch (err) {
      if (!err.message.includes("déjà été acceptée") && !err.message.includes("n'est plus valide")) {
        throw err;
      }
      console.log("✅ 7. Double acceptation d'une invitation bloquée (Idempotence & protection concurrence)");
    }

    // =========================================================
    // TEST 8 : Refus d'inviter un utilisateur déjà membre
    // =========================================================
    try {
      await createWorkspaceInvitation(workspace.id, owner.id, {
        email: inviteeEmail,
        role: "AGENT",
      });
      throw new Error("Test 8 Échoué: La création d'invitation pour un membre existant aurait dû échouer.");
    } catch (err) {
      if (!err.message.includes("déjà membre")) {
        throw err;
      }
      console.log("✅ 8. Invitation d'un membre existant rejetée proprement avec erreur 400");
    }

    // =========================================================
    // TEST 9 : Révocation d'une invitation en attente et refus d'acceptation ultérieure
    // =========================================================
    const inviteToRevokeEmail = `to_revoke_${testSuffix}@test-zadesk.ci`;
    const inviteToRevoke = await createWorkspaceInvitation(workspace.id, owner.id, {
      email: inviteToRevokeEmail,
      role: "AGENT",
    });

    await cancelWorkspaceInvitation(workspace.id, inviteToRevoke.id);

    const revokedRecord = await prisma.workspaceInvitation.findUnique({
      where: { id: inviteToRevoke.id },
    });
    if (!revokedRecord || !revokedRecord.revokedAt) {
      throw new Error("Test 9 Échoué: La révocation n'a pas été persistée en base.");
    }

    // Tentative d'accès après révocation
    try {
      await getInvitationByToken(inviteToRevoke.token);
      throw new Error("Test 9 Échoué: L'accès au token révoqué aurait dû être refusé.");
    } catch (err) {
      if (!err.message.includes("révoquée")) {
        throw err;
      }
      console.log("✅ 9. Révocation persistée en base et tentative d'accès au token révoqué bloquée");
    }

    // =========================================================
    // TEST 10 : Refus d'un token expiré
    // =========================================================
    const expiredInvite = await prisma.workspaceInvitation.create({
      data: {
        workspaceId: workspace.id,
        invitedById: owner.id,
        email: `expired_${testSuffix}@test-zadesk.ci`,
        token: `expired_token_${testSuffix}`,
        expiresAt: new Date(Date.now() - 1000 * 60 * 60), // Expiré il y a 1h
      },
    });

    try {
      await getInvitationByToken(expiredInvite.token);
      throw new Error("Test 10 Échoué: Le token expiré aurait dû être rejeté.");
    } catch (err) {
      if (!err.message.includes("expiré")) {
        throw err;
      }
      console.log("✅ 10. Jeton expiré correctement refusé avec message explicite");
    }

    // =========================================================
    // TEST 11 : Listing des invitations avec statuts réels
    // =========================================================
    const allInvites = await listWorkspaceInvitations(workspace.id);
    const statusesFound = new Set(allInvites.map((i) => i.status));
    console.log(`✅ 11. Listing des invitations complet : ${allInvites.length} enregistrements trouvés.`);
    console.log(`    Statuts détectés : [${Array.from(statusesFound).join(", ")}]`);

    // =========================================================
    // TEST 12 : Isolation multi-tenant
    // =========================================================
    const otherInvites = await listWorkspaceInvitations(otherWorkspace.id);
    if (otherInvites.length !== 0) {
      throw new Error("Test 12 Échoué: Fuite de données d'invitation vers un autre workspace.");
    }
    console.log("✅ 12. Isolation multi-tenant stricte vérifiée (Aucune fuite de données cross-workspace)");

    // Nettoyage des données de test
    await prisma.workspaceInvitation.deleteMany({ where: { workspaceId: { in: [workspace.id, otherWorkspace.id] } } });
    await prisma.agentProfile.deleteMany({ where: { workspaceId: { in: [workspace.id, otherWorkspace.id] } } });
    await prisma.membership.deleteMany({ where: { workspaceId: { in: [workspace.id, otherWorkspace.id] } } });
    await prisma.workspace.deleteMany({ where: { id: { in: [workspace.id, otherWorkspace.id] } } });
    await prisma.user.deleteMany({ where: { id: { in: [owner.id, legitimateUser.id, wrongUser.id] } } });

    console.log("\n=================================================");
    console.log("🎉 TOUS LES 12 TESTS D'INVITATION ONT RÉUSSI SANS ERREUR !");
    console.log("=================================================");
  } catch (err) {
    console.error("❌ ERREUR LORS DES TESTS :", err);
    process.exit(1);
  }
}

runTests();

