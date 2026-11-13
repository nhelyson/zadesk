import test from "node:test";
import assert from "node:assert/strict";
import { getRedisClient, isRedisReady } from "../src/config/redis.js";
import { cacheService } from "../src/cache/cacheService.js";
import { RedisRateLimitStore } from "../src/middleware/rateLimiter.js";

test("MISSION GLOBALE — Pression Mémoire, noeviction & Résilience Applicative", async (t) => {
  const redis = getRedisClient();
  assert.ok(redis, "Le client Redis doit être instancié.");

  // Attente de l'événement ready si la connexion est en cours d'établissement
  if (!isRedisReady()) {
    await new Promise((resolve) => {
      redis.once("ready", resolve);
      setTimeout(resolve, 3000);
    });
  }
  assert.ok(isRedisReady(), "Redis doit être connecté et ready.");

  // Sauvegarde des paramètres initiaux
  const initialConfig = await redis.config("GET", "maxmemory");
  const initialPolicy = await redis.config("GET", "maxmemory-policy");
  const originalMaxMemory = initialConfig[1];
  const originalPolicy = initialPolicy[1];

  t.after(async () => {
    // Restauration garantie des paramètres initiaux
    try {
      await redis.config("SET", "maxmemory", originalMaxMemory);
      await redis.config("SET", "maxmemory-policy", originalPolicy);

      // Nettoyage des clés temporaires de test
      const testKeys = await redis.keys("test:pressure:*");
      if (testKeys.length > 0) {
        await redis.del(...testKeys);
      }
      await redis.del("security:test:key_to_protect");
    } catch (err) {
      console.error("Erreur lors de la restauration Redis post-test:", err.message);
    }
  });

  await t.test("1. Vérification de la configuration initiale (128 Mo et noeviction)", async () => {
    assert.equal(originalPolicy, "noeviction", "La politique globale configurée doit être noeviction");
    assert.equal(originalMaxMemory, "134217728", "maxmemory doit être 134217728 octets (128 Mo)");
  });

  await t.test("2. Comportement sous saturation mémoire réelle : rejet des écritures & non-éviction des clés", async () => {
    // Écriture d'une clé de sécurité représentative (avec TTL) qui ne doit JAMAIS être évincée
    await redis.set("security:test:key_to_protect", "IMMUTABLE_SECURITY_SECRET", "EX", 1800);

    // Réduction temporaire contrôlée de maxmemory pour simuler le seuil de saturation
    // On fixe maxmemory à 200 Ko au-dessus de la mémoire actuelle
    const memInfo = await redis.info("memory");
    const usedMatch = memInfo.match(/used_memory:(\d+)/);
    const currentUsed = usedMatch ? parseInt(usedMatch[1], 10) : 500000;
    const tightMaxMemory = String(currentUsed + 150000); // Seuil saturable rapidement

    await redis.config("SET", "maxmemory", tightMaxMemory);

    let oomTriggered = false;
    const largePayload = "X".repeat(30000); // 30 Ko par clé

    // Injection de clés jusqu'à saturation mémoire
    for (let i = 0; i < 30; i++) {
      try {
        await redis.set(`test:pressure:flood:${i}`, largePayload, "EX", 60);
      } catch (err) {
        if (err.message && err.message.includes("OOM")) {
          oomTriggered = true;
          break;
        }
      }
    }

    assert.ok(
      oomTriggered,
      "Redis configuré en noeviction doit lever une erreur OOM lorsqu'il atteint sa limite mémoire"
    );

    // VÉRIFICATION MAJEURE : La clé de sécurité n'a PAS été évincée
    const preservedSecret = await redis.get("security:test:key_to_protect");
    assert.equal(
      preservedSecret,
      "IMMUTABLE_SECURITY_SECRET",
      "Sous noeviction, les clés de sécurité préexistantes ne sont JAMAIS évincées sous pression mémoire"
    );
  });

  await t.test("3. Résilience du CacheService : bascule sur le fallback mémoire borné lors d'un OOM", async () => {
    // Tentative d'écriture via CacheService alors que Redis est en OOM
    const writeResult = await cacheService.set("workspace:test_oom_slug", { name: "Zadesk Resilient" }, 300);
    assert.equal(writeResult, true, "CacheService.set doit réussir via fallback sans lever d'exception non gérée");

    // Lecture via CacheService : les données sont lues depuis le fallback mémoire
    const readResult = await cacheService.get("workspace:test_oom_slug");
    assert.ok(readResult, "CacheService.get doit retourner l'objet mis en cache");
    assert.equal(readResult.name, "Zadesk Resilient");

    // Nettoyage local du fallback
    await cacheService.del("workspace:test_oom_slug");
  });

  await t.test("4. Résilience du RedisRateLimitStore : bascule sur MemoryStore lors d'un OOM", async () => {
    // Forcer Redis en état OOM garanti (1 Ko << mémoire utilisée)
    await redis.config("SET", "maxmemory", "1024");

    const testStore = new RedisRateLimitStore({ prefix: "rl:oom_test:" });
    testStore.init({ windowMs: 60000 });

    // L'incrémentation sous OOM ne doit pas planter mais basculer sur MemoryStore et marquer isDegraded
    const hitResult = await testStore.increment("client-ip-oom");
    assert.ok(hitResult.totalHits >= 1, "Le store doit incrémenter via fallback");
    assert.equal(testStore.isDegraded, true, "Le store doit être marqué en mode dégradé (isDegraded = true)");
  });

  await t.test("5. Restauration de la mémoire et reprise normale", async () => {
    // Restauration de la mémoire normale
    await redis.config("SET", "maxmemory", originalMaxMemory);

    // Nettoyage des clés de flood
    const floodKeys = await redis.keys("test:pressure:*");
    if (floodKeys.length > 0) {
      await redis.del(...floodKeys);
    }

    // Écriture normale rétablie
    await redis.set("test:pressure:normal_resumed", "OK", "EX", 30);
    const val = await redis.get("test:pressure:normal_resumed");
    assert.equal(val, "OK", "Redis reprend ses écritures normales dès que la mémoire repasse sous maxmemory");
    await redis.del("test:pressure:normal_resumed");
  });
});
