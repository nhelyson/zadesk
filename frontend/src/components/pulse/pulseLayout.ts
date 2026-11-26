export interface LayoutNodeInput {
  id: string;
  category?: string;
}

export interface PositionedNode {
  id: string;
  x: number;
  y: number;
  category: string;
}

export interface CategoryClusterLayout {
  name: string;
  cx: number;
  cy: number;
  count: number;
  radius: number;
}

export interface PreviousLayoutMemory {
  nodes: Map<string, { x: number; y: number; category: string }>;
  categoryOrder: string[];
  clusterCenters: Map<string, { cx: number; cy: number }>;
}

export interface CameraState {
  x: number;
  y: number;
  zoom: number;
  targetX: number;
  targetY: number;
  targetZoom: number;
}

// Minimum clearance between any two star centers (accounts for circle + name pill beneath)
export const MIN_NODE_DX = 74;
export const MIN_NODE_DY = 62;
const CLUSTER_PADDING = 50;
const SLOT_SPACING = 58;

function isEllipticalCollision(dx: number, dy: number, minDx = MIN_NODE_DX, minDy = MIN_NODE_DY): boolean {
  const nx = dx / minDx;
  const ny = dy / minDy;
  return nx * nx + ny * ny < 1;
}

export function computeConstellationLayout(
  items: LayoutNodeInput[],
  prevMemory: PreviousLayoutMemory | null,
  viewport: { width: number; height: number }
): {
  clusters: CategoryClusterLayout[];
  positions: Map<string, PositionedNode>;
  categoryOrder: string[];
  clusterCenters: Map<string, { cx: number; cy: number }>;
} {
  const safeW = Math.max(360, viewport.width || 800);
  const safeH = Math.max(320, viewport.height || 560);

  if (items.length === 0) {
    return {
      clusters: [],
      positions: new Map(),
      categoryOrder: [],
      clusterCenters: new Map(),
    };
  }

  // Group items by category
  const grouped = new Map<string, LayoutNodeInput[]>();
  items.forEach((item) => {
    const cat = (item.category || 'Général').trim() || 'Général';
    const list = grouped.get(cat);
    if (list) list.push(item);
    else grouped.set(cat, [item]);
  });

  // Preserve previous category ordering first so clusters keep familiar sectors
  const activeCatsSet = new Set(grouped.keys());
  const preservedOrder = (prevMemory?.categoryOrder || []).filter((c) => activeCatsSet.has(c));
  const newCats = Array.from(activeCatsSet)
    .filter((c) => !preservedOrder.includes(c))
    .sort((a, b) => a.localeCompare(b, 'fr'));
  const categoryOrder = [...preservedOrder, ...newCats];

  // Estimate each cluster radius based on conversation count
  const clusterMeta = categoryOrder.map((name) => {
    const members = grouped.get(name) || [];
    const n = members.length;
    const radialExtent = n <= 1 ? 0 : SLOT_SPACING * Math.sqrt(n - 1);
    const radius = Math.max(92, Math.ceil(radialExtent + CLUSTER_PADDING));
    return { name, members, count: n, radius };
  });

  // Compute cluster centers (responsive to viewport aspect ratio, zero overlap)
  const clusterCenters = new Map<string, { cx: number; cy: number }>();
  const clusters: CategoryClusterLayout[] = [];

  if (clusterMeta.length === 1) {
    const only = clusterMeta[0];
    clusterCenters.set(only.name, { cx: 0, cy: 0 });
    clusters.push({
      name: only.name,
      cx: 0,
      cy: 0,
      count: only.count,
      radius: only.radius,
    });
  } else {
    const maxRadius = Math.max(...clusterMeta.map((c) => c.radius));
    const aspect = safeW / safeH;
    // Scale ring radii so clusters don't crowd the center when there are many categories
    const totalCircumferenceNeeded = clusterMeta.reduce((sum, c) => sum + c.radius * 2 + 56, 0);
    const baseRingR = Math.max(
      maxRadius * 1.35 + 48,
      totalCircumferenceNeeded / (Math.PI * 2)
    );
    const rx = Math.round(baseRingR * Math.min(1.25, Math.max(0.88, aspect * 0.88)));
    const ry = Math.round(baseRingR * Math.min(1.12, Math.max(0.78, 1 / Math.max(0.85, aspect * 0.82))));

    clusterMeta.forEach((meta, idx) => {
      const angle = (idx / clusterMeta.length) * Math.PI * 2 - Math.PI / 2;
      clusters.push({
        name: meta.name,
        cx: Math.cos(angle) * rx,
        cy: Math.sin(angle) * ry,
        count: meta.count,
        radius: meta.radius,
      });
    });

    // Finite inter-cluster separation pass so large clusters never intersect neighbors
    const clusterGap = 52;
    for (let iter = 0; iter < 24; iter++) {
      let moved = false;
      for (let i = 0; i < clusters.length; i++) {
        for (let j = i + 1; j < clusters.length; j++) {
          const c1 = clusters[i];
          const c2 = clusters[j];
          let dx = c2.cx - c1.cx;
          let dy = c2.cy - c1.cy;
          let dist = Math.hypot(dx, dy);
          if (dist < 1) {
            dx = 1;
            dy = 0.5;
            dist = Math.hypot(dx, dy);
          }
          const minDist = c1.radius + c2.radius + clusterGap;
          if (dist < minDist) {
            const push = (minDist - dist) * 0.52;
            const ux = dx / dist;
            const uy = dy / dist;
            c1.cx -= ux * push;
            c1.cy -= uy * push;
            c2.cx += ux * push;
            c2.cy += uy * push;
            moved = true;
          }
        }
      }
      if (!moved) break;
    }

    // Re-center cluster centroid cleanly around world origin (0, 0)
    const avgX = clusters.reduce((s, c) => s + c.cx, 0) / clusters.length;
    const avgY = clusters.reduce((s, c) => s + c.cy, 0) / clusters.length;
    clusters.forEach((c) => {
      c.cx = Math.round(c.cx - avgX);
      c.cy = Math.round(c.cy - avgY);
      clusterCenters.set(c.name, { cx: c.cx, cy: c.cy });
    });
  }

  // Place nodes inside each cluster, keeping previous relative offsets when possible
  const positions = new Map<string, PositionedNode>();
  const pinnedIds = new Set<string>();
  const goldenAngle = (137.508 * Math.PI) / 180;

  clusters.forEach((cluster) => {
    const members = grouped.get(cluster.name) || [];
    const oldCenter = prevMemory?.clusterCenters.get(cluster.name);
    const placedInCluster: PositionedNode[] = [];

    // Pass 1: Restore existing nodes in the same category at their local offset
    const newcomers: LayoutNodeInput[] = [];
    members.forEach((m) => {
      const prev = prevMemory?.nodes.get(m.id);
      if (prev && prev.category === cluster.name && oldCenter) {
        let localX = prev.x - oldCenter.cx;
        let localY = prev.y - oldCenter.cy;
        // Clamp softly inside updated cluster radius
        const maxLocal = Math.max(24, cluster.radius - 32);
        const dist = Math.hypot(localX, localY);
        if (dist > maxLocal) {
          const ratio = maxLocal / dist;
          localX *= ratio;
          localY *= ratio;
        }
        const node: PositionedNode = {
          id: m.id,
          x: cluster.cx + localX,
          y: cluster.cy + localY,
          category: cluster.name,
        };
        placedInCluster.push(node);
        positions.set(m.id, node);
        pinnedIds.add(m.id);
      } else {
        newcomers.push(m);
      }
    });

    // Pass 2: Place newcomers or category-changed stars into the first collision-free spiral slot
    newcomers.forEach((m, idx) => {
      let chosenX = cluster.cx;
      let chosenY = cluster.cy;
      const startIndex = placedInCluster.length === 0 && idx === 0 ? 0 : 1;

      for (let step = startIndex; step < 180; step++) {
        const angle = step * goldenAngle;
        const radial = step === 0 ? 0 : SLOT_SPACING * Math.sqrt(step);
        const candX = cluster.cx + Math.cos(angle) * radial;
        const candY = cluster.cy + Math.sin(angle) * radial * 0.9;

        const collides = placedInCluster.some((other) =>
          isEllipticalCollision(candX - other.x, candY - other.y)
        );
        if (!collides) {
          chosenX = candX;
          chosenY = candY;
          break;
        }
      }

      const node: PositionedNode = {
        id: m.id,
        x: chosenX,
        y: chosenY,
        category: cluster.name,
      };
      placedInCluster.push(node);
      positions.set(m.id, node);
    });

    // Pass 3: Finite localized collision relaxation (moves newcomers much more than pinned stars)
    for (let iter = 0; iter < 24; iter++) {
      let hadCollision = false;
      for (let i = 0; i < placedInCluster.length; i++) {
        for (let j = i + 1; j < placedInCluster.length; j++) {
          const a = placedInCluster[i];
          const b = placedInCluster[j];
          let dx = b.x - a.x;
          let dy = b.y - a.y;
          if (!isEllipticalCollision(dx, dy)) continue;

          hadCollision = true;
          if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) {
            dx = 1;
            dy = 0.5;
          }
          const nx = dx / MIN_NODE_DX;
          const ny = dy / MIN_NODE_DY;
          const normDist = Math.hypot(nx, ny) || 0.01;
          const overlapFactor = (1 - normDist) / normDist;
          const pushX = dx * overlapFactor * 0.55;
          const pushY = dy * overlapFactor * 0.55;

          const aPinned = pinnedIds.has(a.id);
          const bPinned = pinnedIds.has(b.id);
          const wA = aPinned && !bPinned ? 0.18 : !aPinned && bPinned ? 0.82 : 0.5;
          const wB = 1 - wA;

          a.x -= pushX * wA;
          a.y -= pushY * wA;
          b.x += pushX * wB;
          b.y += pushY * wB;
        }
      }

      // Soft tether to keep nodes inside their cluster ring
      const maxLocal = Math.max(30, cluster.radius - 30);
      placedInCluster.forEach((n) => {
        const lx = n.x - cluster.cx;
        const ly = n.y - cluster.cy;
        const d = Math.hypot(lx, ly);
        if (d > maxLocal) {
          const r = maxLocal / d;
          n.x = cluster.cx + lx * r;
          n.y = cluster.cy + ly * r;
        }
      });

      if (!hadCollision) break;
    }

    // Expand cluster bounding radius slightly if needed so all members cleanly sit inside the visual zone
    let maxMemberDist = 0;
    placedInCluster.forEach((n) => {
      const d = Math.hypot(n.x - cluster.cx, n.y - cluster.cy) + 38;
      if (d > maxMemberDist) maxMemberDist = d;
    });
    cluster.radius = Math.max(cluster.radius, Math.ceil(maxMemberDist));
  });

  return { clusters, positions, categoryOrder, clusterCenters };
}

