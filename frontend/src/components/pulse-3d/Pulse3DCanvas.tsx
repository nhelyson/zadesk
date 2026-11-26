'use client';

import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import gsap from 'gsap';
import {
  Pulse3DConversation,
  Pulse3DConnection,
  Pulse3DClusterCenter,
} from './types';
import { ArrowUpRight, Sparkles } from 'lucide-react';

export interface Pulse3DIncomingEvent {
  eventId: string;
  type: 'MESSAGE' | 'NEW_NODE';
  conversationId: string;
  timestamp: number;
}

interface Pulse3DCanvasProps {
  conversations: Pulse3DConversation[];
  connections: Pulse3DConnection[];
  clusters: Pulse3DClusterCenter[];
  selectedId: string | null;
  searchTerm: string;
  statusFilter: string;
  autoRotate: boolean;
  fitViewNonce: number;
  incomingEvent: Pulse3DIncomingEvent | null;
  onSelectConversation: (id: string) => void;
  onOpenDrawer: (id: string) => void;
}

interface NodeVisualObjects {
  id: string;
  group: THREE.Group;
  coreMesh: THREE.Mesh;
  coreMat: THREE.MeshBasicMaterial;
  haloSprite: THREE.Sprite;
  haloMat: THREE.SpriteMaterial;
  shockwaveMesh: THREE.Mesh;
  shockwaveMat: THREE.MeshBasicMaterial;
  selectionRing: THREE.Mesh;
  selectionRingMat: THREE.MeshBasicMaterial;
  targetRadius: number;
  baseHaloScale: number;
  birthScale: number;
  pulseBoost: number;
  neighborShimmer: number;
}

interface ConnectionVisualObjects {
  id: string;
  fromId: string;
  toId: string;
  kind: 'cluster' | 'ticket';
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
  fromId: string;
  toId: string;
  connId: string;
  progress: number;
  speed: number;
  reverse: boolean;
}

interface ProjectedOverlayItem {
  id: string;
  customerName: string;
  category: string;
  status: string;
  unreadCount: number;
  lastMessage: string;
  lastMessageAt: string;
  ticketRef?: string;
  x: number;
  y: number;
  depthNorm: number;
  isSelected: boolean;
  isSearchMatch: boolean;
}

const DEFAULT_CAMERA_POS = new THREE.Vector3(0, 10, 44);
const DEFAULT_TARGET_POS = new THREE.Vector3(0, 0, 0);

function getNodeStatusColor(status: string, unreadCount: number): number {
  if (status === 'RESOLVED') return 0x334155;
  if (unreadCount > 0 && status === 'OPEN') return 0x34d399;
  if (unreadCount > 0) return 0x10b981;
  if (status === 'OPEN') return 0xf59e0b;
  if (status === 'WAITING_CUSTOMER') return 0x64748b;
  return 0x60a5fa;
}

function getStatusLabelFr(status: string): string {
  if (status === 'OPEN') return 'À traiter';
  if (status === 'ACTIVE') return 'En cours';
  if (status === 'WAITING_CUSTOMER') return 'Attente client';
  return 'Résolue';
}

function getStatusBadgeStyle(status: string): string {
  if (status === 'OPEN') return 'bg-amber-500/15 text-amber-300 border-amber-400/30';
  if (status === 'ACTIVE') return 'bg-emerald-500/15 text-emerald-300 border-emerald-400/30';
  if (status === 'WAITING_CUSTOMER') return 'bg-slate-500/20 text-slate-300 border-slate-400/30';
  return 'bg-emerald-950/60 text-emerald-400/80 border-emerald-700/40';
}

function createRadialGlowTexture(): THREE.CanvasTexture {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
  grad.addColorStop(0.22, 'rgba(255, 255, 255, 0.72)');
  grad.addColorStop(0.5, 'rgba(255, 255, 255, 0.22)');
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
  if (side.lengthSq() < 0.001) {
    side.set(1, 0, 0);
  }
  side.normalize();

  const archHeight = Math.max(1.2, dist * 0.22);
  const sideSway = ((seedIdx % 2 === 0 ? 1 : -1) * dist) * 0.1;
  const control = mid
    .clone()
    .add(new THREE.Vector3(0, archHeight * 0.65, 0))
    .add(side.multiplyScalar(sideSway));

  return new THREE.QuadraticBezierCurve3(p1, control, p2);
}

