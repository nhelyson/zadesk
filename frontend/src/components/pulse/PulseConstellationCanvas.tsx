'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import gsap from 'gsap';
import { AgentConversationItem } from '@/types/workspace';
import { ZoomIn, ZoomOut, Maximize2, RotateCcw, Volume2, VolumeX, Sparkles } from 'lucide-react';
import { pulseAudio } from '@/lib/pulseAudio';

interface PulseNode {
  id: string;
  customerName: string;
  category: string;
  status: string;
  unreadCount: number;
  lastMessage?: string;
  lastMessageAt?: string;
  ticketRef?: string;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  radius: number;
  pulseRadius: number;
  pulseAlpha: number;
  isPulsing: boolean;
  pulseProgress: number; // 0 to 1
  entranceScale: number; // 0 to 1
  hue: string; // emerald, cyan, amber, indigo
}

interface PulseConstellationCanvasProps {
  conversations: AgentConversationItem[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  pulseEvent?: { conversationId: string; timestamp: number } | null;
  newNodeEvent?: { conversationId: string; timestamp: number } | null;
  searchTerm?: string;
  statusFilter?: string;
}

export const PulseConstellationCanvas: React.FC<PulseConstellationCanvasProps> = ({
  conversations,
  activeConversationId,
  onSelectConversation,
  pulseEvent,
  newNodeEvent,
  searchTerm = '',
  statusFilter = 'ALL',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Nodes Map indexed by conversationId to guarantee position stability
  const nodesRef = useRef<Map<string, PulseNode>>(new Map());

  // Camera Pan and Zoom state
  const cameraRef = useRef({ x: 0, y: 0, zoom: 1, targetZoom: 1 });
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const mousePosRef = useRef({ x: -1000, y: -1000 });
  const hoveredNodeRef = useRef<PulseNode | null>(null);

  const [hoveredNode, setHoveredNode] = useState<PulseNode | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [soundEnabled, setSoundEnabled] = useState(pulseAudio.isEnabled());

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    pulseAudio.setEnabled(next);
  };

  // Determine category cluster anchors deterministically
  const getCategoryAnchor = useCallback((category: string, width: number, height: number) => {
    const categories = [
      'Assistance SAV',
      'Support Matériel',
      'Facturation & Litiges',
      'Support Mobile Money & Paiement',
      'Support Réseau & Fibre',
      'Général',
    ];
    let idx = categories.indexOf(category);
    if (idx === -1) {
      idx = Math.abs(category.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)) % categories.length;
    }
    const angle = (idx / categories.length) * Math.PI * 2 - Math.PI / 2;
    const spreadRadius = Math.min(width, height) * 0.28;
    return {
      cx: Math.cos(angle) * spreadRadius,
      cy: Math.sin(angle) * spreadRadius,
    };
  }, []);

  // Update or initialize node positions cleanly (Constraint 4: Stable positions)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 600;

    const currentNodes = nodesRef.current;
    const newNodes = new Map<string, PulseNode>();

