import test from 'node:test';
import assert from 'node:assert/strict';
import {
  computeConstellationLayout,
  computeFitCamera,
  computeWheelZoomCamera,
  MIN_NODE_DX,
  MIN_NODE_DY,
} from '../pulseLayout.ts';
import {
  computeConstellation3DLayout,
  computeBoundingCamera3D,
  MIN_3D_NODE_DIST,
} from '../pulseLayout3D.ts';
import {
  computeConversationUnreadCount,
  markConversationAsReadInStore,
  incrementConversationUnreadInStore,
  applyIncomingPulseEventToConversations,
  matchesConversationFilter,
  matchesConversationSearch,
  getConversationPreview,
} from '../pulseState.ts';

test('1. Constellation layout places 28 conversations across 4 categories with zero node overlaps', () => {
  const categories = ['Livraison', 'Facturation', 'Garantie', 'Installation'];
  const items = Array.from({ length: 28 }, (_, idx) => ({
    id: `conv-${idx + 1}`,
    category: categories[idx % categories.length],
  }));

  const { clusters, positions } = computeConstellationLayout(items, null, {
    width: 900,
    height: 600,
  });

  assert.equal(clusters.length, 4);
  assert.equal(positions.size, 28);

  const list = Array.from(positions.values());
  for (let i = 0; i < list.length; i++) {
    for (let j = i + 1; j < list.length; j++) {
      const dx = (list[j].x - list[i].x) / (MIN_NODE_DX * 0.92);
      const dy = (list[j].y - list[i].y) / (MIN_NODE_DY * 0.92);
      const normDist = Math.hypot(dx, dy);
      assert.ok(
        normDist >= 1,
        `Nodes ${list[i].id} and ${list[j].id} overlap (normDist=${normDist.toFixed(2)})`
      );
    }
  }
});

test('2. Constellation layout preserves spatial memory when a new conversation arrives in an existing cluster', () => {
  const initialItems = [
    { id: 'c1', category: 'Livraison' },
    { id: 'c2', category: 'Livraison' },
    { id: 'c3', category: 'Livraison' },
    { id: 'c4', category: 'Facturation' },
  ];

  const first = computeConstellationLayout(initialItems, null, { width: 820, height: 560 });
  const memory = {
    nodes: new Map(
      Array.from(first.positions.entries()).map(([id, p]) => [
        id,
        { x: p.x, y: p.y, category: p.category },
      ])
    ),
    categoryOrder: first.categoryOrder,
    clusterCenters: first.clusterCenters,
  };

  const withNewcomer = [...initialItems, { id: 'c5', category: 'Livraison' }];
  const second = computeConstellationLayout(withNewcomer, memory, { width: 820, height: 560 });

  assert.equal(second.positions.size, 5);
  // Existing nodes in Facturation & Livraison should stay close to their prior positions
  const oldC4 = first.positions.get('c4');
  const newC4 = second.positions.get('c4');
  const driftC4 = Math.hypot(newC4.x - oldC4.x, newC4.y - oldC4.y);
  assert.ok(driftC4 < 25, `Expected minimal drift for unchanged node c4, got ${driftC4}`);
});

test('3. Wheel zoom keeps pointer world coordinate invariant and fit camera contains all nodes', () => {
  const cam = { x: 40, y: -25, zoom: 1 };
  const clientX = 320;
  const clientY = 240;
  const left = 100;
  const top = 80;
  const width = 760;
  const height = 520;

  const worldBeforeX = (clientX - left - width / 2 - cam.x) / cam.zoom;
  const worldBeforeY = (clientY - top - height / 2 - cam.y) / cam.zoom;

  const zoomed = computeWheelZoomCamera(cam, clientX, clientY, left, top, width, height, 1.25);

  const worldAfterX = (clientX - left - width / 2 - zoomed.x) / zoomed.zoom;
  const worldAfterY = (clientY - top - height / 2 - zoomed.y) / zoomed.zoom;

  assert.ok(Math.abs(worldBeforeX - worldAfterX) < 1e-6);
  assert.ok(Math.abs(worldBeforeY - worldAfterY) < 1e-6);

  const fitNarrow = computeFitCamera(
    [
      { x: -300, y: -200 },
      { x: 300, y: 200 },
    ],
    [{ cx: 0, cy: 0, radius: 320 }],
    460,
    520
  );
  assert.ok(fitNarrow.zoom >= 0.42 && fitNarrow.zoom <= 1.25);
});

