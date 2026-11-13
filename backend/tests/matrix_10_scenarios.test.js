process.env.NODE_ENV = "test";
import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import app from "../src/app.js";
import { prisma } from "../src/lib/prisma.js";
import { hashOtp } from "../src/services/otpService.js";
import { getRedisClient } from "../src/config/redis.js";

describe("Audit & Tests — Matrice de validation Onboarding & Auth Zadesk (10 Scénarios)", () => {
  const timestamp = Date.now();
  const testClassicEmail = `client-test-${timestamp}@zadesk-audit.com`.toLowerCase();
  const testGoogleEmail = `google-test-${timestamp}@zadesk-audit.com`.toLowerCase();
  const testPassword = "PasswordSecure123!";

  let classicUserId = "";
  let classicSessionCookie = "";
  let googleUserId = "";
  let googleSessionCookie = "";
  let draftUserId = "";
  let draftSessionCookie = "";

  before(async () => {
    try {
      await prisma.user.deleteMany({
        where: { email: { contains: "zadesk-audit.com" } },
      });
      await prisma.pendingRegistration.deleteMany({
        where: { email: { contains: "zadesk-audit.com" } },
      });
    } catch (e) {
      console.warn("Cleanup warning:", e.message);
    }
  });

  after(async () => {
    try {
      await prisma.user.deleteMany({
        where: { email: { contains: "zadesk-audit.com" } },
      });
      await prisma.pendingRegistration.deleteMany({
        where: { email: { contains: "zadesk-audit.com" } },
      });
      await prisma.$disconnect();
      const redis = getRedisClient();
      if (redis && redis.status === "ready") {
        await redis.quit();
      }
    } catch (e) {
      // ignore
    }
  });

  // =========================================================================
  // SCÉNARIO 1 — Nouvel utilisateur avec inscription classique
  // =========================================================================
  describe("Scénario 1 — Nouvel utilisateur avec inscription classique", () => {
    it("devrait initialiser l'inscription et finaliser avec OTP vers /app/onboarding", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({
          firstName: "Japhet",
          lastName: "Senior",
          email: testClassicEmail,
          password: testPassword,
        });

      assert.equal(res.status, 200, "Statut 200 attendu");
      assert.equal(res.body.success, true);
      assert.equal(res.body.requiresOtp, true);
      assert.ok(res.body.tempToken, "tempToken requis");

      const pending = await prisma.pendingRegistration.findUnique({
        where: { email: testClassicEmail },
      });
      assert.ok(pending, "Enregistrement temporaire attendu en DB");

      // Inject deterministic OTP hash
      const knownOtp = "123456";
      const knownHash = hashOtp(knownOtp, testClassicEmail);
      await prisma.pendingRegistration.update({
        where: { id: pending.id },
        data: { otpHash: knownHash },
      });

      const verifyRes = await request(app)
        .post("/api/auth/verify-otp")
        .send({
          tempToken: res.body.tempToken,
          otp: knownOtp,
          purpose: "REGISTRATION",
        });

      assert.equal(verifyRes.status, 200);
      assert.equal(verifyRes.body.success, true);
      assert.ok(verifyRes.body.user);
      classicUserId = verifyRes.body.user.id;

      // Check hasWorkspace & redirectTo
      assert.equal(verifyRes.body.hasWorkspace, false, "Un nouvel utilisateur n'a pas encore de workspace");
      assert.equal(verifyRes.body.redirectTo, "/app/onboarding", "Doit être redirigé vers /app/onboarding");

      // Check HttpOnly session cookie
      const cookies = verifyRes.headers["set-cookie"];
      assert.ok(cookies, "Cookie de session attendu");
      classicSessionCookie = cookies.find((c) => c.startsWith("zadesk_session=")).split(";")[0];
    });
  });

  // =========================================================================
  // SCÉNARIO 2 — Connexion classique d'un utilisateur possédant déjà un Workspace
  // =========================================================================
  describe("Scénario 2 — Connexion classique d'un utilisateur possédant déjà un Workspace", () => {
    it("devrait créer un premier Workspace, se déconnecter et se reconnecter vers /app", async () => {
      // 1. Create workspace
      const wsRes = await request(app)
        .post("/api/workspaces")
        .set("Cookie", classicSessionCookie)
        .send({
          name: `Entreprise Japhet ${timestamp}`,
          category: "Commerce et boutique",
          country: "Congo",
          city: "Brazzaville",
          supportWhatsApp: "+242061234567",
        });

      assert.equal(wsRes.status, 201, "Workspace créé avec succès");
      assert.ok(wsRes.body.workspace);

      // 2. Disconnect
      const logoutRes = await request(app)
        .post("/api/auth/logout")
        .set("Cookie", classicSessionCookie);
      assert.equal(logoutRes.status, 200);

      // 3. Initiate login
      const loginRes = await request(app)
        .post("/api/auth/login")
        .send({
          email: testClassicEmail,
          password: testPassword,
        });

      assert.equal(loginRes.status, 200);
      assert.equal(loginRes.body.requiresOtp, true);

      // Set known OTP hash in otpToken table
      const knownOtp = "654321";
      const knownHash = hashOtp(knownOtp, classicUserId);
      await prisma.otpToken.updateMany({
        where: { userId: classicUserId, purpose: "LOGIN" },
        data: { otpHash: knownHash },
      });

      // 4. Finalize login OTP
      const verifyRes = await request(app)
        .post("/api/auth/verify-otp")
        .send({
          tempToken: loginRes.body.tempToken,
          otp: knownOtp,
          purpose: "LOGIN",
        });

      assert.equal(verifyRes.status, 200);
      assert.equal(verifyRes.body.hasWorkspace, true, "L'utilisateur possède désormais un workspace");
      assert.equal(verifyRes.body.redirectTo, "/app", "Doit être redirigé vers /app et non vers onboarding");

      const cookies = verifyRes.headers["set-cookie"];
      classicSessionCookie = cookies.find((c) => c.startsWith("zadesk_session=")).split(";")[0];
    });
  });

  // =========================================================================
  // SCÉNARIO 3 — Connexion Google avec la même adresse qu'un compte classique existant
  // =========================================================================
  describe("Scénario 3 — Connexion Google avec la même adresse qu'un compte classique existant (Liaison sécurisée)", () => {
    it("devrait lier le compte Google sans créer de doublon d'utilisateur ni de workspace, et renvoyer /app", async () => {
      const googleSub = `google-sub-${timestamp}`;
      const mockToken = `mock-google-token:${googleSub}:${testClassicEmail}:true:Japhet:Senior`;

      const res = await request(app)
        .post("/api/auth/google")
        .send({
          credential: mockToken,
          mode: "login",
        });

      assert.equal(res.status, 200, "Statut 200 pour utilisateur existant");
      assert.equal(res.body.success, true);
      assert.equal(res.body.isNewUser, false, "Ce n'est PAS un nouvel utilisateur");
      assert.equal(res.body.user.id, classicUserId, "L'identifiant utilisateur doit être identique au compte initial");
      assert.equal(res.body.hasWorkspace, true, "Doit détecter le workspace existant");
      assert.equal(res.body.redirectTo, "/app", "Doit rediriger vers /app");

      // Verify database state: no duplicate user, googleId linked
      const userInDb = await prisma.user.findUnique({
        where: { id: classicUserId },
        include: { memberships: true },
      });
      assert.equal(userInDb.googleId, googleSub, "Le googleId doit être attaché au compte existant");
      assert.equal(userInDb.memberships.length, 1, "Doit avoir exactement 1 membership, pas de doublon");

      // Verify no duplicate workspace created
      const allWorkspaces = await prisma.workspace.findMany({
        where: {
          memberships: {
            some: { userId: classicUserId },
          },
        },
      });
      assert.equal(allWorkspaces.length, 1, "Un seul workspace doit exister");
    });
  });

  // =========================================================================
  // SCÉNARIO 4 — Connexion Google avec un nouvel utilisateur
  // =========================================================================
  describe("Scénario 4 — Connexion Google avec un nouvel utilisateur", () => {
    it("devrait créer le nouvel utilisateur et le rediriger vers /app/onboarding", async () => {
      const googleSubNew = `google-new-${timestamp}`;
      const mockToken = `mock-google-token:${googleSubNew}:${testGoogleEmail}:true:Alice:Martin`;

      const res = await request(app)
        .post("/api/auth/google")
        .send({
          credential: mockToken,
          mode: "register",
        });

      assert.equal(res.status, 201, "Statut 201 pour nouvel utilisateur");
      assert.equal(res.body.isNewUser, true, "Doit être marqué comme nouvel utilisateur");
      assert.equal(res.body.hasWorkspace, false, "Ne possède pas encore de workspace");
      assert.equal(res.body.redirectTo, "/app/onboarding", "Doit être dirigé vers l'onboarding");
      assert.ok(res.body.user.id);

      googleUserId = res.body.user.id;
      const cookies = res.headers["set-cookie"];
      googleSessionCookie = cookies.find((c) => c.startsWith("zadesk_session=")).split(";")[0];
    });
  });

  // =========================================================================
  // SCÉNARIO 5 — Utilisateur Google possédant déjà un Workspace
  // =========================================================================
  describe("Scénario 5 — Utilisateur Google possédant déjà un Workspace", () => {
    it("devrait reconnaître le Workspace lors d'une reconnexion Google et rediriger vers /app", async () => {
      // 1. Create workspace for this Google user
      const wsRes = await request(app)
        .post("/api/workspaces")
        .set("Cookie", googleSessionCookie)
        .send({
          name: `Boutique Alice ${timestamp}`,
          category: "Beauté et bien-être",
          country: "Congo",
          city: "Pointe-Noire",
        });
      assert.equal(wsRes.status, 201);

      // 2. Re-login via Google
      const googleSubNew = `google-new-${timestamp}`;
      const mockToken = `mock-google-token:${googleSubNew}:${testGoogleEmail}:true:Alice:Martin`;

      const res = await request(app)
        .post("/api/auth/google")
        .send({
          credential: mockToken,
          mode: "login",
        });

      assert.equal(res.status, 200);
      assert.equal(res.body.isNewUser, false);
      assert.equal(res.body.hasWorkspace, true, "Workspace reconnu");
      assert.equal(res.body.redirectTo, "/app", "Redirection immédiate vers /app");
    });
  });

  // =========================================================================
  // SCÉNARIO 6 — Utilisateur sans Workspace qui quitte l'onboarding (« Reprendre plus tard »)
  // =========================================================================
  describe("Scénario 6 — Utilisateur sans Workspace qui quitte l'onboarding (« Reprendre plus tard »)", () => {
    it("devrait sauvegarder le brouillon sans le bloquer dans /app", async () => {
      // Create a fresh user without workspace
      const freshEmail = `draft-user-${timestamp}@zadesk-audit.com`;
      const googleSubDraft = `google-draft-${timestamp}`;
      const mockToken = `mock-google-token:${googleSubDraft}:${freshEmail}:true:Marc:Draft`;

      const regRes = await request(app)
        .post("/api/auth/google")
        .send({ credential: mockToken, mode: "register" });

      assert.equal(regRes.status, 201);
      draftUserId = regRes.body.user.id;
      const cookies = regRes.headers["set-cookie"];
      draftSessionCookie = cookies.find((c) => c.startsWith("zadesk_session=")).split(";")[0];

      // Save draft via PUT /api/workspaces/onboarding/draft
      const draftData = {
        companyName: "Cabinet Express Zadesk",
        sector: "Services",
        country: "Congo",
        city: "Brazzaville",
        supportWhatsApp: "+242069999999",
      };

      const saveRes = await request(app)
        .put("/api/workspaces/onboarding/draft")
        .set("Cookie", draftSessionCookie)
        .send({
          step: 1,
          data: draftData,
        });

      assert.equal(saveRes.status, 200);
      assert.equal(saveRes.body.success, true);
      assert.equal(saveRes.body.data.companyName, "Cabinet Express Zadesk");

      // Verify that /api/auth/me confirms hasWorkspace: false
      // Frontend uses this to redirect to "/" (homepage) rather than "/app", preventing the infinite loop!
      const meRes = await request(app)
        .get("/api/auth/me")
        .set("Cookie", draftSessionCookie);

      assert.equal(meRes.status, 200);
      assert.equal(meRes.body.authenticated, true);
      assert.equal(meRes.body.hasWorkspace, false, "Doit être false pour rediriger vers / sans boucler");
      assert.equal(meRes.body.redirectTo, "/app/onboarding");
    });
  });

  // =========================================================================
  // SCÉNARIO 7 — Utilisateur qui revient après avoir quitté l'onboarding
  // =========================================================================
  describe("Scénario 7 — Utilisateur qui revient après avoir quitté l'onboarding", () => {
    it("devrait restituer fidèlement les données du brouillon sauvegardé", async () => {
      const getDraftRes = await request(app)
        .get("/api/workspaces/onboarding/draft")
        .set("Cookie", draftSessionCookie);

      assert.equal(getDraftRes.status, 200);
      assert.equal(getDraftRes.body.success, true);
      assert.equal(getDraftRes.body.exists, true);
      assert.equal(getDraftRes.body.data.companyName, "Cabinet Express Zadesk");
      assert.equal(getDraftRes.body.data.sector, "Services");
      assert.equal(getDraftRes.body.data.city, "Brazzaville");
      assert.equal(getDraftRes.body.data.country, "Congo");
      assert.equal(getDraftRes.body.data.supportWhatsApp, "+242069999999");
    });
  });

  // =========================================================================
  // SCÉNARIO 8 — Utilisateur qui termine son onboarding puis se reconnecte
  // =========================================================================
  describe("Scénario 8 — Utilisateur qui termine son onboarding puis se reconnecte", () => {
    it("devrait créer le Workspace, purger le brouillon et rediriger vers /app aux reconnexions", async () => {
      // 1. Submit final workspace creation using the draft info
      const createRes = await request(app)
        .post("/api/workspaces")
        .set("Cookie", draftSessionCookie)
        .send({
          name: `Cabinet Express Zadesk ${timestamp}`,
          category: "Services",
          country: "Congo",
          city: "Brazzaville",
          supportWhatsApp: "+242069999999",
        });

      assert.equal(createRes.status, 201);
      assert.ok(createRes.body.workspace);

      // 2. Verify draft was purged from DB
      const draftInDb = await prisma.onboardingDraft.findUnique({
        where: { userId: draftUserId },
      });
      assert.equal(draftInDb, null, "Le brouillon doit être purgé à la création finale");

      // 3. Verify session now has workspace
      const meRes = await request(app)
        .get("/api/auth/me")
        .set("Cookie", draftSessionCookie);

      assert.equal(meRes.status, 200);
      assert.equal(meRes.body.hasWorkspace, true);
      assert.equal(meRes.body.redirectTo, "/app");
    });
  });

  // =========================================================================
  // SCÉNARIO 9 — Tentative de création d'un second Workspace non autorisée
  // =========================================================================
  describe("Scénario 9 — Tentative de création d'un second Workspace non autorisée", () => {
    it("devrait refuser la création avec un code 403 WORKSPACE_ALREADY_EXISTS", async () => {
      const res = await request(app)
        .post("/api/workspaces")
        .set("Cookie", draftSessionCookie)
        .send({
          name: `Deuxieme Entreprise Interdite ${timestamp}`,
          category: "Technologie et informatique",
          country: "Congo",
          city: "Brazzaville",
        });

      assert.equal(res.status, 403, "Code 403 attendu pour tentative de second workspace");
      assert.equal(res.body.success, false);
      assert.equal(res.body.code, "WORKSPACE_ALREADY_EXISTS");
      assert.ok(res.body.message.includes("possédez déjà un espace actif"));
    });
  });

  // =========================================================================
  // SCÉNARIO 10 — Échec d'authentification ou email Google non vérifié
  // =========================================================================
  describe("Scénario 10 — Échec d'authentification ou email Google non vérifié", () => {
    it("devrait rejeter une tentative Google avec un email non vérifié par Google (403)", async () => {
      const unverifiedToken = `mock-google-token:sub-unver:unver@google.com:false:Bob:Unverified`;

      const res = await request(app)
        .post("/api/auth/google")
        .send({
          credential: unverifiedToken,
          mode: "login",
        });

      assert.equal(res.status, 403, "Rejet 403 de sécurité obligatoire");
      assert.equal(res.body.success, false);
      assert.ok(res.body.message.includes("Google"));
      assert.ok(res.body.message.includes("adresse email"));
    });

    it("devrait refuser une connexion classique avec un mot de passe incorrect (401)", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({
          email: testClassicEmail,
          password: "MauvaisPassword999!",
        });

      assert.equal(res.status, 401);
      assert.equal(res.body.success, false);
    });

    it("devrait refuser une sauvegarde de brouillon sans données valides (400)", async () => {
      const res = await request(app)
        .put("/api/workspaces/onboarding/draft")
        .set("Cookie", draftSessionCookie)
        .send({
          step: 999, // step out of range (max is 6)
        });

      assert.equal(res.status, 400);
      assert.equal(res.body.success, false);
    });
  });
});
