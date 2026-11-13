import test from "node:test";
import assert from "node:assert/strict";
import { fork } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getRedisClient, isRedisReady } from "../src/config/redis.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const WORKER_SCRIPT = path.join(__dirname, "helpers", "rate_limit_worker.js");

function createWorkerProcess() {
  return new Promise((resolve, reject) => {
    const child = fork(WORKER_SCRIPT, [], {
      env: {
        ...process.env,
        NODE_ENV: "test",
      },
      stdio: ["inherit", "inherit", "inherit", "ipc"],
    });

    let isReady = false;
    const pendingRequests = new Map();
    let reqCounter = 0;

    child.on("message", (msg) => {
      if (msg.type === "ready") {
        isReady = true;
        resolve({
          child,
          pid: msg.pid,
          send(action, payload = {}) {
            return new Promise((res, rej) => {
              const reqId = ++reqCounter;
              const timeout = setTimeout(() => {
                pendingRequests.delete(reqId);
                rej(new Error(`Worker request timeout for action "${action}"`));
              }, 8000);

              pendingRequests.set(reqId, { res, rej, timeout });
              child.send({ action, reqId, ...payload });
            });
          },
          kill() {
            child.kill();
          },
        });
        return;
      }

      if (msg.reqId && pendingRequests.has(msg.reqId)) {
        const { res, rej, timeout } = pendingRequests.get(msg.reqId);
        clearTimeout(timeout);
        pendingRequests.delete(msg.reqId);

        if (msg.type === "error") {
          rej(new Error(msg.error));
        } else {
          res(msg);
        }
      }
    });

    child.on("error", (err) => {
      if (!isReady) reject(err);
    });
  });
}