test('4. Unread tracking persists across reloads, clears on read, and SSE updates do not duplicate stars', () => {
  const convCustomerLast = {
    id: 'conv-a',
    customerName: 'Sophie Martin',
    category: 'Livraison',
    status: 'OPEN',
    lastMessageAt: '2026-11-26T10:00:00.000Z',
    messages: [
      {
        id: 'm1',
        senderType: 'CUSTOMER',
        content: 'Bonjour, où est mon colis ?',
        isInternalNote: false,
        createdAt: '2026-11-26T10:00:00.000Z',
      },
    ],
  };

  let store = { readAt: {}, unreadCounts: {} };
  assert.equal(computeConversationUnreadCount(convCustomerLast, store), 1);
  assert.equal(getConversationPreview(convCustomerLast), 'Bonjour, où est mon colis ?');

  // Multiple successive SSE client messages increment persisted unread count
  store = incrementConversationUnreadInStore(store, 'conv-a');
  store = incrementConversationUnreadInStore(store, 'conv-a');
  assert.equal(computeConversationUnreadCount(convCustomerLast, store), 2);
  assert.equal(matchesConversationFilter(convCustomerLast, 2, 'UNREAD'), true);

  // Reading conversation clears unread and persists readAt after reload
  const readTs = new Date('2026-11-26T10:00:05.000Z').getTime();
  store = markConversationAsReadInStore(store, 'conv-a', readTs, readTs);
  assert.equal(computeConversationUnreadCount(convCustomerLast, store), 0);
  assert.equal(matchesConversationFilter(convCustomerLast, 0, 'UNREAD'), false);

  // Incoming SSE message updates existing star in place without adding a second entry
  const updatedList = applyIncomingPulseEventToConversations([convCustomerLast], {
    type: 'PULSE_MESSAGE_CREATED',
    conversationId: 'conv-a',
    messageId: 'm2',
    senderType: 'CUSTOMER',
    contentPreview: 'Merci de votre retour rapide',
    timestamp: '2026-11-26T10:05:00.000Z',
  });
  assert.equal(updatedList.length, 1);
  assert.equal(updatedList[0].lastMessage, 'Merci de votre retour rapide');
  assert.equal(computeConversationUnreadCount(updatedList[0], store), 1);
  assert.equal(matchesConversationSearch(updatedList[0], 'retour rapide'), true);
});

test('5. 3D status layout places 24 conversations without overlap, preserves positions, and connects same-customer/ticket links', () => {
  const convs = Array.from({ length: 24 }, (_, idx) => ({
    id: `c3d-${idx + 1}`,
    customerName: `Client ${idx + 1}`,
    customerPhone: idx === 0 || idx === 10 ? '+242 06 480 92 10' : `+242 06 500 00 ${10 + idx}`,
    status: idx < 6 ? 'OPEN' : idx < 18 ? 'ACTIVE' : 'RESOLVED',
    ticketId: idx === 2 || idx === 15 ? 'ticket-shared-99' : undefined,
    messages: [],
  }));

  const unread = { 'c3d-1': 2, 'c3d-2': 1, 'c3d-7': 1 };
  const first = computeConstellation3DLayout(convs, unread, null);

  assert.equal(first.positions.size, 24);
  assert.equal(first.positions.get('c3d-1').zone, 'priority');
  assert.equal(first.positions.get('c3d-7').zone, 'priority');
  assert.equal(first.positions.get('c3d-8').zone, 'active');
  assert.equal(first.positions.get('c3d-20').zone, 'resolved');

  // Verify 3D minimum distance (zero overlap)
  const nodes = Array.from(first.positions.values());
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const dist = Math.hypot(
        nodes[j].x - nodes[i].x,
        nodes[j].y - nodes[i].y,
        nodes[j].z - nodes[i].z
      );
      assert.ok(
        dist >= MIN_3D_NODE_DIST * 0.99,
        `3D overlap between ${nodes[i].id} and ${nodes[j].id}: dist=${dist.toFixed(2)}`
      );
    }
  }

  // Verify real customer & ticket connections exist alongside zone MST edges
  const customerBridge = first.connections.find(
    (e) =>
      e.kind === 'customer' &&
      ((e.fromId === 'c3d-1' && e.toId === 'c3d-11') ||
        (e.fromId === 'c3d-11' && e.toId === 'c3d-1'))
  );
  assert.ok(customerBridge, 'Expected customer bridge between c3d-1 and c3d-11 sharing phone');

  const ticketBridge = first.connections.find(
    (e) =>
      e.kind === 'ticket' &&
      ((e.fromId === 'c3d-3' && e.toId === 'c3d-16') ||
        (e.fromId === 'c3d-16' && e.toId === 'c3d-3'))
  );
  assert.ok(ticketBridge, 'Expected ticket bridge between c3d-3 and c3d-16 sharing ticketId');

  // Verify spatial memory keeps unchanged nodes at exact same coordinates when newcomer arrives
  const withNewcomer = [
    ...convs,
    { id: 'c3d-25', customerName: 'Nouveau', status: 'OPEN', messages: [] },
  ];
  const second = computeConstellation3DLayout(withNewcomer, { ...unread, 'c3d-25': 1 }, {
    nodes: first.positions,
  });
  assert.deepEqual(second.positions.get('c3d-1'), first.positions.get('c3d-1'));
  assert.deepEqual(second.positions.get('c3d-20'), first.positions.get('c3d-20'));

  // Verify dynamic bounding camera scales smoothly between 2 nodes and 24 nodes
  const camSmall = computeBoundingCamera3D(
    [
      { x: 0, y: 1, z: 2 },
      { x: 4, y: 1.5, z: -1 },
    ],
    1.6,
    42
  );
  const camLarge = computeBoundingCamera3D(nodes, 1.6, 42);
  const distSmall = Math.hypot(
    camSmall.cameraPos.x - camSmall.target.x,
    camSmall.cameraPos.y - camSmall.target.y,
    camSmall.cameraPos.z - camSmall.target.z
  );
  const distLarge = Math.hypot(
    camLarge.cameraPos.x - camLarge.target.x,
    camLarge.cameraPos.y - camLarge.target.y,
    camLarge.cameraPos.z - camLarge.target.z
  );
  assert.ok(distSmall < distLarge, `Expected dynamic camera closer for 2 nodes (${distSmall}) than 24 nodes (${distLarge})`);
});
