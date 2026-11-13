import { RedisRateLimitStore } from "../../src/middleware/rateLimiter.js";
import { getRedisClient, isRedisReady } from "../../src/config/redis.js";

let store = null;

process.on("message", async (msg) => {
  try {
    switch (msg.action) {
      case "init": {
        store = new RedisRateLimitStore({ prefix: msg.prefix || "rl:dist_test:" });
        store.init({ windowMs: msg.windowMs || 60000 });

        const client = getRedisClient();
        if (client && client.status !== "ready") {
          await new Promise((resolve) => {
            if (isRedisReady()) return resolve();
            const onReady = () => {
              client.removeListener("ready", onReady);
              resolve();
            };
            client.on("ready", onReady);
            setTimeout(resolve, 3000);
          });
        }

        process.send({ type: "init_ack", reqId: msg.reqId, pid: process.pid });
        break;
      }

      case "increment": {
        if (!store) {
          store = new RedisRateLimitStore({ prefix: "rl:dist_test:" });
          store.init({ windowMs: 60000 });
        }
        const result = await store.increment(msg.key);
        process.send({
          type: "increment_res",
          reqId: msg.reqId,
          pid: process.pid,
          totalHits: result.totalHits,
          resetTime: result.resetTime ? result.resetTime.toISOString() : null,
          isDegraded: store.isDegraded,
        });
        break;
      }

      case "resetKey": {
        if (store) {
          await store.resetKey(msg.key);
        }
        process.send({ type: "resetKey_ack", reqId: msg.reqId, pid: process.pid });
        break;
      }

      case "get_state": {
        process.send({
          type: "state_res",
          reqId: msg.reqId,
          pid: process.pid,
          isRedisReady: isRedisReady(),
          isDegraded: store ? store.isDegraded : false,
        });
        break;
      }

      case "disconnect_redis": {
        const client = getRedisClient();
        if (client) {
          await client.disconnect();
        }
        process.send({ type: "disconnect_ack", reqId: msg.reqId, pid: process.pid });
        break;
      }

      case "reconnect_redis": {
        const client = getRedisClient();
        if (client) {
          await client.connect().catch(() => {});
          if (client.status !== "ready") {
            await new Promise((resolve) => {
              const onReady = () => {
                client.removeListener("ready", onReady);
                resolve();
              };
              client.on("ready", onReady);
              setTimeout(resolve, 3000);
            });
          }
        }
        process.send({ type: "reconnect_ack", reqId: msg.reqId, pid: process.pid });
        break;
      }

      case "exit": {
        process.exit(0);
        break;
      }

      default:
        process.send({ type: "error", reqId: msg?.reqId, error: `Unknown action: ${msg?.action}` });
    }
  } catch (err) {
    process.send({ type: "error", reqId: msg?.reqId, error: err.message });
  }
});

// Signal ready
process.send({ type: "ready", pid: process.pid });
