'use client';

import React, { useState } from 'react';
import {
  MessageSquare,
  Search,
  Filter,
  Sparkles,
  Send,
  User,
  Phone,
  Clock,
  CheckCheck,
  AlertCircle,
  FolderKanban,
  Bot,
  UserCheck,
  ChevronRight,
  MoreVertical,
  Paperclip,
  Smile,
  Shield,
  Zap,
} from 'lucide-react';
import { useWorkspace } from '@/components/workspace/WorkspaceContext';

interface Message {
  id: string;
  sender: 'customer' | 'ai' | 'agent';
  senderName: string;
  text: string;
  time: string;
}

interface ConversationItem {
  id: string;
  customerName: string;
  customerPhone: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  status: 'AI_PROCESSING' | 'AGENT_PENDING' | 'RESOLVED' | 'ESCALATED';
  channel: 'WHATSAPP';
  assignedTo?: string;
  category: string;
  messages: Message[];
}

const mockConversations: ConversationItem[] = [
  {
    id: 'conv-101',
    customerName: 'Koffi Jean-Luc',
    customerPhone: '+225 07 48 92 10 33',
    lastMessage: "Mon colis #ZD-9482 n'est toujours pas arrivé au point relais Plateau.",
    timestamp: '10:42',
    unreadCount: 1,
    status: 'AI_PROCESSING',
    channel: 'WHATSAPP',
    category: 'Livraison & Colis',
    messages: [
      {
        id: 'm1',
        sender: 'customer',
        senderName: 'Koffi Jean-Luc',
        text: "Bonjour, mon colis de commande #ZD-9482 n'est toujours pas arrivé au point relais Plateau. Pouvez-vous vérifier le statut ?",
        time: '10:40',
      },
      {
        id: 'm2',
        sender: 'ai',
        senderName: 'IA Zadesk N1',
        text: "Bonjour M. Koffi ! Je consulte immédiatement le statut de votre colis #ZD-9482. Le transporteur l'a déposé ce matin à 09h15 au point relais Plateau (Agence Centrale). Vous pouvez le retirer avec votre pièce d'identité.",
        time: '10:41',
      },
      {
        id: 'm3',
        sender: 'customer',
        senderName: 'Koffi Jean-Luc',
        text: "Super merci beaucoup ! Est-ce que l'agence est ouverte jusqu'à 18h ?",
        time: '10:42',
      },
    ],
  },
  {
    id: 'conv-102',
    customerName: 'Aïcha Traoré',
    customerPhone: '+225 05 12 88 94 00',
    lastMessage: "Merci pour le remboursement rapide ! J'ai bien reçu la notification Wave.",
    timestamp: '09:58',
    unreadCount: 0,
    status: 'RESOLVED',
    channel: 'WHATSAPP',
    assignedTo: 'Moussa D.',
    category: 'Facturation & Remboursement',
    messages: [
      {
        id: 'm10',
        sender: 'customer',
        senderName: 'Aïcha Traoré',
        text: "Bonjour, je souhaite un remboursement sur l'article retourné la semaine dernière.",
        time: '09:20',
      },
      {
        id: 'm11',
        sender: 'agent',
        senderName: 'Moussa D.',
        text: 'Bonjour Mme Traoré, je viens de valider votre remboursement de 25 000 FCFA via Wave.',
        time: '09:50',
      },
      {
        id: 'm12',
        sender: 'customer',
        senderName: 'Aïcha Traoré',
        text: "Merci pour le remboursement rapide ! J'ai bien reçu la notification Wave.",
        time: '09:58',
      },
    ],
  },
  {
    id: 'conv-103',
    customerName: 'Groupe Bâtir SA (M. Sékou)',
    customerPhone: '+225 01 02 03 04 05',
    lastMessage: 'Demande urgente de devis SAV pour la flotte de 12 groupes électrogènes.',
    timestamp: '09:15',
    unreadCount: 2,
    status: 'ESCALATED',
    channel: 'WHATSAPP',
    assignedTo: 'Sarah K. (Superviseur)',
    category: 'Contrat Entreprise',
    messages: [
      {
        id: 'm20',
        sender: 'customer',
        senderName: 'M. Sékou',
        text: 'Bonjour, nous avons une panne sur 3 groupes du chantier Zone 4. Nous souhaitons une intervention prioritaire sous 2h.',
        time: '09:10',
      },
      {
        id: 'm21',
        sender: 'ai',
        senderName: 'IA Zadesk N1',
        text: "Bien noté. Compte tenu de votre contrat Entreprise Gold, j'escalade immédiatement votre demande à Sarah K. de notre équipe technique d'urgence.",
        time: '09:12',
      },
      {
        id: 'm22',
        sender: 'customer',
        senderName: 'M. Sékou',
        text: 'Demande urgente de devis SAV pour la flotte de 12 groupes électrogènes.',
        time: '09:15',
      },
    ],
  },
];

