"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { PublicCompany } from "@/types/public";
import { CompanyInfoBubbleModal } from "./CompanyInfoBubbleModal";
import { EstablishmentModal } from "./EstablishmentModal";
import { CompanyPublicHeader } from "./CompanyPublicHeader";
import { CompanyHeroCard } from "./CompanyHeroCard";
import { getSupportAvailabilityInfo } from "@/lib/brandTheme";
import { sendPublicChatMessage, fetchPublicChatMessages } from "@/lib/publicApi";
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  CheckCheck,
  Clock,
  Send,
  ArrowUp,
  Plus,
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
  Store,
  AlertCircle,
  AlertTriangle,
  Paperclip,
  FileText,
  X,
  FileUp,
  Image as ImageIcon,
} from "lucide-react";

export interface ChatAttachment {
  id: string;
  name: string;
  size: number;
  type?: string;
  isImage: boolean;
  url?: string;
  file?: File;
}

interface ChatMessage {
  id: string;
  sender: "customer" | "automated" | "agent" | "system";
  senderName?: string;
  text: string;
  time: string;
  statusBadge?: string;
  attachments?: ChatAttachment[];
}

interface CompanyConversationalViewProps {
  company: PublicCompany;
}

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
};

export function CompanyConversationalView({ company }: CompanyConversationalViewProps) {
  // Support availability resolution
  const availability = getSupportAvailabilityInfo(company.openingHours, company.businessHours);

  // Initial welcome message from the verified customer service desk
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: "msg-welcome",
      sender: "agent",
      senderName: `Service Client • ${company.name}`,
      text: `Bonjour et bienvenue sur l'espace officiel de service client de **${company.name}**.\n\nVous pouvez nous détailler votre question, exprimer une réclamation ou demander une assistance technique. Notre équipe prendra directement en charge votre dossier.\n\nComment pouvons-nous vous aider aujourd'hui ?`,
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
  const [attachments, setAttachments] = useState<ChatAttachment[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedEstId, setSelectedEstId] = useState<string | null>(null);
  const [isEstModalOpen, setIsEstModalOpen] = useState(false);
  const [showContextPanel, setShowContextPanel] = useState(true);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(null);

  // Charger la conversation réelle existante au montage
  useEffect(() => {
    if (typeof window === "undefined") return;
    const storedConvId = localStorage.getItem(`zadesk_public_conv_${company.slug}`);
    const storedToken = localStorage.getItem(`zadesk_public_token_${company.slug}`);
    if (storedConvId) {
      setConversationId(storedConvId);
      if (storedToken) setSessionToken(storedToken);
      fetchPublicChatMessages(company.slug, storedConvId, storedToken).then((res) => {
        if (res.success && res.messages && res.messages.length > 0) {
          const loaded: ChatMessage[] = res.messages.map((m: any) => ({
            id: m.id,
            sender: m.senderType === "CUSTOMER" ? "customer" : "agent",
            senderName: m.senderType === "CUSTOMER" ? "Vous" : (m.senderName || `Service Client • ${company.name}`),
            text: m.content,
            time: new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          }));
          setMessages([
            {
              id: "msg-welcome",
              sender: "agent",
              senderName: `Service Client • ${company.name}`,
              text: `Bonjour et bienvenue sur l'espace officiel de service client de **${company.name}**.\n\nVous pouvez nous détailler votre question, exprimer une réclamation ou demander une assistance technique. Notre équipe prendra directement en charge votre dossier.\n\nComment pouvons-nous vous aider aujourd'hui ?`,
              time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            },
            ...loaded,
          ]);
        }
      });
    }
  }, [company.slug, company.name]);

  // Synchronisation temps réel des réponses des conseillers SAV
  useEffect(() => {
    if (!conversationId) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetchPublicChatMessages(company.slug, conversationId, sessionToken);
        if (res.success && res.messages && res.messages.length > 0) {
          const loaded: ChatMessage[] = res.messages.map((m: any) => ({
            id: m.id,
            sender: m.senderType === "CUSTOMER" ? "customer" : "agent",
            senderName: m.senderType === "CUSTOMER" ? "Vous" : (m.senderName || `Service Client • ${company.name}`),
            text: m.content,
            time: new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          }));

          setMessages((prev) => {
            const welcome = prev.find((m) => m.id === "msg-welcome");
            const pendingUsr = prev.filter(
              (p) => p.id.startsWith("usr-") && !loaded.some((l) => l.text === p.text)
            );
            return [
              welcome || {
                id: "msg-welcome",
                sender: "agent",
                senderName: `Service Client • ${company.name}`,
                text: `Bonjour et bienvenue sur l'espace officiel de service client de **${company.name}**.\n\nComment pouvons-nous vous aider aujourd'hui ?`,
                time: "En ligne",
              },
              ...loaded,
              ...pendingUsr,
            ];
          });
        }
      } catch (err) {
        // Ignorer les erreurs silencieuses réseau
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [conversationId, sessionToken, company.slug, company.name]);

  const handleOpenEstablishment = (estId: string) => {
    setSelectedEstId(estId);
    setIsEstModalOpen(true);
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, attachments]);

  // Clean up object URLs on unmount or file removal
  useEffect(() => {
    return () => {
      attachments.forEach((att) => {
        if (att.url) URL.revokeObjectURL(att.url);
      });
    };
  }, [attachments]);

  // Dynamic textarea height
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  };

  // Keyboard navigation: Enter sends, Shift+Enter adds newline
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // File handling helpers
  const addFiles = (fileList: FileList | File[]) => {
    const newFiles = Array.from(fileList);
    if (newFiles.length === 0) return;

    const processed: ChatAttachment[] = newFiles.map((file) => {
      const isImage = file.type.startsWith("image/");
      const previewUrl = isImage ? URL.createObjectURL(file) : undefined;
      return {
        id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        name: file.name,
        size: file.size,
        type: file.type,
        isImage,
        url: previewUrl,
        file,
      };
    });

    setAttachments((prev) => [...prev, ...processed]);
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => {
      const target = prev.find((att) => att.id === id);
      if (target?.url) {
        URL.revokeObjectURL(target.url);
      }
      return prev.filter((att) => att.id !== id);
    });
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      addFiles(e.target.files);
      e.target.value = "";
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addFiles(e.dataTransfer.files);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    if (e.clipboardData.files && e.clipboardData.files.length > 0) {
      e.preventDefault();
      addFiles(e.clipboardData.files);
    }
  };

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend !== undefined ? textToSend : input).trim();
    const currentAttachments = [...attachments];

    if (!text && currentAttachments.length === 0) return;

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
      attachments: currentAttachments.length > 0 ? currentAttachments : undefined,
    };

    setMessages((prev) => [...prev, userMessage]);
    if (textToSend === undefined) {
      setInput("");
      setAttachments([]);
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }

    setIsTyping(true);

    try {
      // Envoi réel dans PostgreSQL et émission Pulse vers l'espace agent
      const res = await sendPublicChatMessage(company.slug, {
        message: text,
        conversationId,
        customerName: "Client Portail SAV",
        token: sessionToken,
      });

      setIsTyping(false);

      if (res.success && res.conversationId) {
        if (!conversationId) {
          setConversationId(res.conversationId);
          if (typeof window !== "undefined") {
            localStorage.setItem(`zadesk_public_conv_${company.slug}`, res.conversationId);
          }
        }
        if (res.sessionToken) {
          setSessionToken(res.sessionToken);
          if (typeof window !== "undefined") {
            localStorage.setItem(`zadesk_public_token_${company.slug}`, res.sessionToken);
          }
        }
      }

      // Confirmation de prise en charge certifiée
      const replyTime = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });

      setMessages((prev) => [
        ...prev,
        {
          id: `sys-${Date.now()}`,
          sender: "system",
          text: `Message transmis en direct aux conseillers de ${company.name} • Prise en charge certifiée`,
          time: replyTime,
        },
      ]);
    } catch (err) {
      setIsTyping(false);
      console.error("Erreur envoi message SAV public:", err);
    }
  };

  const initial = company.name?.trim().charAt(0).toUpperCase() || "E";
  const cleanWhatsAppNumber = company.supportWhatsApp
    ? company.supportWhatsApp.replace(/[^0-9]/g, "")
    : "";
  const whatsappUrl = cleanWhatsAppNumber
    ? `https://wa.me/${cleanWhatsAppNumber}?text=${encodeURIComponent(
        `Bonjour le service client de ${company.name}, je vous contacte depuis la plateforme Zadesk pour une demande d'assistance.`
      )}`
    : null;

  return (
    <div className="flex-1 flex flex-col h-screen max-h-screen h-[100dvh] max-h-[100dvh] bg-[#F5F5F7] relative overflow-hidden text-[#1D1D1F]">
      {/* 1. Header — Translucent Frosted Chrome (Apple HIG §12) */}
      <CompanyPublicHeader
        name={company.name}
        logoUrl={company.logoUrl}
        category={company.category}
        verified={company.verified}
        statusBadge={availability.statusBadge}
        humanAvailabilityText={availability.humanText}
        showContextPanel={showContextPanel}
        onToggleContextPanel={() => setShowContextPanel((prev) => !prev)}
        onOpenDrawer={() => setDrawerOpen(true)}
      />

      {/* Temporary Closure Emergency Banner — Apple Callout */}
      {availability.isTemporarilyClosed && (
        <div className="bg-amber-500/[0.08] backdrop-blur-md border-b border-amber-500/20 px-4 sm:px-6 py-3 shrink-0 shadow-2xs z-10">
          <div className="max-w-7xl mx-auto flex items-start gap-3">
            <div className="w-7 h-7 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-950 bg-amber-200/60 px-2 py-0.5 rounded-full border border-amber-300/60">
                  Fermeture temporaire
                </span>
                {availability.timezoneDisplay && (
                  <span className="text-[11px] text-amber-900/70 font-medium">
                    {`Fuseau : ${availability.timezoneDisplay}`}
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm font-semibold text-amber-950 mt-1 leading-snug">
                {availability.temporaryClosureMessage}
              </p>
              <p className="text-[11px] text-amber-900/80 mt-0.5">
                Vos messages sont conservés et seront traités en priorité par nos conseillers dès la réouverture.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Drawer / Company Info */}
      <CompanyInfoBubbleModal
        company={company}
        isOpen={drawerOpen}
        onOpenChange={setDrawerOpen}
        onSelectEstablishment={handleOpenEstablishment}
        variant="modal-only"
      />

      {/* Dedicated Establishment Modal */}
      {company.establishments && company.establishments.length > 0 && (
        <EstablishmentModal
          establishments={company.establishments}
          selectedId={selectedEstId}
          isOpen={isEstModalOpen}
          onClose={() => setIsEstModalOpen(false)}
          companyName={company.name}
        />
      )}

      {/* 2. Main Stage — Split-Stage Layout */}
      <div className="flex-1 flex overflow-hidden w-full max-w-7xl mx-auto">
        {/* Left / Center: Conversation Stream (Primary Focus) */}
        <div className="flex-1 flex flex-col min-w-0 h-full relative">
          <main
            role="log"
            aria-live="polite"
            className="flex-1 overflow-y-auto overscroll-contain px-3 sm:px-6 py-4 sm:py-6 scrollbar-thin scrollbar-thumb-slate-200"
          >
            <div
              className={`mx-auto space-y-6 transition-all duration-300 ease-out ${
                showContextPanel ? "max-w-2xl" : "max-w-3xl xl:max-w-[820px]"
              }`}
            >
              {/* Apple Hero Welcome Card with Brand Palette */}
              <CompanyHeroCard
                name={company.name}
                logoUrl={company.logoUrl}
                category={company.category}
                city={company.city}
                country={company.country}
                verified={company.verified}
                availabilityText={availability.automatedText}
              />

              {/* Message Stream */}
              <div className="space-y-4">
                {messages.map((m) => {
                  if (m.sender === "system") {
                    return (
                      <div key={m.id} className="flex items-center justify-center my-3">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/[0.04] text-[11px] font-medium text-[#86868B]">
                          <Clock className="w-3 h-3 text-[#86868B] shrink-0" />
                          <span>{m.text}</span>
                          <span suppressHydrationWarning className="font-mono">• {m.time}</span>
                        </div>
                      </div>
                    );
                  }

                  const isCustomer = m.sender === "customer";

                  return (
                    <div
                      key={m.id}
                      className={`flex flex-col ${isCustomer ? "items-end" : "items-start"}`}
                    >
                      {/* Sender Label & Timestamp */}
                      <div className="flex items-center gap-1.5 mb-1 px-1 text-[11px] font-medium text-[#86868B]">
                        {isCustomer ? (
                          <span className="flex items-center gap-1 text-[#86868B]">
                            <User className="w-3 h-3 text-[#86868B]" />
                            <span>Vous</span>
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-[#1D1D1F] font-semibold">
                            <Building2 className="w-3.5 h-3.5 text-slate-500" />
                            <span>{m.senderName}</span>
                          </span>
                        )}
                        <span className="text-black/20">•</span>
                        <span suppressHydrationWarning className="font-mono text-[10px] text-[#86868B]">{m.time}</span>
                      </div>

                      {/* Bubble with Brand Integration */}
                      <div
                        className={`max-w-[85%] sm:max-w-[75%] px-4 py-2.5 sm:px-5 sm:py-3 text-xs sm:text-sm leading-relaxed ${
                          isCustomer
                            ? "rounded-[20px] rounded-br-[4px] shadow-xs"
                            : "rounded-[20px] rounded-bl-[4px] border shadow-[0_2px_8px_rgba(0,0,0,0.02)]"
                        }`}
                        style={
                          isCustomer
                            ? {
                                backgroundColor: "var(--company-primary)",
                                color: "var(--company-contrast)",
                              }
                            : {
                                backgroundColor: "var(--company-surface, #FFFFFF)",
                                borderColor: "var(--company-surface-border, rgba(0,0,0,0.06))",
                                borderLeftWidth: "3.5px",
                                borderLeftColor: "var(--company-primary)",
                                color: "var(--company-text, #1D1D1F)",
                              }
                        }
                      >
                        {m.text && <p className="whitespace-pre-line break-words">{m.text}</p>}

                        {/* Attachments rendering */}
                        {m.attachments && m.attachments.length > 0 && (
                          <div className={`${m.text ? "mt-2.5" : ""} space-y-2`}>
                            {/* Images grid */}
                            {m.attachments.some((att) => att.isImage) && (
                              <div className="grid grid-cols-2 gap-2 pt-0.5">
                                {m.attachments
                                  .filter((att) => att.isImage)
                                  .map((att) => (
                                    <div
                                      key={att.id}
                                      className="relative rounded-xl overflow-hidden border border-black/10 bg-black/5 aspect-video sm:aspect-4/3 group cursor-pointer"
                                      onClick={() => {
                                        if (att.url) window.open(att.url, "_blank");
                                      }}
                                      title={`Agrandir ${att.name}`}
                                    >
                                      {att.url ? (
                                        <img
                                          src={att.url}
                                          alt={att.name}
                                          className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                                        />
                                      ) : (
                                        <div className="w-full h-full flex items-center justify-center text-xs opacity-70">
                                          <ImageIcon className="w-4 h-4 mr-1" /> Image
                                        </div>
                                      )}
                                    </div>
                                  ))}
                              </div>
                            )}

                            {/* Documents list */}
                            {m.attachments.some((att) => !att.isImage) && (
                              <div className="space-y-1.5 pt-0.5">
                                {m.attachments
                                  .filter((att) => !att.isImage)
                                  .map((att) => (
                                    <div
                                      key={att.id}
                                      className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium border ${
                                        isCustomer
                                          ? "bg-white/15 border-white/20 text-inherit"
                                          : "bg-black/[0.03] border-black/[0.06] text-[#1D1D1F]"
                                      }`}
                                    >
                                      <div
                                        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                                          isCustomer ? "bg-white/20" : "bg-black/[0.06]"
                                        }`}
                                      >
                                        <FileText className="w-3.5 h-3.5" />
                                      </div>
                                      <div className="min-w-0 flex-1">
                                        <p className="truncate font-medium">{att.name}</p>
                                        <p className="text-[10px] opacity-75">{formatFileSize(att.size)}</p>
                                      </div>
                                    </div>
                                  ))}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Customer Delivery Indicator */}
                        {isCustomer && (
                          <div className="flex items-center justify-end gap-1 mt-1 text-[10px] opacity-70">
                            <CheckCheck className="w-3.5 h-3.5" />
                          </div>
                        )}

                        {/* Agent status badge */}
                        {!isCustomer && m.statusBadge && (
                          <div className="mt-2 pt-1.5 border-t border-black/[0.04] flex items-center gap-1.5 text-[11px] font-medium text-emerald-700">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>{m.statusBadge}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Subtle Brand Typing Animation */}
                {isTyping && (
                  <div className="flex flex-col items-start space-y-1.5 my-2">
                    <div className="flex items-center gap-1.5 px-1 text-[11px] font-medium text-[#86868B]">
                      <span
                        className="w-1.5 h-1.5 rounded-full animate-ping shrink-0"
                        style={{ backgroundColor: "var(--company-primary)" }}
                      />
                      <span>{company.name} prépare une réponse...</span>
                    </div>
                    <div
                      className="px-4 py-3 rounded-[20px] rounded-tl-[4px] bg-white border flex items-center gap-1.5 shadow-[0_2px_8px_rgba(0,0,0,0.02)]"
                      style={{
                        backgroundColor: "var(--company-surface, #FFFFFF)",
                        borderColor: "var(--company-surface-border, rgba(0,0,0,0.06))",
                        borderLeftWidth: "3px",
                        borderLeftColor: "var(--company-primary)",
                      }}
                    >
                      <span
                        className="w-2 h-2 rounded-full animate-pulse"
                        style={{ backgroundColor: "var(--company-primary)", opacity: 0.8 }}
                      />
                      <span
                        className="w-2 h-2 rounded-full animate-pulse"
                        style={{
                          backgroundColor: "var(--company-primary)",
                          opacity: 0.8,
                          animationDelay: "150ms",
                        }}
                      />
                      <span
                        className="w-2 h-2 rounded-full animate-pulse"
                        style={{
                          backgroundColor: "var(--company-primary)",
                          opacity: 0.8,
                          animationDelay: "300ms",
                        }}
                      />
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </div>
          </main>

          {/* 3. Bottom Composer — Elevated Floating Pro Island */}
          <footer
            className="sticky bottom-0 z-20 bg-gradient-to-t from-[#F5F5F7] via-[#F5F5F7]/95 to-transparent px-3 sm:px-6 pt-2 sm:pt-3 pb-3 sm:pb-4 shrink-0"
            style={{
              paddingBottom: 'max(0.875rem, env(safe-area-inset-bottom, 0px))',
              paddingLeft: 'max(0.75rem, env(safe-area-inset-left, 0px))',
              paddingRight: 'max(0.75rem, env(safe-area-inset-right, 0px))',
            }}
          >
            <div
              className={`mx-auto space-y-2 transition-all duration-300 ease-out ${
                showContextPanel ? "max-w-2xl" : "max-w-3xl xl:max-w-[820px]"
              }`}
            >
              {availability.isTemporarilyClosed && (
                <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/[0.08] border border-amber-500/20 text-[11px] text-amber-950 font-medium">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span className="truncate">
                    Conseillers temporairement indisponibles : votre message est pris en compte et sera traité dès la reprise.
                  </span>
                </div>
              )}

              {/* Quick Action Suggestion Chips (Prompt Starters) */}
              {messages.length <= 2 && !input && attachments.length === 0 && (
                <div className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto overscroll-contain py-1 scrollbar-none animate-in fade-in duration-300">
                  {[
                    { label: "📦 Suivi de dossier", prompt: "Bonjour, je souhaite avoir un suivi de mon dossier / commande." },
                    { label: "🛠️ Assistance technique", prompt: "Bonjour, j'ai besoin d'une assistance technique concernant un problème." },
                    { label: "💬 Parler à un conseiller", prompt: "Bonjour, j'aimerais échanger directement avec un conseiller du service client." },
                  ].map((pill, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        setInput(pill.prompt);
                        if (textareaRef.current) {
                          textareaRef.current.focus();
                          textareaRef.current.style.height = "auto";
                          textareaRef.current.style.height = "64px";
                        }
                      }}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 sm:py-1.5 rounded-full text-xs font-medium bg-white/95 hover:bg-white text-slate-700 hover:text-slate-900 border border-black/[0.06] hover:border-black/[0.12] shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] active:scale-95 transition-all cursor-pointer whitespace-nowrap shrink-0"
                    >
                      <span>{pill.label}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Floating Pro Island Capsule */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`relative flex flex-col w-full bg-white rounded-[28px] sm:rounded-[32px] border transition-all duration-200 shadow-[0_12px_36px_rgba(0,0,0,0.08),_0_2px_8px_rgba(0,0,0,0.04)] focus-within:shadow-[0_16px_44px_rgba(0,0,0,0.12)] ${
                  isDragging
                    ? "border-dashed ring-2 ring-black/10 bg-black/[0.01]"
                    : "border-black/[0.08] hover:border-black/[0.15] focus-within:border-[var(--company-primary)] focus-within:ring-2 focus-within:ring-[var(--company-primary)]/20"
                }`}
              >
                {/* Drag & Drop Overlay */}
                {isDragging && (
                  <div
                    className="absolute inset-0 z-20 rounded-[28px] sm:rounded-[32px] bg-white/95 backdrop-blur-xs flex items-center justify-center border-2 border-dashed pointer-events-none"
                    style={{ borderColor: "var(--company-primary)" }}
                  >
                    <div
                      className="flex items-center gap-2 font-semibold text-xs sm:text-sm"
                      style={{ color: "var(--company-primary)" }}
                    >
                      <FileUp className="w-5 h-5 animate-bounce" />
                      <span>Déposez vos images ou documents ici</span>
                    </div>
                  </div>
                )}

                {/* Staged Attachments Preview Tray */}
                {attachments.length > 0 && (
                  <div className="p-3 pb-1.5 flex flex-wrap gap-2 border-b border-black/[0.04]">
                    {attachments.map((att) => (
                      <div
                        key={att.id}
                        className="relative group flex items-center gap-2 pl-2 pr-2.5 py-1.5 rounded-2xl bg-[#F5F5F7] border border-black/[0.06] text-xs max-w-xs shadow-2xs"
                      >
                        {att.isImage && att.url ? (
                          <div className="w-7 h-7 rounded-lg overflow-hidden shrink-0 bg-black/5 border border-black/10">
                            <img src={att.url} alt={att.name} className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <div className="w-7 h-7 rounded-lg bg-black/[0.05] flex items-center justify-center shrink-0 text-[#1D1D1F]">
                            <FileText className="w-3.5 h-3.5" />
                          </div>
                        )}
                        <div className="min-w-0 max-w-[120px] sm:max-w-[160px]">
                          <p className="text-[11px] font-medium text-[#1D1D1F] truncate" title={att.name}>
                            {att.name}
                          </p>
                          <p className="text-[10px] text-[#86868B]">{formatFileSize(att.size)}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeAttachment(att.id)}
                          className="w-5 h-5 rounded-full bg-black/[0.08] hover:bg-black/15 active:scale-90 text-[#86868B] hover:text-[#1D1D1F] flex items-center justify-center transition-all cursor-pointer ml-1 shrink-0"
                          title="Supprimer cette pièce jointe"
                          aria-label="Supprimer la pièce jointe"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Main Input Row: [+]  [Textarea]  [Round Send Button] */}
                <div className="flex items-end gap-2 px-2.5 sm:px-4 py-2 sm:py-2.5 min-h-[58px] sm:min-h-[62px]">
                  {/* Hidden File Input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
                    onChange={handleFileInputChange}
                    className="hidden"
                  />

                  {/* Left: Round '+' Button with soft background */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-10 h-10 rounded-full flex items-center justify-center text-slate-600 hover:text-slate-900 bg-black/[0.04] hover:bg-black/[0.08] active:scale-95 transition-all shrink-0 cursor-pointer mb-0.5"
                    title="Joindre une photo ou un document (PNG, JPG, PDF...)"
                    aria-label="Ajouter une pièce jointe"
                  >
                    <Plus className="w-5 h-5 stroke-[2.2]" />
                  </button>

                  {/* Center: Spacious Multiline Textarea */}
                  <textarea
                    ref={textareaRef}
                    rows={1}
                    value={input}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    onPaste={handlePaste}
                    placeholder={`Écrivez votre message à l'attention de ${company.name}...`}
                    className="flex-1 bg-transparent py-2.5 px-1 text-sm sm:text-[15px] text-[#1D1D1F] placeholder:text-[#86868B] resize-none outline-none leading-relaxed max-h-44 min-h-[42px] scrollbar-thin"
                  />

                  {/* Right: Prominent Round Send Button */}
                  <button
                    type="button"
                    disabled={!input.trim() && attachments.length === 0}
                    onClick={() => handleSend()}
                    className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 mb-0.5 transition-all duration-150 active:scale-95 disabled:opacity-20 disabled:scale-100 disabled:cursor-not-allowed cursor-pointer shadow-xs"
                    style={{
                      backgroundColor: "var(--company-primary)",
                      color: "var(--company-contrast)",
                    }}
                    title="Envoyer votre message"
                    aria-label="Envoyer le message"
                  >
                    <ArrowUp className="w-5 h-5 stroke-[2.5]" />
                  </button>
                </div>
              </div>

              {/* Discrete Trust Caption — Centered */}
              <div className="text-center text-[11px] text-[#86868B] pt-0.5">
                <span>
                  Canal officiel {company.name} certifié • Échanges sécurisés
                </span>
              </div>
            </div>
          </footer>
        </div>

        {/* Right Stage: Secondary Contextual Panel (Desktop >= 1024px) — Apple Inset Grouped with Brand Theme */}
        {showContextPanel && (
          <aside className="hidden lg:flex flex-col w-84 xl:w-92 shrink-0 border-l border-black/[0.06] bg-[#FAFAFA] overflow-y-auto p-5 space-y-4">
            {/* Identity Card */}
            <div
              className="rounded-2xl border p-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-3"
              style={{
                backgroundColor: "var(--company-surface, #FFFFFF)",
                borderColor: "var(--company-surface-border, rgba(0,0,0,0.06))",
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-11 h-11 rounded-2xl bg-white border border-black/[0.06] shadow-2xs flex items-center justify-center overflow-hidden shrink-0"
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

                <div className="min-w-0">
                  <h3 className="text-sm font-semibold tracking-tight text-[#1D1D1F] truncate">{company.name}</h3>
                  <p className="text-xs text-[#86868B] truncate mt-0.5">
                    {company.category || "Service Client"}
                  </p>
                </div>
              </div>

              {company.description && (
                <p className="text-xs leading-relaxed text-[#515154] pt-2 border-t border-black/[0.04]">
                  {company.description}
                </p>
              )}
            </div>

            {/* Availability Card */}
            <div
              className="rounded-2xl border p-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-3"
              style={{
                backgroundColor: "var(--company-surface, #FFFFFF)",
                borderColor: "var(--company-surface-border, rgba(0,0,0,0.06))",
              }}
            >
              <div className="flex items-center justify-between">
                <h4 className="text-[11px] uppercase tracking-wider font-semibold text-[#86868B]">
                  Disponibilité du service
                </h4>
                {availability.timezoneDisplay && (
                  <span className="text-[10px] text-[#86868B] font-mono">
                    {availability.timezoneDisplay}
                  </span>
                )}
              </div>

              <div className="space-y-2">
                {/* Reception */}
                <div className="p-3 rounded-xl bg-[#F5F5F7] flex items-start gap-2.5">
                  <Clock className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "var(--company-primary)" }} />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <p className="text-xs font-semibold text-[#1D1D1F]">Réception des demandes</p>
                    </div>
                    <p className="text-[11px] text-[#86868B] mt-0.5 leading-relaxed">
                      {availability.automatedText}
                    </p>
                  </div>
                </div>

                {/* Human Counselors */}
                <div
                  className={`p-3 rounded-xl flex items-start gap-2.5 ${
                    availability.isTemporarilyClosed
                      ? "bg-amber-500/[0.08] border border-amber-500/20"
                      : "bg-[#F5F5F7]"
                  }`}
                >
                  {availability.isTemporarilyClosed ? (
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                  ) : (
                    <Calendar className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "var(--company-primary)" }} />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${availability.statusBadge.dotColor}`} />
                      <p className="text-xs font-semibold text-[#1D1D1F]">
                        {availability.isTemporarilyClosed ? "Fermeture exceptionnelle" : "Conseillers SAV"}
                      </p>
                    </div>
                    <p
                      className={`text-[11px] mt-0.5 leading-relaxed ${
                        availability.isTemporarilyClosed ? "text-amber-950 font-medium" : "text-[#86868B]"
                      }`}
                    >
                      {availability.humanText}
                    </p>
                  </div>
                </div>

                {/* Weekly Schedule */}
                {availability.weeklySchedule && availability.weeklySchedule.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-black/[0.04]">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[10px] uppercase tracking-wider font-semibold text-[#86868B]">
                        Horaires d&apos;ouverture
                      </p>
                      <span className="text-[10px] text-[#86868B]">
                        Heure locale
                      </span>
                    </div>
                    <div className="divide-y divide-black/[0.03] text-[11px]">
                      {availability.weeklySchedule.map((day) => (
                        <div key={day.key} className="py-1.5 flex items-center justify-between">
                          <span className={`font-medium ${day.isOpen ? "text-[#1D1D1F]" : "text-[#86868B]"}`}>
                            {day.label}
                          </span>
                          <span
                            className={
                              day.isOpen
                                ? "font-semibold text-[#1D1D1F]"
                                : "text-[#86868B] italic text-[10px]"
                            }
                          >
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
            {(whatsappUrl || company.supportPhone || company.supportEmail || company.website) && (
              <div className="space-y-2">
                <h4 className="text-[11px] font-semibold tracking-wide text-[#86868B] uppercase px-1">
                  Canaux directs certifiés
                </h4>

                <div
                  className="rounded-2xl bg-white border divide-y divide-black/[0.04] overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.02)]"
                  style={{
                    borderColor: "var(--company-surface-border, rgba(0,0,0,0.06))",
                  }}
                >
                  {/* WhatsApp Direct */}
                  {whatsappUrl && (
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3.5 hover:bg-black/[0.02] active:bg-black/[0.04] transition-colors group cursor-pointer"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                          <MessageSquare className="w-4 h-4 fill-current" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-[#1D1D1F]">WhatsApp Officiel</p>
                          <p className="text-[11px] font-mono text-[#86868B] truncate">
                            {company.supportWhatsApp}
                          </p>
                        </div>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-[#86868B] group-hover:text-[#1D1D1F] transition-colors shrink-0" />
                    </a>
                  )}

                  {/* Phone */}
                  {company.supportPhone && (
                    <a
                      href={`tel:${company.supportPhone.replace(/\s+/g, "")}`}
                      className="flex items-center justify-between p-3.5 hover:bg-black/[0.02] active:bg-black/[0.04] transition-colors group cursor-pointer"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-black/[0.04] text-[#1D1D1F] flex items-center justify-center shrink-0">
                          <Phone className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-[#1D1D1F]">Téléphone SAV</p>
                          <p className="text-[11px] font-mono text-[#86868B] truncate">
                            {company.supportPhone}
                          </p>
                        </div>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-[#86868B] group-hover:text-[#1D1D1F] transition-colors shrink-0" />
                    </a>
                  )}

                  {/* Email */}
                  {company.supportEmail && (
                    <a
                      href={`mailto:${company.supportEmail}?subject=${encodeURIComponent(
                        `Demande SAV — ${company.name}`
                      )}`}
                      className="flex items-center justify-between p-3.5 hover:bg-black/[0.02] active:bg-black/[0.04] transition-colors group cursor-pointer"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-black/[0.04] text-[#1D1D1F] flex items-center justify-center shrink-0">
                          <Mail className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-[#1D1D1F]">Email Officiel</p>
                          <p className="text-[11px] font-mono text-[#86868B] truncate">
                            {company.supportEmail}
                          </p>
                        </div>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-[#86868B] group-hover:text-[#1D1D1F] transition-colors shrink-0" />
                    </a>
                  )}

                  {/* Website */}
                  {company.website && (
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3.5 hover:bg-black/[0.02] active:bg-black/[0.04] transition-colors group cursor-pointer"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-black/[0.04] text-[#1D1D1F] flex items-center justify-center shrink-0">
                          <Globe className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-[#1D1D1F]">Site Web</p>
                          <p className="text-[11px] font-mono text-[#86868B] truncate">
                            {company.website}
                          </p>
                        </div>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-[#86868B] group-hover:text-[#1D1D1F] transition-colors shrink-0" />
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Address / Establishments — Spatial Masonry Gallery (Apple & Antigravity design) */}
            {company.establishments && company.establishments.length > 0 ? (
              <div className="space-y-2">
                {/* Header */}
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <h4 className="text-[11px] font-bold tracking-wider text-[#86868B] uppercase">
                      Nos établissements ({company.establishments.length})
                    </h4>
                  </div>
                  <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50/90 backdrop-blur-xs px-2 py-0.5 rounded-full border border-emerald-200/60 shadow-2xs">
                    Ouvert au public
                  </span>
                </div>

                {/* Case 1: Exactly 1 establishment -> Full-width featured card */}
                {company.establishments.length === 1 ? (
                  (() => {
                    const est = company.establishments[0];
                    const typeLabels: Record<string, string> = {
                      HEADQUARTERS: "Siège social",
                      BRANCH: "Agence",
                      STORE: "Boutique",
                      POINT_OF_SALE: "Point de vente",
                      SERVICE_POINT: "Comptoir SAV",
                      PICKUP_POINT: "Point relais",
                      TECH_CENTER: "Centre technique",
                      OTHER: "Établissement",
                    };
                    const typeLabel = typeLabels[est.type] || "Établissement";
                    return (
                      <div
                        onClick={() => handleOpenEstablishment(est.id)}
                        className="group relative rounded-2xl overflow-hidden border border-black/[0.08] bg-white shadow-xs hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 ease-out cursor-pointer active:scale-[0.98]"
                      >
                        {est.imageUrl ? (
                          <div className="relative aspect-[16/10] w-full max-h-52 overflow-hidden bg-slate-100">
                            <img
                              src={est.imageUrl}
                              alt={est.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/10" />
                            <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-1.5 pointer-events-none">
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold backdrop-blur-md bg-white/90 text-slate-900 border border-white/60 shadow-xs">
                                {typeLabel}
                              </span>
                              {est.isMain && (
                                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/95 backdrop-blur-md text-white shadow-xs flex items-center gap-1">
                                  <span>★</span>
                                  <span>Siège</span>
                                </span>
                              )}
                            </div>
                            <div className="absolute bottom-0 inset-x-0 p-3 text-white">
                              <p className="font-bold text-sm leading-tight drop-shadow-xs truncate">
                                {est.name}
                              </p>
                              <p className="text-[11px] text-white/85 flex items-center gap-1 mt-0.5">
                                <MapPin className="w-3 h-3 text-rose-400 shrink-0" />
                                <span className="truncate">{[est.city, est.country].filter(Boolean).join(", ") || est.address}</span>
                              </p>
                              <div className="mt-2 pt-2 border-t border-white/15 flex items-center justify-between text-[10px] font-semibold text-white/90">
                                <span>Coordonnées & Horaires</span>
                                <span className="group-hover:translate-x-1 transition-transform">→</span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="p-4 space-y-2 bg-gradient-to-br from-slate-50 to-white">
                            <div className="flex items-center justify-between">
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
                                {typeLabel}
                              </span>
                              {est.isMain && (
                                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                                  ★ Siège
                                </span>
                              )}
                            </div>
                            <p className="font-bold text-sm text-[#1D1D1F]">{est.name}</p>
                            <p className="text-xs text-[#86868B] flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                              <span>{[est.city, est.country].filter(Boolean).join(", ") || est.address}</span>
                            </p>
                            <div className="pt-2 border-t border-black/[0.04] flex items-center justify-between text-[11px] text-sky-600 font-semibold group-hover:text-sky-700">
                              <span>Consulter la fiche</span>
                              <span className="group-hover:translate-x-1 transition-transform">→</span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()
                ) : (
                  /* Case 2: Multi-establishments (2, 3, 5, 10+) -> Spatial Masonry 2 Columns */
                  <div className="space-y-1.5">
                    <div className="max-h-[380px] overflow-y-auto pr-0.5 scrollbar-thin scrollbar-thumb-black/10 hover:scrollbar-thumb-black/20">
                      <div className="columns-2 gap-2 space-y-2">
                        {company.establishments.map((est) => {
                          const typeLabels: Record<string, string> = {
                            HEADQUARTERS: "Siège social",
                            BRANCH: "Agence",
                            STORE: "Boutique",
                            POINT_OF_SALE: "Point de vente",
                            SERVICE_POINT: "Comptoir SAV",
                            PICKUP_POINT: "Point relais",
                            TECH_CENTER: "Centre technique",
                            OTHER: "Établissement",
                          };
                          const typeLabel = typeLabels[est.type] || "Établissement";

                          return (
                            <div
                              key={est.id}
                              onClick={() => handleOpenEstablishment(est.id)}
                              className="break-inside-avoid group relative rounded-xl overflow-hidden border border-black/[0.08] bg-white shadow-2xs hover:shadow-xl hover:-translate-y-0.5 active:scale-[0.97] transition-all duration-300 ease-out cursor-pointer"
                              style={{
                                backgroundColor: "var(--company-surface, #FFFFFF)",
                              }}
                            >
                              {est.imageUrl ? (
                                <div className="relative w-full overflow-hidden bg-slate-100 min-h-[105px]">
                                  <img
                                    src={est.imageUrl}
                                    alt={est.name}
                                    className="w-full h-auto min-h-[105px] max-h-[150px] object-cover group-hover:scale-108 transition-transform duration-500 ease-out"
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10 pointer-events-none" />

                                  {/* Glass Badges */}
                                  <div className="absolute top-1.5 left-1.5 right-1.5 flex items-center justify-between gap-1 pointer-events-none">
                                    <span className="px-1.5 py-0.5 rounded-md text-[8.5px] font-bold backdrop-blur-md bg-white/90 text-slate-900 border border-white/60 shadow-2xs truncate">
                                      {typeLabel}
                                    </span>
                                    {est.isMain && (
                                      <span className="px-1.5 py-0.5 rounded-md text-[8.5px] font-black bg-amber-500/95 backdrop-blur-md text-white shadow-2xs shrink-0">
                                        ★ Siège
                                      </span>
                                    )}
                                  </div>

                                  {/* Bottom Info Overlay */}
                                  <div className="absolute bottom-0 inset-x-0 p-2 text-white pointer-events-none">
                                    <p className="font-bold text-[11px] leading-tight drop-shadow-xs line-clamp-1 group-hover:text-amber-300 transition-colors">
                                      {est.name}
                                    </p>
                                    <p className="text-[9px] text-white/80 flex items-center gap-0.5 mt-0.5 truncate">
                                      <MapPin className="w-2.5 h-2.5 text-rose-400 shrink-0" />
                                      <span className="truncate">{est.city || est.address}</span>
                                    </p>
                                  </div>
                                </div>
                              ) : (
                                /* Fallback for establishment without photo */
                                <div className="p-2.5 bg-gradient-to-br from-slate-50 to-slate-100/80 min-h-[105px] flex flex-col justify-between space-y-1.5">
                                  <div className="flex items-center justify-between gap-1">
                                    <span className="px-1.5 py-0.5 rounded-md text-[8.5px] font-bold bg-white text-slate-800 border border-slate-200 truncate">
                                      {typeLabel}
                                    </span>
                                    {est.isMain && (
                                      <span className="px-1.5 py-0.5 rounded-md text-[8.5px] font-bold bg-amber-50 text-amber-800 border border-amber-200 shrink-0">
                                        ★ Siège
                                      </span>
                                    )}
                                  </div>
                                  <div>
                                    <div className="w-5 h-5 rounded-md bg-sky-50 text-sky-600 flex items-center justify-center mb-1">
                                      <Store className="w-3 h-3" />
                                    </div>
                                    <p className="font-bold text-[11px] text-[#1D1D1F] line-clamp-1 leading-tight">
                                      {est.name}
                                    </p>
                                    <p className="text-[9px] text-[#86868B] flex items-center gap-0.5 mt-0.5 truncate">
                                      <MapPin className="w-2.5 h-2.5 text-rose-500 shrink-0" />
                                      <span className="truncate">{est.city || est.address}</span>
                                    </p>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <p className="text-[9.5px] text-[#86868B] text-center italic pt-0.5">
                      Touchez une tuile pour ouvrir la fiche complète
                    </p>
                  </div>
                )}
              </div>
            ) : (company.address || company.city) ? (
              <div className="space-y-2">
                <h4 className="text-[11px] font-semibold tracking-wide text-[#86868B] uppercase px-1">
                  Implantation
                </h4>
                <div
                  className="p-3.5 rounded-2xl border shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex items-start gap-3"
                  style={{
                    backgroundColor: "var(--company-surface, #FFFFFF)",
                    borderColor: "var(--company-surface-border, rgba(0,0,0,0.06))",
                  }}
                >
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                    style={{
                      backgroundColor: "var(--company-secondary, rgba(0,0,0,0.04))",
                      color: "var(--company-primary)",
                    }}
                  >
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-[#1D1D1F]">Adresse officielle</p>
                    <p className="text-[11px] text-[#86868B] mt-0.5 leading-relaxed">
                      {[company.address, company.city, company.country || "Congo"]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                  </div>
                </div>
              </div>
            ) : null}

            {/* Zadesk Security & Transparency Reassurance */}
            <div className="mt-auto pt-2">
              <div
                className="p-3.5 rounded-2xl border flex items-start gap-3"
                style={{
                  backgroundColor: "var(--company-surface, rgba(255,255,255,0.6))",
                  borderColor: "var(--company-surface-border, rgba(0,0,0,0.06))",
                  color: "var(--company-text, #86868B)",
                }}
              >
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                  style={{
                    backgroundColor: "var(--company-secondary, rgba(0,0,0,0.03))",
                    color: "var(--company-primary)",
                  }}
                >
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <p className="text-[11px] leading-relaxed">
                  Service certifié par Zadesk. Vos échanges sont transmis directement aux conseillers de l&apos;entreprise en toute confidentialité.
                </p>
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
