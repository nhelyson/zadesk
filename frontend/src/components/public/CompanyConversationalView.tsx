"use client";

import React, { useState, useRef, useEffect } from "react";
import { PublicCompany } from "@/types/public";
import { CompanyInfoBubbleModal } from "./CompanyInfoBubbleModal";
import { EstablishmentModal } from "./EstablishmentModal";
import { CompanyPublicHeader } from "./CompanyPublicHeader";
import { CompanyHeroCard } from "./CompanyHeroCard";
import { getSupportAvailabilityInfo } from "@/lib/brandTheme";
import {
  sendPublicChatMessage,
  fetchPublicChatMessages,
  fetchPublicPushVapidKey,
  subscribePublicChatPush,
  unsubscribePublicChatPush,
  savePublicChatNotificationEmail,
  PublicChatAttachmentPayload,
} from "@/lib/publicApi";
import {
  isWebPushSupported,
  getExistingPushSubscription,
  subscribeBrowserToPush,
  unsubscribeBrowserFromPush,
  playClientAlertChime,
} from "@/lib/pushClient";
import {
  CheckCheck,
  Clock,
  ArrowUp,
  ArrowDown,
  Plus,
  Phone,
  MessageSquare,
  ExternalLink,
  ShieldCheck,
  User,
  Calendar,
  Mail,
  Globe,
  MapPin,
  Store,
  AlertCircle,
  AlertTriangle,
  FileText,
  X,
  FileUp,
  Image as ImageIcon,
  Building2,
  RotateCcw,
  Bell,
  BellRing,
  CheckCircle2,
  Volume2,
  VolumeX,
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
  failed?: boolean;
  retryPayload?: {
    text: string;
    attachments: ChatAttachment[];
  };
}

interface CompanyConversationalViewProps {
  company: PublicCompany;
}

const MAX_FILES_PER_MESSAGE = 5;
const MAX_FILE_SIZE_BYTES = 4 * 1024 * 1024;
const MAX_TOTAL_SIZE_BYTES = 7 * 1024 * 1024;

const ALLOWED_MIME_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "image/gif",
  "application/pdf",
  "text/plain",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
]);

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
};

const readFileAsDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error(`Impossible de lire ${file.name}`));
    reader.readAsDataURL(file);
  });

