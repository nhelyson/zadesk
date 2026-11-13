import Redis from "ioredis";
import { logger } from "../utils/logger.js";
import { ROLES } from "../security/permissions.js";
import { prisma } from "../lib/prisma.js";

const REDIS_URL = process.env.REDIS_URL || "redis://redis:6379";

export const PULSE_EVENT_TYPES = {
  MESSAGE_CREATED: "PULSE_MESSAGE_CREATED",
  CONVERSATION_CREATED: "PULSE_CONVERSATION_CREATED",
  CONVERSATION_UPDATED: "PULSE_CONVERSATION_UPDATED",
  CONVERSATION_READ: "PULSE_CONVERSATION_READ",
};

// Singleton Redis clients for pub/sub
let publisherClient = null;
let subscriberClient = null;

function getPublisher() {
  if (!publisherClient) {
    publisherClient = new Redis(REDIS_URL, {
      connectionName: "zadesk:pulse-publisher",
      lazyConnect: false,
      maxRetriesPerRequest: 3,
    });
    publisherClient.on("error", (err) => {
      logger.warn(`[Pulse:Redis:Publisher] Erreur: ${err.message}`);
    });
  }
  return publisherClient;
}

function getSubscriber() {
  if (!subscriberClient) {
    subscriberClient = new Redis(REDIS_URL, {
      connectionName: "zadesk:pulse-subscriber",
      lazyConnect: false,
      maxRetriesPerRequest: null,
    });
    subscriberClient.on("error", (err) => {
      logger.warn(`[Pulse:Redis:Subscriber] Erreur: ${err.message}`);
    });
  }
  return subscriberClient;
}

// In-memory ring buffer of recent events per workspace (max 50 events)
const workspaceEventBuffers = new Map();
const MAX_RING_BUFFER = 50;
let eventSeq = 0;

function appendToRingBuffer(workspaceId, event) {
  if (!workspaceEventBuffers.has(workspaceId)) {
    workspaceEventBuffers.set(workspaceId, []);
  }
  const buffer = workspaceEventBuffers.get(workspaceId);
  buffer.push(event);
  if (buffer.length > MAX_RING_BUFFER) {
    buffer.shift();
  }
}

function getReplayEvents(workspaceId, lastEventId) {
  if (!lastEventId || !workspaceEventBuffers.has(workspaceId)) return [];
  const buffer = workspaceEventBuffers.get(workspaceId);
  const lastIndex = buffer.findIndex((e) => e.id === lastEventId);
  if (lastIndex === -1) return [];
  return buffer.slice(lastIndex + 1);
}

/**
 * Publish a real-time event to the Pulse channel
 * @param {string} workspaceId 
 * @param {Object} eventData 
 */
export async function publishPulseEvent(workspaceId, eventData) {
  if (!workspaceId || !eventData?.type) {
    return;
  }

  const timestamp = new Date().toISOString();
  eventSeq = (eventSeq + 1) % 1000000;
  const eventId = `pulse-${Date.now()}-${eventSeq}`;

  const payload = {
    id: eventId,
    workspaceId,
    timestamp,
    ...eventData,
  };

  // 1. Enregistrer dans le tampon circulaire local pour reconnexion rapide
  appendToRingBuffer(workspaceId, payload);

  // 2. Diffuser sur Redis Pub/Sub pour tous les nœuds de workers/backend
  try {
    const pub = getPublisher();
    const channel = `zadesk:pulse:${workspaceId}`;
    await pub.publish(channel, JSON.stringify(payload));
  } catch (err) {
    logger.warn(`[Pulse:Publish] Échec publication Redis: ${err.message}`);
  }

  return payload;
}

/**
 * Helper to publish a new message event in Pulse
 */
export async function publishPulseMessageEvent(workspaceId, {
  conversationId,
  messageId,
  senderType,
  senderName,
  content,
  isInternalNote = false,
  assignedAgentId = null,
  customerName = "Client",
  category = "Général",
}) {
  const contentPreview = content.length > 120 ? `${content.slice(0, 117)}...` : content;

  return publishPulseEvent(workspaceId, {
    type: PULSE_EVENT_TYPES.MESSAGE_CREATED,
    conversationId,
    messageId,
    senderType,
    senderName,
    contentPreview,
    isInternalNote: Boolean(isInternalNote),
    assignedAgentId,
    customerName,
    category,
    isClientMessage: senderType === "CUSTOMER",
  });
}

/**
 * Helper to publish a conversation creation or assignment update
 */