    conversations.forEach((conv, index) => {
      const existing = currentNodes.get(conv.id);
      const category = conv.category || 'Général';
      const anchor = getCategoryAnchor(category, width, height);

      // Determine color theme based on status
      let hue = '#22C55E'; // Emerald (Active)
      if (conv.status === 'RESOLVED' || conv.status === 'CLOSED') {
        hue = '#6366F1'; // Indigo (Resolved)
      } else if (conv.status === 'WAITING_CUSTOMER') {
        hue = '#06B6D4'; // Cyan (Waiting customer)
      } else if ((conv.status as string) === 'WAITING_ASSIGNMENT' || conv.status === 'OPEN') {
        hue = '#F59E0B'; // Amber (Urgent/Unassigned/Open)
      }

      if (existing) {
        // Retain existing coordinates to strictly avoid displacing the constellation
        newNodes.set(conv.id, {
          ...existing,
          customerName: conv.customerName,
          category,
          status: conv.status,
          lastMessage: conv.lastMessage,
          lastMessageAt: conv.lastMessageAt,
          ticketRef: conv.ticket?.reference,
          hue,
        });
      } else {
        // Organic deterministic offset around category cluster anchor
        const offsetAngle = ((index * 137.5) * Math.PI) / 180; // Golden angle dispersion
        const offsetDistance = 45 + (index % 6) * 32;
        const targetX = anchor.cx + Math.cos(offsetAngle) * offsetDistance;
        const targetY = anchor.cy + Math.sin(offsetAngle) * offsetDistance;

        const newNode: PulseNode = {
          id: conv.id,
          customerName: conv.customerName,
          category,
          status: conv.status,
          unreadCount: 0,
          lastMessage: conv.lastMessage,
          lastMessageAt: conv.lastMessageAt,
          ticketRef: conv.ticket?.reference,
          x: targetX,
          y: targetY,
          targetX,
          targetY,
          radius: 18,
          pulseRadius: 0,
          pulseAlpha: 0,
          isPulsing: false,
          pulseProgress: 0,
          entranceScale: 0,
          hue,
        };

        // Entrance scale tween with GSAP
        gsap.to(newNode, {
          entranceScale: 1,
          duration: 0.8,
          ease: 'back.out(1.5)',
          delay: Math.min(index * 0.05, 1.2),
        });

        newNodes.set(conv.id, newNode);
      }
    });

