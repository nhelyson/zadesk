'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import {
  MessageSquare,
  Search,
  Sparkles,
  Send,
  CheckCheck,
  AlertCircle,
  FolderKanban,
  Bot,
  User,
  Phone,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Paperclip,
  Smile,
  ArrowLeft,
  ChevronRight,
  UserCheck,
  Zap,
  Lock,
  Plus,
  Info,
  RefreshCw,
  ExternalLink,
  X,
} from 'lucide-react';
import { useWorkspace } from '@/components/workspace/WorkspaceContext';
import { agentApi } from '@/lib/api';
import { AgentConversationItem } from '@/types/workspace';
import { PulseConstellationCanvas } from '@/components/pulse/PulseConstellationCanvas';
import { PulseConversationDrawer } from '@/components/pulse/PulseConversationDrawer';
import { PulseNotifications } from '@/components/pulse/PulseNotifications';
import { usePulseStream } from '@/hooks/usePulseStream';

export interface ConversationsViewProps {
  previewConversations?: AgentConversationItem[];
}

export function ConversationsView({ previewConversations }: ConversationsViewProps = {}) {
  const { currentWorkspace, userRole, user } = useWorkspace();
  const [conversations, setConversations] = useState<AgentConversationItem[]>(previewConversations || []);
  const [activeConvId, setActiveConvId] = useState<string | null>(previewConversations?.[0]?.id || null);
  const [loading, setLoading] = useState(!previewConversations);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Mode de visualisation : Constellation Pulse vs Liste classique
  const [viewMode, setViewMode] = useState<'pulse' | 'classic'>(
    previewConversations ? 'classic' : 'pulse'
  );
  const [isPulseDrawerOpen, setIsPulseDrawerOpen] = useState(false);
  const [pulseEvent, setPulseEvent] = useState<{ conversationId: string; timestamp: number } | null>(null);
  const [newNodeEvent, setNewNodeEvent] = useState<{ conversationId: string; timestamp: number } | null>(null);
  // Volet Fiche Client & Ticket
  const [isCustomerPanelOpen, setIsCustomerPanelOpen] = useState(false);

  // État du fil de discussion actif (séparation stricte de la boîte de réception)
  const [activeThreadMessages, setActiveThreadMessages] = useState<any[]>([]);
  const [loadingThread, setLoadingThread] = useState(false);
  const threadScrollContainerRef = useRef<HTMLDivElement>(null);
  const threadEndRef = useRef<HTMLDivElement>(null);

  // Message form
  const [replyText, setReplyText] = useState('');
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);

  // Link Ticket Modal
  const [isLinkTicketModalOpen, setIsLinkTicketModalOpen] = useState(false);
  const [ticketTitle, setTicketTitle] = useState('');
  const [ticketPriority, setTicketPriority] = useState('MEDIUM');
  const [creatingTicket, setCreatingTicket] = useState(false);

  // Canned Responses Modal
  const [isCannedResponsesModalOpen, setIsCannedResponsesModalOpen] = useState(false);
  const [cannedCategoryFilter, setCannedCategoryFilter] = useState('ALL');
  const [cannedSearchTerm, setCannedSearchTerm] = useState('');

  const cannedResponsesList = (
    Array.isArray(currentWorkspace?.cannedResponses) && currentWorkspace.cannedResponses.length > 0
      ? currentWorkspace.cannedResponses
      : [
          {
            id: 'cr-1',
            title: 'Prise en charge immédiate',
            category: 'Accueil',
            shortcut: '/bonjour',
            content: "Bonjour, votre demande a bien été reçue par notre équipe SAV. Nous l'examinons actuellement et revenons vers vous dans les plus brefs délais.",
            isActive: true,
          },
          {
            id: 'cr-2',
            title: 'Demande de précision / photo',
            category: 'Suivi des demandes',
            shortcut: '/details',
            content: "Afin de traiter votre dossier au plus vite, pourriez-vous nous transmettre une photo ou une description détaillée du problème rencontré ?",
            isActive: true,
          },
          {
            id: 'cr-3',
            title: 'Délais de traitement SAV',
            category: 'Délais de traitement',
            shortcut: '/delais',
            content: "Nos techniciens interviennent sous 24h à 48h ouvrées. Vous recevrez une notification par message dès que l'intervention est planifiée.",
            isActive: true,
          },
          {
            id: 'cr-4',
            title: 'Clôture et résolution',
            category: 'Clôture de conversation',
            shortcut: '/cloture',
            content: "Votre demande a été traitée avec succès par notre équipe. Restons à votre disposition si vous avez la moindre question complémentaire. Excellente journée !",
            isActive: true,
          },
        ]
  ).filter((cr: any) => cr.isActive !== false);

  const filteredCannedResponses = cannedResponsesList.filter((cr: any) => {
    if (cannedCategoryFilter !== 'ALL' && cr.category !== cannedCategoryFilter) return false;
    if (cannedSearchTerm) {
      const q = cannedSearchTerm.toLowerCase();
      return (
        cr.title.toLowerCase().includes(q) ||
        cr.content.toLowerCase().includes(q) ||
        (cr.shortcut && cr.shortcut.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleSelectCanned = (content: string) => {
    setReplyText((prev) => (prev ? `${prev}\n${content}` : content));
    setIsCannedResponsesModalOpen(false);
  };

  const [isMobileViewingThread, setIsMobileViewingThread] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const activeConvIdRef = useRef(activeConvId);
  activeConvIdRef.current = activeConvId;

  // Auto-scroll intelligent dans le fil de discussion
  const scrollToBottom = useCallback((smooth = true) => {
    if (threadEndRef.current) {
      threadEndRef.current.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
    }
  }, []);

  // Chargement complet du fil de discussion actif (tous les messages historiques dans l'ordre ascendant)
  const loadActiveConversationThread = useCallback(
    async (convId: string, isSilent = false) => {
      if (previewConversations || !currentWorkspace?.id || !convId) return;
      if (!isSilent) {
        setLoadingThread(true);
      }
      try {
        const details = await agentApi.getConversationDetails(currentWorkspace.id, convId);
        if (details && Array.isArray(details.messages)) {
          if (activeConvIdRef.current === convId) {
            setActiveThreadMessages(details.messages);
          }
        }
      } catch (err: any) {
        console.error('Failed to load active conversation thread:', err);
      } finally {
        if (!isSilent) {
          setLoadingThread(false);
        }
      }
    },
    [previewConversations, currentWorkspace?.id]
  );

  // Chargement de la liste des conversations (aperçu boîte de réception)
  const fetchConversations = useCallback(
    async (selectId?: string, isSilent = false) => {
      if (previewConversations || !currentWorkspace?.id) return;
      if (!isSilent) {
        setLoading(true);
      }
      try {
        const data = await agentApi.getConversations(currentWorkspace.id);
        const items = Array.isArray(data) ? data : ((data as any)?.conversations || []);
        setConversations(items);
        if (items.length > 0) {
          const targetId = selectId || activeConvIdRef.current;
          if (targetId && items.some((c: any) => c.id === targetId)) {
            setActiveConvId(targetId);
          } else {
            setActiveConvId(items[0].id);
          }
        }
      } catch (err: any) {
        console.error('Failed to load conversations:', err);
      } finally {
        if (!isSilent) {
          setLoading(false);
        }
      }
    },
    [previewConversations, currentWorkspace?.id]
  );

  // Synchronisation du fil complet dès que la conversation active change
  useEffect(() => {
    if (previewConversations) {
      const conv = previewConversations.find((c) => c.id === activeConvId);
      setActiveThreadMessages(conv?.messages || []);
      return;
    }
    if (activeConvId) {
      loadActiveConversationThread(activeConvId);
    } else {
      setActiveThreadMessages([]);
    }
  }, [activeConvId, previewConversations, loadActiveConversationThread]);

  // Défilement automatique quand de nouveaux messages arrivent
  useEffect(() => {
    const container = threadScrollContainerRef.current;
    if (!container) return;
    const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 250;
    if (isNearBottom) {
      scrollToBottom();
    }
  }, [activeThreadMessages, scrollToBottom]);

  useEffect(() => {
    if (previewConversations) {
      setConversations(previewConversations);
      if (previewConversations.length > 0 && !activeConvId) {
        setActiveConvId(previewConversations[0].id);
      }
      setLoading(false);
      return;
    }
    fetchConversations();
  }, [previewConversations, fetchConversations]);

  // Flux SSE temps réel avec reconnexion automatique et récupération d'état complet
  const handlePulseEvent = useCallback(
    (event: any) => {
      if (event.type === 'PULSE_MESSAGE_CREATED' && event.conversationId) {
        setPulseEvent({ conversationId: event.conversationId, timestamp: Date.now() });
        fetchConversations(undefined, true);
        if (event.conversationId === activeConvIdRef.current) {
          loadActiveConversationThread(event.conversationId, true);
        }
      } else if (event.type === 'PULSE_CONVERSATION_CREATED' && event.conversationId) {
        setNewNodeEvent({ conversationId: event.conversationId, timestamp: Date.now() });
        fetchConversations(event.conversationId, true);
      } else if (
        event.type === 'PULSE_CONVERSATION_UPDATED' ||
        event.type === 'PULSE_CONVERSATION_READ'
      ) {
        fetchConversations(undefined, true);
      }
    },
    [fetchConversations, loadActiveConversationThread]
  );

  const handleFullSync = useCallback(async () => {
    await fetchConversations(undefined, true);
    if (activeConvIdRef.current) {
      await loadActiveConversationThread(activeConvIdRef.current, true);
    }
  }, [fetchConversations, loadActiveConversationThread]);

  const {
    status: sseStatus,
    notifications,
    dismissNotification,
  } = usePulseStream({
    workspaceId: currentWorkspace?.id,
    enabled: !previewConversations && Boolean(currentWorkspace?.id),
    onFullSyncNeeded: handleFullSync,
    onEvent: handlePulseEvent,
  });

  const activeConv = conversations.find((c) => c.id === activeConvId) || conversations[0] || null;

  // Modèle enrichi avec le fil de discussion complet
  const activeConvWithThread = activeConv
    ? {
        ...activeConv,
        messages: activeThreadMessages.length > 0 ? activeThreadMessages : (activeConv.messages || []),
      }
    : null;

  const handleDrawerSendMessage = async (text: string, internalNote: boolean) => {
    if (!activeConv || !currentWorkspace || sendingMessage) return;
    setSendingMessage(true);
    const optimisticMsg = {
      id: `temp-${Date.now()}`,
      senderType: (internalNote ? 'INTERNAL_NOTE' : 'AGENT') as any,
      senderName: user?.firstName ? `${user.firstName} ${user.lastName || ''}` : 'Agent SAV',
      content: text.trim(),
      createdAt: new Date().toISOString(),
      isInternalNote: internalNote,
    };
    setActiveThreadMessages((prev) => [...prev, optimisticMsg]);
    try {
      await agentApi.sendMessage(currentWorkspace.id, activeConv.id, {
        content: text,
        isInternalNote: internalNote,
      });
      await Promise.all([
        fetchConversations(activeConv.id, true),
        loadActiveConversationThread(activeConv.id, true),
      ]);
    } catch (err: any) {
      console.error('Drawer send message error:', err);
    } finally {
      setSendingMessage(false);
    }
  };

  const filteredConversations = conversations.filter((c) => {
    if (filterStatus !== 'ALL' && c.status !== filterStatus) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        c.customerName.toLowerCase().includes(q) ||
        (c.customerPhone && c.customerPhone.includes(q)) ||
        (c.lastMessage && c.lastMessage.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !activeConv || !currentWorkspace || sendingMessage) return;

    setSendingMessage(true);
    setFeedback(null);
    if (previewConversations) {
      const newMsg = {
        id: `preview-msg-${Date.now()}`,
        senderType: (isInternalNote ? 'INTERNAL_NOTE' : 'AGENT') as 'INTERNAL_NOTE' | 'AGENT',
        senderName: user?.firstName ? `${user.firstName} ${user.lastName || ''}` : 'Agent SAV',
        content: replyText.trim(),
        createdAt: new Date().toISOString(),
        isInternalNote,
      };
      setActiveThreadMessages((prev) => [...prev, newMsg]);
      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeConv.id
            ? {
                ...c,
                lastMessage: replyText.trim(),
                messages: [...(c.messages || []), newMsg],
              }
            : c
        )
      );
      setReplyText('');
      setFeedback({
        type: 'success',
        text: isInternalNote
          ? 'Note interne enregistrée dans le fil.'
          : 'Message transmis en direct sur le canal WhatsApp.',
      });
      setSendingMessage(false);
      return;
    }

    const optimisticMsg = {
      id: `temp-${Date.now()}`,
      senderType: (isInternalNote ? 'INTERNAL_NOTE' : 'AGENT') as any,
      senderName: user?.firstName ? `${user.firstName} ${user.lastName || ''}` : 'Agent SAV',
      content: replyText.trim(),
      createdAt: new Date().toISOString(),
      isInternalNote,
    };
    setActiveThreadMessages((prev) => [...prev, optimisticMsg]);
    setReplyText('');

    try {
      await agentApi.sendMessage(currentWorkspace.id, activeConv.id, {
        content: optimisticMsg.content,
        isInternalNote,
      });

      await Promise.all([
        fetchConversations(activeConv.id, true),
        loadActiveConversationThread(activeConv.id, true),
      ]);
      setFeedback({
        type: 'success',
        text: isInternalNote
          ? 'Note interne confidentielle enregistrée.'
          : 'Message enregistré sur la plateforme Zadesk.',
      });
    } catch (err: any) {
      setFeedback({
        type: 'error',
        text: err.message || "Erreur lors de l'enregistrement du message.",
      });
    } finally {
      setSendingMessage(false);
    }
  };

  const handleLinkTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentWorkspace || !activeConv || !ticketTitle.trim() || creatingTicket) return;

    setCreatingTicket(true);
    setFeedback(null);
    try {
      await agentApi.linkConversationTicket(currentWorkspace.id, activeConv.id, {
        title: ticketTitle.trim(),
        priority: ticketPriority,
        category: activeConv.category || 'Général',
      });

      setIsLinkTicketModalOpen(false);
      setTicketTitle('');
      await fetchConversations(activeConv.id);
      setFeedback({
        type: 'success',
        text: 'Nouveau ticket créé et relié à cette conversation avec succès !',
      });
    } catch (err: any) {
      setFeedback({
        type: 'error',
        text: err.message || 'Échec de la liaison du ticket.',
      });
    } finally {
      setCreatingTicket(false);
    }
  };

  return (
    <div className="h-[calc(100dvh-5.5rem)] sm:h-[calc(100dvh-7.5rem)] flex flex-col space-y-3 sm:space-y-4 animate-fade-in">
      {/* Header Bar — masqué sur mobile lors de la consultation d'un fil pour dédier 100% de la hauteur à la discussion */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0 ${
        isMobileViewingThread ? 'hidden md:flex' : 'flex'
      }`}>
        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2.5 tracking-tight">
              <MessageSquare className="w-5 h-5 text-emerald-600" />
              <span>Mes Conversations SAV</span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Visualisation temps réel, constellation dynamique et traitement unifié des flux clients.
            </p>
          </div>

          {/* Segmented View Mode Switcher */}
          <div className="flex items-center p-1 bg-slate-100 rounded-2xl border border-slate-200 shrink-0">
            <button
              onClick={() => setViewMode('pulse')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'pulse'
                  ? 'bg-[#0D1B3D] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 active:bg-slate-200/60'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Constellation Pulse</span>
            </button>
            <button
              onClick={() => setViewMode('classic')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'classic'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900 active:bg-slate-200/60'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
              <span>Liste Classique</span>
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* SSE Live Status Indicator */}
          {!previewConversations && (
            <div
              className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold flex items-center gap-1.5 border ${
                sseStatus === 'connected'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : sseStatus === 'connecting'
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : 'bg-slate-100 text-slate-500 border-slate-200'
              }`}
              title={
                sseStatus === 'connected'
                  ? 'Connecté au flux d’événements SSE temps réel'
                  : sseStatus === 'connecting'
                  ? 'Connexion au serveur SSE en cours...'
                  : 'Déconnecté du flux SSE'
              }
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  sseStatus === 'connected' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'
                }`}
              />
              <span className="hidden sm:inline">
                {sseStatus === 'connected'
                  ? 'SSE En direct'
                  : sseStatus === 'connecting'
                  ? 'Connexion...'
                  : 'Hors ligne'}
              </span>
            </div>
          )}

          {/* Action : Tester Guichet Client */}
          {currentWorkspace?.slug && (
            <Link
              href={`/entreprises/${currentWorkspace.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 active:bg-emerald-200 text-emerald-800 border border-emerald-200 text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              title="Ouvrir le portail SAV public de votre entreprise dans un nouvel onglet"
            >
              <ExternalLink className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">Guichet SAV Client ↗</span>
            </Link>
          )}

          <button
            onClick={() => fetchConversations()}
            className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 active:bg-slate-200 text-slate-600 border border-slate-200 cursor-pointer shadow-2xs transition-colors"
            title="Actualiser les conversations"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
          </button>
        </div>
      </div>

      {viewMode === 'pulse' ? (
        /* ========================================================= */
        /* VUE CONSTELLATION PULSE (Interface Immersive)             */
        /* ========================================================= */
        <div className="flex-1 min-h-0 relative rounded-3xl overflow-hidden border border-slate-800 bg-[#050B17] shadow-2xl flex flex-col">
          {/* Top Floating Filter & Search HUD inside Pulse */}
          <div className="p-3.5 border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-md flex flex-wrap items-center justify-between gap-3 shrink-0 z-10">
            {/* Search */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Rechercher par client, mot-clé, ticket..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-900/90 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>

            {/* Status Filters */}
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
              {[
                { id: 'ALL', label: 'Toutes les conversations' },
                { id: 'UNREAD', label: 'Non lues' },
                { id: 'ACTIVE', label: 'En cours' },
                { id: 'WAITING_CUSTOMER', label: 'Attente client' },
                { id: 'RESOLVED', label: 'Résolues' },
              ].map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setFilterStatus(filter.id)}
                  className={`px-3 py-1 rounded-xl text-[11px] font-bold tracking-wide transition-all cursor-pointer whitespace-nowrap ${
                    filterStatus === filter.id
                      ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                      : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Canvas Viewport */}
          <div className="flex-1 relative w-full h-full min-h-0">
            <PulseConstellationCanvas
              conversations={conversations}
              activeConversationId={activeConvId}
              onSelectConversation={(id) => {
                setActiveConvId(id);
                setIsPulseDrawerOpen(true);
              }}
              pulseEvent={pulseEvent}
              newNodeEvent={newNodeEvent}
              searchTerm={searchTerm}
              statusFilter={filterStatus}
            />

            {/* Conversation Drawer */}
            <PulseConversationDrawer
              conversation={activeConvWithThread}
              isOpen={isPulseDrawerOpen && Boolean(activeConvWithThread)}
              onClose={() => setIsPulseDrawerOpen(false)}
              onSendMessage={handleDrawerSendMessage}
              sendingMessage={sendingMessage}
              cannedResponses={cannedResponsesList}
              onOpenLinkTicketModal={() => setIsLinkTicketModalOpen(true)}
            />

            {/* Floating Live Notifications */}
            <PulseNotifications
              notifications={notifications}
              onSelectConversation={(id) => {
                setActiveConvId(id);
                setIsPulseDrawerOpen(true);
              }}
              onDismiss={dismissNotification}
            />
          </div>
        </div>
      ) : (
        /* ========================================================= */
        /* VUE CLASSIQUE : COCKPIT DE MESSAGERIE DUAL-PANE (2 Volets) */
        /* ========================================================= */
        <div className="flex-1 flex flex-col md:flex-row gap-3 sm:gap-4 min-h-0 overflow-hidden">
          {/* VOLET 1 : Boîte de Réception Agile (Gauche) */}
          <div
            className={`w-full md:w-[350px] lg:w-[380px] xl:w-[410px] rounded-2xl sm:rounded-3xl bg-white border border-slate-200/90 flex flex-col min-h-0 overflow-hidden shadow-sm shrink-0 ${
              isMobileViewingThread ? 'hidden md:flex' : 'flex'
            }`}
          >
            {/* Header / Recherche & Filtres Rapides */}
            <div className="p-3 sm:p-3.5 border-b border-slate-100 space-y-2.5 shrink-0 bg-slate-50/50">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Rechercher client, numéro, message..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 sm:py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-slate-800 placeholder:text-slate-400"
                />
              </div>

              {/* Filtres de statut épurés */}
              <div className="flex items-center gap-1.5 overflow-x-auto overscroll-contain scrollbar-none pb-0.5">
                {[
                  { id: 'ALL', label: 'Toutes' },
                  { id: 'UNREAD', label: 'Non lues' },
                  { id: 'ACTIVE', label: 'En cours' },
                  { id: 'WAITING_CUSTOMER', label: 'Attente' },
                  { id: 'RESOLVED', label: 'Résolues' },
                ].map((st) => (
                  <button
                    key={st.id}
                    onClick={() => setFilterStatus(st.id)}
                    className={`px-3 py-1.5 sm:px-2.5 sm:py-1 rounded-xl text-[11px] font-bold tracking-tight transition-all cursor-pointer whitespace-nowrap active:scale-95 ${
                      filterStatus === st.id
                        ? 'bg-emerald-600 text-white shadow-2xs'
                        : 'bg-white text-slate-500 hover:bg-slate-100 active:bg-slate-200 border border-slate-200'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Liste des conversations aérées */}
            <div className="flex-1 overflow-y-auto overscroll-contain divide-y divide-slate-100">
              {loading ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  <RefreshCw className="w-5 h-5 animate-spin text-emerald-600 mx-auto mb-2" />
                  <span>Chargement des conversations...</span>
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400 space-y-3">
                  <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <p className="font-medium text-slate-500">Aucune conversation trouvée.</p>
                  {currentWorkspace?.slug && (
                    <Link
                      href={`/entreprises/${currentWorkspace.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 active:bg-emerald-200 text-emerald-700 text-xs font-bold border border-emerald-200 transition-colors cursor-pointer"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Ouvrir Guichet Client</span>
                    </Link>
                  )}
                </div>
              ) : (
                filteredConversations.map((conv) => {
                  const isSelected = activeConv?.id === conv.id;
                  const channel = conv.externalChannel || 'PORTAL';
                  const isWhatsApp = channel.toUpperCase().includes('WHATSAPP');

                  return (
                    <div
                      key={conv.id}
                      onClick={() => {
                        setActiveConvId(conv.id);
                        setIsMobileViewingThread(true);
                      }}
                      className={`p-3.5 sm:p-4 transition-all cursor-pointer flex items-start gap-3 relative active:bg-slate-100/90 ${
                        isSelected
                          ? 'bg-emerald-50/70 border-l-4 border-l-emerald-600'
                          : 'hover:bg-slate-50/80'
                      }`}
                    >
                      {/* Avatar avec badge initiales */}
                      <div className="relative shrink-0">
                        <div
                          className={`w-11 h-11 rounded-2xl font-bold text-xs flex items-center justify-center shadow-xs border ${
                            isSelected
                              ? 'bg-emerald-600 text-white border-emerald-600'
                              : 'bg-emerald-100 text-emerald-800 border-emerald-200'
                          }`}
                        >
                          {conv.customerName.charAt(0).toUpperCase()}
                        </div>
                        <span
                          className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
                            conv.status === 'RESOLVED' || conv.status === 'CLOSED'
                              ? 'bg-slate-400'
                              : conv.status === 'WAITING_CUSTOMER'
                              ? 'bg-amber-400'
                              : 'bg-emerald-500'
                          }`}
                        />
                      </div>

                      {/* Infos conversation */}
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center justify-between gap-1">
                          <h4 className="text-xs font-bold text-slate-900 truncate">
                            {conv.customerName}
                          </h4>
                          <span className="text-[10px] text-slate-400 font-mono shrink-0">
                            {conv.lastMessageAt
                              ? new Date(conv.lastMessageAt).toLocaleTimeString('fr-FR', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })
                              : ''}
                          </span>
                        </div>

                        {/* Aperçu du dernier message sur 2 lignes claires */}
                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                          {conv.lastMessage || 'Nouvelle conversation initialisée'}
                        </p>

                        {/* Badges de métadonnées (Canal, Catégorie, Ticket) */}
                        <div className="flex items-center gap-1.5 pt-0.5">
                          {isWhatsApp ? (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                              WhatsApp
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-cyan-50 text-cyan-700 border border-cyan-200/80">
                              Portail Web
                            </span>
                          )}

                          {conv.category && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-medium bg-slate-100 text-slate-600 truncate max-w-[130px]">
                              {conv.category}
                            </span>
                          )}

                          {conv.ticket && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold font-mono bg-emerald-100 text-emerald-800">
                              #{conv.ticket.reference}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* VOLET 2 : Studio de Discussion Grand Format (Droite) */}
          <div
            className={`flex-1 rounded-2xl sm:rounded-3xl bg-white border border-slate-200/90 flex flex-col min-h-0 overflow-hidden shadow-sm relative ${
              !isMobileViewingThread ? 'hidden md:flex' : 'flex'
            }`}
          >
            {activeConv ? (
              <>
                {/* En-tête de Conversation Spacieux */}
                <div className="p-3 sm:p-4 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                    <button
                      type="button"
                      onClick={() => setIsMobileViewingThread(false)}
                      className="md:hidden p-2 -ml-1 text-slate-600 hover:text-slate-900 active:bg-slate-200 rounded-xl transition-colors cursor-pointer shrink-0"
                      title="Retour à la liste"
                      aria-label="Retour à la liste des conversations"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>

                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs sm:text-sm border border-emerald-200 shrink-0">
                      {activeConv.customerName.charAt(0).toUpperCase()}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <h3 className="text-xs sm:text-sm font-bold text-slate-900 truncate max-w-[110px] xs:max-w-[160px] sm:max-w-none">
                          {activeConv.customerName}
                        </h3>
                        <span className="px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                          {activeConv.externalChannel || 'Portail SAV'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 truncate flex items-center gap-2">
                        {activeConv.customerPhone && (
                          <span className="font-mono text-slate-600">{activeConv.customerPhone}</span>
                        )}
                        {activeConv.customerEmail && (
                          <span className="text-slate-400 hidden sm:inline">• {activeConv.customerEmail}</span>
                        )}
                        {activeConv.category && (
                          <span className="px-1.5 py-0.2 rounded bg-slate-200 text-slate-700 text-[10px] font-medium hidden xs:inline">
                            {activeConv.category}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Actions d'en-tête (Dossier Client / Résoudre) */}
                  <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                    <span
                      className={`px-2 sm:px-2.5 py-1 rounded-xl text-[11px] sm:text-xs font-bold ${
                        activeConv.status === 'RESOLVED'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : activeConv.status === 'WAITING_CUSTOMER'
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : 'bg-cyan-100 text-cyan-800 border border-cyan-200'
                      }`}
                    >
                      {activeConv.status}
                    </span>

                    {/* Bouton pour afficher/masquer le volet Fiche Client & Ticket */}
                    <button
                      type="button"
                      onClick={() => setIsCustomerPanelOpen(!isCustomerPanelOpen)}
                      className={`p-2 sm:px-3 sm:py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border shrink-0 ${
                        isCustomerPanelOpen
                          ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100 active:bg-slate-200'
                      }`}
                      title="Afficher ou masquer la fiche client et les détails du dossier"
                      aria-label="Afficher ou masquer la fiche client et les détails du dossier"
                    >
                      <FolderKanban className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-emerald-500" />
                      <span className="hidden sm:inline">Dossier client</span>
                    </button>
                  </div>
                </div>

                {/* Notification alert dans le fil */}
                {feedback && (
                  <div
                    className={`px-3 sm:px-4 py-2 text-xs font-semibold flex items-center justify-between ${
                      feedback.type === 'success'
                        ? 'bg-emerald-50 text-emerald-800 border-b border-emerald-100'
                        : 'bg-rose-50 text-rose-800 border-b border-rose-100'
                    }`}
                  >
                    <span>{feedback.text}</span>
                    <button onClick={() => setFeedback(null)} className="p-1 cursor-pointer">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* Fil des messages grand format */}
                <div
                  ref={threadScrollContainerRef}
                  className="flex-1 p-3.5 sm:p-5 overflow-y-auto overscroll-contain space-y-3 sm:space-y-4 scrollbar-thin scrollbar-thumb-slate-200 bg-[#F8FAFC]/70"
                >
                  <div className="flex items-center justify-center my-2">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider bg-white border border-slate-200 px-3 py-0.5 rounded-full shadow-2xs">
                      Historique de conversation certifié
                    </span>
                  </div>

                  {loadingThread && activeThreadMessages.length === 0 ? (
                    <div className="py-16 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
                      <span>Chargement du fil complet...</span>
                    </div>
                  ) : activeThreadMessages && activeThreadMessages.length > 0 ? (
                    activeThreadMessages.map((m) => {
                      if (m.isInternalNote) {
                        return (
                          <div key={m.id} className="flex justify-center my-3">
                            <div className="w-full max-w-[92%] p-3.5 rounded-2xl bg-amber-50/90 border border-amber-200 text-amber-900 shadow-2xs space-y-1">
                              <div className="flex items-center justify-between text-[11px] font-bold text-amber-800">
                                <span className="flex items-center gap-1.5">
                                  <Lock className="w-3.5 h-3.5 text-amber-600" />
                                  <span>NOTE INTERNE (Confidentielle — Non visible par le client)</span>
                                </span>
                                <span className="text-[10px] text-amber-600 font-normal">
                                  {new Date(m.createdAt).toLocaleTimeString('fr-FR', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </span>
                              </div>
                              <p className="text-xs leading-relaxed whitespace-pre-wrap">{m.content}</p>
                              <p className="text-[10px] text-amber-600">
                                Auteur : {m.senderName || 'Agent SAV'}
                              </p>
                            </div>
                          </div>
                        );
                      }

                      const isCustomer = m.senderType === 'CUSTOMER';
                      const isAi = m.senderType === 'AI';

                      return (
                        <div
                          key={m.id}
                          className={`flex flex-col ${isCustomer ? 'items-start' : 'items-end'}`}
                        >
                          <div className="flex items-center gap-1.5 mb-1 text-[10px] text-slate-400 px-1 font-medium">
                            {isAi && <Bot className="w-3 h-3 text-emerald-600" />}
                            <span>{m.senderName || (isCustomer ? 'Client' : 'Agent SAV')}</span>
                            <span>•</span>
                            <span>
                              {new Date(m.createdAt).toLocaleTimeString('fr-FR', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>

                          <div
                            className={`max-w-[85%] sm:max-w-[70%] p-3.5 sm:p-4 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-xs ${
                              isCustomer
                                ? 'bg-white text-slate-900 rounded-tl-xs border border-slate-200'
                                : isAi
                                ? 'bg-emerald-50 text-slate-900 rounded-tr-xs border border-emerald-200'
                                : 'bg-[#0D1B3D] text-white rounded-tr-xs'
                            }`}
                          >
                            <p className="whitespace-pre-line">{m.content}</p>
                            {!isCustomer && (
                              <div className="flex items-center justify-end gap-1 mt-1.5 text-[9px] text-white/70">
                                <CheckCheck className="w-3 h-3 text-emerald-400" />
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="py-16 text-center text-xs text-slate-400">
                      Aucun message consigné pour cette conversation.
                    </div>
                  )}
                  <div ref={threadEndRef} />
                </div>

                {/* Formulaire de réponse et note interne confortable */}
                <form
                  onSubmit={handleSendMessage}
                  className={`p-3 sm:p-4 border-t border-slate-100 bg-white space-y-2.5 sm:space-y-3 shrink-0 ${
                    isInternalNote ? 'bg-amber-50/40' : ''
                  }`}
                  style={{
                    paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom, 0px))',
                  }}
                >
                  <div className="flex items-center justify-between text-xs gap-2">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <button
                        type="button"
                        onClick={() => setIsInternalNote(false)}
                        className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          !isInternalNote
                            ? 'bg-[#0D1B3D] text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200 active:bg-slate-300'
                        }`}
                      >
                        Réponse Client
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsInternalNote(true)}
                        className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                          isInternalNote
                            ? 'bg-amber-500 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200 active:bg-slate-300'
                        }`}
                      >
                        <Lock className="w-3 h-3" />
                        <span>Note Interne</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      {isInternalNote && (
                        <span className="text-[11px] font-semibold text-amber-700 flex items-center gap-1 mr-1">
                          <Info className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span className="hidden sm:inline">Invisible pour le client</span>
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => setIsCannedResponsesModalOpen(true)}
                        className="px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200/80 hover:bg-emerald-100 active:bg-emerald-200 flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs shrink-0"
                        title="Insérer une réponse type enregistrée"
                      >
                        <Zap className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="hidden xs:inline">Réponses types</span>
                      </button>
                    </div>
                  </div>

                  <div className="relative">
                    <input
                      type="text"
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder={
                        isInternalNote
                          ? "Ajouter une note interne confidentielle pour l'équipe SAV..."
                          : "Rédiger une réponse client enregistrée dans Zadesk..."
                      }
                      className={`w-full pl-3.5 sm:pl-4 pr-12 py-3 sm:py-3.5 text-xs sm:text-sm rounded-2xl focus:outline-none focus:ring-2 transition-all ${
                        isInternalNote
                          ? 'bg-amber-50 border border-amber-200 text-amber-950 focus:ring-amber-500/30'
                          : 'bg-slate-50 border border-slate-200 text-slate-900 focus:ring-emerald-500/20'
                      }`}
                    />
                    <button
                      type="submit"
                      disabled={!replyText.trim() || sendingMessage}
                      className={`absolute right-1.5 sm:right-2 top-1/2 -translate-y-1/2 p-2 sm:p-2.5 rounded-xl text-white disabled:opacity-30 transition-all cursor-pointer shadow-xs active:scale-95 ${
                        isInternalNote ? 'bg-amber-600 hover:bg-amber-700' : 'bg-[#0D1B3D] hover:bg-[#152B5A]'
                      }`}
                      title={isInternalNote ? 'Enregistrer la note interne' : 'Envoyer le message'}
                      aria-label="Envoyer"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </form>

                {/* Volet coulissant : Fiche Client & Ticket (Rétractable, responsive plein écran sur smartphone) */}
                {isCustomerPanelOpen && (
                  <div className="absolute inset-0 sm:inset-y-0 sm:left-auto sm:right-0 sm:w-85 bg-white border-l border-slate-200 p-4 sm:p-5 flex flex-col justify-between shadow-2xl z-30 animate-in slide-in-from-right duration-200 overscroll-contain">
                    <div className="space-y-5 overflow-y-auto">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                          Dossier Client SAV
                        </span>
                        <button
                          onClick={() => setIsCustomerPanelOpen(false)}
                          className="p-2 rounded-xl text-slate-500 hover:text-slate-800 active:bg-slate-100 cursor-pointer"
                          aria-label="Fermer le dossier client"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="space-y-1">
                        <h4 className="text-sm font-bold text-slate-900">{activeConv.customerName}</h4>
                        <p className="text-xs text-emerald-700 font-mono font-semibold">
                          {activeConv.customerPhone || 'Numéro non renseigné'}
                        </p>
                        {activeConv.customerEmail && (
                          <p className="text-xs text-slate-500">{activeConv.customerEmail}</p>
                        )}
                      </div>

                      {/* Responsable */}
                      <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1 text-xs">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                          Responsable Zadesk
                        </span>
                        <div className="flex items-center gap-2">
                          <UserCheck className="w-4 h-4 text-emerald-600" />
                          <span className="font-bold text-slate-800">
                            {activeConv.assignedAgent?.user
                              ? `${activeConv.assignedAgent.user.firstName || ''} ${activeConv.assignedAgent.user.lastName || ''}`
                              : 'Non assigné'}
                          </span>
                        </div>
                      </div>

                      {/* Ticket de continuité */}
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                          Ticket de Continuité
                        </span>
                        {activeConv.ticket ? (
                          <Link
                            href={`/app/tickets?ticketId=${activeConv.ticket.id}`}
                            className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-200 block space-y-1 group hover:border-emerald-300 transition-all"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-mono text-xs font-bold text-emerald-800">
                                {activeConv.ticket.reference}
                              </span>
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                                {activeConv.ticket.status}
                              </span>
                            </div>
                            <p className="text-xs text-slate-700 font-semibold group-hover:text-emerald-800 transition-colors">
                              {activeConv.ticket.title}
                            </p>
                            <span className="text-[10px] text-emerald-600 flex items-center gap-1 pt-1">
                              <span>Consulter le dossier</span>
                              <ExternalLink className="w-3 h-3" />
                            </span>
                          </Link>
                        ) : (
                          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-center space-y-2">
                            <p className="text-xs text-slate-500">Aucun ticket relié.</p>
                            <button
                              onClick={() => setIsLinkTicketModalOpen(true)}
                              className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 mx-auto cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Créer un ticket</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100">
                      <Link
                        href="/app/tickets"
                        className="w-full py-2.5 px-3.5 rounded-2xl bg-[#0D1B3D] hover:bg-[#152B5A] text-xs font-bold text-white transition-all flex items-center justify-center gap-2 shadow-sm"
                      >
                        <FolderKanban className="w-4 h-4 text-emerald-400" />
                        <span>Tous les tickets</span>
                      </Link>
                    </div>
                  </div>
                )}
              </>
            ) : (
              /* État vide accueillant lorsqu'aucune conversation n'est sélectionnée */
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shadow-sm">
                  <MessageSquare className="w-8 h-8 text-emerald-600" />
                </div>
                <div className="max-w-xs space-y-1">
                  <h3 className="text-sm font-bold text-slate-900">
                    Sélectionnez une conversation
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Cliquez sur un client dans la boîte de réception à gauche pour ouvrir son fil complet et lui répondre en direct.
                  </p>
                </div>
                {currentWorkspace?.slug && (
                  <Link
                    href={`/entreprises/${currentWorkspace.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Tester le Guichet SAV Client</span>
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL : CRÉER UN TICKET DEPUIS LA CONVERSATION             */}
      {/* ========================================================= */}
      {isLinkTicketModalOpen && activeConv && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Créer un ticket de suivi</h3>
                <p className="text-xs text-slate-500">Pour le client {activeConv.customerName}</p>
              </div>
              <button
                onClick={() => setIsLinkTicketModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleLinkTicket} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Objet du ticket *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Réclamation litige livraison colis #ZD-920"
                  value={ticketTitle}
                  onChange={(e) => setTicketTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Priorité *
                </label>
                <select
                  value={ticketPriority}
                  onChange={(e) => setTicketPriority(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer"
                >
                  <option value="LOW">Basse</option>
                  <option value="MEDIUM">Moyenne</option>
                  <option value="HIGH">Élevée</option>
                  <option value="URGENT">Urgente</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsLinkTicketModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={creatingTicket}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-bold shadow-md shadow-emerald-500/20 transition-all cursor-pointer disabled:opacity-50"
                >
                  {creatingTicket ? 'Création...' : 'Créer et Relier'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Canned Responses Modal */}
      {isCannedResponsesModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 flex flex-col max-h-[85vh] animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-700 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Réponses enregistrées</h3>
                  <p className="text-[11px] text-slate-500">
                    Cliquez sur un modèle pour l'insérer directement dans votre zone de saisie.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCannedResponsesModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search & Category filter */}
            <div className="py-3.5 space-y-2.5 shrink-0">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Rechercher par titre, mot-clé ou raccourci..."
                  value={cannedSearchTerm}
                  onChange={(e) => setCannedSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-slate-800"
                  autoFocus
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
                {[
                  { id: 'ALL', label: 'Toutes' },
                  { id: 'Accueil', label: 'Accueil' },
                  { id: 'Informations générales', label: 'Infos' },
                  { id: 'Suivi des demandes', label: 'Suivi' },
                  { id: 'Délais de traitement', label: 'Délais' },
                  { id: 'Réclamations', label: 'Réclamations' },
                  { id: 'Clôture de conversation', label: 'Clôture' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCannedCategoryFilter(cat.id)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                      cannedCategoryFilter === cat.id
                        ? 'bg-[#0D1B3D] text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 min-h-[220px]">
              {filteredCannedResponses.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  Aucune réponse trouvée pour cette recherche.
                </div>
              ) : (
                filteredCannedResponses.map((cr: any) => (
                  <div
                    key={cr.id}
                    onClick={() => handleSelectCanned(cr.content)}
                    className="p-3.5 rounded-2xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/30 transition-all cursor-pointer group text-left"
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-800 group-hover:text-emerald-900 transition-colors">
                          {cr.title}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 group-hover:bg-emerald-100 text-slate-600 group-hover:text-emerald-800 font-semibold transition-colors">
                          {cr.category}
                        </span>
                      </div>
                      {cr.shortcut && (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600 font-bold border border-slate-200">
                          {cr.shortcut}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {cr.content}
                    </p>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 shrink-0">
              <span>{filteredCannedResponses.length} modèle(s) disponible(s)</span>
              <Link
                href="/app/settings?tab=canned"
                onClick={() => setIsCannedResponsesModalOpen(false)}
                className="text-emerald-700 font-bold hover:underline flex items-center gap-1"
              >
                <span>Configurer les réponses dans Paramètres</span>
                <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ConversationsView;
