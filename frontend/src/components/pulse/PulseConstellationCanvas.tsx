'use client';

import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import gsap from 'gsap';
import { AgentConversationItem } from '@/types/workspace';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  RotateCw,
  Volume2,
  VolumeX,
  ArrowUpRight,
  Search,
  MessageSquare,
} from 'lucide-react';
import { pulseAudio } from '@/lib/pulseAudio';
import { StatusPill } from '@/components/workspace/design-system';
import {
  computeConstellation3DLayout,
  computeBoundingCamera3D,
  Constellation3DConnection,
  ConstellationZone,
  Previous3DLayoutMemory,
} from './pulseLayout3D';
import {
  getConversationPreview,
  getLatestConversationMessage,
  matchesConversationFilter,
  matchesConversationSearch,
  formatRelativeTimeFr,
  formatClockTimeFr,
} from './pulseState';

export interface PulseCanvasMessageEvent {
  eventId?: string;
  conversationId: string;
  timestamp: number;
  isClientMessage?: boolean;
  senderType?: string;
}

export interface PulseCanvasNewNodeEvent {
  eventId?: string;
  conversationId: string;
  timestamp: number;
}

interface PulseConstellationCanvasProps {
  conversations: AgentConversationItem[];
  unreadCounts?: Record<string, number>;
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onOpenConversation?: (id: string) => void;
  pulseEvent?: PulseCanvasMessageEvent | null;
  newNodeEvent?: PulseCanvasNewNodeEvent | null;
  searchTerm?: string;
  onSearchTermChange?: (value: string) => void;
  statusFilter?: string;
  onStatusFilterChange?: (value: string) => void;
  isDrawerOpen?: boolean;
  onResetFilters?: () => void;
}

interface NodeVisualObjects {
  id: string;
  zone: ConstellationZone;
  group: THREE.Group;
  targetPos: THREE.Vector3;
  coreMesh: THREE.Mesh;
  coreMat: THREE.MeshLambertMaterial;
  rimMesh: THREE.Mesh;
  rimMat: THREE.MeshBasicMaterial;
  haloSprite: THREE.Sprite;
  haloMat: THREE.SpriteMaterial;
  shockwaveMesh: THREE.Mesh;
  shockwaveMat: THREE.MeshBasicMaterial;
  echoMesh: THREE.Mesh;
  echoMat: THREE.MeshBasicMaterial;
  selectionRing: THREE.Mesh;
  selectionRingMat: THREE.MeshBasicMaterial;
  targetScaleFactor: number;
  birthScale: number;
  exitProgress: number;
  isExiting: boolean;
  pulseBoost: number;
  activityBurst: number;
  lastActivityAtMs: number;
  neighborShimmer: number;
}

interface ConnectionVisualObjects {
  id: string;
  fromId: string;
  toId: string;
  kind: Constellation3DConnection['kind'];
  curve: THREE.QuadraticBezierCurve3;
  line: THREE.Line;
  lineMat: THREE.LineBasicMaterial;
  baseOpacity: number;
  waveHighlight: number;
  ambientParticles: Array<{
    sprite: THREE.Sprite;
    progress: number;
    speed: number;
  }>;
}

interface SignalWave {
  curve: THREE.QuadraticBezierCurve3;
  sprite: THREE.Sprite;
  spriteMat: THREE.SpriteMaterial;
  toId: string;
  connId: string;
  progress: number;
  speed: number;
  reverse: boolean;
}

interface ProjectedLabelItem {
  id: string;
  customerName: string;
  unreadCount: number;
  x: number;
  y: number;
  depthScale: number;
  isSelected: boolean;
  isSearchMatch: boolean;
}

interface HoveredNodeSnapshot {
  id: string;
  customerName: string;
  category: string;
  status: string;
  unreadCount: number;
  lastMessage: string;
  lastMessageAt?: string;
  ticketRef?: string;
}

/**
 * Refined administrative Zalisk palette:
 * - Matte porcelain / subtle status-tinted nodes instead of glossy arcade spheres
 * - Midnight Navy selection, Emerald strictly reserved for live unread/signal
 */
function getNodePalette(status: string, unreadCount: number, isSelected: boolean): {
  core: number;
  emissive: number;
  rim: number;
  halo: number;
} {
  if (isSelected) {
    return {
      core: 0x0d1b3d, // Midnight Navy
      emissive: 0x09132b,
      rim: 0x0d1b3d,
      halo: 0x0d1b3d,
    };
  }
  if (status === 'RESOLVED' || status === 'CLOSED') {
    return {
      core: 0xf4f7f5, // Soft sage-white porcelain
      emissive: 0x000000,
      rim: 0x15803d, // Forest Green
      halo: 0x15803d,
    };
  }
  if (unreadCount > 0) {
    return {
      core: 0xf0fdf4, // Crisp emerald-tinted white
      emissive: 0x064e3b,
      rim: 0x22c55e, // Live Emerald signal
      halo: 0x22c55e,
    };
  }
  if (status === 'OPEN' || status === 'WAITING_ASSIGNMENT') {
    return {
      core: 0xfffbeb, // Warm ivory
      emissive: 0x000000,
      rim: 0xd97706, // Amber
      halo: 0xd97706,
    };
  }
  if (status === 'WAITING_CUSTOMER') {
    return {
      core: 0xf8fafc, // Slate porcelain
      emissive: 0x000000,
      rim: 0x64748b, // Slate
      halo: 0x94a3b8,
    };
  }
  return {
    core: 0xffffff, // Pure architectural card white
    emissive: 0x000000,
    rim: 0x1e3a8a, // Deep Sapphire / Navy
    halo: 0x94a3b8,
  };
}

function getEdgeStyle(conn: Constellation3DConnection): {
  lineHex: number;
  particleHex: number;
  baseOpacity: number;
} {
  if (conn.kind === 'ticket') {
    return { lineHex: 0x0d1b3d, particleHex: 0x22c55e, baseOpacity: 0.34 };
  }
  if (conn.kind === 'customer') {
    return { lineHex: 0xd97706, particleHex: 0xd97706, baseOpacity: 0.32 };
  }
  if (conn.zone === 'priority') {
    return { lineHex: 0x15803d, particleHex: 0x22c55e, baseOpacity: 0.24 };
  }
  if (conn.zone === 'active') {
    return { lineHex: 0x475569, particleHex: 0x0d1b3d, baseOpacity: 0.18 };
  }
  return { lineHex: 0x94a3b8, particleHex: 0x64748b, baseOpacity: 0.14 };
}

function getTargetScaleFactor(status: string, unreadCount: number, isSelected: boolean): number {
  if (isSelected) return 1.2;
  if (status === 'RESOLVED' || status === 'CLOSED') return 0.72;
  if (unreadCount > 0) return 1.08;
  return 0.92;
}

