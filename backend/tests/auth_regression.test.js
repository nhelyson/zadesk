import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import app from "../src/app.js";
import { prisma } from "../src/lib/prisma.js";
import { createUser } from "../src/services/userService.js";
import { createSession } from "../src/services/sessionService.js";

describe("Zadesk Authentication & SAV Public Strict Regression Test Suite", () => {
  const timestamp = Date.now();
  const testEmail = `reg-user-${timestamp}@test.zadesk.com`;

  before(async () => {
    try {
      await prisma.session.deleteMany({
        where: { user: { email: { contains: "test.zadesk.com" } } },
      }).catch(() => {});
      await prisma.user.deleteMany({
        where: { email: { contains: "test.zadesk.com" } },
      }).catch(() => {});
    } catch (e) {
      // ignore
    }
  });

  after(async () => {
    try {
      await prisma.session.deleteMany({
        where: { user: { email: { contains: "test.zadesk.com" } } },
      }).catch(() => {});
      await prisma.user.deleteMany({
        where: { email: { contains: "test.zadesk.com" } },
      }).catch(() => {});
    } catch (e) {
      // ignore
    } finally {
      await prisma.$disconnect().catch(() => {});
    }
  });

  // =========================================================================
  // 1. FACEBOOK ENDPOINTS FULL REMOVAL VERIFICATION (404)
  // =========================================================================
  describe("1. Facebook Endpoints Complete Removal", () => {
    it("GET /api/auth/facebook doit renvoyer 404 (endpoint supprimé)", async () => {
      const res = await request(app).get("/api/auth/facebook");
      assert.equal(res.status, 404);
    });

    it("GET /api/auth/facebook/callback doit renvoyer 404 (endpoint supprimé)", async () => {
      const res = await request(app).get("/api/auth/facebook/callback");
      assert.equal(res.status, 404);
    });

    it("GET /api/auth/facebook/config doit renvoyer 404 (endpoint supprimé)", async () => {
      const res = await request(app).get("/api/auth/facebook/config");
      assert.equal(res.status, 404);
    });
  });

  // =========================================================================
  // 2. EMAIL / PASSWORD & OTP
  // =========================================================================
  describe("2. Email / Password & OTP", () => {
    it("POST /api/auth/register refuse un email invalide (400)", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({
          firstName: "Jean",
          lastName: "Test",
          email: "invalid-email-format",
          password: "Password123!",
        });

      assert.equal(res.status, 400);
      assert.equal(res.body.success, false);
    });

    it("POST /api/auth/register refuse un mot de passe trop court (400)", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({
          firstName: "Jean",
          lastName: "Test",
          email: "valid@test.zadesk.com",
          password: "short",
        });

      assert.equal(res.status, 400);
      assert.equal(res.body.success, false);
    });

    it("POST /api/auth/login refuse des identifiants invalides (401 ou 403 Turnstile)", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({
          email: "non-existent-user-999@test.zadesk.com",
          password: "Password123!",
        });

      assert.ok([401, 403].includes(res.status), "Status doit être 401 ou 403 (Turnstile)");
      assert.equal(res.body.success, false);
    });

    it("POST /api/auth/verify-otp refuse un code/jeton invalide (400)", async () => {
      const res = await request(app)
        .post("/api/auth/verify-otp")
        .send({
          tempToken: "invalid.token",
          otp: "000000",
          purpose: "LOGIN",
        });

      assert.equal(res.status, 400);
      assert.equal(res.body.success, false);
    });

    it("POST /api/auth/resend-otp refuse un jeton invalide (400)", async () => {
      const res = await request(app)
        .post("/api/auth/resend-otp")
        .send({
          tempToken: "invalid.token",
          purpose: "REGISTRATION",
        });

      assert.equal(res.status, 400);
      assert.equal(res.body.success, false);
    });
  });

  // =========================================================================
  // 3. GOOGLE OAUTH
  // =========================================================================
  describe("3. Google OAuth", () => {
    it("GET /api/auth/google/config renvoie le clientId public", async () => {
      const res = await request(app).get("/api/auth/google/config");
      assert.equal(res.status, 200);
      assert.ok(typeof res.body.clientId === "string");
    });

    it("POST /api/auth/google refuse un jeton vide (400)", async () => {
      const res = await request(app)
        .post("/api/auth/google")
        .send({});

      assert.equal(res.status, 400);
      assert.equal(res.body.success, false);
    });

    it("POST /api/auth/google refuse un faux jeton (401)", async () => {
      const res = await request(app)
        .post("/api/auth/google")
        .send({
          credential: "fake.invalid.google.jwt.token",
          mode: "login",
        });

      assert.equal(res.status, 401);
      assert.equal(res.body.success, false);
    });
  });

  // =========================================================================
  // 4. SESSIONS & LOGOUT
  // =========================================================================
  describe("4. Sessions & Logout", () => {
    it("GET /api/auth/me renvoie authenticated: false si aucun cookie fourni", async () => {
      const res = await request(app).get("/api/auth/me");
      assert.equal(res.status, 200);
      assert.equal(res.body.authenticated, false);
    });

    it("POST /api/auth/logout sans session renvoie 401 (requireAuth)", async () => {
      const res = await request(app).post("/api/auth/logout");
      assert.equal(res.status, 401);
    });

    it("POST /api/auth/logout avec session valide déconnecte l'utilisateur (200) et supprime la session", async () => {
      // 1. Créer un utilisateur et une session de test
      const user = await createUser({
        firstName: "Test",
        lastName: "Session",
        email: testEmail,
        passwordHash: "$2a$10$abcdefghijklmnopqrstuvwxyz123456",
        emailVerified: true,
      });

      const session = await createSession(user.id);

      const sessionCookie = `zadesk_session=${session.sessionToken}`;

      // 2. GET /api/auth/me avec session
      const meRes = await request(app)
        .get("/api/auth/me")
        .set("Cookie", sessionCookie);
      assert.equal(meRes.status, 200);
      assert.equal(meRes.body.authenticated, true);
      assert.equal(meRes.body.user.id, user.id);

      // 3. POST /api/auth/logout avec session
      const logoutRes = await request(app)
        .post("/api/auth/logout")
        .set("Cookie", sessionCookie);
      assert.equal(logoutRes.status, 200);
      assert.equal(logoutRes.body.success, true);

      // 4. GET /api/auth/me après logout doit renvoyer authenticated: false
      const meAfterRes = await request(app)
        .get("/api/auth/me")
        .set("Cookie", sessionCookie);
      assert.equal(meAfterRes.status, 200);
      assert.equal(meAfterRes.body.authenticated, false);
    });
  });

  // =========================================================================
  // 5. SAV PUBLIC (ZERO AUTH OBLIGATOIRE)
  // =========================================================================
  describe("5. SAV Public (Zero Auth Requis)", () => {
    it("GET /api/public/companies/popular est accessible sans authentification", async () => {
      const res = await request(app).get("/api/public/companies/popular");
      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.ok(Array.isArray(res.body.companies));
    });

    it("GET /api/public/companies/categories est accessible sans authentification", async () => {
      const res = await request(app).get("/api/public/companies/categories");
      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.ok(Array.isArray(res.body.categories));
    });

    it("GET /api/public/companies est accessible sans authentification", async () => {
      const res = await request(app).get("/api/public/companies");
      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.ok(Array.isArray(res.body.companies));
    });
  });
});
