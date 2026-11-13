'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Send,
  Lock,
  Zap,
  Info,
  CheckCheck,
  Bot,
  User,
  Phone,
  Mail,
  FolderKanban,
  ExternalLink,
  Clock,
  Sparkles,
  CheckCircle2,
  Calendar,
  Plus,
} from 'lucide-react';
import { AgentConversationItem } from '@/types/workspace';

interface PulseConversationDrawerProps {
  conversation: AgentConversationItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSendMessage: (text: string, isInternalNote: boolean) => Promise<void>;
  sendingMessage: boolean;
  cannedResponses?: Array<{ id: string; title: string; category: string; content: string; shortcut?: string }>;
  onOpenLinkTicketModal?: () => void;
}

export const PulseConversationDrawer: React.FC<PulseConversationDrawerProps> = ({
  conversation,
  isOpen,
  onClose,
  onSendMessage,
  sendingMessage,
  cannedResponses = [],
  onOpenLinkTicketModal,
}) => {
  const [replyText, setReplyText] = useState('');
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [cannedModalOpen, setCannedModalOpen] = useState(false);
  const [cannedSearch, setCannedSearch] = useState('');
  const [cannedCategory, setCannedCategory] = useState('ALL');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of thread when messages change or drawer opens
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [conversation?.messages, isOpen]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        if (cannedModalOpen) {
          setCannedModalOpen(false);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, cannedModalOpen, onClose]);

  if (!isOpen || !conversation) return null;

  const defaultCanned = [
    {
      id: 'cr-1',
      title: 'Prise en charge immédiate',
      category: 'Accueil',
      shortcut: '/bonjour',
      content: "Bonjour, votre demande a bien été reçue par notre équipe SAV. Nous l'examinons actuellement et revenons vers vous dans les plus brefs délais.",
    },
    {
      id: 'cr-2',
      title: 'Demande de précision / photo',
      category: 'Suivi',
      shortcut: '/details',
      content: "Afin de traiter votre dossier au plus vite, pourriez-vous nous transmettre une photo ou une description détaillée du problème rencontré ?",
    },
    {
      id: 'cr-3',
      title: 'Délais de traitement SAV',
      category: 'Délais',
      shortcut: '/delais',
      content: "Nos techniciens interviennent sous 24h à 48h ouvrées. Vous recevrez une notification par message dès que l'intervention est planifiée.",
    },
    {
      id: 'cr-4',
      title: 'Clôture et résolution',
      category: 'Clôture',
      shortcut: '/cloture',
      content: "Votre demande a été traitée avec succès par notre équipe. Restons à votre entière disposition. Excellente journée !",
    },
  ];

  const activeCanned = cannedResponses.length > 0 ? cannedResponses : defaultCanned;

  const filteredCanned = activeCanned.filter((cr) => {
    if (cannedCategory !== 'ALL' && cr.category !== cannedCategory) return false;
    if (cannedSearch) {
      const q = cannedSearch.toLowerCase();
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
    setCannedModalOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || sendingMessage) return;
    const textToSend = replyText.trim();
    setReplyText('');
    await onSendMessage(textToSend, isInternalNote);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 transition-opacity animate-fade-in"
      />

      {/* Drawer Panel */}
      <aside
        className="fixed top-0 right-0 bottom-0 w-full sm:w-[500px] md:w-[580px] bg-[#0B1528] border-l border-slate-800 text-white z-50 flex flex-col shadow-2xl animate-in slide-in-from-right duration-250 select-none"
        style={{
          boxShadow: '-20px 0 50px rgba(0, 0, 0, 0.7)',
          paddingLeft: 'env(safe-area-inset-left, 0px)',
          paddingRight: 'env(safe-area-inset-right, 0px)',
        }}
      >
        {/* Header */}
        <header
          className="px-4 sm:px-5 py-3 sm:py-4 border-b border-slate-800 bg-[#070D1E]/90 backdrop-blur-md flex items-center justify-between shrink-0"
          style={{ paddingTop: 'max(0.75rem, env(safe-area-inset-top, 0px))' }}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
              {conversation.customerName.charAt(0)}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-white truncate">
                  {conversation.customerName}
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  {conversation.externalChannel || 'PORTAIL'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate flex items-center gap-2 mt-0.5">
                {conversation.customerPhone && (
                  <span className="flex items-center gap-1">
                    <Phone className="w-3 h-3 text-slate-500" />
                    {conversation.customerPhone}
                  </span>
                )}
                {conversation.category && (
                  <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 text-[10px]">
                    {conversation.category}
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span
              className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-xl text-[11px] sm:text-xs font-bold ${
                conversation.status === 'RESOLVED'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : conversation.status === 'WAITING_CUSTOMER'
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
              }`}
            >
              {conversation.status}
            </span>

            <button
              onClick={onClose}
              className="p-2 sm:p-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer active:scale-95"
              title="Fermer (Échap)"
              aria-label="Fermer le panneau"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Linked Ticket Banner (if available) or create action */}
        {conversation.ticket ? (
          <div className="px-5 py-2.5 bg-emerald-950/40 border-b border-emerald-500/20 flex items-center justify-between text-xs text-emerald-300 shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <FolderKanban className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="font-bold font-mono">{conversation.ticket.reference}</span>
              <span className="text-slate-400">•</span>
              <span className="truncate text-slate-300">{conversation.ticket.title}</span>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 shrink-0">
              {conversation.ticket.status}
            </span>
          </div>
        ) : onOpenLinkTicketModal ? (
          <div className="px-5 py-2 bg-slate-900/60 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400 shrink-0">
            <div className="flex items-center gap-2">
              <FolderKanban className="w-3.5 h-3.5 text-slate-500" />
              <span>Aucun ticket relié</span>
            </div>
            <button
              onClick={onOpenLinkTicketModal}
              className="px-2.5 py-0.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Plus className="w-3 h-3" />
              <span>Créer un ticket</span>
            </button>
          </div>
        ) : null}

        {/* Messages Feed */}
        <div className="flex-1 p-4 sm:p-5 overflow-y-auto overscroll-contain space-y-4 bg-[#070D1E]/40 scrollbar-thin scrollbar-thumb-slate-800 select-text">
          <div className="flex items-center justify-center my-2">
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest bg-slate-900 border border-slate-800 px-3 py-0.5 rounded-full">
              Historique en direct
            </span>
          </div>

          {conversation.messages && conversation.messages.length > 0 ? (
            conversation.messages.map((m) => {
              if (m.isInternalNote) {
                return (
                  <div key={m.id} className="flex justify-center my-3">
                    <div className="w-full max-w-[94%] p-3.5 rounded-2xl bg-amber-950/40 border border-amber-500/40 text-amber-200 shadow-lg space-y-1">
                      <div className="flex items-center justify-between text-[11px] font-bold text-amber-400">
                        <span className="flex items-center gap-1.5">
                          <Lock className="w-3.5 h-3.5 text-amber-400" />
                          <span>NOTE INTERNE (Confidentielle)</span>
                        </span>
                        <span className="text-[10px] text-amber-500 font-normal">
                          {new Date(m.createdAt).toLocaleTimeString('fr-FR', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <p className="text-xs leading-relaxed whitespace-pre-wrap text-amber-100">{m.content}</p>
                      <p className="text-[10px] text-amber-400/80">
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
                    {isAi && <Bot className="w-3 h-3 text-cyan-400" />}
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
                    className={`max-w-[88%] sm:max-w-[85%] p-3 sm:p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-md ${
                      isCustomer
                        ? 'bg-slate-800/90 text-white rounded-tl-xs border border-slate-700/80'
                        : isAi
                        ? 'bg-cyan-950/50 text-cyan-100 rounded-tr-xs border border-cyan-500/40'
                        : 'bg-emerald-600 text-white rounded-tr-xs'
                    }`}
                  >
                    <p className="whitespace-pre-line break-words">{m.content}</p>
                    {!isCustomer && (
                      <div className="flex items-center justify-end gap-1 mt-1.5 text-[9px] text-white/80">
                        <CheckCheck className="w-3.5 h-3.5 text-emerald-200" />
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-16 text-center text-xs text-slate-500">
              Aucun message consigné pour cette conversation.
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Reply & Internal Note Form */}
        <form
          onSubmit={handleSubmit}
          className={`p-3.5 sm:p-4 border-t border-slate-800 bg-[#070D1E]/95 space-y-3 shrink-0 ${
            isInternalNote ? 'bg-amber-950/20 border-t-amber-500/30' : ''
          }`}
          style={{
            paddingBottom: 'max(0.875rem, env(safe-area-inset-bottom, 0px))',
          }}
        >
          {/* Action buttons bar */}
          <div className="flex items-center justify-between text-xs gap-2">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                type="button"
                onClick={() => setIsInternalNote(false)}
                className={`px-3 py-1.5 sm:py-1 rounded-lg text-xs font-bold transition-all cursor-pointer active:scale-95 ${
                  !isInternalNote
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                Réponse Client
              </button>
              <button
                type="button"
                onClick={() => setIsInternalNote(true)}
                className={`px-3 py-1.5 sm:py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 ${
                  isInternalNote
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <Lock className="w-3 h-3" />
                <span>Note Interne</span>
              </button>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2">
              {isInternalNote && (
                <span className="text-[11px] font-semibold text-amber-400 flex items-center gap-1 mr-1">
                  <Info className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden sm:inline">Invisible client</span>
                </span>
              )}
              <button
                type="button"
                onClick={() => setCannedModalOpen(true)}
                className="px-2.5 py-1.5 sm:py-1 rounded-lg text-xs font-bold bg-slate-800 text-emerald-400 border border-emerald-500/30 hover:bg-slate-700/80 flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 shrink-0"
                title="Insérer une réponse type enregistrée"
              >
                <Zap className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden xs:inline">Réponses types</span>
                <span className="xs:hidden">Types</span>
              </button>
            </div>
          </div>

          {/* Input field */}
          <div className="relative">
            <input
              type="text"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder={
                isInternalNote
                  ? 'Ajouter une note interne confidentielle...'
                  : 'Rédiger une réponse client consignée dans Zadesk...'
              }
              className={`w-full pl-4 pr-12 py-3 text-xs sm:text-sm rounded-2xl focus:outline-none transition-all placeholder:text-slate-500 ${
                isInternalNote
                  ? 'bg-amber-950/30 border border-amber-500/50 text-amber-100 focus:border-amber-400'
                  : 'bg-slate-900 border border-slate-700 text-white focus:border-emerald-500'
              }`}
            />
            <button
              type="submit"
              disabled={!replyText.trim() || sendingMessage}
              className={`absolute right-1.5 top-1/2 -translate-y-1/2 p-2.5 rounded-xl text-slate-950 disabled:opacity-30 transition-all cursor-pointer active:scale-95 ${
                isInternalNote
                  ? 'bg-amber-500 hover:bg-amber-400'
                  : 'bg-emerald-500 hover:bg-emerald-400'
              }`}
              title={isInternalNote ? 'Enregistrer la note interne' : 'Envoyer le message'}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>

        {/* Canned Responses Overlay Modal */}
        {cannedModalOpen && (
          <div
            className="absolute inset-0 bg-[#070D1E]/95 backdrop-blur-md z-30 p-4 sm:p-5 flex flex-col animate-fade-in"
            style={{
              paddingTop: 'max(1rem, env(safe-area-inset-top, 0px))',
              paddingBottom: 'max(1rem, env(safe-area-inset-bottom, 0px))',
            }}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">Réponses types préenregistrées</h3>
              </div>
              <button
                onClick={() => setCannedModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                aria-label="Fermer les réponses types"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-3">
              <input
                type="text"
                value={cannedSearch}
                onChange={(e) => setCannedSearch(e.target.value)}
                placeholder="Rechercher par mot-clé ou raccourci (/bonjour, /delais)..."
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex-1 overflow-y-auto overscroll-contain space-y-2 py-2 scrollbar-thin scrollbar-thumb-slate-800">
              {filteredCanned.map((cr) => (
                <div
                  key={cr.id}
                  onClick={() => handleSelectCanned(cr.content)}
                  className="p-3 sm:p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-800/80 transition-all cursor-pointer group active:scale-[0.99]"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs sm:text-sm font-bold text-slate-200 group-hover:text-emerald-400 transition-colors">
                      {cr.title}
                    </span>
                    {cr.shortcut && (
                      <span className="px-1.5 py-0.5 rounded font-mono text-[10px] bg-slate-800 text-emerald-400 border border-emerald-500/30">
                        {cr.shortcut}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {cr.content}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </aside>
    </>
  );
};
