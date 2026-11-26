'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  X,
  Send,
  Lock,
  Zap,
  Bot,
  FolderKanban,
  Plus,
  ArrowLeft,
  Paperclip,
  ExternalLink,
  UserCheck,
  Search,
  RefreshCw,
} from 'lucide-react';
import { AgentConversationItem } from '@/types/workspace';
import { StatusPill } from '@/components/workspace/design-system';

interface PulseConversationDrawerProps {
  conversation: AgentConversationItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSendMessage: (text: string, isInternalNote: boolean) => Promise<boolean | void>;
  sendingMessage: boolean;
  loadingThread?: boolean;
  feedback?: { type: 'success' | 'error'; text: string } | null;
  onDismissFeedback?: () => void;
  cannedResponses?: Array<{
    id: string;
    title: string;
    category: string;
    content: string;
    shortcut?: string;
  }>;
  onOpenLinkTicketModal?: () => void;
}

export const PulseConversationDrawer: React.FC<PulseConversationDrawerProps> = ({
  conversation,
  isOpen,
  onClose,
  onSendMessage,
  sendingMessage,
  loadingThread = false,
  feedback = null,
  onDismissFeedback,
  cannedResponses = [],
  onOpenLinkTicketModal,
}) => {
  const [replyText, setReplyText] = useState('');
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [showDossier, setShowDossier] = useState(false);
  const [cannedModalOpen, setCannedModalOpen] = useState(false);
  const [cannedSearch, setCannedSearch] = useState('');
  const [cannedCategory, setCannedCategory] = useState('ALL');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [conversation?.id, conversation?.messages?.length, isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        if (cannedModalOpen) {
          setCannedModalOpen(false);
        } else if (showDossier) {
          setShowDossier(false);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, cannedModalOpen, showDossier, onClose]);

  if (!isOpen || !conversation) return null;

  const defaultCanned = [
    {
      id: 'cr-1',
      title: 'Prise en charge immédiate',
      category: 'Accueil',
      shortcut: '/bonjour',
      content:
        "Bonjour, votre demande a bien été reçue par notre équipe SAV. Nous l'examinons actuellement et revenons vers vous dans les plus brefs délais.",
    },
    {
      id: 'cr-2',
      title: 'Demande de précision / photo',
      category: 'Suivi',
      shortcut: '/details',
      content:
        'Afin de traiter votre dossier au plus vite, pourriez-vous nous transmettre une photo ou une description détaillée du problème rencontré ?',
    },
    {
      id: 'cr-3',
      title: 'Délais de traitement SAV',
      category: 'Délais',
      shortcut: '/delais',
      content:
        "Nos techniciens interviennent sous 24h à 48h ouvrées. Vous recevrez une notification par message dès que l'intervention est planifiée.",
    },
    {
      id: 'cr-4',
      title: 'Clôture et résolution',
      category: 'Clôture',
      shortcut: '/cloture',
      content:
        'Votre demande a été traitée avec succès par notre équipe. Restons à votre entière disposition. Excellente journée !',
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
    const result = await onSendMessage(textToSend, isInternalNote);
    if (result !== false) {
      setReplyText('');
    }
  };

  const rawAgent = conversation.assignedAgent as any;
  const assignedAgentName = rawAgent?.user
    ? `${rawAgent.user.firstName || ''} ${rawAgent.user.lastName || ''}`.trim()
    : rawAgent?.firstName || rawAgent?.lastName
    ? `${rawAgent.firstName || ''} ${rawAgent.lastName || ''}`.trim()
    : '';

  return (
    <>
      <div
        onClick={onClose}
        aria-hidden="true"
        className="fixed inset-0 z-40 bg-[#0D1B3D]/15 md:hidden"
      />
      <aside
        role="dialog"
        aria-label={`Conversation avec ${conversation.customerName}`}
        className="fixed inset-y-0 right-0 z-50 w-full sm:w-[430px] lg:w-[460px] bg-white sm:border-l border-[#E5E4DF] flex flex-col min-h-0 h-[100dvh] shadow-2xl select-none"
      >
      {/* En-tête unifié Zalisk */}
      <header className="px-4 h-14 border-b border-[#E5E4DF] bg-white flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            type="button"
            onClick={onClose}
            className="md:hidden w-8 h-8 -ml-1 rounded-lg text-slate-500 hover:text-[#0D1B3D] hover:bg-[#F4F3EF] flex items-center justify-center cursor-pointer shrink-0"
            title="Retour à la cartographie"
            aria-label="Retour à la cartographie"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div className="w-8 h-8 rounded-lg bg-[#0D1B3D] text-white flex items-center justify-center font-bold text-xs shrink-0">
            {conversation.customerName.charAt(0).toUpperCase()}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h2 className="text-sm font-bold text-[#0D1B3D] truncate">
                {conversation.customerName}
              </h2>
              {conversation.category && (
                <span className="hidden sm:inline text-[11px] text-slate-400 truncate">
                  · {conversation.category}
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 truncate flex items-center gap-1.5">
              {conversation.customerPhone && (
                <span className="font-mono text-slate-600">{conversation.customerPhone}</span>
              )}
              {!conversation.customerPhone && conversation.customerEmail && (
                <span>{conversation.customerEmail}</span>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <StatusPill status={conversation.status} size="sm" />

          <button
            type="button"
            onClick={() => setShowDossier(!showDossier)}
            className={`h-8 px-2 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer border ${
              showDossier
                ? 'bg-[#F4F3EF] text-[#0D1B3D] border-[#0D1B3D]/25 font-semibold'
                : 'bg-white text-slate-600 border-[#E5E4DF] hover:text-[#0D1B3D]'
            }`}
            title="Fiche client et ticket"
          >
            <FolderKanban className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden xl:inline">Dossier</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="hidden md:flex w-8 h-8 rounded-lg text-slate-400 hover:text-[#0D1B3D] hover:bg-[#F4F3EF] items-center justify-center transition-colors cursor-pointer"
            title="Fermer le volet (Échap)"
            aria-label="Fermer le volet conversation"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Bandeau ticket lié */}
      {conversation.ticket ? (
        <Link
          href={`/app/tickets?ticketId=${conversation.ticket.id}`}
          className="px-4 py-2 bg-[#FAFAF8] border-b border-[#E5E4DF] flex items-center justify-between text-xs hover:bg-[#F4F3EF]/70 transition-colors shrink-0"
        >
          <div className="flex items-center gap-2 min-w-0">
            <FolderKanban className="w-3.5 h-3.5 text-[#0D1B3D] shrink-0" />
            <span className="font-bold font-mono text-[#0D1B3D]">
              {conversation.ticket.reference}
            </span>
            <span className="text-slate-300">·</span>
            <span className="truncate text-slate-600">{conversation.ticket.title}</span>
          </div>
          <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1 shrink-0 ml-2">
            <span>{conversation.ticket.status}</span>
            <ExternalLink className="w-3 h-3" />
          </span>
        </Link>
      ) : onOpenLinkTicketModal ? (
        <div className="px-4 py-1.5 bg-[#FAFAF8] border-b border-[#E5E4DF] flex items-center justify-between text-xs text-slate-500 shrink-0">
          <div className="flex items-center gap-1.5">
            <FolderKanban className="w-3.5 h-3.5 text-slate-400" />
            <span>Aucun ticket relié</span>
          </div>
          <button
            type="button"
            onClick={onOpenLinkTicketModal}
            className="px-2.5 py-1 rounded-md bg-white hover:bg-[#F4F3EF] text-[#0D1B3D] border border-[#E5E4DF] text-[11px] font-medium flex items-center gap-1 transition-colors cursor-pointer"
          >
            <Plus className="w-3 h-3" />
            <span>Créer un ticket</span>
          </button>
        </div>
      ) : null}

      {/* Fiche client dépliable */}
      {showDossier && (
        <div className="px-4 py-3 bg-[#FAFAF8] border-b border-[#E5E4DF] space-y-2 text-xs shrink-0">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-[#0D1B3D]">Informations dossier</span>
            <button
              type="button"
              onClick={() => setShowDossier(false)}
              className="text-slate-400 hover:text-[#0D1B3D] cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div>
              <span className="text-slate-400 block">Responsable</span>
              <span className="font-medium text-[#0D1B3D] flex items-center gap-1 mt-0.5">
                <UserCheck className="w-3 h-3 text-slate-400" />
                {assignedAgentName || 'Non assigné'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block">Contact</span>
              <span className="font-mono text-slate-700 block mt-0.5 truncate">
                {conversation.customerPhone || conversation.customerEmail || 'Non renseigné'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Bandeau feedback envoi / erreur */}
      {feedback && (
        <div
          className={`px-4 py-2 text-xs font-medium flex items-center justify-between border-b shrink-0 ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-100'
              : 'bg-rose-50 text-rose-800 border-rose-100'
          }`}
        >
          <span className="truncate">{feedback.text}</span>
          {onDismissFeedback && (
            <button
              type="button"
              onClick={onDismissFeedback}
              className="p-0.5 hover:opacity-70 cursor-pointer shrink-0 ml-2"
              aria-label="Fermer le message"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* Fil de discussion sur Canvas Lin #FAFAF8 */}
      <div className="flex-1 p-4 overflow-y-auto overscroll-contain space-y-3.5 bg-[#FAFAF8] select-text">
        {loadingThread && (!conversation.messages || conversation.messages.length <= 1) ? (
          <div className="py-16 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-[#0D1B3D]" />
            <span>Chargement des messages…</span>
          </div>
        ) : conversation.messages && conversation.messages.length > 0 ? (
          conversation.messages.map((m) => {
            if (m.isInternalNote) {
              return (
                <div key={m.id} className="flex justify-center my-2">
                  <div className="w-full p-3 rounded-lg bg-[#FDF8EC] border border-[#F2E2B8] border-l-[3px] border-l-amber-600 text-amber-950 space-y-1">
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
                className={`flex flex-col ${isCustomer ? 'items-start' : 'items-end'}`}
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
                  className={`max-w-[86%] px-3.5 py-2.5 rounded-xl text-[13px] leading-relaxed ${
                    isCustomer
                      ? 'bg-white text-[#0D1B3D] rounded-bl-sm border border-[#E5E4DF]'
                      : isAi
                      ? 'bg-[#F4F3EF] text-[#0D1B3D] rounded-br-sm border border-[#E5E4DF]'
                      : 'bg-[#0D1B3D] text-white rounded-br-sm'
                  }`}
                >
                  {m.content && <p className="whitespace-pre-line break-words">{m.content}</p>}
                  {Array.isArray((m as any).attachments) && (m as any).attachments.length > 0 && (
                    <div className={`${m.content ? 'mt-2' : ''} space-y-2`}>
                      {(m as any).attachments.map((att: any) =>
                        att.isImage && att.url ? (
                          <a
                            key={att.id || att.fileName}
                            href={att.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block rounded-lg overflow-hidden border border-[#E5E4DF] max-w-[220px]"
                          >
                            <img
                              src={att.url}
                              alt={att.name || 'Pièce jointe'}
                              className="w-full h-auto max-h-44 object-cover"
                            />
                          </a>
                        ) : (
                          <a
                            key={att.id || att.fileName}
                            href={att.url || '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
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
        <div ref={messagesEndRef} />
      </div>

      {/* Formulaire de réponse unifié */}
      <form
        onSubmit={handleSubmit}
        className={`p-3 border-t border-[#E5E4DF] space-y-2 shrink-0 ${
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

          <button
            type="button"
            onClick={() => setCannedModalOpen(true)}
            className="px-2.5 py-1 rounded-md text-xs font-medium text-slate-600 hover:text-[#0D1B3D] hover:bg-[#F4F3EF] flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
            title="Insérer une réponse type enregistrée"
          >
            <Zap className="w-3.5 h-3.5 text-slate-400" />
            <span>Réponses types</span>
          </button>
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

      {/* Sélecteur de réponses types intégré (thème clair Zalisk) */}
      {cannedModalOpen && (
        <div className="absolute inset-0 bg-white z-30 p-4 flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-[#E5E4DF]">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#0D1B3D]" />
              <h3 className="text-sm font-bold text-[#0D1B3D]">Réponses enregistrées</h3>
            </div>
            <button
              type="button"
              onClick={() => setCannedModalOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-[#0D1B3D] hover:bg-[#F4F3EF] transition-colors cursor-pointer"
              aria-label="Fermer les réponses types"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="py-3 relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={cannedSearch}
              onChange={(e) => setCannedSearch(e.target.value)}
              placeholder="Rechercher par mot-clé ou raccourci (/bonjour)…"
              className="w-full h-9 pl-9 pr-3 rounded-lg bg-[#FAFAF8] border border-[#E5E4DF] text-xs text-[#0D1B3D] placeholder:text-slate-400 focus:outline-none focus:border-[#0D1B3D]"
              autoFocus
            />
          </div>

          <div className="flex-1 overflow-y-auto overscroll-contain space-y-2 py-1">
            {filteredCanned.map((cr) => (
              <div
                key={cr.id}
                onClick={() => handleSelectCanned(cr.content)}
                className="p-3 rounded-lg bg-white border border-[#E5E4DF] hover:border-[#0D1B3D]/30 hover:bg-[#FAFAF8] transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between mb-1 gap-2">
                  <span className="text-xs font-bold text-[#0D1B3D]">{cr.title}</span>
                  {cr.shortcut && (
                    <span className="px-1.5 py-0.5 rounded font-mono text-[10px] bg-[#F4F3EF] text-slate-600 border border-[#E5E4DF]">
                      {cr.shortcut}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{cr.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </aside>
    </>
  );
};
