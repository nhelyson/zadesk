import type { AgentConversationItem } from '@/types/workspace';

export type ConstellationZone = 'priority' | 'active' | 'resolved';

export interface Positioned3DNode {
  id: string;
  x: number;
  y: number;
  z: number;
  zone: ConstellationZone;
}

export interface Constellation3DConnection {
  id: string;
  fromId: string;
  toId: string;
  kind: 'zone' | 'customer' | 'ticket';
  zone: ConstellationZone;
}

export interface Previous3DLayoutMemory {
  nodes: Map<string, Positioned3DNode>;
}

export const MIN_3D_NODE_DIST = 4.6;

export function getConversationZone(
  status: string,
  unreadCount: number
): ConstellationZone {
  if (status === 'RESOLVED' || status === 'CLOSED') return 'resolved';
  if (unreadCount > 0 || status === 'OPEN' || status === 'WAITING_ASSIGNMENT') {
    return 'priority';
  }
  return 'active';
}

function hashIdToUnit(id: string, salt: number): number {
  let h = 2166136261 ^ salt;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 10000) / 10000;
}

function getZoneTargetPosition(
  id: string,
  zone: ConstellationZone,
  slotIndex: number,
  existing: Positioned3DNode[]
): { x: number; y: number; z: number } {
  const goldenAngle = 2.399963229728653;
  const jitter = hashIdToUnit(id, 17);

  for (let step = slotIndex; step < slotIndex + 160; step++) {
    const theta = step * goldenAngle + jitter * 0.55;
    const elevSeed = hashIdToUnit(id, step + 31) - 0.5;
    let x = 0;
    let y = 0;
    let z = 0;

    if (zone === 'priority') {
      // Inner core foreground cloud (calm elevated tier)
      const r = step === 0 ? 0.4 : 2.8 + Math.sqrt(step) * 2.25;
      const phi = elevSeed * Math.PI * 0.24;
      x = Math.cos(theta) * Math.cos(phi) * r;
      y = 1.6 + Math.sin(phi) * r * 0.45;
      z = 1.8 + Math.sin(theta) * Math.cos(phi) * r;
    } else if (zone === 'active') {
      // Mid orbital ring surrounding the priority core
      const r = 9.2 + Math.sqrt(step + 1) * 2.0;
      const phi = elevSeed * Math.PI * 0.22;
      x = Math.cos(theta) * Math.cos(phi) * r;
      y = Math.sin(phi) * r * 0.35;
      z = Math.sin(theta) * Math.cos(phi) * r;
    } else {
      // Calm outer perimeter for resolved / closed conversations
      const r = 16.8 + Math.sqrt(step + 1) * 1.75;
      const phi = elevSeed * Math.PI * 0.18;
      x = Math.cos(theta) * Math.cos(phi) * r;
      y = -1.8 + Math.sin(phi) * r * 0.28;
      z = -2.0 + Math.sin(theta) * Math.cos(phi) * r;
    }

    const collides = existing.some((p) => {
      const dx = p.x - x;
      const dy = p.y - y;
      const dz = p.z - z;
      return Math.sqrt(dx * dx + dy * dy + dz * dz) < MIN_3D_NODE_DIST;
    });

    if (!collides) {
      return { x, y, z };
    }
  }

  // Fallback wide spiral
  const fallbackTheta = (slotIndex + jitter) * goldenAngle;
  const fallbackR = zone === 'priority' ? 7.5 : zone === 'active' ? 16 : 24;
  return {
    x: Math.cos(fallbackTheta) * fallbackR,
    y: (jitter - 0.5) * 6,
    z: Math.sin(fallbackTheta) * fallbackR,
  };
}

/**
 * Computes stable 3D coordinates grouped by operational status zone:
 * - Priority (OPEN / unread) at core foreground
 * - Active (ACTIVE / ASSIGNED / WAITING_CUSTOMER) in mid orbit
 * - Resolved / Closed along outer quiet ring
 * Existing nodes keep their 3D position as long as they remain in the same zone.
 */
