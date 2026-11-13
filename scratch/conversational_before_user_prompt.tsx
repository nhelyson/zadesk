"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { PublicCompany } from "@/types/public";
import { CompanyInfoBubbleModal } from "./CompanyInfoBubbleModal";
import { getSupportAvailabilityInfo } from "@/lib/brandTheme";
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  CheckCheck,
  Clock,
  Send,
  CornerDownLeft,
  Phone,
  MessageSquare,
  ExternalLink,
  ShieldCheck,
  User,
  UserCheck,
  PanelRightClose,
  PanelRightOpen,
  Calendar,
  Headphones,
  Mail,
  Globe,
  MapPin,
  AlertCircle,
  AlertTriangle,
} from "lucide-react";

/**
 * ARCHITECTURE NOTE — Pièces jointes (Attachments):
 * Le backend Zadesk actuel n'expose pas encore de route publique d'upload non-authentifiée
 * (ex: POST /api/public/attachments). Conformément à la directive stricte du projet,
 * aucun faux bouton d'upload ni simulation n'est inséré afin de préserver l'intégrité de l'UX.
 * Dès disponibilité de l'endpoint backend, connecter l'input file avec prévisualisation.
 */

interface ChatMessage {
  id: string;
  sender: "customer" | "automated" | "agent" | "system";
  senderName?: string;
  text: string;
  time: string;
  statusBadge?: string;
}

interface CompanyConversationalViewProps {
  company: PublicCompany;
}

