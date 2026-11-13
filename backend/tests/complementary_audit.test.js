process.env.NODE_ENV = "test";
import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import app from "../src/app.js";
import { prisma } from "../src/lib/prisma.js";
import { hashOtp } from "../src/services/otpService.js";
import { verifyPassword } from "../src/lib/password.js";
import { cacheService } from "../src/cache/cacheService.js";

describe("AUDIT COMPLÉMENTAIRE — Validation réelle Auth & Onboarding Zadesk", () => {
  const timestamp = Date.now();
  const testEmailA = `audit-a-${timestamp}@zadesk-test.com`.toLowerCase();
  const testEmailB = `audit-b-${timestamp}@zadesk-test.com`.toLowerCase();
  const testPassword = "ComplexPassword123!";

  let userAId = "";
  let userASessionCookie = "";
  let userBId = "";
  let userBSessionCookie = "";
  let workspaceAId = "";

  before(async () => {
    // Cleanup any audit leftovers
    try {
      await prisma.user.deleteMany({
        where: { email: { contains: "zadesk-test.com" } },
      });
      await prisma.pendingRegistration.deleteMany({
        where: { email: { contains: "zadesk-test.com" } },
      });
    } catch (e) {
      console.warn("Cleanup warning:", e.message);
    }
  });

  after(async () => {
    try {
      await prisma.user.deleteMany({
        where: { email: { contains: "zadesk-test.com" } },
      });
      await prisma.pendingRegistration.deleteMany({
        where: { email: { contains: "zadesk-test.com" } },
      });
      await prisma.$disconnect();
    } catch (e) {
      // ignore
    }
  });

  // =========================================================================
  // 1. SÉCURITÉ DE LA LIAISON GOOGLE
  // =========================================================================
  describe("1. Sécurité de la liaison Google", () => {
    it("1.1. Doit rejeter la liaison d'un compte classique si l'email Google n'est pas vérifié (403)", async () => {
      // Create user A via registration + OTP
      const regRes = await request(app)
        .post("/api/auth/register")
        .send({
          firstName: "Jean",
          lastName: "Audit",
          email: testEmailA,
          password: testPassword,
        });

      assert.equal(regRes.status, 200);

      const knownOtp = "123456";
      const knownHash = hashOtp(knownOtp, testEmailA);
      await prisma.pendingRegistration.update({
        where: { email: testEmailA },
        data: { otpHash: knownHash },
      });

      const verifyRes = await request(app)
        .post("/api/auth/verify-otp")
        .send({
          tempToken: regRes.body.tempToken,
          otp: knownOtp,
          purpose: "REGISTRATION",
        });

      assert.equal(verifyRes.status, 200);
      userAId = verifyRes.body.user.id;
      userASessionCookie = verifyRes.headers["set-cookie"].find((c) => c.startsWith("zadesk_session=")).split(";")[0];

      // Attempt to link with Google token having email_verified: false
      const unverifiedGoogleToken = `mock-google-token:sub-unverified-a:${testEmailA}:false:Jean:Audit`;
      const linkRes = await request(app)
        .post("/api/auth/google")
        .send({
          credential: unverifiedGoogleToken,
          mode: "login",
        });

      assert.equal(linkRes.status, 403, "Une adresse Google non vérifiée doit impérativement être rejetée avec 403");
      assert.equal(linkRes.body.success, false);
      assert.ok(linkRes.body.message.includes("Google"));

      // Verify that userA in DB does NOT have googleId set
      const userInDb = await prisma.user.findUnique({ where: { id: userAId } });
      assert.equal(userInDb.googleId, null, "Le googleId ne doit pas être rattaché si le token Google est non vérifié");
    });

    it("1.2. Que se passe-t-il si le googleId appartient déjà à un autre utilisateur ?", async () => {
      // Step A: Link User A to Google with a verified token sub_alpha
      const googleSubAlpha = `sub-alpha-${timestamp}`;
      const validTokenA = `mock-google-token:${googleSubAlpha}:${testEmailA}:true:Jean:Audit`;

      const linkARes = await request(app)
        .post("/api/auth/google")
        .send({ credential: validTokenA, mode: "login" });

      assert.equal(linkARes.status, 200);
      assert.equal(linkARes.body.user.id, userAId);

      // Verify User A has googleId = googleSubAlpha
      const checkUserA = await prisma.user.findUnique({ where: { id: userAId } });
      assert.equal(checkUserA.googleId, googleSubAlpha);

      // Step B: Create a second user B with email B
      const regBRes = await request(app)
        .post("/api/auth/register")
        .send({
          firstName: "Pierre",
          lastName: "Audit",
          email: testEmailB,
          password: testPassword,
        });

      assert.equal(regBRes.status, 200);

      const knownOtp = "123456";
      const knownHash = hashOtp(knownOtp, testEmailB);
      await prisma.pendingRegistration.update({
        where: { email: testEmailB },
        data: { otpHash: knownHash },
      });

      const verifyBRes = await request(app)
        .post("/api/auth/verify-otp")
        .send({
          tempToken: regBRes.body.tempToken,
          otp: knownOtp,
          purpose: "REGISTRATION",
        });

      assert.equal(verifyBRes.status, 200);
      userBId = verifyBRes.body.user.id;
      userBSessionCookie = verifyBRes.headers["set-cookie"].find((c) => c.startsWith("zadesk_session=")).split(";")[0];

      // Step C: An incoming Google request arrives with sub_alpha (which belongs to User A),
      // but claiming email B!
      // In authService: findUserByGoogleId(sub_alpha) MUST match User A first!
      const conflictingToken = `mock-google-token:${googleSubAlpha}:${testEmailB}:true:Conflicting:User`;
      const conflictRes = await request(app)
        .post("/api/auth/google")
        .send({ credential: conflictingToken, mode: "login" });

      // Verification: The session MUST be for User A (the real owner of sub_alpha)
      // and NOT User B! It MUST NOT hijack User B or attach sub_alpha to User B!
      assert.equal(conflictRes.status, 200);
      assert.equal(conflictRes.body.user.id, userAId, "Doit identifier l'utilisateur réel propriétaire du googleId");
      assert.notEqual(conflictRes.body.user.id, userBId, "Ne doit JAMAIS écraser ou s'attacher à un autre utilisateur");

      // Check User B in DB: googleId must still be null
      const checkUserB = await prisma.user.findUnique({ where: { id: userBId } });
      assert.equal(checkUserB.googleId, null, "L'utilisateur B ne doit pas avoir reçu le googleId d'un autre");
    });

    it("1.3. Deux requêtes simultanées ne peuvent pas rattacher la même identité à deux utilisateurs (Contrainte DB)", async () => {
      const duplicateSub = `sub-unique-constraint-${timestamp}`;

      // Simulate concurrency: try to directly set the same googleId on both user A and user B
      // PostgreSQL unique constraint 'users_googleId_key' MUST prevent this!
      let p2002Caught = false;
      try {
        await prisma.$transaction([
          prisma.user.update({
            where: { id: userAId },
            data: { googleId: duplicateSub },
          }),
          prisma.user.update({
            where: { id: userBId },
            data: { googleId: duplicateSub },
          }),
        ]);
      } catch (err) {
        if (err.code === "P2002" || err.message.includes("Unique constraint")) {
          p2002Caught = true;
        }
      }

      assert.equal(p2002Caught, true, "PostgreSQL doit lever une violation de contrainte d'unicité P2002");
    });

    it("1.4. La liaison conserve les mots de passe, rôles, memberships et permissions existants", async () => {
      // 1. Create a workspace for User A
      const wsRes = await request(app)
        .post("/api/workspaces")
        .set("Cookie", userASessionCookie)
        .send({
          name: `Entreprise Alpha ${timestamp}`,
          category: "Commerce et boutique",
          country: "Congo",
          city: "Brazzaville",
        });

      assert.equal(wsRes.status, 201);
      workspaceAId = wsRes.body.workspace.id;

      // 2. User A links/refreshes Google account
      const refreshSub = `sub-refreshed-${timestamp}`;
      const refreshToken = `mock-google-token:${refreshSub}:${testEmailA}:true:Jean:Audit`;

      const linkRes = await request(app)
        .post("/api/auth/google")
        .send({ credential: refreshToken, mode: "login" });

      assert.equal(linkRes.status, 200);

      // 3. Verify in DB that:
      // a) Password hash is NOT null and is still valid
      const userInDb = await prisma.user.findUnique({
        where: { id: userAId },
        include: { memberships: true },
      });

      assert.ok(userInDb.passwordHash, "Le passwordHash ne doit jamais être effacé ou écrasé par Google");
      const isPasswordStillValid = await verifyPassword(testPassword, userInDb.passwordHash);
      assert.equal(isPasswordStillValid, true, "Le mot de passe d'origine doit toujours être valide");

      // b) Memberships and Roles are intact
      assert.equal(userInDb.memberships.length, 1);
      assert.equal(userInDb.memberships[0].role, "OWNER", "Le rôle OWNER doit être préservé");
      assert.equal(userInDb.memberships[0].workspaceId, workspaceAId);
    });

    it("1.5. La vérification Google utilise un jeton validé côté serveur", async () => {
      // An invalid random token that does not match server signature
      const badToken = "invalid-unverified-random-token-xyz-123456";
      const res = await request(app)
        .post("/api/auth/google")
        .send({ credential: badToken, mode: "login" });

      assert.equal(res.status, 401, "Tout jeton non signé par Google doit être rejeté côté serveur avec 401");
      assert.equal(res.body.success, false);
    });
  });

  // =========================================================================
  // 2. COHÉRENCE DES WORKSPACES
  // =========================================================================
  describe("2. Cohérence des Workspaces", () => {
    let memberUserId = "";
    let memberSessionCookie = "";
    let deletedOwnerUserId = "";
    let deletedOwnerSessionCookie = "";

    it("2.1. OWNER d'un Workspace actif : hasWorkspace=true, redirectTo=/app, direct API call bloqué (403)", async () => {
      // Check me endpoint
      const meRes = await request(app)
        .get("/api/auth/me")
        .set("Cookie", userASessionCookie);

      assert.equal(meRes.status, 200);
      assert.equal(meRes.body.hasWorkspace, true);
      assert.equal(meRes.body.redirectTo, "/app");

      // Direct API attempt to create a second workspace
      const createAgainRes = await request(app)
        .post("/api/workspaces")
        .set("Cookie", userASessionCookie)
        .send({
          name: `Second Workspace Interdit ${timestamp}`,
          category: "Services",
          country: "Congo",
          city: "Brazzaville",
        });

      assert.equal(createAgainRes.status, 403, "L'API doit rejeter directement avec 403");
      assert.equal(createAgainRes.body.code, "WORKSPACE_ALREADY_EXISTS");
    });

    it("2.2. MEMBER d'un Workspace actif (rôle AGENT/ADMIN/MANAGER) : hasWorkspace=true, redirectTo=/app", async () => {
      // Invite User B as AGENT to Workspace A
      const invRes = await request(app)
        .post(`/api/workspaces/${workspaceAId}/invitations`)
        .set("Cookie", userASessionCookie)
        .send({
          email: testEmailB,
          role: "AGENT",
        });

      assert.ok(invRes.status === 200 || invRes.status === 201);
      const token = invRes.body.invitation?.token || invRes.body.token;

      // User B accepts invitation
      const acceptRes = await request(app)
        .post(`/api/workspaces/invitations/${token}/accept`)
        .set("Cookie", userBSessionCookie);

      assert.equal(acceptRes.status, 200);

      // Now User B is MEMBER (AGENT) of Workspace A
      const meBRes = await request(app)
        .get("/api/auth/me")
        .set("Cookie", userBSessionCookie);

      assert.equal(meBRes.status, 200);
      assert.equal(meBRes.body.hasWorkspace, true, "Un membre invité possède un workspace actif");
      assert.equal(meBRes.body.redirectTo, "/app", "Un membre invité doit être redirigé vers /app et non vers onboarding");
    });

    it("2.3. Utilisateur sans Workspace : hasWorkspace=false, redirectTo=/app/onboarding", async () => {
      const freshEmail = `noworkspace-${timestamp}@zadesk-test.com`.toLowerCase();
      const googleToken = `mock-google-token:sub-no-ws-${timestamp}:${freshEmail}:true:Solo:User`;

      const regRes = await request(app)
        .post("/api/auth/google")
        .send({ credential: googleToken, mode: "register" });

      assert.equal(regRes.status, 201);
      assert.equal(regRes.body.hasWorkspace, false);
      assert.equal(regRes.body.redirectTo, "/app/onboarding");

      const sessionCookie = regRes.headers["set-cookie"].find((c) => c.startsWith("zadesk_session=")).split(";")[0];

      const meRes = await request(app)
        .get("/api/auth/me")
        .set("Cookie", sessionCookie);

      assert.equal(meRes.body.hasWorkspace, false);
      assert.equal(meRes.body.redirectTo, "/app/onboarding");
    });

    it("2.4. OWNER d'un Workspace supprimé : bascule hasWorkspace=false, réouverture onboarding", async () => {
      // Create user with workspace
      const delEmail = `deleted-owner-${timestamp}@zadesk-test.com`.toLowerCase();
      const delToken = `mock-google-token:sub-del-${timestamp}:${delEmail}:true:Dave:Delete`;

      const regRes = await request(app)
        .post("/api/auth/google")
        .send({ credential: delToken, mode: "register" });

      deletedOwnerUserId = regRes.body.user.id;
      deletedOwnerSessionCookie = regRes.headers["set-cookie"].find((c) => c.startsWith("zadesk_session=")).split(";")[0];

      const wsRes = await request(app)
        .post("/api/workspaces")
        .set("Cookie", deletedOwnerSessionCookie)
        .send({
          name: `Workspace A Supprimer ${timestamp}`,
          country: "Congo",
          city: "Brazzaville",
        });

      assert.equal(wsRes.status, 201);
      const wsToDeleteId = wsRes.body.workspace.id;

      // Delete the workspace in DB (cascade delete on memberships)
      await prisma.workspace.delete({ where: { id: wsToDeleteId } });

      // Check /api/auth/me again
      const meRes = await request(app)
        .get("/api/auth/me")
        .set("Cookie", deletedOwnerSessionCookie);

      assert.equal(meRes.status, 200);
      assert.equal(meRes.body.hasWorkspace, false, "Après suppression du workspace, hasWorkspace doit être false");
      assert.equal(meRes.body.redirectTo, "/app/onboarding", "Doit être redirigé vers l'onboarding pour recréer son espace");
    });

    it("2.5. Utilisateur membre de plusieurs Workspaces : liste complète dans /workspaces et redirectTo=/app", async () => {
      // User B is already an AGENT in Workspace A.
      // Now let's create a second workspace where User B is also an agent
      const ws2 = await prisma.workspace.create({
        data: {
          name: `Second Workspace Partagé ${timestamp}`,
          slug: `second-ws-shared-${timestamp}`,
          normalizedName: `second-ws-shared-${timestamp}`,
          country: "Congo",
        },
      });

      await prisma.membership.create({
        data: {
          userId: userBId,
          workspaceId: ws2.id,
          role: "AGENT",
        },
      });

      // Clear cache
      await cacheService.del(`user:${userBId}:workspaces`);

      const listRes = await request(app)
        .get("/api/workspaces")
        .set("Cookie", userBSessionCookie);

      assert.equal(listRes.status, 200);
      assert.ok(listRes.body.workspaces.length >= 2, "L'utilisateur multi-espaces doit avoir tous ses espaces listés");

      const meBRes = await request(app)
        .get("/api/auth/me")
        .set("Cookie", userBSessionCookie);

      assert.equal(meBRes.body.hasWorkspace, true);
      assert.equal(meBRes.body.redirectTo, "/app");
    });
  });

  // =========================================================================
  // 3. SAUVEGARDE DU BROUILLON
  // =========================================================================
  describe("3. Sauvegarde du brouillon", () => {
    let draftUserSessionCookie = "";
    let draftUserId = "";

    it("3.1 & 3.3. Sauvegarde immédiate avec toutes les modifications récentes (bypasse le debounce)", async () => {
      const email = `draft-test-${timestamp}@zadesk-test.com`.toLowerCase();
      const token = `mock-google-token:sub-draft-${timestamp}:${email}:true:Sophie:Draft`;

      const regRes = await request(app)
        .post("/api/auth/google")
        .send({ credential: token, mode: "register" });

      draftUserId = regRes.body.user.id;
      draftUserSessionCookie = regRes.headers["set-cookie"].find((c) => c.startsWith("zadesk_session=")).split(";")[0];

      // Send draft update
      const draftPayload = {
        companyName: "Clinique Moderne de l'Avenir",
        sector: "Beauté et bien-être",
        country: "Congo",
        city: "Brazzaville",
        supportWhatsApp: "+242055555555",
      };

      const putRes = await request(app)
        .put("/api/workspaces/onboarding/draft")
        .set("Cookie", draftUserSessionCookie)
        .send({
          step: 1,
          data: draftPayload,
        });

      assert.equal(putRes.status, 200);
      assert.equal(putRes.body.success, true);
      assert.equal(putRes.body.data.companyName, "Clinique Moderne de l'Avenir");
      assert.equal(putRes.body.data.supportWhatsApp, "+242055555555");
    });

    it("3.4. Restauration fidèle du brouillon après déconnexion et reconnexion", async () => {
      // 1. Logout
      const logoutRes = await request(app)
        .post("/api/auth/logout")
        .set("Cookie", draftUserSessionCookie);
      assert.equal(logoutRes.status, 200);

      // 2. Re-login via Google
      const email = `draft-test-${timestamp}@zadesk-test.com`.toLowerCase();
      const token = `mock-google-token:sub-draft-${timestamp}:${email}:true:Sophie:Draft`;

      const loginRes = await request(app)
        .post("/api/auth/google")
        .send({ credential: token, mode: "login" });

      assert.equal(loginRes.status, 200);
      const newCookie = loginRes.headers["set-cookie"].find((c) => c.startsWith("zadesk_session=")).split(";")[0];

      // 3. Fetch draft
      const getDraftRes = await request(app)
        .get("/api/workspaces/onboarding/draft")
        .set("Cookie", newCookie);

      assert.equal(getDraftRes.status, 200);
      assert.equal(getDraftRes.body.exists, true);
      assert.equal(getDraftRes.body.data.companyName, "Clinique Moderne de l'Avenir");
      assert.equal(getDraftRes.body.data.sector, "Beauté et bien-être");
      assert.equal(getDraftRes.body.data.city, "Brazzaville");
      assert.equal(getDraftRes.body.data.country, "Congo");
      assert.equal(getDraftRes.body.data.supportWhatsApp, "+242055555555");
    });
  });
});