export const Pulse3DCanvas: React.FC<Pulse3DCanvasProps> = ({
  conversations,
  connections,
  clusters,
  selectedId,
  searchTerm,
  statusFilter,
  autoRotate,
  fitViewNonce,
  incomingEvent,
  onSelectConversation,
  onOpenDrawer,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);

  const nodesGroupRef = useRef<THREE.Group | null>(null);
  const edgesGroupRef = useRef<THREE.Group | null>(null);
  const wavesGroupRef = useRef<THREE.Group | null>(null);
  const clusterRingsGroupRef = useRef<THREE.Group | null>(null);
  const glowTexRef = useRef<THREE.CanvasTexture | null>(null);

  const nodeVisualsRef = useRef<Map<string, NodeVisualObjects>>(new Map());
  const connVisualsRef = useRef<Map<string, ConnectionVisualObjects>>(new Map());
  const signalWavesRef = useRef<SignalWave[]>([]);
  const hitMeshesRef = useRef<THREE.Mesh[]>([]);
  const convMapRef = useRef<Map<string, Pulse3DConversation>>(new Map());

  const hoveredIdRef = useRef<string | null>(null);
  const selectedIdRef = useRef<string | null>(selectedId);
  selectedIdRef.current = selectedId;
  const autoRotateRef = useRef<boolean>(autoRotate);
  autoRotateRef.current = autoRotate;
  const searchTermRef = useRef<string>(searchTerm);
  searchTermRef.current = searchTerm;
  const statusFilterRef = useRef<string>(statusFilter);
  statusFilterRef.current = statusFilter;

  const onSelectRef = useRef(onSelectConversation);
  onSelectRef.current = onSelectConversation;
  const onOpenDrawerRef = useRef(onOpenDrawer);
  onOpenDrawerRef.current = onOpenDrawer;

  const userInteractingRef = useRef(false);
  const idleResumeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handledIncomingIdsRef = useRef<Set<string>>(new Set());

  const [hoveredConv, setHoveredConv] = useState<Pulse3DConversation | null>(null);
  const [hoverScreenPos, setHoverScreenPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [projectedLabels, setProjectedLabels] = useState<ProjectedOverlayItem[]>([]);

  const matchesConv = useCallback(
    (conv: Pulse3DConversation, q: string, filter: string): boolean => {
      if (filter === 'UNREAD' && conv.unreadCount <= 0) return false;
      if (filter === 'ACTIVE' && conv.status !== 'OPEN' && conv.status !== 'ACTIVE') return false;
      if (filter === 'RESOLVED' && conv.status !== 'RESOLVED') return false;
      const trimmed = q.trim().toLowerCase();
      if (!trimmed) return true;
      return (
        conv.customerName.toLowerCase().includes(trimmed) ||
        conv.category.toLowerCase().includes(trimmed) ||
        Boolean(conv.ticketRef && conv.ticketRef.toLowerCase().includes(trimmed)) ||
        conv.lastMessage.toLowerCase().includes(trimmed)
      );
    },
    []
  );

  // Smooth camera transition helper
  const glideCameraTo = useCallback(
    (targetPos: THREE.Vector3, cameraPos: THREE.Vector3, duration = 0.95) => {
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

  // Initialize Three.js WebGL scene once
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 900;
    const height = container.clientHeight || 600;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x060d1e, 0.0115);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(46, width / height, 0.1, 220);
    camera.position.copy(DEFAULT_CAMERA_POS);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x060d1e, 1);
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.065;
    controls.enableZoom = true;
    controls.enablePan = true;
    controls.minDistance = 9;
    controls.maxDistance = 82;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.34;
    controls.target.copy(DEFAULT_TARGET_POS);
    controlsRef.current = controls;

    const glowTexture = createRadialGlowTexture();
    glowTexRef.current = glowTexture;

    // 1. Ambient 3D Space Dust for true parallax depth
    const dustCount = 260;
    const dustPositions = new Float32Array(dustCount * 3);
    const dustColors = new Float32Array(dustCount * 3);
    const c1 = new THREE.Color(0x38bdf8);
    const c2 = new THREE.Color(0x10b981);
    const c3 = new THREE.Color(0x94a3b8);

    for (let i = 0; i < dustCount; i++) {
      dustPositions[i * 3] = (Math.random() - 0.5) * 84;
      dustPositions[i * 3 + 1] = (Math.random() - 0.5) * 56;
      dustPositions[i * 3 + 2] = (Math.random() - 0.5) * 84;
      const pick = i % 5 === 0 ? c2 : i % 3 === 0 ? c1 : c3;
      dustColors[i * 3] = pick.r;
      dustColors[i * 3 + 1] = pick.g;
      dustColors[i * 3 + 2] = pick.b;
    }
    const dustGeo = new THREE.BufferGeometry();
    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
    dustGeo.setAttribute('color', new THREE.BufferAttribute(dustColors, 3));
    const dustMat = new THREE.PointsMaterial({
      size: 0.32,
      map: glowTexture,
      vertexColors: true,
      transparent: true,
      opacity: 0.42,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const dustPoints = new THREE.Points(dustGeo, dustMat);
    scene.add(dustPoints);

    // 2. Subtle architectural spatial reference plane below the constellation (no globe/planet!)
    const gridHelper = new THREE.GridHelper(78, 26, 0x1e3a5f, 0x0f1f3d);
    gridHelper.position.y = -17.5;
    const gridMaterials = Array.isArray(gridHelper.material)
      ? gridHelper.material
      : [gridHelper.material];
    gridMaterials.forEach((m) => {
      m.transparent = true;
      m.opacity = 0.2;
    });
    scene.add(gridHelper);

    const clusterRingsGroup = new THREE.Group();
    scene.add(clusterRingsGroup);
    clusterRingsGroupRef.current = clusterRingsGroup;

    const edgesGroup = new THREE.Group();
    scene.add(edgesGroup);
    edgesGroupRef.current = edgesGroup;

    const nodesGroup = new THREE.Group();
    scene.add(nodesGroup);
    nodesGroupRef.current = nodesGroup;

    const wavesGroup = new THREE.Group();
    scene.add(wavesGroup);
    wavesGroupRef.current = wavesGroup;

    // Controls interaction listeners -> pause gentle auto-rotation cleanly while inspecting
    const onControlStart = () => {
      userInteractingRef.current = true;
      controls.autoRotate = false;
      if (idleResumeTimerRef.current) clearTimeout(idleResumeTimerRef.current);
    };
    const onControlEnd = () => {
      userInteractingRef.current = false;
      if (idleResumeTimerRef.current) clearTimeout(idleResumeTimerRef.current);
      idleResumeTimerRef.current = setTimeout(() => {
        if (autoRotateRef.current && !hoveredIdRef.current) {
          controls.autoRotate = true;
        }
      }, 5500);
    };
    controls.addEventListener('start', onControlStart);
    controls.addEventListener('end', onControlEnd);

    // Pointer raycasting (hover, click = select, double-click = open drawer)
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
      return nodeVisualsRef.current.get(hitId) || null;
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
        const conv = nextId ? convMapRef.current.get(nextId) || null : null;
        setHoveredConv(conv);
        renderer.domElement.style.cursor = nextId ? 'pointer' : 'grab';
        if (nextId) {
          controls.autoRotate = false;
        } else if (autoRotateRef.current && !userInteractingRef.current) {
          controls.autoRotate = true;
        }
      }
      if (hit) {
        const rect = container.getBoundingClientRect();
        setHoverScreenPos({
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
        onSelectRef.current(hit.id);
      }
    };

    const onDoubleClick = (e: MouseEvent) => {
      const hit = pickNode(e.clientX, e.clientY);
      if (hit) {
        onSelectRef.current(hit.id);
        onOpenDrawerRef.current(hit.id);
      }
    };

    const onPointerLeave = () => {
      hoveredIdRef.current = null;
      setHoveredConv(null);
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
      const nw = container.clientWidth || 900;
      const nh = container.clientHeight || 600;
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

      controls.autoRotate =
        autoRotateRef.current && !userInteractingRef.current && !hoveredIdRef.current;
      controls.update();

      // Subtle slow ambient drift of space dust
      dustPoints.rotation.y += delta * 0.012;

      const curSelected = selectedIdRef.current;
      const curHovered = hoveredIdRef.current;
      const curSearch = searchTermRef.current;
      const curFilter = statusFilterRef.current;

      // Animate nodes (scale, halos, shockwave billboards, selection ring)
      nodeVisualsRef.current.forEach((nv) => {
        const conv = convMapRef.current.get(nv.id);
        if (!conv) return;
        const isSelected = curSelected === nv.id;
        const isHovered = curHovered === nv.id;
        const isMatch = matchesConv(conv, curSearch, curFilter);
        const isUnread = conv.unreadCount > 0 && conv.status !== 'RESOLVED';

        nv.pulseBoost = Math.max(0, nv.pulseBoost - delta * 0.75);
        nv.neighborShimmer = Math.max(0, nv.neighborShimmer - delta * 1.15);

        const breath = isUnread ? Math.sin(elapsed * 2.6 + nv.group.position.x * 0.4) * 0.28 : 0;
        const targetScale =
          nv.birthScale *
          (isSelected ? 1.24 : isHovered ? 1.15 : 1 + nv.pulseBoost * 0.25 + nv.neighborShimmer * 0.14);

        const currS = nv.coreMesh.scale.x;
        const nextS = THREE.MathUtils.lerp(currS, targetScale, 0.16);
        nv.coreMesh.scale.setScalar(nextS);

        nv.coreMat.opacity = isMatch ? (conv.status === 'RESOLVED' ? 0.72 : 1) : 0.16;

        const targetHalo =
          nv.birthScale *
          (nv.baseHaloScale +
            breath +
            nv.pulseBoost * 2.4 +
            nv.neighborShimmer * 1.15 +
            (isSelected ? 1.6 : isHovered ? 1.0 : 0));
        nv.haloSprite.scale.set(targetHalo, targetHalo, 1);

        const baseHaloOpacity = isMatch
          ? isSelected
            ? 0.92
            : isUnread
            ? 0.62 + breath * 0.35
            : conv.status === 'RESOLVED'
            ? 0.22
            : 0.45
          : 0.06;
        nv.haloMat.opacity = Math.min(
          1,
          baseHaloOpacity + nv.pulseBoost * 0.42 + nv.neighborShimmer * 0.25
        );

        // Selection ring gently faces camera & rotates
        if (isSelected) {
          nv.selectionRing.visible = true;
          nv.selectionRing.quaternion.copy(camera.quaternion);
          nv.selectionRing.rotateZ(elapsed * 0.55);
          nv.selectionRingMat.opacity = 0.85;
        } else {
          nv.selectionRing.visible = false;
        }

        // Shockwave billboard faces camera
        if (nv.shockwaveMesh.visible) {
          nv.shockwaveMesh.quaternion.copy(camera.quaternion);
        }
      });

      // Animate curved edges & ambient particles
      connVisualsRef.current.forEach((cv) => {
        cv.waveHighlight = Math.max(0, cv.waveHighlight - delta * 1.1);
        const isEdgeHighlighted =
          curSelected === cv.fromId ||
          curSelected === cv.toId ||
          curHovered === cv.fromId ||
          curHovered === cv.toId;

        const targetOpacity = Math.min(
          0.95,
          cv.baseOpacity + (isEdgeHighlighted ? 0.38 : 0) + cv.waveHighlight * 0.6
        );
        cv.lineMat.opacity = THREE.MathUtils.lerp(cv.lineMat.opacity, targetOpacity, 0.14);

        cv.ambientParticles.forEach((ap) => {
          ap.progress = (ap.progress + delta * ap.speed) % 1;
          const pt = cv.curve.getPointAt(ap.progress);
          ap.sprite.position.copy(pt);
          const s = isEdgeHighlighted ? 0.55 : 0.36;
          ap.sprite.scale.set(s, s, 1);
        });
      });

      // Animate active signal wave pulses traveling outward along edges
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
            targetNv.neighborShimmer = 0.9;
          }
          signalWavesRef.current.splice(i, 1);
          continue;
        }

        const t = wave.reverse ? 1 - wave.progress : wave.progress;
        const pt = wave.curve.getPointAt(t);
        wave.sprite.position.copy(pt);
        const fade = Math.sin(wave.progress * Math.PI);
        wave.spriteMat.opacity = 0.95 * fade;
        const sz = 0.95 + fade * 0.55;
        wave.sprite.scale.set(sz, sz, 1);
      }

      renderer.render(scene, camera);

      // Update projected 2D labels throttled (~every 2 frames) for crisp HUD labels without React thrash
      labelTick++;
      if (labelTick % 2 === 0 && container) {
        const cw = container.clientWidth || 900;
        const ch = container.clientHeight || 600;
        const halfW = cw / 2;
        const halfH = ch / 2;
        const nextLabels: ProjectedOverlayItem[] = [];

        nodeVisualsRef.current.forEach((nv) => {
          const conv = convMapRef.current.get(nv.id);
          if (!conv) return;
          const isSelected = curSelected === nv.id;
          const isSearch =
            Boolean(curSearch.trim()) && matchesConv(conv, curSearch, curFilter);
          const isImportantUnread = conv.unreadCount > 0 && matchesConv(conv, curSearch, curFilter);
          if (!isSelected && !isSearch && !isImportantUnread) return;

          const worldPos = nv.group.position.clone();
          const camDist = camera.position.distanceTo(worldPos);
          const projected = worldPos.project(camera);
          if (projected.z > 1) return;

          const sx = projected.x * halfW + halfW;
          const sy = -projected.y * halfH + halfH;
          if (sx < -40 || sx > cw + 40 || sy < -40 || sy > ch + 40) return;

          nextLabels.push({
            id: conv.id,
            customerName: conv.customerName,
            category: conv.category,
            status: conv.status,
            unreadCount: conv.unreadCount,
            lastMessage: conv.lastMessage,
            lastMessageAt: conv.lastMessageAt,
            ticketRef: conv.ticketRef,
            x: sx,
            y: sy,
            depthNorm: Math.max(0.55, Math.min(1, 34 / Math.max(12, camDist))),
            isSelected,
            isSearchMatch: isSearch,
          });
        });

        setProjectedLabels(nextLabels);
      }
    };

    animate();

    return () => {
      cancelAnimationFrame(frameId);
      if (idleResumeTimerRef.current) clearTimeout(idleResumeTimerRef.current);
      resizeObserver.disconnect();
      controls.removeEventListener('start', onControlStart);
      controls.removeEventListener('end', onControlEnd);
      controls.dispose();
      domEl.removeEventListener('pointerdown', onPointerDown);
      domEl.removeEventListener('pointermove', onPointerMove);
      domEl.removeEventListener('pointerup', onPointerUp);
      domEl.removeEventListener('dblclick', onDoubleClick);
      domEl.removeEventListener('pointerleave', onPointerLeave);
      glowTexture.dispose();
      renderer.dispose();
      if (container.contains(domEl)) {
        container.removeChild(domEl);
      }
    };
  }, [matchesConv]);

  // Synchronize 3D nodes, halos, cluster rings, and luminous curved connections
  useEffect(() => {
    const nodesGroup = nodesGroupRef.current;
    const edgesGroup = edgesGroupRef.current;
    const clusterRingsGroup = clusterRingsGroupRef.current;
    const glowTex = glowTexRef.current;
    if (!nodesGroup || !edgesGroup || !clusterRingsGroup || !glowTex) return;

    const map = new Map<string, Pulse3DConversation>();
    conversations.forEach((c) => map.set(c.id, c));
    convMapRef.current = map;

    // 1. Subtle 3D cluster orbital halos
    while (clusterRingsGroup.children.length > 0) {
      const ch = clusterRingsGroup.children[0] as THREE.Mesh;
      clusterRingsGroup.remove(ch);
      ch.geometry?.dispose();
      if (Array.isArray(ch.material)) ch.material.forEach((m) => m.dispose());
      else ch.material?.dispose();
    }
    clusters.forEach((cl) => {
      const ringGeo = new THREE.RingGeometry(4.9, 5.02, 48);
      const ringMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(cl.color),
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.14,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.set(cl.x, cl.y - 0.6, cl.z);
      ring.rotation.x = Math.PI / 2 - 0.25;
      clusterRingsGroup.add(ring);
    });

    // 2. Sync 3D conversation nodes cleanly (preserve existing visuals!)
    const hitMeshes: THREE.Mesh[] = [];
    const seenIds = new Set<string>();

    conversations.forEach((conv) => {
      seenIds.add(conv.id);
      const existing = nodeVisualsRef.current.get(conv.id);
      const colorHex = getNodeStatusColor(conv.status, conv.unreadCount);
      const isSelected = selectedIdRef.current === conv.id;
      const baseRadius =
        conv.status === 'RESOLVED'
          ? 0.42
          : conv.unreadCount > 0
          ? 0.72
          : conv.status === 'OPEN'
          ? 0.68
          : 0.56;
      const baseHaloScale =
        conv.status === 'RESOLVED' ? 1.55 : conv.unreadCount > 0 ? 3.2 : 2.3;

      if (existing) {
        existing.targetRadius = baseRadius;
        existing.baseHaloScale = baseHaloScale;
        existing.coreMat.color.setHex(colorHex);
        existing.haloMat.color.setHex(colorHex);
        hitMeshes.push(existing.coreMesh);
      } else {
        const group = new THREE.Group();
        group.position.set(conv.x, conv.y, conv.z);

        const coreGeo = new THREE.SphereGeometry(baseRadius, 24, 24);
        const coreMat = new THREE.MeshBasicMaterial({
          color: colorHex,
          transparent: true,
          opacity: 1,
        });
        const coreMesh = new THREE.Mesh(coreGeo, coreMat);
        coreMesh.userData = { conversationId: conv.id };
        group.add(coreMesh);
        hitMeshes.push(coreMesh);

        const haloMat = new THREE.SpriteMaterial({
          map: glowTex,
          color: colorHex,
          transparent: true,
          opacity: 0.55,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
        });
        const haloSprite = new THREE.Sprite(haloMat);
        haloSprite.scale.set(baseHaloScale, baseHaloScale, 1);
        group.add(haloSprite);

        const shockGeo = new THREE.RingGeometry(baseRadius * 1.15, baseRadius * 1.38, 36);
        const shockMat = new THREE.MeshBasicMaterial({
          color: 0x34d399,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0,
        });
        const shockMesh = new THREE.Mesh(shockGeo, shockMat);
        shockMesh.visible = false;
        group.add(shockMesh);

        const selGeo = new THREE.RingGeometry(baseRadius * 1.55, baseRadius * 1.78, 36);
        const selMat = new THREE.MeshBasicMaterial({
          color: 0xf8fafc,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.85,
        });
        const selRing = new THREE.Mesh(selGeo, selMat);
        selRing.visible = isSelected;
        group.add(selRing);

        nodesGroup.add(group);

        const visual: NodeVisualObjects = {
          id: conv.id,
          group,
          coreMesh,
          coreMat,
          haloSprite,
          haloMat,
          shockwaveMesh: shockMesh,
          shockwaveMat: shockMat,
          selectionRing: selRing,
          selectionRingMat: selMat,
          targetRadius: baseRadius,
          baseHaloScale,
          birthScale: 0.05,
          pulseBoost: 0,
          neighborShimmer: 0,
        };

        gsap.to(visual, {
          birthScale: 1,
          duration: 0.75,
          ease: 'back.out(1.6)',
        });

        nodeVisualsRef.current.set(conv.id, visual);
      }
    });

    hitMeshesRef.current = hitMeshes;

    // 3. Rebuild luminous curved connections & travelling light beads cleanly with GPU disposal
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
      const fromConv = map.get(conn.fromId);
      const toConv = map.get(conn.toId);
      if (!fromConv || !toConv) return;

      const p1 = new THREE.Vector3(fromConv.x, fromConv.y, fromConv.z);
      const p2 = new THREE.Vector3(toConv.x, toConv.y, toConv.z);
      const curve = createCurvedEdge(p1, p2, idx);
      const pts = curve.getPoints(36);
      const geo = new THREE.BufferGeometry().setFromPoints(pts);

      const lineColor = conn.kind === 'ticket' ? 0x38bdf8 : 0x10b981;
      const baseOpacity = conn.kind === 'ticket' ? 0.36 : 0.24;
      const lineMat = new THREE.LineBasicMaterial({
        color: lineColor,
        transparent: true,
        opacity: baseOpacity,
      });
      const line = new THREE.Line(geo, lineMat);
      edgesGroup.add(line);

      // Ambient circulating light bead along the curve (1 bead per edge, staggered)
      const ambientParticles: ConnectionVisualObjects['ambientParticles'] = [];
      const beadCount = conn.kind === 'ticket' ? 2 : 1;
      for (let b = 0; b < beadCount; b++) {
        const spMat = new THREE.SpriteMaterial({
          map: glowTex,
          color: conn.kind === 'ticket' ? 0xe0f2fe : 0xa7f3d0,
          transparent: true,
          opacity: 0.85,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
        });
        const sprite = new THREE.Sprite(spMat);
        sprite.scale.set(0.36, 0.36, 1);
        edgesGroup.add(sprite);
        ambientParticles.push({
          sprite,
          progress: ((idx * 0.23 + b * 0.5) % 1),
          speed: 0.16 + (idx % 4) * 0.04,
        });
      }

      connVisualsRef.current.set(conn.id, {
        id: conn.id,
        fromId: conn.fromId,
        toId: conn.toId,
        kind: conn.kind,
        curve,
        line,
        lineMat,
        baseOpacity,
        waveHighlight: 0,
        ambientParticles,
      });
    });
  }, [conversations, connections, clusters]);

  // Trigger incoming message 3D impulse + luminous wave propagation across connected arcs
  useEffect(() => {
    if (!incomingEvent) return;
    if (handledIncomingIdsRef.current.has(incomingEvent.eventId)) return;
    handledIncomingIdsRef.current.add(incomingEvent.eventId);

    const nv = nodeVisualsRef.current.get(incomingEvent.conversationId);
    const wavesGroup = wavesGroupRef.current;
    const glowTex = glowTexRef.current;
    if (!nv) return;

    nv.pulseBoost = incomingEvent.type === 'NEW_NODE' ? 1.4 : 1.15;

    // 3D shockwave ring expansion
    nv.shockwaveMesh.visible = true;
    nv.shockwaveMesh.scale.setScalar(1);
    nv.shockwaveMat.opacity = 0.92;
    gsap.killTweensOf(nv.shockwaveMesh.scale);
    gsap.killTweensOf(nv.shockwaveMat);
    gsap.to(nv.shockwaveMesh.scale, {
      x: 3.8,
      y: 3.8,
      z: 3.8,
      duration: 1.25,
      ease: 'power2.out',
    });
    gsap.to(nv.shockwaveMat, {
      opacity: 0,
      duration: 1.25,
      ease: 'power2.out',
      onComplete: () => {
        nv.shockwaveMesh.visible = false;
      },
    });

    // Propagate glowing signal waves along connected curves
    if (wavesGroup && glowTex) {
      connVisualsRef.current.forEach((cv) => {
        const isFrom = cv.fromId === incomingEvent.conversationId;
        const isTo = cv.toId === incomingEvent.conversationId;
        if (!isFrom && !isTo) return;

        const spMat = new THREE.SpriteMaterial({
          map: glowTex,
          color: 0xffffff,
          transparent: true,
          opacity: 0.95,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
        });
        const sprite = new THREE.Sprite(spMat);
        sprite.scale.set(1.0, 1.0, 1);
        wavesGroup.add(sprite);

        signalWavesRef.current.push({
          curve: cv.curve,
          sprite,
          spriteMat: spMat,
          fromId: incomingEvent.conversationId,
          toId: isFrom ? cv.toId : cv.fromId,
          connId: cv.id,
          progress: 0,
          speed: 0.95,
          reverse: isTo,
        });
      });
    }
  }, [incomingEvent]);

  // Smoothly focus camera on selected node
  useEffect(() => {
    if (!selectedId) return;
    const conv = convMapRef.current.get(selectedId);
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    if (!conv || !camera || !controls) return;

    const target = new THREE.Vector3(conv.x, conv.y, conv.z);
    const viewDir = camera.position.clone().sub(controls.target);
    const clampedDist = Math.min(Math.max(viewDir.length(), 15), 28);
    if (viewDir.lengthSq() < 0.01) viewDir.set(0, 4, 20);
    viewDir.normalize().multiplyScalar(clampedDist);

    const nextCamPos = target.clone().add(viewDir);
    glideCameraTo(target, nextCamPos, 0.85);
  }, [selectedId, glideCameraTo]);

  // Reset / Fit Global View
  useEffect(() => {
    if (fitViewNonce === 0) return;
    glideCameraTo(DEFAULT_TARGET_POS, DEFAULT_CAMERA_POS, 0.95);
  }, [fitViewNonce, glideCameraTo]);

  // Center on search match smoothly when user types a query
  useEffect(() => {
    const q = searchTerm.trim();
    if (q.length < 2) return;
    const match = conversations.find((c) => matchesConv(c, q, statusFilter));
    if (!match) return;
    const camera = cameraRef.current;
    if (!camera) return;
    const target = new THREE.Vector3(match.x, match.y, match.z);
    const camPos = target.clone().add(new THREE.Vector3(0, 4.5, 22));
    glideCameraTo(target, camPos, 0.85);
  }, [searchTerm, statusFilter, conversations, matchesConv, glideCameraTo]);

  const containerW = containerRef.current?.clientWidth || 900;
  const clampedHoverX = Math.min(Math.max(hoverScreenPos.x, 145), Math.max(145, containerW - 145));
  const hoverAbove = hoverScreenPos.y > 175;
  const hoverTop = hoverAbove ? hoverScreenPos.y - 16 : hoverScreenPos.y + 22;

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#060D1E] select-none">
      {/* Three.js WebGL Mount */}
      <div ref={containerRef} className="w-full h-full touch-none" />

      {/* Projected Minimalist Labels for Selected / Unread / Search-matched 3D Nodes */}
      <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
        {projectedLabels.map((lbl) => (
          <div
            key={lbl.id}
            style={{
              left: `${lbl.x}px`,
              top: `${lbl.y}px`,
              transform: `translate(-50%, 16px) scale(${lbl.isSelected ? 1 : lbl.depthNorm})`,
              opacity: lbl.isSelected ? 1 : 0.88,
            }}
            className="absolute transition-transform duration-75"
          >
            <div
              className={`px-2 py-0.5 rounded-md text-[10px] font-semibold whitespace-nowrap border backdrop-blur-md flex items-center gap-1.5 shadow-md ${
                lbl.isSelected
                  ? 'bg-white text-[#0D1B3D] border-white'
                  : lbl.isSearchMatch
                  ? 'bg-emerald-500/20 text-emerald-100 border-emerald-400/50'
                  : 'bg-[#0B152E]/85 text-slate-200 border-slate-700/80'
              }`}
            >
              {lbl.unreadCount > 0 && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
              )}
              <span>{lbl.customerName}</span>
              {lbl.unreadCount > 0 && (
                <span className="px-1 rounded bg-emerald-500 text-white text-[9px] font-bold tabular-nums">
                  {lbl.unreadCount}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Tooltip au survol d'un nœud 3D */}
      {hoveredConv && (
        <div
          className="absolute z-30 pointer-events-none w-68 max-w-[272px] p-3 rounded-xl bg-[#0D1B3D]/95 backdrop-blur-md border border-slate-600/60 text-white shadow-2xl"
          style={{
            left: `${clampedHoverX}px`,
            top: `${hoverTop}px`,
            transform: hoverAbove ? 'translate(-50%, -100%)' : 'translate(-50%, 0%)',
          }}
        >
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-xs font-bold text-white truncate">
              {hoveredConv.customerName}
            </span>
            <span
              className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border shrink-0 ${getStatusBadgeStyle(
                hoveredConv.status
              )}`}
            >
              {getStatusLabelFr(hoveredConv.status)}
            </span>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-300 mb-2">
            <span className="truncate">
              {hoveredConv.category}
              {hoveredConv.ticketRef && (
                <span className="ml-1.5 font-mono text-sky-300 font-semibold">
                  {hoveredConv.ticketRef}
                </span>
              )}
            </span>
            <span className="text-[10px] text-slate-400 tabular-nums shrink-0">
              {hoveredConv.lastMessageAt}
            </span>
          </div>

          <p className="text-[11px] text-slate-200 line-clamp-2 leading-relaxed bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5">
            {hoveredConv.lastMessage}
          </p>

          <div className="mt-2 flex items-center justify-between text-[10px]">
            <span className="text-slate-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-400" />
              Double-clic pour ouvrir le fil
            </span>
            <span className="text-emerald-300 font-semibold flex items-center gap-0.5">
              Sélectionner <ArrowUpRight className="w-3 h-3" />
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
