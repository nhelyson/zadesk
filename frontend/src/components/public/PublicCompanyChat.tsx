"use client";

import React, { useState, useRef, useEffect } from "react";
import { PublicCompany } from "@/types/public";
import {
  MessageSquare,
  Send,
  Sparkles,
  Bot,
  User,
  ShieldCheck,
  CheckCheck,
  Paperclip,
  Smile,
  Zap,
  HelpCircle,
  Clock,
  ChevronRight,
  ArrowDown,
  RotateCcw,
  CheckCircle2,
} from "lucide-react";

interface PublicMessage {
  id: string;
  sender: "customer" | "ai" | "agent" | "system";
  senderName?: string;
  text: string;
  time: string;
  systemType?: "HANDOFF" | "TICKET_CREATED" | "RESOLUTION";
}

interface PublicCompanyChatProps {
  company: PublicCompany;
}

export function PublicCompanyChat({ company }: PublicCompanyChatProps) {
  const [messages, setMessages] = useState<PublicMessage[]>([
    {
      id: "m-sys-init",
      sender: "system",
      text: `Canal SAV certifié et chiffré — ${company.name}`,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      systemType: "TICKET_CREATED",
    },
    {
      id: "m-welcome",
      sender: "ai",
      senderName: `Assistant SAV ${company.name}`,
      text: `Bonjour et bienvenue sur le service après-vente officiel de ${company.name} 👋.\n\nJe suis l'assistant intelligent de l'entreprise, disponible 24h/24 pour répondre à vos questions, traiter vos réclamations et vous mettre en relation directe avec nos agents. Comment puis-je vous aider aujourd'hui ?`,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);

  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [ticketRef, setTicketRef] = useState<string>(() => `ZD-${Math.floor(1000 + Math.random() * 9000)}`);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const defaultTopics = Array.isArray(company.supportCategories) && company.supportCategories.length > 0
    ? company.supportCategories
    : [
        "📦 Suivi de commande ou livraison",
        "💳 Facturation & Remboursement",
        "🛠️ Assistance technique & SAV",
        "👨‍💼 Parler à un conseiller humain",
      ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text) return;

    const userTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const userMsgId = `usr-${Date.now()}`;

    const newCustomerMsg: PublicMessage = {
      id: userMsgId,
      sender: "customer",
      senderName: customerName.trim() || "Vous",
      text,
      time: userTime,
    };

    setMessages((prev) => [...prev, newCustomerMsg]);
    if (!textToSend) setInput("");
    setIsTyping(true);

    // Simulate smart AI & Agent response tailored to company context
    setTimeout(() => {
      setIsTyping(false);
      const aiTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

      let replyText = "";
      let isHandoff = false;

      const lower = text.toLowerCase();
      if (lower.includes("livraison") || lower.includes("colis") || lower.includes("commande") || lower.includes("suivi")) {
        replyText = `J'ai bien noté votre demande concernant le suivi de votre commande chez ${company.name}.\n\nVeuillez renseigner votre numéro de commande ou bordereau (ex: #CMD-1234) afin que je vérifie immédiatement la position de votre colis auprès du service logistique.`;
      } else if (lower.includes("remboursement") || lower.includes("facture") || lower.includes("payer") || lower.includes("prix")) {
        replyText = `Votre demande de remboursement ou facturation a été prise en compte avec la référence #${ticketRef}.\n\nNos conseillers comptables vérifient votre dossier sous 15 minutes ouvrées.`;
        isHandoff = true;
      } else if (lower.includes("panne") || lower.includes("technique") || lower.includes("problème") || lower.includes("marche pas")) {
        replyText = `Navré pour ce désagrément technique avec votre produit ${company.name}. Notre équipe SAV prend immédiatement le relais pour vous guider dans le diagnostic ou programmer un échange sous garantie.`;
        isHandoff = true;
      } else if (lower.includes("agent") || lower.includes("humain") || lower.includes("conseiller") || lower.includes("parler")) {
        replyText = `Je transfère immédiatement votre conversation à un conseiller SAV disponible de l'équipe ${company.name}.`;
        isHandoff = true;
      } else {
        replyText = `Merci pour votre message. J'ai transmis votre demande aux équipes d'assistance de ${company.name}. Un conseiller ou une réponse automatisée personnalisée va vous répondre dans quelques instants.`;
      }

      const newMessages: PublicMessage[] = [
        {
          id: `ai-${Date.now()}`,
          sender: isHandoff ? "agent" : "ai",
          senderName: isHandoff ? `Support ${company.name}` : `Assistant SAV ${company.name}`,
          text: replyText,
          time: aiTime,
        },
      ];

      if (isHandoff) {
        newMessages.unshift({
          id: `sys-${Date.now()}`,
          sender: "system",
          text: `Prise en charge en cours par l'équipe SAV ${company.name} (Dossier #${ticketRef})`,
          time: aiTime,
          systemType: "HANDOFF",
        });
      }

      setMessages((prev) => [...prev, ...newMessages]);
    }, 1100);
  };

  const handleTopicClick = (topic: string) => {
    handleSendMessage(topic);
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-200/40 overflow-hidden flex flex-col h-[650px] sm:h-[700px] w-full">
      {/* 1. Chat Header */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-[#0D1B3D] to-[#152B5A] text-white flex items-center justify-between shrink-0 shadow-sm">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="relative">
            <div className="w-11 h-11 rounded-2xl bg-white text-slate-800 flex items-center justify-center font-black text-sm border-2 border-white/20 shadow-md overflow-hidden shrink-0">
              {company.logoUrl ? (
                <img src={company.logoUrl} alt={company.name} className="w-full h-full object-cover" />
              ) : (
                company.name.charAt(0)
              )}
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-[#0D1B3D] rounded-full" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="font-extrabold text-sm sm:text-base text-white truncate">
                SAV {company.name}
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-bold tracking-wide">
                En ligne
              </span>
            </div>
            <p className="text-[11px] text-slate-300 flex items-center gap-1.5 mt-0.5">
              <Sparkles className="w-3 h-3 text-emerald-400" />
              <span>Assistance IA & Agents certifiés • Réponse &lt; 2 min</span>
            </p>
          </div>
        </div>

        {/* Dossier Tag */}
        <div className="hidden sm:flex flex-col items-end text-right">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            N° Dossier SAV
          </span>
          <span className="text-xs font-mono font-extrabold text-emerald-400 bg-white/10 px-2 py-0.5 rounded-lg">
            #{ticketRef}
          </span>
        </div>
      </div>

      {/* 2. Chat Conversation Viewport */}
      <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-[#F8FAFC] scrollbar-thin scrollbar-thumb-slate-200">
        {/* Security & Verification Banner */}
        <div className="flex items-center justify-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] font-medium text-emerald-800 shadow-2xs">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Portail client officiel vérifié par Zadesk — Aucun compte requis</span>
          </div>
        </div>

        {/* Day Separator */}
        <div className="flex items-center justify-center my-2">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider bg-slate-200/60 px-3 py-0.5 rounded-full">
            Aujourd&apos;hui
          </span>
        </div>

        {/* Message Stream */}
        {messages.map((m) => {
          if (m.sender === "system") {
            return (
              <div key={m.id} className="flex items-center justify-center my-3">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-100 border border-slate-200/90 text-[11px] font-medium text-slate-600 shadow-2xs">
                  {m.systemType === "HANDOFF" ? (
                    <Zap className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  ) : (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  )}
                  <span>{m.text}</span>
                  <span className="text-[9px] text-slate-400 font-mono">• {m.time}</span>
                </div>
              </div>
            );
          }

          const isCustomer = m.sender === "customer";
          const isAi = m.sender === "ai";

          return (
            <div
              key={m.id}
              className={`flex flex-col ${isCustomer ? "items-end" : "items-start"}`}
            >
              <div className="flex items-center gap-1.5 mb-1 text-[10px] text-slate-400 px-1 font-medium">
                {isAi ? (
                  <Bot className="w-3 h-3 text-emerald-600" />
                ) : !isCustomer ? (
                  <ShieldCheck className="w-3 h-3 text-[#0D1B3D]" />
                ) : (
                  <User className="w-3 h-3 text-slate-500" />
                )}
                <span>{m.senderName}</span>
                <span>•</span>
                <span>{m.time}</span>
              </div>

              <div
                className={`max-w-[88%] sm:max-w-[78%] p-4 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-xs ${
                  isCustomer
                    ? "bg-[#0D1B3D] text-white rounded-tr-xs shadow-md shadow-[#0D1B3D]/10"
                    : isAi
                    ? "bg-white text-slate-900 rounded-tl-xs border border-slate-200/90 shadow-2xs"
                    : "bg-emerald-50 text-emerald-950 rounded-tl-xs border border-emerald-200 shadow-2xs"
                }`}
              >
                <p className="whitespace-pre-line">{m.text}</p>
                {isCustomer && (
                  <div className="flex items-center justify-end gap-1 mt-1.5 text-[9px] text-white/70">
                    <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Live Typing Indicator */}
        {isTyping && (
          <div className="flex flex-col items-start">
            <div className="flex items-center gap-1.5 mb-1 text-[10px] text-slate-400 px-1 font-medium">
              <Bot className="w-3 h-3 text-emerald-600" />
              <span>SAV {company.name} rédige...</span>
            </div>
            <div className="p-3 rounded-2xl rounded-tl-xs bg-white border border-slate-200 text-slate-400 flex items-center gap-1.5 shadow-2xs">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 3. Quick Starter Prompt Chips */}
      <div className="p-3 bg-white border-t border-slate-100 flex items-center gap-2 overflow-x-auto scrollbar-none shrink-0">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap pl-1">
          Suggestions :
        </span>
        {defaultTopics.map((topic, i) => (
          <button
            key={i}
            type="button"
            onClick={() => handleTopicClick(topic)}
            className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 border border-slate-200/90 text-xs font-semibold text-slate-700 hover:text-emerald-900 whitespace-nowrap transition-all duration-150 cursor-pointer shadow-2xs active:scale-98"
          >
            {topic}
          </button>
        ))}
      </div>

      {/* 4. Message Input & Control Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="p-3 sm:p-4 bg-white border-t border-slate-100 shrink-0 space-y-2"
      >
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Écrire un message au SAV ${company.name}...`}
            className="flex-1 px-4 py-3 text-xs sm:text-sm text-slate-900 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 focus:bg-white transition-all placeholder:text-slate-400"
          />

          <button
            type="submit"
            disabled={!input.trim()}
            className="px-4 py-3 bg-[#0D1B3D] hover:bg-[#152B5A] active:scale-95 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-md transition-all flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <span>Envoyer</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-400 px-1 pt-0.5">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Canal SAV Zadesk sécurisé</span>
          </span>
          <span className="hidden sm:inline">Appuyez sur Entrée pour envoyer</span>
        </div>
      </form>
    </div>
  );
}
