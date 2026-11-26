'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Send,
  Lock,
  Bot,
  FolderKanban,
  CheckCircle2,
} from 'lucide-react';
import { Pulse3DConversation } from './types';

interface Pulse3DMockDrawerProps {
  conversation: Pulse3DConversation | null;
  isOpen: boolean;
  onClose: () => void;
  onSendMessage: (conversationId: string, text: string, isInternalNote: boolean) => void;
  onMarkResolved: (conversationId: string) => void;
}

export const Pulse3DMockDrawer: React.FC<Pulse3DMockDrawerProps> = ({
  conversation,
  isOpen,
  onClose,
  onSendMessage,
  onMarkResolved,
}) => {
  const [replyText, setReplyText] = useState('');
  const [isInternalNote, setIsInternalNote] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [conversation?.id, conversation?.messages.length, isOpen]);

  if (!isOpen || !conversation) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    onSendMessage(conversation.id, replyText.trim(), isInternalNote);
    setReplyText('');
  };

  return (
    <aside className="w-full md:w-[410px] lg:w-[440px] bg-white border-l border-[#E5E4DF] flex flex-col h-full shrink-0 z-30 shadow-2xl">
      <header className="px-4 h-14 border-b border-[#E5E4DF] flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-[#0D1B3D] text-white flex items-center justify-center font-bold text-xs shrink-0">
            {conversation.customerName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-[#0D1B3D] truncate">
              {conversation.customerName}
            </h2>
            <p className="text-[11px] text-slate-500 truncate">
              {conversation.category}
              {conversation.customerPhone ? ` · ${conversation.customerPhone}` : ''}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {conversation.status !== 'RESOLVED' && (
            <button
              type="button"
              onClick={() => onMarkResolved(conversation.id)}
              className="h-8 px-2.5 rounded-lg border border-[#E5E4DF] hover:bg-[#ECFDF5] hover:border-emerald-300 hover:text-emerald-800 text-xs font-medium text-slate-600 flex items-center gap-1 transition-colors cursor-pointer"
              title="Marquer la conversation comme résolue (simulation)"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Résoudre</span>
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-[#0D1B3D] hover:bg-[#F4F3EF] flex items-center justify-center cursor-pointer"
            aria-label="Fermer le drawer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      {conversation.ticketRef && (
        <div className="px-4 py-2 bg-[#FAFAF8] border-b border-[#E5E4DF] flex items-center justify-between text-xs shrink-0">
          <div className="flex items-center gap-2 text-[#0D1B3D]">
            <FolderKanban className="w-3.5 h-3.5" />
            <span className="font-mono font-bold">{conversation.ticketRef}</span>
            <span className="text-slate-400">·</span>
            <span className="text-slate-600">Ticket relié (simulation)</span>
          </div>
          <span className="text-[11px] font-medium text-slate-500">{conversation.status}</span>
        </div>
      )}

      <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#FAFAF8]">
        {conversation.messages.map((m) => {
          if (m.isInternalNote) {
            return (
              <div
                key={m.id}
                className="p-3 rounded-lg bg-[#FDF8EC] border border-[#F2E2B8] border-l-[3px] border-l-amber-600 text-amber-950 space-y-1"
              >
                <div className="flex items-center justify-between text-[11px] font-semibold text-amber-900">
                  <span className="flex items-center gap-1.5">
                    <Lock className="w-3 h-3 text-amber-700" />
                    <span>{m.senderName}</span>
                  </span>
                  <span className="text-[11px] text-amber-700/75 tabular-nums font-normal">
                    {m.createdAt}
                  </span>
                </div>
                <p className="text-xs leading-relaxed">{m.content}</p>
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
              <div className="flex items-center gap-1.5 mb-1 text-[11px] text-slate-400 px-1">
                {isAi && <Bot className="w-3 h-3 text-slate-500" />}
                <span>{m.senderName}</span>
                <span>·</span>
                <span className="tabular-nums">{m.createdAt}</span>
              </div>
              <div
                className={`max-w-[85%] px-3.5 py-2.5 rounded-xl text-[13px] leading-relaxed ${
                  isCustomer
                    ? 'bg-white text-[#0D1B3D] rounded-bl-sm border border-[#E5E4DF]'
                    : isAi
                    ? 'bg-[#F4F3EF] text-[#0D1B3D] rounded-br-sm border border-[#E5E4DF]'
                    : 'bg-[#0D1B3D] text-white rounded-br-sm'
                }`}
              >
                {m.content}
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>

      <form
        onSubmit={handleSubmit}
        className={`p-3 border-t border-[#E5E4DF] space-y-2 shrink-0 ${
          isInternalNote ? 'bg-[#FFFCF5]' : 'bg-white'
        }`}
      >
        <div className="flex items-center gap-1 text-xs">
          <button
            type="button"
            onClick={() => setIsInternalNote(false)}
            className={`px-2.5 py-1 rounded-md font-medium cursor-pointer ${
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
            className={`px-2.5 py-1 rounded-md font-medium flex items-center gap-1.5 cursor-pointer ${
              isInternalNote
                ? 'bg-amber-100 text-amber-950 font-semibold'
                : 'text-slate-500 hover:text-[#0D1B3D]'
            }`}
          >
            <Lock className="w-3 h-3" />
            <span>Note interne</span>
          </button>
        </div>

        <div className="relative">
          <input
            type="text"
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder={
              isInternalNote
                ? 'Ajouter une note confidentielle (démo)…'
                : 'Simuler une réponse client…'
            }
            className={`w-full pl-3.5 pr-11 py-2.5 text-xs rounded-lg focus:outline-none ${
              isInternalNote
                ? 'bg-white border border-amber-300 text-amber-950 focus:border-amber-600'
                : 'bg-[#FAFAF8] border border-[#E5E4DF] text-[#0D1B3D] focus:border-[#0D1B3D]'
            }`}
          />
          <button
            type="submit"
            disabled={!replyText.trim()}
            className={`absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-md text-white disabled:opacity-30 flex items-center justify-center cursor-pointer ${
              isInternalNote ? 'bg-amber-700 hover:bg-amber-800' : 'bg-[#0D1B3D] hover:bg-[#152C61]'
            }`}
            aria-label="Envoyer"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </form>
    </aside>
  );
};