export function computeFitCamera(
  nodes: Array<{ x: number; y: number }>,
  clusters: Array<{ cx: number; cy: number; radius: number }>,
  viewportWidth: number,
  viewportHeight: number,
  padding = 64
): { x: number; y: number; zoom: number } {
  const safeW = Math.max(240, viewportWidth);
  const safeH = Math.max(240, viewportHeight);

  if (nodes.length === 0 && clusters.length === 0) {
    return { x: 0, y: 0, zoom: 1 };
  }

  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  nodes.forEach((n) => {
    minX = Math.min(minX, n.x - 48);
    maxX = Math.max(maxX, n.x + 48);
    minY = Math.min(minY, n.y - 38);
    maxY = Math.max(maxY, n.y + 52);
  });

  clusters.forEach((c) => {
    minX = Math.min(minX, c.cx - c.radius);
    maxX = Math.max(maxX, c.cx + c.radius);
    minY = Math.min(minY, c.cy - c.radius - 20);
    maxY = Math.max(maxY, c.cy + c.radius);
  });

  const contentW = Math.max(120, maxX - minX);
  const contentH = Math.max(120, maxY - minY);
  const availW = Math.max(120, safeW - padding * 2);
  const availH = Math.max(120, safeH - padding * 2);

  const zoom = Math.min(1.25, Math.max(0.42, Math.min(availW / contentW, availH / contentH)));
  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;

  return {
    x: -centerX * zoom,
    y: -centerY * zoom,
    zoom,
  };
}

