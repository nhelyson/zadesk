"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  MessageSquare,
  LayoutDashboard,
  ExternalLink,
  Lock,
  Layers,
  Sliders,
  Compass,
  Zap,
} from "lucide-react";
import { Sidebar } from "@/components/workspace/Sidebar";
import { Topbar } from "@/components/workspace/Topbar";
import { AppDashboardView } from "@/components/workspace/AppDashboardView";
import { ConversationsView } from "@/components/workspace/ConversationsView";
import { WorkspacePreviewProvider } from "@/components/workspace/WorkspaceContext";
import {
  DashboardStats,
  AgentConversationItem,
  Workspace,
  User,
} from "@/types/workspace";

// ============================================================================
// 1. AUTHENTIC ZADESK DATASET (Reflecting real database and services)
// ============================================================================

const realWorkspace: Workspace = {
  id: "cmvzqrcuq000lpl2264x7nkop",
  name: "MTN Congo SAV",
  slug: "mtn-congo-1",
  role: "OWNER",
  category: "Télécommunications & Numérique",
  description: "Direction de la Relation Client & Support Après-Vente Officiel MTN Congo",
  verified: true,
  isPublic: true,
  supportPhone: "+242 06 600 00 00",
  supportEmail: "serviceclient@mtncongo.net",
  supportWhatsApp: "+242 06 600 00 00",
  address: "Boulevard Denis Sassou Nguesso, Centre-Ville",
  city: "Brazzaville",
  country: "Congo",
  openingHours: "Lundi - Vendredi : 08h00 - 18h00 · Samedi : 09h00 - 13h00",
  cannedResponses: [
    {
      id: "cr-1",
      title: "Prise en charge immédiate",
      category: "Accueil",
      content:
        "Bonjour, votre demande a bien été reçue par notre équipe SAV. Nous l'examinons actuellement et revenons vers vous dans les plus brefs délais.",
      isActive: true,
    },
    {
      id: "cr-2",
      title: "Demande de précision / photo",
      category: "Suivi des demandes",
      content:
        "Afin de traiter votre dossier au plus vite, pourriez-vous nous transmettre une photo ou une description détaillée du problème rencontré ?",
      isActive: true,
    },
    {
      id: "cr-3",
      title: "Délais de traitement SAV",
      category: "Délais de traitement",
      content:
        "Nos techniciens interviennent sous 24h à 48h ouvrées. Vous recevrez une notification par message dès que l'intervention est planifiée.",
      isActive: true,
    },
  ],
  createdAt: "2026-01-15T10:00:00.000Z",
};

const realWorkspacesList: Workspace[] = [
  realWorkspace,
  {
    id: "cmvzo3j2u0000pl1121m8e3gq",
    name: "Otaku Game fest",
    slug: "clinique-sainte-marie",
    role: "ADMIN",
    category: "Loisirs & Gaming",
    verified: true,
    isPublic: true,
    createdAt: "2026-02-01T12:00:00.000Z",
  },
  {
    id: "cmw02i17b000bpl2273vjygx4",
    name: "Louvounou Market",
    slug: "louvounou-market-5",
    role: "OWNER",
    category: "Grande Distribution",
    verified: true,
    isPublic: true,
    createdAt: "2026-02-10T15:00:00.000Z",
  },
];

const realSupervisorUser: User = {
  id: "usr-supervisor-mtn",
  email: "j.makosso@mtncongo.net",
  firstName: "Jean-Pierre",
  lastName: "Makosso",
  name: "Jean-Pierre Makosso",
  avatarUrl: null,
};

