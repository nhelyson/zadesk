import type { AgentConversationItem } from '@/types/workspace';

export interface PulseReadStore {
  readAt: Record<string, number>;
  unreadCounts: Record<string, number>;
}

const EMPTY_STORE: PulseReadStore = {
  readAt: {},
  unreadCounts: {},
};

export function getPulseReadStorageKey(workspaceId?: string | null, userId?: string | null): string | null {
  if (!workspaceId) return null;
  return `zadesk:pulse-read:${workspaceId}:${userId || 'anon'}`;
}

export function loadPulseReadStore(storageKey: string | null): PulseReadStore {
  if (!storageKey || typeof window === 'undefined') {
    return { readAt: {}, unreadCounts: {} };
  }
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return { readAt: {}, unreadCounts: {} };
    const parsed = JSON.parse(raw);
    return {
      readAt: parsed?.readAt && typeof parsed.readAt === 'object' ? { ...parsed.readAt } : {},
      unreadCounts:
        parsed?.unreadCounts && typeof parsed.unreadCounts === 'object' ? { ...parsed.unreadCounts } : {},
    };
  } catch {
    return { readAt: {}, unreadCounts: {} };
  }
}

export function savePulseReadStore(storageKey: string | null, store: PulseReadStore): void {
  if (!storageKey || typeof window === 'undefined') return;
  try {
    // Keep store bounded to latest 300 entries to prevent unbounded storage growth
    const entries = Object.entries(store.readAt);
    if (entries.length > 300) {
      entries.sort((a, b) => b[1] - a[1]);
      store.readAt = Object.fromEntries(entries.slice(0, 300));
    }
    window.localStorage.setItem(storageKey, JSON.stringify(store));
  } catch {
    // Ignore storage quota or private-browsing errors
  }
}

export function getLatestConversationMessage(conv: AgentConversationItem): {
  content?: string;
  senderType?: string;
  createdAt?: string;
  isInternalNote?: boolean;
} | null {
  const msgs = Array.isArray(conv.messages) ? conv.messages : [];
  if (msgs.length === 0) return null;
  if (msgs.length === 1) return msgs[0];

  let latest = msgs[0];
  let latestMs = latest.createdAt ? new Date(latest.createdAt).getTime() : 0;
  for (let i = 1; i < msgs.length; i++) {
    const ms = msgs[i].createdAt ? new Date(msgs[i].createdAt).getTime() : 0;
    if (ms >= latestMs) {
      latestMs = ms;
      latest = msgs[i];
    }
  }
  return latest;
}

export function getConversationPreview(conv: AgentConversationItem): string {
  if (conv.lastMessage && conv.lastMessage.trim()) return conv.lastMessage.trim();
  const latest = getLatestConversationMessage(conv);
  if (latest?.content && latest.content.trim()) return latest.content.trim();
  return '';
}

export function getConversationLastTimestamp(conv: AgentConversationItem): number {
  const latest = getLatestConversationMessage(conv);
  const raw = conv.lastMessageAt || latest?.createdAt;
  if (!raw) return 0;
  const ms = new Date(raw).getTime();
  return Number.isFinite(ms) ? ms : 0;
}

export function computeConversationUnreadCount(
  conv: AgentConversationItem,
  store: PulseReadStore = EMPTY_STORE
): number {
  if (conv.status === 'RESOLVED' || conv.status === 'CLOSED') {
    return 0;
  }

  const lastMsgTime = getConversationLastTimestamp(conv);
  const readAt = store.readAt[conv.id] || 0;
  const storedUnread = Math.max(0, Number(store.unreadCounts[conv.id] || 0));
  const backendUnread =
    typeof (conv as any).unreadCount === 'number' && Number.isFinite((conv as any).unreadCount)
      ? Math.max(0, (conv as any).unreadCount)
      : 0;

  // If the user explicitly read this conversation after or at the latest message timestamp
  if (readAt > 0 && lastMsgTime > 0 && readAt >= lastMsgTime && storedUnread === 0) {
    return 0;
  }

  if (storedUnread > 0) {
    return Math.max(storedUnread, backendUnread);
  }

  if (backendUnread > 0) {
    return backendUnread;
  }

  const latest = getLatestConversationMessage(conv);
  if (latest?.senderType === 'CUSTOMER') {
    // Only consider unread if never read or a customer message arrived after last read
    if (readAt === 0 || lastMsgTime > readAt) {
      return 1;
    }
  }

  return 0;
}

export function markConversationAsReadInStore(
  store: PulseReadStore,
  conversationId: string,
  timestampMs?: number,
  nowMs: number = Date.now()
): PulseReadStore {
  const readTs = Math.max(nowMs, timestampMs || 0, store.readAt[conversationId] || 0);
  const nextUnread = { ...store.unreadCounts };
  delete nextUnread[conversationId];
  return {
    readAt: {
      ...store.readAt,
      [conversationId]: readTs,
    },
    unreadCounts: nextUnread,
  };
}

export function incrementConversationUnreadInStore(
  store: PulseReadStore,
  conversationId: string
): PulseReadStore {
  return {
    readAt: store.readAt,
    unreadCounts: {
      ...store.unreadCounts,
      [conversationId]: (store.unreadCounts[conversationId] || 0) + 1,
    },
  };
}

