import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import app from "../src/app.js";
import { prisma } from "../src/lib/prisma.js";

describe("Zadesk Authentication API Tests", () => {
  const testUser = {
    firstName: "Test",
    lastName: "Developer",
    email: `test-${Date.now()}@zadesk-test.com`,
    password: "Password123!",
  };

  let sessionCookie = "";

  before(async () => {
    // Clean up test data if any
    try {
      await prisma.user.deleteMany({
        where: { email: { contains: "zadesk-test.com" } },
      });
    } catch (e) {
      console.log("DB Cleanup notice:", e.message);
    }
  });

  after(async () => {
    try {
      await prisma.user.deleteMany({
        where: { email: { contains: "zadesk-test.com" } },
      });
      await prisma.$disconnect();
    } catch (e) {
      // ignore
    }
  });

  describe("1. POST /api/auth/register", () => {
    it("devrait refuser une inscription avec un email invalide", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({
          firstName: "Jean",
          lastName: "Dupont",
          email: "invalid-email",
          password: "Password123!",
        });

      assert.equal(res.status, 400);
      assert.equal(res.body.success, false);
    });

    it("devrait refuser une inscription avec un mot de passe trop court (< 8 car)", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({
          firstName: "Jean",
          lastName: "Dupont",
          email: "valid@zadesk-test.com",
          password: "123",
        });

      assert.equal(res.status, 400);
      assert.equal(res.body.success, false);
    });

    it("devrait inscrire un nouvel utilisateur avec succès et positionner le cookie HttpOnly", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send(testUser);

      assert.equal(res.status, 201);
      assert.equal(res.body.success, true);
      assert.ok(res.body.user);
      assert.equal(res.body.user.email, testUser.email.toLowerCase());
      assert.equal(res.body.user.firstName, testUser.firstName);
      assert.equal(res.body.user.lastName, testUser.lastName);
      assert.equal(res.body.user.passwordHash, undefined, "passwordHash ne doit jamais être retourné");

      const cookies = res.headers["set-cookie"];
      assert.ok(cookies, "Un cookie set-cookie doit être renvoyé");
      const sessionCookieHeader = cookies.find((c) => c.startsWith("zadesk_session="));
      assert.ok(sessionCookieHeader, "Le cookie zadesk_session doit être présent");
      assert.ok(sessionCookieHeader.includes("HttpOnly"), "Le cookie doit être HttpOnly");
      sessionCookie = sessionCookieHeader.split(";")[0];
    });

    it("devrait refuser l'inscription si l'email existe déjà (409 Conflict)", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send(testUser);

      assert.equal(res.status, 409);
      assert.equal(res.body.success, false);
      assert.ok(res.body.message.includes("déjà"));
    });
  });

  describe("2. POST /api/auth/login", () => {
    it("devrait refuser la connexion avec un mot de passe incorrect (401)", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({
          email: testUser.email,
          password: "WrongPassword!",
        });

      assert.equal(res.status, 401);
      assert.equal(res.body.success, false);
      assert.equal(res.body.user, undefined);
    });

    it("devrait refuser la connexion pour un utilisateur inexistant (401 sans fuite d'info)", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({
          email: "unknown-user-999@zadesk-test.com",
          password: "Password123!",
        });

      assert.equal(res.status, 401);
      assert.equal(res.body.success, false);
    });

    it("devrait connecter l'utilisateur avec de bons identifiants et créer une session", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({
          email: testUser.email,
          password: testUser.password,
        });

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.ok(res.body.user);
      assert.equal(res.body.user.email, testUser.email.toLowerCase());
      assert.equal(res.body.user.passwordHash, undefined);

      const cookies = res.headers["set-cookie"];
      assert.ok(cookies);
      const sessionCookieHeader = cookies.find((c) => c.startsWith("zadesk_session="));
      assert.ok(sessionCookieHeader);
      sessionCookie = sessionCookieHeader.split(";")[0];
    });
  });

  describe("3. GET /api/auth/me", () => {
    it("devrait renvoyer authenticated: true avec le profil utilisateur si session valide", async () => {
      const res = await request(app)
        .get("/api/auth/me")
        .set("Cookie", sessionCookie);

      assert.equal(res.status, 200);
      assert.equal(res.body.authenticated, true);
      assert.ok(res.body.user);
      assert.equal(res.body.user.email, testUser.email.toLowerCase());
    });

    it("devrait renvoyer authenticated: false si aucune session n'est fournie", async () => {
      const res = await request(app).get("/api/auth/me");

      assert.equal(res.status, 200);
      assert.equal(res.body.authenticated, false);
      assert.equal(res.body.user, undefined);
    });
  });

  describe("4. POST /api/auth/logout", () => {
    it("devrait invalider la session et supprimer le cookie", async () => {
      const res = await request(app)
        .post("/api/auth/logout")
        .set("Cookie", sessionCookie);

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);

      // Verify that calling /api/auth/me with the previous cookie now returns authenticated: false
      const meRes = await request(app)
        .get("/api/auth/me")
        .set("Cookie", sessionCookie);

      assert.equal(meRes.status, 200);
      assert.equal(meRes.body.authenticated, false);
    });
  });

  describe("5. POST /api/auth/google", () => {
    it("devrait refuser un faux jeton Google invalide (401)", async () => {
      const res = await request(app)
        .post("/api/auth/google")
        .send({
          credential: "fake-invalid-jwt-token-12345",
          mode: "login",
        });

      assert.equal(res.status, 401);
      assert.equal(res.body.success, false);
    });

    it("devrait refuser une requête sans credential (400)", async () => {
      const res = await request(app)
        .post("/api/auth/google")
        .send({});

      assert.equal(res.status, 400);
      assert.equal(res.body.success, false);
    });

    it("devrait refuser une requête avec un mode invalide (400)", async () => {
      const res = await request(app)
        .post("/api/auth/google")
        .send({
          credential: "fake-invalid-jwt-token-12345",
          mode: "invalid_mode",
        });

      assert.equal(res.status, 400);
      assert.equal(res.body.success, false);
    });
  });

  describe("6. GET /api/auth/google/config", () => {
    it("devrait renvoyer l'identifiant client Google public", async () => {
      const res = await request(app).get("/api/auth/google/config");

      assert.equal(res.status, 200);
      assert.ok(typeof res.body.clientId === "string");
    });
  });
});
