'use client';

import React from 'react';
import { MessageSquare, Sparkles, X, ChevronRight } from 'lucide-react';
import { PulseNotificationItem } from '@/hooks/usePulseStream';

interface PulseNotificationsProps {
  notifications: PulseNotificationItem[];
  onSelectConversation: (conversationId: string) => void;
  onDismiss: (id: string) => void;
}

export const PulseNotifications: React.FC<PulseNotificationsProps> = ({
  notifications,
  onSelectConversation,
  onDismiss,
}) => {
  if (notifications.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none select-none">
      {notifications.map((notif) => {
        const isNewConv = notif.type === 'NEW_CONVERSATION';
        return (
          <div
            key={notif.id}
            onClick={() => onSelectConversation(notif.conversationId)}
            className="pointer-events-auto group cursor-pointer bg-slate-900/90 backdrop-blur-md border border-emerald-500/40 hover:border-emerald-400 p-3.5 rounded-2xl shadow-2xl transition-all duration-200 hover:scale-[1.02] hover:-translate-y-0.5 flex items-start gap-3 text-white overflow-hidden relative"
            style={{
              boxShadow: isNewConv
                ? '0 10px 30px -5px rgba(6, 182, 212, 0.3)'
                : '0 10px 30px -5px rgba(34, 197, 94, 0.3)',
            }}
          >
            {/* Ambient indicator accent line */}
            <div
              className={`absolute top-0 left-0 bottom-0 w-1 ${
                isNewConv ? 'bg-cyan-400' : 'bg-emerald-500'
              }`}
            />

            {/* Icon Halo */}
            <div
              className={`p-2 rounded-xl shrink-0 flex items-center justify-center ${
                isNewConv
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                  : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              }`}
            >
              {isNewConv ? <Sparkles className="w-4 h-4 animate-pulse" /> : <MessageSquare className="w-4 h-4 animate-bounce" />}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 pr-1">
              <div className="flex items-center justify-between gap-1 mb-0.5">
                <span className="text-xs font-bold text-slate-100 truncate">
                  {notif.customerName}
                </span>
                {notif.category && (
                  <span className="text-[10px] font-medium px-1.5 py-0.2 rounded-md bg-slate-800 text-slate-300 border border-slate-700/60 shrink-0">
                    {notif.category}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300 font-normal line-clamp-2 leading-relaxed">
                {notif.preview}
              </p>
              <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-800/80 text-[10px] text-slate-400">
                <span className="text-emerald-400 flex items-center gap-1 font-medium group-hover:underline">
                  Ouvrir la conversation <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </span>
                <span>À l&apos;instant</span>
              </div>
            </div>

            {/* Dismiss X */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDismiss(notif.id);
              }}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800/80 transition-colors shrink-0"
              title="Fermer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