export function matchesConversationFilter(
  conv: AgentConversationItem,
  unreadCount: number,
  statusFilter: string
): boolean {
  if (!statusFilter || statusFilter === 'ALL') return true;
  if (statusFilter === 'UNREAD') return unreadCount > 0;
  if (statusFilter === 'RESOLVED') return conv.status === 'RESOLVED' || conv.status === 'CLOSED';
  if (statusFilter === 'ACTIVE') {
    const rawStatus = conv.status as string;
    return rawStatus === 'ACTIVE' || rawStatus === 'ASSIGNED' || rawStatus === 'OPEN';
  }
  if (statusFilter === 'WAITING_CUSTOMER') return conv.status === 'WAITING_CUSTOMER';
  return conv.status === statusFilter;
}

export function matchesConversationSearch(conv: AgentConversationItem, searchTerm: string): boolean {
  const q = searchTerm.trim().toLowerCase();
  if (!q) return true;
  const preview = getConversationPreview(conv).toLowerCase();
  return (
    conv.customerName.toLowerCase().includes(q) ||
    Boolean(conv.customerPhone && conv.customerPhone.toLowerCase().includes(q)) ||
    Boolean(conv.customerEmail && conv.customerEmail.toLowerCase().includes(q)) ||
    Boolean(conv.category && conv.category.toLowerCase().includes(q)) ||
    Boolean(conv.ticket?.reference && conv.ticket.reference.toLowerCase().includes(q)) ||
    preview.includes(q)
  );
}

export function formatRelativeTimeFr(raw?: string | number | null, nowMs: number = Date.now()): string {
  if (!raw) return '';
  const ts = typeof raw === 'number' ? raw : new Date(raw).getTime();
  if (!Number.isFinite(ts) || ts <= 0) return '';
  const diffSec = Math.max(0, Math.floor((nowMs - ts) / 1000));
  if (diffSec < 45) return "À l'instant";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `il y a ${diffMin} min`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `il y a ${diffHours} h`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'Hier';
  if (diffDays < 7) return `il y a ${diffDays} j`;
  return new Date(ts).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
}

export function formatClockTimeFr(raw?: string | number | null): string {
  if (!raw) return '';
  const ts = typeof raw === 'number' ? raw : new Date(raw).getTime();
  if (!Number.isFinite(ts) || ts <= 0) return '';
  return new Date(ts).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

export function applyIncomingPulseEventToConversations(
  prev: AgentConversationItem[],
  event: {
    type: string;
    conversationId?: string;
    messageId?: string;
    senderType?: string;
    senderName?: string;
    contentPreview?: string;
    isInternalNote?: boolean;
    timestamp?: string;
    customerName?: string;
    category?: string;
    status?: string;
  }
): AgentConversationItem[] {
  if (!event.conversationId) return prev;
  const idx = prev.findIndex((c) => c.id === event.conversationId);

  if (event.type === 'PULSE_MESSAGE_CREATED') {
    if (idx === -1) return prev;
    const existing = prev[idx];
    const msgTimestamp = event.timestamp || new Date().toISOString();
    const isClient = event.senderType === 'CUSTOMER';
    const nextStatus =
      isClient && (existing.status === 'WAITING_CUSTOMER' || existing.status === 'RESOLVED' || existing.status === 'CLOSED')
        ? ('OPEN' as const)
        : !isClient && !event.isInternalNote && existing.status !== 'RESOLVED' && existing.status !== 'CLOSED'
        ? ('WAITING_CUSTOMER' as const)
        : existing.status;

    const previewText = event.contentPreview || existing.lastMessage || '';
    const updatedConv: AgentConversationItem = {
      ...existing,
      status: (event.status as AgentConversationItem['status']) || nextStatus,
      lastMessage: event.isInternalNote ? existing.lastMessage : previewText,
      lastMessageAt: msgTimestamp,
      messages: [
        {
          id: event.messageId || `sse-${Date.now()}`,
          senderType: (event.senderType as any) || 'CUSTOMER',
          senderName: event.senderName || existing.customerName,
          content: previewText,
          isInternalNote: Boolean(event.isInternalNote),
          createdAt: msgTimestamp,
        },
      ],
    };

    const next = [...prev];
    next[idx] = updatedConv;
    return next;
  }

  if (event.type === 'PULSE_CONVERSATION_CREATED') {
    if (idx !== -1) return prev;
    const nowIso = event.timestamp || new Date().toISOString();
    const createdConv: AgentConversationItem = {
      id: event.conversationId,
      customerName: event.customerName || 'Nouveau client',
      category: event.category || 'Général',
      status: (event.status as AgentConversationItem['status']) || 'OPEN',
      lastMessage: event.contentPreview || 'Nouvelle demande client',
      lastMessageAt: nowIso,
      createdAt: nowIso,
      updatedAt: nowIso,
      messages: [
        {
          id: `sse-init-${Date.now()}`,
          senderType: 'CUSTOMER',
          senderName: event.customerName || 'Client',
          content: event.contentPreview || 'Nouvelle demande client',
          isInternalNote: false,
          createdAt: nowIso,
        },
      ],
    };
    return [createdConv, ...prev];
  }

  return prev;
}
