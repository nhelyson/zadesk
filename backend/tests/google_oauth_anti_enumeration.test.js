process.env.NODE_ENV = "test";
import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import app from "../src/app.js";
import { prisma } from "../src/lib/prisma.js";
import { NEUTRAL_AUTH_ERROR_MESSAGE } from "../src/services/authService.js";

describe("MISSION — Validation Complète Google OAuth : Expérience Utilisateur et Anti-Énumération", () => {
  const ts = Date.now();
  const testDomain = `test-enum-${ts}.com`;

  // Identités pour les 4 scénarios
  const unknownUserSub1 = `sub-google-new-${ts}`;
  const unknownUserEmail1 = `new-user-${ts}@${testDomain}`;
  const mockTokenUnknown1 = `mock-google-token:${unknownUserSub1}:${unknownUserEmail1}:true:New:User`;

  const existingUserSub = `sub-google-exist-${ts}`;
  const existingUserEmail = `exist-user-${ts}@${testDomain}`;
  const mockTokenExisting = `mock-google-token:${existingUserSub}:${existingUserEmail}:true:Existing:User`;

  const unknownUserSub2 = `sub-google-unknown-login-${ts}`;
  const unknownUserEmail2 = `unknown-login-${ts}@${testDomain}`;
  const mockTokenUnknown2 = `mock-google-token:${unknownUserSub2}:${unknownUserEmail2}:true:Unknown:Login`;

  let createdExistingUserId = null;

  before(async () => {
    // Nettoyer les données résiduelles éventuelles
    await prisma.session.deleteMany({
      where: { user: { email: { contains: testDomain } } },
    });
    await prisma.user.deleteMany({
      where: { email: { contains: testDomain } },
    });
  });

  after(async () => {
    await prisma.session.deleteMany({
      where: { user: { email: { contains: testDomain } } },
    });
    await prisma.user.deleteMany({
      where: { email: { contains: testDomain } },
    });
  });

  // =========================================================================
  // SCÉNARIO 1 — Inscription avec compte Google inconnu
  // =========================================================================
  it("Scénario 1 : Inscription avec compte Google inconnu -> Succès (201 Created), session émise, onboarding", async () => {
    const res = await request(app)
      .post("/api/auth/google")
      .set("Referer", "http://localhost/register")
      .send({
        credential: mockTokenUnknown1,
        mode: "register",
      });

    assert.equal(res.status, 201, "Doit retourner HTTP 201 Created");
    assert.equal(res.body.success, true, "Success doit être true");
    assert.equal(res.body.isNewUser, true, "isNewUser doit être true");
    assert.equal(res.body.redirectTo, "/app/onboarding", "Doit rediriger vers l'onboarding");
    assert.ok(res.body.user && res.body.user.id, "L'utilisateur créé doit avoir un ID");

    // Vérifier la présence du cookie de session
    const setCookie = res.headers["set-cookie"] || [];
    const hasSessionCookie = setCookie.some((c) => c.includes("zadesk_session="));
    assert.equal(hasSessionCookie, true, "Un cookie de session doit être émis");

    // Vérifier en base de données
    const userInDb = await prisma.user.findUnique({
      where: { email: unknownUserEmail1 },
    });
    assert.ok(userInDb, "L'utilisateur doit exister dans la base");
    assert.equal(userInDb.googleId, unknownUserSub1, "Le Google ID doit correspondre");
  });

  // =========================================================================
  // SCÉNARIO 2 — Inscription avec compte Google existant
  // =========================================================================
  it("Scénario 2 : Inscription avec compte Google déjà existant -> Refus 409, message neutre, AUCUNE session", async () => {
    // 1. Créer le compte existant au préalable
    const setupRes = await request(app)
      .post("/api/auth/google")
      .set("Referer", "http://localhost/register")
      .send({
        credential: mockTokenExisting,
        mode: "register",
      });
    assert.equal(setupRes.status, 201);
    createdExistingUserId = setupRes.body.user.id;

    // 2. Tenter une seconde inscription depuis /register avec le même compte
    const res = await request(app)
      .post("/api/auth/google")
      .set("Referer", "http://localhost/register")
      .send({
        credential: mockTokenExisting,
        mode: "register",
      });

    assert.equal(res.status, 409, "Doit retourner HTTP 409 Conflict");
    assert.equal(res.body.success, false, "Success doit être false");
    assert.equal(
      res.body.message,
      NEUTRAL_AUTH_ERROR_MESSAGE,
      "Le message doit être exactement le message neutre anti-énumération"
    );

    // Aucune session émise
    const setCookie = res.headers["set-cookie"] || [];
    const hasSessionCookie = setCookie.some((c) => c.includes("zadesk_session="));
    assert.equal(hasSessionCookie, false, "Aucun cookie de session ne doit être émis");

    // Vérifier qu'aucun doublon n'a été créé
    const usersCount = await prisma.user.count({
      where: { email: existingUserEmail },
    });
    assert.equal(usersCount, 1, "Un seul utilisateur doit exister pour cet email");
  });

  // =========================================================================
  // SCÉNARIO 3 — Connexion avec compte Google existant
  // =========================================================================
  it("Scénario 3 : Connexion avec compte Google existant -> Succès (200 OK), session émise, dashboard", async () => {
    const res = await request(app)
      .post("/api/auth/google")
      .set("Referer", "http://localhost/login")
      .send({
        credential: mockTokenExisting,
        mode: "login",
      });

    assert.equal(res.status, 200, "Doit retourner HTTP 200 OK");
    assert.equal(res.body.success, true, "Success doit être true");
    assert.equal(res.body.isNewUser, false, "isNewUser doit être false");
    assert.equal(res.body.user.id, createdExistingUserId, "Doit correspondre à l'utilisateur existant");
    assert.ok(res.body.redirectTo, "Doit fournir une URL de redirection");

    // Session émise
    const setCookie = res.headers["set-cookie"] || [];
    const hasSessionCookie = setCookie.some((c) => c.includes("zadesk_session="));
    assert.equal(hasSessionCookie, true, "Un cookie de session doit être émis");
  });

  // =========================================================================
  // SCÉNARIO 4 — Connexion avec compte Google inconnu
  // =========================================================================
  it("Scénario 4 : Connexion avec compte Google inconnu -> Refus 409, EXACT MÊME message neutre, AUCUN compte créé", async () => {
    const res = await request(app)
      .post("/api/auth/google")
      .set("Referer", "http://localhost/login")
      .send({
        credential: mockTokenUnknown2,
        mode: "login",
      });

    assert.equal(res.status, 409, "Doit retourner HTTP 409 Conflict (uniformité stricte avec Scénario 2)");
    assert.equal(res.body.success, false, "Success doit être false");
    assert.equal(
      res.body.message,
      NEUTRAL_AUTH_ERROR_MESSAGE,
      "Le message doit être STRICTEMENT IDENTIQUE au Scénario 2"
    );

    // Aucune session émise
    const setCookie = res.headers["set-cookie"] || [];
    const hasSessionCookie = setCookie.some((c) => c.includes("zadesk_session="));
    assert.equal(hasSessionCookie, false, "Aucun cookie de session ne doit être émis");

    // Vérifier qu'aucun compte n'a été créé
    const userInDb = await prisma.user.findUnique({
      where: { email: unknownUserEmail2 },
    });
    assert.equal(userInDb, null, "Aucun compte ne doit être créé pour un utilisateur inconnu tentant de se connecter");
  });

  // =========================================================================
  // SCÉNARIO 5 — Vérification du message public en environnement de production
  // =========================================================================
  it("Scénario 5 : En production, les codes internes (ACCOUNT_ALREADY_EXISTS / USER_NOT_FOUND) ne sont pas exposés", async () => {
    const prevEnv = process.env.NODE_ENV;
    const { OAuth2Client } = await import("google-auth-library");
    const origVerify = OAuth2Client.prototype.verifyIdToken;

    try {
      process.env.NODE_ENV = "production";

      // Mock verifyIdToken de google-auth-library pour simuler un vrai token Google vérifié
      OAuth2Client.prototype.verifyIdToken = async ({ idToken }) => {
        if (idToken === "real-prod-mock-existing") {
          return {
            getPayload: () => ({
              sub: existingUserSub,
              email: existingUserEmail,
              email_verified: true,
              given_name: "Prod",
              family_name: "Exist",
            }),
          };
        }
        return {
          getPayload: () => ({
            sub: unknownUserSub2,
            email: unknownUserEmail2,
            email_verified: true,
            given_name: "Prod",
            family_name: "Unknown",
          }),
        };
      };

      // Test 5A : Refus d'inscription (compte existant)
      const resReg = await request(app)
        .post("/api/auth/google")
        .set("Referer", "http://localhost/register")
        .send({ credential: "real-prod-mock-existing", mode: "register" });

      assert.equal(resReg.status, 409);
      assert.equal(resReg.body.code, undefined, "Le champ 'code' ne doit pas être exposé publiquement en production");
      assert.equal(resReg.body.message, NEUTRAL_AUTH_ERROR_MESSAGE);

      // Test 5B : Refus de connexion (compte inconnu)
      const resLog = await request(app)
        .post("/api/auth/google")
        .set("Referer", "http://localhost/login")
        .send({ credential: "real-prod-mock-unknown", mode: "login" });

      assert.equal(resLog.status, 409);
      assert.equal(resLog.body.code, undefined, "Le champ 'code' ne doit pas être exposé publiquement en production");
      assert.equal(resLog.body.message, NEUTRAL_AUTH_ERROR_MESSAGE);
    } finally {
      process.env.NODE_ENV = prevEnv;
      OAuth2Client.prototype.verifyIdToken = origVerify;
    }
  });
});