export function computeConstellation3DLayout(
  conversations: AgentConversationItem[],
  unreadCounts: Record<string, number>,
  prevMemory: Previous3DLayoutMemory | null
): {
  positions: Map<string, Positioned3DNode>;
  connections: Constellation3DConnection[];
} {
  const positions = new Map<string, Positioned3DNode>();
  const placedList: Positioned3DNode[] = [];
  const zoneCounts: Record<ConstellationZone, number> = {
    priority: 0,
    active: 0,
    resolved: 0,
  };

  // Pass 1: Keep existing nodes pinned if their operational zone didn't change
  const moversOrNewcomers: Array<{ conv: AgentConversationItem; zone: ConstellationZone }> = [];

  conversations.forEach((conv) => {
    const unread = Math.max(0, unreadCounts[conv.id] ?? 0);
    const zone = getConversationZone(conv.status, unread);
    const prev = prevMemory?.nodes.get(conv.id);

    if (prev && prev.zone === zone) {
      const pinned: Positioned3DNode = { ...prev };
      positions.set(conv.id, pinned);
      placedList.push(pinned);
      zoneCounts[zone] += 1;
    } else {
      moversOrNewcomers.push({ conv, zone });
    }
  });

  // Pass 2: Place newcomers or status-transitioned conversations into free 3D slots
  moversOrNewcomers.forEach(({ conv, zone }) => {
    const slotIdx = zoneCounts[zone];
    zoneCounts[zone] += 1;
    const coords = getZoneTargetPosition(conv.id, zone, slotIdx, placedList);
    const placed: Positioned3DNode = {
      id: conv.id,
      ...coords,
      zone,
    };
    positions.set(conv.id, placed);
    placedList.push(placed);
  });

  const connections = buildReal3DConnections(conversations, positions);
  return { positions, connections };
}

function normalizePhone(phone?: string | null): string {
  if (!phone) return '';
  return phone.replace(/\D/g, '');
}

/**
 * Builds clean, sparse 3D curves based on:
 * 1. Nearest neighbors inside the same status zone (Minimum Spanning Tree + 1 short local loop)
 * 2. Real customer continuity (same phone or email across conversations)
 * 3. Shared ticket reference (if present)
 */
export function buildReal3DConnections(
  conversations: AgentConversationItem[],
  positions: Map<string, Positioned3DNode>
): Constellation3DConnection[] {
  const connections: Constellation3DConnection[] = [];
  const edgeKeys = new Set<string>();

  const addEdge = (
    aId: string,
    bId: string,
    kind: Constellation3DConnection['kind'],
    zone: ConstellationZone
  ) => {
    if (aId === bId) return;
    const [u, v] = aId < bId ? [aId, bId] : [bId, aId];
    const key = `${u}::${v}`;
    if (edgeKeys.has(key)) {
      // Upgrade existing edge priority if a stronger customer/ticket link applies
      const existing = connections.find((c) => c.id === `edge-${key}`);
      if (existing && kind !== 'zone') {
        existing.kind = kind;
      }
      return;
    }
    edgeKeys.add(key);
    connections.push({
      id: `edge-${key}`,
      fromId: aId,
      toId: bId,
      kind,
      zone,
    });
  };

  const dist3D = (aId: string, bId: string) => {
    const pa = positions.get(aId);
    const pb = positions.get(bId);
    if (!pa || !pb) return Infinity;
    return Math.hypot(pa.x - pb.x, pa.y - pb.y, pa.z - pb.z);
  };

  // 1. Intra-zone Minimum Spanning Tree (+ up to 1 loop for constellations with >= 3 nodes)
  const byZone = new Map<ConstellationZone, Positioned3DNode[]>();
  positions.forEach((node) => {
    const list = byZone.get(node.zone);
    if (list) list.push(node);
    else byZone.set(node.zone, [node]);
  });

  byZone.forEach((members, zone) => {
    if (members.length < 2) return;
    const connected = new Set<string>([members[0].id]);

    while (connected.size < members.length) {
      let bestA: string | null = null;
      let bestB: string | null = null;
      let bestD = Infinity;
      for (const a of members) {
        if (!connected.has(a.id)) continue;
        for (const b of members) {
          if (connected.has(b.id)) continue;
          const d = dist3D(a.id, b.id);
          if (d < bestD) {
            bestD = d;
            bestA = a.id;
            bestB = b.id;
          }
        }
      }
      if (!bestA || !bestB) break;
      addEdge(bestA, bestB, 'zone', zone);
      connected.add(bestB);
    }

    // Add up to 2 gentle structural constellation loops per zone
    if (members.length >= 3) {
      const candidates: Array<{ a: string; b: string; d: number }> = [];
      for (let i = 0; i < members.length; i++) {
        for (let j = i + 1; j < members.length; j++) {
          const a = members[i].id;
          const b = members[j].id;
          const [u, v] = a < b ? [a, b] : [b, a];
          if (!edgeKeys.has(`${u}::${v}`)) {
            candidates.push({ a, b, d: dist3D(a, b) });
          }
        }
      }
      candidates.sort((p1, p2) => p1.d - p2.d);
      const maxLoops = Math.min(2, Math.floor(members.length / 3) + 1);
      for (let k = 0; k < Math.min(maxLoops, candidates.length); k++) {
        addEdge(candidates[k].a, candidates[k].b, 'zone', zone);
      }
    }
  });

  // 2. Real customer & ticket relationships across conversations
  for (let i = 0; i < conversations.length; i++) {
    for (let j = i + 1; j < conversations.length; j++) {
      const c1 = conversations[i];
      const c2 = conversations[j];
      const pos1 = positions.get(c1.id);
      if (!pos1) continue;

      const t1 = c1.ticket?.id || c1.ticketId;
      const t2 = c2.ticket?.id || c2.ticketId;
      if (t1 && t2 && t1 === t2) {
        addEdge(c1.id, c2.id, 'ticket', pos1.zone);
        continue;
      }

      const p1 = normalizePhone(c1.customerPhone);
      const p2 = normalizePhone(c2.customerPhone);
      const e1 = c1.customerEmail?.trim().toLowerCase() || '';
      const e2 = c2.customerEmail?.trim().toLowerCase() || '';

      if ((p1.length >= 6 && p1 === p2) || (e1 && e1 === e2)) {
        addEdge(c1.id, c2.id, 'customer', pos1.zone);
      }
    }
  }

  return connections;
}