const realDashboardStats: DashboardStats = {
  overview: {
    activeConversations: 18,
    waitingAgent: 4,
    openTickets: 7,
    aiResolutionRate: 78.5,
    avgResolutionTimeMinutes: 6.2,
    customerSatisfactionScore: 4.85,
  },
  priorityQueue: [
    {
      id: "conv-101",
      customerName: "Mavoungou Jean-Luc",
      phone: "+242 06 612 34 56",
      channel: "WhatsApp",
      lastMessage: "Le routeur 4G reçu à Pointe-Noire ne capte aucun signal réseau.",
      category: "Équipement & Box",
      urgency: "HIGH",
      status: "WAITING_AGENT",
      timeAgo: "Il y a 3 min",
      unreadCount: 2,
    },
    {
      id: "conv-102",
      customerName: "Gassaye Priscille",
      phone: "+242 05 520 88 12",
      channel: "WhatsApp",
      lastMessage: "Mon paiement Mobile Money a été débité mais mon forfait data n'est pas activé.",
      category: "Mobile Money & Facturation",
      urgency: "CRITICAL",
      status: "ESCALATED",
      timeAgo: "Il y a 8 min",
      unreadCount: 1,
    },
    {
      id: "conv-103",
      customerName: "Batoueni Christian",
      phone: "+242 06 942 11 00",
      channel: "WhatsApp",
      lastMessage: "Demande de raccordement fibre optique pour notre boutique à Nkombo.",
      category: "Nouvelle Installation",
      urgency: "MEDIUM",
      status: "AI_HANDLED",
      timeAgo: "Il y a 14 min",
      unreadCount: 0,
    },
    {
      id: "conv-104",
      customerName: "Ikoule Francine",
      phone: "+242 04 430 92 18",
      channel: "WhatsApp",
      lastMessage: "Confirmation de passage du technicien SAV programmée pour 14h30.",
      category: "Intervention sur site",
      urgency: "LOW",
      status: "RESOLVED",
      timeAgo: "Il y a 25 min",
      unreadCount: 0,
    },
  ],
  recentActivity: [
    {
      id: "act-1",
      type: "AI_RESOLVED",
      title: "Résolution autonome IA",
      description: "Guide APN 4G transmis à M. Okemba (+242 06 811 20 44)",
      timestamp: "Il y a 4 min",
    },
    {
      id: "act-2",
      type: "AGENT_ASSIGNED",
      title: "Dossier attribué à l'Agent",
      description: "Jean-Pierre a pris en charge le dossier #SAV-420 (Mavoungou J-L)",
      timestamp: "Il y a 12 min",
    },
    {
      id: "act-3",
      type: "TICKET_CREATED",
      title: "Dossier SAV créé",
      description: "Référence #SAV-421 générée depuis WhatsApp pour panne box",
      timestamp: "Il y a 21 min",
    },
  ],
  volumeTrend: [
    { time: "08h", total: 4, aiResolved: 3, escalated: 1 },
    { time: "10h", total: 12, aiResolved: 9, escalated: 3 },
    { time: "12h", total: 19, aiResolved: 15, escalated: 4 },
    { time: "14h", total: 16, aiResolved: 12, escalated: 4 },
    { time: "16h", total: 22, aiResolved: 18, escalated: 4 },
    { time: "18h", total: 14, aiResolved: 11, escalated: 3 },
  ],
};