test("MISSION COMPLÉMENTAIRE — Robustesse et Distribution Réelle de Redis", async (t) => {
  const redis = getRedisClient();
  assert.ok(redis, "Le client Redis doit être instancié.");

  // Nettoyage préalable des clés de test distribué
  if (isRedisReady()) {
    const keys = await redis.keys("rl:dist_test:*");
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  }

  let workerA = null;
  let workerB = null;
  let workerC = null;

  t.after(async () => {
    if (workerA) workerA.kill();
    if (workerB) workerB.kill();
    if (workerC) workerC.kill();

    if (isRedisReady()) {
      const keys = await redis.keys("rl:dist_test:*");
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    }
  });

  await t.test("1. Démarrage de deux processus backend indépendants (Worker A et Worker B)", async () => {
    workerA = await createWorkerProcess();
    workerB = await createWorkerProcess();

    assert.ok(workerA.pid, "Worker A doit avoir un PID valide");
    assert.ok(workerB.pid, "Worker B doit avoir un PID valide");
    assert.notEqual(workerA.pid, workerB.pid, "Les deux workers doivent être des processus OS distincts");

    await workerA.send("init", { prefix: "rl:dist_test:", windowMs: 60000 });
    await workerB.send("init", { prefix: "rl:dist_test:", windowMs: 60000 });
  });

  await t.test("2. Incrémentations concurrentes atomiques partagées entre les deux processus", async () => {
    const sharedKey = `shared-client-ip-${Date.now()}`;

    // Lancement simultané de 10 requêtes sur Worker A et 10 requêtes sur Worker B (total 20)
    const promisesA = Array.from({ length: 10 }, () => workerA.send("increment", { key: sharedKey }));
    const promisesB = Array.from({ length: 10 }, () => workerB.send("increment", { key: sharedKey }));

    const results = await Promise.all([...promisesA, ...promisesB]);

    assert.equal(results.length, 20, "20 requêtes doivent s'être exécutées");

    // Vérification de la valeur finale dans Redis
    const finalCount = await redis.get(`rl:dist_test:${sharedKey}`);
    assert.equal(Number(finalCount), 20, "Le compteur partagé dans Redis doit être exactement 20 (aucune perte atomique)");

    // Vérification que les totalHits reçus couvrent 1 à 20 sans doublons
    const hits = results.map((r) => r.totalHits).sort((a, b) => a - b);
    assert.equal(hits[0], 1, "Le premier hit doit être 1");
    assert.equal(hits[19], 20, "Le dernier hit doit être 20");
  });

  await t.test("3. Maintien et cohérence du TTL entre les processus (Lua script)", async () => {
    const ttlKey = `ttl-client-ip-${Date.now()}`;

    // Premier incrément par Worker A
    const resA = await workerA.send("increment", { key: ttlKey });
    assert.equal(resA.totalHits, 1);

    const initialPttl = await redis.pttl(`rl:dist_test:${ttlKey}`);
    assert.ok(initialPttl > 50000 && initialPttl <= 60000, `PTTL initial attendu ~60000ms, obtenu: ${initialPttl}`);

    // Attente 200ms
    await new Promise((r) => setTimeout(r, 200));

    // Deuxième incrément par Worker B : le TTL NE DOIT PAS être réinitialisé à 60000
    const resB = await workerB.send("increment", { key: ttlKey });
    assert.equal(resB.totalHits, 2);

    const subsequentPttl = await redis.pttl(`rl:dist_test:${ttlKey}`);
    assert.ok(
      subsequentPttl <= initialPttl,
      `Le TTL ne doit pas avoir été prolongé par le 2e incrément (initial: ${initialPttl}, second: ${subsequentPttl})`
    );
  });

  await t.test("4. Dépassement d'un quota partagé entre processus distincts", async () => {
    const quotaKey = `quota-client-ip-${Date.now()}`;
    const QUOTA = 8;

    // Worker A consomme 5 requêtes
    for (let i = 0; i < 5; i++) {
      const r = await workerA.send("increment", { key: quotaKey });
      assert.equal(r.totalHits, i + 1);
    }

    // Worker B consomme 3 requêtes (total atteint = 8)
    for (let i = 0; i < 3; i++) {
      const r = await workerB.send("increment", { key: quotaKey });
      assert.equal(r.totalHits, 5 + i + 1);
    }

    // Requête 9 sur Worker A : dépassement du quota
    const overflowA = await workerA.send("increment", { key: quotaKey });
    assert.equal(overflowA.totalHits, 9, "Worker A doit voir totalHits = 9");
    assert.ok(overflowA.totalHits > QUOTA, "Le quota partagé de 8 est franchi par Worker A");

    // Requête 10 sur Worker B : également bloqué
    const overflowB = await workerB.send("increment", { key: quotaKey });
    assert.equal(overflowB.totalHits, 10, "Worker B doit voir totalHits = 10");
    assert.ok(overflowB.totalHits > QUOTA, "Worker B est également au-dessus du quota");
  });

  await t.test("5. Résistance au redémarrage d'un processus backend (Survie de l'état)", async () => {
    const restartKey = `restart-ip-${Date.now()}`;

    // Worker A effectue 4 requêtes
    for (let i = 0; i < 4; i++) {
      await workerA.send("increment", { key: restartKey });
    }

    // Mort subite du Worker A
    workerA.kill();

    // Démarrage d'un Worker C indépendant
    workerC = await createWorkerProcess();
    await workerC.send("init", { prefix: "rl:dist_test:", windowMs: 60000 });

    // Worker C interroge la même clé
    const resC = await workerC.send("increment", { key: restartKey });
    assert.equal(
      resC.totalHits,
      5,
      "Le Worker C nouvellement démarré doit voir totalHits = 5 (persistance de l'état dans Redis malgré la mort du processus)"
    );
  });

  await t.test("6. Déconnexion Redis, bascule en mode dégradé (MemoryStore) et traçabilité", async () => {
    const disconnectKey = `disconnect-ip-${Date.now()}`;

    // Déconnexion simulée sur Worker B
    await workerB.send("disconnect_redis");

    // Requête sur Worker B sans Redis : ne doit pas lever d'erreur HTTP 500 mais basculer sur MemoryStore
    const degradedRes = await workerB.send("increment", { key: disconnectKey });
    assert.ok(degradedRes.totalHits >= 1, "Le fallback mémoire doit répondre avec succès");
    assert.equal(degradedRes.isDegraded, true, "Worker B doit être marqué en mode dégradé (isDegraded = true)");

    // Reconnexion de Worker B
    await workerB.send("reconnect_redis");

    // Attente brève de rétablissement
    await new Promise((r) => setTimeout(r, 600));

    // Nouvelle requête sur Worker B : reprise normale sur Redis
    const recoveredKey = `recovered-ip-${Date.now()}`;
    const recoveredRes = await workerB.send("increment", { key: recoveredKey });
    assert.equal(recoveredRes.totalHits, 1, "Worker B doit pouvoir incrémenter à nouveau");
    assert.equal(recoveredRes.isDegraded, false, "Worker B doit être repassé en mode normal (isDegraded = false)");
  });
});