export default function ConversationsPage() {
  const { currentWorkspace } = useWorkspace();
  const [conversations, setConversations] = useState(mockConversations);
  const [activeConvId, setActiveConvId] = useState<string>('conv-101');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [replyText, setReplyText] = useState('');

  const activeConv = conversations.find((c) => c.id === activeConvId) || conversations[0];

  const filteredConversations = conversations.filter((c) => {
    if (filterStatus !== 'ALL' && c.status !== filterStatus) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        c.customerName.toLowerCase().includes(q) ||
        c.customerPhone.includes(q) ||
        c.lastMessage.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !activeConv) return;

    const newMsg: Message = {
      id: `m-${Date.now()}`,
      sender: 'agent',
      senderName: 'Agent Zadesk',
      text: replyText.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConv.id
          ? {
              ...c,
              lastMessage: replyText.trim(),
              timestamp: newMsg.time,
              status: 'AGENT_PENDING',
              messages: [...c.messages, newMsg],
            }
          : c
      )
    );
    setReplyText('');
  };

  const handleAiSuggest = () => {
    setReplyText("Oui tout à fait ! L'agence Centrale du Plateau est ouverte sans interruption jusqu'à 18h30.");
  };

  return (
    <div className="h-[calc(100vh-7.5rem)] flex flex-col space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-emerald-400" />
            Boîte SAV WhatsApp
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Flux unifié temps réel — Chaque client WhatsApp dispose de son fil d&apos;échange continu.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#0D1B3D] border border-slate-800 text-xs">
          {[
            { id: 'ALL', label: 'Toutes' },
            { id: 'AI_PROCESSING', label: 'IA en cours' },
            { id: 'ESCALATED', label: 'Escaladées' },
            { id: 'RESOLVED', label: 'Résolues' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilterStatus(f.id)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                filterStatus === f.id
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Split Layout: 3 Columns (List / Chat Thread / Customer Info) */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-0">
        {/* Col 1: Conversations List (4 cols) */}
        <div className="lg:col-span-4 rounded-2xl bg-[#0D1B3D] border border-slate-800 flex flex-col min-h-0 overflow-hidden shadow-xl">
          {/* Search Box */}
          <div className="p-3 border-b border-slate-800/80 bg-[#070D18]/40">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Rechercher par nom, téléphone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50"
              />
            </div>
          </div>

          {/* List Scroll */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60 scrollbar-thin scrollbar-thumb-slate-800">
            {filteredConversations.map((conv) => {
              const active = conv.id === activeConvId;
              return (
                <div
                  key={conv.id}
                  onClick={() => setActiveConvId(conv.id)}
                  className={`p-3.5 transition-colors cursor-pointer relative ${
                    active
                      ? 'bg-slate-800/80 border-l-4 border-l-emerald-500'
                      : 'hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center text-white font-bold text-xs ring-1 ring-slate-700 shrink-0">
                        {conv.customerName.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-white truncate">
                          {conv.customerName}
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono">
                          {conv.customerPhone}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-400 shrink-0">
                      {conv.timestamp}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 mt-2 line-clamp-2 leading-relaxed">
                    {conv.lastMessage}
                  </p>

                  <div className="flex items-center justify-between mt-2.5">
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-medium">
                      {conv.category}
                    </span>

                    {conv.status === 'AI_PROCESSING' && (
                      <span className="text-[10px] font-semibold text-indigo-400 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        IA Répond
                      </span>
                    )}
                    {conv.status === 'ESCALATED' && (
                      <span className="text-[10px] font-semibold text-rose-400 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        Escalade
                      </span>
                    )}
                    {conv.status === 'RESOLVED' && (
                      <span className="text-[10px] font-semibold text-emerald-400 flex items-center gap-1">
                        <CheckCheck className="w-3 h-3" />
                        Résolu
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Col 2: Active Chat View (5 cols) */}
        <div className="lg:col-span-5 rounded-2xl bg-[#0D1B3D] border border-slate-800 flex flex-col min-h-0 overflow-hidden shadow-xl">
          {/* Thread Header */}
          <div className="p-3.5 border-b border-slate-800/80 bg-[#070D18]/50 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold text-xs">
                {activeConv.customerName.charAt(0)}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold text-white truncate">
                    {activeConv.customerName}
                  </h3>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-emerald-500/20 text-emerald-300">
                    WhatsApp
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 font-mono">
                  {activeConv.customerPhone}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleAiSuggest}
                className="px-2.5 py-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-medium flex items-center gap-1.5 transition-colors"
                title="Suggérer une réponse IA"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span className="hidden sm:inline">Suggestion IA</span>
              </button>
            </div>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 scrollbar-thin scrollbar-thumb-slate-800 bg-[#070D18]/20">
            {activeConv.messages.map((m) => {
              const isCustomer = m.sender === 'customer';
              const isAi = m.sender === 'ai';

              return (
                <div
                  key={m.id}
                  className={`flex flex-col ${isCustomer ? 'items-start' : 'items-end'}`}
                >
                  <div className="flex items-center gap-1.5 mb-1 text-[10px] text-slate-400 px-1">
                    {isAi && <Bot className="w-3 h-3 text-indigo-400" />}
                    <span>{m.senderName}</span>
                    <span>•</span>
                    <span>{m.time}</span>
                  </div>

                  <div
                    className={`max-w-[85%] p-3.5 rounded-2xl text-xs leading-relaxed shadow-md ${
                      isCustomer
                        ? 'bg-slate-800 text-slate-100 rounded-tl-sm border border-slate-700/60'
                        : isAi
                        ? 'bg-indigo-950/40 text-indigo-100 rounded-tr-sm border border-indigo-500/30'
                        : 'bg-emerald-600 text-white rounded-tr-sm'
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Reply Form */}
          <form
            onSubmit={handleSendReply}
            className="p-3 border-t border-slate-800/80 bg-[#070D18]/50 space-y-2 shrink-0"
          >
            <div className="relative">
              <input
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Répondre au client via WhatsApp..."
                className="w-full pl-3 pr-10 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50 shadow-inner"
              />
              <button
                type="submit"
                disabled={!replyText.trim()}
                className="absolute right-1.5 top-1.5 p-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-slate-950 disabled:opacity-30 transition-all"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-500 px-1">
              <span>Canal Zavu WhatsApp Chiffré</span>
              <span>Entrée pour envoyer</span>
            </div>
          </form>
        </div>

        {/* Col 3: Customer 360 & Continuous Dossier (3 cols) */}
        <div className="lg:col-span-3 rounded-2xl bg-[#0D1B3D] border border-slate-800 p-4 flex flex-col justify-between shadow-xl space-y-4">
          <div className="space-y-4">
            <div className="border-b border-slate-800/80 pb-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Profil Client 360°
              </span>
              <h4 className="text-sm font-bold text-white mt-1">
                {activeConv.customerName}
              </h4>
              <p className="text-xs text-emerald-400 font-mono">
                {activeConv.customerPhone}
              </p>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                <span className="text-slate-400">Statut Client</span>
                <span className="font-semibold text-emerald-400">Actif (VIP)</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                <span className="text-slate-400">Total Commandes</span>
                <span className="font-semibold text-white">14 commandes</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                <span className="text-slate-400">Score de Satisfaction</span>
                <span className="font-semibold text-emerald-400">4.9 / 5</span>
              </div>
            </div>

            <div className="pt-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Dossier de Continuité
              </span>
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">#TK-9482</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-medium">
                    En cours
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Suivi de livraison Colis Plateau
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800/80 space-y-2">
            <button
              onClick={() => alert('Dossier de continuité créé avec succès !')}
              className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors flex items-center justify-center gap-2"
            >
              <FolderKanban className="w-3.5 h-3.5 text-blue-400" />
              <span>Créer un Dossier de Suivi</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
