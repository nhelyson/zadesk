import crypto from "crypto";
import { getRedisClient, isRedisReady } from "../config/redis.js";
import { env } from "../config/env.js";

export const PRESENCE_STATES = {
  ONLINE: "ONLINE",
  AWAY: "AWAY",
  OFFLINE: "OFFLINE",
};

export const AVAILABILITY_STATES = {
  AVAILABLE: "AVAILABLE",
  BUSY: "BUSY",
  DND: "DND",
};

export function getPresenceConfig(overrides = {}) {
  return {
    heartbeatIntervalSec:
      Number(overrides.heartbeatIntervalSec) || env.PRESENCE_HEARTBEAT_INTERVAL_SEC || 30,
    ttlSec: Number(overrides.ttlSec) || env.PRESENCE_TTL_SEC || 75,
    awayAfterSec: Number(overrides.awayAfterSec) || env.PRESENCE_AWAY_AFTER_SEC || 300,
  };
}

/**
 * Normalize database availability enum values into the 3 explicit availability choices.
 * Legacy AWAY/OFFLINE rows map cleanly to BUSY/DND without losing persistence.
 */
export function normalizeAvailability(raw) {
  if (raw === "AVAILABLE") return AVAILABILITY_STATES.AVAILABLE;
  if (raw === "DND" || raw === "OFFLINE") return AVAILABILITY_STATES.DND;
  if (raw === "BUSY" || raw === "AWAY") return AVAILABILITY_STATES.BUSY;
  return AVAILABILITY_STATES.AVAILABLE;
}

// Local in-memory store fallback when Redis is unavailable or in isolated unit tests
// Structure: Map<instanceKey, { workspaceId, userId, sessionHash, instanceId, lastHeartbeatAt, lastActivityAt, expiresAt }>
const memoryInstances = new Map();

export function clearInMemoryPresence() {
  memoryInstances.clear();
}

export async function clearUserPresence({ workspaceId, userId }) {
  for (const [key, val] of memoryInstances.entries()) {
    if (val.workspaceId === workspaceId && val.userId === userId) {
      memoryInstances.delete(key);
    }
  }
  if (isRedisReady()) {
    try {
      const redis = getRedisClient();
      const idxKey = buildUserIndexRedisKey(workspaceId, userId);
      const ids = await redis.smembers(idxKey);
      if (ids && ids.length > 0) {
        const keys = ids.map((id) => buildInstanceRedisKey(workspaceId, userId, id));
        await redis.del(...keys, idxKey);
      } else {
        await redis.del(idxKey);
      }
    } catch {}
  }
}

function hashValue(val) {
  return crypto.createHash("sha256").update(String(val || "")).digest("hex").slice(0, 24);
}

export function buildInstanceId(sessionToken, tabId) {
  return hashValue(`${sessionToken || "anon"}:${tabId || "default"}`);
}

function buildInstanceRedisKey(workspaceId, userId, instanceId) {
  return `zadesk:presence:ws:${workspaceId}:user:${userId}:inst:${instanceId}`;
}

function buildUserIndexRedisKey(workspaceId, userId) {
  return `zadesk:presence:ws:${workspaceId}:user:${userId}:idx`;
}

function buildSessionIndexRedisKey(sessionHash) {
  return `zadesk:presence:sess:${sessionHash}`;
}

/**
 * Pure deterministic calculation of presence from active non-expired client instances.
 */
export function computePresenceFromInstances(instances, now = Date.now(), configOverrides = {}) {
  const config = getPresenceConfig(configOverrides);
  const ttlMs = config.ttlSec * 1000;
  const awayMs = config.awayAfterSec * 1000;

  const activeInstances = (instances || []).filter(
    (inst) => inst && typeof inst.lastHeartbeatAt === "number" && now - inst.lastHeartbeatAt <= ttlMs
  );

  if (activeInstances.length === 0) {
    return {
      state: PRESENCE_STATES.OFFLINE,
      activeSessions: 0,
      lastHeartbeatAt: null,
      lastActivityAt: null,
    };
  }

  let latestHeartbeat = 0;
  let latestActivity = 0;

  for (const inst of activeInstances) {
    if (inst.lastHeartbeatAt > latestHeartbeat) {
      latestHeartbeat = inst.lastHeartbeatAt;
    }
    if (typeof inst.lastActivityAt === "number" && inst.lastActivityAt > latestActivity) {
      latestActivity = inst.lastActivityAt;
    }
  }

  const idleDurationMs = Math.max(0, now - latestActivity);
  const state = idleDurationMs >= awayMs ? PRESENCE_STATES.AWAY : PRESENCE_STATES.ONLINE;

  return {
    state,
    activeSessions: activeInstances.length,
    lastHeartbeatAt: new Date(latestHeartbeat).toISOString(),
    lastActivityAt: new Date(latestActivity).toISOString(),
  };
}

/**
 * Record an advisor browser/tab heartbeat signal.
 * Never persists heartbeats as DB rows; uses Redis TTL with in-memory fallback.
 */
