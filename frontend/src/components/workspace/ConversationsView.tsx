'use client';

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import Link from 'next/link';
import {
  MessageSquare,
  Search,
  Layers,
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
import gsap from 'gsap';
import { motion, AnimatePresence } from 'motion/react';
import {
  Surface,
  Hairline,
  Pressable,
  StatusPill,
  EmptyState,
} from '@/components/workspace/design-system';
import {
  PulseConstellationCanvas,
  PulseCanvasMessageEvent,
  PulseCanvasNewNodeEvent,
} from '@/components/pulse/PulseConstellationCanvas';
import { PulseConversationDrawer } from '@/components/pulse/PulseConversationDrawer';
import {
  PulseReadStore,
  getPulseReadStorageKey,
  loadPulseReadStore,
  savePulseReadStore,
  computeConversationUnreadCount,
  markConversationAsReadInStore,
  incrementConversationUnreadInStore,
  matchesConversationFilter,
  matchesConversationSearch,
  applyIncomingPulseEventToConversations,
  getConversationPreview,
  getConversationLastTimestamp,
} from '@/components/pulse/pulseState';

export interface ConversationsViewProps {
  previewConversations?: AgentConversationItem[];
}

export function ConversationsView({ previewConversations }: ConversationsViewProps = {}) {
  const {
    currentWorkspace,
    userRole,
    user,
    sseStatus: globalSseStatus,
    setActiveViewedConversationId,
    dismissPulseConversationNotifications,
  } = useWorkspace();
  const [conversations, setConversations] = useState<AgentConversationItem[]>(previewConversations || []);
  const [activeConvId, setActiveConvId] = useState<string | null>(previewConversations?.[0]?.id || null);
  const [loading, setLoading] = useState(!previewConversations);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Mode de visualisation : Cockpit Opérationnel (Défaut) vs Constellation Pulse
  const [viewMode, setViewMode] = useState<'classic' | 'pulse'>('classic');
  const [isPulseDrawerOpen, setIsPulseDrawerOpen] = useState(false);
  const [pulseEvent, setPulseEvent] = useState<PulseCanvasMessageEvent | null>(null);
  const [newNodeEvent, setNewNodeEvent] = useState<PulseCanvasNewNodeEvent | null>(null);

  // Persistance des statuts lu/non-lu par espace & utilisateur
  const readStorageKey = useMemo(
    () => (previewConversations ? null : getPulseReadStorageKey(currentWorkspace?.id, user?.id)),
    [previewConversations, currentWorkspace?.id, user?.id]
  );
  const [readStore, setReadStore] = useState<PulseReadStore>({ readAt: {}, unreadCounts: {} });

  useEffect(() => {
    setReadStore(loadPulseReadStore(readStorageKey));
  }, [readStorageKey]);

  const unreadCounts = useMemo(() => {
    const map: Record<string, number> = {};
    conversations.forEach((conv) => {
      map[conv.id] = computeConversationUnreadCount(conv, readStore);
    });
    return map;
  }, [conversations, readStore]);

  const markConversationRead = useCallback(
    (conversationId: string, timestampMs?: number) => {
      if (!conversationId) return;
      setReadStore((prev) => {
        const next = markConversationAsReadInStore(prev, conversationId, timestampMs);
        savePulseReadStore(readStorageKey, next);
        return next;
      });
    },
    [readStorageKey]
  );
  // Volet Fiche Client & Ticket (ouvert par défaut sur Desktop >= 1280px)
  const [isCustomerPanelOpen, setIsCustomerPanelOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth >= 1280) {
      setIsCustomerPanelOpen(true);
    }
  }, []);

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
  const processedPulseEventIdsRef = useRef<Set<string>>(new Set());
  const isThreadActivelyVisible =
    Boolean(activeConvId) &&
    (viewMode === 'pulse'
      ? isPulseDrawerOpen
      : isMobileViewingThread || (typeof window !== 'undefined' && window.innerWidth >= 768));
  const isThreadActivelyVisibleRef = useRef(isThreadActivelyVisible);
  isThreadActivelyVisibleRef.current = isThreadActivelyVisible;

  // Deep-link ?id=<conversationId> (depuis une notification Push ou Email)
  useEffect(() => {
    if (previewConversations || typeof window === 'undefined') return;
    const convParam = new URLSearchParams(window.location.search).get('id');
    if (convParam) {
      setActiveConvId(convParam);
      activeConvIdRef.current = convParam;
      if (window.innerWidth < 768) {
        setIsMobileViewingThread(true);
      }
    }
  }, [previewConversations]);

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
        const rawItems = Array.isArray(data) ? data : ((data as any)?.conversations || []);
        const uniqueById = new Map<string, AgentConversationItem>();
        rawItems.forEach((item: AgentConversationItem) => {
          if (item && item.id) uniqueById.set(item.id, item);
        });
        const items = Array.from(uniqueById.values());
        setConversations(items);
        if (items.length > 0) {
          const targetId = selectId || activeConvIdRef.current;
          if (targetId && items.some((c: any) => c.id === targetId)) {
            setActiveConvId(targetId);
          } else if (!activeConvIdRef.current) {
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

  // Orchestration GSAP d'arrivée des messages dans le fil de discussion
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || !threadScrollContainerRef.current) return;

    const bubbles = threadScrollContainerRef.current.querySelectorAll('.conversation-bubble');
    if (bubbles.length > 0) {
      gsap.fromTo(
        bubbles,
        { opacity: 0, y: 6 },
        { opacity: 1, y: 0, duration: 0.3, stagger: 0.03, ease: 'power2.out' }
      );
    }
  }, [activeConvId, activeThreadMessages.length]);

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

  // Flux SSE temps réel avec déduplication stricte et mise à jour incrémentale
  const handlePulseEvent = useCallback(
    (event: any) => {
      if (!event || !event.type) return;
      if (event.id) {
        if (processedPulseEventIdsRef.current.has(event.id)) {
          return;
        }
        processedPulseEventIdsRef.current.add(event.id);
        if (processedPulseEventIdsRef.current.size > 250) {
          const first = processedPulseEventIdsRef.current.values().next().value;
          if (first) processedPulseEventIdsRef.current.delete(first);
        }
      }

      if (event.type === 'PULSE_MESSAGE_CREATED' && event.conversationId) {
        const isClientMessage =
          typeof event.isClientMessage === 'boolean'
            ? event.isClientMessage
            : event.senderType === 'CUSTOMER';
        const isCurrentlyViewed =
          activeConvIdRef.current === event.conversationId && isThreadActivelyVisibleRef.current;

        setConversations((prev) => applyIncomingPulseEventToConversations(prev, event));

        if (isClientMessage && !event.isInternalNote) {
          if (isCurrentlyViewed) {
            const msgTs = event.timestamp ? new Date(event.timestamp).getTime() : Date.now();
            markConversationRead(event.conversationId, msgTs);
          } else {
            setReadStore((prev) => {
              const next = incrementConversationUnreadInStore(prev, event.conversationId);
              savePulseReadStore(readStorageKey, next);
              return next;
            });
          }
        } else if (!event.isInternalNote && event.senderType !== 'AI') {
          markConversationRead(event.conversationId);
        }

        setPulseEvent({
          eventId: event.id,
          conversationId: event.conversationId,
          timestamp: Date.now(),
          isClientMessage,
          senderType: event.senderType,
        });

        fetchConversations(undefined, true);
        if (event.conversationId === activeConvIdRef.current) {
          loadActiveConversationThread(event.conversationId, true);
        }
      } else if (event.type === 'PULSE_CONVERSATION_CREATED' && event.conversationId) {
        setConversations((prev) => applyIncomingPulseEventToConversations(prev, event));
        setReadStore((prev) => {
          const next = incrementConversationUnreadInStore(prev, event.conversationId);
          savePulseReadStore(readStorageKey, next);
          return next;
        });
        setNewNodeEvent({
          eventId: event.id,
          conversationId: event.conversationId,
          timestamp: Date.now(),
        });
        // Conserver la conversation en cours de lecture sans voler le focus de l'agent
        fetchConversations(undefined, true);
      } else if (event.type === 'PULSE_CONVERSATION_READ' && event.conversationId) {
        markConversationRead(event.conversationId);
        fetchConversations(undefined, true);
      } else if (event.type === 'PULSE_CONVERSATION_UPDATED') {
        fetchConversations(undefined, true);
      }
    },
    [
      fetchConversations,
      loadActiveConversationThread,
      markConversationRead,
      readStorageKey,
    ]
  );

  const handleFullSync = useCallback(async () => {
    await fetchConversations(undefined, true);
    if (activeConvIdRef.current) {
      await loadActiveConversationThread(activeConvIdRef.current, true);
    }
  }, [fetchConversations, loadActiveConversationThread]);

  const sseStatus = previewConversations ? 'connected' : globalSseStatus;

  // Informer le contexte global & marquer la conversation comme lue uniquement lorsque le fil est visible
  useEffect(() => {
    if (previewConversations) return;
    if (activeConvId && isThreadActivelyVisible) {
      setActiveViewedConversationId(activeConvId);
      dismissPulseConversationNotifications(activeConvId);
      const current = conversations.find((c) => c.id === activeConvId);
      const latestTs = current ? getConversationLastTimestamp(current) : Date.now();
      markConversationRead(activeConvId, latestTs);
    } else {
      setActiveViewedConversationId(null);
    }
    return () => {
      setActiveViewedConversationId(null);
    };
  }, [
    activeConvId,
    isThreadActivelyVisible,
    previewConversations,
    conversations,
    setActiveViewedConversationId,
    dismissPulseConversationNotifications,
    markConversationRead,
  ]);

  // S'abonner au flux Pulse global diffusé par WorkspaceContext
  useEffect(() => {
    if (previewConversations || typeof window === 'undefined') return;
    const onPulseEvent = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail) handlePulseEvent(detail);
    };
    const onPulseSync = () => {
      handleFullSync();
    };
    const onSelectConv = (e: Event) => {
      const convId = (e as CustomEvent).detail?.conversationId;
      if (convId) {
        setActiveConvId(convId);
        setIsMobileViewingThread(true);
        if (viewMode === 'pulse') {
          setIsPulseDrawerOpen(true);
        }
      }
    };

    window.addEventListener('zadesk:pulse-event', onPulseEvent);
    window.addEventListener('zadesk:pulse-sync', onPulseSync);
    window.addEventListener('zadesk:select-conversation', onSelectConv);
    return () => {
      window.removeEventListener('zadesk:pulse-event', onPulseEvent);
      window.removeEventListener('zadesk:pulse-sync', onPulseSync);
      window.removeEventListener('zadesk:select-conversation', onSelectConv);
    };
  }, [previewConversations, handlePulseEvent, handleFullSync, viewMode]);

  const activeConv = conversations.find((c) => c.id === activeConvId) || conversations[0] || null;

  // Modèle enrichi avec le fil de discussion complet
  const activeConvWithThread = activeConv
    ? {
        ...activeConv,
        messages: activeThreadMessages.length > 0 ? activeThreadMessages : (activeConv.messages || []),
      }
    : null;

  const handleDrawerSendMessage = async (text: string, internalNote: boolean): Promise<boolean> => {
    if (!activeConv || sendingMessage) return false;
    setSendingMessage(true);
    setFeedback(null);

    if (previewConversations) {
      const newMsg = {
        id: `preview-msg-${Date.now()}`,
        senderType: (internalNote ? 'INTERNAL_NOTE' : 'AGENT') as 'INTERNAL_NOTE' | 'AGENT',
        senderName: user?.firstName ? `${user.firstName} ${user.lastName || ''}` : 'Agent SAV',
        content: text.trim(),
        createdAt: new Date().toISOString(),
        isInternalNote: internalNote,
      };
      setActiveThreadMessages((prev) => [...prev, newMsg]);
      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeConv.id
            ? {
                ...c,
                lastMessage: internalNote ? c.lastMessage : text.trim(),
                lastMessageAt: newMsg.createdAt,
                messages: [...(c.messages || []), newMsg],
              }
            : c
        )
      );
      markConversationRead(activeConv.id, Date.now());
      setSendingMessage(false);
      return true;
    }

    if (!currentWorkspace) {
      setSendingMessage(false);
      return false;
    }

    const tempId = `temp-${Date.now()}`;
    const optimisticMsg = {
      id: tempId,
      senderType: (internalNote ? 'INTERNAL_NOTE' : 'AGENT') as any,
      senderName: user?.firstName ? `${user.firstName} ${user.lastName || ''}` : 'Agent SAV',
      content: text.trim(),
      createdAt: new Date().toISOString(),
      isInternalNote: internalNote,
    };
    setActiveThreadMessages((prev) => [...prev, optimisticMsg]);
    try {
      await agentApi.sendMessage(currentWorkspace.id, activeConv.id, {
        content: text.trim(),
        isInternalNote: internalNote,
      });
      markConversationRead(activeConv.id, Date.now());
      await Promise.all([
        fetchConversations(activeConv.id, true),
        loadActiveConversationThread(activeConv.id, true),
      ]);
      return true;
    } catch (err: any) {
      setActiveThreadMessages((prev) => prev.filter((m) => m.id !== tempId));
      setFeedback({
        type: 'error',
        text: err?.message || "Impossible d'envoyer le message pour le moment.",
      });
      return false;
    } finally {
      setSendingMessage(false);
    }
  };

  const filteredConversations = conversations.filter((c) => {
    const unread = unreadCounts[c.id] ?? 0;
    return (
      matchesConversationFilter(c, unread, filterStatus) &&
      matchesConversationSearch(c, searchTerm)
    );
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
          : 'Message transmis au client via Zalisk.',
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

      markConversationRead(activeConv.id, Date.now());
      await Promise.all([
        fetchConversations(activeConv.id, true),
        loadActiveConversationThread(activeConv.id, true),
      ]);
      setFeedback({
        type: 'success',
        text: isInternalNote
          ? 'Note interne confidentielle enregistrée.'
          : 'Message enregistré sur la plateforme Zalisk.',
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
    <div className="h-[calc(100dvh-5.5rem)] sm:h-[calc(100dvh-6.5rem)] flex flex-col space-y-3">
      {/* Barre d'outils compacte (sans en-tête redondant) */}
      <div className={`flex flex-wrap items-center justify-between gap-2.5 shrink-0 ${
        isMobileViewingThread ? 'hidden md:flex' : 'flex'
      }`}>
        <div className="inline-flex items-center p-0.5 bg-[#F4F3EF] rounded-lg border border-[#E5E4DF] shrink-0">
          <button
            type="button"
            onClick={() => setViewMode('classic')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
              viewMode === 'classic'
                ? 'bg-white text-[#0D1B3D] font-semibold shadow-sm'
                : 'text-slate-600 hover:text-[#0D1B3D]'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Boîte de réception</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setViewMode('pulse');
              setIsPulseDrawerOpen(false);
            }}
            className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
              viewMode === 'pulse'
                ? 'bg-white text-[#0D1B3D] font-semibold shadow-sm'
                : 'text-slate-600 hover:text-[#0D1B3D]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Constellation Pulse</span>
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {!previewConversations && (
            <div
              className="px-2.5 h-8 rounded-lg text-[11px] font-medium flex items-center gap-1.5 border border-[#E5E4DF] bg-white text-slate-600"
              title={
                sseStatus === 'connected'
                  ? 'Connecté au flux temps réel'
                  : sseStatus === 'connecting'
                  ? 'Connexion en cours...'
                  : 'Hors ligne'
              }
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  sseStatus === 'connected'
                    ? 'bg-[#22C55E]'
                    : sseStatus === 'connecting'
                    ? 'bg-amber-500'
                    : 'bg-slate-300'
                }`}
              />
              <span className="hidden sm:inline">
                {sseStatus === 'connected'
                  ? 'Flux temps réel'
                  : sseStatus === 'connecting'
                  ? 'Connexion…'
                  : 'Hors ligne'}
              </span>
            </div>
          )}

          {currentWorkspace?.slug && (
            <Link
              href={`/entreprises/${currentWorkspace.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 h-8 rounded-lg bg-white hover:bg-[#F4F3EF] text-[#0D1B3D] border border-[#E5E4DF] text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Ouvrir le guichet SAV public"
            >
              <span>Guichet public</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </Link>
          )}

          <button
            type="button"
            onClick={() => fetchConversations()}
            className="w-8 h-8 rounded-lg bg-white hover:bg-[#F4F3EF] text-slate-600 border border-[#E5E4DF] cursor-pointer flex items-center justify-center transition-colors"
            title="Actualiser les conversations"
            aria-label="Actualiser les conversations"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#0D1B3D]' : ''}`} />
          </button>
        </div>
      </div>

      {viewMode === 'pulse' ? (
        /* ========================================================= */
        /* VUE CONSTELLATION PULSE 3D (Plein espace + Drawer overlay) */
        /* ========================================================= */
        <Surface
          variant="panel"
          className="flex-1 min-h-0 relative rounded-xl overflow-hidden border border-[#E5E4DF] bg-[#FAFAF8]"
        >
          <PulseConstellationCanvas
            conversations={conversations}
            unreadCounts={unreadCounts}
            activeConversationId={activeConvId}
            onSelectConversation={(id) => {
              setActiveConvId(id);
              const selected = conversations.find((c) => c.id === id);
              markConversationRead(id, selected ? getConversationLastTimestamp(selected) : Date.now());
            }}
            onOpenConversation={(id) => {
              setActiveConvId(id);
              setIsPulseDrawerOpen(true);
              const selected = conversations.find((c) => c.id === id);
              markConversationRead(id, selected ? getConversationLastTimestamp(selected) : Date.now());
            }}
            pulseEvent={pulseEvent}
            newNodeEvent={newNodeEvent}
            searchTerm={searchTerm}
            onSearchTermChange={setSearchTerm}
            statusFilter={filterStatus}
            onStatusFilterChange={setFilterStatus}
            isDrawerOpen={isPulseDrawerOpen && Boolean(activeConvWithThread)}
            onResetFilters={() => {
              setSearchTerm('');
              setFilterStatus('ALL');
            }}
          />

          <PulseConversationDrawer
            conversation={activeConvWithThread}
            isOpen={isPulseDrawerOpen && Boolean(activeConvWithThread)}
            onClose={() => setIsPulseDrawerOpen(false)}
            onSendMessage={handleDrawerSendMessage}
            sendingMessage={sendingMessage}
            loadingThread={loadingThread}
            feedback={feedback}
            onDismissFeedback={() => setFeedback(null)}
            cannedResponses={cannedResponsesList}
            onOpenLinkTicketModal={() => setIsLinkTicketModalOpen(true)}
          />
        </Surface>
      ) : (
        /* ========================================================= */
        /* VUE CLASSIQUE : COCKPIT DE MESSAGERIE DUAL-PANE (2 Volets) */
        /* ========================================================= */
        <div className="flex-1 flex flex-col md:flex-row gap-3 min-h-0 overflow-hidden">
          {/* VOLET 1 : Liste des files (sobre, filets #E5E4DF, zéro empilement de badges) */}
          <Surface
            variant="panel"
            className={`w-full md:w-[310px] lg:w-[330px] flex flex-col min-h-0 overflow-hidden shrink-0 rounded-xl border border-[#E5E4DF] ${
              isMobileViewingThread ? 'hidden md:flex' : 'flex'
            }`}
          >
            <div className="p-3 border-b border-[#E5E4DF] space-y-3 shrink-0 bg-white">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Rechercher client, contact, #ticket…"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full h-9 pl-9 pr-3 bg-[#FAFAF8] border border-[#E5E4DF] rounded-lg text-xs focus:outline-none focus:border-[#0D1B3D] text-[#0D1B3D] placeholder:text-slate-400"
                />
              </div>

              <div className="flex items-center gap-3.5 overflow-x-auto overscroll-contain scrollbar-none -mb-3 border-b border-transparent text-xs">
                {[
                  { id: 'ALL', label: 'Toutes' },
                  { id: 'UNREAD', label: 'Non lues' },
                  { id: 'ACTIVE', label: 'En cours' },
                  { id: 'WAITING_CUSTOMER', label: 'Attente' },
                  { id: 'RESOLVED', label: 'Résolues' },
                ].map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setFilterStatus(st.id)}
                    className={`pb-2.5 border-b-2 text-xs transition-colors cursor-pointer whitespace-nowrap ${
                      filterStatus === st.id
                        ? 'border-[#0D1B3D] text-[#0D1B3D] font-semibold'
                        : 'border-transparent text-slate-500 hover:text-[#0D1B3D] font-medium'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto overscroll-contain divide-y divide-[#F0EFEA]">
              {loading ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  <RefreshCw className="w-5 h-5 animate-spin text-[#0D1B3D] mx-auto mb-2" />
                  <span>Chargement des conversations…</span>
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400 space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-[#F4F3EF] flex items-center justify-center mx-auto text-slate-400">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <p className="font-medium text-slate-500">Aucune conversation trouvée.</p>
                  {currentWorkspace?.slug && (
                    <Link
                      href={`/entreprises/${currentWorkspace.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-[#FAFAF8] text-[#0D1B3D] text-xs font-medium border border-[#E5E4DF] transition-colors cursor-pointer"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                      <span>Ouvrir le guichet public</span>
                    </Link>
                  )}
                </div>
              ) : (
                filteredConversations.map((conv) => {
                  const isSelected = activeConv?.id === conv.id;
                  const unread = unreadCounts[conv.id] ?? 0;
                  const previewText = getConversationPreview(conv) || 'Nouvelle conversation';
                  const statusLabel =
                    conv.status === 'RESOLVED' || conv.status === 'CLOSED'
                      ? 'Résolue'
                      : conv.status === 'WAITING_CUSTOMER'
                      ? 'Attente client'
                      : conv.status === 'OPEN'
                      ? 'À assigner'
                      : 'En cours';

                  return (
                    <button
                      key={conv.id}
                      type="button"
                      onClick={() => {
                        setActiveConvId(conv.id);
                        setIsMobileViewingThread(true);
                        markConversationRead(conv.id, getConversationLastTimestamp(conv));
                      }}
                      className={`w-full relative text-left px-3.5 py-3 transition-colors cursor-pointer flex items-start gap-3 ${
                        isSelected ? 'bg-[#FAFAF8]' : 'bg-white hover:bg-[#FAFAF8]/60'
                      }`}
                    >
                      {isSelected && (
                        <span
                          aria-hidden="true"
                          className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r bg-[#0D1B3D]"
                        />
                      )}

                      <div className="relative shrink-0 mt-0.5">
                        <div
                          className={`w-9 h-9 rounded-lg font-bold text-xs flex items-center justify-center ${
                            isSelected
                              ? 'bg-[#0D1B3D] text-white'
                              : 'bg-[#F4F3EF] text-[#0D1B3D]'
                          }`}
                        >
                          {conv.customerName.charAt(0).toUpperCase()}
                        </div>
                        <span
                          className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full ring-2 ring-white ${
                            conv.status === 'RESOLVED' || conv.status === 'CLOSED'
                              ? 'bg-slate-300'
                              : conv.status === 'WAITING_CUSTOMER'
                              ? 'bg-amber-400'
                              : 'bg-[#22C55E]'
                          }`}
                        />
                      </div>

                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className={`text-[13px] truncate ${unread > 0 ? 'font-bold text-[#0D1B3D]' : 'font-semibold text-[#0D1B3D]'}`}>
                            {conv.customerName}
                          </h4>
                          <div className="flex items-center gap-1.5 shrink-0">
                            {unread > 0 && (
                              <span className="px-1.5 py-0.5 rounded-full bg-[#22C55E] text-white text-[10px] font-bold tabular-nums leading-none">
                                {unread > 99 ? '99+' : unread}
                              </span>
                            )}
                            <span className="text-[11px] text-slate-400 tabular-nums">
                              {conv.lastMessageAt
                                ? new Date(conv.lastMessageAt).toLocaleTimeString('fr-FR', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })
                                : ''}
                            </span>
                          </div>
                        </div>

                        <p className="text-xs text-slate-500 line-clamp-1">
                          {previewText}
                        </p>

                        <div className="flex items-center justify-between pt-0.5 text-[11px] text-slate-400">
                          <span className="truncate">
                            {statusLabel}
                            {conv.category ? ` · ${conv.category}` : ''}
                          </span>
                          {conv.ticket && (
                            <span className="font-mono text-slate-600 font-medium shrink-0 ml-2">
                              {conv.ticket.reference}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </Surface>

          {/* VOLET 2 : Fil de discussion central (Canvas Lin #FAFAF8 + Blanc + Midnight Navy) */}
          <Surface
            variant="panel"
            className={`flex-1 flex flex-col min-h-0 overflow-hidden rounded-xl border border-[#E5E4DF] relative ${
              !isMobileViewingThread ? 'hidden md:flex' : 'flex'
            }`}
          >
            {activeConv ? (
              <>
                <div className="px-4 h-14 border-b border-[#E5E4DF] bg-white flex items-center justify-between shrink-0 z-10">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <button
                      type="button"
                      onClick={() => setIsMobileViewingThread(false)}
                      className="md:hidden w-9 h-9 -ml-1.5 text-slate-600 hover:text-[#0D1B3D] hover:bg-[#F4F3EF] rounded-lg flex items-center justify-center transition-colors cursor-pointer shrink-0 touch-manipulation"
                      title="Retour à la liste"
                      aria-label="Retour à la liste des conversations"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>

                    <div className="w-8 h-8 rounded-lg bg-[#0D1B3D] text-white flex items-center justify-center font-bold text-xs shrink-0">
                      {activeConv.customerName.charAt(0).toUpperCase()}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-[#0D1B3D] truncate">
                          {activeConv.customerName}
                        </h3>
                        <span className="text-[11px] text-slate-400 shrink-0 hidden sm:inline">
                          · Guichet Web
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate flex items-center gap-1.5">
                        {activeConv.customerPhone && (
                          <span className="font-mono text-slate-600">{activeConv.customerPhone}</span>
                        )}
                        {activeConv.customerEmail && (
                          <span className="hidden sm:inline">· {activeConv.customerEmail}</span>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <StatusPill status={activeConv.status} size="sm" />

                    <button
                      type="button"
                      onClick={() => setIsCustomerPanelOpen(!isCustomerPanelOpen)}
                      className={`h-8 px-2.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer border shrink-0 ${
                        isCustomerPanelOpen
                          ? 'bg-[#F4F3EF] text-[#0D1B3D] border-[#0D1B3D]/25 font-semibold'
                          : 'bg-white text-slate-600 border-[#E5E4DF] hover:text-[#0D1B3D]'
                      }`}
                      title="Fiche client"
                      aria-label="Afficher ou masquer la fiche client"
                    >
                      <FolderKanban className="w-3.5 h-3.5 text-slate-400" />
                      <span className="hidden sm:inline">Dossier</span>
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

                {/* Fil des messages sur Canvas Lin #FAFAF8 */}
                <div
                  ref={threadScrollContainerRef}
                  className="flex-1 p-4 sm:p-5 overflow-y-auto overscroll-contain space-y-3.5 bg-[#FAFAF8]"
                >
                  {loadingThread && activeThreadMessages.length === 0 ? (
                    <div className="py-16 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-[#0D1B3D]" />
                      <span>Chargement des messages…</span>
                    </div>
                  ) : activeThreadMessages && activeThreadMessages.length > 0 ? (
                    activeThreadMessages.map((m) => {
                      if (m.isInternalNote) {
                        return (
                          <div key={m.id} className="conversation-bubble flex justify-center my-2">
                            <div className="w-full max-w-xl p-3 rounded-lg bg-[#FDF8EC] border border-[#F2E2B8] border-l-[3px] border-l-amber-600 text-amber-950 space-y-1">
                              <div className="flex items-center justify-between text-[11px] font-semibold text-amber-900">
                                <span className="flex items-center gap-1.5">
                                  <Lock className="w-3 h-3 text-amber-700" />
                                  <span>Note interne · {m.senderName || 'Équipe SAV'}</span>
                                </span>
                                <span className="text-[11px] text-amber-700/75 tabular-nums font-normal">
                                  {new Date(m.createdAt).toLocaleTimeString('fr-FR', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </span>
                              </div>
                              <p className="text-xs leading-relaxed whitespace-pre-wrap">{m.content}</p>
                            </div>
                          </div>
                        );
                      }

                      const isCustomer = m.senderType === 'CUSTOMER';
                      const isAi = m.senderType === 'AI';

                      return (
                        <div
                          key={m.id}
                          className={`conversation-bubble flex flex-col ${isCustomer ? 'items-start' : 'items-end'}`}
                        >
                          <div className="flex items-center gap-1.5 mb-1 text-[11px] text-slate-400 px-1">
                            {isAi && <Bot className="w-3 h-3 text-slate-500" />}
                            <span>{m.senderName || (isCustomer ? 'Client' : 'Agent SAV')}</span>
                            <span>·</span>
                            <span className="tabular-nums">
                              {new Date(m.createdAt).toLocaleTimeString('fr-FR', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>

                          <div
                            className={`max-w-[85%] sm:max-w-[70%] px-4 py-2.5 rounded-xl text-[13px] leading-relaxed ${
                              isCustomer
                                ? 'bg-white text-[#0D1B3D] rounded-bl-sm border border-[#E5E4DF]'
                                : isAi
                                ? 'bg-[#F4F3EF] text-[#0D1B3D] rounded-br-sm border border-[#E5E4DF]'
                                : 'bg-[#0D1B3D] text-white rounded-br-sm'
                            }`}
                          >
                            {m.content && <p className="whitespace-pre-line">{m.content}</p>}
                            {Array.isArray(m.attachments) && m.attachments.length > 0 && (
                              <div className={`${m.content ? 'mt-2.5' : ''} space-y-2`}>
                                {m.attachments.map((att: any) =>
                                  att.isImage && att.url ? (
                                    <a
                                      key={att.id || att.fileName}
                                      href={att.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="block rounded-lg overflow-hidden border border-[#E5E4DF] max-w-[240px]"
                                    >
                                      <img
                                        src={att.url}
                                        alt={att.name || 'Pièce jointe'}
                                        className="w-full h-auto max-h-48 object-cover"
                                      />
                                    </a>
                                  ) : (
                                    <a
                                      key={att.id || att.fileName}
                                      href={att.url || '#'}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-colors ${
                                        isCustomer || isAi
                                          ? 'bg-[#FAFAF8] text-[#0D1B3D] border-[#E5E4DF] hover:bg-[#F4F3EF]'
                                          : 'bg-white/10 text-white border-white/20 hover:bg-white/15'
                                      }`}
                                    >
                                      <Paperclip className="w-3.5 h-3.5 shrink-0" />
                                      <span className="truncate">{att.name || 'Document joint'}</span>
                                    </a>
                                  )
                                )}
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

                {/* Formulaire de réponse sobre */}
                <form
                  onSubmit={handleSendMessage}
                  className={`p-3 sm:p-4 border-t border-[#E5E4DF] space-y-2 shrink-0 ${
                    isInternalNote ? 'bg-[#FFFCF5]' : 'bg-white'
                  }`}
                  style={{
                    paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom, 0px))',
                  }}
                >
                  <div className="flex items-center justify-between text-xs gap-2">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setIsInternalNote(false)}
                        className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                          !isInternalNote
                            ? 'bg-[#F4F3EF] text-[#0D1B3D] font-semibold'
                            : 'text-slate-500 hover:text-[#0D1B3D]'
                        }`}
                      >
                        Réponse client
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsInternalNote(true)}
                        className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
                          isInternalNote
                            ? 'bg-amber-100 text-amber-950 font-semibold'
                            : 'text-slate-500 hover:text-[#0D1B3D]'
                        }`}
                      >
                        <Lock className="w-3 h-3" />
                        <span>Note interne</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      {isInternalNote && (
                        <span className="text-[11px] font-medium text-amber-800 hidden sm:inline">
                          Non visible par le client
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => setIsCannedResponsesModalOpen(true)}
                        className="px-2.5 py-1 rounded-md text-xs font-medium text-slate-600 hover:text-[#0D1B3D] hover:bg-[#F4F3EF] flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                        title="Insérer une réponse type enregistrée"
                      >
                        <Zap className="w-3.5 h-3.5 text-slate-400" />
                        <span className="hidden sm:inline">Réponses types</span>
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
                          ? "Ajouter une note confidentielle pour l'équipe…"
                          : 'Écrire une réponse au client…'
                      }
                      className={`w-full pl-3.5 pr-12 py-2.5 text-base sm:text-xs rounded-lg focus:outline-none transition-colors ${
                        isInternalNote
                          ? 'bg-white border border-amber-300 text-amber-950 focus:border-amber-600'
                          : 'bg-[#FAFAF8] border border-[#E5E4DF] text-[#0D1B3D] focus:border-[#0D1B3D] focus:bg-white'
                      }`}
                    />
                    <button
                      type="submit"
                      disabled={!replyText.trim() || sendingMessage}
                      className={`absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-md text-white disabled:opacity-30 transition-all cursor-pointer flex items-center justify-center ${
                        isInternalNote ? 'bg-amber-700 hover:bg-amber-800' : 'bg-[#0D1B3D] hover:bg-[#152C61]'
                      }`}
                      title={isInternalNote ? 'Enregistrer la note interne' : 'Envoyer le message'}
                      aria-label="Envoyer"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </form>

                {/* Volet mobile / tablette Fiche Client */}
                {isCustomerPanelOpen && (
                  <div className="xl:hidden absolute inset-0 sm:inset-y-0 sm:left-auto sm:right-0 sm:w-80 bg-white border-l border-[#E5E4DF] p-5 flex flex-col justify-between shadow-2xl z-30 overscroll-contain">
                    <div className="space-y-5 overflow-y-auto">
                      <div className="flex items-center justify-between border-b border-[#E5E4DF] pb-3">
                        <span className="text-xs font-bold text-[#0D1B3D]">Fiche client</span>
                        <button
                          type="button"
                          onClick={() => setIsCustomerPanelOpen(false)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-[#0D1B3D] hover:bg-[#F4F3EF] cursor-pointer"
                          aria-label="Fermer la fiche client"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="space-y-1">
                        <h4 className="text-sm font-bold text-[#0D1B3D]">{activeConv.customerName}</h4>
                        <p className="text-xs text-slate-600 font-mono">
                          {activeConv.customerPhone || 'Numéro non renseigné'}
                        </p>
                        {activeConv.customerEmail && (
                          <p className="text-xs text-slate-500">{activeConv.customerEmail}</p>
                        )}
                      </div>

                      <div className="pt-4 border-t border-[#E5E4DF] space-y-1.5 text-xs">
                        <span className="text-xs font-medium text-slate-400 block">Responsable</span>
                        <div className="flex items-center gap-2 text-[#0D1B3D] font-semibold">
                          <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                          <span>
                            {activeConv.assignedAgent?.user
                              ? `${activeConv.assignedAgent.user.firstName || ''} ${activeConv.assignedAgent.user.lastName || ''}`
                              : 'Non assigné'}
                          </span>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-[#E5E4DF] space-y-2">
                        <span className="text-xs font-medium text-slate-400 block">Ticket lié</span>
                        {activeConv.ticket ? (
                          <Link
                            href={`/app/tickets?ticketId=${activeConv.ticket.id}`}
                            className="p-3 rounded-lg bg-[#FAFAF8] border border-[#E5E4DF] block space-y-1 hover:border-[#0D1B3D]/30 transition-colors"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-mono text-xs font-bold text-[#0D1B3D]">
                                {activeConv.ticket.reference}
                              </span>
                              <span className="text-[11px] font-medium text-slate-500">
                                {activeConv.ticket.status}
                              </span>
                            </div>
                            <p className="text-xs text-slate-700 font-medium">{activeConv.ticket.title}</p>
                          </Link>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setIsLinkTicketModalOpen(true)}
                            className="w-full h-9 rounded-lg border border-[#E5E4DF] bg-white hover:bg-[#FAFAF8] text-xs font-medium text-[#0D1B3D] flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Créer un ticket</span>
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-[#E5E4DF]">
                      <Link
                        href="/app/tickets"
                        className="w-full h-9 rounded-lg bg-[#0D1B3D] hover:bg-[#152C61] text-xs font-semibold text-white transition-colors flex items-center justify-center gap-2"
                      >
                        <span>Tous les tickets</span>
                      </Link>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3 bg-[#FAFAF8]">
                <div className="w-12 h-12 rounded-xl bg-white text-slate-400 flex items-center justify-center border border-[#E5E4DF]">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div className="max-w-xs space-y-1">
                  <h3 className="text-sm font-bold text-[#0D1B3D]">
                    Sélectionnez une conversation
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Choisissez un échange dans la file à gauche pour répondre au client.
                  </p>
                </div>
                {currentWorkspace?.slug && (
                  <Link
                    href={`/entreprises/${currentWorkspace.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 h-9 rounded-lg bg-white hover:bg-[#F4F3EF] border border-[#E5E4DF] text-[#0D1B3D] text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span>Ouvrir le guichet public</span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                  </Link>
                )}
              </div>
            )}
          </Surface>

          {/* VOLET 3 : Fiche Client & Continuité (filets 1px #E5E4DF, zéro boîtes vertes) */}
          {activeConv && isCustomerPanelOpen && (
            <Surface
              variant="panel"
              className="hidden xl:flex w-[280px] rounded-xl border border-[#E5E4DF] p-4 flex-col justify-between shrink-0 overflow-hidden"
            >
              <div className="space-y-5 overflow-y-auto">
                <div className="flex items-center justify-between border-b border-[#E5E4DF] pb-3">
                  <span className="text-xs font-bold text-[#0D1B3D]">Fiche client</span>
                  <button
                    type="button"
                    onClick={() => setIsCustomerPanelOpen(false)}
                    className="p-1 rounded-md text-slate-400 hover:text-[#0D1B3D] transition-colors cursor-pointer"
                    title="Masquer le volet"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-[#0D1B3D]">{activeConv.customerName}</h4>
                  <p className="text-xs text-slate-600 font-mono">
                    {activeConv.customerPhone || 'Numéro non renseigné'}
                  </p>
                  {activeConv.customerEmail && (
                    <p className="text-xs text-slate-500">{activeConv.customerEmail}</p>
                  )}
                </div>

                <div className="pt-4 border-t border-[#E5E4DF] space-y-1.5 text-xs">
                  <span className="text-xs font-medium text-slate-400 block">Responsable</span>
                  <div className="flex items-center gap-2 font-semibold text-[#0D1B3D]">
                    <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      {activeConv.assignedAgent?.user
                        ? `${activeConv.assignedAgent.user.firstName || ''} ${activeConv.assignedAgent.user.lastName || ''}`
                        : 'Non assigné'}
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#E5E4DF] space-y-2">
                  <span className="text-xs font-medium text-slate-400 block">Ticket lié</span>
                  {activeConv.ticket ? (
                    <Link
                      href={`/app/tickets?ticketId=${activeConv.ticket.id}`}
                      className="p-3 rounded-lg bg-[#FAFAF8] border border-[#E5E4DF] block space-y-1 hover:border-[#0D1B3D]/30 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-[#0D1B3D]">
                          {activeConv.ticket.reference}
                        </span>
                        <span className="text-[11px] font-medium text-slate-500">
                          {activeConv.ticket.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 font-medium">{activeConv.ticket.title}</p>
                      <span className="text-[11px] text-slate-500 flex items-center gap-1 pt-0.5">
                        <span>Consulter le dossier</span>
                        <ExternalLink className="w-3 h-3" />
                      </span>
                    </Link>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsLinkTicketModalOpen(true)}
                      className="w-full h-9 rounded-lg border border-[#E5E4DF] bg-white hover:bg-[#FAFAF8] text-xs font-medium text-[#0D1B3D] flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Créer un ticket</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-[#E5E4DF]">
                <Link
                  href="/app/tickets"
                  className="w-full h-9 rounded-lg bg-[#0D1B3D] hover:bg-[#152C61] text-xs font-semibold text-white transition-colors flex items-center justify-center"
                >
                  <span>Tous les tickets</span>
                </Link>
              </div>
            </Surface>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL : CRÉER UN TICKET DEPUIS LA CONVERSATION             */}
      {/* ========================================================= */}
      {isLinkTicketModalOpen && activeConv && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
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
                  className="px-4 py-2 rounded-lg bg-[#0D1B3D] hover:bg-[#152C61] text-white text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
                >
                  {creatingTicket ? 'Création...' : 'Créer et relier'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Canned Responses Modal */}
      {isCannedResponsesModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0D1B3D]/35 backdrop-blur-sm">
          <div className="bg-white rounded-xl max-w-xl w-full p-5 shadow-2xl border border-[#E5E4DF] flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E4DF] shrink-0">
              <div>
                <h3 className="text-sm font-bold text-[#0D1B3D]">Réponses enregistrées</h3>
                <p className="text-xs text-slate-500">
                  Cliquez sur un modèle pour l&apos;insérer dans la zone de saisie.
                </p>
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
                        ? 'bg-[#0D1B3D] text-white shadow-sm'
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
                      className="p-3.5 rounded-lg border border-[#E5E4DF] hover:border-[#0D1B3D]/30 hover:bg-[#FAFAF8] transition-colors cursor-pointer group text-left"
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-[#0D1B3D]">
                            {cr.title}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            · {cr.category}
                          </span>
                        </div>
                        {cr.shortcut && (
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#F4F3EF] text-slate-600 border border-[#E5E4DF]">
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