const realConversations: AgentConversationItem[] = [
  {
    id: "conv-101",
    customerName: "Mavoungou Jean-Luc",
    customerPhone: "+242 06 612 34 56",
    status: "OPEN",
    lastMessage: "Le routeur 4G reçu à Pointe-Noire ne capte aucun signal réseau.",
    lastMessageAt: "2026-11-06T19:35:00.000Z",
    assignedAgent: {
      id: "usr-supervisor-mtn",
      user: {
        firstName: "Jean-Pierre",
        lastName: "Makosso",
        email: "j.makosso@mtncongo.net",
      },
    },
    ticket: {
      id: "tick-420",
      reference: "SAV-420",
      title: "Panne détection réseau routeur 4G",
      status: "IN_PROGRESS",
    },
    createdAt: "2026-11-06T19:20:00.000Z",
    updatedAt: "2026-11-06T19:35:00.000Z",
    messages: [
      {
        id: "m-1",
        senderType: "CUSTOMER",
        content: "Bonjour, j'ai récupéré mon routeur 4G ce matin à l'agence de Pointe-Noire mais le voyant réseau clignote en rouge.",
        isInternalNote: false,
        createdAt: "2026-11-06T19:30:00.000Z",
      },
      {
        id: "m-2",
        senderType: "AI",
        content: "Bonjour M. Mavoungou ! Bienvenue sur l'assistance officielle MTN Congo. Avez-vous vérifié si la carte SIM est bien insérée dans l'emplacement 1 ?",
        isInternalNote: false,
        createdAt: "2026-11-06T19:31:00.000Z",
      },
      {
        id: "m-3",
        senderType: "CUSTOMER",
        content: "Oui, la SIM est bien insérée. J'ai redémarré 3 fois sans succès.",
        isInternalNote: false,
        createdAt: "2026-11-06T19:33:00.000Z",
      },
      {
        id: "m-4",
        senderType: "AGENT",
        senderName: "Jean-Pierre Makosso",
        content: "Bonjour Jean-Luc, je prends immédiatement le relais de notre assistant IA. Je viens de vérifier l'activation de votre ligne dans notre système : la SIM était en cours de provisionnement réseau. Pouvez-vous faire un dernier redémarrage dans 2 minutes ?",
        isInternalNote: false,
        createdAt: "2026-11-06T19:35:00.000Z",
      },
    ],
  },
  {
    id: "conv-102",
    customerName: "Gassaye Priscille",
    customerPhone: "+242 05 520 88 12",
    status: "OPEN",
    lastMessage: "Mon paiement Mobile Money a été débité mais mon forfait data n'est pas activé.",
    lastMessageAt: "2026-11-06T19:28:00.000Z",
    assignedAgent: {
      id: "usr-supervisor-mtn",
      user: {
        firstName: "Jean-Pierre",
        lastName: "Makosso",
        email: "j.makosso@mtncongo.net",
      },
    },
    ticket: {
      id: "tick-421",
      reference: "SAV-421",
      title: "Échec rechargement forfait après débit MoMo",
      status: "OPEN",
    },
    createdAt: "2026-11-06T19:25:00.000Z",
    updatedAt: "2026-11-06T19:28:00.000Z",
    messages: [
      {
        id: "m-201",
        senderType: "CUSTOMER",
        content: "Bonjour, mon compte a été débité de 5 000 FCFA mais je n'ai toujours pas reçu les 15 Go.",
        isInternalNote: false,
        createdAt: "2026-11-06T19:28:00.000Z",
      },
    ],
  },
  {
    id: "conv-103",
    customerName: "Batoueni Christian",
    customerPhone: "+242 06 942 11 00",
    status: "WAITING_CUSTOMER",
    lastMessage: "Merci pour les informations, je prépare le dossier de raccordement.",
    lastMessageAt: "2026-11-06T19:15:00.000Z",
    createdAt: "2026-11-06T19:10:00.000Z",
    updatedAt: "2026-11-06T19:15:00.000Z",
    messages: [],
  },
];

// ============================================================================
// 2. COMPOSANT MASTER : CINEMATIC CAMERA DIVE DANS LE VÉRITABLE WORKSPACE
// ============================================================================

export interface WorkspaceLiveShowcaseProps {
  scrollY?: number;
}