export async function recordHeartbeat({
  workspaceId,
  userId,
  sessionToken,
  tabId = "default",
  idleMs = 0,
  now = Date.now(),
  config: configOverrides = {},
}) {
  if (!workspaceId || !userId || !sessionToken) {
    const err = new Error("Contexte de session invalide pour le signal de présence.");
    err.status = 400;
    throw err;
  }

  const config = getPresenceConfig(configOverrides);
  const clampedIdleMs = Math.max(0, Math.min(Number(idleMs) || 0, 24 * 60 * 60 * 1000));
  const sessionHash = hashValue(sessionToken);
  const instanceId = buildInstanceId(sessionToken, tabId);
  const instKey = buildInstanceRedisKey(workspaceId, userId, instanceId);

  const payload = {
    workspaceId,
    userId,
    sessionHash,
    instanceId,
    lastHeartbeatAt: now,
    lastActivityAt: now - clampedIdleMs,
  };

  if (isRedisReady()) {
    try {
      const redis = getRedisClient();
      const userIdxKey = buildUserIndexRedisKey(workspaceId, userId);
      const sessIdxKey = buildSessionIndexRedisKey(sessionHash);

      const pipeline = redis.multi();
      pipeline.set(instKey, JSON.stringify(payload), "EX", config.ttlSec);
      pipeline.sadd(userIdxKey, instanceId);
      pipeline.expire(userIdxKey, Math.max(config.ttlSec * 10, 3600));
      pipeline.sadd(sessIdxKey, instKey);
      pipeline.expire(sessIdxKey, Math.max(config.ttlSec * 10, 3600));
      await pipeline.exec();
    } catch {
      // Fallback transparently to memory below
    }
  }

  memoryInstances.set(instKey, {
    ...payload,
    expiresAt: now + config.ttlSec * 1000,
  });

  return getUserPresence({ workspaceId, userId, now, config });
}

/**
 * Remove a single tab/device presence instance immediately (on tab close / pagehide).
 */
export async function leavePresence({ workspaceId, userId, sessionToken, tabId = "default" }) {
  if (!workspaceId || !userId || !sessionToken) return { removed: false };

  const instanceId = buildInstanceId(sessionToken, tabId);
  const instKey = buildInstanceRedisKey(workspaceId, userId, instanceId);

  memoryInstances.delete(instKey);

  if (isRedisReady()) {
    try {
      const redis = getRedisClient();
      const userIdxKey = buildUserIndexRedisKey(workspaceId, userId);
      await redis.multi().del(instKey).srem(userIdxKey, instanceId).exec();
    } catch {}
  }

  return { removed: true };
}

/**
 * Revoke all presence instances bound to an auth session (on explicit logout).
 * Leaves other devices/sessions of the same user intact!
 */
export async function revokeSessionPresence(sessionToken) {
  if (!sessionToken) return { removedCount: 0 };
  const sessionHash = hashValue(sessionToken);
  let removedCount = 0;

  for (const [key, val] of memoryInstances.entries()) {
    if (val.sessionHash === sessionHash) {
      memoryInstances.delete(key);
      removedCount += 1;
    }
  }

  if (isRedisReady()) {
    try {
      const redis = getRedisClient();
      const sessIdxKey = buildSessionIndexRedisKey(sessionHash);
      const keys = await redis.smembers(sessIdxKey);
      if (keys && keys.length > 0) {
        await redis.del(...keys, sessIdxKey);
        removedCount = Math.max(removedCount, keys.length);
      } else {
        await redis.del(sessIdxKey);
      }
    } catch {}
  }

  return { removedCount };
}

async function readUserInstances({ workspaceId, userId, now = Date.now() }) {
  const results = [];
  const seenIds = new Set();

  if (isRedisReady()) {
    try {
      const redis = getRedisClient();
      const userIdxKey = buildUserIndexRedisKey(workspaceId, userId);
      const instanceIds = await redis.smembers(userIdxKey);
      if (instanceIds && instanceIds.length > 0) {
        const keys = instanceIds.map((id) => buildInstanceRedisKey(workspaceId, userId, id));
        const values = await redis.mget(...keys);
        const staleIds = [];

        values.forEach((raw, idx) => {
          if (!raw) {
            staleIds.push(instanceIds[idx]);
            return;
          }
          try {
            const parsed = JSON.parse(raw);
            seenIds.add(instanceIds[idx]);
            results.push(parsed);
          } catch {
            staleIds.push(instanceIds[idx]);
          }
        });

        if (staleIds.length > 0) {
          redis.srem(userIdxKey, ...staleIds).catch(() => {});
        }
        return results;
      }
    } catch {
      // Fallback to in-memory map
    }
  }

  for (const [key, inst] of memoryInstances.entries()) {
    if (inst.expiresAt <= now) {
      memoryInstances.delete(key);
      continue;
    }
    if (inst.workspaceId === workspaceId && inst.userId === userId && !seenIds.has(inst.instanceId)) {
      results.push(inst);
    }
  }

  return results;
}

export async function getUserPresence({ workspaceId, userId, now = Date.now(), config: configOverrides = {} }) {
  const instances = await readUserInstances({ workspaceId, userId, now });
  return computePresenceFromInstances(instances, now, configOverrides);
}

export async function getWorkspacePresenceMap({
  workspaceId,
  userIds = [],
  now = Date.now(),
  config: configOverrides = {},
}) {
  const map = new Map();
  await Promise.all(
    userIds.map(async (uid) => {
      const info = await getUserPresence({ workspaceId, userId: uid, now, config: configOverrides });
      map.set(uid, info);
    })
  );
  return map;
}
