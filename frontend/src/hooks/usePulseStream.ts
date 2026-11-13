'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { agentApi } from '@/lib/api';
import { pulseAudio } from '@/lib/pulseAudio';

export interface PulseEventData {
  id: string;
  type: string;
  workspaceId: string;
  timestamp: string;
  conversationId?: string;
  messageId?: string;
  senderType?: string;
  senderName?: string;
  contentPreview?: string;
  isInternalNote?: boolean;
  assignedAgentId?: string | null;
  customerName?: string;
  category?: string;
  isClientMessage?: boolean;
  status?: string;
  priority?: string;
}

export interface PulseNotificationItem {
  id: string;
  eventId: string;
  type: 'NEW_CONVERSATION' | 'NEW_MESSAGE';
  conversationId: string;
  customerName: string;
  preview: string;
  category?: string;
  timestamp: string;
}

interface UsePulseStreamOptions {
  workspaceId?: string;
  onEvent?: (event: PulseEventData) => void;
  onFullSyncNeeded?: () => Promise<void>;
  enabled?: boolean;
}

export function usePulseStream({
  workspaceId,
  onEvent,
  onFullSyncNeeded,
  enabled = true,
}: UsePulseStreamOptions) {
  const [status, setStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');
  const [notifications, setNotifications] = useState<PulseNotificationItem[]>([]);
  const processedEventIds = useRef<Set<string>>(new Set());
  const lastEventIdRef = useRef<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<any>(null);
  const retryCountRef = useRef(0);

  // Store callbacks in refs to avoid re-triggering connect() on every parent render
  const onEventRef = useRef(onEvent);
  onEventRef.current = onEvent;
  const onFullSyncNeededRef = useRef(onFullSyncNeeded);
  onFullSyncNeededRef.current = onFullSyncNeeded;

  const dismissNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const connect = useCallback(() => {
    if (!workspaceId || !enabled) return;

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    setStatus('connecting');

    const streamUrl = agentApi.getPulseStreamUrl(workspaceId);
    const url = new URL(streamUrl, window.location.origin);
    if (lastEventIdRef.current) {
      url.searchParams.set('lastEventId', lastEventIdRef.current);
    }

    // EventSource with HttpOnly session cookies
    const es = new EventSource(url.toString(), { withCredentials: true });
    eventSourceRef.current = es;

    es.addEventListener('open', () => {
      setStatus('connected');
      retryCountRef.current = 0;
      // Recover complete fresh state from PostgreSQL upon each connection/reconnection
      if (onFullSyncNeededRef.current) {
        onFullSyncNeededRef.current().catch(() => {});
      }
    });

    es.addEventListener('connected', (e: MessageEvent) => {
      setStatus('connected');
    });

    const handleMessageEvent = (type: string, dataStr: string) => {
      try {
        const payload: PulseEventData = JSON.parse(dataStr);
        if (!payload || !payload.id) return;

        // Strict Deduplication check
        if (processedEventIds.current.has(payload.id)) {
          return;
        }
        processedEventIds.current.add(payload.id);
        lastEventIdRef.current = payload.id;

        // Keep deduplication set reasonable (max 200 items)
        if (processedEventIds.current.size > 200) {
          const firstVal = processedEventIds.current.values().next().value;
          if (firstVal) processedEventIds.current.delete(firstVal);
        }

        // Trigger Audio Chime & In-App Toast
        if (payload.type === 'PULSE_MESSAGE_CREATED') {
          if (payload.isClientMessage) {
            pulseAudio.playMessagePulse();
            setNotifications((prev) => [
              {
                id: `notif-${payload.id}`,
                eventId: payload.id,
                type: 'NEW_MESSAGE',
                conversationId: payload.conversationId || '',
                customerName: payload.customerName || 'Client',
                preview: payload.contentPreview || 'Nouveau message reçu',
                category: payload.category,
                timestamp: payload.timestamp || new Date().toISOString(),
              },
              ...prev.slice(0, 4), // Keep max 5 active toast notifications
            ]);
          }
        } else if (payload.type === 'PULSE_CONVERSATION_CREATED') {
          pulseAudio.playNewNodeChime();
          setNotifications((prev) => [
            {
              id: `notif-${payload.id}`,
              eventId: payload.id,
              type: 'NEW_CONVERSATION',
              conversationId: payload.conversationId || '',
              customerName: payload.customerName || 'Nouveau client',
              preview: 'Nouvelle conversation entrée dans la constellation',
              category: payload.category,
              timestamp: payload.timestamp || new Date().toISOString(),
            },
            ...prev.slice(0, 4),
          ]);
        }

        // Notify parent observer
        if (onEventRef.current) {
          onEventRef.current(payload);
        }
      } catch (err) {
        console.warn('[Pulse:SSE] Erreur traitement événement:', err);
      }
    };

    es.addEventListener('PULSE_MESSAGE_CREATED', (e: MessageEvent) => {
      handleMessageEvent('PULSE_MESSAGE_CREATED', e.data);
    });

    es.addEventListener('PULSE_CONVERSATION_CREATED', (e: MessageEvent) => {
      handleMessageEvent('PULSE_CONVERSATION_CREATED', e.data);
    });

    es.addEventListener('PULSE_CONVERSATION_UPDATED', (e: MessageEvent) => {
      handleMessageEvent('PULSE_CONVERSATION_UPDATED', e.data);
    });

    es.addEventListener('PULSE_CONVERSATION_READ', (e: MessageEvent) => {
      handleMessageEvent('PULSE_CONVERSATION_READ', e.data);
    });

    es.onerror = () => {
      setStatus('disconnected');
      es.close();
      eventSourceRef.current = null;

      // Exponential backoff reconnect: 2s -> 4s -> 8s (max 15s)
      const delay = Math.min(Math.pow(2, retryCountRef.current) * 2000, 15000);
      retryCountRef.current += 1;

      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = setTimeout(() => {
        connect();
      }, delay);
    };
  }, [workspaceId, enabled]);

  useEffect(() => {
    connect();

    return () => {
      clearTimeout(reconnectTimeoutRef.current);
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, [connect]);

  return {
    status,
    notifications,
    dismissNotification,
  };
}

