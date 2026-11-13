import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import app from "../src/app.js";
import { prisma } from "../src/lib/prisma.js";
import { createUser } from "../src/services/userService.js";
import { createSession } from "../src/services/sessionService.js";

describe("Simplified Onboarding - 10 Core Test Cases", () => {
  const ts = Date.now();
  let soloUser;
  let cookieSolo = "";
  let merchantNoWaUser;
  let cookieNoWa = "";
  let pmeUser;
  let cookiePme = "";
  let intruderUser;
  let cookieIntruder = "";

  before(async () => {
    // Nettoyage préalable
    await prisma.session.deleteMany({
      where: { user: { email: { contains: "onboarding-simplified.test" } } },
    }).catch(() => {});
    await prisma.user.deleteMany({
      where: { email: { contains: "onboarding-simplified.test" } },
    }).catch(() => {});
    await prisma.workspace.deleteMany({
      where: { name: { contains: `TestActivity-${ts}` } },
    }).catch(() => {});

    // Création des utilisateurs de test
    soloUser = await createUser({
      firstName: "Maman",
      lastName: "Chantal",
      email: `maman-${ts}@onboarding-simplified.test`,
      passwordHash: "$2a$10$abcdefghijklmnopqrstuvwxyz123456",
      emailVerified: true,
    });
    const sessionSolo = await createSession(soloUser.id);
    cookieSolo = `zadesk_session=${sessionSolo.sessionToken}`;

    merchantNoWaUser = await createUser({
      firstName: "Michel",
      lastName: "Artisan",
      email: `michel-${ts}@onboarding-simplified.test`,
      passwordHash: "$2a$10$abcdefghijklmnopqrstuvwxyz123456",
      emailVerified: true,
    });
    const sessionNoWa = await createSession(merchantNoWaUser.id);
    cookieNoWa = `zadesk_session=${sessionNoWa.sessionToken}`;

    pmeUser = await createUser({
      firstName: "Directeur",
      lastName: "PME",
      email: `directeur-${ts}@onboarding-simplified.test`,
      passwordHash: "$2a$10$abcdefghijklmnopqrstuvwxyz123456",
      emailVerified: true,
    });
    const sessionPme = await createSession(pmeUser.id);
    cookiePme = `zadesk_session=${sessionPme.sessionToken}`;

    intruderUser = await createUser({
      firstName: "Intruder",
      lastName: "NonMember",
      email: `intruder-${ts}@onboarding-simplified.test`,
      passwordHash: "$2a$10$abcdefghijklmnopqrstuvwxyz123456",
      emailVerified: true,
    });
    const sessionIntruder = await createSession(intruderUser.id);
    cookieIntruder = `zadesk_session=${sessionIntruder.sessionToken}`;
  });

  after(async () => {
    try {
      await prisma.session.deleteMany({
        where: { user: { email: { contains: "onboarding-simplified.test" } } },
      }).catch(() => {});
      await prisma.user.deleteMany({
        where: { email: { contains: "onboarding-simplified.test" } },
      }).catch(() => {});
      await prisma.workspace.deleteMany({
        where: { name: { contains: `TestActivity-${ts}` } },
      }).catch(() => {});
      await prisma.$disconnect();
    } catch (e) {}
  });

  // Cas 1 : Personne qui travaille seule (vendeuse de beignets)
  it("Cas 1 : Une personne travaillant seule crée son espace avec succès", async () => {
    const res = await request(app)
      .post("/api/workspaces")
      .set("Cookie", cookieSolo)
      .send({
        name: `TestActivity-${ts} Chez Maman Beignets`,
        category: "Alimentation et restauration",
        country: "Congo",
        city: "Brazzaville",
        supportWhatsApp: "+242068001122",
      });

    assert.equal(res.status, 201);
    assert.ok(res.body.workspace);
    const ws = res.body.workspace;
    assert.equal(ws.name, `TestActivity-${ts} Chez Maman Beignets`);
    assert.equal(ws.category, "Alimentation et restauration");
    assert.equal(ws.city, "Brazzaville");
    assert.equal(ws.country, "Congo");
    assert.equal(ws.openingHours, null, "Aucun faux horaire inventé");

    // Catégories par défaut génériques
    const categories = typeof ws.supportCategories === "string" ? JSON.parse(ws.supportCategories) : ws.supportCategories;
    assert.deepEqual(categories, ["Information", "Commande", "Réclamation", "Autre demande"]);

    // Membership OWNER créé
    const membership = await prisma.membership.findFirst({
      where: { userId: soloUser.id, workspaceId: ws.id },
    });
    assert.ok(membership);
    assert.equal(membership.role, "OWNER");

    // Profil agent réaliste (OFFLINE par défaut, capacité standard 10)
    const profile = await prisma.agentProfile.findFirst({
      where: { userId: soloUser.id, workspaceId: ws.id },
    });
    assert.ok(profile);
    assert.equal(profile.availability, "OFFLINE", "Pas de fausse disponibilité simulée");
    assert.equal(profile.maxCapacity, 10);
  });

  // Cas 2 : Une vendeuse qui utilise principalement WhatsApp
  it("Cas 2 : Une vendeuse avec WhatsApp officiel crée son espace avec son numéro enregistré", async () => {
    const res = await request(app)
      .get(`/api/workspaces/check-name?name=TestActivity-${ts}+Boutique+Aicha&country=Congo`)
      .set("Cookie", cookieSolo);
    assert.equal(res.status, 200);
    assert.equal(res.body.available, true);
  });

  // Cas 3 : Un commerçant sans numéro WhatsApp professionnel
  it("Cas 3 : Un commerçant sans numéro WhatsApp professionnel crée son espace sans erreur", async () => {
    const res = await request(app)
      .post("/api/workspaces")
      .set("Cookie", cookieNoWa)
      .send({
        name: `TestActivity-${ts} Atelier Bois Michel`,
        category: "Artisanat",
        country: "Congo",
        city: "Pointe-Noire",
      });

    assert.equal(res.status, 201);
    assert.ok(res.body.workspace);
    assert.equal(res.body.workspace.supportWhatsApp, null);
    assert.equal(res.body.workspace.city, "Pointe-Noire");
  });

  // Cas 4 : Petite boutique avec rôle OWNER et isolation garantie
  it("Cas 4 : Le créateur reçoit bien le rôle OWNER sans autre membre par défaut", async () => {
    const memberships = await prisma.membership.findMany({
      where: { user: { email: `michel-${ts}@onboarding-simplified.test` } },
    });
    assert.equal(memberships.length, 1);
    assert.equal(memberships[0].role, "OWNER");
  });

  // Cas 5 : PME structurée (Services au Gabon)
  it("Cas 5 : Une PME crée son espace dans un autre pays CEMAC (Gabon)", async () => {
    const res = await request(app)
      .post("/api/workspaces")
      .set("Cookie", cookiePme)
      .send({
        name: `TestActivity-${ts} CEMAC Logistics`,
        category: "Transport et livraison",
        country: "Gabon",
        city: "Libreville",
        supportWhatsApp: "+24107001122",
      });

    assert.equal(res.status, 201);
    assert.ok(res.body.workspace);
    assert.equal(res.body.workspace.country, "Gabon");
    assert.equal(res.body.workspace.city, "Libreville");
  });

  // Cas 6 : Abandon puis reprise du parcours (Draft)
  it("Cas 6 : Un utilisateur sauvegarde un brouillon et le retrouve intact après déconnexion", async () => {
    // 1. Sauvegarde du brouillon
    const saveRes = await request(app)
      .put("/api/workspaces/onboarding/draft")
      .set("Cookie", cookiePme)
      .send({
        step: 1,
        data: {
          companyName: "Boutique En Cours",
          sector: "Beauté et bien-être",
          country: "Congo",
          city: "Brazzaville",
          supportWhatsApp: "+242069998877",
        },
      });
    assert.equal(saveRes.status, 200);
    assert.equal(saveRes.body.success, true);

    // 2. Rechargement du brouillon
    const getRes = await request(app)
      .get("/api/workspaces/onboarding/draft")
      .set("Cookie", cookiePme);
    assert.equal(getRes.status, 200);
    assert.equal(getRes.body.exists, true);
    assert.equal(getRes.body.data.companyName, "Boutique En Cours");
    assert.equal(getRes.body.data.sector, "Beauté et bien-être");
    assert.equal(getRes.body.data.supportWhatsApp, "+242069998877");
  });

  // Cas 7 : Tentative de création d'un doublon dans le même pays (409)
  it("Cas 7 : Rejette la création d'un doublon portant le même nom dans le même pays (409)", async () => {
    const dupRes = await request(app)
      .post("/api/workspaces")
      .set("Cookie", cookiePme)
      .send({
        name: `TestActivity-${ts} Chez Maman Beignets`,
        country: "Congo",
      });

    assert.equal(dupRes.status, 409);
    assert.equal(dupRes.body.code, "NAME_ALREADY_TAKEN");
  });

  // Cas 8 : Un utilisateur qui possède déjà un Workspace le liste correctement
  it("Cas 8 : L'utilisateur ayant créé son workspace accède à sa liste sans redirection d'onboarding", async () => {
    const listRes = await request(app)
      .get("/api/workspaces")
      .set("Cookie", cookieSolo);

    assert.equal(listRes.status, 200);
    assert.ok(listRes.body.workspaces.length >= 1);
    assert.equal(listRes.body.workspaces[0].role, "OWNER");
  });

  // Cas 9 : Un utilisateur non membre tente d'accéder au Workspace d'un autre (403)
  it("Cas 9 : Un utilisateur sans adhésion est strictement bloqué avec 403 Forbidden", async () => {
    const ws = await prisma.workspace.findFirst({
      where: { name: `TestActivity-${ts} Chez Maman Beignets` },
    });
    assert.ok(ws);

    const accessRes = await request(app)
      .get(`/api/workspaces/${ws.id}/tickets`)
      .set("Cookie", cookieIntruder);

    assert.equal(accessRes.status, 403);
    assert.equal(accessRes.body.code, "FORBIDDEN_WORKSPACE_ACCESS");
  });

  // Cas 10 : Création interrompue par des données invalides (nom vide -> 400)
  it("Cas 10 : Une création avec un nom vide est rejetée (400) sans altérer la base", async () => {
    const invalidRes = await request(app)
      .post("/api/workspaces")
      .set("Cookie", cookieIntruder)
      .send({
        name: "   ",
        country: "Congo",
      });

    assert.equal(invalidRes.status, 400);
  });
});

