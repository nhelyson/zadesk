"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  MessageSquare, 
  Store, 
  Users, 
  CheckCircle2, 
  ChevronRight,
  ChevronLeft,
  Clock,
  ShieldCheck,
  Building
} from "lucide-react";

interface StoryItem {
  id: "whatsapp" | "guichet" | "equipe";
  tabLabel: string;
  tabTagline: string;
  tabIcon: React.ElementType;
  title: string;
  description: string;
  photoUrl: string;
  photoAlt: string;
  floatingCard: {
    headerLeft: string;
    headerRight: string;
    content: React.ReactNode;
  };
  highlights: {
    title: string;
    desc: string;
  }[];
}

const STORIES: StoryItem[] = [
  {
    id: "whatsapp",
    tabLabel: "1. Sur WhatsApp",
    tabTagline: "Le canal le plus direct pour vos clients",
    tabIcon: MessageSquare,
    title: "Le client vous écrit directement, sans créer de compte.",
    description:
      "Vos clients n'ont pas besoin d'installer une application ni d'attendre qu'un numéro sonne. Ils envoient un message sur le numéro officiel de votre entreprise. Votre équipe reçoit la demande sur un espace partagé, sans encombrer les téléphones personnels.",
    photoUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=1000&auto=format&fit=crop&q=80",
    photoAlt: "Cliente consultant sa réponse sur WhatsApp",
    floatingCard: {
      headerLeft: "Discussion WhatsApp en cours",
      headerRight: "Réponse en 2 min",
      content: (
        <div className="space-y-2 text-xs">
          <div className="bg-white p-2.5 rounded-2xl rounded-tl-none border border-slate-200 shadow-sm max-w-[88%] text-slate-800">
            <p className="font-normal">
              « Bonjour, est-ce que mon colis #4820 est arrivé à l&apos;agence de Bacongo ? »
            </p>
            <span className="block text-[10px] text-slate-400 text-right mt-1">10:42</span>
          </div>

          <div className="ml-auto bg-emerald-600 text-white p-2.5 rounded-2xl rounded-tr-none shadow-sm max-w-[88%]">
            <p className="font-medium text-[11px] leading-snug">
              « Bonjour ! Oui, votre colis est au guichet n°2. Votre code de retrait est le 4820. »
            </p>
            <span className="block text-[10px] text-emerald-200 text-right mt-1">10:44 · Reçu ✓✓</span>
          </div>
        </div>
      ),
    },
    highlights: [
      {
        title: "Zéro installation imposée",
        desc: "Vos clients utilisent WhatsApp qu'ils ont déjà sur leur téléphone.",
      },
      {
        title: "Mémoire partagée",
        desc: "L'historique reste consigné dans l'entreprise même si un agent change de poste.",
      },
      {
        title: "Vie privée protégée",
        desc: "Vos collaborateurs ne communiquent plus depuis leur numéro personnel.",
      },
    ],
  },
  {
    id: "guichet",
    tabLabel: "2. Au guichet d'agence",
    tabTagline: "Accueil physique avec tout l'historique",
    tabIcon: Store,
    title: "Le client arrive en agence : son dossier est déjà ouvert.",
    description:
      "Quand un client se présente au comptoir, l'agent tape son numéro de téléphone ou scanne sa référence. Tout ce qui s'est dit le matin sur WhatsApp apparaît sur l'écran du guichet. Le client n'a pas à répéter son problème.",
    photoUrl: "https://images.unsplash.com/photo-1556740758-90de374c12ad?w=1000&auto=format&fit=crop&q=80",
    photoAlt: "Agent accueillant un client au guichet d'agence",
    floatingCard: {
      headerLeft: "Guichet Agence · Poste 02",
      headerRight: "Dossier #4829",
      content: (
        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between bg-slate-50 border border-slate-200 p-2 rounded-xl">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="font-bold text-slate-900 text-[11px]">Dossier identifié</span>
            </div>
            <span className="text-[10px] font-semibold text-slate-700 bg-slate-200 px-2 py-0.5 rounded">
              Retrait colis
            </span>
          </div>
          <p className="text-slate-700 text-[11px] leading-relaxed bg-white p-2 rounded-xl border border-slate-200">
            « Bonjour M. Alain ! Vous venez pour la commande vue ce matin sur WhatsApp ? La voici prête, je vous remets le bon de retrait. »
          </p>
        </div>
      ),
    },
    highlights: [
      {
        title: "Recherche par numéro de téléphone",
        desc: "Retrouvez n'importe quelle commande ou réclamation en 2 secondes au comptoir.",
      },
      {
        title: "Continuité digital ➔ comptoir",
        desc: "Ce qui est écrit sur WhatsApp est accessible au guichetier sans rupture.",
      },
      {
        title: "Fin des fiches papier égarées",
        desc: "Toutes les notes de dépôt et de remise sont horodatées et sécurisées.",
      },
    ],
  },
  {
    id: "equipe",
    tabLabel: "3. Dans votre équipe",
    tabTagline: "Organisation sans surcharge ni oublis",
    tabIcon: Users,
    title: "Chaque dossier est assigné et suivi jusqu'à sa résolution.",
    description:
      "Les demandes des clients ne restent plus bloquées sur le téléphone d'un employé absent. Les responsables voient qui traite quoi en temps réel, assignent les urgences et s'assurent qu'aucun client ne reste sans réponse.",
    photoUrl: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1000&auto=format&fit=crop&q=80",
    photoAlt: "Équipe de travail collaborant autour d'un tableau de bord",
    floatingCard: {
      headerLeft: "Espace d'équipe SAV",
      headerRight: "Journée en cours",
      content: (
        <div className="space-y-2 text-xs">
          <div className="grid grid-cols-3 gap-1.5 text-center">
            <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
              <span className="block font-bold text-slate-900 text-sm">48</span>
              <span className="text-[10px] text-slate-500">Reçues</span>
            </div>
            <div className="bg-emerald-50 p-2 rounded-lg border border-emerald-200">
              <span className="block font-bold text-emerald-800 text-sm">46</span>
              <span className="text-[10px] text-emerald-800">Résolues</span>
            </div>
            <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
              <span className="block font-bold text-slate-700 text-sm">2</span>
              <span className="text-[10px] text-slate-500">En cours</span>
            </div>
          </div>
          <p className="text-[11px] text-slate-600 bg-white p-2 rounded-lg border border-slate-200 text-center">
            Toutes les demandes du jour sont traitées ou assignées.
          </p>
        </div>
      ),
    },
    highlights: [
      {
        title: "Passation d'équipe instantanée",
        desc: "Un collègue prend le relais sur un dossier avec l'ensemble des échanges précédents.",
      },
      {
        title: "Attribution par spécialité",
        desc: "Les réclamations techniques vont aux techniciens, les commandes au commerce.",
      },
      {
        title: "Suivi des délais",
        desc: "Identifiez les demandes en attente pour éviter les retards de traitement.",
      },
    ],
  },
];