/**
 * Computes optimal global camera target & position from actual node bounding box
 * so both 2 conversations and 40 conversations fill ~68% of the viewport cleanly.
 */
export function computeBoundingCamera3D(
  points: Array<{ x: number; y: number; z: number }>,
  aspect = 1.5,
  fovDeg = 42
): {
  target: { x: number; y: number; z: number };
  cameraPos: { x: number; y: number; z: number };
} {
  if (points.length === 0) {
    return {
      target: { x: 0, y: 0, z: 0 },
      cameraPos: { x: 4, y: 11, z: 22 },
    };
  }

  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  let minZ = Infinity;
  let maxZ = -Infinity;

  for (const p of points) {
    if (p.x < minX) minX = p.x;
    if (p.x > maxX) maxX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.y > maxY) maxY = p.y;
    if (p.z < minZ) minZ = p.z;
    if (p.z > maxZ) maxZ = p.z;
  }

  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;
  const cz = (minZ + maxZ) / 2;

  const spanX = Math.max(4.5, maxX - minX + 4.5);
  const spanY = Math.max(3.5, maxY - minY + 3.5);
  const spanZ = Math.max(4.5, maxZ - minZ + 4.5);
  const boundingRadius = Math.hypot(spanX, spanY, spanZ) * 0.5;

  const fovRad = (fovDeg * Math.PI) / 180;
  const halfFovV = fovRad / 2;
  const halfFovH = Math.atan(Math.tan(halfFovV) * Math.max(0.75, aspect));
  const limitingHalfFov = Math.min(halfFovV, halfFovH);

  // Add comfortable framing margin so cards/labels around outer stars stay inside viewport
  const distance = Math.min(
    62,
    Math.max(12.5, (boundingRadius / Math.sin(limitingHalfFov)) * 1.18)
  );

  // Calm elevated architectural 3/4 view angle (~28 deg above horizon, ~16 deg azimuth)
  const elevRad = (28 * Math.PI) / 180;
  const azimRad = (16 * Math.PI) / 180;
  const horiz = distance * Math.cos(elevRad);

  return {
    target: { x: cx, y: cy, z: cz },
    cameraPos: {
      x: cx + Math.sin(azimRad) * horiz,
      y: cy + distance * Math.sin(elevRad),
      z: cz + Math.cos(azimRad) * horiz,
    },
  };
}

