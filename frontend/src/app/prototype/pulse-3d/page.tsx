'use client';

import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Search,
  Maximize2,
  RotateCw,
  Zap,
  Plus,
  Radio,
  MessageSquare,
  Sparkles,
  Layers,
} from 'lucide-react';
import {
  Pulse3DCanvas,
  Pulse3DIncomingEvent,
} from '@/components/pulse-3d/Pulse3DCanvas';
import { Pulse3DMockDrawer } from '@/components/pulse-3d/Pulse3DMockDrawer';
import {
  PULSE_3D_CLUSTERS,
  buildInitialMockConversations,
  build3DConnections,
  findFree3DPosition,
  SIMULATED_INCOMING_MESSAGES,
  SIMULATED_NEW_CUSTOMERS,
} from '@/components/pulse-3d/mockConstellationData';
import { Pulse3DConversation } from '@/components/pulse-3d/types';

export default function Pulse3DPrototypePage() {
  const [conversations, setConversations] = useState<Pulse3DConversation[]>(() =>
    buildInitialMockConversations()
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [autoRotate, setAutoRotate] = useState(true);
  const [autoSimulate, setAutoSimulate] = useState(false);
  const [fitViewNonce, setFitViewNonce] = useState(0);
  const [incomingEvent, setIncomingEvent] = useState<Pulse3DIncomingEvent | null>(null);

  const simIndexRef = useRef(0);
  const newCustomerIdxRef = useRef(0);

  const connections = useMemo(() => build3DConnections(conversations), [conversations]);

  const selectedConversation = useMemo(
    () => conversations.find((c) => c.id === selectedId) || null,
    [conversations, selectedId]
  );

  const markRead = useCallback((id: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === id && c.unreadCount > 0 ? { ...c, unreadCount: 0 } : c))
    );
  }, []);

  const handleSelectConversation = useCallback(
    (id: string) => {
      setSelectedId(id);
      markRead(id);
    },
    [markRead]
  );

  const handleOpenDrawer = useCallback(
    (id: string) => {
      setSelectedId(id);
      setIsDrawerOpen(true);
      markRead(id);
    },
    [markRead]
  );

  const simulateIncomingMessage = useCallback((targetId?: string) => {
    const nowTime = new Date().toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });

    setConversations((prev) => {
      const candidates = prev.filter((c) => c.status !== 'RESOLVED');
      const pool = candidates.length > 0 ? candidates : prev;
      if (pool.length === 0) return prev;

      const chosen =
        (targetId && prev.find((c) => c.id === targetId)) ||
        pool[simIndexRef.current % pool.length];
      const msgText =
        SIMULATED_INCOMING_MESSAGES[simIndexRef.current % SIMULATED_INCOMING_MESSAGES.length];
      simIndexRef.current += 1;

      setIncomingEvent({
        eventId: `sim-msg-${Date.now()}-${simIndexRef.current}`,
        type: 'MESSAGE',
        conversationId: chosen.id,
        timestamp: Date.now(),
      });

      return prev.map((c) =>
        c.id === chosen.id
          ? {
              ...c,
              status: c.status === 'RESOLVED' ? 'OPEN' : c.status,
              unreadCount: c.unreadCount + 1,
              lastMessage: msgText,
              lastMessageAt: nowTime,
              messages: [
                ...c.messages,
                {
                  id: `msg-${Date.now()}-${simIndexRef.current}`,
                  senderType: 'CUSTOMER',
                  senderName: c.customerName,
                  content: msgText,
                  createdAt: nowTime,
                },
              ],
            }
          : c
      );
    });
  }, []);

  const simulateBurst = useCallback(() => {
    simulateIncomingMessage();
    setTimeout(() => simulateIncomingMessage(), 420);
    setTimeout(() => simulateIncomingMessage(), 840);
  }, [simulateIncomingMessage]);

  const simulateNewConversation = useCallback(() => {
    const template =
      SIMULATED_NEW_CUSTOMERS[newCustomerIdxRef.current % SIMULATED_NEW_CUSTOMERS.length];
    const idx = newCustomerIdxRef.current;
    newCustomerIdxRef.current += 1;

    const nowTime = new Date().toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });
    const newId = `p3d-new-${Date.now()}-${idx}`;
    const cluster =
      PULSE_3D_CLUSTERS.find((cl) => cl.name === template.category) || PULSE_3D_CLUSTERS[0];

    setConversations((prev) => {
      const sameClusterCount = prev.filter((c) => c.category === cluster.name).length;
      const pos = findFree3DPosition(cluster, prev, sameClusterCount, idx + 40);
      const firstMsg = 'Bonjour, je souhaite obtenir une assistance sur ma demande en cours.';

      const created: Pulse3DConversation = {
        id: newId,
        customerName: `${template.name}${idx >= SIMULATED_NEW_CUSTOMERS.length ? ` #${idx + 1}` : ''}`,
        customerPhone: template.phone,
        category: cluster.name,
        status: 'OPEN',
        unreadCount: 1,
        lastMessage: firstMsg,
        lastMessageAt: nowTime,
        ...pos,
        messages: [
          {
            id: `m-init-${Date.now()}`,
            senderType: 'CUSTOMER',
            senderName: template.name,
            content: firstMsg,
            createdAt: nowTime,
          },
        ],
      };

      return [...prev, created];
    });

    setTimeout(() => {
      setIncomingEvent({
        eventId: `sim-birth-${newId}`,
        type: 'NEW_NODE',
        conversationId: newId,
        timestamp: Date.now(),
      });
    }, 60);
  }, []);

  useEffect(() => {
    if (!autoSimulate) return;
    const timer = setInterval(() => {
      simulateIncomingMessage();
    }, 3400);
    return () => clearInterval(timer);
  }, [autoSimulate, simulateIncomingMessage]);

  const handleDrawerSendMessage = useCallback(
    (conversationId: string, text: string, isInternalNote: boolean) => {
      const nowTime = new Date().toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
      });
      setConversations((prev) =>
        prev.map((c) =>
          c.id === conversationId
            ? {
                ...c,
                unreadCount: 0,
                status: !isInternalNote && c.status !== 'RESOLVED' ? 'WAITING_CUSTOMER' : c.status,
                lastMessage: isInternalNote ? c.lastMessage : text,
                lastMessageAt: nowTime,
                messages: [
                  ...c.messages,
                  {
                    id: `reply-${Date.now()}`,
                    senderType: isInternalNote ? 'INTERNAL_NOTE' : 'AGENT',
                    senderName: isInternalNote ? 'Note interne' : 'Conseiller SAV',
                    content: text,
                    createdAt: nowTime,
                    isInternalNote,
                  },
                ],
              }
            : c
        )
      );
    },
    []
  );

  const handleMarkResolved = useCallback((conversationId: string) => {
    setConversations((prev) =>
      prev.map((c) =>
        c.id === conversationId ? { ...c, status: 'RESOLVED', unreadCount: 0 } : c
      )
    );
  }, []);

  const unreadTotal = useMemo(
    () => conversations.reduce((sum, c) => sum + (c.status === 'RESOLVED' ? 0 : c.unreadCount), 0),
    [conversations]
  );

  return (
    <div className="h-[100dvh] w-full flex flex-col bg-[#060D1E] text-white overflow-hidden">
      {/* Barre supérieure du prototype */}
      <header className="px-4 py-2.5 bg-[#081229]/95 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3 shrink-0 z-20">
        <div className="flex items-center gap-3">
          <Link
            href="/app/conversations"
            className="h-8 px-2.5 rounded-lg bg-slate-800/70 hover:bg-slate-700/80 border border-slate-700 text-xs font-medium text-slate-200 flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Retour Workspace</span>
          </Link>

          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-400/30 flex items-center justify-center text-emerald-300">
              <Layers className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-bold tracking-tight text-white">
                  Constellation Pulse 3D
                </h1>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-400/30 text-[10px] font-semibold">
                  Prototype expérimental
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden md:block">
                Scène Three.js isolée · Données simulées · Clic = sélectionner · Double-clic = ouvrir le fil
              </p>
            </div>
          </div>
        </div>

        {/* Recherche, filtres et caméra */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative w-52 sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher client, #ticket…"
              className="w-full h-8 pl-8 pr-3 rounded-lg bg-slate-900/90 border border-slate-700 text-xs text-white placeholder:text-slate-400 focus:outline-none focus:border-emerald-400"
            />
          </div>

          <div className="hidden lg:flex items-center gap-1 bg-slate-900/90 p-0.5 rounded-lg border border-slate-800">
            {[
              { id: 'ALL', label: 'Toutes' },
              { id: 'UNREAD', label: `Non lues (${unreadTotal})` },
              { id: 'ACTIVE', label: 'En cours' },
              { id: 'RESOLVED', label: 'Résolues' },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setStatusFilter(f.id)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                  statusFilter === f.id
                    ? 'bg-white text-[#0D1B3D] font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setFitViewNonce((n) => n + 1)}
            className="h-8 px-2.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-100 flex items-center gap-1.5 cursor-pointer"
            title="Retrouver la vue globale"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Vue globale</span>
          </button>

          <button
            type="button"
            onClick={() => setAutoRotate((v) => !v)}
            className={`h-8 px-2.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-colors ${
              autoRotate
                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-400/35'
                : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-white'
            }`}
            title="Activer ou couper la rotation lente de l'espace"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Rotation</span>
          </button>
        </div>
      </header>

      {/* Scène 3D + Drawer isolé */}
      <div className="flex-1 flex min-h-0 relative overflow-hidden">
        <div className="flex-1 relative min-w-0 h-full">
          <Pulse3DCanvas
            conversations={conversations}
            connections={connections}
            clusters={PULSE_3D_CLUSTERS}
            selectedId={selectedId}
            searchTerm={searchTerm}
            statusFilter={statusFilter}
            autoRotate={autoRotate}
            fitViewNonce={fitViewNonce}
            incomingEvent={incomingEvent}
            onSelectConversation={handleSelectConversation}
            onOpenDrawer={handleOpenDrawer}
          />

          {/* Légende des catégories & états (haut gauche) */}
          <div className="absolute top-3 left-3 z-20 hidden md:flex flex-col gap-1.5 px-3 py-2.5 rounded-xl bg-[#081229]/80 backdrop-blur-md border border-slate-800 text-[11px] text-slate-300 pointer-events-none">
            <div className="font-semibold text-white flex items-center gap-1.5 mb-0.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Réseau spatial ({conversations.length} nœuds · {connections.length} liens)</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
                Non lue / Signal
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                À traiter
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-sky-400" />
                En cours
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-slate-600" />
                Résolue
              </span>
            </div>
          </div>

          {/* Barre de simulation interactive (bas gauche) */}
          <div className="absolute bottom-4 left-4 z-20 flex flex-wrap items-center gap-2 p-1.5 rounded-xl bg-[#081229]/90 backdrop-blur-md border border-slate-700/80 shadow-2xl">
            <button
              type="button"
              onClick={() => simulateIncomingMessage()}
              className="h-8 px-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-[#052e16] text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Simuler message entrant</span>
            </button>

            <button
              type="button"
              onClick={simulateBurst}
              className="h-8 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-600 text-xs font-semibold text-white flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <span>Rafale (3x)</span>
            </button>

            <button
              type="button"
              onClick={simulateNewConversation}
              className="h-8 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-600 text-xs font-semibold text-white flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nouveau nœud</span>
            </button>

            <button
              type="button"
              onClick={() => setAutoSimulate((v) => !v)}
              className={`h-8 px-3 rounded-lg border text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors ${
                autoSimulate
                  ? 'bg-sky-500/20 text-sky-300 border-sky-400/50'
                  : 'bg-slate-800/70 text-slate-300 border-slate-700 hover:text-white'
              }`}
            >
              <Radio className={`w-3.5 h-3.5 ${autoSimulate ? 'animate-pulse text-sky-400' : ''}`} />
              <span>Flux auto</span>
            </button>
          </div>

          {/* Barre d'action rapide du nœud sélectionné */}
          {selectedConversation && !isDrawerOpen && (
            <div className="absolute bottom-4 right-4 z-20 max-w-sm p-3 rounded-xl bg-[#081229]/95 backdrop-blur-md border border-slate-700 shadow-2xl flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white truncate">
                    {selectedConversation.customerName}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {selectedConversation.lastMessageAt}
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 truncate mt-0.5">
                  {selectedConversation.lastMessage}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsDrawerOpen(true)}
                className="h-8 px-3 rounded-lg bg-white hover:bg-slate-100 text-[#0D1B3D] text-xs font-bold flex items-center gap-1.5 shrink-0 cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Ouvrir le fil</span>
              </button>
            </div>
          )}
        </div>

        {/* Drawer isolé (n'affecte pas PulseConversationDrawer.tsx) */}
        <Pulse3DMockDrawer
          conversation={selectedConversation}
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          onSendMessage={handleDrawerSendMessage}
          onMarkResolved={handleMarkResolved}
        />
      </div>
    </div>
  );
}