export const HumanStoriesTriptych: React.FC = () => {
  const [activeTab, setActiveTab] = useState<number>(0);
  const touchStartX = useRef<number | null>(null);

  const current = STORIES[activeTab];

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        setActiveTab((prev) => (prev + 1) % STORIES.length);
      } else {
        setActiveTab((prev) => (prev - 1 + STORIES.length) % STORIES.length);
      }
    }
    touchStartX.current = null;
  };

  return (
    <div className="space-y-10">
      
      {/* Asymmetric Split Layout: Left is Action & Narrative, Right is Photographic Visual */}
      <div 
        className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        
        {/* Left Column (5 cols): Integrated Editorial + Segmented Tabs */}
        <div className="lg:col-span-5 space-y-6 text-left">
          
          {/* Main Direct Headline */}
          <div className="space-y-3">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-950 tracking-tight leading-[1.18]">
              Vos clients n&apos;ont plus à courir après vos équipes.
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
              Un service après-vente réactif où chaque demande trouve une réponse — sur WhatsApp comme au guichet de vos agences.
            </p>
          </div>

          {/* 3 Step Selectors (Clean vertical tabs on desktop, segmented on mobile) */}
          <div className="space-y-2 pt-2">
            {STORIES.map((story, idx) => {
              const Icon = story.tabIcon;
              const isActive = activeTab === idx;
              return (
                <button
                  key={story.id}
                  onClick={() => setActiveTab(idx)}
                  className={`w-full flex items-center justify-between p-3.5 sm:p-4 rounded-2xl text-left transition-all duration-200 touch-manipulation border ${
                    isActive
                      ? "bg-slate-900 text-white border-slate-900 shadow-md"
                      : "bg-slate-50 text-slate-700 border-slate-200/80 hover:bg-slate-100 hover:text-slate-950 active:scale-[0.99]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                        isActive
                          ? "bg-emerald-500 text-white"
                          : "bg-white text-slate-600 border border-slate-200"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="block text-xs sm:text-sm font-bold leading-tight">
                        {story.tabLabel}
                      </span>
                      <span className={`text-[11px] leading-tight ${isActive ? "text-slate-300" : "text-slate-500"}`}>
                        {story.tabTagline}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className={`w-4 h-4 shrink-0 transition-transform ${isActive ? "text-emerald-400 translate-x-0.5" : "text-slate-400"}`} />
                </button>
              );
            })}
          </div>

          {/* Factual Highlights for active tab */}
          <div className="space-y-2.5 pt-4 border-t border-slate-200">
            {current.highlights.map((point, i) => (
              <div key={i} className="flex items-start gap-2.5 text-xs text-slate-600">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 font-semibold">{point.title} : </strong>
                  <span>{point.desc}</span>
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* Right Column (7 cols): Immersive Real Photo + Functional Card Overlay */}
        <div className="lg:col-span-7 relative">
          <div className="relative mx-auto rounded-3xl overflow-hidden border border-slate-200 shadow-xl bg-slate-900 group">
            
            {/* Real Photograph */}
            <img
              src={current.photoUrl}
              alt={current.photoAlt}
              className="w-full h-[320px] sm:h-[420px] lg:h-[480px] object-cover object-center filter brightness-[0.98]"
            />

            {/* Gradient shadow for card readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent pointer-events-none" />

            {/* Card Overlay */}
            <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-white/60 shadow-lg text-left">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200">
                <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                  {current.floatingCard.headerLeft}
                </h4>
                <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                  {current.floatingCard.headerRight}
                </span>
              </div>
              {current.floatingCard.content}
            </div>

            {/* Mobile swipe counter */}
            <div className="absolute top-4 right-4 sm:hidden flex items-center gap-1 bg-black/60 px-2.5 py-1 rounded-full text-[11px] text-white">
              <span>{activeTab + 1} / {STORIES.length}</span>
            </div>
          </div>

          {/* Mobile direct navigation */}
          <div className="flex sm:hidden items-center justify-between mt-3 px-1">
            <button
              onClick={() => setActiveTab((prev) => (prev - 1 + STORIES.length) % STORIES.length)}
              className="flex items-center gap-1 text-xs font-semibold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-xl active:scale-95 touch-manipulation"
            >
              <ChevronLeft className="w-4 h-4" /> Précédent
            </button>
            <div className="flex gap-1.5">
              {STORIES.map((_, i) => (
                <span
                  key={i}
                  className={`w-2 h-2 rounded-full transition-all ${
                    activeTab === i ? "bg-slate-900 w-4" : "bg-slate-300"
                  }`}
                />
              ))}
            </div>
            <button
              onClick={() => setActiveTab((prev) => (prev + 1) % STORIES.length)}
              className="flex items-center gap-1 text-xs font-semibold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-xl active:scale-95 touch-manipulation"
            >
              Suivant <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

      {/* 3 Bottom Direct Factual Invariants (No fake reviews, no sparkles) */}
      <div className="pt-6 border-t border-slate-200/80 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
          <Clock className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="text-left">
            <h5 className="text-xs sm:text-sm font-bold text-slate-900">Réponse directe</h5>
            <p className="text-[11px] sm:text-xs text-slate-600 leading-normal mt-0.5">
              Traitement rapide des questions courantes sans lourdeur administrative.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
          <Building className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
          <div className="text-left">
            <h5 className="text-xs sm:text-sm font-bold text-slate-900">Continuité en agence</h5>
            <p className="text-[11px] sm:text-xs text-slate-600 leading-normal mt-0.5">
              L&apos;agent au guichet retrouve l&apos;historique complet dès l&apos;arrivée du client.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
          <ShieldCheck className="w-5 h-5 text-slate-800 shrink-0 mt-0.5" />
          <div className="text-left">
            <h5 className="text-xs sm:text-sm font-bold text-slate-900">Numéros protégés</h5>
            <p className="text-[11px] sm:text-xs text-slate-600 leading-normal mt-0.5">
              Les téléphones personnels de vos employés ne sont plus diffusés aux clients.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};