function createLightHaloTexture(): THREE.CanvasTexture {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grad.addColorStop(0, 'rgba(255, 255, 255, 0.88)');
  grad.addColorStop(0.32, 'rgba(255, 255, 255, 0.42)');
  grad.addColorStop(0.68, 'rgba(255, 255, 255, 0.10)');
  grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

function createCrispDotTexture(): THREE.CanvasTexture {
  const size = 64;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
  grad.addColorStop(0.55, 'rgba(255, 255, 255, 0.9)');
  grad.addColorStop(0.82, 'rgba(255, 255, 255, 0.25)');
  grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

function createCurvedEdge(
  p1: THREE.Vector3,
  p2: THREE.Vector3,
  seedIdx: number
): THREE.QuadraticBezierCurve3 {
  const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
  const dir = new THREE.Vector3().subVectors(p2, p1);
  const dist = dir.length();
  const up = new THREE.Vector3(0, 1, 0);
  const side = new THREE.Vector3().crossVectors(dir, up);
  if (side.lengthSq() < 0.001) side.set(1, 0, 0);
  side.normalize();

  const arch = Math.max(0.75, dist * 0.16);
  const sway = (seedIdx % 2 === 0 ? 1 : -1) * dist * 0.07;
  const control = mid
    .clone()
    .add(new THREE.Vector3(0, arch * 0.65, 0))
    .add(side.multiplyScalar(sway));

  return new THREE.QuadraticBezierCurve3(p1, control, p2);
}

export const PulseConstellationCanvas: React.FC<PulseConstellationCanvasProps> = ({
  conversations,
  unreadCounts = {},
  activeConversationId,
  onSelectConversation,
  onOpenConversation,
  pulseEvent,
  newNodeEvent,
  searchTerm = '',
  onSearchTermChange,
  statusFilter = 'ALL',
  onStatusFilterChange,
  isDrawerOpen = false,
  onResetFilters,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);

  const nodesGroupRef = useRef<THREE.Group | null>(null);
  const edgesGroupRef = useRef<THREE.Group | null>(null);
  const wavesGroupRef = useRef<THREE.Group | null>(null);
  const haloTexRef = useRef<THREE.CanvasTexture | null>(null);
  const dotTexRef = useRef<THREE.CanvasTexture | null>(null);

  const nodeVisualsRef = useRef<Map<string, NodeVisualObjects>>(new Map());
  const connVisualsRef = useRef<Map<string, ConnectionVisualObjects>>(new Map());
  const signalWavesRef = useRef<SignalWave[]>([]);
  const hitMeshesRef = useRef<THREE.Mesh[]>([]);
  const layoutMemoryRef = useRef<Previous3DLayoutMemory>({ nodes: new Map() });
  const convMapRef = useRef<Map<string, AgentConversationItem>>(new Map());
  const unreadRef = useRef<Record<string, number>>(unreadCounts);
  unreadRef.current = unreadCounts;

  const activeConvIdRef = useRef<string | null>(activeConversationId);
  activeConvIdRef.current = activeConversationId;
  const searchTermRef = useRef<string>(searchTerm);
  searchTermRef.current = searchTerm;
  const statusFilterRef = useRef<string>(statusFilter);
  statusFilterRef.current = statusFilter;
  const onSelectRef = useRef(onSelectConversation);
  onSelectRef.current = onSelectConversation;
  const onOpenRef = useRef(onOpenConversation);
  onOpenRef.current = onOpenConversation;

  const hoveredIdRef = useRef<string | null>(null);
  const prevActiveIdRef = useRef<string | null>(null);
  const hasInitialFitRef = useRef(false);

  // Deduplication + pending queues for SSE events arriving before conversation sync
  const handledEventIdsRef = useRef<Set<string>>(new Set());
  const pendingPulseRef = useRef<Map<string, PulseCanvasMessageEvent>>(new Map());
  const pendingBirthRef = useRef<Set<string>>(new Set());

  // Calm & predictable by default: no dizzying auto-rotation unless explicitly enabled
  const [autoRotate, setAutoRotate] = useState(false);
  const autoRotateRef = useRef(false);
  autoRotateRef.current = autoRotate;

  const [soundEnabled, setSoundEnabled] = useState(pulseAudio.isEnabled());
  const [hoveredSnapshot, setHoveredSnapshot] = useState<HoveredNodeSnapshot | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [projectedLabels, setProjectedLabels] = useState<ProjectedLabelItem[]>([]);
  const [webglError, setWebglError] = useState(false);

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    pulseAudio.setEnabled(next);
  };

  const glideCameraTo = useCallback(
    (targetPos: THREE.Vector3, cameraPos: THREE.Vector3, duration = 0.8) => {
      const camera = cameraRef.current;
      const controls = controlsRef.current;
      if (!camera || !controls) return;

      gsap.killTweensOf(camera.position);
      gsap.killTweensOf(controls.target);

      gsap.to(controls.target, {
        x: targetPos.x,
        y: targetPos.y,
        z: targetPos.z,
        duration,
        ease: 'power2.out',
      });
      gsap.to(camera.position, {
        x: cameraPos.x,
        y: cameraPos.y,
        z: cameraPos.z,
        duration,
        ease: 'power2.out',
      });
    },
    []
  );

  const fitCameraToAllNodes = useCallback(
    (duration = 0.8) => {
      const container = containerRef.current;
      const aspect =
        container && container.clientHeight > 0
          ? container.clientWidth / container.clientHeight
          : 1.5;
      const pts = Array.from(nodeVisualsRef.current.values())
        .filter((n) => !n.isExiting)
        .map((n) => ({ x: n.targetPos.x, y: n.targetPos.y, z: n.targetPos.z }));
      const framing = computeBoundingCamera3D(pts, aspect, 42);
      glideCameraTo(
        new THREE.Vector3(framing.target.x, framing.target.y, framing.target.z),
        new THREE.Vector3(framing.cameraPos.x, framing.cameraPos.y, framing.cameraPos.z),
        duration
      );
    },
    [glideCameraTo]
  );

  const triggerNodeMessagePulse = useCallback((nv: NodeVisualObjects, isClientMessage = true) => {
    const now = Date.now();
    const withinBurstWindow = now - nv.lastActivityAtMs < 6500;
    nv.activityBurst = isClientMessage
      ? withinBurstWindow
        ? Math.min(4, nv.activityBurst + 1)
        : 1
      : Math.max(0.4, nv.activityBurst);
    nv.lastActivityAtMs = now;
    nv.pulseBoost = isClientMessage ? 1.1 : 0.4;

    const ringHex = isClientMessage ? 0x22c55e : 0x0d1b3d;
    nv.shockwaveMat.color.setHex(ringHex);
    nv.shockwaveMesh.visible = true;
    nv.shockwaveMesh.scale.setScalar(1);
    nv.shockwaveMat.opacity = isClientMessage ? 0.9 : 0.45;

    const maxScale = 3.0 + Math.min(nv.activityBurst - 1, 3) * 0.55;
    gsap.killTweensOf(nv.shockwaveMesh.scale);
    gsap.killTweensOf(nv.shockwaveMat);
    gsap.to(nv.shockwaveMesh.scale, {
      x: maxScale,
      y: maxScale,
      z: maxScale,
      duration: isClientMessage ? 1.3 : 0.8,
      ease: 'power2.out',
    });
    gsap.to(nv.shockwaveMat, {
      opacity: 0,
      duration: isClientMessage ? 1.3 : 0.8,
      ease: 'power2.out',
      onComplete: () => {
        nv.shockwaveMesh.visible = false;
      },
    });

    if (isClientMessage && nv.activityBurst >= 2) {
      nv.echoMat.color.setHex(0x22c55e);
      nv.echoMesh.visible = true;
      nv.echoMesh.scale.setScalar(1);
      nv.echoMat.opacity = 0.6;
      gsap.killTweensOf(nv.echoMesh.scale);
      gsap.killTweensOf(nv.echoMat);
      gsap.to(nv.echoMesh.scale, {
        x: maxScale * 1.28,
        y: maxScale * 1.28,
        z: maxScale * 1.28,
        duration: 1.55,
        delay: 0.14,
        ease: 'power2.out',
      });
      gsap.to(nv.echoMat, {
        opacity: 0,
        duration: 1.55,
        delay: 0.14,
        ease: 'power2.out',
        onComplete: () => {
          nv.echoMesh.visible = false;
        },
      });
    }

    const wavesGroup = wavesGroupRef.current;
    const dotTex = dotTexRef.current;
    if (isClientMessage && wavesGroup && dotTex) {
      connVisualsRef.current.forEach((cv) => {
        const isFrom = cv.fromId === nv.id;
        const isTo = cv.toId === nv.id;
        if (!isFrom && !isTo) return;

        const spMat = new THREE.SpriteMaterial({
          map: dotTex,
          color: 0x22c55e,
          transparent: true,
          opacity: 0.92,
          depthWrite: false,
        });
        const sprite = new THREE.Sprite(spMat);
        sprite.scale.set(0.64, 0.64, 1);
        wavesGroup.add(sprite);

        signalWavesRef.current.push({
          curve: cv.curve,
          sprite,
          spriteMat: spMat,
          toId: isFrom ? cv.toId : cv.fromId,
          connId: cv.id,
          progress: 0,
          speed: 0.92,
          reverse: isTo,
        });
      });
    }
  }, []);

  const triggerNodeBirthAnimation = useCallback(
    (nv: NodeVisualObjects) => {
      nv.birthScale = 0.01;
      gsap.killTweensOf(nv, 'birthScale');
      gsap.to(nv, {
        birthScale: 1,
        duration: 0.75,
        ease: 'back.out(1.4)',
      });
      triggerNodeMessagePulse(nv, true);
    },
    [triggerNodeMessagePulse]
  );

  // Initialize Clean Architectural Three.js 3D Scene once
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 560;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      });
    } catch {
      setWebglError(true);
      return;
    }

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0xfafaf8, 0.0085); // Clean atmospheric depth matching Canvas Lin
    sceneRef.current = scene;

    // Soft diffuse matte lighting (no glossy/game specular glare)
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.55);
    scene.add(ambientLight);
    const topLight = new THREE.DirectionalLight(0xffffff, 0.75);
    topLight.position.set(12, 24, 18);
    scene.add(topLight);

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 220);
    camera.position.set(4, 11, 22);
    cameraRef.current = camera;

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.07;
    controls.enableZoom = true;
    controls.enablePan = true;
    controls.minDistance = 6;
    controls.maxDistance = 68;
    // Constrain to an ergonomic architectural 3/4 elevation (never flips upside down or under floor)
    controls.minPolarAngle = Math.PI * 0.14;
    controls.maxPolarAngle = Math.PI * 0.45;
    controls.autoRotate = false;
    controls.autoRotateSpeed = 0.25;
    controls.target.set(0, 0, 0);
    controlsRef.current = controls;

    const haloTex = createLightHaloTexture();
    const dotTex = createCrispDotTexture();
    haloTexRef.current = haloTex;
    dotTexRef.current = dotTex;

    const edgesGroup = new THREE.Group();
    scene.add(edgesGroup);
    edgesGroupRef.current = edgesGroup;

    const nodesGroup = new THREE.Group();
    scene.add(nodesGroup);
    nodesGroupRef.current = nodesGroup;

    const wavesGroup = new THREE.Group();
    scene.add(wavesGroup);
    wavesGroupRef.current = wavesGroup;

    // Raycasting: hover + single click (select/center) + double click (open drawer)
    const raycaster = new THREE.Raycaster();
    const pointerNdc = new THREE.Vector2();
    let pointerDownPos = { x: 0, y: 0 };

    const pickNode = (clientX: number, clientY: number): NodeVisualObjects | null => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointerNdc.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      pointerNdc.y = -((clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointerNdc, camera);
      const intersects = raycaster.intersectObjects(hitMeshesRef.current, false);
      if (intersects.length === 0) return null;
      const hitId = intersects[0].object.userData?.conversationId as string | undefined;
      if (!hitId) return null;
      const nv = nodeVisualsRef.current.get(hitId);
      return nv && !nv.isExiting ? nv : null;
    };

    const onPointerDown = (e: PointerEvent) => {
      pointerDownPos = { x: e.clientX, y: e.clientY };
    };

    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      const hit = pickNode(e.clientX, e.clientY);
      const nextId = hit ? hit.id : null;
      if (nextId !== hoveredIdRef.current) {
        hoveredIdRef.current = nextId;
        if (nextId) {
          const conv = convMapRef.current.get(nextId);
          if (conv) {
            const latestMsg = getLatestConversationMessage(conv);
            setHoveredSnapshot({
              id: conv.id,
              customerName: conv.customerName,
              category: conv.category || 'Général',
              status: conv.status,
              unreadCount: Math.max(0, unreadRef.current[conv.id] ?? 0),
              lastMessage: getConversationPreview(conv),
              lastMessageAt: conv.lastMessageAt || latestMsg?.createdAt,
              ticketRef: conv.ticket?.reference,
            });
          }
          renderer.domElement.style.cursor = 'pointer';
        } else {
          setHoveredSnapshot(null);
          renderer.domElement.style.cursor = 'grab';
        }
      }
      if (hit) {
        const rect = container.getBoundingClientRect();
        setTooltipPos({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });
      }
    };

    const onPointerUp = (e: PointerEvent) => {
      const moveDist = Math.hypot(e.clientX - pointerDownPos.x, e.clientY - pointerDownPos.y);
      if (moveDist > 6) return;
      const hit = pickNode(e.clientX, e.clientY);
      if (hit) {
        hoveredIdRef.current = null;
        setHoveredSnapshot(null);
        onSelectRef.current(hit.id);
      }
    };

    const onDoubleClick = (e: MouseEvent) => {
      const hit = pickNode(e.clientX, e.clientY);
      if (hit) {
        hoveredIdRef.current = null;
        setHoveredSnapshot(null);
        onSelectRef.current(hit.id);
        onOpenRef.current?.(hit.id);
      }
    };

    const onPointerLeave = () => {
      hoveredIdRef.current = null;
      setHoveredSnapshot(null);
      renderer.domElement.style.cursor = 'grab';
    };

    const domEl = renderer.domElement;
    domEl.addEventListener('pointerdown', onPointerDown);
    domEl.addEventListener('pointermove', onPointerMove);
    domEl.addEventListener('pointerup', onPointerUp);
    domEl.addEventListener('dblclick', onDoubleClick);
    domEl.addEventListener('pointerleave', onPointerLeave);

    const handleResize = () => {
      if (!container) return;
      const nw = container.clientWidth || 800;
      const nh = container.clientHeight || 560;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    };
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    const clock = new THREE.Clock();
    let frameId = 0;
    let labelTick = 0;

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const delta = Math.min(clock.getDelta(), 0.05);
      const elapsed = clock.getElapsedTime();
      const nowMs = Date.now();

      controls.autoRotate = autoRotateRef.current && !hoveredIdRef.current;
      controls.update();

      const curSelected = activeConvIdRef.current;
      const curHovered = hoveredIdRef.current;
      const curSearch = searchTermRef.current;
      const curFilter = statusFilterRef.current;
      const curUnreadMap = unreadRef.current;

      // Update nodes smoothly
      nodeVisualsRef.current.forEach((nv) => {
        const conv = convMapRef.current.get(nv.id);
        const unreadCount = conv ? Math.max(0, curUnreadMap[conv.id] ?? 0) : 0;
        const isSelected = curSelected === nv.id;
        const isHovered = curHovered === nv.id;
        const isMatch = conv
          ? matchesConversationSearch(conv, curSearch) &&
            matchesConversationFilter(conv, unreadCount, curFilter)
          : true;
        const isUnread =
          unreadCount > 0 && conv?.status !== 'RESOLVED' && conv?.status !== 'CLOSED';
        const isResolved = conv?.status === 'RESOLVED' || conv?.status === 'CLOSED';

        nv.group.position.lerp(nv.targetPos, 0.08);

        nv.pulseBoost = Math.max(0, nv.pulseBoost - delta * 0.72);
        nv.neighborShimmer = Math.max(0, nv.neighborShimmer - delta * 1.1);
        if (nv.activityBurst > 0 && nowMs - nv.lastActivityAtMs > 1500) {
          nv.activityBurst = Math.max(0, nv.activityBurst - delta * 0.45);
        }

        const exitMul = nv.isExiting ? Math.max(0, nv.exitProgress) : 1;
        const scaleTotal =
          nv.birthScale *
          (0.6 + 0.4 * exitMul) *
          nv.targetScaleFactor *
          (isHovered ? 1.09 : 1 + nv.pulseBoost * 0.14 + nv.neighborShimmer * 0.08);

        nv.coreMesh.scale.setScalar(
          THREE.MathUtils.lerp(nv.coreMesh.scale.x, scaleTotal, 0.16)
        );
        nv.rimMesh.scale.copy(nv.coreMesh.scale);
        nv.rimMesh.quaternion.copy(camera.quaternion);

        const dimAlpha = (isMatch ? 1 : 0.18) * exitMul;
        const calmAlpha = isResolved && !isSelected && !isHovered ? 0.72 : 1;
        nv.coreMat.opacity = Math.max(0, Math.min(1, dimAlpha * calmAlpha));
        nv.rimMat.opacity = Math.max(0, Math.min(1, dimAlpha * calmAlpha));

        // Restrained breathing aura only for unread / selected / active wave
        const breath = isUnread ? Math.sin(elapsed * 2.2 + nv.group.position.x * 0.35) * 0.25 : 0;
        const haloSize =
          (isSelected ? 2.85 : isUnread ? 2.65 + breath : isResolved ? 1.35 : 1.75) +
          nv.pulseBoost * 1.65 +
          nv.neighborShimmer * 0.8;
        nv.haloSprite.scale.set(haloSize * nv.birthScale, haloSize * nv.birthScale, 1);

        const haloBaseOpacity = isSelected
          ? 0.24
          : isUnread
          ? 0.36 + breath * 0.2
          : isResolved
          ? 0.08
          : 0.14;
        nv.haloMat.opacity =
          Math.min(0.75, haloBaseOpacity + nv.pulseBoost * 0.35 + nv.neighborShimmer * 0.18) *
          (isMatch ? 1 : 0.1) *
          exitMul;

        // Calm static double-ring for selected conversation (no spinning target!)
        if (isSelected && !nv.isExiting) {
          nv.selectionRing.visible = true;
          nv.selectionRing.quaternion.copy(camera.quaternion);
          nv.selectionRingMat.opacity = 0.42 * exitMul;
        } else {
          nv.selectionRing.visible = false;
        }

        if (nv.shockwaveMesh.visible) nv.shockwaveMesh.quaternion.copy(camera.quaternion);
        if (nv.echoMesh.visible) nv.echoMesh.quaternion.copy(camera.quaternion);
      });

      // Animate clean architectural connections & subtle circulating particles
      connVisualsRef.current.forEach((cv) => {
        cv.waveHighlight = Math.max(0, cv.waveHighlight - delta * 1.05);
        const isEdgeHighlighted =
          curSelected === cv.fromId ||
          curSelected === cv.toId ||
          curHovered === cv.fromId ||
          curHovered === cv.toId;

        const targetOp = Math.min(
          0.78,
          cv.baseOpacity + (isEdgeHighlighted ? 0.34 : 0) + cv.waveHighlight * 0.55
        );
        cv.lineMat.opacity = THREE.MathUtils.lerp(cv.lineMat.opacity, targetOp, 0.14);

        cv.ambientParticles.forEach((ap) => {
          ap.progress = (ap.progress + delta * ap.speed) % 1;
          const pt = cv.curve.getPointAt(ap.progress);
          ap.sprite.position.copy(pt);
          const dotSize = isEdgeHighlighted ? 0.32 : 0.22;
          ap.sprite.scale.set(dotSize, dotSize, 1);
        });
      });

      // Animate live incoming signal beads
      for (let i = signalWavesRef.current.length - 1; i >= 0; i--) {
        const wave = signalWavesRef.current[i];
        wave.progress += delta * wave.speed;
        const cv = connVisualsRef.current.get(wave.connId);
        if (cv) {
          cv.waveHighlight = Math.max(cv.waveHighlight, 0.85);
        }

        if (wave.progress >= 1) {
          wavesGroup.remove(wave.sprite);
          wave.spriteMat.dispose();
          const targetNv = nodeVisualsRef.current.get(wave.toId);
          if (targetNv) {
            targetNv.neighborShimmer = 0.75;
          }
          signalWavesRef.current.splice(i, 1);
          continue;
        }

        const t = wave.reverse ? 1 - wave.progress : wave.progress;
        const pt = wave.curve.getPointAt(t);
        wave.sprite.position.copy(pt);
        const fade = Math.sin(wave.progress * Math.PI);
        wave.spriteMat.opacity = 0.92 * fade;
        const sz = 0.54 + fade * 0.32;
        wave.sprite.scale.set(sz, sz, 1);
      }

      renderer.render(scene, camera);

      // Project crisp non-overlapping labels (selected, unread, search matches, + closest foreground stars)
      labelTick++;
      if (labelTick % 2 === 0 && container) {
        const cw = container.clientWidth || 800;
        const ch = container.clientHeight || 560;
        const halfW = cw / 2;
        const halfH = ch / 2;
        const hasSearch = Boolean(curSearch.trim());

        const candidates: Array<
          ProjectedLabelItem & { priorityScore: number; camDist: number }
        > = [];

        nodeVisualsRef.current.forEach((nv) => {
          if (nv.isExiting) return;
          const conv = convMapRef.current.get(nv.id);
          if (!conv) return;
          const unreadCount = Math.max(0, curUnreadMap[conv.id] ?? 0);
          const isSelected = curSelected === nv.id;
          const isSearchMatch =
            hasSearch &&
            matchesConversationSearch(conv, curSearch) &&
            matchesConversationFilter(conv, unreadCount, curFilter);
          const isUnread =
            unreadCount > 0 && conv.status !== 'RESOLVED' && conv.status !== 'CLOSED';
          const isMatch =
            matchesConversationSearch(conv, curSearch) &&
            matchesConversationFilter(conv, unreadCount, curFilter);

          if (!isMatch && !isSelected) return;

          const worldPos = nv.group.position.clone();
          const camDist = camera.position.distanceTo(worldPos);
          const projected = worldPos.project(camera);
          if (projected.z > 1) return;

          const sx = projected.x * halfW + halfW;
          const sy = -projected.y * halfH + halfH;
          if (sx < 40 || sx > cw - 40 || sy < 40 || sy > ch - 40) return;

          const priorityScore = isSelected
            ? 4000
            : isUnread
            ? 3000 - camDist
            : isSearchMatch
            ? 2500 - camDist
            : conv.status !== 'RESOLVED' && conv.status !== 'CLOSED'
            ? 1500 - camDist
            : 500 - camDist;

          candidates.push({
            id: conv.id,
            customerName: conv.customerName,
            unreadCount,
            x: sx,
            y: sy,
            depthScale: Math.max(0.84, Math.min(1, 28 / Math.max(10, camDist))),
            isSelected,
            isSearchMatch,
            priorityScore,
            camDist,
          });
        });

        candidates.sort((a, b) => b.priorityScore - a.priorityScore);

        const accepted: ProjectedLabelItem[] = [];
        for (const cand of candidates) {
          if (accepted.length >= 12 && !cand.isSelected && cand.unreadCount === 0) continue;
          const overlaps = accepted.some(
            (existing) =>
              Math.abs(existing.x - cand.x) < 118 && Math.abs(existing.y - cand.y) < 28
          );
          if (!overlaps || cand.isSelected) {
            accepted.push({
              id: cand.id,
              customerName: cand.customerName,
              unreadCount: cand.unreadCount,
              x: cand.x,
              y: cand.y,
              depthScale: cand.depthScale,
              isSelected: cand.isSelected,
              isSearchMatch: cand.isSearchMatch,
            });
          }
        }

        setProjectedLabels(accepted);
      }
    };

    animate();

    return () => {
      cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      controls.dispose();
      domEl.removeEventListener('pointerdown', onPointerDown);
      domEl.removeEventListener('pointermove', onPointerMove);
      domEl.removeEventListener('pointerup', onPointerUp);
      domEl.removeEventListener('dblclick', onDoubleClick);
      domEl.removeEventListener('pointerleave', onPointerLeave);
      haloTex.dispose();
      dotTex.dispose();
      renderer.dispose();
      if (container.contains(domEl)) {
        container.removeChild(domEl);
      }
    };
  }, []);

  // Sync conversations, 3D status layout, and restrained connections
  useEffect(() => {
    const nodesGroup = nodesGroupRef.current;
    const edgesGroup = edgesGroupRef.current;
    const haloTex = haloTexRef.current;
    const dotTex = dotTexRef.current;
    if (!nodesGroup || !edgesGroup || !haloTex || !dotTex) return;

    const dedupMap = new Map<string, AgentConversationItem>();
    conversations.forEach((c) => {
      if (c && c.id) dedupMap.set(c.id, c);
    });
    convMapRef.current = dedupMap;
    const uniqueConvs = Array.from(dedupMap.values());

    const { positions, connections } = computeConstellation3DLayout(
      uniqueConvs,
      unreadCounts,
      layoutMemoryRef.current
    );
    layoutMemoryRef.current = { nodes: new Map(positions) };

    const hitMeshes: THREE.Mesh[] = [];

    uniqueConvs.forEach((conv) => {
      const pos = positions.get(conv.id);
      if (!pos) return;
      const existing = nodeVisualsRef.current.get(conv.id);
      const unreadCount = Math.max(0, unreadCounts[conv.id] ?? 0);
      const isSelected = activeConversationId === conv.id;
      const palette = getNodePalette(conv.status, unreadCount, isSelected);
      const targetScaleFactor = getTargetScaleFactor(conv.status, unreadCount, isSelected);

      if (existing) {
        existing.zone = pos.zone;
        existing.targetPos.set(pos.x, pos.y, pos.z);
        existing.targetScaleFactor = targetScaleFactor;
        existing.coreMat.color.setHex(palette.core);
        existing.coreMat.emissive.setHex(palette.emissive);
        existing.rimMat.color.setHex(palette.rim);
        existing.haloMat.color.setHex(palette.halo);
        existing.isExiting = false;
        existing.exitProgress = 1;

        if (pendingPulseRef.current.has(conv.id)) {
          const evt = pendingPulseRef.current.get(conv.id)!;
          pendingPulseRef.current.delete(conv.id);
          triggerNodeMessagePulse(existing, evt.isClientMessage !== false);
        }

        hitMeshes.push(existing.coreMesh);
      } else {
        const isLiveBirth = pendingBirthRef.current.has(conv.id);
        if (isLiveBirth) pendingBirthRef.current.delete(conv.id);

        const group = new THREE.Group();
        group.position.set(pos.x, pos.y, pos.z);

        const baseRadius = 0.62;
        const coreGeo = new THREE.SphereGeometry(baseRadius, 28, 28);
        const coreMat = new THREE.MeshLambertMaterial({
          color: palette.core,
          emissive: palette.emissive,
          emissiveIntensity: 0.18,
          transparent: true,
          opacity: 1,
        });
        const coreMesh = new THREE.Mesh(coreGeo, coreMat);
        coreMesh.userData = { conversationId: conv.id };
        group.add(coreMesh);
        hitMeshes.push(coreMesh);

        // Crisp architectural status rim border
        const rimGeo = new THREE.RingGeometry(baseRadius * 0.94, baseRadius * 1.18, 40);
        const rimMat = new THREE.MeshBasicMaterial({
          color: palette.rim,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 1,
        });
        const rimMesh = new THREE.Mesh(rimGeo, rimMat);
        group.add(rimMesh);

        const haloMat = new THREE.SpriteMaterial({
          map: haloTex,
          color: palette.halo,
          transparent: true,
          opacity: 0.2,
          depthWrite: false,
        });
        const haloSprite = new THREE.Sprite(haloMat);
        haloSprite.scale.set(2.0, 2.0, 1);
        group.add(haloSprite);

        const shockGeo = new THREE.RingGeometry(baseRadius * 1.2, baseRadius * 1.4, 36);
        const shockMat = new THREE.MeshBasicMaterial({
          color: 0x22c55e,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0,
        });
        const shockMesh = new THREE.Mesh(shockGeo, shockMat);
        shockMesh.visible = false;
        group.add(shockMesh);

        const echoGeo = new THREE.RingGeometry(baseRadius * 1.2, baseRadius * 1.35, 36);
        const echoMat = new THREE.MeshBasicMaterial({
          color: 0x22c55e,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0,
        });
        const echoMesh = new THREE.Mesh(echoGeo, echoMat);
        echoMesh.visible = false;
        group.add(echoMesh);

        const selGeo = new THREE.RingGeometry(baseRadius * 1.44, baseRadius * 1.56, 40);
        const selMat = new THREE.MeshBasicMaterial({
          color: 0x0d1b3d,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.42,
        });
        const selRing = new THREE.Mesh(selGeo, selMat);
        selRing.visible = isSelected;
        group.add(selRing);

        nodesGroup.add(group);

        const visual: NodeVisualObjects = {
          id: conv.id,
          zone: pos.zone,
          group,
          targetPos: new THREE.Vector3(pos.x, pos.y, pos.z),
          coreMesh,
          coreMat,
          rimMesh,
          rimMat,
          haloSprite,
          haloMat,
          shockwaveMesh: shockMesh,
          shockwaveMat: shockMat,
          echoMesh,
          echoMat,
          selectionRing: selRing,
          selectionRingMat: selMat,
          targetScaleFactor,
          birthScale: 0.01,
          exitProgress: 1,
          isExiting: false,
          pulseBoost: 0,
          activityBurst: 0,
          lastActivityAtMs: 0,
          neighborShimmer: 0,
        };

        nodeVisualsRef.current.set(conv.id, visual);

        if (isLiveBirth) {
          triggerNodeBirthAnimation(visual);
        } else {
          gsap.to(visual, {
            birthScale: 1,
            duration: 0.5,
            delay: Math.min(nodeVisualsRef.current.size * 0.02, 0.3),
            ease: 'back.out(1.35)',
          });
        }

        if (pendingPulseRef.current.has(conv.id)) {
          const evt = pendingPulseRef.current.get(conv.id)!;
          pendingPulseRef.current.delete(conv.id);
          triggerNodeMessagePulse(visual, evt.isClientMessage !== false);
        }
      }
    });

    // Progressive exit transition
    nodeVisualsRef.current.forEach((oldVisual, id) => {
      if (!dedupMap.has(id) && !oldVisual.isExiting) {
        oldVisual.isExiting = true;
        gsap.to(oldVisual, {
          exitProgress: 0,
          duration: 0.45,
          ease: 'power2.in',
          onComplete: () => {
            nodesGroup.remove(oldVisual.group);
            oldVisual.coreMesh.geometry.dispose();
            oldVisual.coreMat.dispose();
            oldVisual.rimMesh.geometry.dispose();
            oldVisual.rimMat.dispose();
            oldVisual.haloMat.dispose();
            oldVisual.shockwaveMesh.geometry.dispose();
            oldVisual.shockwaveMat.dispose();
            oldVisual.echoMesh.geometry.dispose();
            oldVisual.echoMat.dispose();
            oldVisual.selectionRing.geometry.dispose();
            oldVisual.selectionRingMat.dispose();
            nodeVisualsRef.current.delete(id);
          },
        });
      }
    });

    hitMeshesRef.current = hitMeshes;

    // Rebuild clean curved connections
    while (edgesGroup.children.length > 0) {
      const obj = edgesGroup.children[0] as THREE.Object3D & {
        geometry?: THREE.BufferGeometry;
        material?: THREE.Material | THREE.Material[];
      };
      edgesGroup.remove(obj);
      obj.geometry?.dispose();
      if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose());
      else obj.material?.dispose();
    }
    connVisualsRef.current.clear();

    connections.forEach((conn, idx) => {
      const pA = positions.get(conn.fromId);
      const pB = positions.get(conn.toId);
      if (!pA || !pB) return;

      const v1 = new THREE.Vector3(pA.x, pA.y, pA.z);
      const v2 = new THREE.Vector3(pB.x, pB.y, pB.z);
      const curve = createCurvedEdge(v1, v2, idx);
      const curvePts = curve.getPoints(34);
      const geo = new THREE.BufferGeometry().setFromPoints(curvePts);

      const style = getEdgeStyle(conn);
      const lineMat = new THREE.LineBasicMaterial({
        color: style.lineHex,
        transparent: true,
        opacity: style.baseOpacity,
      });
      const line = new THREE.Line(geo, lineMat);
      edgesGroup.add(line);

      const ambientParticles: ConnectionVisualObjects['ambientParticles'] = [];
      const spMat = new THREE.SpriteMaterial({
        map: dotTex,
        color: style.particleHex,
        transparent: true,
        opacity: 0.72,
        depthWrite: false,
      });
      const sprite = new THREE.Sprite(spMat);
      sprite.scale.set(0.22, 0.22, 1);
      edgesGroup.add(sprite);
      ambientParticles.push({
        sprite,
        progress: (idx * 0.27) % 1,
        speed: conn.kind === 'zone' ? 0.1 + (idx % 3) * 0.025 : 0.16,
      });

      connVisualsRef.current.set(conn.id, {
        id: conn.id,
        fromId: conn.fromId,
        toId: conn.toId,
        kind: conn.kind,
        curve,
        line,
        lineMat,
        baseOpacity: style.baseOpacity,
        waveHighlight: 0,
        ambientParticles,
      });
    });

    // Dynamic bounding framing on initial conversation sync (frames 2 nodes OR 30 nodes cleanly)
    if (!hasInitialFitRef.current && uniqueConvs.length > 0) {
      hasInitialFitRef.current = true;
      fitCameraToAllNodes(0.85);
    }
  }, [
    conversations,
    unreadCounts,
    activeConversationId,
    fitCameraToAllNodes,
    triggerNodeBirthAnimation,
    triggerNodeMessagePulse,
  ]);

  // Handle incoming live SSE message impulse
  useEffect(() => {
    if (!pulseEvent || !pulseEvent.conversationId) return;
    if (pulseEvent.eventId) {
      if (handledEventIdsRef.current.has(pulseEvent.eventId)) return;
      handledEventIdsRef.current.add(pulseEvent.eventId);
      if (handledEventIdsRef.current.size > 250) {
        const first = handledEventIdsRef.current.values().next().value;
        if (first) handledEventIdsRef.current.delete(first);
      }
    }

    const nv = nodeVisualsRef.current.get(pulseEvent.conversationId);
    if (!nv) {
      pendingPulseRef.current.set(pulseEvent.conversationId, pulseEvent);
      return;
    }
    triggerNodeMessagePulse(nv, pulseEvent.isClientMessage !== false);
  }, [pulseEvent, triggerNodeMessagePulse]);

  // Handle new conversation birth animation
  useEffect(() => {
    if (!newNodeEvent || !newNodeEvent.conversationId) return;
    if (newNodeEvent.eventId) {
      if (handledEventIdsRef.current.has(newNodeEvent.eventId)) return;
      handledEventIdsRef.current.add(newNodeEvent.eventId);
    }

    const nv = nodeVisualsRef.current.get(newNodeEvent.conversationId);
    if (!nv) {
      pendingBirthRef.current.add(newNodeEvent.conversationId);
      return;
    }
    triggerNodeBirthAnimation(nv);
  }, [newNodeEvent, triggerNodeBirthAnimation]);

  // Smoothly focus camera on selected star
  useEffect(() => {
    if (!activeConversationId) {
      prevActiveIdRef.current = null;
      return;
    }

    const selectionChanged = prevActiveIdRef.current !== activeConversationId;
    prevActiveIdRef.current = activeConversationId;

    if (selectionChanged) {
      const nv = nodeVisualsRef.current.get(activeConversationId);
      const camera = cameraRef.current;
      const controls = controlsRef.current;
      if (nv && camera && controls) {
        const target = nv.targetPos.clone();
        const viewDir = camera.position.clone().sub(controls.target);
        const dist = Math.min(Math.max(viewDir.length(), 10.5), 18);
        if (viewDir.lengthSq() < 0.01) viewDir.set(3, 6, 12);
        viewDir.normalize().multiplyScalar(dist);
        glideCameraTo(target, target.clone().add(viewDir), 0.75);
      }
    }
  }, [activeConversationId, glideCameraTo]);

  // Search focus & counter
  const searchMatchesCount = useMemo(() => {
    const q = searchTerm.trim();
    if (!q && statusFilter === 'ALL') return conversations.length;
    return conversations.filter((conv) => {
      const unread = Math.max(0, unreadCounts[conv.id] ?? 0);
      return (
        matchesConversationSearch(conv, q) && matchesConversationFilter(conv, unread, statusFilter)
      );
    }).length;
  }, [conversations, unreadCounts, searchTerm, statusFilter]);

  useEffect(() => {
    const q = searchTerm.trim();
    if (q.length < 2) return;
    const match = conversations.find((conv) => {
      const unread = Math.max(0, unreadCounts[conv.id] ?? 0);
      return (
        matchesConversationSearch(conv, q) && matchesConversationFilter(conv, unread, statusFilter)
      );
    });
    if (!match) return;
    const nv = nodeVisualsRef.current.get(match.id);
    if (!nv) return;
    const target = nv.targetPos.clone();
    glideCameraTo(target, target.clone().add(new THREE.Vector3(2.5, 5.5, 13.5)), 0.8);
  }, [searchTerm, statusFilter, conversations, unreadCounts, glideCameraTo]);

  const handleZoomStep = (factor: number) => {
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    if (!camera || !controls) return;
    const dir = camera.position.clone().sub(controls.target);
    const nextDist = Math.min(Math.max(dir.length() * factor, 6.5), 64);
    dir.normalize().multiplyScalar(nextDist);
    gsap.to(camera.position, {
      x: controls.target.x + dir.x,
      y: controls.target.y + dir.y,
      z: controls.target.z + dir.z,
      duration: 0.35,
      ease: 'power2.out',
    });
  };

  const handleFitView = () => {
    fitCameraToAllNodes(0.8);
  };

  const totalUnreadCount = useMemo(
    () =>
      conversations.reduce((sum, c) => {
        if (c.status === 'RESOLVED' || c.status === 'CLOSED') return sum;
        return sum + Math.max(0, unreadCounts[c.id] ?? 0);
      }, 0),
    [conversations, unreadCounts]
  );

  const selectedConversation = useMemo(
    () =>
      activeConversationId
        ? conversations.find((c) => c.id === activeConversationId) || null
        : null,
    [conversations, activeConversationId]
  );

  const containerW = containerRef.current?.clientWidth || 800;
  const clampedHoverX = Math.min(Math.max(tooltipPos.x, 145), Math.max(145, containerW - 145));
  const hoverAbove = tooltipPos.y > 175;
  const hoverTop = hoverAbove ? tooltipPos.y - 16 : tooltipPos.y + 22;

  if (webglError) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[#FAFAF8] p-6">
        <div className="max-w-sm p-5 rounded-xl bg-white border border-[#E5E4DF] text-center space-y-2 shadow-sm">
          <p className="text-sm font-bold text-[#0D1B3D]">Rendu 3D indisponible sur ce navigateur</p>
          <p className="text-xs text-slate-500">
            Activez l&apos;accélération matérielle WebGL ou utilisez l&apos;onglet Boîte de réception.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative w-full h-full overflow-hidden select-none"
      style={{
        background:
          'radial-gradient(circle at 50% 45%, #FFFFFF 0%, #FAFAF8 65%, #F2F0E8 100%)',
      }}
    >
      {/* Three.js Calm Architectural 3D Stage */}
      <div
        ref={containerRef}
        className="w-full h-full touch-none cursor-grab active:cursor-grabbing"
      />

      {/* Projected Non-Overlapping Administrative Name Pills */}
      <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
        {projectedLabels.map((lbl) => (
          <div
            key={lbl.id}
            style={{
              left: `${lbl.x}px`,
              top: `${lbl.y}px`,
              transform: `translate(-50%, 16px) scale(${lbl.isSelected ? 1 : lbl.depthScale})`,
            }}
            className="absolute transition-transform duration-75"
          >
            <div
              className={`px-2 py-0.5 rounded-md text-[10.5px] whitespace-nowrap border shadow-xs flex items-center gap-1.5 ${
                lbl.isSelected
                  ? 'bg-[#0D1B3D] text-white border-[#0D1B3D] font-semibold shadow-sm'
                  : lbl.isSearchMatch
                  ? 'bg-[#ECFDF5] text-[#0D1B3D] border-[#22C55E]/60 font-semibold'
                  : 'bg-white/95 text-[#0D1B3D] border-[#E5E4DF] font-medium'
              }`}
            >
              {lbl.unreadCount > 0 && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] shrink-0" />
              )}
              <span>
                {lbl.customerName.length > 16
                  ? `${lbl.customerName.slice(0, 15)}…`
                  : lbl.customerName}
              </span>
              {lbl.unreadCount > 0 && (
                <span className="px-1 rounded-full bg-[#22C55E] text-white text-[9px] font-bold tabular-nums leading-tight">
                  {lbl.unreadCount > 99 ? '99+' : lbl.unreadCount}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* HUD flottant Recherche & Filtres (haut gauche) */}
      <div className="absolute top-3 left-3 right-3 sm:right-auto z-20 flex flex-wrap items-center gap-2 pointer-events-none">
        {(onSearchTermChange || onStatusFilterChange) && (
          <div className="pointer-events-auto flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-white/95 backdrop-blur-sm border border-[#E5E4DF] shadow-sm max-w-full">
            {onSearchTermChange && (
              <div className="relative w-44 sm:w-56">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Rechercher client, #ticket…"
                  value={searchTerm}
                  onChange={(e) => onSearchTermChange(e.target.value)}
                  className="w-full h-7 pl-8 pr-2.5 bg-[#FAFAF8] border border-[#E5E4DF] rounded-lg text-xs text-[#0D1B3D] placeholder:text-slate-400 focus:outline-none focus:border-[#0D1B3D] focus:bg-white transition-colors"
                />
              </div>
            )}

            {onStatusFilterChange && (
              <div className="hidden lg:flex items-center gap-1">
                {[
                  { id: 'ALL', label: 'Toutes' },
                  { id: 'UNREAD', label: `Non lues (${totalUnreadCount})` },
                  { id: 'ACTIVE', label: 'En cours' },
                  { id: 'WAITING_CUSTOMER', label: 'Attente' },
                  { id: 'RESOLVED', label: 'Résolues' },
                ].map((filter) => (
                  <button
                    key={filter.id}
                    type="button"
                    onClick={() => onStatusFilterChange(filter.id)}
                    className={`px-2 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer whitespace-nowrap ${
                      statusFilter === filter.id
                        ? 'bg-[#0D1B3D] text-white font-semibold'
                        : 'text-slate-600 hover:text-[#0D1B3D] hover:bg-[#F4F3EF]'
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {(searchTerm.trim() || statusFilter !== 'ALL') && (
          <div className="pointer-events-auto flex items-center gap-2 px-2.5 py-1 rounded-lg bg-white/95 backdrop-blur-sm border border-[#E5E4DF] text-[11px] text-[#0D1B3D] shadow-sm">
            <span className="font-medium tabular-nums">
              {searchMatchesCount === 0
                ? 'Aucun résultat'
                : `${searchMatchesCount} dossier${searchMatchesCount > 1 ? 's' : ''}`}
            </span>
            {onResetFilters && (
              <button
                type="button"
                onClick={onResetFilters}
                className="font-semibold text-slate-500 hover:text-[#0D1B3D] underline cursor-pointer"
              >
                Réinitialiser
              </button>
            )}
          </div>
        )}
      </div>

      {/* Contrôles caméra sobres (haut droite) */}
      <div className="absolute top-14 sm:top-3 right-3 z-20 flex items-center gap-0.5 p-1 rounded-lg bg-white/95 backdrop-blur-sm border border-[#E5E4DF] text-[#0D1B3D] shadow-sm">
        <button
          type="button"
          onClick={() => handleZoomStep(0.78)}
          className="p-1.5 rounded-md text-slate-500 hover:text-[#0D1B3D] hover:bg-[#F4F3EF] transition-colors cursor-pointer"
          title="Zoom avant"
          aria-label="Zoom avant"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => handleZoomStep(1.26)}
          className="p-1.5 rounded-md text-slate-500 hover:text-[#0D1B3D] hover:bg-[#F4F3EF] transition-colors cursor-pointer"
          title="Zoom arrière"
          aria-label="Zoom arrière"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={handleFitView}
          className="px-2 py-1 rounded-md text-slate-600 hover:text-[#0D1B3D] hover:bg-[#F4F3EF] transition-colors cursor-pointer flex items-center gap-1 text-[11px] font-medium"
          title="Cadrer toutes les conversations"
          aria-label="Ajuster la vue"
        >
          <Maximize2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Vue globale</span>
        </button>
        <button
          type="button"
          onClick={() => setAutoRotate((v) => !v)}
          className={`p-1.5 rounded-md transition-colors cursor-pointer ${
            autoRotate
              ? 'text-[#0D1B3D] bg-[#F4F3EF] hover:bg-[#E5E4DF]/70'
              : 'text-slate-400 hover:text-[#0D1B3D] hover:bg-[#F4F3EF]'
          }`}
          title={autoRotate ? 'Arrêter la rotation' : 'Rotation lente'}
          aria-label="Basculer la rotation"
        >
          <RotateCw className="w-3.5 h-3.5" />
        </button>
        <div className="w-px h-4 bg-[#E5E4DF] mx-0.5" />
        <button
          type="button"
          onClick={toggleSound}
          className={`p-1.5 rounded-md transition-colors cursor-pointer ${
            soundEnabled
              ? 'text-[#15803D] bg-[#ECFDF5] hover:bg-[#DCFCE7]'
              : 'text-slate-400 hover:text-[#0D1B3D] hover:bg-[#F4F3EF]'
          }`}
          title={soundEnabled ? 'Alertes sonores activées' : 'Alertes sonores coupées'}
          aria-label="Activer ou couper le son"
        >
          {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Légende administrative sobre */}
      <div className="absolute bottom-3 left-3 z-20 hidden sm:flex items-center gap-3 px-3 py-1.5 rounded-lg bg-white/95 backdrop-blur-sm border border-[#E5E4DF] text-[11px] text-slate-600 shadow-sm pointer-events-none">
        <span className="inline-flex items-center gap-1.5 font-semibold text-[#0D1B3D]">
          <span className="w-2 h-2 rounded-full bg-[#22C55E]" />
          <span className="tabular-nums">{conversations.length}</span> conversations
          {totalUnreadCount > 0 && (
            <span className="ml-0.5 px-1.5 py-0.2 rounded-full bg-[#ECFDF5] text-[#15803D] border border-[#BBF7D0] text-[10px] font-bold tabular-nums">
              {totalUnreadCount} non lue{totalUnreadCount > 1 ? 's' : ''}
            </span>
          )}
        </span>
        <span className="w-px h-3 bg-[#E5E4DF]" />
        <span className="inline-flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full border-2 border-[#D97706] bg-white" />
          À traiter
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full border-2 border-[#1E3A8A] bg-white" />
          En cours
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full border-2 border-[#64748B] bg-white" />
          Attente
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full border-2 border-[#15803D] bg-white" />
          Résolue
        </span>
      </div>

      {/* Carte d'action rapide du nœud sélectionné */}
      {selectedConversation && !isDrawerOpen && onOpenConversation && (
        <div className="absolute bottom-3 right-3 left-3 sm:left-auto z-20 sm:max-w-sm p-3 rounded-xl bg-white/95 backdrop-blur-sm border border-[#E5E4DF] shadow-lg flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#0D1B3D] truncate">
                {selectedConversation.customerName}
              </span>
              {selectedConversation.lastMessageAt && (
                <span className="text-[10px] text-slate-400 tabular-nums shrink-0">
                  {formatClockTimeFr(selectedConversation.lastMessageAt)}
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-600 truncate mt-0.5">
              {getConversationPreview(selectedConversation) || 'Conversation sélectionnée'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onOpenConversation(selectedConversation.id)}
            className="h-8 px-3 rounded-lg bg-[#0D1B3D] hover:bg-[#152C61] text-white text-xs font-semibold flex items-center gap-1.5 shrink-0 cursor-pointer transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Ouvrir le fil</span>
          </button>
        </div>
      )}

      {/* État vide */}
      {conversations.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
          <div className="px-5 py-4 rounded-xl bg-white/95 border border-[#E5E4DF] text-center shadow-sm max-w-xs">
            <p className="text-xs font-bold text-[#0D1B3D]">Aucune conversation active</p>
            <p className="text-[11px] text-slate-500 mt-1">
              Les nouvelles demandes clients apparaîtront ici dès leur arrivée.
            </p>
          </div>
        </div>
      )}

      {/* Info-bulle au survol */}
      {hoveredSnapshot && (
        <div
          className="absolute z-30 pointer-events-none px-3 py-2.5 rounded-xl bg-white border border-[#E5E4DF] text-[#0D1B3D] shadow-lg w-64"
          style={{
            left: `${clampedHoverX}px`,
            top: `${hoverTop}px`,
            transform: hoverAbove ? 'translate(-50%, -100%)' : 'translate(-50%, 0%)',
          }}
        >
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-xs font-bold text-[#0D1B3D] truncate">
              {hoveredSnapshot.customerName}
            </span>
            <StatusPill status={hoveredSnapshot.status} size="sm" />
          </div>

          <div className="flex items-center justify-between gap-2 text-[11px] text-slate-500 font-medium mb-1.5">
            <span className="truncate">
              {hoveredSnapshot.category}
              {hoveredSnapshot.ticketRef && (
                <span className="ml-1.5 text-[#0D1B3D] font-mono font-semibold">
                  {hoveredSnapshot.ticketRef}
                </span>
              )}
            </span>
            {hoveredSnapshot.lastMessageAt && (
              <span className="text-[10px] text-slate-400 tabular-nums shrink-0">
                {formatClockTimeFr(hoveredSnapshot.lastMessageAt)}
              </span>
            )}
          </div>

          {hoveredSnapshot.lastMessage ? (
            <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed bg-[#FAFAF8] px-2.5 py-1.5 rounded-lg border border-[#E5E4DF]">
              {hoveredSnapshot.lastMessage}
            </p>
          ) : (
            <p className="text-[11px] text-slate-400 italic bg-[#FAFAF8] px-2.5 py-1.5 rounded-lg border border-[#E5E4DF]">
              Aucun aperçu de message disponible
            </p>
          )}

          <div className="text-[10px] font-semibold mt-1.5 flex items-center justify-between gap-2">
            <span className="text-slate-400 font-normal">
              {hoveredSnapshot.lastMessageAt
                ? `${formatRelativeTimeFr(hoveredSnapshot.lastMessageAt)} · Double-clic`
                : 'Double-clic pour ouvrir'}
            </span>
            <span className="text-[#0D1B3D] flex items-center gap-1">
              <span>
                {hoveredSnapshot.unreadCount > 0
                  ? `${hoveredSnapshot.unreadCount} non lu${hoveredSnapshot.unreadCount > 1 ? 's' : ''} · Sélectionner`
                  : 'Sélectionner'}
              </span>
              <ArrowUpRight className="w-3 h-3" />
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