export function CompanyConversationalView({ company }: CompanyConversationalViewProps) {
  const availability = getSupportAvailabilityInfo(company.openingHours, company.businessHours);

  const buildWelcomeMessage = (timeText: string): ChatMessage => ({
    id: "msg-welcome",
    sender: "agent",
    senderName: `Service Client • ${company.name}`,
    text: `Bonjour ! Décrivez votre demande, joignez un justificatif si besoin, et un conseiller de ${company.name} vous répondra directement ici.`,
    time: timeText,
  });

  const [messages, setMessages] = useState<ChatMessage[]>(() => [buildWelcomeMessage("En ligne")]);

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
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedEstId, setSelectedEstId] = useState<string | null>(null);
  const [isEstModalOpen, setIsEstModalOpen] = useState(false);
  const [showContextPanel, setShowContextPanel] = useState(true);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(null);

  // Alertes client (onglet ouvert + notifications hors-ligne Web Push / Email)
  const mainScrollRef = useRef<HTMLElement>(null);
  const knownAgentMsgIdsRef = useRef<Set<string>>(new Set());
  const historyInitializedRef = useRef(false);
  const baseTitleRef = useRef<string>("");
  const unreadTabCountRef = useRef(0);
  const [hasNewReplyBelow, setHasNewReplyBelow] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [pushSupported, setPushSupported] = useState(false);
  const [pushSubscribed, setPushSubscribed] = useState(false);
  const [pushDenied, setPushDenied] = useState(false);
  const [pushLoading, setPushLoading] = useState(false);
  const [alertBannerDismissed, setAlertBannerDismissed] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [notifyEmail, setNotifyEmail] = useState("");
  const [emailSaving, setEmailSaving] = useState(false);
  const [emailSavedAddress, setEmailSavedAddress] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);

  const mapServerMessages = (serverMessages: any[]): ChatMessage[] =>
    serverMessages.map((m: any) => ({
      id: m.id,
      sender: m.senderType === "CUSTOMER" ? "customer" : "agent",
      senderName: m.senderType === "CUSTOMER" ? "Vous" : m.senderName || `Service Client • ${company.name}`,
      text: m.content || "",
      time: new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      attachments: Array.isArray(m.attachments) ? m.attachments : undefined,
    }));

  // Charger l'historique existant au montage (compatibilité clés zalisk_ / zadesk_)
  useEffect(() => {
    if (typeof window === "undefined") return;
    baseTitleRef.current = document.title;

    setPushSupported(isWebPushSupported());
    setPushDenied(typeof Notification !== "undefined" && Notification.permission === "denied");
    if (localStorage.getItem(`zalisk_alert_dismissed_${company.slug}`) === "true") {
      setAlertBannerDismissed(true);
    }
    const savedEmail = localStorage.getItem(`zalisk_notify_email_${company.slug}`);
    if (savedEmail) setEmailSavedAddress(savedEmail);

    const handleVisibilityReset = () => {
      if (!document.hidden) {
        unreadTabCountRef.current = 0;
        if (baseTitleRef.current) {
          document.title = baseTitleRef.current;
        }
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityReset);
    window.addEventListener("focus", handleVisibilityReset);

    const storedConvId =
      localStorage.getItem(`zalisk_public_conv_${company.slug}`) ||
      localStorage.getItem(`zadesk_public_conv_${company.slug}`);
    const storedToken =
      localStorage.getItem(`zalisk_public_token_${company.slug}`) ||
      localStorage.getItem(`zadesk_public_token_${company.slug}`);

    if (storedConvId) {
      setConversationId(storedConvId);
      if (storedToken) setSessionToken(storedToken);
      fetchPublicChatMessages(company.slug, storedConvId, storedToken).then((res) => {
        if (res.success && res.messages && res.messages.length > 0) {
          const loaded = mapServerMessages(res.messages);
          loaded.forEach((m) => {
            if (m.sender !== "customer") knownAgentMsgIdsRef.current.add(m.id);
          });
          historyInitializedRef.current = true;
          setMessages([
            buildWelcomeMessage(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })),
            ...loaded,
          ]);
        } else {
          historyInitializedRef.current = true;
        }
      });

      getExistingPushSubscription().then((sub) => {
        if (sub) setPushSubscribed(true);
      });
    } else {
      historyInitializedRef.current = true;
    }

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityReset);
      window.removeEventListener("focus", handleVisibilityReset);
      if (baseTitleRef.current) {
        document.title = baseTitleRef.current;
      }
    };
  }, [company.slug, company.name]);

  // Synchronisation temps réel des réponses conseillers (polling 3s) + alertes actives
  useEffect(() => {
    if (!conversationId) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetchPublicChatMessages(company.slug, conversationId, sessionToken);
        if (res.success && res.messages && res.messages.length > 0) {
          const loaded = mapServerMessages(res.messages);

          if (historyInitializedRef.current) {
            const newlyArrivedReplies = loaded.filter(
              (m) => m.sender !== "customer" && !knownAgentMsgIdsRef.current.has(m.id)
            );
            if (newlyArrivedReplies.length > 0) {
              newlyArrivedReplies.forEach((m) => knownAgentMsgIdsRef.current.add(m.id));
              if (soundEnabled) {
                playClientAlertChime();
              }
              if (document.hidden) {
                unreadTabCountRef.current += newlyArrivedReplies.length;
                const base = baseTitleRef.current || `Service Client ${company.name}`;
                document.title = `(${unreadTabCountRef.current}) Nouvelle réponse — ${base}`;
              }
              const el = mainScrollRef.current;
              if (el && el.scrollHeight - el.scrollTop - el.clientHeight > 160) {
                setHasNewReplyBelow(true);
              }
            }
          } else {
            loaded.forEach((m) => {
              if (m.sender !== "customer") knownAgentMsgIdsRef.current.add(m.id);
            });
            historyInitializedRef.current = true;
          }

          setMessages((prev) => {
            const welcome = prev.find((m) => m.id === "msg-welcome") || buildWelcomeMessage("En ligne");
            const localFailedOrPending = prev.filter(
              (p) => (p.id.startsWith("usr-") || p.failed) && !loaded.some((l) => l.text === p.text)
            );
            return [welcome, ...loaded, ...localFailedOrPending];
          });
        }
      } catch {
        // Ignorer les erreurs réseau transitoires lors du polling
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [conversationId, sessionToken, company.slug, company.name, soundEnabled]);

  const handleToggleClientPush = async () => {
    if (!conversationId || pushLoading || !pushSupported) return;
    setPushLoading(true);
    try {
      if (pushSubscribed) {
        const endpoint = await unsubscribeBrowserFromPush();
        if (endpoint) {
          await unsubscribePublicChatPush(company.slug, conversationId, endpoint, sessionToken);
        }
        setPushSubscribed(false);
      } else {
        const vapidKey = await fetchPublicPushVapidKey();
        if (!vapidKey) return;
        const { subscription, permission } = await subscribeBrowserToPush(vapidKey);
        if (permission === "denied") {
          setPushDenied(true);
          setShowEmailForm(true);
          return;
        }
        if (subscription) {
          const res = await subscribePublicChatPush(
            company.slug,
            conversationId,
            subscription,
            sessionToken
          );
          if (res.success) {
            setPushSubscribed(true);
            setPushDenied(false);
          }
        }
      }
    } catch (err) {
      console.error("Client push subscribe error:", err);
    } finally {
      setPushLoading(false);
    }
  };

  const handleSaveNotifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!conversationId || emailSaving) return;
    const trimmed = notifyEmail.trim();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setEmailError("Veuillez saisir une adresse email valide.");
      return;
    }
    setEmailSaving(true);
    setEmailError(null);
    const res = await savePublicChatNotificationEmail(
      company.slug,
      conversationId,
      trimmed,
      sessionToken
    );
    setEmailSaving(false);
    if (!res.success) {
      setEmailError(res.error || "Impossible d'enregistrer votre email.");
      return;
    }
    setEmailSavedAddress(trimmed);
    setShowEmailForm(false);
    if (typeof window !== "undefined") {
      localStorage.setItem(`zalisk_notify_email_${company.slug}`, trimmed);
    }
  };

  const handleOpenEstablishment = (estId: string) => {
    setSelectedEstId(estId);
    setIsEstModalOpen(true);
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isSending, attachments]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const addFiles = (fileList: FileList | File[]) => {
    setUploadError(null);
    const incoming = Array.from(fileList);
    if (incoming.length === 0) return;

    if (attachments.length + incoming.length > MAX_FILES_PER_MESSAGE) {
      setUploadError(`Vous pouvez joindre au maximum ${MAX_FILES_PER_MESSAGE} fichiers par message.`);
      return;
    }

    const existingTotal = attachments.reduce((sum, a) => sum + a.size, 0);
    let addedTotal = 0;
    const accepted: ChatAttachment[] = [];

    for (const file of incoming) {
      const mime = (file.type || "").toLowerCase();
      if (!ALLOWED_MIME_TYPES.has(mime)) {
        setUploadError(
          `Format non supporté pour « ${file.name} ». Formats acceptés : PNG, JPG, WEBP, GIF, PDF, DOC/DOCX, XLS/XLSX, TXT.`
        );
        return;
      }
      if (file.size > MAX_FILE_SIZE_BYTES) {
        setUploadError(`Le fichier « ${file.name} » dépasse la limite de 4 Mo.`);
        return;
      }
      addedTotal += file.size;
      if (existingTotal + addedTotal > MAX_TOTAL_SIZE_BYTES) {
        setUploadError("La taille totale des pièces jointes ne peut pas dépasser 7 Mo par envoi.");
        return;
      }

      const isImage = mime.startsWith("image/");
      const previewUrl = isImage ? URL.createObjectURL(file) : undefined;
      accepted.push({
        id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        name: file.name,
        size: file.size,
        type: mime,
        isImage,
        url: previewUrl,
        file,
      });
    }

    setAttachments((prev) => [...prev, ...accepted]);
  };

  const removeAttachment = (id: string) => {
    setUploadError(null);
    setAttachments((prev) => {
      const target = prev.find((att) => att.id === id);
      if (target?.url && target.url.startsWith("blob:")) {
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

  const handleSend = async (retryTarget?: { messageId: string; text: string; attachments: ChatAttachment[] }) => {
    if (isSending) return;
    setUploadError(null);

    const text = (retryTarget ? retryTarget.text : input).trim();
    const currentAttachments = retryTarget ? [...retryTarget.attachments] : [...attachments];

    if (!text && currentAttachments.length === 0) return;

    const tempId = retryTarget ? retryTarget.messageId : `usr-${Date.now()}`;
    const currentTime = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    if (retryTarget) {
      setMessages((prev) =>
        prev.map((m) => (m.id === tempId ? { ...m, failed: false, time: currentTime } : m))
      );
    } else {
      const optimisticMessage: ChatMessage = {
        id: tempId,
        sender: "customer",
        senderName: "Vous",
        text,
        time: currentTime,
        attachments: currentAttachments.length > 0 ? currentAttachments : undefined,
      };
      setMessages((prev) => [...prev, optimisticMessage]);
      setInput("");
      setAttachments([]);
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }

    setIsSending(true);

    try {
      const serializedAttachments: PublicChatAttachmentPayload[] = [];
      for (const att of currentAttachments) {
        if (att.file) {
          const dataBase64 = await readFileAsDataUrl(att.file);
          serializedAttachments.push({
            name: att.name,
            type: att.type || att.file.type || "application/octet-stream",
            size: att.size,
            dataBase64,
          });
        }
      }

      const res = await sendPublicChatMessage(company.slug, {
        message: text,
        attachments: serializedAttachments.length > 0 ? serializedAttachments : undefined,
        conversationId,
        customerName: "Client Portail SAV",
        token: sessionToken,
      });

      setIsSending(false);

      if (!res.success || !res.conversationId) {
        const errMsg = res.error || (res as any).message || "Impossible de transmettre votre message.";
        setUploadError(errMsg);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === tempId
              ? { ...m, failed: true, retryPayload: { text, attachments: currentAttachments } }
              : m
          )
        );
        return;
      }

      if (!conversationId) {
        setConversationId(res.conversationId);
        if (typeof window !== "undefined") {
          localStorage.setItem(`zalisk_public_conv_${company.slug}`, res.conversationId);
        }
      }
      if (res.sessionToken) {
        setSessionToken(res.sessionToken);
        if (typeof window !== "undefined") {
          localStorage.setItem(`zalisk_public_token_${company.slug}`, res.sessionToken);
        }
      }

      const persisted = res.message;
      const replyTime = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });

      setMessages((prev) => {
        const updated = prev.map((m) =>
          m.id === tempId
            ? {
                ...m,
                id: persisted?.id || tempId,
                failed: false,
                retryPayload: undefined,
                attachments:
                  Array.isArray(persisted?.attachments) && persisted.attachments.length > 0
                    ? persisted.attachments
                    : m.attachments,
              }
            : m
        );

        const hasSystemNotice = updated.some((m) => m.sender === "system");
        if (!hasSystemNotice) {
          return [
            ...updated,
            {
              id: `sys-${Date.now()}`,
              sender: "system",
              text: `Message transmis au service client de ${company.name}`,
              time: replyTime,
            },
          ];
        }
        return updated;
      });
    } catch (err: any) {
      setIsSending(false);
      setUploadError(err?.message || "Erreur réseau lors de l'envoi du message.");
      setMessages((prev) =>
        prev.map((m) =>
          m.id === tempId
            ? { ...m, failed: true, retryPayload: { text, attachments: currentAttachments } }
            : m
        )
      );
    }
  };

  const initial = company.name?.trim().charAt(0).toUpperCase() || "E";
  const cleanWhatsAppNumber = company.supportWhatsApp
    ? company.supportWhatsApp.replace(/[^0-9]/g, "")
    : "";
  const whatsappUrl = cleanWhatsAppNumber
    ? `https://wa.me/${cleanWhatsAppNumber}?text=${encodeURIComponent(
        `Bonjour le service client de ${company.name}, je vous contacte depuis la plateforme Zalisk pour une demande d'assistance.`
      )}`
    : null;

  return (
    <div className="flex-1 flex flex-col h-[100dvh] max-h-[100dvh] bg-[#F5F5F7] relative overflow-hidden text-[#1D1D1F]">
      {/* 1. En-tête sobre */}
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

      {/* Bannière fermeture exceptionnelle */}
      {availability.isTemporarilyClosed && (
        <div className="bg-amber-500/10 backdrop-blur-md border-b border-amber-500/25 px-4 sm:px-6 py-2.5 shrink-0 z-10">
          <div className="max-w-7xl mx-auto flex items-start gap-3">
            <div className="w-7 h-7 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-950 bg-amber-200/70 px-2 py-0.5 rounded-full">
                  Fermeture temporaire
                </span>
                {availability.timezoneDisplay && (
                  <span className="text-[11px] text-amber-900 font-medium">
                    Fuseau : {availability.timezoneDisplay}
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm font-semibold text-amber-950 mt-1 leading-snug">
                {availability.temporaryClosureMessage}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tiroir mobile / tablette */}
      <CompanyInfoBubbleModal
        company={company}
        isOpen={drawerOpen}
        onOpenChange={setDrawerOpen}
        onSelectEstablishment={handleOpenEstablishment}
        variant="modal-only"
      />

      {/* Modale détail établissement */}
      {company.establishments && company.establishments.length > 0 && (
        <EstablishmentModal
          establishments={company.establishments}
          selectedId={selectedEstId}
          isOpen={isEstModalOpen}
          onClose={() => setIsEstModalOpen(false)}
          companyName={company.name}
        />
      )}

      {/* 2. Scène principale : Tchat + Panneau contextuel */}
      <div className="flex-1 flex overflow-hidden w-full max-w-7xl mx-auto">
        <div className="flex-1 flex flex-col min-w-0 h-full relative">
          <main
            ref={mainScrollRef}
            onScroll={() => {
              const el = mainScrollRef.current;
              if (el && el.scrollHeight - el.scrollTop - el.clientHeight < 100) {
                setHasNewReplyBelow(false);
              }
            }}
            role="log"
            aria-live="polite"
            className="flex-1 overflow-y-auto overscroll-contain px-3 sm:px-6 py-4 sm:py-6"
          >
            <div
              className={`mx-auto space-y-5 transition-all duration-300 ease-out ${
                showContextPanel ? "max-w-2xl" : "max-w-3xl"
              }`}
            >
              {/* Carte contexte entreprise allégée */}
              <CompanyHeroCard
                name={company.name}
                logoUrl={company.logoUrl}
                category={company.category}
                city={company.city}
                country={company.country}
                description={company.description}
                verified={company.verified}
                availabilityText={availability.automatedText}
              />

              {/* Fil de discussion */}
              <div className="space-y-4">
                {messages.map((m) => {
                  if (m.sender === "system") {
                    return (
                      <div key={m.id} className="flex items-center justify-center my-2">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/[0.05] text-[11px] font-medium text-slate-600">
                          <Clock className="w-3 h-3 text-slate-500 shrink-0" />
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
                      <div className="flex items-center gap-1.5 mb-1 px-1 text-[11px] font-medium text-slate-600">
                        {isCustomer ? (
                          <span className="flex items-center gap-1 text-slate-600">
                            <User className="w-3 h-3 text-slate-500" />
                            <span>Vous</span>
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-[#1D1D1F] font-semibold">
                            <Building2 className="w-3.5 h-3.5 text-slate-500" />
                            <span>{m.senderName}</span>
                          </span>
                        )}
                        <span className="text-black/20">•</span>
                        <span suppressHydrationWarning className="font-mono text-[11px] text-slate-500">
                          {m.time}
                        </span>
                      </div>

                      <div
                        className={`max-w-[88%] sm:max-w-[75%] px-4 py-2.5 sm:px-5 sm:py-3 text-xs sm:text-sm leading-relaxed ${
                          isCustomer
                            ? "rounded-[20px] rounded-br-[4px] shadow-sm"
                            : "rounded-[20px] rounded-bl-[4px] border shadow-sm"
                        } ${m.failed ? "ring-2 ring-rose-400" : ""}`}
                        style={
                          isCustomer
                            ? {
                                backgroundColor: "var(--company-primary)",
                                color: "var(--company-contrast)",
                              }
                            : {
                                backgroundColor: "var(--company-surface, #FFFFFF)",
                                borderColor: "var(--company-surface-border, rgba(0,0,0,0.08))",
                                borderLeftWidth: "3.5px",
                                borderLeftColor: "var(--company-primary)",
                                color: "var(--company-text, #1D1D1F)",
                              }
                        }
                      >
                        {m.text && <p className="whitespace-pre-line break-words">{m.text}</p>}

                        {/* Pièces jointes réelles */}
                        {m.attachments && m.attachments.length > 0 && (
                          <div className={`${m.text ? "mt-2.5" : ""} space-y-2`}>
                            {m.attachments.some((att) => att.isImage) && (
                              <div className="grid grid-cols-2 gap-2 pt-0.5">
                                {m.attachments
                                  .filter((att) => att.isImage)
                                  .map((att) => (
                                    <a
                                      key={att.id}
                                      href={att.url || "#"}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="relative block rounded-xl overflow-hidden border border-black/15 bg-black/5 aspect-[4/3] group focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                                      title={`Ouvrir ${att.name}`}
                                    >
                                      {att.url ? (
                                        <img
                                          src={att.url}
                                          alt={att.name}
                                          className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                                        />
                                      ) : (
                                        <div className="w-full h-full flex items-center justify-center text-xs opacity-75">
                                          <ImageIcon className="w-4 h-4 mr-1" /> Image
                                        </div>
                                      )}
                                    </a>
                                  ))}
                              </div>
                            )}

                            {m.attachments.some((att) => !att.isImage) && (
                              <div className="space-y-1.5 pt-0.5">
                                {m.attachments
                                  .filter((att) => !att.isImage)
                                  .map((att) => (
                                    <a
                                      key={att.id}
                                      href={att.url || "#"}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      download={att.name}
                                      className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium border transition-colors ${
                                        isCustomer
                                          ? "bg-white/15 border-white/25 text-inherit hover:bg-white/25"
                                          : "bg-black/[0.03] border-black/[0.08] text-[#1D1D1F] hover:bg-black/[0.06]"
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
                                        <p className="truncate font-semibold">{att.name}</p>
                                        <p className="text-[11px] opacity-80">{formatFileSize(att.size)}</p>
                                      </div>
                                      <ExternalLink className="w-3.5 h-3.5 opacity-70 shrink-0" />
                                    </a>
                                  ))}
                              </div>
                            )}
                          </div>
                        )}

                        {isCustomer && !m.failed && (
                          <div className="flex items-center justify-end gap-1 mt-1 text-[11px] opacity-80">
                            <CheckCheck className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </div>

                      {m.failed && m.retryPayload && (
                        <div className="flex items-center gap-2 mt-1.5 px-1 text-xs text-rose-700 font-medium">
                          <span>Échec d&apos;envoi</span>
                          <button
                            type="button"
                            onClick={() =>
                              handleSend({
                                messageId: m.id,
                                text: m.retryPayload!.text,
                                attachments: m.retryPayload!.attachments,
                              })
                            }
                            className="inline-flex items-center gap-1 underline font-semibold hover:text-rose-900 cursor-pointer"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Réessayer</span>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}

                {isSending && (
                  <div className="flex items-center justify-end px-2 text-xs text-slate-600 font-medium">
                    <span>Transmission en cours...</span>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </div>
          </main>

          {/* 3. Compositeur flottant */}
          <footer
            className="sticky bottom-0 z-20 bg-gradient-to-t from-[#F5F5F7] via-[#F5F5F7]/95 to-transparent px-3 sm:px-6 pt-2 pb-3 sm:pb-4 shrink-0"
            style={{
              paddingBottom: "max(0.875rem, env(safe-area-inset-bottom, 0px))",
              paddingLeft: "max(0.75rem, env(safe-area-inset-left, 0px))",
              paddingRight: "max(0.75rem, env(safe-area-inset-right, 0px))",
            }}
          >
            <div
              className={`mx-auto space-y-2 transition-all duration-300 ease-out ${
                showContextPanel ? "max-w-2xl" : "max-w-3xl"
              }`}
            >
              {hasNewReplyBelow && (
                <div className="flex justify-center pb-1">
                  <button
                    type="button"
                    onClick={() => {
                      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
                      setHasNewReplyBelow(false);
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold shadow-md cursor-pointer transition-transform active:scale-95"
                    style={{
                      backgroundColor: "var(--company-primary)",
                      color: "var(--company-contrast)",
                    }}
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                    <span>Nouvelle réponse du conseiller</span>
                  </button>
                </div>
              )}

              {/* Bandeau d'alerte hors-application (Web Push ou Email de repli) */}
              {conversationId && !alertBannerDismissed && (
                <div className="rounded-2xl bg-white/95 backdrop-blur-sm border border-black/[0.08] px-3.5 py-2.5 shadow-sm text-xs space-y-2">
                  {pushSubscribed || emailSavedAddress ? (
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2 text-emerald-800 font-medium min-w-0">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="truncate">
                          {pushSubscribed
                            ? "Alertes activées : vous serez prévenu même si vous quittez la page."
                            : `Rappel activé sur ${emailSavedAddress}`}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => setSoundEnabled((s) => !s)}
                          className="p-1 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-black/[0.05] cursor-pointer"
                          title={soundEnabled ? "Couper le son" : "Activer le son"}
                          aria-label={soundEnabled ? "Couper le son" : "Activer le son"}
                        >
                          {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                        </button>
                        {!emailSavedAddress && (
                          <button
                            type="button"
                            onClick={() => setShowEmailForm((v) => !v)}
                            className="text-[11px] font-medium text-slate-600 hover:text-slate-950 underline cursor-pointer"
                          >
                            + Email
                          </button>
                        )}
                        {pushSubscribed && (
                          <button
                            type="button"
                            onClick={handleToggleClientPush}
                            className="text-[11px] text-slate-500 hover:text-slate-800 cursor-pointer"
                          >
                            Désactiver
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2 text-slate-700 min-w-0">
                        <Bell className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span className="font-medium">
                          {pushDenied
                            ? "Notifications bloquées dans le navigateur — recevez la réponse par email :"
                            : "Être averti dès qu'un conseiller répond (même page fermée)"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {pushSupported && !pushDenied && (
                          <button
                            type="button"
                            disabled={pushLoading}
                            onClick={handleToggleClientPush}
                            className="px-3 py-1 rounded-full text-[11px] font-semibold shadow-xs cursor-pointer transition-opacity disabled:opacity-50"
                            style={{
                              backgroundColor: "var(--company-primary)",
                              color: "var(--company-contrast)",
                            }}
                          >
                            {pushLoading ? "Activation..." : "Activer les alertes"}
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setShowEmailForm((v) => !v)}
                          className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-[#F5F5F7] hover:bg-black/[0.08] text-slate-700 cursor-pointer inline-flex items-center gap-1"
                        >
                          <Mail className="w-3 h-3" />
                          <span>Par email</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setAlertBannerDismissed(true);
                            if (typeof window !== "undefined") {
                              localStorage.setItem(`zalisk_alert_dismissed_${company.slug}`, "true");
                            }
                          }}
                          className="p-1 text-slate-400 hover:text-slate-700 rounded-full cursor-pointer"
                          aria-label="Masquer le bandeau"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}

                  {(showEmailForm || pushDenied) && !emailSavedAddress && (
                    <form onSubmit={handleSaveNotifyEmail} className="flex items-center gap-2 pt-1">
                      <input
                        type="email"
                        required
                        value={notifyEmail}
                        onChange={(e) => setNotifyEmail(e.target.value)}
                        placeholder="Votre email pour recevoir la réponse…"
                        className="flex-1 h-8 px-3 rounded-xl bg-[#F5F5F7] border border-black/[0.10] text-xs text-[#1D1D1F] placeholder:text-slate-500 focus:outline-none focus:border-[var(--company-primary)]"
                      />
                      <button
                        type="submit"
                        disabled={emailSaving}
                        className="h-8 px-3 rounded-xl text-xs font-semibold cursor-pointer disabled:opacity-50"
                        style={{
                          backgroundColor: "var(--company-primary)",
                          color: "var(--company-contrast)",
                        }}
                      >
                        {emailSaving ? "..." : "Valider"}
                      </button>
                    </form>
                  )}
                  {emailError && <p className="text-[11px] text-rose-600">{emailError}</p>}
                </div>
              )}

              {uploadError && (
                <div
                  role="alert"
                  className="flex items-center justify-between gap-2 px-3.5 py-2 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 font-medium"
                >
                  <span className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{uploadError}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setUploadError(null)}
                    aria-label="Fermer l'alerte"
                    className="p-1 text-rose-500 hover:text-rose-800 rounded-full cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Suggestions rapides au démarrage */}
              {messages.length <= 2 && !input && attachments.length === 0 && (
                <div className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto py-1">
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
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-950 border border-black/[0.08] shadow-sm active:scale-95 transition-all cursor-pointer whitespace-nowrap shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0D1B3D]"
                    >
                      <span>{pill.label}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Capsule d'envoi avec upload réel */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`relative flex flex-col w-full bg-white rounded-[28px] border transition-all duration-200 shadow-md ${
                  isDragging
                    ? "border-dashed ring-2 ring-[#0D1B3D]/20 bg-slate-50"
                    : "border-black/[0.10] hover:border-black/[0.18] focus-within:border-[var(--company-primary)] focus-within:ring-2 focus-within:ring-[var(--company-primary)]/20"
                }`}
              >
                {isDragging && (
                  <div
                    className="absolute inset-0 z-20 rounded-[28px] bg-white/95 backdrop-blur-sm flex items-center justify-center border-2 border-dashed pointer-events-none"
                    style={{ borderColor: "var(--company-primary)" }}
                  >
                    <div
                      className="flex items-center gap-2 font-semibold text-xs sm:text-sm"
                      style={{ color: "var(--company-primary)" }}
                    >
                      <FileUp className="w-5 h-5" />
                      <span>Déposez vos images ou documents ici (max 4 Mo)</span>
                    </div>
                  </div>
                )}

                {attachments.length > 0 && (
                  <div className="p-3 pb-1.5 flex flex-wrap gap-2 border-b border-black/[0.05]">
                    {attachments.map((att) => (
                      <div
                        key={att.id}
                        className="relative flex items-center gap-2 pl-2 pr-2.5 py-1.5 rounded-2xl bg-[#F5F5F7] border border-black/[0.08] text-xs max-w-xs"
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
                          <p className="text-[11px] font-semibold text-[#1D1D1F] truncate" title={att.name}>
                            {att.name}
                          </p>
                          <p className="text-[11px] text-slate-600">{formatFileSize(att.size)}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeAttachment(att.id)}
                          className="w-5 h-5 rounded-full bg-black/[0.08] hover:bg-black/15 text-slate-700 flex items-center justify-center transition-colors cursor-pointer ml-1 shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0D1B3D]"
                          title="Supprimer cette pièce jointe"
                          aria-label={`Supprimer ${att.name}`}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-end gap-2 px-2.5 sm:px-4 py-2 sm:py-2.5 min-h-[56px]">
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/png,image/jpeg,image/webp,image/gif,.pdf,.doc,.docx,.xls,.xlsx,.txt"
                    onChange={handleFileInputChange}
                    className="hidden"
                  />

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isSending}
                    className="w-10 h-10 rounded-full flex items-center justify-center text-slate-700 hover:text-slate-950 bg-black/[0.05] hover:bg-black/[0.10] active:scale-95 transition-all shrink-0 cursor-pointer mb-0.5 disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0D1B3D]"
                    title="Joindre une photo ou un document (PNG, JPG, PDF, max 4 Mo)"
                    aria-label="Ajouter une pièce jointe"
                  >
                    <Plus className="w-5 h-5 stroke-[2.2]" />
                  </button>

                  <textarea
                    ref={textareaRef}
                    rows={1}
                    value={input}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    onPaste={handlePaste}
                    aria-label={`Message pour ${company.name}`}
                    placeholder={`Écrivez votre message à ${company.name}...`}
                    className="flex-1 bg-transparent py-2.5 px-1 text-sm sm:text-[15px] text-[#1D1D1F] placeholder:text-slate-500 resize-none outline-none leading-relaxed max-h-44 min-h-[42px]"
                  />

                  <button
                    type="button"
                    disabled={isSending || (!input.trim() && attachments.length === 0)}
                    onClick={() => handleSend()}
                    className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 mb-0.5 transition-all duration-150 active:scale-95 disabled:opacity-25 disabled:scale-100 disabled:cursor-not-allowed cursor-pointer shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0D1B3D] focus-visible:ring-offset-2"
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

              <div className="text-center text-[11px] text-slate-600 pt-0.5">
                <span>Canal officiel {company.name} sur Zalisk • Échanges confidentiels</span>
              </div>
            </div>
          </footer>
        </div>

        {/* Panneau contextuel latéral Desktop (largeur valide Tailwind v3 w-80 / xl:w-96) */}
        {showContextPanel && (
          <aside className="hidden lg:flex flex-col w-80 xl:w-96 shrink-0 border-l border-black/[0.06] bg-[#FAFAFA] overflow-y-auto p-5 space-y-4">
            {/* Carte identité */}
            <div
              className="rounded-2xl border p-4 shadow-sm space-y-3"
              style={{
                backgroundColor: "var(--company-surface, #FFFFFF)",
                borderColor: "var(--company-surface-border, rgba(0,0,0,0.08))",
              }}
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-white border border-black/[0.08] shadow-sm flex items-center justify-center overflow-hidden shrink-0">
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
                  <h3 className="text-sm font-bold tracking-tight text-[#1D1D1F] truncate">{company.name}</h3>
                  <p className="text-xs text-slate-600 truncate mt-0.5">
                    {company.category || "Service Client"}
                  </p>
                </div>
              </div>

              {company.description && (
                <p className="text-xs leading-relaxed text-slate-600 pt-2 border-t border-black/[0.05]">
                  {company.description}
                </p>
              )}
            </div>

            {/* Disponibilité */}
            <div
              className="rounded-2xl border p-4 shadow-sm space-y-3"
              style={{
                backgroundColor: "var(--company-surface, #FFFFFF)",
                borderColor: "var(--company-surface-border, rgba(0,0,0,0.08))",
              }}
            >
              <div className="flex items-center justify-between">
                <h4 className="text-[11px] uppercase tracking-wider font-bold text-slate-600">
                  Disponibilité du service
                </h4>
                {availability.timezoneDisplay && (
                  <span className="text-[11px] text-slate-600 font-mono">
                    {availability.timezoneDisplay}
                  </span>
                )}
              </div>

              <div className="space-y-2">
                <div className="p-3 rounded-xl bg-[#F5F5F7] flex items-start gap-2.5">
                  <Clock className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "var(--company-primary)" }} />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <p className="text-xs font-semibold text-[#1D1D1F]">Réception des demandes</p>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                      {availability.automatedText}
                    </p>
                  </div>
                </div>

                <div
                  className={`p-3 rounded-xl flex items-start gap-2.5 ${
                    availability.isTemporarilyClosed
                      ? "bg-amber-500/10 border border-amber-500/25"
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
                        availability.isTemporarilyClosed ? "text-amber-950 font-medium" : "text-slate-600"
                      }`}
                    >
                      {availability.humanText}
                    </p>
                  </div>
                </div>

                {availability.weeklySchedule && availability.weeklySchedule.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-black/[0.05]">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[11px] uppercase tracking-wider font-semibold text-slate-600">
                        Horaires d&apos;ouverture
                      </p>
                      <span className="text-[11px] text-slate-500">Heure locale</span>
                    </div>
                    <div className="divide-y divide-black/[0.04] text-xs">
                      {availability.weeklySchedule.map((day) => (
                        <div key={day.key} className="py-1.5 flex items-center justify-between">
                          <span className={`font-medium ${day.isOpen ? "text-[#1D1D1F]" : "text-slate-500"}`}>
                            {day.label}
                          </span>
                          <span
                            className={
                              day.isOpen
                                ? "font-semibold text-[#1D1D1F]"
                                : "text-slate-500 italic text-[11px]"
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

            {/* Canaux directs certifiés */}
            {(whatsappUrl || company.supportPhone || company.supportEmail || company.website) && (
              <div className="space-y-2">
                <h4 className="text-[11px] font-bold tracking-wider text-slate-600 uppercase px-1">
                  Canaux directs certifiés
                </h4>

                <div
                  className="rounded-2xl bg-white border divide-y divide-black/[0.05] overflow-hidden shadow-sm"
                  style={{
                    borderColor: "var(--company-surface-border, rgba(0,0,0,0.08))",
                  }}
                >
                  {whatsappUrl && (
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3.5 hover:bg-black/[0.02] transition-colors group cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#0D1B3D]"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-700 flex items-center justify-center shrink-0">
                          <MessageSquare className="w-4 h-4 fill-current" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-[#1D1D1F]">WhatsApp Officiel</p>
                          <p className="text-[11px] font-mono text-slate-600 truncate">
                            {company.supportWhatsApp}
                          </p>
                        </div>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-[#1D1D1F] transition-colors shrink-0" />
                    </a>
                  )}

                  {company.supportPhone && (
                    <a
                      href={`tel:${company.supportPhone.replace(/\s+/g, "")}`}
                      className="flex items-center justify-between p-3.5 hover:bg-black/[0.02] transition-colors group cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#0D1B3D]"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-black/[0.04] text-[#1D1D1F] flex items-center justify-center shrink-0">
                          <Phone className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-[#1D1D1F]">Téléphone SAV</p>
                          <p className="text-[11px] font-mono text-slate-600 truncate">
                            {company.supportPhone}
                          </p>
                        </div>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-[#1D1D1F] transition-colors shrink-0" />
                    </a>
                  )}

                  {company.supportEmail && (
                    <a
                      href={`mailto:${company.supportEmail}?subject=${encodeURIComponent(
                        `Demande SAV — ${company.name}`
                      )}`}
                      className="flex items-center justify-between p-3.5 hover:bg-black/[0.02] transition-colors group cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#0D1B3D]"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-black/[0.04] text-[#1D1D1F] flex items-center justify-center shrink-0">
                          <Mail className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-[#1D1D1F]">Email Officiel</p>
                          <p className="text-[11px] font-mono text-slate-600 truncate">
                            {company.supportEmail}
                          </p>
                        </div>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-[#1D1D1F] transition-colors shrink-0" />
                    </a>
                  )}

                  {company.website && (
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3.5 hover:bg-black/[0.02] transition-colors group cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#0D1B3D]"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-black/[0.04] text-[#1D1D1F] flex items-center justify-center shrink-0">
                          <Globe className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-[#1D1D1F]">Site Web</p>
                          <p className="text-[11px] font-mono text-slate-600 truncate">
                            {company.website}
                          </p>
                        </div>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-[#1D1D1F] transition-colors shrink-0" />
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Établissements — Boutons accessibles + typographie lisible (>= 11px) */}
            {company.establishments && company.establishments.length > 0 ? (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <h4 className="text-[11px] font-bold tracking-wider text-slate-600 uppercase">
                      Nos établissements ({company.establishments.length})
                    </h4>
                  </div>
                  <span className="text-[11px] text-emerald-800 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/80">
                    Ouvert au public
                  </span>
                </div>

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
                      <button
                        type="button"
                        onClick={() => handleOpenEstablishment(est.id)}
                        className="w-full text-left group relative rounded-2xl overflow-hidden border border-black/[0.08] bg-white shadow-sm hover:shadow-md transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0D1B3D]"
                      >
                        {est.imageUrl ? (
                          <div className="relative aspect-[16/10] w-full max-h-52 overflow-hidden bg-slate-100">
                            <img
                              src={est.imageUrl}
                              alt={est.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/15" />
                            <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-1.5">
                              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-white/95 text-slate-900 shadow-sm">
                                {typeLabel}
                              </span>
                              {est.isMain && (
                                <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500 text-white shadow-sm">
                                  ★ Siège
                                </span>
                              )}
                            </div>
                            <div className="absolute bottom-0 inset-x-0 p-3 text-white">
                              <p className="font-bold text-sm leading-tight truncate">{est.name}</p>
                              <p className="text-[11px] text-white/90 flex items-center gap-1 mt-0.5">
                                <MapPin className="w-3 h-3 text-rose-400 shrink-0" />
                                <span className="truncate">{[est.city, est.country].filter(Boolean).join(", ") || est.address}</span>
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="p-4 space-y-2 bg-white">
                            <div className="flex items-center justify-between">
                              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
                                {typeLabel}
                              </span>
                              {est.isMain && (
                                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                                  ★ Siège
                                </span>
                              )}
                            </div>
                            <p className="font-bold text-sm text-[#1D1D1F]">{est.name}</p>
                            <p className="text-xs text-slate-600 flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                              <span>{[est.city, est.country].filter(Boolean).join(", ") || est.address}</span>
                            </p>
                            <div className="pt-2 border-t border-black/[0.05] flex items-center justify-between text-xs text-[#0D1B3D] font-semibold">
                              <span>Consulter la fiche</span>
                              <span className="group-hover:translate-x-0.5 transition-transform">→</span>
                            </div>
                          </div>
                        )}
                      </button>
                    );
                  })()
                ) : (
                  <div className="space-y-2">
                    <div className="max-h-[380px] overflow-y-auto pr-0.5 space-y-2">
                      <div className="grid grid-cols-1 gap-2.5">
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
                            <button
                              key={est.id}
                              type="button"
                              onClick={() => handleOpenEstablishment(est.id)}
                              className="w-full text-left group rounded-xl overflow-hidden border border-black/[0.08] bg-white shadow-sm hover:shadow-md transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0D1B3D]"
                            >
                              {est.imageUrl ? (
                                <div className="relative w-full h-28 overflow-hidden bg-slate-100">
                                  <img
                                    src={est.imageUrl}
                                    alt={est.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/15" />
                                  <div className="absolute top-2 left-2 right-2 flex items-center justify-between gap-1">
                                    <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-white/95 text-slate-900 truncate">
                                      {typeLabel}
                                    </span>
                                    {est.isMain && (
                                      <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-500 text-white shrink-0">
                                        ★ Siège
                                      </span>
                                    )}
                                  </div>
                                  <div className="absolute bottom-0 inset-x-0 p-2.5 text-white">
                                    <p className="font-bold text-xs leading-tight truncate">{est.name}</p>
                                    <p className="text-[11px] text-white/90 flex items-center gap-1 mt-0.5 truncate">
                                      <MapPin className="w-3 h-3 text-rose-400 shrink-0" />
                                      <span className="truncate">{est.city || est.address}</span>
                                    </p>
                                  </div>
                                </div>
                              ) : (
                                <div className="p-3 flex items-start justify-between gap-2">
                                  <div className="min-w-0 space-y-1">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-800 border border-slate-200">
                                        {typeLabel}
                                      </span>
                                      {est.isMain && (
                                        <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                                          ★ Siège
                                        </span>
                                      )}
                                    </div>
                                    <p className="font-bold text-xs text-[#1D1D1F] truncate">{est.name}</p>
                                    <p className="text-[11px] text-slate-600 flex items-center gap-1 truncate">
                                      <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
                                      <span className="truncate">{est.city || est.address}</span>
                                    </p>
                                  </div>
                                  <Store className="w-4 h-4 text-slate-400 shrink-0 mt-1" />
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-500 text-center">
                      Sélectionnez un établissement pour voir ses détails
                    </p>
                  </div>
                )}
              </div>
            ) : (company.address || company.city) ? (
              <div className="space-y-2">
                <h4 className="text-[11px] font-bold tracking-wider text-slate-600 uppercase px-1">
                  Implantation
                </h4>
                <div
                  className="p-3.5 rounded-2xl border shadow-sm flex items-start gap-3"
                  style={{
                    backgroundColor: "var(--company-surface, #FFFFFF)",
                    borderColor: "var(--company-surface-border, rgba(0,0,0,0.08))",
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
                    <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                      {[company.address, company.city, company.country].filter(Boolean).join(", ")}
                    </p>
                  </div>
                </div>
              </div>
            ) : null}

            {/* Réassurance Zalisk */}
            <div className="mt-auto pt-2">
              <div
                className="p-3.5 rounded-2xl border flex items-start gap-3 text-slate-600"
                style={{
                  backgroundColor: "var(--company-surface, rgba(255,255,255,0.8))",
                  borderColor: "var(--company-surface-border, rgba(0,0,0,0.08))",
                }}
              >
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                  style={{
                    backgroundColor: "var(--company-secondary, rgba(0,0,0,0.04))",
                    color: "var(--company-primary)",
                  }}
                >
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <p className="text-[11px] leading-relaxed">
                  Service certifié par Zalisk. Vos échanges et pièces jointes sont transmis directement aux conseillers de l&apos;entreprise.
                </p>
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
