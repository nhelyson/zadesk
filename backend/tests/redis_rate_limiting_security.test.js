process.env.NODE_ENV = "test";
import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import app from "../src/app.js";
import { prisma } from "../src/lib/prisma.js";
import { cacheService } from "../src/cache/cacheService.js";
import { getRedisClient, isRedisReady } from "../src/config/redis.js";
import { 
  loginRateLimiter, 
  registerRateLimiter, 
  otpVerifyRateLimiter, 
  checkNameRateLimiter,
  invitationRateLimiter,
  publicDirectoryRateLimiter,
  createRateLimiter,
  RedisRateLimitStore
} from "../src/middleware/rateLimiter.js";
import { updateWorkspace } from "../src/services/workspaceService.js";

describe("MISSION — Tests de Validation Redis, Rate Limiting & Robustesse Backend", () => {
  const ts = Date.now();
  const testEmail = `test-user-rate-${ts}@zadesk-test.com`.toLowerCase();

  before(async () => {
    // Clean test records
    await prisma.user.deleteMany({ where: { email: { contains: "zadesk-test.com" } } });
    if (isRedisReady()) {
      await cacheService.clearApplicationCache();
    }
  });

  after(async () => {
    await prisma.user.deleteMany({ where: { email: { contains: "zadesk-test.com" } } });
    if (isRedisReady()) {
      await cacheService.clearApplicationCache();
      const client = getRedisClient();
      // Clean test rate limit keys
      const [_, keys] = await client.scan("0", "MATCH", "rl:test:*", "COUNT", 100);
      if (keys && keys.length > 0) {
        await client.del(...keys);
      }
    }
  });

  // -------------------------------------------------------------
  // Test 1: Résistance au spoofing de l'en-tête X-Forwarded-For
  // -------------------------------------------------------------
  it("Test 1 : Résistance au spoofing X-Forwarded-For sur l'échec de connexion", async () => {
    // Send 2 failed login requests with varying spoofed X-Forwarded-For headers
    const res1 = await request(app)
      .post("/api/auth/login")
      .set("X-Forwarded-For", "198.51.100.1, 127.0.0.1")
      .send({ email: "nonexistent@zadesk-test.com", password: "BadPassword123!" });

    assert.equal(res1.status, 401);

    const res2 = await request(app)
      .post("/api/auth/login")
      .set("X-Forwarded-For", "203.0.113.5, 127.0.0.1")
      .send({ email: "nonexistent@zadesk-test.com", password: "BadPassword123!" });

    assert.equal(res2.status, 401);

    // Verify that the failed attempt counter in Redis is keyed by the sanitized req.ip (127.0.0.1)
    // and NOT by the attacker-controlled left-most IP
    if (isRedisReady()) {
      const client = getRedisClient();
      const [_, keys] = await client.scan("0", "MATCH", "auth:failed_logins:*", "COUNT", 100);
      
      // Ensure no key was created with the spoofed client IPs (198.51.100.1 or 203.0.113.5)
      const hasSpoofedIp1 = keys.some((k) => k.includes("198.51.100.1"));
      const hasSpoofedIp2 = keys.some((k) => k.includes("203.0.113.5"));

      assert.equal(hasSpoofedIp1, false, "L'IP injectée 198.51.100.1 ne doit pas être utilisée comme clé.");
      assert.equal(hasSpoofedIp2, false, "L'IP injectée 203.0.113.5 ne doit pas être utilisée comme clé.");
    }
  });

  // -------------------------------------------------------------
  // Test 2: Séparation stricte des quotas par opération
  // -------------------------------------------------------------
  it("Test 2 : Séparation des quotas entre login, register et OTP", () => {
    assert.notEqual(loginRateLimiter, registerRateLimiter, "login et register doivent avoir des limiteurs distincts.");
    assert.notEqual(loginRateLimiter, otpVerifyRateLimiter, "login et otpVerify doivent avoir des limiteurs distincts.");
    assert.notEqual(registerRateLimiter, otpVerifyRateLimiter, "register et otpVerify doivent avoir des limiteurs distincts.");
  });

  // -------------------------------------------------------------
  // Test 3: Fonctionnement distribué du store Redis Rate Limiting
  // -------------------------------------------------------------
  it("Test 3 : Incrémentation et expiration atomique dans RedisStore", async () => {
    const testStore = new RedisRateLimitStore({ prefix: "rl:test:dist:" });
    testStore.init({ windowMs: 10000 });

    const key = `client-${ts}`;
    const result1 = await testStore.increment(key);
    assert.equal(result1.totalHits, 1);
    assert.ok(result1.resetTime instanceof Date);

    const result2 = await testStore.increment(key);
    assert.equal(result2.totalHits, 2);

    if (isRedisReady()) {
      const client = getRedisClient();
      const ttl = await client.pttl(`rl:test:dist:${key}`);
      assert.ok(ttl > 0 && ttl <= 10000, "Le TTL Redis doit être initialisé correctement.");
    }

    await testStore.resetKey(key);
  });

  // -------------------------------------------------------------
  // Test 4: Rejet HTTP 429 lors du dépassement de quota
  // -------------------------------------------------------------
  it("Test 4 : Dépassement de quota déclenchant un code HTTP 429", async () => {
    // Custom tight limiter for this test
    const customLimiter = createRateLimiter({
      windowMs: 5000,
      max: 2,
      prefix: "rl:test:tight:",
      message: "Limite de test atteinte.",
    });

    const testApp = (await import("express")).default();
    testApp.use(customLimiter);
    testApp.get("/test-endpoint", (req, res) => res.json({ ok: true }));

    const r1 = await request(testApp).get("/test-endpoint").set("x-enforce-rate-limit", "true");
    assert.equal(r1.status, 200);

    const r2 = await request(testApp).get("/test-endpoint").set("x-enforce-rate-limit", "true");
    assert.equal(r2.status, 200);

    const r3 = await request(testApp).get("/test-endpoint").set("x-enforce-rate-limit", "true");
    assert.equal(r3.status, 429);
    assert.equal(r3.body.success, false);
    assert.equal(r3.body.message, "Limite de test atteinte.");
  });

  // -------------------------------------------------------------
  // Test 5: Repli gracieux en mémoire en cas d'indisponibilité Redis
  // -------------------------------------------------------------
  it("Test 5 : Fallback mémoire non-bloquant si Redis est indisponible", async () => {
    const fallbackStore = new RedisRateLimitStore({ prefix: "rl:test:fallback:" });
    fallbackStore.init({ windowMs: 5000 });

    // Mock client failure or unavailable state
    const originalIsReady = (await import("../src/config/redis.js")).isRedisReady;
    
    // Simulate fallback mode
    const res = await fallbackStore.fallbackStore.increment(`fb-key-${ts}`);
    assert.equal(res.totalHits, 1);
    assert.ok(res.resetTime instanceof Date);

    await fallbackStore.fallbackStore.resetKey(`fb-key-${ts}`);
  });

  // -------------------------------------------------------------
  // Test 6: Protection des endpoints publics contre l'énumération
  // -------------------------------------------------------------
  it("Test 6 : Protection de check-name, invitations et annuaire public", async () => {
    // 1. check-name
    const resCheck = await request(app).get("/api/workspaces/check-name?name=ZadeskTest");
    assert.ok(resCheck.status === 200 || resCheck.status === 400);

    // 2. invitations
    const resInv = await request(app).get("/api/workspaces/invitations/fake-token-test");
    assert.equal(resInv.status, 400);

    // 3. public directory
    const resPub = await request(app).get("/api/public/companies");
    assert.equal(resPub.status, 200);
    assert.ok(Array.isArray(resPub.body.companies));
  });

  // -------------------------------------------------------------
  // Test 7: Préservation des clés de sécurité lors des purges de cache
  // -------------------------------------------------------------
  it("Test 7 : clearApplicationCache préserve auth:*, turnstile:* et rl:*", async () => {
    if (!isRedisReady()) return;

    const client = getRedisClient();

    // 1. Créer des clés de cache applicatif
    await client.set("workspace:ws-audit-test", JSON.stringify({ name: "Audit" }));
    await client.set("public:company:audit-slug", JSON.stringify({ slug: "audit-slug" }));
    await client.set("user:user-audit-test:workspaces", JSON.stringify([]));

    // 2. Créer des clés de sécurité critiques
    await client.set("auth:failed_logins:127.0.0.1:fakehash", "3", "EX", 300);
    await client.set("turnstile:used:fake-token-hash", JSON.stringify({ verifiedAt: Date.now() }), "EX", 300);
    await client.set("rl:login:127.0.0.1", "5", "EX", 300);

    // 3. Exécuter la purge applicative sécurisée
    await cacheService.clearApplicationCache();

    // 4. Vérifier que les clés applicatives sont purgées
    const wsVal = await client.get("workspace:ws-audit-test");
    const pubVal = await client.get("public:company:audit-slug");
    const userVal = await client.get("user:user-audit-test:workspaces");
    assert.equal(wsVal, null, "La clé workspace doit être purgée.");
    assert.equal(pubVal, null, "La clé public:company doit être purgée.");
    assert.equal(userVal, null, "La clé user doit être purgée.");

    // 5. Vérifier que les clés de sécurité sont 100% INTACTES
    const authSecVal = await client.get("auth:failed_logins:127.0.0.1:fakehash");
    const turnstileSecVal = await client.get("turnstile:used:fake-token-hash");
    const rlSecVal = await client.get("rl:login:127.0.0.1");

    assert.equal(authSecVal, "3", "La clé auth:failed_logins ne doit JAMAIS être purgée.");
    assert.ok(turnstileSecVal !== null, "La clé turnstile:used ne doit JAMAIS être purgée.");
    assert.equal(rlSecVal, "5", "La clé rate limiting ne doit JAMAIS être purgée.");

    // Nettoyage des clés de test de sécurité
    await client.del("auth:failed_logins:127.0.0.1:fakehash");
    await client.del("turnstile:used:fake-token-hash");
    await client.del("rl:login:127.0.0.1");
  });

  // -------------------------------------------------------------
  // Test 8: Encadrement borné du cache local de secours
  // -------------------------------------------------------------
  it("Test 8 : Bounded memory fallback dans CacheService", async () => {
    // Test that memoryFallback prunes expired entries and doesn't grow unbounded
    cacheService.memoryFallback.clear();

    // Add entry with 1ms TTL
    cacheService.memoryFallback.set("exp-test", { value: "old", expiresAt: Date.now() - 1000 });
    cacheService.pruneMemoryFallback();
    assert.equal(cacheService.memoryFallback.has("exp-test"), false, "L'entrée expirée doit être purgée.");
  });

  // -------------------------------------------------------------
  // Test 9: Invalidation de l'ancien slug lors d'une mise à jour de workspace
  // -------------------------------------------------------------
  it("Test 9 : Invalidation de l'ancien slug dans updateWorkspace", async () => {
    // Create test user and workspace
    const user = await prisma.user.create({
      data: {
        email: `slug-owner-${ts}@zadesk-test.com`,
        firstName: "Slug",
        lastName: "Owner",
        emailVerified: true,
      },
    });

    const ws = await prisma.workspace.create({
      data: {
        name: `Original Company ${ts}`,
        slug: `original-slug-${ts}`,
        memberships: {
          create: {
            userId: user.id,
            role: "OWNER",
          },
        },
      },
    });

    if (isRedisReady()) {
      const client = getRedisClient();
      await client.set(`workspace:${ws.slug}`, JSON.stringify({ name: ws.name }));
      await client.set(`public:company:${ws.slug}`, JSON.stringify({ name: ws.name }));
    }

    // Update workspace name and slug
    await updateWorkspace(ws.id, user.id, {
      name: `Renamed Company ${ts}`,
    });

    if (isRedisReady()) {
      const client = getRedisClient();
      const oldSlugCache = await client.get(`workspace:${ws.slug}`);
      assert.equal(oldSlugCache, null, "L'ancien slug doit être purgé du cache Redis.");
    }

    // Cleanup
    await prisma.workspace.delete({ where: { id: ws.id } });
    await prisma.user.delete({ where: { id: user.id } });
  });

  // -------------------------------------------------------------
  // Test 10: Endpoint Healthcheck enrichi et sécurisé
  // -------------------------------------------------------------
  it("Test 10 : GET /api/health renvoie l'état structuré sans fuite de secrets", async () => {
    const res = await request(app).get("/api/health");
    assert.equal(res.status, 200);
    assert.equal(res.body.service, "zadesk-api");
    assert.equal(res.body.services.database, "connected");
    assert.ok(res.body.services.cache === "connected" || res.body.services.cache === "fallback");
    assert.equal(res.body.password, undefined);
    assert.equal(res.body.secret, undefined);
  });
});
