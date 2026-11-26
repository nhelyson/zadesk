'use client';

import React from 'react';
import { MessageSquare, Inbox, X, ChevronRight } from 'lucide-react';
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
    <div className="fixed bottom-20 inset-x-3 sm:inset-x-auto sm:right-5 z-50 flex flex-col gap-2 sm:max-w-xs sm:w-full pointer-events-none select-none">
      {notifications.map((notif) => {
        const isNewConv = notif.type === 'NEW_CONVERSATION';
        return (
          <div
            key={notif.id}
            onClick={() => onSelectConversation(notif.conversationId)}
            className="pointer-events-auto group cursor-pointer bg-white/95 backdrop-blur-sm border border-[#E5E4DF] hover:border-[#0D1B3D]/30 p-3 rounded-xl shadow-lg transition-all duration-150 flex items-start gap-2.5 text-[#0D1B3D] overflow-hidden relative"
          >
            {/* Liseré d'accent discret */}
            <div
              className={`absolute top-0 left-0 bottom-0 w-1 ${
                isNewConv ? 'bg-[#0D1B3D]' : 'bg-[#22C55E]'
              }`}
            />

            {/* Icône */}
            <div
              className={`p-1.5 rounded-lg shrink-0 flex items-center justify-center ml-1 ${
                isNewConv
                  ? 'bg-[#F4F3EF] text-[#0D1B3D] border border-[#E5E4DF]'
                  : 'bg-[#ECFDF5] text-[#15803D] border border-[#BBF7D0]'
              }`}
            >
              {isNewConv ? (
                <Inbox className="w-3.5 h-3.5" />
              ) : (
                <MessageSquare className="w-3.5 h-3.5" />
              )}
            </div>

            {/* Contenu */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1.5 mb-0.5">
                <span className="text-xs font-bold text-[#0D1B3D] truncate">
                  {notif.customerName}
                </span>
                {notif.category && (
                  <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-[#FAFAF8] text-slate-600 border border-[#E5E4DF] shrink-0">
                    {notif.category}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                {notif.preview}
              </p>
              <div className="flex items-center justify-between mt-1.5 pt-1 border-t border-[#F0EFEA] text-[10px] text-slate-400">
                <span className="text-[#0D1B3D] flex items-center gap-0.5 font-semibold group-hover:underline">
                  Ouvrir <ChevronRight className="w-3 h-3" />
                </span>
                <span>À l&apos;instant</span>
              </div>
            </div>

            {/* Fermer */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDismiss(notif.id);
              }}
              className="text-slate-400 hover:text-[#0D1B3D] p-1 rounded-md hover:bg-[#F4F3EF] transition-colors shrink-0 cursor-pointer"
              title="Fermer"
              aria-label="Fermer la notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
