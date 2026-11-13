import { describe, it, before, beforeEach, afterEach, after } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { OAuth2Client } from "google-auth-library";
import app from "../src/app.js";
import { prisma } from "../src/lib/prisma.js";
import { env } from "../src/config/env.js";
import { verifyGoogleIdToken } from "../src/lib/google.js";

describe("MISSION — Sécurisation Google OAuth & Résolution Vulnérabilité SEC-01", () => {
  const originalNodeEnv = process.env.NODE_ENV;
  const originalClientId = process.env.GOOGLE_CLIENT_ID;
  const originalVerifyIdToken = OAuth2Client.prototype.verifyIdToken;

  const testDomain = "zadesk-sec01.com";
  const validMockToken = `mock-google-token:sub-sec01-valid:user-sec01-valid@${testDomain}:true:Alice:Sec`;
  const unverifiedMockToken = `mock-google-token:sub-sec01-unver:user-sec01-unver@${testDomain}:false:Bob:Unverified`;

  before(async () => {
    // Nettoyage préalable des enregistrements de test
    await prisma.session.deleteMany({
      where: { user: { email: { contains: testDomain } } },
    });
    await prisma.user.deleteMany({
      where: { email: { contains: testDomain } },
    });
  });

  afterEach(() => {
    // Restauration de l'environnement après chaque test
    process.env.NODE_ENV = originalNodeEnv;
    process.env.GOOGLE_CLIENT_ID = originalClientId;
    OAuth2Client.prototype.verifyIdToken = originalVerifyIdToken;
  });

  after(async () => {
    process.env.NODE_ENV = originalNodeEnv;
    process.env.GOOGLE_CLIENT_ID = originalClientId;
    OAuth2Client.prototype.verifyIdToken = originalVerifyIdToken;

    await prisma.session.deleteMany({
      where: { user: { email: { contains: testDomain } } },
    });
    await prisma.user.deleteMany({
      where: { email: { contains: testDomain } },
    });
  });

  // -------------------------------------------------------------
  // Test 1: Environnement 'test' - mock-google-token valide
  // -------------------------------------------------------------
  it("Test 1 [test] : mock-google-token valide -> Accepté par le mécanisme de test", async () => {
    process.env.NODE_ENV = "test";

    // 1. Appel direct du composant
    const decoded = await verifyGoogleIdToken(validMockToken);
    assert.equal(decoded.sub, "sub-sec01-valid");
    assert.equal(decoded.email, `user-sec01-valid@${testDomain}`);
    assert.equal(decoded.email_verified, true);

    // 2. Appel du flux HTTP complet
    const res = await request(app)
      .post("/api/auth/google")
      .send({ credential: validMockToken, mode: "register" });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.ok(res.body.user, "L'utilisateur créé doit être présent dans le corps de réponse.");
    assert.equal(res.body.isNewUser, true);

    // Vérifier émission du cookie et session
    const setCookie = res.headers["set-cookie"] || [];
    const hasSessionCookie = setCookie.some((c) => c.includes("zadesk_session="));
    assert.ok(hasSessionCookie, "Le cookie zadesk_session doit être présent lors d'une inscription réussie.");
  });

  // -------------------------------------------------------------
  // Test 2: Environnement 'test' - mock-google-token email non vérifié
  // -------------------------------------------------------------
  it("Test 2 [test] : mock-google-token avec email non vérifié -> Refusé", async () => {
    process.env.NODE_ENV = "test";

    // 1. Appel direct
    const decoded = await verifyGoogleIdToken(unverifiedMockToken);
    assert.equal(decoded.email_verified, false);

    // 2. Appel HTTP
    const res = await request(app)
      .post("/api/auth/google")
      .send({ credential: unverifiedMockToken, mode: "register" });

    assert.equal(res.status, 403);
    assert.equal(res.body.success, false);
    assert.ok(res.body.message && res.body.message.includes("Google"), "Le message d'erreur doit mentionner Google.");

    // Vérifier absence de cookie et de session
    const setCookie = res.headers["set-cookie"] || [];
    const hasSessionCookie = setCookie.some((c) => c.includes("zadesk_session="));
    assert.equal(hasSessionCookie, false, "Aucun cookie ne doit être émis pour un email non vérifié.");

    const dbUser = await prisma.user.findUnique({
      where: { email: `user-sec01-unver@${testDomain}` },
    });
    assert.equal(dbUser, null, "Aucun utilisateur ne doit être créé pour un email non vérifié.");
  });

  // -------------------------------------------------------------
  // Test 3: Environnement 'development' - mock-google-token valide
  // -------------------------------------------------------------
  it("Test 3 [development] : mock-google-token valide -> Refusé", async () => {
    process.env.NODE_ENV = "development";

    // 1. Appel direct doit échouer
    await assert.rejects(
      async () => {
        await verifyGoogleIdToken(validMockToken);
      },
      (err) => {
        assert.match(err.message, /mock.*interdit/i);
        return true;
      }
    );

    // 2. Appel HTTP doit être rejeté (HTTP 401)
    const emailDev = `attacker-dev@${testDomain}`;
    const attackerToken = `mock-google-token:sub-dev:${emailDev}:true:Attacker:Dev`;
    const res = await request(app)
      .post("/api/auth/google")
      .send({ credential: attackerToken, mode: "register" });

    assert.equal(res.status, 401);
    assert.equal(res.body.success, false);

    const setCookie = res.headers["set-cookie"] || [];
    const hasSessionCookie = setCookie.some((c) => c.includes("zadesk_session="));
    assert.equal(hasSessionCookie, false, "Aucun cookie de session ne doit être émis.");

    const dbUser = await prisma.user.findUnique({ where: { email: emailDev } });
    assert.equal(dbUser, null, "Aucun utilisateur ne doit être créé.");
  });

  // -------------------------------------------------------------
  // Test 4: Environnement 'staging' - mock-google-token valide
  // -------------------------------------------------------------
  it("Test 4 [staging] : mock-google-token valide -> Refusé", async () => {
    process.env.NODE_ENV = "staging";

    await assert.rejects(
      async () => {
        await verifyGoogleIdToken(validMockToken);
      },
      (err) => {
        assert.match(err.message, /mock.*interdit/i);
        return true;
      }
    );

    const emailStaging = `attacker-staging@${testDomain}`;
    const attackerToken = `mock-google-token:sub-staging:${emailStaging}:true:Attacker:Staging`;
    const res = await request(app)
      .post("/api/auth/google")
      .send({ credential: attackerToken, mode: "register" });

    assert.equal(res.status, 401);
    assert.equal(res.body.success, false);

    const setCookie = res.headers["set-cookie"] || [];
    assert.equal(setCookie.some((c) => c.includes("zadesk_session=")), false);

    const dbUser = await prisma.user.findUnique({ where: { email: emailStaging } });
    assert.equal(dbUser, null);
  });

  // -------------------------------------------------------------
  // Test 5: Environnement 'production' - mock-google-token valide
  // -------------------------------------------------------------
  it("Test 5 [production] : mock-google-token valide -> Refusé", async () => {
    process.env.NODE_ENV = "production";

    await assert.rejects(
      async () => {
        await verifyGoogleIdToken(validMockToken);
      },
      (err) => {
        assert.match(err.message, /mock.*interdit/i);
        return true;
      }
    );

    const emailProd = `attacker-prod@${testDomain}`;
    const attackerToken = `mock-google-token:sub-prod:${emailProd}:true:Attacker:Prod`;
    const res = await request(app)
      .post("/api/auth/google")
      .send({ credential: attackerToken, mode: "register" });

    assert.equal(res.status, 401);
    assert.equal(res.body.success, false);

    const setCookie = res.headers["set-cookie"] || [];
    assert.equal(setCookie.some((c) => c.includes("zadesk_session=")), false);

    const dbUser = await prisma.user.findUnique({ where: { email: emailProd } });
    assert.equal(dbUser, null);
  });

  // -------------------------------------------------------------
  // Test 6: Environnement 'production' - Faux JWT arbitraire
  // -------------------------------------------------------------
  it("Test 6 [production] : Faux JWT arbitraire -> Refusé", async () => {
    process.env.NODE_ENV = "production";
    const fakeArbitraryJwt = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwiZW1haWwiOiJmYWtlQHphZGVzay5jb20ifQ.fakeSignatureValue";

    await assert.rejects(async () => {
      await verifyGoogleIdToken(fakeArbitraryJwt);
    });

    const res = await request(app)
      .post("/api/auth/google")
      .send({ credential: fakeArbitraryJwt, mode: "login" });

    assert.equal(res.status, 401);
    assert.equal(res.body.success, false);

    const setCookie = res.headers["set-cookie"] || [];
    assert.equal(setCookie.some((c) => c.includes("zadesk_session=")), false);
  });

  // -------------------------------------------------------------
  // Test 7: Environnement 'production' - JWT Google invalide
  // -------------------------------------------------------------
  it("Test 7 [production] : JWT Google invalide -> Refusé", async () => {
    process.env.NODE_ENV = "production";
    const invalidGoogleJwt = "invalid.token.structure.not.a.google.jwt";

    await assert.rejects(async () => {
      await verifyGoogleIdToken(invalidGoogleJwt);
    });

    const res = await request(app)
      .post("/api/auth/google")
      .send({ credential: invalidGoogleJwt, mode: "register" });

    assert.equal(res.status, 401);
    assert.equal(res.body.success, false);

    const setCookie = res.headers["set-cookie"] || [];
    assert.equal(setCookie.some((c) => c.includes("zadesk_session=")), false);
  });

  // -------------------------------------------------------------
  // Test 8: Environnement 'production' - JWT Google expiré
  // -------------------------------------------------------------
  it("Test 8 [production] : JWT Google expiré -> Refusé", async () => {
    process.env.NODE_ENV = "production";

    // Simuler le rejet d'expiration par OAuth2Client
    OAuth2Client.prototype.verifyIdToken = async () => {
      throw new Error("Token used too late, exp: 1700000000, now: 1800000000");
    };

    const expiredToken = "eyJhbGciOiJSUzI1NiJ9.expiredToken.sig";
    await assert.rejects(
      async () => {
        await verifyGoogleIdToken(expiredToken);
      },
      (err) => {
        assert.match(err.message, /too late|expiré/i);
        return true;
      }
    );

    const res = await request(app)
      .post("/api/auth/google")
      .send({ credential: expiredToken, mode: "login" });

    assert.equal(res.status, 401);
    assert.equal(res.body.success, false);

    const setCookie = res.headers["set-cookie"] || [];
    assert.equal(setCookie.some((c) => c.includes("zadesk_session=")), false);
  });

  // -------------------------------------------------------------
  // Test 9: Environnement 'production' - JWT avec mauvaise audience
  // -------------------------------------------------------------
  it("Test 9 [production] : JWT avec mauvaise audience -> Refusé", async () => {
    process.env.NODE_ENV = "production";

    OAuth2Client.prototype.verifyIdToken = async () => {
      throw new Error("Wrong recipient, payload audience != requiredAudience");
    };

    const wrongAudToken = "eyJhbGciOiJSUzI1NiJ9.wrongAudienceToken.sig";
    await assert.rejects(
      async () => {
        await verifyGoogleIdToken(wrongAudToken);
      },
      (err) => {
        assert.match(err.message, /Wrong recipient|audience/i);
        return true;
      }
    );

    const res = await request(app)
      .post("/api/auth/google")
      .send({ credential: wrongAudToken, mode: "register" });

    assert.equal(res.status, 401);
    assert.equal(res.body.success, false);

    const setCookie = res.headers["set-cookie"] || [];
    assert.equal(setCookie.some((c) => c.includes("zadesk_session=")), false);
  });

  // -------------------------------------------------------------
  // Test 10: Environnement 'production' - JWT avec signature invalide
  // -------------------------------------------------------------
  it("Test 10 [production] : JWT avec signature invalide -> Refusé", async () => {
    process.env.NODE_ENV = "production";

    OAuth2Client.prototype.verifyIdToken = async () => {
      throw new Error("Invalid token signature: signature verification failed");
    };

    const badSigToken = "eyJhbGciOiJSUzI1NiJ9.badSigToken.sig";
    await assert.rejects(
      async () => {
        await verifyGoogleIdToken(badSigToken);
      },
      (err) => {
        assert.match(err.message, /signature/i);
        return true;
      }
    );

    const res = await request(app)
      .post("/api/auth/google")
      .send({ credential: badSigToken, mode: "login" });

    assert.equal(res.status, 401);
    assert.equal(res.body.success, false);

    const setCookie = res.headers["set-cookie"] || [];
    assert.equal(setCookie.some((c) => c.includes("zadesk_session=")), false);
  });

  // -------------------------------------------------------------
  // Test 11: Environnement 'production' - JWT Google valide et vérifié cryptographiquement
  // -------------------------------------------------------------
  it("Test 11 [production] : JWT Google valide et vérifié -> Accepté si autres contrôles réussissent", async () => {
    process.env.NODE_ENV = "production";
    const prodValidEmail = `legit-prod-user@${testDomain}`;
    const prodGoogleSub = "google-sub-prod-crypto-verified-99999";
    const clientId = process.env.GOOGLE_CLIENT_ID || env.GOOGLE_CLIENT_ID;

    // Simulation contrôlée du ticket officiel retourné par Google sans accès réseau externe
    OAuth2Client.prototype.verifyIdToken = async function ({ idToken, audience }) {
      if (idToken === "valid.prod.cryptographic.jwt.token" && audience === clientId) {
        return {
          getPayload: () => ({
            sub: prodGoogleSub,
            email: prodValidEmail,
            email_verified: true,
            given_name: "Jean",
            family_name: "Légitime",
            name: "Jean Légitime",
            picture: "https://lh3.googleusercontent.com/legit.jpg",
            iss: "https://accounts.google.com",
            aud: clientId,
            exp: Math.floor(Date.now() / 1000) + 3600,
          }),
        };
      }
      throw new Error("Token validation failed");
    };

    // 1. Validation directe du composant
    const decoded = await verifyGoogleIdToken("valid.prod.cryptographic.jwt.token");
    assert.equal(decoded.sub, prodGoogleSub);
    assert.equal(decoded.email, prodValidEmail);
    assert.equal(decoded.email_verified, true);
    assert.equal(decoded.name, "Jean Légitime");

    // 2. Validation du flux HTTP complet
    const res = await request(app)
      .post("/api/auth/google")
      .send({ credential: "valid.prod.cryptographic.jwt.token", mode: "register" });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.ok(res.body.user, "L'utilisateur légitime créé doit être renvoyé.");
    assert.equal(res.body.user.email, prodValidEmail);

    // Vérifier création effective de l'utilisateur et de la session en base
    const dbUser = await prisma.user.findUnique({
      where: { email: prodValidEmail },
    });
    assert.ok(dbUser, "L'utilisateur légitime vérifié doit être créé.");
    assert.equal(dbUser.googleId, prodGoogleSub);

    const dbSession = await prisma.session.findFirst({
      where: { userId: dbUser.id },
    });
    assert.ok(dbSession, "Une session valide doit être créée en base.");

    const setCookie = res.headers["set-cookie"] || [];
    assert.ok(setCookie.some((c) => c.includes("zadesk_session=")), "Le cookie zadesk_session doit être émis.");
  });

  // -------------------------------------------------------------
  // Test 12: Environnement 'production' - GOOGLE_CLIENT_ID absent
  // -------------------------------------------------------------
  it("Test 12 [production] : GOOGLE_CLIENT_ID absent -> Refus sécurisé", async () => {
    process.env.NODE_ENV = "production";
    process.env.GOOGLE_CLIENT_ID = "";

    // 1. Appel direct
    await assert.rejects(
      async () => {
        await verifyGoogleIdToken("some.token.value");
      },
      (err) => {
        assert.match(err.message, /GOOGLE_CLIENT_ID non configuré/i);
        return true;
      }
    );

    // 2. Appel HTTP
    const res = await request(app)
      .post("/api/auth/google")
      .send({ credential: "some.token.value", mode: "login" });

    assert.equal(res.status, 401);
    assert.equal(res.body.success, false);

    const setCookie = res.headers["set-cookie"] || [];
    assert.equal(setCookie.some((c) => c.includes("zadesk_session=")), false);
  });
});