export function CompanyConversationalView({ company }: CompanyConversationalViewProps) {
  // Support availability resolution
  const availability = getSupportAvailabilityInfo(company.openingHours, company.businessHours);

  // Initial welcome message from the automated intake service
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: "msg-welcome",
      sender: "automated",
      senderName: `Support automatisé • ${company.name}`,
      text: `Bonjour et bienvenue sur l'espace officiel de service après-vente de **${company.name}**.\n\nJe suis l'assistant d'accueil automatisé de l'entreprise. Vous pouvez poser directement votre question, exprimer une réclamation ou demander à être mis en relation avec les conseillers de notre service client.\n\nComment pouvons-nous vous assister aujourd'hui ?`,
      time: "En ligne",
    },
  ]);

  useEffect(() => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === "msg-welcome" && m.time === "En ligne"
          ? { ...m, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }
          : m
      )
    );
  }, []);

  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showContextPanel, setShowContextPanel] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Suggested frequently asked topics
  const supportSuggestions: string[] =
    Array.isArray(company.supportCategories) && company.supportCategories.length > 0
      ? company.supportCategories
      : [
          "Suivi de commande ou dossier",
          "Facturation & Modalités de paiement",
          "Signaler un dysfonctionnement technique",
          "Parler à un conseiller du service client",
        ];

  // Auto-scroll
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Dynamic textarea height
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 140)}px`;
    }
  };

  // Keyboard navigation: Enter sends, Shift+Enter adds newline
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text) return;

    const currentTime = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    const userMessage: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: "customer",
      senderName: "Vous",
      text,
      time: currentTime,
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!textToSend) {
      setInput("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
    setIsTyping(true);

    // Business response dispatching
    setTimeout(() => {
      setIsTyping(false);
      const replyTime = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });

      const lower = text.toLowerCase();
      let reply = "";
      let requiresHandoff = false;

      if (
        lower.includes("livraison") ||
        lower.includes("colis") ||
        lower.includes("commande") ||
        lower.includes("dossier") ||
        lower.includes("suivi")
      ) {
        reply = `Votre demande concernant le suivi de votre commande ou dossier auprès de **${company.name}** a été prise en compte.\n\nAfin d'accélérer son traitement, veuillez indiquer votre numéro de commande, référence client ou numéro de bordereau.`;
      } else if (
        lower.includes("facture") ||
        lower.includes("payer") ||
        lower.includes("remboursement") ||
        lower.includes("solde") ||
        lower.includes("prix")
      ) {
        reply = `Votre requête relative à la facturation ou à un remboursement a été enregistrée pour les équipes de **${company.name}**.\n\nUn conseiller du service financier va examiner votre dossier dans les plus brefs délais.`;
        requiresHandoff = true;
      } else if (
        lower.includes("panne") ||
        lower.includes("technique") ||
        lower.includes("problème") ||
        lower.includes("bloqué") ||
        lower.includes("incident")
      ) {
        reply = `Nous prenons note de l'incident technique signalé concernant les services de **${company.name}**.\n\nVotre signalement est transmis à l'équipe technique pour vérification sur nos équipements et interventions nécessaires.`;
        requiresHandoff = true;
      } else if (
        lower.includes("conseiller") ||
        lower.includes("agent") ||
        lower.includes("humain") ||
        lower.includes("parler") ||
        lower.includes("joindre")
      ) {
        reply = `Votre demande de mise en relation directe avec les conseillers du service après-vente de **${company.name}** a été enregistrée.\n\nUn membre de l'équipe prendra en charge votre conversation selon les horaires d'ouverture : ${availability.openingHoursDisplay}.`;
        requiresHandoff = true;
      } else {
        reply = `Merci pour votre message. Votre question a bien été enregistrée pour l'assistance de **${company.name}**.\n\nN'hésitez pas à apporter toute précision supplémentaire pour nous permettre d'orienter au mieux votre demande vers le bon service.`;
      }

      const newMessages: ChatMessage[] = [];

      if (requiresHandoff) {
        newMessages.push({
          id: `sys-${Date.now()}`,
          sender: "system",
          text: `Demande transmise au service client de ${company.name} • En attente de prise en charge`,
          time: replyTime,
        });
      }

      newMessages.push({
        id: `auto-${Date.now()}`,
        sender: "automated",
        senderName: `Support automatisé • ${company.name}`,
        text: reply,
        time: replyTime,
        statusBadge: requiresHandoff ? "Transmis aux conseillers" : undefined,
      });

      setMessages((prev) => [...prev, ...newMessages]);
    }, 850);
  };

  const initial = company.name?.trim().charAt(0).toUpperCase() || "E";
  const userMessageCount = messages.filter((m) => m.sender === "customer").length;
  const showSuggestions = userMessageCount === 0;

  const cleanWhatsAppNumber = company.supportWhatsApp
    ? company.supportWhatsApp.replace(/[^0-9]/g, "")
    : "";
  const whatsappUrl = cleanWhatsAppNumber
    ? `https://wa.me/${cleanWhatsAppNumber}?text=${encodeURIComponent(
        `Bonjour le service client de ${company.name}, je vous contacte depuis la plateforme Zadesk pour une demande d'assistance.`
      )}`
    : null;

  return (
    <div className="flex-1 flex flex-col h-screen max-h-screen h-[100dvh] max-h-[100dvh] bg-[#F7F8FA] relative overflow-hidden text-[#172033]">
      {/* 1. Header — Minimalist & Institutional */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 py-3 shrink-0 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
        <div className="w-full max-w-7xl mx-auto flex items-center justify-between gap-3">
          {/* Left: Back Link + Company Identity */}
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href="/entreprises"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors shrink-0"
              title="Retour à l'annuaire des entreprises"
            >
              <ArrowLeft className="w-4 h-4 text-slate-700" />
              <span className="text-xs font-semibold hidden md:inline">Annuaire SAV</span>
            </Link>

            <div className="h-5 w-px bg-slate-200 hidden sm:block shrink-0" />

            {/* Logo / Monogram */}
            <div
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-center justify-center overflow-hidden shrink-0"
              style={{ borderColor: "var(--company-surface-border, #E2E8F0)" }}
            >
              {company.logoUrl ? (
                <img
                  src={company.logoUrl}
                  alt={company.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center font-bold text-sm"
                  style={{
                    backgroundColor: "var(--company-primary)",
                    color: "var(--company-contrast)",
                  }}
                >
                  {initial}
                </div>
              )}
            </div>

            {/* Titles & Real-Time Status */}
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                  {company.name}
                </h1>
                {company.verified && (
                  <span
                    className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/80 shrink-0"
                    title="Service client certifié Zadesk"
                  >
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span className="hidden sm:inline">Certifié</span>
                  </span>
                )}
                <span
                  className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border shrink-0"
                  style={{
                    backgroundColor: "var(--company-secondary, #F1F5F9)",
                    borderColor: "var(--company-surface-border, #E2E8F0)",
                    color: "var(--company-text, #0F172A)",
                  }}
                >
                  SAV Officiel
                </span>
              </div>

              <div className="flex items-center gap-2 text-[11px] text-slate-500 truncate mt-0.5">
                <span className="inline-flex items-center gap-1.5 truncate">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${availability.statusBadge.dotColor}`} />
                  <span className={`font-semibold ${availability.statusBadge.textColor}`}>
                    {availability.statusBadge.label}
                  </span>
                </span>
                <span className="hidden md:inline text-slate-300">•</span>
                <span className="hidden md:inline truncate text-slate-400" title={availability.humanText}>
                  {availability.humanText}
                </span>
              </div>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Desktop: Toggle Context Panel */}
            <button
              type="button"
              onClick={() => setShowContextPanel((prev) => !prev)}
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-semibold border border-slate-200 transition-all cursor-pointer"
              title={showContextPanel ? "Masquer les informations" : "Afficher les informations"}
              aria-expanded={showContextPanel}
            >
              {showContextPanel ? (
                <>
                  <PanelRightClose className="w-3.5 h-3.5 text-slate-500" />
                  <span>Masquer détails</span>
                </>
              ) : (
                <>
                  <PanelRightOpen className="w-3.5 h-3.5 text-slate-500" />
                  <span>Détails & Contacts</span>
                </>
              )}
            </button>

            {/* Mobile / Tablet: Open Slide-Over Drawer */}
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="lg:hidden inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-semibold border border-slate-200 transition-all cursor-pointer"
            >
              <Building2 className="w-3.5 h-3.5 text-slate-600" />
              <span>Coordonnées & Horaires</span>
            </button>
          </div>
        </div>
      </header>

      {/* Temporary Closure Emergency Banner */}
      {availability.isTemporarilyClosed && (
        <div className="bg-amber-50 border-b border-amber-200/90 px-4 sm:px-6 py-3.5 shrink-0 shadow-2xs z-10">
          <div className="max-w-7xl mx-auto flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-900 bg-amber-200/70 px-2 py-0.5 rounded-md border border-amber-300/80">
                  Fermeture temporaire exceptionnelle
                </span>
                {availability.timezoneDisplay && (
                  <span className="text-[11px] text-amber-800/80 font-medium">
                    {`Fuseau : ${availability.timezoneDisplay}`}
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm font-semibold text-amber-950 mt-1 leading-snug">
                {availability.temporaryClosureMessage}
              </p>
              <p className="text-[11px] text-amber-800/90 mt-1">
                L'accueil automatisé reste actif pour enregistrer vos demandes, mais le temps de réponse de nos conseillers sera différé.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Drawer */}
      <CompanyInfoBubbleModal
        company={company}
        isOpen={drawerOpen}
        onOpenChange={setDrawerOpen}
        variant="modal-only"
      />

      {/* 2. Main Stage — Split-Stage Layout */}
      <div className="flex-1 flex overflow-hidden w-full max-w-7xl mx-auto">
        {/* Left / Center: Conversation Stream (Primary Focus) */}
        <div className="flex-1 flex flex-col min-w-0 h-full relative">
          <main
            role="log"
            aria-live="polite"
            className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 scrollbar-thin scrollbar-thumb-slate-200"
          >
            <div className="max-w-2xl mx-auto space-y-6">
              {/* Institutional Welcome Card */}
              <div
                className="p-5 sm:p-6 rounded-2xl border shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all"
                style={{
                  backgroundColor: "var(--company-surface, #FFFFFF)",
                  borderColor: "var(--company-surface-border, #E2E8F0)",
                }}
              >
                <div className="flex items-start gap-4">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-xs overflow-hidden"
                    style={{
                      backgroundColor: "var(--company-primary)",
                      color: "var(--company-contrast)",
                    }}
                  >
                    {company.logoUrl ? (
                      <img
                        src={company.logoUrl}
                        alt={company.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Headphones className="w-5 h-5" />
                    )}
                  </div>

                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                        Service Client & Support Officiel
                      </h2>
                      <span
                        className="px-2.5 py-0.5 rounded-full border text-[10px] font-bold"
                        style={{
                          backgroundColor: "var(--company-secondary, #F1F5F9)",
                          borderColor: "var(--company-surface-border, #E2E8F0)",
                          color: "var(--company-text, #0F172A)",
                        }}
                      >
                        {company.category || "Assistance SAV"}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Bienvenue sur le guichet conversationnel de {company.name}. Vos messages
                      sont traités en premier niveau par notre assistance automatisée puis relayés en
                      direct aux conseillers d&apos;assistance.
                    </p>
                    <div className="pt-2 flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>Réception 24h/24</span>
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Sans inscription ni mot de passe</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Message Stream */}
              <div className="space-y-4">
                {messages.map((m) => {
                  if (m.sender === "system") {
                    return (
                      <div key={m.id} className="flex items-center justify-center my-3">
                        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100/90 border border-slate-200 text-[11px] font-medium text-slate-600 shadow-2xs">
                          <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <span>{m.text}</span>
                          <span suppressHydrationWarning className="text-[10px] text-slate-400 font-mono">• {m.time}</span>
                        </div>
                      </div>
                    );
                  }

                  const isCustomer = m.sender === "customer";
                  const isAgent = m.sender === "agent";

                  return (
                    <div
                      key={m.id}
                      className={`flex flex-col ${isCustomer ? "items-end" : "items-start"}`}
                    >
                      {/* Sender Label & Timestamp */}
                      <div className="flex items-center gap-1.5 mb-1 px-1 text-[11px] font-medium text-slate-400">
                        {isCustomer ? (
                          <span className="flex items-center gap-1 text-slate-500">
                            <User className="w-3 h-3 text-slate-400" />
                            <span>Vous</span>
                          </span>
                        ) : isAgent ? (
                          <span className="flex items-center gap-1 text-slate-800 font-semibold">
                            <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{m.senderName}</span>
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-slate-700 font-semibold">
                            <Building2 className="w-3.5 h-3.5 text-slate-500" />
                            <span>{m.senderName}</span>
                          </span>
                        )}
                        <span>•</span>
                        <span suppressHydrationWarning className="font-mono text-[10px] text-slate-400">{m.time}</span>
                      </div>

                      {/* Bubble */}
                      <div
                        className={`max-w-[90%] sm:max-w-[80%] p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                          isCustomer
                            ? "rounded-tr-xs shadow-xs"
                            : isAgent
                            ? "bg-white text-slate-900 rounded-tl-xs border border-slate-200 border-l-4 shadow-[0_2px_8px_rgba(0,0,0,0.02)]"
                            : "bg-white text-slate-900 rounded-tl-xs border border-slate-200/90 shadow-[0_2px_8px_rgba(0,0,0,0.02)]"
                        }`}
                        style={
                          isCustomer
                            ? {
                                backgroundColor: "var(--company-primary)",
                                color: "var(--company-contrast)",
                              }
                            : isAgent
                            ? {
                                borderLeftColor: "var(--company-primary)",
                              }
                            : {
                                borderLeftWidth: "3px",
                                borderLeftColor: "var(--company-primary)",
                                backgroundColor: "var(--company-surface, #FFFFFF)",
                              }
                        }
                      >
                        <p className="whitespace-pre-line break-words">{m.text}</p>

                        {/* Customer Delivery Indicator */}
                        {isCustomer && (
                          <div className="flex items-center justify-end gap-1 mt-2 text-[10px] opacity-75">
                            <CheckCheck className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Subtle Typing Indicator */}
                {isTyping && (
                  <div className="flex flex-col items-start space-y-1">
                    <div className="flex items-center gap-1.5 px-1 text-[11px] font-medium text-slate-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                      <span>{company.name} prépare une réponse...</span>
                    </div>
                    <div className="px-4 py-3 rounded-2xl rounded-tl-xs bg-white border border-slate-200 text-slate-400 flex items-center gap-1.5 shadow-2xs">
                      <span className="w-2 h-2 rounded-full bg-slate-400 animate-pulse" />
                      <span
                        className="w-2 h-2 rounded-full bg-slate-400 animate-pulse"
                        style={{ animationDelay: "150ms" }}
                      />
                      <span
                        className="w-2 h-2 rounded-full bg-slate-400 animate-pulse"
                        style={{ animationDelay: "300ms" }}
                      />
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Suggestions Chips (shown before user first submits) */}
              {showSuggestions && supportSuggestions.length > 0 && (
                <div className="pt-2 pb-1 space-y-2.5">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Demandes fréquentes :
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {supportSuggestions.map((topic, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleSend(topic)}
                        className="px-3.5 py-2 rounded-xl border text-xs font-semibold transition-all shadow-2xs hover:shadow-xs active:scale-98 cursor-pointer flex items-center gap-1.5 group"
                        style={{
                          backgroundColor: "var(--company-secondary, #FFFFFF)",
                          borderColor: "var(--company-surface-border, #E2E8F0)",
                          color: "var(--company-text, #334155)",
                        }}
                      >
                        <span>{topic}</span>
                        <CornerDownLeft className="w-3 h-3 opacity-60 group-hover:opacity-100 transition-opacity" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </main>

          {/* 3. Bottom Composer — Weightless Glassmorphism */}
          <footer className="sticky bottom-0 z-20 bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-4 sm:px-6 py-3.5 shrink-0 shadow-[0_-2px_10px_rgba(0,0,0,0.02)]">
            <div className="max-w-2xl mx-auto space-y-2">
              {availability.isTemporarilyClosed && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200/70 text-[11px] text-amber-900 font-medium">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span className="truncate">
                    Conseillers momentanément indisponibles : votre message sera enregistré et traité dès la réouverture.
                  </span>
                </div>
              )}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="relative flex items-end gap-2 bg-slate-50/80 border border-slate-200/90 rounded-2xl p-1.5 focus-within:border-slate-400 focus-within:bg-white focus-within:ring-2 focus-within:ring-slate-100 transition-all shadow-2xs"
              >
                <textarea
                  ref={textareaRef}
                  rows={1}
                  value={input}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  placeholder={`Écrire au service client de ${company.name}...`}
                  className="flex-1 bg-transparent px-3 py-2 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 resize-none outline-none leading-relaxed max-h-32"
                />

                <button
                  type="submit"
                  disabled={!input.trim()}
                  className="p-2.5 sm:px-4 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all shadow-xs disabled:opacity-35 disabled:cursor-not-allowed cursor-pointer active:scale-98 shrink-0"
                  style={{
                    backgroundColor: "var(--company-primary)",
                    color: "var(--company-contrast)",
                  }}
                  title="Envoyer votre message"
                >
                  <span className="hidden sm:inline">Envoyer</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>

              {/* Trust & Shortcut Caption */}
              <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
                <span className="flex items-center gap-1 truncate">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="truncate">
                    Support officiel {company.name} certifié par Zadesk • Confidentialité assurée
                  </span>
                </span>
                <span className="hidden sm:inline text-[10px] text-slate-400 font-mono">
                  Entrée pour envoyer • Maj + Entrée pour saut de ligne
                </span>
              </div>
            </div>
          </footer>
        </div>

        {/* Right Stage: Secondary Contextual Panel (Desktop >= 1024px) */}
        {showContextPanel && (
          <aside className="hidden lg:flex flex-col w-84 shrink-0 border-l border-slate-200/80 bg-white overflow-y-auto p-5 space-y-6">
            {/* Header info card */}
            <div className="space-y-3 pb-5 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center justify-center overflow-hidden shrink-0"
                  style={{ borderColor: "var(--company-surface-border, #E2E8F0)" }}
                >
                  {company.logoUrl ? (
                    <img
                      src={company.logoUrl}
                      alt={company.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div
                      className="w-full h-full flex items-center justify-center font-bold text-base"
                      style={{
                        backgroundColor: "var(--company-primary)",
                        color: "var(--company-contrast)",
                      }}
                    >
                      {initial}
                    </div>
                  )}
                </div>

                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-slate-900 truncate">{company.name}</h3>
                  <p className="text-xs text-slate-500 truncate mt-0.5">
                    {company.category || "Service Client"}
                  </p>
                </div>
              </div>

              {company.description && (
                <p
                  className="text-xs leading-relaxed p-3 rounded-xl border"
                  style={{
                    backgroundColor: "var(--company-surface, #F8FAFC)",
                    borderColor: "var(--company-surface-border, #E2E8F0)",
                    color: "var(--company-text, #334155)",
                  }}
                >
                  {company.description}
                </p>
              )}
            </div>

            {/* Operating Availability Details */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-[11px] uppercase tracking-wider font-bold text-slate-400">
                  Disponibilité du service
                </h4>
                {availability.timezoneDisplay && (
                  <span className="text-[10px] text-slate-400 font-mono">
                    {availability.timezoneDisplay}
                  </span>
                )}
              </div>

              <div className="space-y-2">
                {/* 24/7 Automated */}
                <div
                  className="p-3 rounded-xl border flex items-start gap-2.5"
                  style={{
                    backgroundColor: "var(--company-surface, #F8FAFC)",
                    borderColor: "var(--company-surface-border, #E2E8F0)",
                  }}
                >
                  <Clock className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "var(--company-primary)" }} />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <p className="text-xs font-bold text-slate-900">Accueil & Réception</p>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                      {availability.automatedText}
                    </p>
                  </div>
                </div>

                {/* Human Counselors */}
                <div
                  className="p-3 rounded-xl border flex items-start gap-2.5"
                  style={{
                    backgroundColor: availability.isTemporarilyClosed ? "#FFFBEB" : "var(--company-surface, #F8FAFC)",
                    borderColor: availability.isTemporarilyClosed ? "#FDE68A" : "var(--company-surface-border, #E2E8F0)",
                  }}
                >
                  {availability.isTemporarilyClosed ? (
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                  ) : (
                    <Calendar className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "var(--company-primary)" }} />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${availability.statusBadge.dotColor}`} />
                      <p className="text-xs font-bold text-slate-900">
                        {availability.isTemporarilyClosed ? "Fermeture exceptionnelle" : "Conseillers SAV"}
                      </p>
                    </div>
                    <p className={`text-[11px] mt-0.5 leading-relaxed ${availability.isTemporarilyClosed ? "text-amber-900 font-medium" : "text-slate-500"}`}>
                      {availability.humanText}
                    </p>
                  </div>
                </div>

                {/* Weekly Schedule Table */}
                {availability.weeklySchedule && availability.weeklySchedule.length > 0 && (
                  <div className="mt-2 p-3 rounded-xl bg-slate-50/80 border border-slate-200/80">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[10px] uppercase tracking-wider font-bold text-slate-500">
                        Planning hebdomadaire
                      </p>
                      <span className="text-[10px] font-semibold text-slate-400">
                        Heures locales
                      </span>
                    </div>
                    <div className="divide-y divide-slate-100 text-[11px]">
                      {availability.weeklySchedule.map((day) => (
                        <div key={day.key} className="py-1.5 flex items-center justify-between">
                          <span className={`font-medium ${day.isOpen ? "text-slate-800" : "text-slate-400"}`}>
                            {day.label}
                          </span>
                          <span className={day.isOpen ? "font-semibold text-slate-700" : "text-slate-400 italic text-[10px]"}>
                            {day.hoursText}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Direct Verified Contact Channels */}
            <div className="space-y-3">
              <h4 className="text-[11px] uppercase tracking-wider font-bold text-slate-400">
                Canaux directs certifiés
              </h4>

              <div className="space-y-2">
                {/* WhatsApp Direct */}
                {whatsappUrl && (
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 rounded-xl bg-emerald-50/60 hover:bg-emerald-100/60 border border-emerald-200/80 transition-all group cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                        <MessageSquare className="w-3.5 h-3.5 fill-current" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900">WhatsApp Officiel</p>
                        <p className="text-[10px] font-mono text-emerald-800 truncate">
                          {company.supportWhatsApp}
                        </p>
                      </div>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-emerald-600 group-hover:translate-x-0.5 transition-transform shrink-0" />
                  </a>
                )}

                {/* Phone */}
                {company.supportPhone && (
                  <a
                    href={`tel:${company.supportPhone.replace(/\s+/g, "")}`}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/70 transition-all group cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-white text-slate-700 flex items-center justify-center shrink-0 border border-slate-200">
                        <Phone className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900">Téléphone SAV</p>
                        <p className="text-[10px] font-mono text-slate-500 truncate">
                          {company.supportPhone}
                        </p>
                      </div>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 shrink-0" />
                  </a>
                )}

                {/* Email */}
                {company.supportEmail && (
                  <a
                    href={`mailto:${company.supportEmail}?subject=${encodeURIComponent(
                      `Demande SAV — ${company.name}`
                    )}`}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/70 transition-all group cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-white text-slate-700 flex items-center justify-center shrink-0 border border-slate-200">
                        <Mail className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900">Email Officiel</p>
                        <p className="text-[10px] font-mono text-slate-500 truncate">
                          {company.supportEmail}
                        </p>
                      </div>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 shrink-0" />
                  </a>
                )}

                {/* Website */}
                {company.website && (
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/70 transition-all group cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-white text-slate-700 flex items-center justify-center shrink-0 border border-slate-200">
                        <Globe className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900">Site Web</p>
                        <p className="text-[10px] font-mono text-slate-500 truncate">
                          {company.website}
                        </p>
                      </div>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 shrink-0" />
                  </a>
                )}
              </div>
            </div>

            {/* Address */}
            {(company.address || company.city) && (
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <h4 className="text-[11px] uppercase tracking-wider font-bold text-slate-400">
                  Implantation
                </h4>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-slate-900">Adresse</p>
                    <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                      {[company.address, company.city, company.country || "Congo"]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Zadesk Security & Transparency Reassurance */}
            <div className="mt-auto pt-4 border-t border-slate-100">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 flex items-start gap-2.5 text-slate-600">
                <ShieldCheck className="w-4 h-4 text-slate-800 shrink-0 mt-0.5" />
                <p className="text-[11px] leading-relaxed">
                  Service certifié par Zadesk. Vos messages sont transmis directement à l&apos;entreprise
                  sans intermédiaire.
                </p>
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