export async function publishPulseConversationEvent(workspaceId, {
  type = PULSE_EVENT_TYPES.CONVERSATION_CREATED,
  conversationId,
  customerName,
  customerPhone = null,
  status,
  priority = "MEDIUM",
  category = "Général",
  assignedAgentId = null,
  assignedAgentName = null,
}) {
  return publishPulseEvent(workspaceId, {
    type,
    conversationId,
    customerName,
    customerPhone,
    status,
    priority,
    category,
    assignedAgentId,
    assignedAgentName,
  });
}

/**
 * SSE Stream Handler for real-time Pulse constellation updates
 */
export async function streamPulseEvents(req, res) {
  const { workspaceId } = req.params;
  const userId = req.user.id;
  const userRole = req.currentMembership?.role || "AGENT";
  const lastEventId = req.headers["last-event-id"] || req.query.lastEventId;

  // Set SSE HTTP response headers (X-Accel-Buffering: no is crucial for Nginx)
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    "Connection": "keep-alive",
    "X-Accel-Buffering": "no",
  });

  res.write(`: connected at ${new Date().toISOString()}\n\n`);

  // Initial handshake event
  res.write(`event: connected\ndata: ${JSON.stringify({
    connected: true,
    workspaceId,
    userId,
    userRole,
    serverTime: new Date().toISOString(),
  })}\n\n`);

  // Pre-fetch shared conversation IDs for this agent to enforce RBAC in event distribution
  let sharedConvIds = new Set();
  const updateSharedConvs = async () => {
    try {
      if (userRole === ROLES.AGENT) {
        const shares = await prisma.conversationShare.findMany({
          where: { conversation: { workspaceId }, agentId: userId },
          select: { conversationId: true },
        });
        sharedConvIds = new Set(shares.map((s) => s.conversationId));
      }
    } catch (_) {}
  };

  await updateSharedConvs();

  // Replay missed events if client reconnected with Last-Event-ID
  if (lastEventId) {
    const missed = getReplayEvents(workspaceId, lastEventId);
    for (const evt of missed) {
      if (canAgentViewEvent(evt, userId, userRole, sharedConvIds)) {
        res.write(`id: ${evt.id}\nevent: ${evt.type}\ndata: ${JSON.stringify(evt)}\n\n`);
      }
    }
  }

  // Subscribe to Redis channel for this workspace
  const channel = `zadesk:pulse:${workspaceId}`;
  const sub = getSubscriber();

  const onMessage = (chan, message) => {
    if (chan !== channel) return;
    try {
      const event = JSON.parse(message);
      if (canAgentViewEvent(event, userId, userRole, sharedConvIds)) {
        res.write(`id: ${event.id}\nevent: ${event.type}\ndata: ${JSON.stringify(event)}\n\n`);
      }
    } catch (err) {
      logger.warn(`[Pulse:SSE] Erreur formatage message: ${err.message}`);
    }
  };

  // Register Redis listener
  sub.subscribe(channel).catch((e) => {
    logger.warn(`[Pulse:SSE] Échec souscription canal ${channel}: ${e.message}`);
  });
  sub.on("message", onMessage);

  // Keepalive heartbeat ping every 15s to keep connection open through reverse proxies
  const heartbeatTimer = setInterval(() => {
    res.write(`: ping\n\n`);
  }, 15000);

  // Periodically refresh shared conversation IDs (every 30s)
  const refreshSharesTimer = setInterval(updateSharedConvs, 30000);

  // Clean cleanup on disconnect
  req.on("close", () => {
    clearInterval(heartbeatTimer);
    clearInterval(refreshSharesTimer);
    sub.removeListener("message", onMessage);
    // Unsubscribe from channel if no other local listeners exist
    if (sub.listenerCount("message") === 0) {
      sub.unsubscribe(channel).catch(() => {});
    }
    logger.info(`[Pulse:SSE] Connexion fermée pour agent ${userId} sur workspace ${workspaceId}`);
  });
}

/**
 * Filter: verify if an agent has permission to see an event
 */
function canAgentViewEvent(event, userId, userRole, sharedConvIds) {
  // Supervisors, admins, and owners can view all workspace activity
  if ([ROLES.OWNER, ROLES.ADMIN, ROLES.MANAGER].includes(userRole)) {
    return true;
  }

  // If assigned directly to this agent
  if (event.assignedAgentId && event.assignedAgentId === userId) {
    return true;
  }

  // If conversation is in the agent's shared conversations
  if (event.conversationId && sharedConvIds && sharedConvIds.has(event.conversationId)) {
    return true;
  }

  // New unassigned conversations waiting in queue if visible
  if (!event.assignedAgentId && event.type === PULSE_EVENT_TYPES.CONVERSATION_CREATED) {
    return true;
  }

  return false;
}

