import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import app from "../src/app.js";
import { prisma } from "../src/lib/prisma.js";
import { createUser } from "../src/services/userService.js";
import { createSession } from "../src/services/sessionService.js";

describe("Zadesk Multi-Tenant & Onboarding E2E Verification", () => {
  const timestamp = Date.now();
  let userA;
  let userB;
  let cookieUserA = "";
  let cookieUserB = "";
  let createdWorkspaceId = "";

  before(async () => {
    try {
      await prisma.session.deleteMany({
        where: { user: { email: { contains: "onboarding-e2e.test" } } },
      }).catch(() => {});
      await prisma.user.deleteMany({
        where: { email: { contains: "onboarding-e2e.test" } },
      }).catch(() => {});
      await prisma.workspace.deleteMany({
        where: { name: { contains: "E2E Test Corp" } },
      }).catch(() => {});
    } catch (e) {
      console.log("Cleanup warning:", e.message);
    }

    // 1. Création directe de 2 utilisateurs authentifiés
    userA = await createUser({
      firstName: "Alice",
      lastName: "Fondatrice",
      email: `alice-${timestamp}@onboarding-e2e.test`,
      passwordHash: "$2a$10$abcdefghijklmnopqrstuvwxyz123456",
      emailVerified: true,
    });
    const sessionA = await createSession(userA.id);
    cookieUserA = `zadesk_session=${sessionA.sessionToken}`;

    userB = await createUser({
      firstName: "Bob",
      lastName: "AutreUser",
      email: `bob-${timestamp}@onboarding-e2e.test`,
      passwordHash: "$2a$10$abcdefghijklmnopqrstuvwxyz123456",
      emailVerified: true,
    });
    const sessionB = await createSession(userB.id);
    cookieUserB = `zadesk_session=${sessionB.sessionToken}`;
  });

  after(async () => {
    try {
      await prisma.session.deleteMany({
        where: { user: { email: { contains: "onboarding-e2e.test" } } },
      }).catch(() => {});
      await prisma.user.deleteMany({
        where: { email: { contains: "onboarding-e2e.test" } },
      }).catch(() => {});
      await prisma.workspace.deleteMany({
        where: { name: { contains: "E2E Test Corp" } },
      }).catch(() => {});
      await prisma.$disconnect();
    } catch (e) {
      // ignore
    }
  });

  describe("1. Absence d'auto-attribution de rôle (Sécurité requireAuth)", () => {
    it("Alice ne doit avoir AUCUN Workspace ni rôle OWNER par défaut", async () => {
      // Vérification en base de données : AUCUN membership ne doit exister
      const memberships = await prisma.membership.findMany({
        where: { userId: userA.id },
      });
      assert.equal(memberships.length, 0, "Alice ne doit avoir aucun rôle automatique avant onboarding");

      // L'endpoint des workspaces doit renvoyer une liste vide
      const wsRes = await request(app)
        .get("/api/workspaces")
        .set("Cookie", cookieUserA);
      assert.equal(wsRes.status, 200);
      assert.equal(wsRes.body.workspaces.length, 0);
    });

    it("Bob ne doit avoir AUCUN Workspace ni rôle OWNER par défaut", async () => {
      const memberships = await prisma.membership.findMany({
        where: { userId: userB.id },
      });
      assert.equal(memberships.length, 0);
    });
  });

  describe("2. Persistance du brouillon d'onboarding (Draft Persistence)", () => {
    it("devrait refuser l'accès au brouillon sans authentification (401)", async () => {
      const res = await request(app).get("/api/workspaces/onboarding/draft");
      assert.equal(res.status, 401);
    });

    it("devrait retourner exists: false pour un nouvel utilisateur", async () => {
      const res = await request(app)
        .get("/api/workspaces/onboarding/draft")
        .set("Cookie", cookieUserA);

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.exists, false);
      assert.equal(res.body.step, 1);
    });

    it("devrait sauvegarder l'état du formulaire à l'étape 3 et persister les données", async () => {
      const draftData = {
        step: 3,
        data: {
          hasExistingSav: true,
          companyName: "E2E Test Corp",
          country: "Congo",
          city: "Brazzaville",
          sector: "Commerce & Distribution",
          officialSupportName: "Support Client E2E",
          supportMission: "Résolution rapide et suivie",
          slaHours: 2,
          teamLeadName: "Alice Responsable",
          teamSize: "2-5",
          inquiryTypes: ["Commande & Livraison", "Facturation"],
        },
      };

      const putRes = await request(app)
        .put("/api/workspaces/onboarding/draft")
        .set("Cookie", cookieUserA)
        .send(draftData);

      assert.equal(putRes.status, 200);
      assert.equal(putRes.body.success, true);
      assert.equal(putRes.body.exists, true);
      assert.equal(putRes.body.step, 3);
      assert.equal(putRes.body.data.companyName, "E2E Test Corp");
    });

    it("devrait recharger le brouillon intact lors d'une nouvelle session pour Alice", async () => {
      const getRes = await request(app)
        .get("/api/workspaces/onboarding/draft")
        .set("Cookie", cookieUserA);

      assert.equal(getRes.status, 200);
      assert.equal(getRes.body.exists, true);
      assert.equal(getRes.body.step, 3);
      assert.equal(getRes.body.data.companyName, "E2E Test Corp");
      assert.equal(getRes.body.data.hasExistingSav, true);
    });

    it("vérifie que Bob n'a pas accès au brouillon d'Alice (isolation des brouillons)", async () => {
      const getBobRes = await request(app)
        .get("/api/workspaces/onboarding/draft")
        .set("Cookie", cookieUserB);

      assert.equal(getBobRes.status, 200);
      assert.equal(getBobRes.body.exists, false, "Bob ne doit pas voir le brouillon d'Alice");
    });
  });

  describe("3. Vérification de l'unicité des noms d'entreprises", () => {
    it("devrait détecter l'indisponibilité d'un nom historique (totale mvoue)", async () => {
      const res = await request(app)
        .get("/api/workspaces/check-name?name=totale+mvoue&country=CG")
        .set("Cookie", cookieUserA);

      assert.equal(res.status, 200);
      assert.equal(res.body.available, false);
      assert.ok(res.body.reason.includes("enregistrée") || res.body.reason.includes("déjà"));
    });

    it("devrait détecter l'indisponibilité même avec accents et espaces superflus (normalisation)", async () => {
      const res = await request(app)
        .get("/api/workspaces/check-name?name=%20%20T%C3%B4tal%C3%A9%20%20Mvou%C3%A9%20%20&country=Congo")
        .set("Cookie", cookieUserA);

      assert.equal(res.status, 200);
      assert.equal(res.body.available, false);
    });

    it("devrait confirmer la disponibilité d'un nom unique", async () => {
      const res = await request(app)
        .get(`/api/workspaces/check-name?name=E2E+Test+Corp+${timestamp}&country=CG`)
        .set("Cookie", cookieUserA);

      assert.equal(res.status, 200);
      assert.equal(res.body.available, true);
    });
  });

  describe("4. Déploiement transactionnel de l'entreprise et purge du draft", () => {
    it("devrait créer le Workspace avec son profil, son membership OWNER et purger le brouillon", async () => {
      const createRes = await request(app)
        .post("/api/workspaces")
        .set("Cookie", cookieUserA)
        .send({
          name: `E2E Test Corp ${timestamp}`,
          country: "Congo",
          city: "Brazzaville",
          sector: "Commerce & Distribution",
          hasExistingSav: true,
          supportMission: "Support client de qualité",
          whatsappNumber: "+242061234567",
          officialSupportName: "SAV E2E Test Corp",
          brandColor: "#0D1B3D",
        });

      assert.equal(createRes.status, 201);
      assert.ok(createRes.body.workspace);
      createdWorkspaceId = createRes.body.workspace.id;
      assert.equal(createRes.body.workspace.name, `E2E Test Corp ${timestamp}`);
      assert.equal(createRes.body.workspace.hasExistingSav, true);

      // Vérifier que le membership est OWNER
      const membership = await prisma.membership.findFirst({
        where: {
          userId: userA.id,
          workspaceId: createdWorkspaceId,
        },
      });
      assert.ok(membership);
      assert.equal(membership.role, "OWNER");

      // Vérifier que le profil agent a été créé
      const agentProfile = await prisma.agentProfile.findFirst({
        where: {
          userId: userA.id,
          workspaceId: createdWorkspaceId,
        },
      });
      assert.ok(agentProfile);

      // Vérifier que le brouillon a été purgé
      const draftRes = await request(app)
        .get("/api/workspaces/onboarding/draft")
        .set("Cookie", cookieUserA);
      assert.equal(draftRes.status, 200);
      assert.equal(draftRes.body.exists, false, "Le brouillon doit être purgé après création");
    });

    it("devrait refuser la création d'un doublon dans le même pays (409 Conflict)", async () => {
      const dupRes = await request(app)
        .post("/api/workspaces")
        .set("Cookie", cookieUserB)
        .send({
          name: `E2E Test Corp ${timestamp}`,
          country: "Congo",
        });

      assert.equal(dupRes.status, 409);
      assert.equal(dupRes.body.success, false);
      assert.equal(dupRes.body.code, "NAME_ALREADY_TAKEN");
    });

    it("devrait autoriser le même nom d'entreprise dans un pays distinct (portée géographique)", async () => {
      const diffCountryRes = await request(app)
        .post("/api/workspaces")
        .set("Cookie", cookieUserB)
        .send({
          name: `E2E Test Corp ${timestamp}`,
          country: "Cameroun", // Cameroun au lieu du Congo
        });

      assert.equal(diffCountryRes.status, 201);
      assert.ok(diffCountryRes.body.workspace);
    });
  });

  describe("5. Contrôle d'accès strict (Vérification que requireAuth bloque les non-membres)", () => {
    it("Bob ne doit JAMAIS pouvoir accéder aux routes du Workspace d'Alice (403)", async () => {
      assert.ok(createdWorkspaceId, "createdWorkspaceId doit être défini");
      const res = await request(app)
        .get(`/api/workspaces/${createdWorkspaceId}/tickets`)
        .set("Cookie", cookieUserB);

      assert.equal(res.status, 403, "Bob doit recevoir une 403 Forbidden");
      assert.equal(res.body.code, "FORBIDDEN_WORKSPACE_ACCESS");
    });
  });
});
