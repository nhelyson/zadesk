import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import { prisma } from "../src/lib/prisma.js";
import { cacheService } from "../src/cache/cacheService.js";
import {
  getWorkspaceWhatsAppConnection,
  disconnectWorkspaceWhatsApp,
} from "../src/services/whatsappService.js";

describe("WhatsApp Business Integration & Multi-tenant Tests", () => {
  let user1, user2;
  let workspace1, workspace2;

  before(async () => {
    // Setup test users & workspaces
    user1 = await prisma.user.create({
      data: {
        email: `wa_test_user1_${Date.now()}@zadesk.com`,
        firstName: "Alpha",
        lastName: "Owner",
        emailVerified: true,
      },
    });

    workspace1 = await prisma.workspace.create({
      data: {
        name: "Entreprise Alpha Test",
        slug: `alpha-test-${Date.now()}`,
        memberships: {
          create: {
            userId: user1.id,
            role: "OWNER",
          },
        },
      },
    });

    user2 = await prisma.user.create({
      data: {
        email: `wa_test_user2_${Date.now()}@zadesk.com`,
        firstName: "Beta",
        lastName: "Owner",
        emailVerified: true,
      },
    });

    workspace2 = await prisma.workspace.create({
      data: {
        name: "Entreprise Beta Test",
        slug: `beta-test-${Date.now()}`,
        memberships: {
          create: {
            userId: user2.id,
            role: "OWNER",
          },
        },
      },
    });
  });

  after(async () => {
    // Cleanup test data
    if (workspace1) {
      await prisma.whatsAppConnection.deleteMany({ where: { workspaceId: workspace1.id } });
      await prisma.workspace.delete({ where: { id: workspace1.id } }).catch(() => {});
    }
    if (workspace2) {
      await prisma.whatsAppConnection.deleteMany({ where: { workspaceId: workspace2.id } });
      await prisma.workspace.delete({ where: { id: workspace2.id } }).catch(() => {});
    }
    if (user1) await prisma.user.delete({ where: { id: user1.id } }).catch(() => {});
    if (user2) await prisma.user.delete({ where: { id: user2.id } }).catch(() => {});
  });

  it("Test 1 — État initial non connecté : doit retourner isConnected: false et connection: null", async () => {
    const status = await getWorkspaceWhatsAppConnection(workspace1.id);
    assert.equal(status.isConnected, false);
    assert.equal(status.connection, null);
    assert.equal(status.hasOwnProperty("accessToken"), false);
  });

  it("Test 2 — Association WhatsApp à un Workspace et vérification de non-exposition des secrets", async () => {
    const phoneId = `phone_${Date.now()}`;
    const wabaId = `waba_${Date.now()}`;

    // Simuler l'enregistrement en base
    const saved = await prisma.whatsAppConnection.create({
      data: {
        workspaceId: workspace1.id,
        wabaId,
        phoneNumberId: phoneId,
        displayPhoneNumber: "+242 06 111 22 33",
        verifiedName: "Alpha SAV Officiel",
        accessToken: "EAAB_SECRET_LONG_LIVED_TOKEN_12345",
        status: "CONNECTED",
      },
    });

    assert.ok(saved.id);
    assert.equal(saved.workspaceId, workspace1.id);

    // Invalider le cache pour simuler le comportement du service
    await cacheService.del(`workspace:${workspace1.id}:whatsapp_connection`);

    // Vérifier la fonction de lecture sécurisée
    const status = await getWorkspaceWhatsAppConnection(workspace1.id);
    assert.equal(status.isConnected, true);
    assert.ok(status.connection);
    assert.equal(status.connection.displayPhoneNumber, "+242 06 111 22 33");
    assert.equal(status.connection.verifiedName, "Alpha SAV Officiel");
    assert.equal(status.connection.status, "CONNECTED");

    // S'assurer qu'aucun Access Token n'est présent dans l'objet renvoyé
    assert.equal(status.connection.hasOwnProperty("accessToken"), false);
  });

  it("Test 3 — Isolation Multi-tenant : Workspace 2 ne voit pas la connexion de Workspace 1", async () => {
    const statusW2 = await getWorkspaceWhatsAppConnection(workspace2.id);
    assert.equal(statusW2.isConnected, false);
    assert.equal(statusW2.connection, null);
  });

  it("Test 4 — Déconnexion : suppression de l'association locale et retour à l'état non connecté", async () => {
    const res = await disconnectWorkspaceWhatsApp(workspace1.id);
    assert.equal(res.success, true);

    const statusAfter = await getWorkspaceWhatsAppConnection(workspace1.id);
    assert.equal(statusAfter.isConnected, false);
    assert.equal(statusAfter.connection, null);
  });
});