export function computeFocusCamera(
  targets: Array<{ x: number; y: number }>,
  currentZoom: number,
  viewportWidth: number,
  viewportHeight: number
): { x: number; y: number; zoom: number } {
  if (targets.length === 0) {
    return { x: 0, y: 0, zoom: currentZoom };
  }
  if (targets.length === 1) {
    const t = targets[0];
    const zoom = Math.min(1.35, Math.max(currentZoom, 1.02));
    return {
      x: -t.x * zoom,
      y: -t.y * zoom,
      zoom,
    };
  }
  return computeFitCamera(targets, [], viewportWidth, viewportHeight, 88);
}

export function computeWheelZoomCamera(
  camera: { x: number; y: number; zoom: number },
  clientX: number,
  clientY: number,
  canvasLeft: number,
  canvasTop: number,
  viewportWidth: number,
  viewportHeight: number,
  zoomFactor: number,
  minZoom = 0.42,
  maxZoom = 2.2
): { x: number; y: number; zoom: number } {
  const nextZoom = Math.min(Math.max(camera.zoom * zoomFactor, minZoom), maxZoom);
  const cursorX = clientX - canvasLeft;
  const cursorY = clientY - canvasTop;

  const worldX = (cursorX - viewportWidth / 2 - camera.x) / camera.zoom;
  const worldY = (cursorY - viewportHeight / 2 - camera.y) / camera.zoom;

  return {
    x: cursorX - viewportWidth / 2 - worldX * nextZoom,
    y: cursorY - viewportHeight / 2 - worldY * nextZoom,
    zoom: nextZoom,
  };
}
