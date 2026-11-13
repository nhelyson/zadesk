import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import { prisma } from "../src/lib/prisma.js";
import * as establishmentService from "../src/services/establishmentService.js";
import * as publicCompanyService from "../src/services/publicCompanyService.js";

describe("Establishments & Physical Branches Architecture Tests", () => {
  let wsA;
  let wsB;
  let userA;
  let userB;

  before(async () => {
    // Clean up previous test entities if any
    await prisma.establishment.deleteMany({
      where: {
        workspace: {
          slug: { in: ["test-ws-estab-a", "test-ws-estab-b"] },
        },
      },
    });
    await prisma.workspace.deleteMany({
      where: {
        slug: { in: ["test-ws-estab-a", "test-ws-estab-b"] },
      },
    });
    await prisma.user.deleteMany({
      where: {
        email: { in: ["user-estab-a@test.com", "user-estab-b@test.com"] },
      },
    });

    // Create User A & Workspace A (Has address configured)
    userA = await prisma.user.create({
      data: {
        email: "user-estab-a@test.com",
        firstName: "Alpha",
        lastName: "Tester",
      },
    });

    wsA = await prisma.workspace.create({
      data: {
        name: "Entreprise Alpha",
        normalizedName: "entreprise alpha",
        slug: "test-ws-estab-a",
        isPublic: true,
        address: "12 Avenue de la Paix, Centre-Ville",
        city: "Brazzaville",
        country: "Congo",
        supportPhone: "+242 06 111 22 33",
        supportEmail: "sav@alpha.cg",
        openingHours: "08h00 - 18h00",
        memberships: {
          create: {
            userId: userA.id,
            role: "OWNER",
          },
        },
      },
    });

    // Create User B & Workspace B (Online-only, NO address configured)
    userB = await prisma.user.create({
      data: {
        email: "user-estab-b@test.com",
        firstName: "Beta",
        lastName: "Tester",
      },
    });

    wsB = await prisma.workspace.create({
      data: {
        name: "E-Boutique Beta (100% En Ligne)",
        normalizedName: "e-boutique beta",
        slug: "test-ws-estab-b",
        isPublic: true,
        address: null,
        city: "Brazzaville",
        country: "Congo",
        memberships: {
          create: {
            userId: userB.id,
            role: "OWNER",
          },
        },
      },
    });
  });

  after(async () => {
    // Clean up
    await prisma.establishment.deleteMany({
      where: {
        workspaceId: { in: [wsA.id, wsB.id] },
      },
    });
    await prisma.workspace.deleteMany({
      where: {
        id: { in: [wsA.id, wsB.id] },
      },
    });
    await prisma.user.deleteMany({
      where: {
        id: { in: [userA.id, userB.id] },
      },
    });
    await prisma.$disconnect();
    setTimeout(() => process.exit(0), 100);
  });

  it("Cas A — Une entreprise sans adresse ne doit pas avoir d'établissement artificiel", async () => {
    const listB = await establishmentService.listEstablishments(wsB.id);
    assert.strictEqual(Array.isArray(listB), true);
    assert.strictEqual(listB.length, 0, "Une entreprise sans adresse doit avoir 0 établissement");
  });

  it("Cas B — Migration idempotente : une entreprise avec adresse récupère automatiquement son Siège", async () => {
    const listA = await establishmentService.listEstablishments(wsA.id);
    assert.strictEqual(listA.length, 1, "L'adresse existante doit être migrée en Siège Social");
    const hq = listA[0];
    assert.strictEqual(hq.type, "HEADQUARTERS");
    assert.strictEqual(hq.isMain, true);
    assert.strictEqual(hq.address, "12 Avenue de la Paix, Centre-Ville");
    assert.strictEqual(hq.city, "Brazzaville");

    // Idempotence: executing list again should NOT duplicate
    const listA2 = await establishmentService.listEstablishments(wsA.id);
    assert.strictEqual(listA2.length, 1, "La migration doit être strictement idempotente sans doublon");
  });

  it("Cas C — Création d'établissements multiples avec gestion du Siège principal", async () => {
    // Create Branch 1
    const branch1 = await establishmentService.createEstablishment(wsA.id, {
      name: "Boutique Point Relais Pointe-Noire",
      type: "STORE",
      address: "Rond-point Lumumba, Face Marché Central",
      city: "Pointe-Noire",
      phone: "+242 05 500 12 34",
      services: ["Retrait Colis", "Échange Express"],
      isMain: false,
      isPublic: true,
    });

    assert.ok(branch1.id);
    assert.strictEqual(branch1.type, "STORE");
    assert.strictEqual(branch1.isMain, false);

    // Create Branch 2 and declare it as isMain: true
    const branch2 = await establishmentService.createEstablishment(wsA.id, {
      name: "Nouveau Siège Commercial Bacongo",
      type: "BRANCH",
      address: "Avenue de l'OUA, Rond-point Moungali",
      city: "Brazzaville",
      isMain: true,
      isPublic: true,
    });

    assert.strictEqual(branch2.isMain, true);

    // Verify previous HQ was unset from isMain
    const allA = await establishmentService.listEstablishments(wsA.id);
    assert.strictEqual(allA.length, 3);
    const mainEstab = allA.find((e) => e.isMain);
    assert.strictEqual(mainEstab.id, branch2.id, "Le nouvel établissement doit devenir le seul isMain");
  });

  it("Isolation Multi-Tenant absolue : impossible de lire ou modifier l'établissement d'une autre entreprise", async () => {
    const listA = await establishmentService.listEstablishments(wsA.id);
    const estabA = listA[0];

    // Workspace B attempts to get Establishment from Workspace A
    await assert.rejects(
      async () => {
        await establishmentService.getEstablishmentById(wsB.id, estabA.id);
      },
      {
        code: "ESTABLISHMENT_NOT_FOUND",
      },
      "Workspace B ne doit pas pouvoir lire l'établissement de Workspace A"
    );

    // Workspace B attempts to update Establishment from Workspace A
    await assert.rejects(
      async () => {
        await establishmentService.updateEstablishment(wsB.id, estabA.id, { name: "Hack Name" });
      },
      {
        code: "ESTABLISHMENT_NOT_FOUND",
      },
      "Workspace B ne doit pas pouvoir modifier l'établissement de Workspace A"
    );

    // Workspace B attempts to delete Establishment from Workspace A
    await assert.rejects(
      async () => {
        await establishmentService.deleteEstablishment(wsB.id, estabA.id);
      },
      {
        code: "ESTABLISHMENT_NOT_FOUND",
      },
      "Workspace B ne doit pas pouvoir supprimer l'établissement de Workspace A"
    );
  });

  it("Espace Public SAV : seuls les établissements publics et actifs sont exposés", async () => {
    // Add a confidential internal center in Workspace A
    const privateCenter = await establishmentService.createEstablishment(wsA.id, {
      name: "Atelier Technique Secret (Interne)",
      type: "TECH_CENTER",
      address: "Zone Industrielle Ouenze",
      city: "Brazzaville",
      isPublic: false, // PRIVATE
      isActive: true,
    });

    // Add an inactive branch in Workspace A
    const closedBranch = await establishmentService.createEstablishment(wsA.id, {
      name: "Ancienne Agence Fermée",
      type: "BRANCH",
      address: "Rue Mayama",
      city: "Brazzaville",
      isPublic: true,
      isActive: false, // INACTIVE
    });

    const publicCompany = await publicCompanyService.getPublicCompanyBySlug("test-ws-estab-a");
    assert.ok(publicCompany, "La fiche publique doit être trouvée");
    assert.ok(Array.isArray(publicCompany.establishments), "La liste des établissements doit être présente");

    const exposedIds = publicCompany.establishments.map((e) => e.id);
    assert.strictEqual(exposedIds.includes(privateCenter.id), false, "L'établissement privé NE DOIT PAS être exposé");
    assert.strictEqual(exposedIds.includes(closedBranch.id), false, "L'établissement inactif NE DOIT PAS être exposé");
    assert.strictEqual(publicCompany.establishments.length, 3, "Seuls les 3 établissements publics actifs doivent être exposés");
  });

  it("Suppression : supprimer un établissement ne touche à aucune autre entité", async () => {
    const listA = await establishmentService.listEstablishments(wsA.id);
    const toDelete = listA[listA.length - 1];

    const delResult = await establishmentService.deleteEstablishment(wsA.id, toDelete.id);
    assert.strictEqual(delResult.success, true);

    const listAfter = await establishmentService.listEstablishments(wsA.id);
    assert.strictEqual(listAfter.some((e) => e.id === toDelete.id), false);

    // Verify workspace itself is intact
    const wsCheck = await prisma.workspace.findUnique({ where: { id: wsA.id } });
    assert.ok(wsCheck);
    assert.strictEqual(wsCheck.name, "Entreprise Alpha");
  });
});