export const WorkspaceLiveShowcase: React.FC<WorkspaceLiveShowcaseProps> = () => {
  const runwayRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [activeTab, setActiveTab] = useState<"dashboard" | "conversations">("dashboard");
  const [isMobile, setIsMobile] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  // Responsive & Accessibility detection
  useEffect(() => {
    const checkViewport = () => {
      setIsMobile(window.innerWidth < 1024);
      setReducedMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    };
    checkViewport();
    window.addEventListener("resize", checkViewport, { passive: true });
    return () => window.removeEventListener("resize", checkViewport);
  }, []);

  // Butter-Smooth Scroll Progression Tracking via RequestAnimationFrame
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (!runwayRef.current) {
            ticking = false;
            return;
          }
          const rect = runwayRef.current.getBoundingClientRect();
          const windowH = window.innerHeight;
          const totalDistance = rect.height - windowH;

          if (totalDistance <= 0) {
            setProgress(0);
            ticking = false;
            return;
          }

          // Calculate exact progress [0.0 -> 1.0]
          const currentProgress = Math.max(0, Math.min(1, -rect.top / totalDistance));
          setProgress(currentProgress);

          // Signal navbar whether the camera has crossed the screen boundary
          const isEnteredNow = currentProgress >= 0.78 && rect.bottom > 60;
          document.body.dataset.diveEntered = isEnteredNow ? "true" : "false";
          window.dispatchEvent(
            new CustomEvent("zadesk:dive-state", {
              detail: { isEntered: isEnteredNow },
            })
          );

          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (typeof document !== "undefined") {
        document.body.dataset.diveEntered = "false";
        window.dispatchEvent(
          new CustomEvent("zadesk:dive-state", {
            detail: { isEntered: false },
          })
        );
      }
    };
  }, []);

  // Navigation handler inside the live workspace preview
  const handleSidebarNavigate = useCallback((href: string) => {
    if (href.includes("/conversations")) {
      setActiveTab("conversations");
    } else {
      setActiveTab("dashboard");
    }
  }, []);

  // ==========================================================================
  // 3. CALCUL MATHÉMATIQUE DES 4 PHASES DE LA TRAJECTOIRE CAMÉRA
  // ==========================================================================

  let rotateX = 0;
  let rotateY = 0;
  let scale = 1;
  let translateY = 0;
  let translateZ = 0;
  let spaceVoidOpacity = 1;
  let opticalSweepOpacity = 0;
  let opticalSweepX = -100;
  let hudOpacity = 0;
  let gridOffset = 0;

  // Dimensions & bordures dynamiques interpolées en continu
  let chassisWidth = "92vw";
  let chassisMaxWidth = "1440px";
  let chassisHeight = "84vh";
  let chassisMaxHeight = "900px";
  let chassisBorderRadius = 24;
  let chassisBorder = "1px solid rgba(255, 255, 255, 0.15)";
  let chassisShadow = "0 50px 140px -25px rgba(0, 0, 0, 0.85), 0 20px 60px -15px rgba(16, 185, 129, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1)";

  if (reducedMotion) {
    // Mode accessibilité : pas de déformation spatiale
    rotateX = 0;
    rotateY = 0;
    scale = 1;
    translateY = 0;
    translateZ = 0;
    spaceVoidOpacity = 0;
    hudOpacity = 1;
    chassisWidth = "100vw";
    chassisMaxWidth = "100%";
    chassisHeight = "100vh";
    chassisMaxHeight = "100%";
    chassisBorderRadius = 0;
    chassisBorder = "none";
    chassisShadow = "none";
  } else if (progress < 0.20) {
    // ------------------------------------------------------------------------
    // PHASE 1 — VUE EXTÉRIEURE (Le workspace flotte au loin dans le cosmos spatial)
    // ------------------------------------------------------------------------
    const subP = progress / 0.20;
    rotateX = isMobile ? 10 : 20 - subP * 4;
    rotateY = isMobile ? 0 : -5 + subP * 1;
    scale = isMobile ? 0.85 : 0.72 + subP * 0.04;
    translateY = isMobile ? 15 : 60 - subP * 15;
    translateZ = isMobile ? -100 : -420 + subP * 80;
    spaceVoidOpacity = 1;
    gridOffset = progress * 400;
    hudOpacity = 0;
    chassisWidth = isMobile ? "96vw" : "92vw";
    chassisMaxWidth = "1440px";
    chassisHeight = isMobile ? "88vh" : "84vh";
    chassisMaxHeight = "900px";
    chassisBorderRadius = 24;
  } else if (progress < 0.68) {
    // ------------------------------------------------------------------------
    // PHASE 2 — APPROCHE CINÉMATIQUE (La caméra fonce à travers l'espace 3D)
    // ------------------------------------------------------------------------
    const t = (progress - 0.20) / (0.68 - 0.20);
    // Courbe d'accélération naturelle (critically damped Apple ease-out)
    const e = t * (2 - t);
    rotateX = isMobile ? (1 - e) * 8 + e * 2 : (1 - e) * 16 + e * 2.5;
    rotateY = isMobile ? 0 : (1 - e) * -4;
    scale = isMobile ? 0.88 + e * 0.08 : 0.76 + e * 0.20; // vers 0.96
    translateY = (1 - e) * 45;
    translateZ = (1 - e) * -340;
    spaceVoidOpacity = 1;
    gridOffset = 80 + t * 900; // Effet visuel d'hyper-vitesse
    hudOpacity = 0;
    chassisWidth = isMobile ? "96vw" : "92vw";
    chassisMaxWidth = "1440px";
    chassisHeight = isMobile ? "88vh" : "84vh";
    chassisMaxHeight = "900px";
    chassisBorderRadius = 24;
  } else if (progress < 0.88) {
    // ------------------------------------------------------------------------
    // PHASE 3 — PLONGÉE DANS L'INTERFACE (Franchissement optique du plan de verre)
    // ------------------------------------------------------------------------
    const t = (progress - 0.68) / (0.88 - 0.68);
    rotateX = (1 - t) * (isMobile ? 2 : 2.5); // s'aligne strictement à 0.0°
    rotateY = 0;
    scale = 0.96 + t * 0.04; // 0.96 -> 1.000
    translateY = 0;
    translateZ = 0;
    spaceVoidOpacity = Math.max(0, 1 - t * 1.5); // Fondu continu du vide spatial
    // Balayage lumineux anamorphique simulant la pénétration de la lentille
    opticalSweepOpacity = Math.sin(t * Math.PI) * 0.95;
    opticalSweepX = t * 240 - 70;
    hudOpacity = 0;

    // Expansion géométrique continue du châssis vers le plein écran 100% 1:1
    const w = isMobile ? 96 + t * 4 : 92 + t * 8;
    const h = isMobile ? 88 + t * 12 : 84 + t * 16;
    chassisWidth = `${w}vw`;
    chassisMaxWidth = t > 0.6 ? "100%" : "1440px";
    chassisHeight = `${h}vh`;
    chassisMaxHeight = t > 0.6 ? "100%" : "900px";
    chassisBorderRadius = Math.round(24 * (1 - t));
    chassisBorder = `1px solid rgba(255, 255, 255, ${(1 - t) * 0.15})`;
    chassisShadow = `0 ${Math.round(50 * (1 - t))}px ${Math.round(140 * (1 - t))}px -25px rgba(0, 0, 0, ${(1 - t) * 0.85}), 0 0 0 1px rgba(255, 255, 255, ${(1 - t) * 0.1})`;
  } else {
    // ------------------------------------------------------------------------
    // PHASE 4 — DANS LE VÉRITABLE WORKSPACE (100% 1:1, proportions réelles natives)
    // ------------------------------------------------------------------------
    rotateX = 0;
    rotateY = 0;
    scale = 1;
    translateY = 0;
    translateZ = 0;
    spaceVoidOpacity = 0;
    opticalSweepOpacity = 0;
    hudOpacity = Math.min(1, (progress - 0.88) / 0.06);

    chassisWidth = "100vw";
    chassisMaxWidth = "100%";
    chassisHeight = "100vh";
    chassisMaxHeight = "100%";
    chassisBorderRadius = 0;
    chassisBorder = "none";
    chassisShadow = "none";
  }

  const isEntered = progress >= 0.88;

  return (
    <div
      ref={runwayRef}
      id="workspace-dive-experience"
      className="relative w-full z-20"
      style={{
        height: isMobile ? "240vh" : "320vh",
      }}
    >
      {/* ==================================================================== */}
      {/* STICKY CINEMATIC VIEWPORT (Fixe à l'écran pendant toute la plongée)   */}
      {/* ==================================================================== */}
      <div
        className="sticky top-0 h-screen w-full flex flex-col items-center justify-center overflow-hidden pointer-events-auto bg-[#F8FAFC]"
      >
        {/* ------------------------------------------------------------------ */}
        {/* SPATIAL VOID & PERSPECTIVE WARP GRID (Atmosphère cosmique)         */}
        {/* ------------------------------------------------------------------ */}
        {spaceVoidOpacity > 0.005 && (
          <div
            className="absolute inset-0 pointer-events-none overflow-hidden transition-opacity duration-75 z-10"
            style={{
              opacity: spaceVoidOpacity,
              backgroundColor: "#070B14",
            }}
          >
            {/* Deep Volumetric Aurora Glows */}
            <div className="absolute top-1/4 left-1/4 w-[700px] h-[500px] bg-emerald-500/20 blur-[160px] rounded-full -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[450px] bg-teal-500/15 blur-[150px] rounded-full translate-x-1/3 translate-y-1/3" />
            <div className="absolute top-1/2 left-1/2 w-[800px] h-[400px] bg-indigo-500/10 blur-[180px] rounded-full -translate-x-1/2 -translate-y-1/2" />

            {/* 3D Perspective Floor Grid (Sensation immédiate de voyage et de vitesse) */}
            <div
              className="absolute inset-x-0 bottom-0 h-[65vh] pointer-events-none origin-bottom opacity-40"
              style={{
                transform: "perspective(800px) rotateX(72deg) translateY(60px)",
                backgroundImage:
                  "linear-gradient(to right, rgba(16, 185, 129, 0.25) 1px, transparent 1px), linear-gradient(to bottom, rgba(16, 185, 129, 0.25) 1px, transparent 1px)",
                backgroundSize: "60px 60px",
                backgroundPosition: `0px ${gridOffset}px`,
                maskImage: "linear-gradient(to top, rgba(0,0,0,1) 15%, transparent 90%)",
                WebkitMaskImage: "linear-gradient(to top, rgba(0,0,0,1) 15%, transparent 90%)",
              }}
            />

            {/* Subtle Horizon Line Glow */}
            <div className="absolute top-1/2 inset-x-0 h-px bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent" />
          </div>
        )}

        {/* ================================================================== */}
        {/* THE 3D WORKSTATION CHASSIS (Transformé au fil du scroll)           */}
        {/* ================================================================== */}
        <div
          className="w-full h-full flex items-center justify-center transform-gpu will-change-transform z-20"
          style={{
            perspective: isMobile ? "1100px" : "1600px",
            perspectiveOrigin: "50% 50%",
          }}
        >
          <div
            className="relative flex flex-col overflow-hidden bg-[#F8FAFC] text-slate-900 transform-gpu will-change-transform"
            style={{
              width: chassisWidth,
              maxWidth: chassisMaxWidth,
              height: chassisHeight,
              maxHeight: chassisMaxHeight,
              borderRadius: `${chassisBorderRadius}px`,
              border: chassisBorder,
              transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(${translateY}px) translateZ(${translateZ}px) scale(${scale})`,
              boxShadow: chassisShadow,
            }}
          >
            {/* -------------------------------------------------------------- */}
            {/* OPTICAL ANAMORPHIC LIGHT SWEEP (Phase 3 : Franchissement)      */}
            {/* -------------------------------------------------------------- */}
            {opticalSweepOpacity > 0.01 && (
              <div
                className="absolute inset-y-0 w-80 pointer-events-none z-50 transition-opacity"
                style={{
                  opacity: opticalSweepOpacity,
                  left: `${opticalSweepX}%`,
                  background:
                    "linear-gradient(115deg, transparent 0%, rgba(255,255,255,0.1) 20%, rgba(255,255,255,0.85) 50%, rgba(16,185,129,0.5) 55%, rgba(56,189,248,0.3) 60%, transparent 80%)",
                  filter: "blur(6px)",
                }}
              />
            )}

            {/* -------------------------------------------------------------- */}
            {/* THE TRUE ZADESK WORKSPACE (Composants natifs réutilisés)       */}
            {/* -------------------------------------------------------------- */}
            <div className="flex-1 flex overflow-hidden relative w-full h-full">
              <WorkspacePreviewProvider
                initialWorkspace={realWorkspace}
                initialWorkspaces={realWorkspacesList}
                initialUser={realSupervisorUser}
                initialRole="OWNER"
              >
                <div className="flex w-full h-full overflow-hidden antialiased bg-[#F8FAFC]">
                  
                  {/* REAL WORKSPACE SIDEBAR (Identique au produit) */}
                  <Sidebar
                    activePathOverride={
                      activeTab === "conversations" ? "/app/conversations" : "/app"
                    }
                    onNavigate={handleSidebarNavigate}
                  />

                  {/* REAL WORKSPACE MAIN STAGE */}
                  <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
                    {/* REAL WORKSPACE TOPBAR (Identique au produit) */}
                    <Topbar
                      activePathOverride={
                        activeTab === "conversations" ? "/app/conversations" : "/app"
                      }
                      onNavigate={handleSidebarNavigate}
                    />

                    {/* REAL WORKSPACE CONTENT (Dashboard ou Conversations WhatsApp) */}
                    <main className="flex-1 p-3 sm:p-5 lg:p-7 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200">
                      <div className="max-w-7xl mx-auto w-full">
                        {activeTab === "dashboard" ? (
                          <AppDashboardView
                            previewStats={realDashboardStats}
                            onNavigate={handleSidebarNavigate}
                          />
                        ) : (
                          <ConversationsView
                            previewConversations={realConversations}
                          />
                        )}
                      </div>
                    </main>
                  </div>
                </div>
              </WorkspacePreviewProvider>
            </div>

          </div>
        </div>

        {/* ================================================================== */}
        {/* PHASE 4 REFINED FLOATING BADGE (Non-obstructive live indicator)    */}
        {/* ================================================================== */}
        {hudOpacity > 0.05 && (
          <div
            className="fixed bottom-5 right-5 z-40 pointer-events-auto transition-all duration-300"
            style={{ opacity: hudOpacity }}
          >
            <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-slate-950/90 backdrop-blur-2xl border border-white/15 text-white shadow-[0_15px_35px_rgba(0,0,0,0.4)]">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#10B981]" />
                <span className="text-[11px] font-semibold tracking-tight text-slate-200">
                  Direct · MTN Congo SAV
                </span>
              </div>

              <span className="text-slate-600 text-xs">|</span>

              <Link
                href="/register"
                className="px-3 py-1 rounded-xl text-[11px] font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20 transition-all flex items-center gap-1 active:scale-95"
              >
                <span>Créer mon SAV</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default WorkspaceLiveShowcase;