    nodesRef.current = newNodes;
  }, [conversations, getCategoryAnchor]);

  // Handle incoming Pulse Message trigger (Constraint 4: Pulse on node without displacing constellation)
  useEffect(() => {
    if (!pulseEvent) return;
    const node = nodesRef.current.get(pulseEvent.conversationId);
    if (!node) return;

    node.unreadCount += 1;
    node.isPulsing = true;
    node.pulseProgress = 0;

    // Orchestrate pulse wave expansion with GSAP
    gsap.killTweensOf(node);
    gsap.fromTo(
      node,
      { pulseProgress: 0, pulseAlpha: 0.9, pulseRadius: node.radius },
      {
        pulseProgress: 1,
        pulseAlpha: 0,
        pulseRadius: node.radius * 3.8,
        duration: 1.8,
        ease: 'power2.out',
        onComplete: () => {
          node.isPulsing = false;
        },
      }
    );
  }, [pulseEvent]);

  // Handle New Node birth trigger
  useEffect(() => {
    if (!newNodeEvent) return;
    const node = nodesRef.current.get(newNodeEvent.conversationId);
    if (!node) return;

    node.entranceScale = 0;
    gsap.fromTo(
      node,
      { entranceScale: 0, pulseRadius: 10, pulseAlpha: 1 },
      {
        entranceScale: 1,
        pulseRadius: 80,
        pulseAlpha: 0,
        duration: 1.2,
        ease: 'elastic.out(1, 0.4)',
      }
    );
  }, [newNodeEvent]);

  // Main Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 800);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 600);

    const handleResize = () => {
      if (!canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };
    window.addEventListener('resize', handleResize);

    // Generate static stardust stars background
    const starsCount = 120;
    const stars: Array<{ x: number; y: number; size: number; alpha: number; speed: number }> = [];
    for (let i = 0; i < starsCount; i++) {
      stars.push({
        x: (Math.random() - 0.5) * 2000,
        y: (Math.random() - 0.5) * 2000,
        size: Math.random() * 1.5 + 0.5,
        alpha: Math.random() * 0.7 + 0.2,
        speed: Math.random() * 0.02 + 0.005,
      });
    }

    let time = 0;

    const render = () => {
      time += 0.015;
      const camera = cameraRef.current;

      // Smooth zoom interpolation
      camera.zoom += (camera.targetZoom - camera.zoom) * 0.15;

      ctx.clearRect(0, 0, width, height);

      // 1. Deep Space Background Canvas
      const bgGrad = ctx.createRadialGradient(
        width / 2 + camera.x * 0.2,
        height / 2 + camera.y * 0.2,
        50,
        width / 2,
        height / 2,
        Math.max(width, height) * 0.8
      );
      bgGrad.addColorStop(0, '#0F1E3D'); // Deep Luminous Navy Center
      bgGrad.addColorStop(0.5, '#0A152E');
      bgGrad.addColorStop(1, '#050B17'); // Pitch Dark Periphery
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Save transform for world space
      ctx.save();
      ctx.translate(width / 2 + camera.x, height / 2 + camera.y);
      ctx.scale(camera.zoom, camera.zoom);

      // 2. Parallax Stardust Field
      stars.forEach((star) => {
        const twinkle = Math.sin(time + star.x) * 0.2;
        ctx.fillStyle = `rgba(226, 232, 240, ${Math.max(0.1, star.alpha + twinkle)})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
      });

      const nodes = Array.from(nodesRef.current.values());

      // 3. Functional Discreet Edges (Constraint 5: Shared category or ticket)
      ctx.lineWidth = 1;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const n1 = nodes[i];
          const n2 = nodes[j];

          const sameCategory = n1.category === n2.category && n1.category !== 'Général';
          const sameTicket = Boolean(n1.ticketRef && n1.ticketRef === n2.ticketRef);

          if (sameCategory || sameTicket) {
            const dx = n2.x - n1.x;
            const dy = n2.y - n1.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            // Draw line only if within meaningful visual proximity
            if (dist < 260) {
              const alpha = Math.max(0, 1 - dist / 260) * (sameTicket ? 0.35 : 0.15);
              ctx.strokeStyle = sameTicket
                ? `rgba(34, 197, 94, ${alpha})`
                : `rgba(6, 182, 212, ${alpha})`;
              ctx.beginPath();
              ctx.moveTo(n1.x, n1.y);
              ctx.lineTo(n2.x, n2.y);
              ctx.stroke();

              // Micro light photon travelling between connected nodes
              if (sameTicket || n1.isPulsing || n2.isPulsing) {
                const photonProgress = (time * 0.4 + i * 0.2) % 1;
                const px = n1.x + dx * photonProgress;
                const py = n1.y + dy * photonProgress;
                ctx.fillStyle = sameTicket ? '#22C55E' : '#38BDF8';
                ctx.beginPath();
                ctx.arc(px, py, 1.8, 0, Math.PI * 2);
                ctx.fill();
              }
            }
          }
        }
      }

      // 4. Render Nodes
      nodes.forEach((node) => {
        const isSelected = activeConversationId === node.id;
        const isHovered = hoveredNodeRef.current?.id === node.id;
        const scale = node.entranceScale;
        if (scale <= 0) return;

        // Search & Status Filter matching
        let matchesSearch = true;
        if (searchTerm) {
          const q = searchTerm.toLowerCase();
          matchesSearch =
            node.customerName.toLowerCase().includes(q) ||
            node.category.toLowerCase().includes(q) ||
            Boolean(node.lastMessage && node.lastMessage.toLowerCase().includes(q));
        }

        let matchesFilter = true;
        if (statusFilter === 'UNREAD') {
          matchesFilter = node.unreadCount > 0;
        } else if (statusFilter === 'RESOLVED') {
          matchesFilter = node.status === 'RESOLVED' || node.status === 'CLOSED';
        } else if (statusFilter === 'ACTIVE') {
          matchesFilter = node.status === 'ACTIVE' || node.status === 'OPEN';
        }

        const isDimmed = !matchesSearch || !matchesFilter;
        const effectiveAlpha = isDimmed ? 0.2 : 1;

        ctx.save();
        ctx.globalAlpha = effectiveAlpha;
        ctx.translate(node.x, node.y);
        ctx.scale(scale, scale);

        // A. Pulsing concentric wave rings (Triggered by client message)
        if (node.isPulsing && node.pulseAlpha > 0) {
          ctx.strokeStyle = `rgba(34, 197, 94, ${node.pulseAlpha})`;
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.arc(0, 0, node.pulseRadius, 0, Math.PI * 2);
          ctx.stroke();

          // Second inner echo ring
          if (node.pulseRadius > node.radius * 1.5) {
            ctx.strokeStyle = `rgba(34, 197, 94, ${node.pulseAlpha * 0.6})`;
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(0, 0, node.pulseRadius * 0.65, 0, Math.PI * 2);
            ctx.stroke();
          }
        }

        // B. Ambient Outer Glow Halo
        const glowRadius = isSelected ? 48 : isHovered ? 40 : 28;
        const glow = ctx.createRadialGradient(0, 0, 5, 0, 0, glowRadius);
        glow.addColorStop(0, `${node.hue}66`);
        glow.addColorStop(0.5, `${node.hue}22`);
        glow.addColorStop(1, `${node.hue}00`);
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(0, 0, glowRadius, 0, Math.PI * 2);
        ctx.fill();

        // C. Core Node Disc
        ctx.fillStyle = isSelected ? '#FFFFFF' : '#0B1528';
        ctx.beginPath();
        ctx.arc(0, 0, node.radius, 0, Math.PI * 2);
        ctx.fill();

        // Border ring
        ctx.strokeStyle = isSelected ? '#22C55E' : node.hue;
        ctx.lineWidth = isSelected ? 3 : 2;
        ctx.beginPath();
        ctx.arc(0, 0, node.radius, 0, Math.PI * 2);
        ctx.stroke();

        // D. Initial inside node
        ctx.fillStyle = isSelected ? '#0B1528' : '#F8FAFC';
        ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(node.customerName.charAt(0).toUpperCase(), 0, 0);

        // E. Persistent Unread Count Badge
        if (node.unreadCount > 0) {
          const badgeX = node.radius * 0.75;
          const badgeY = -node.radius * 0.75;
          ctx.fillStyle = '#22C55E';
          ctx.beginPath();
          ctx.arc(badgeX, badgeY, 8, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#070D1E';
          ctx.lineWidth = 2;
          ctx.stroke();

          ctx.fillStyle = '#050B17';
          ctx.font = 'bold 9px system-ui, sans-serif';
          ctx.fillText(String(Math.min(node.unreadCount, 99)), badgeX, badgeY);
        }

        // F. Category Subtitle Label beneath node (if zoomed in or selected)
        if (camera.zoom >= 0.85 || isSelected || isHovered) {
          ctx.fillStyle = isSelected ? '#34D399' : '#94A3B8';
          ctx.font = '10px system-ui, sans-serif';
          ctx.fillText(node.customerName, 0, node.radius + 14);
        }

        ctx.restore();
      });

      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [activeConversationId, searchTerm, statusFilter]);

  // Convert Screen Coordinates to World Coordinates
  const screenToWorld = useCallback((screenX: number, screenY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const width = canvas.width;
    const height = canvas.height;
    const camera = cameraRef.current;

    const xInCanvas = screenX - rect.left;
    const yInCanvas = screenY - rect.top;

    const worldX = (xInCanvas - width / 2 - camera.x) / camera.zoom;
    const worldY = (yInCanvas - height / 2 - camera.y) / camera.zoom;

    return { x: worldX, y: worldY };
  }, []);

  // Hit-Testing: Find Node at Screen Coordinates
  const findNodeAtPos = useCallback(
    (screenX: number, screenY: number): PulseNode | null => {
      const world = screenToWorld(screenX, screenY);
      const nodes = Array.from(nodesRef.current.values());

      for (let i = nodes.length - 1; i >= 0; i--) {
        const node = nodes[i];
        const dx = world.x - node.x;
        const dy = world.y - node.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist <= node.radius * 1.5) {
          return node;
        }
      }
      return null;
    },
    [screenToWorld]
  );

  // Mouse Interaction Handlers (Pan & Hover)
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    const hit = findNodeAtPos(e.clientX, e.clientY);
    if (hit) {
      // Clicked on a node directly
      onSelectConversation(hit.id);
      hit.unreadCount = 0; // reset local unread indicator
      return;
    }
    isDraggingRef.current = true;
    dragStartRef.current = {
      x: e.clientX - cameraRef.current.x,
      y: e.clientY - cameraRef.current.y,
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDraggingRef.current) {
      cameraRef.current.x = e.clientX - dragStartRef.current.x;
      cameraRef.current.y = e.clientY - dragStartRef.current.y;
    }

    mousePosRef.current = { x: e.clientX, y: e.clientY };
    const hit = findNodeAtPos(e.clientX, e.clientY);

    if (hit !== hoveredNodeRef.current) {
      hoveredNodeRef.current = hit;
      setHoveredNode(hit);
      if (hit) {
        setTooltipPos({ x: e.clientX, y: e.clientY });
      }
    } else if (hit) {
      setTooltipPos({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  // Wheel Zoom Handler
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.15 : 0.87;
    const current = cameraRef.current.targetZoom;
    cameraRef.current.targetZoom = Math.min(Math.max(current * zoomFactor, 0.4), 2.5);
  };

  const handleZoomIn = () => {
    cameraRef.current.targetZoom = Math.min(cameraRef.current.targetZoom * 1.25, 2.5);
  };

  const handleZoomOut = () => {
    cameraRef.current.targetZoom = Math.max(cameraRef.current.targetZoom * 0.8, 0.4);
  };

  const handleRecenter = () => {
    gsap.to(cameraRef.current, {
      x: 0,
      y: 0,
      targetZoom: 1,
      duration: 0.6,
      ease: 'power2.out',
    });
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden select-none bg-[#050B17] cursor-grab active:cursor-grabbing"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onWheel={handleWheel}
    >
      {/* HTML5 Render Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 block w-full h-full" />

      {/* Floating HUD Controls */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-900/80 backdrop-blur-md border border-slate-800 text-white shadow-xl">
        <button
          onClick={handleZoomIn}
          className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          title="Zoom avant (+)"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={handleZoomOut}
          className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          title="Zoom arrière (-)"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={handleRecenter}
          className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          title="Recentrer la constellation"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
        <div className="w-px h-4 bg-slate-800 mx-0.5" />
        <button
          onClick={toggleSound}
          className={`p-2 rounded-xl transition-colors ${
            soundEnabled
              ? 'text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20'
              : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'
          }`}
          title={soundEnabled ? 'Sons des notifications activés' : 'Notifications sonores coupées'}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>
      </div>

      {/* Constellation Live Status Badge */}
      <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 backdrop-blur-md border border-slate-800 text-[11px] text-slate-300 shadow-xl pointer-events-none">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span className="font-semibold text-slate-200">Pulse Constellation</span>
        <span className="text-slate-500">•</span>
        <span className="text-slate-400 font-mono">{conversations.length} nœuds actifs</span>
      </div>

      {/* Floating Hover Tooltip */}
      {hoveredNode && (
        <div
          className="fixed z-50 pointer-events-none -translate-x-1/2 -translate-y-full mb-3 px-3.5 py-2.5 rounded-2xl bg-slate-900/95 backdrop-blur-md border border-slate-700/80 text-white shadow-2xl max-w-xs transition-opacity duration-150 animate-fade-in"
          style={{
            left: `${tooltipPos.x}px`,
            top: `${tooltipPos.y - 10}px`,
            boxShadow: '0 15px 35px -5px rgba(0, 0, 0, 0.8)',
          }}
        >
          <div className="flex items-center justify-between gap-3 mb-1">
            <span className="text-xs font-bold text-white truncate">
              {hoveredNode.customerName}
            </span>
            <span
              className="text-[9px] font-bold px-1.5 py-0.2 rounded-full"
              style={{
                backgroundColor: `${hoveredNode.hue}22`,
                color: hoveredNode.hue,
                border: `1px solid ${hoveredNode.hue}44`,
              }}
            >
              {hoveredNode.status}
            </span>
          </div>

          <p className="text-[10px] text-slate-400 font-medium mb-1">
            {hoveredNode.category}
            {hoveredNode.ticketRef && (
              <span className="ml-1.5 text-emerald-400 font-mono">#{hoveredNode.ticketRef}</span>
            )}
          </p>

          {hoveredNode.lastMessage && (
            <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed bg-slate-950/60 p-2 rounded-xl border border-slate-800/80">
              « {hoveredNode.lastMessage} »
            </p>
          )}

          <div className="text-[9px] text-emerald-400 font-semibold mt-1.5 text-right flex items-center justify-end gap-1">
            <Sparkles className="w-2.5 h-2.5" />
            Cliquer pour ouvrir le fil
          </div>
        </div>
      )}
    </div>
  );
};

