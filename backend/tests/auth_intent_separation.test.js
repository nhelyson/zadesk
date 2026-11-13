process.env.NODE_ENV = "test";
import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import app from "../src/app.js";
import { prisma } from "../src/lib/prisma.js";
import { hashOtp } from "../src/services/otpService.js";
import { verifyPassword } from "../src/lib/password.js";

describe("MISSION — Séparation stricte Inscription / Connexion & Validation OTP Zadesk", () => {
  const ts = Date.now();
  const emailClassic1 = `test-user-classic-${ts}@zadesk-mission.com`.toLowerCase();
  const emailGoogleNew = `test-user-google-new-${ts}@zadesk-mission.com`.toLowerCase();
  const emailGoogleExisting = `test-user-google-exist-${ts}@zadesk-mission.com`.toLowerCase();
  const emailClassicToLink = `test-user-tolink-${ts}@zadesk-mission.com`.toLowerCase();
  const passwordValid = "Passw0rdSecure!2026";
  const passwordWrong = "WrongPassword999!";

  let classic1UserId = "";
  let classic1SessionCookie = "";
  let googleExistingUserId = "";
  let classicToLinkUserId = "";

  before(async () => {
    try {
      await prisma.user.deleteMany({
        where: { email: { contains: "zadesk-mission.com" } },
      });
      await prisma.pendingRegistration.deleteMany({
        where: { email: { contains: "zadesk-mission.com" } },
      });
    } catch (e) {
      console.warn("Cleanup warning:", e.message);
    }
  });

  after(async () => {
    try {
      await prisma.user.deleteMany({
        where: { email: { contains: "zadesk-mission.com" } },
      });
      await prisma.pendingRegistration.deleteMany({
        where: { email: { contains: "zadesk-mission.com" } },
      });
      await prisma.$disconnect();
    } catch (e) {
      // ignore
    }
  });

  // =========================================================================
  // SCÉNARIO 1 — Inscription classique avec nouvel e-mail (Inscription & OTP fonctionnels)
  // =========================================================================
  it("Scénario 1 : Inscription classique avec nouvel e-mail -> Inscription et OTP fonctionnels", async () => {
    const regRes = await request(app)
      .post("/api/auth/register")
      .send({
        firstName: "Japhet",
        lastName: "Mission",
        email: emailClassic1,
        password: passwordValid,
      });

    assert.equal(regRes.status, 200, "Statut 200 attendu pour la pré-inscription");
    assert.equal(regRes.body.requiresOtp, true, "Doit exiger un OTP");
    assert.ok(regRes.body.tempToken, "Doit fournir un tempToken");

    // Force known OTP in pendingRegistration
    const knownOtp = "112233";
    const otpHash = hashOtp(knownOtp, emailClassic1);
    await prisma.pendingRegistration.update({
      where: { email: emailClassic1 },
      data: { otpHash },
    });

    const verifyRes = await request(app)
      .post("/api/auth/verify-otp")
      .send({
        tempToken: regRes.body.tempToken,
        otp: knownOtp,
        purpose: "REGISTRATION",
      });

    assert.equal(verifyRes.status, 200, "Validation OTP réussie");
    assert.equal(verifyRes.body.success, true);
    assert.equal(verifyRes.body.hasWorkspace, false);
    assert.equal(verifyRes.body.redirectTo, "/app/onboarding");
    assert.ok(verifyRes.body.user.id);

    classic1UserId = verifyRes.body.user.id;
    const cookies = verifyRes.headers["set-cookie"];
    classic1SessionCookie = cookies.find((c) => c.startsWith("zadesk_session=")).split(";")[0];
  });

  // =========================================================================
  // SCÉNARIO 2 — Inscription classique avec e-mail existant (Refus 409 & Message adapté)
  // =========================================================================
  it("Scénario 2 : Inscription classique avec e-mail existant -> Refus 409, message adapté, aucun OTP", async () => {
    const regRes = await request(app)
      .post("/api/auth/register")
      .send({
        firstName: "Imposteur",
        lastName: "Duplicate",
        email: emailClassic1, // Déjà utilisé par Scénario 1
        password: passwordValid,
      });

    assert.equal(regRes.status, 409, "Statut 409 Conflict attendu");
    assert.equal(regRes.body.success, false);
    assert.equal(regRes.body.code, "ACCOUNT_ALREADY_EXISTS");
    assert.ok(
      regRes.body.message.includes("déjà") || regRes.body.message.includes("existe"),
      "Message informant que le compte existe déjà"
    );

    // Verify no pending registration was created or updated for this duplicate attempt
    const pending = await prisma.pendingRegistration.findUnique({
      where: { email: emailClassic1 },
    });
    assert.equal(pending, null, "Aucun pendingRegistration ne doit être actif");
  });

  // =========================================================================
  // SCÉNARIO 3 — Inscription Google avec nouvelle identité (mode: 'register')
  // =========================================================================
  it("Scénario 3 : Inscription Google avec nouvelle identité -> Création du compte et session onboarding", async () => {
    const googleSubNew = `google-sub-new-${ts}`;
    const mockToken = `mock-google-token:${googleSubNew}:${emailGoogleNew}:true:Nouveau:Google`;

    const res = await request(app)
      .post("/api/auth/google")
      .send({
        credential: mockToken,
        mode: "register",
      });

    assert.equal(res.status, 201, "Statut 201 Created pour nouvelle inscription");
    assert.equal(res.body.success, true);
    assert.equal(res.body.isNewUser, true);
    assert.equal(res.body.hasWorkspace, false);
    assert.equal(res.body.redirectTo, "/app/onboarding");
    assert.ok(res.body.user.id);

    const cookies = res.headers["set-cookie"];
    assert.ok(cookies && cookies.some((c) => c.startsWith("zadesk_session=")), "Session créée pour nouvel inscrit");
  });

  // =========================================================================
  // SCÉNARIO 4 — Inscription Google avec identité existante (mode: 'register' -> Refus 409)
  // =========================================================================
  it("Scénario 4 : Inscription Google avec identité existante -> Refus 409, AUCUNE nouvelle session", async () => {
    // 1. D'abord créer un compte Google existant pour ce test
    const googleSubExist = `google-sub-exist-${ts}`;
    const mockTokenExist = `mock-google-token:${googleSubExist}:${emailGoogleExisting}:true:Existant:Google`;

    const createRes = await request(app)
      .post("/api/auth/google")
      .send({
        credential: mockTokenExist,
        mode: "register",
      });
    assert.equal(createRes.status, 201);
    googleExistingUserId = createRes.body.user.id;

    // 2. Tenter de S'INSCRIRE à nouveau sur /register avec la même identité
    const duplicateRegisterRes = await request(app)
      .post("/api/auth/google")
      .send({
        credential: mockTokenExist,
        mode: "register",
      });

    assert.equal(duplicateRegisterRes.status, 409, "Statut 409 Conflict obligatoire");
    assert.equal(duplicateRegisterRes.body.success, false);
    assert.equal(duplicateRegisterRes.body.code, "ACCOUNT_ALREADY_EXISTS");
    assert.ok(
      duplicateRegisterRes.body.message.includes("Impossible de poursuivre") ||
      duplicateRegisterRes.body.message.includes("Un compte existe déjà"),
      "Message de refus attendu"
    );

    // CRITICAL SECURITY ASSERTION : Aucune session ne doit être émise dans les en-têtes !
    const cookies = duplicateRegisterRes.headers["set-cookie"];
    const hasSessionCookie = cookies && cookies.some((c) => c.startsWith("zadesk_session="));
    assert.equal(hasSessionCookie, undefined, "AUCUN cookie de session ne doit être créé lors d'un refus d'inscription");
  });

  // =========================================================================
  // SCÉNARIO 5 — Connexion Google avec compte existant (mode: 'login')
  // =========================================================================
  it("Scénario 5 : Connexion Google avec compte existant -> Authentification normale 200", async () => {
    const googleSubExist = `google-sub-exist-${ts}`;
    const mockTokenExist = `mock-google-token:${googleSubExist}:${emailGoogleExisting}:true:Existant:Google`;

    const loginRes = await request(app)
      .post("/api/auth/google")
      .send({
        credential: mockTokenExist,
        mode: "login",
      });

    assert.equal(loginRes.status, 200, "Statut 200 attendu pour la connexion");
    assert.equal(loginRes.body.success, true);
    assert.equal(loginRes.body.isNewUser, false);
    assert.equal(loginRes.body.user.id, googleExistingUserId);
    assert.ok(loginRes.body.redirectTo);

    const cookies = loginRes.headers["set-cookie"];
    assert.ok(cookies && cookies.some((c) => c.startsWith("zadesk_session=")), "Session établie avec succès");
  });

  // =========================================================================
  // SCÉNARIO 6 — Connexion classique avec bons identifiants (OTP déclenché et validé)
  // =========================================================================
  it("Scénario 6 : Connexion classique avec bons identifiants -> OTP déclenché et validé", async () => {
    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({
        email: emailClassic1,
        password: passwordValid,
      });

    assert.equal(loginRes.status, 200);
    assert.equal(loginRes.body.requiresOtp, true, "OTP challenge requis");
    assert.ok(loginRes.body.tempToken);
    assert.equal(loginRes.body.purpose, "LOGIN");

    // Force known OTP for this user
    const knownLoginOtp = "445566";
    const knownHash = hashOtp(knownLoginOtp, classic1UserId);
    await prisma.otpToken.updateMany({
      where: { userId: classic1UserId, purpose: "LOGIN" },
      data: { otpHash: knownHash },
    });

    const verifyRes = await request(app)
      .post("/api/auth/verify-otp")
      .send({
        tempToken: loginRes.body.tempToken,
        otp: knownLoginOtp,
        purpose: "LOGIN",
      });

    assert.equal(verifyRes.status, 200);
    assert.equal(verifyRes.body.success, true);
    assert.equal(verifyRes.body.user.id, classic1UserId);

    const cookies = verifyRes.headers["set-cookie"];
    assert.ok(cookies && cookies.some((c) => c.startsWith("zadesk_session=")));
  });

  // =========================================================================
  // SCÉNARIO 7 — Connexion classique avec mauvais mot de passe (Refus d'accès 401)
  // =========================================================================
  it("Scénario 7 : Connexion classique avec mauvais mot de passe -> Refus 401", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: emailClassic1,
        password: passwordWrong,
      });

    assert.equal(res.status, 401, "Mauvais mot de passe rejeté avec 401");
    assert.equal(res.body.success, false);
    assert.equal(res.body.requiresOtp, undefined, "Aucun OTP ne doit être déclenché");
  });

  // =========================================================================
  // SCÉNARIO 8 — Connexion classique avec OTP incorrect (Refus d'accès 401)
  // =========================================================================
  it("Scénario 8 : Connexion classique avec OTP incorrect -> Refus 401", async () => {
    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({
        email: emailClassic1,
        password: passwordValid,
      });

    assert.equal(loginRes.status, 200);
    const tempToken = loginRes.body.tempToken;

    const verifyRes = await request(app)
      .post("/api/auth/verify-otp")
      .send({
        tempToken,
        otp: "000000", // Code manifestement incorrect
        purpose: "LOGIN",
      });

    assert.ok(
      verifyRes.status === 400 || verifyRes.status === 401,
      `OTP incorrect doit être rejeté (reçu ${verifyRes.status})`
    );
    assert.equal(verifyRes.body.success, false);
  });

  // =========================================================================
  // SCÉNARIO 9 — Connexion classique avec OTP expiré (Refus d'accès)
  // =========================================================================
  it("Scénario 9 : Connexion classique avec OTP expiré -> Refus d'accès", async () => {
    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({
        email: emailClassic1,
        password: passwordValid,
      });

    assert.equal(loginRes.status, 200);
    const tempToken = loginRes.body.tempToken;

    // Simuler l'expiration de l'OTP en base de données
    await prisma.otpToken.updateMany({
      where: { userId: classic1UserId, purpose: "LOGIN" },
      data: { expiresAt: new Date(Date.now() - 5000) }, // Expiré il y a 5s
    });

    const verifyRes = await request(app)
      .post("/api/auth/verify-otp")
      .send({
        tempToken,
        otp: "123456",
        purpose: "LOGIN",
      });

    assert.ok(
      verifyRes.status === 400 || verifyRes.status === 401,
      `OTP expiré doit être rejeté (reçu ${verifyRes.status})`
    );
    assert.equal(verifyRes.body.success, false);
    assert.ok(verifyRes.body.message.includes("expiré"));
  });

  // =========================================================================
  // SCÉNARIO 10 — Connexion classique avec OTP déjà utilisé (Refus 401 / 400)
  // =========================================================================
  it("Scénario 10 : Connexion classique avec OTP déjà utilisé -> Refus réutilisation", async () => {
    // 1. Demande d'OTP
    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({
        email: emailClassic1,
        password: passwordValid,
      });
    const tempToken = loginRes.body.tempToken;

    // Définir un code connu
    const singleUseOtp = "778899";
    const singleUseHash = hashOtp(singleUseOtp, classic1UserId);
    await prisma.otpToken.updateMany({
      where: { userId: classic1UserId, purpose: "LOGIN" },
      data: { otpHash: singleUseHash, expiresAt: new Date(Date.now() + 600000) },
    });

    // 2. Première validation réussie
    const firstVerify = await request(app)
      .post("/api/auth/verify-otp")
      .send({
        tempToken,
        otp: singleUseOtp,
        purpose: "LOGIN",
      });
    assert.equal(firstVerify.status, 200, "Première utilisation validée");

    // 3. Deuxième tentative de validation avec le MÊME jeton et le MÊME code
    const secondVerify = await request(app)
      .post("/api/auth/verify-otp")
      .send({
        tempToken,
        otp: singleUseOtp,
        purpose: "LOGIN",
      });

    assert.ok(
      secondVerify.status === 401 || secondVerify.status === 400,
      `La réutilisation d'un code consommé doit être rejetée (reçu ${secondVerify.status})`
    );
    assert.equal(secondVerify.body.success, false);
  });

  // =========================================================================
  // SCÉNARIO 11 — Connexion Google avec compte classique déjà lié (mode: 'login')
  // =========================================================================
  it("Scénario 11 : Connexion Google avec compte classique lié -> Accès au compte existant préservé", async () => {
    // 1. Créer le compte classique via inscription + OTP
    const regRes = await request(app)
      .post("/api/auth/register")
      .send({
        firstName: "Marc",
        lastName: "Liaison",
        email: emailClassicToLink,
        password: passwordValid,
      });
    assert.equal(regRes.status, 200);

    const knownOtp = "998877";
    await prisma.pendingRegistration.update({
      where: { email: emailClassicToLink },
      data: { otpHash: hashOtp(knownOtp, emailClassicToLink) },
    });

    const verifyRes = await request(app)
      .post("/api/auth/verify-otp")
      .send({
        tempToken: regRes.body.tempToken,
        otp: knownOtp,
        purpose: "REGISTRATION",
      });
    assert.equal(verifyRes.status, 200);
    classicToLinkUserId = verifyRes.body.user.id;

    // 2. Connexion Google avec mode "login" sur cet email vérifié
    const googleSubLink = `sub-link-${ts}`;
    const token = `mock-google-token:${googleSubLink}:${emailClassicToLink}:true:Marc:Liaison`;

    const linkRes = await request(app)
      .post("/api/auth/google")
      .send({
        credential: token,
        mode: "login",
      });

    assert.equal(linkRes.status, 200);
    assert.equal(linkRes.body.user.id, classicToLinkUserId, "Doit pointer sur l'utilisateur d'origine");
    assert.equal(linkRes.body.isNewUser, false);

    // Vérifier que le mot de passe est intact
    const userInDb = await prisma.user.findUnique({ where: { id: classicToLinkUserId } });
    assert.equal(userInDb.googleId, googleSubLink);
    assert.ok(userInDb.passwordHash, "Le passwordHash doit rester présent");
    const isPwValid = await verifyPassword(passwordValid, userInDb.passwordHash);
    assert.equal(isPwValid, true, "L'utilisateur peut toujours se connecter avec son mot de passe");
  });

  // =========================================================================
  // SCÉNARIO 12 — Tentatives simultanées d'inscription avec la même adresse
  // =========================================================================
  it("Scénario 12 : Tentatives simultanées d'inscription avec la même adresse -> Aucun doublon", async () => {
    const concurrentEmail = `concurrent-${ts}@zadesk-mission.com`.toLowerCase();

    // 2 requêtes simultanées
    const [res1, res2] = await Promise.all([
      request(app).post("/api/auth/register").send({
        firstName: "A",
        lastName: "Concurrent",
        email: concurrentEmail,
        password: passwordValid,
      }),
      request(app).post("/api/auth/register").send({
        firstName: "B",
        lastName: "Concurrent",
        email: concurrentEmail,
        password: passwordValid,
      }),
    ]);

    // L'une doit réussir (200), ou être régulée sans doublon
    const usersInDb = await prisma.user.findMany({ where: { email: concurrentEmail } });
    const pendingsInDb = await prisma.pendingRegistration.findMany({ where: { email: concurrentEmail } });

    assert.ok(usersInDb.length <= 1, "Pas de doublons dans la table users");
    assert.ok(pendingsInDb.length <= 1, "Pas de doublons dans pending_registrations");
  });

  // =========================================================================
  // SCÉNARIO 13 — Google OAuth avec adresse non vérifiée (Refus 403)
  // =========================================================================
  it("Scénario 13 : Google OAuth avec adresse non vérifiée -> Refus 403", async () => {
    const unverifiedToken = `mock-google-token:sub-unverified-${ts}:unverified-${ts}@gmail.com:false:No:Verify`;

    const res = await request(app)
      .post("/api/auth/google")
      .send({
        credential: unverifiedToken,
        mode: "register",
      });

    assert.equal(res.status, 403, "Refus 403 si email non vérifié par Google");
    assert.equal(res.body.success, false);
    assert.ok(res.body.message.includes("Google"));
  });

  // =========================================================================
  // SCÉNARIO 14 — Inscription Google existante suivie d'une connexion Google depuis /login
  // =========================================================================
  it("Scénario 14 : Inscription Google existante suivie d'une connexion Google depuis /login -> Refus puis Connexion", async () => {
    const googleSub14 = `google-sub-14-${ts}`;
    const email14 = `user-14-${ts}@zadesk-mission.com`.toLowerCase();
    const token14 = `mock-google-token:${googleSub14}:${email14}:true:Quatorze:User`;

    // Étape A : Création initiale sur /register (mode: register)
    const initialRegisterRes = await request(app)
      .post("/api/auth/google")
      .send({
        credential: token14,
        mode: "register",
      });
    assert.equal(initialRegisterRes.status, 201);
    const userId14 = initialRegisterRes.body.user.id;

    // Étape B : Tentative ultérieure de réinscription sur /register (mode: register)
    const secondRegisterRes = await request(app)
      .post("/api/auth/google")
      .send({
        credential: token14,
        mode: "register",
      });
    assert.equal(secondRegisterRes.status, 409, "Inscription d'un compte existant REFUSÉE avec 409");
    assert.equal(secondRegisterRes.body.code, "ACCOUNT_ALREADY_EXISTS");

    // Aucune session émise lors du refus
    assert.equal(
      secondRegisterRes.headers["set-cookie"],
      undefined,
      "Aucun cookie de session sur refus d'inscription"
    );

    // Étape C : Connexion depuis /login (mode: login)
    const loginRes = await request(app)
      .post("/api/auth/google")
      .send({
        credential: token14,
        mode: "login",
      });
    assert.equal(loginRes.status, 200, "Connexion autorisée depuis /login avec 200");
    assert.equal(loginRes.body.user.id, userId14, "Même utilisateur identifié");
    assert.equal(loginRes.body.isNewUser, false);

    const cookies = loginRes.headers["set-cookie"];
    assert.ok(cookies && cookies.some((c) => c.startsWith("zadesk_session=")), "Session créée avec succès pour la connexion");
  });
});
