"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { 
  ArrowRight, 
  Check, 
  Minus, 
  ChevronDown, 
  ShieldCheck, 
  Smartphone, 
  Clock, 
  RefreshCcw,
  Sparkles,
  Menu,
  X
} from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { Footer } from "@/components/landing/Footer";
import gsap from "gsap";

interface PlanItem {
  id: string;
  name: string;
  tagline: string;
  audience: string;
  price: string;
  periodLabel: string;
  badge?: string;
  isPopular?: boolean;
  cta: string;
  href: string;
  features: string[];
}

const PLANS: PlanItem[] = [
  {
    id: "decouverte",
    name: "Découverte",
    tagline: "Offre gratuite permanente pour lancer sa relation client.",
    audience: "Pour tester et lancer le service client de son entreprise sans engagement financier.",
    price: "0",
    periodLabel: "FCFA permanent",
    cta: "Commencer gratuitement",
    href: "/register?plan=decouverte",
    features: [
      "1 agent connecté (propriétaire)",
      "1 établissement principal",
      "Espace public d'entreprise vérifié",
      "Messagerie web directe Zadesk sans compte client",
      "Chat instantané sans compte ni application pour le client",
      "Boîte de réception partagée & historique des échanges",
      "Attribution manuelle des conversations",
      "Assistance standard par e-mail",
    ],
  },
  {
    id: "starter",
    name: "Starter",
    tagline: "Pour structurer la relation client en ligne d'une PME ou boutique active.",
    audience: "Idéal pour les commerces, artisans et prestataires avec 1 à 2 conseillers dédiés.",
    price: "10 000",
    periodLabel: "FCFA / mois",
    cta: "Choisir Starter",
    href: "/register?plan=starter",
    features: [
      "1 à 2 agents connectés",
      "1 établissement principal",
      "Espace public de l'entreprise",
      "Messagerie web Zadesk haute réactivité",
      "Chat instantané sans compte ni application pour le client",
      "Boîte partagée & historique des échanges unifié",
      "Attribution manuelle & organisation d'équipe",
      "Routage intelligent des demandes par compétences",
      "100 résolutions automatiques par IA / mois (En préparation)",
      "Assistance standard par e-mail",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    tagline: "Pour les entreprises avec une équipe relation client active et points de vente.",
    audience: "Conçu pour les équipes en croissance, showrooms et boutiques avec comptoirs physiques.",
    price: "45 000",
    periodLabel: "FCFA / mois",
    isPopular: true,
    badge: "Recommandé",
    cta: "Choisir Pro",
    href: "/register?plan=pro",
    features: [
      "Jusqu'à 5 agents avec rôles spécialisés (Admin, Manager, Agent)",
      "Gestion multi-établissements (jusqu'à 3 agences physiques)",
      "Messagerie Zadesk haute disponibilité",
      "Routage intelligent et prioritaire par compétences",
      "Mesure d'activité et charge des agents en temps réel",
      "IA connectée aux documents et catalogues (En préparation)",
      "Génération de QR codes pour les points de vente (En préparation)",
      "Assistance prioritaire dédiée",
    ],
  },
  {
    id: "entreprise",
    name: "Entreprise",
    tagline: "Pour les réseaux de distribution, cliniques et multi-agences régionales.",
    audience: "Pour les organisations structurées avec plusieurs implantations ou filiales.",
    price: "150 000",
    periodLabel: "FCFA / mois",
    cta: "Choisir Entreprise",
    href: "/register?plan=entreprise",
    features: [
      "Agents, managers et agences sans limite logicielle",
      "Espaces multi-établissements & agences régionales",
      "Gestion des rôles et permissions d'équipe sur-mesure",
      "SLA personnalisés et garantis (En préparation)",
      "Intégration API personnalisée (En préparation)",
      "Responsable de compte Zadesk dédié (Prestation humaine)",
      "Formation complète des équipes sur site ou à distance (Prestation humaine)",
      "Étude personnalisée d'intégration avec vos outils tiers (Prestation humaine)",
    ],
  },
];

interface ComparisonCategory {
  title: string;
  items: {
    label: string;
    decouverte: string | boolean;
    starter: string | boolean;
    pro: string | boolean;
    entreprise: string | boolean;
  }[];
}

const COMPARISON_CATEGORIES: ComparisonCategory[] = [
  {
    title: "Équipe & Accès",
    items: [
      { label: "Agents connectés inclus", decouverte: "1 agent", starter: "1 à 2 agents", pro: "Jusqu'à 5 agents", entreprise: "Sans limite logicielle" },
      { label: "Rôles d'équipe (Admin, Manager, Agent)", decouverte: false, starter: "Standard", pro: "Spécialisés", entreprise: "Personnalisés" },
      { label: "Gestion multi-établissements & agences", decouverte: "1 siège", starter: "1 siège", pro: "Jusqu'à 3 agences", entreprise: "Illimité" },
    ],
  },
  {
    title: "Canaux & Expérience Client",
    items: [
      { label: "Espace public de l'entreprise vérifié", decouverte: true, starter: true, pro: true, entreprise: true },
      { label: "Chat web instantané (sans compte ni appli client)", decouverte: true, starter: true, pro: true, entreprise: true },
      { label: "Disponibilité réseau messagerie", decouverte: "Standard", starter: "Standard", pro: "Prioritaire", entreprise: "Dédiée" },
      { label: "Module QR codes comptoirs & guichets", decouverte: false, starter: false, pro: "En préparation", entreprise: "En préparation" },
    ],
  },
  {
    title: "Gestion des Conversations & Routage",
    items: [
      { label: "Boîte de réception partagée & historique unifié", decouverte: true, starter: true, pro: true, entreprise: true },
      { label: "Attribution manuelle des conversations", decouverte: true, starter: true, pro: true, entreprise: true },
      { label: "Routage intelligent par compétences", decouverte: false, starter: "Inclus", pro: "Prioritaire", entreprise: "Avancé multi-équipes" },
      { label: "Résolutions automatiques par IA", decouverte: false, starter: "100 / mois (En préparation)", pro: "Connectée aux catalogues (En préparation)", entreprise: "Sur-mesure (En préparation)" },
    ],
  },
  {
    title: "Pilotage, Accompagnement & Support",
    items: [
      { label: "Mesure d'activité & charge d'équipe", decouverte: false, starter: "Basique", pro: "Temps réel", entreprise: "Analytique avancée" },
      { label: "Type d'assistance technique", decouverte: "E-mail standard", starter: "E-mail standard", pro: "Prioritaire dédiée", entreprise: "Gestionnaire dédié (Prestation humaine)" },
      { label: "Formation complète des équipes", decouverte: false, starter: false, pro: false, entreprise: "Sur site ou à distance (Prestation humaine)" },
      { label: "Intégration d'outils tiers & API", decouverte: false, starter: false, pro: false, entreprise: "Étude d'intégration (Prestation humaine)" },
    ],
  },
];

interface FaqItem {
  question: string;
  answer: string;
}

const FAQS: FaqItem[] = [
  {
    question: "Puis-je changer d'offre ou résilier à tout moment ?",
    answer: "Absolument. Tous les forfaits payants Zadesk sont souscrits sur une base mensuelle sans engagement de durée. Vous pouvez changer de formule, ajouter des sièges ou résilier à chaque fin d'échéance mensuelle directement depuis vos paramètres.",
  },
  {
    question: "Comment fonctionne l'offre Découverte à 0 FCFA ?",
    answer: "L'offre Découverte est 100% gratuite et permanente. Elle vous permet d'ouvrir votre espace public, de connecter un agent et de recevoir directement les messages de vos clients sans aucune limite de temps ni carte bancaire requise.",
  },
  {
    question: "Quels sont les moyens de paiement acceptés en zone CEMAC ?",
    answer: "Nous acceptons les règlements par Mobile Money locaux (Airtel Money, MTN Mobile Money) ainsi que les cartes bancaires via notre partenaire de paiement sécurisé SasPay. Vos transactions sont libellées en Francs CFA (XAF).",
  },
  {
    question: "Mes clients doivent-ils télécharger une application pour m'écrire ?",
    answer: "Non, jamais. Vos clients discutent directement avec vous depuis leur navigateur web (sur mobile ou ordinateur) en scannant votre QR code ou en cliquant sur votre lien public. Ils n'ont ni compte à créer, ni mot de passe à retenir.",
  },
  {
    question: "Que se passe-t-il si je choisis une offre payante avant de payer ?",
    answer: "Votre espace entreprise est immédiatement créé et l'offre Découverte est activée sans délai. Vous conservez votre compte, vos configurations et vos données. Dès que votre premier règlement mensuel est confirmé, les capacités de la formule choisie sont débloquées.",
  },
  {
    question: "Y a-t-il des frais cachés ou des coûts de mise en service ?",
    answer: "Aucun. Les tarifs affichés sont transparents, nets et sans frais d'activation. Vous ne payez que le montant mensuel de votre forfait en toute clarté.",
  },
];

export default function TarifsPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeFaqIndex, setActiveFaqIndex] = useState<number | null>(null);
  const [activeMobileCategory, setActiveMobileCategory] = useState<number>(0);

  const heroRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const compRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    if (heroRef.current) {
      gsap.fromTo(
        heroRef.current,
        { opacity: 0, y: 25 },
        { opacity: 1, y: 0, duration: 0.7, ease: "power2.out" }
      );
    }
  }, []);

  const toggleFaq = (idx: number) => {
    setActiveFaqIndex(activeFaqIndex === idx ? null : idx);
  };

  return (
    <div className="min-h-[100svh] flex flex-col bg-white text-[#0D1B3D] selection:bg-emerald-500 selection:text-white">
      
      {/* ============================================================ */}
      {/* 1. TOPBAR COMMERCIALE FLUIDE & RESPONSIVE                    */}
      {/* ============================================================ */}
      <header className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-xl border-b border-slate-200/80 transition-all">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 h-18 sm:h-20 flex items-center justify-between">
          
          <Link href="/" className="flex items-center gap-2 group cursor-pointer" aria-label="Accueil Zadesk">
            <Logo size="md" isDark={false} />
          </Link>

          {/* Navigation centrale desktop */}
          <nav className="hidden lg:flex items-center gap-8 text-[13.5px] font-medium text-slate-600">
            <Link href="/#conversation-not-ticket" className="hover:text-slate-950 transition-colors">
              Notre approche
            </Link>
            <Link href="/#secteurs" className="hover:text-slate-950 transition-colors">
              Secteurs
            </Link>
            <Link href="/tarifs" className="text-emerald-700 font-semibold transition-colors">
              Tarifs
            </Link>
            <Link href="/#faq" className="hover:text-slate-950 transition-colors">
              FAQ
            </Link>
          </nav>

          {/* Actions Droite Desktop */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/login"
              style={{ touchAction: "manipulation" }}
              className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-700 hover:text-slate-950 transition-colors"
            >
              Se connecter
            </Link>
            <Link
              href="/register"
              style={{ touchAction: "manipulation" }}
              className="h-10 px-5 rounded-xl bg-[#0D1B3D] hover:bg-slate-900 text-white text-xs sm:text-sm font-semibold inline-flex items-center justify-center gap-2 active:scale-[0.98] transition-all cursor-pointer shadow-xs"
            >
              <span>Créer mon espace</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-300" />
            </Link>
          </div>

          {/* Bouton Menu Mobile */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Ouvrir le menu"
            className="md:hidden p-2 rounded-xl text-slate-800 hover:bg-slate-100 transition-colors"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Tiroir Mobile */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-slate-200 bg-white px-6 py-6 space-y-4 shadow-lg animate-in slide-in-from-top-2 duration-150">
            <nav className="flex flex-col space-y-3 text-sm font-medium text-slate-700">
              <Link href="/#conversation-not-ticket" onClick={() => setMobileMenuOpen(false)}>
                Notre approche
              </Link>
              <Link href="/#secteurs" onClick={() => setMobileMenuOpen(false)}>
                Secteurs
              </Link>
              <Link href="/tarifs" className="text-emerald-700 font-semibold" onClick={() => setMobileMenuOpen(false)}>
                Tarifs
              </Link>
              <Link href="/#faq" onClick={() => setMobileMenuOpen(false)}>
                FAQ
              </Link>
            </nav>
            <div className="pt-4 border-t border-slate-100 flex flex-col gap-2.5">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full h-11 rounded-xl border border-slate-200 text-slate-800 font-semibold text-sm flex items-center justify-center"
              >
                Se connecter
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full h-11 rounded-xl bg-[#0D1B3D] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-xs"
              >
                <span>Créer mon espace</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">
        
        {/* ============================================================ */}
        {/* 2. HERO ÉDITORIAL & TITRE MONUMENTAL                         */}
        {/* ============================================================ */}
        <section className="pt-16 sm:pt-24 pb-14 sm:pb-20 border-b border-slate-200/70 bg-[#FBFBFC]">
          <div ref={heroRef} className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
            
            <div className="mb-4">
              <span className="text-[11px] sm:text-xs font-bold uppercase tracking-widest text-emerald-600 block">
                Grille Tarifaire Officielle • Zone CEMAC
              </span>
            </div>

            <div className="max-w-3xl">
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-[#0D1B3D] tracking-[-0.04em] leading-[0.98] uppercase">
                Une tarification claire.<br />
                <span className="text-slate-400 font-normal">Faite pour votre rythme.</span>
              </h1>
              <p className="mt-5 text-base sm:text-lg text-slate-600 font-normal leading-relaxed">
                De l&apos;offre permanente gratuite pour démarrer sereinement aux réseaux multi-agences, choisissez la formule adaptée à votre entreprise. Tous nos forfaits sont libellés en FCFA, sans engagement et sans frais cachés.
              </p>
            </div>

            {/* Badges de confiance & Transparence */}
            <div className="mt-8 pt-8 border-t border-slate-200/80 flex flex-wrap items-center gap-6 sm:gap-10 text-xs sm:text-sm text-slate-600 font-normal">
              <div className="inline-flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Découverte 100% gratuit à vie</span>
              </div>
              <div className="inline-flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Sans carte bancaire obligatoire</span>
              </div>
              <div className="inline-flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-emerald-600" />
                <span>Mobile Money (Airtel &amp; MTN)</span>
              </div>
              <div className="inline-flex items-center gap-2">
                <RefreshCcw className="w-4 h-4 text-emerald-600" />
                <span>Résiliation libre chaque mois</span>
              </div>
            </div>

          </div>
        </section>

        {/* ============================================================ */}
        {/* 3. LES 4 FORMULES TARIFAIRES (Grille 4 colonnes Responsive)  */}
        {/* ============================================================ */}
        <section className="py-16 sm:py-24 bg-white">
          <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
            
            <div 
              ref={cardsRef}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 items-stretch"
            >
              {PLANS.map((plan) => {
                const isPro = plan.isPopular;

                return (
                  <div
                    key={plan.id}
                    className={`rounded-3xl p-7 sm:p-8 flex flex-col justify-between transition-all duration-150 relative ${
                      isPro
                        ? "bg-[#0D1B3D] text-white shadow-xl shadow-[#0D1B3D]/10 ring-2 ring-emerald-500/80"
                        : "bg-white border border-slate-200/90 text-[#0D1B3D] shadow-xs hover:border-slate-300"
                    }`}
                  >
                    {/* Badge recommandé Pro */}
                    {isPro && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-slate-950 font-bold text-[10px] uppercase tracking-wider px-3 py-1 rounded-full shadow-xs">
                        Recommandé
                      </div>
                    )}

                    <div>
                      {/* Entête Carte */}
                      <div className="pb-5 border-b border-slate-100/10">
                        <span className={`text-xs font-bold uppercase tracking-wider block ${isPro ? "text-emerald-400" : "text-slate-400"}`}>
                          Formule
                        </span>
                        <h2 className={`text-2xl sm:text-3xl font-black uppercase tracking-tight mt-1 ${isPro ? "text-white" : "text-[#0D1B3D]"}`}>
                          {plan.name}
                        </h2>
                        <p className={`mt-2 text-xs leading-relaxed min-h-[38px] ${isPro ? "text-slate-300" : "text-slate-600"}`}>
                          {plan.tagline}
                        </p>
                      </div>

                      {/* Prix */}
                      <div className={`py-6 border-b ${isPro ? "border-slate-800" : "border-slate-100"}`}>
                        <div className="flex items-baseline gap-1.5">
                          <span className={`text-4xl sm:text-5xl font-black font-mono tracking-tight ${isPro ? "text-white" : "text-[#0D1B3D]"}`}>
                            {plan.price}
                          </span>
                          <span className={`font-mono text-xs sm:text-sm font-normal ${isPro ? "text-slate-400" : "text-slate-500"}`}>
                            {plan.periodLabel}
                          </span>
                        </div>
                        <p className={`text-[11px] mt-2 font-normal ${isPro ? "text-slate-400" : "text-slate-500"}`}>
                          {plan.id === "decouverte" ? "Permanente sans condition" : "Mensuel sans engagement"}
                        </p>
                      </div>

                      {/* Liste de caractéristiques */}
                      <div className="pt-6 pb-8">
                        <div className={`text-[11px] font-mono uppercase tracking-wider font-semibold mb-3 ${isPro ? "text-slate-400" : "text-slate-400"}`}>
                          Ce qui est inclus :
                        </div>
                        <ul className="space-y-3 text-xs sm:text-sm">
                          {plan.features.map((feat, fIdx) => (
                            <li key={fIdx} className="flex items-start gap-2.5">
                              <Check className={`w-4 h-4 shrink-0 mt-0.5 ${isPro ? "text-emerald-400" : "text-emerald-600"}`} />
                              <span className={isPro ? "text-slate-200" : "text-slate-700"}>
                                {feat}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Action Commerciale Principale */}
                    <div className="pt-4 border-t border-slate-100/10">
                      <Link 
                        href={plan.href} 
                        className="block w-full"
                        style={{ touchAction: "manipulation" }}
                      >
                        <button
                          type="button"
                          className={`w-full h-12 rounded-xl font-bold text-sm inline-flex items-center justify-center gap-2 transition-all duration-150 active:scale-[0.98] cursor-pointer ${
                            isPro
                              ? "bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-xs"
                              : "border border-slate-300 hover:border-[#0D1B3D] text-[#0D1B3D] hover:bg-slate-50"
                          }`}
                        >
                          <span>{plan.cta}</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </Link>
                      <p className={`text-center text-[10px] mt-2 font-normal ${isPro ? "text-slate-400" : "text-slate-500"}`}>
                        {plan.id === "decouverte" ? "Activation immédiate sans carte" : "Espace activé en Découverte avant paiement"}
                      </p>
                    </div>

                  </div>
                );
              })}
            </div>

          </div>
        </section>

        {/* ============================================================ */}
        {/* 4. COMPARAISON DÉTAILLÉE DES FONCTIONNALITÉS               */}
        {/* Conçue mobile-first : jamais de défilement horizontal forcé  */}
        {/* ============================================================ */}
        <section ref={compRef} className="py-16 sm:py-24 bg-[#FBFBFC] border-t border-slate-200/80">
          <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
            
            <div className="max-w-2xl pb-10">
              <span className="text-[11px] sm:text-xs font-bold uppercase tracking-widest text-emerald-600 block mb-2">
                Comparatif exhaustif
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#0D1B3D] uppercase tracking-tight">
                Comparez les fonctionnalités
              </h2>
              <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">
                Toutes les caractéristiques techniques et opérationnelles détaillées selon vos besoins.
              </p>
            </div>

            {/* Sélecteur de catégorie sur Mobile (Tactile & Ergonomique) */}
            <div className="lg:hidden mb-6 flex overflow-x-auto pb-2 gap-2 scrollbar-none">
              {COMPARISON_CATEGORIES.map((cat, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveMobileCategory(idx)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    activeMobileCategory === idx
                      ? "bg-[#0D1B3D] text-white"
                      : "bg-white border border-slate-200 text-slate-600"
                  }`}
                >
                  {cat.title}
                </button>
              ))}
            </div>

            {/* AFFICHAGE MOBILE : Cartes segmentées par catégorie (Zéro défilement horizontal !) */}
            <div className="lg:hidden space-y-4">
              {COMPARISON_CATEGORIES[activeMobileCategory].items.map((item, iIdx) => (
                <div key={iIdx} className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs space-y-3">
                  <div className="text-sm font-bold text-[#0D1B3D]">
                    {item.label}
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs pt-2 border-t border-slate-100">
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-mono uppercase text-slate-400 block">Découverte (0 F)</span>
                      <span className="font-medium text-slate-700">
                        {typeof item.decouverte === "boolean" ? (item.decouverte ? "Inclus" : "Non inclus") : item.decouverte}
                      </span>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-mono uppercase text-slate-400 block">Starter (10 000 F)</span>
                      <span className="font-medium text-slate-700">
                        {typeof item.starter === "boolean" ? (item.starter ? "Inclus" : "Non inclus") : item.starter}
                      </span>
                    </div>
                    <div className="space-y-0.5 bg-emerald-50/50 p-2 rounded-lg col-span-1">
                      <span className="text-[10px] font-mono uppercase text-emerald-800 font-bold block">Pro (45 000 F)</span>
                      <span className="font-medium text-emerald-900">
                        {typeof item.pro === "boolean" ? (item.pro ? "Inclus" : "Non inclus") : item.pro}
                      </span>
                    </div>
                    <div className="space-y-0.5 p-2 rounded-lg col-span-1">
                      <span className="text-[10px] font-mono uppercase text-slate-400 block">Entreprise (150 000 F)</span>
                      <span className="font-medium text-slate-800">
                        {typeof item.entreprise === "boolean" ? (item.entreprise ? "Inclus" : "Non inclus") : item.entreprise}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* AFFICHAGE DESKTOP : Tableau comparatif éditorial haute précision */}
            <div className="hidden lg:block bg-white border border-slate-200/90 rounded-3xl overflow-hidden shadow-xs">
              <div className="grid grid-cols-5 bg-slate-50/80 border-b border-slate-200 text-xs font-mono uppercase tracking-wider font-bold text-slate-700 p-5 sticky top-20 z-10 backdrop-blur-md">
                <div className="col-span-1">Fonctionnalité</div>
                <div className="text-center">Découverte (0 F)</div>
                <div className="text-center">Starter (10k F)</div>
                <div className="text-center text-emerald-700">Pro (45k F) ★</div>
                <div className="text-center">Entreprise (150k F)</div>
              </div>

              {COMPARISON_CATEGORIES.map((cat, cIdx) => (
                <div key={cIdx} className="border-b border-slate-200/70 last:border-b-0">
                  <div className="bg-slate-100/50 px-6 py-3 font-mono text-[11px] uppercase tracking-wider font-bold text-[#0D1B3D]">
                    {cat.title}
                  </div>
                  {cat.items.map((item, iIdx) => (
                    <div
                      key={iIdx}
                      className="grid grid-cols-5 p-5 border-t border-slate-100 hover:bg-slate-50/50 transition-colors text-xs sm:text-sm items-center"
                    >
                      <div className="font-medium text-slate-800 pr-4">
                        {item.label}
                      </div>

                      <div className="text-center text-slate-600 font-normal">
                        {typeof item.decouverte === "boolean" ? (
                          item.decouverte ? (
                            <Check className="w-4 h-4 text-emerald-600 mx-auto" />
                          ) : (
                            <Minus className="w-4 h-4 text-slate-300 mx-auto" />
                          )
                        ) : (
                          item.decouverte
                        )}
                      </div>

                      <div className="text-center text-slate-600 font-normal">
                        {typeof item.starter === "boolean" ? (
                          item.starter ? (
                            <Check className="w-4 h-4 text-emerald-600 mx-auto" />
                          ) : (
                            <Minus className="w-4 h-4 text-slate-300 mx-auto" />
                          )
                        ) : (
                          item.starter
                        )}
                      </div>

                      <div className="text-center font-semibold text-[#0D1B3D] bg-emerald-50/40 py-2 rounded-lg">
                        {typeof item.pro === "boolean" ? (
                          item.pro ? (
                            <Check className="w-4 h-4 text-emerald-600 mx-auto" />
                          ) : (
                            <Minus className="w-4 h-4 text-slate-300 mx-auto" />
                          )
                        ) : (
                          item.pro
                        )}
                      </div>

                      <div className="text-center text-slate-700 font-normal">
                        {typeof item.entreprise === "boolean" ? (
                          item.entreprise ? (
                            <Check className="w-4 h-4 text-emerald-600 mx-auto" />
                          ) : (
                            <Minus className="w-4 h-4 text-slate-300 mx-auto" />
                          )
                        ) : (
                          item.entreprise
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>

          </div>
        </section>

        {/* ============================================================ */}
        {/* 5. TRANSPARENCE & CONDITIONS DE RÈGLEMENT                    */}
        {/* ============================================================ */}
        <section className="py-16 sm:py-20 bg-white border-t border-slate-200/80">
          <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-[#0D1B3D]">
                  <Smartphone className="w-5 h-5 text-emerald-600" />
                </div>
                <h3 className="text-lg font-bold text-[#0D1B3D]">
                  Paiements Locaux CEMAC
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                  Réglez directement en Francs CFA via Airtel Money, MTN Mobile Money ou carte bancaire. Les flux sont sécurisés par notre passerelle SasPay.
                </p>
              </div>

              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-[#0D1B3D]">
                  <RefreshCcw className="w-5 h-5 text-emerald-600" />
                </div>
                <h3 className="text-lg font-bold text-[#0D1B3D]">
                  Zéro Engagement de Durée
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                  Chaque formule payante est un abonnement mensuel reconductible. Vous pouvez faire évoluer votre formule ou la résilier sans justification.
                </p>
              </div>

              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-[#0D1B3D]">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                </div>
                <h3 className="text-lg font-bold text-[#0D1B3D]">
                  Découverte Active en Permanence
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                  Même si vous choisissez une offre payante, votre espace est d&apos;abord activé en Découverte. Si vous interrompez le paiement, vous ne perdez aucun accès.
                </p>
              </div>

            </div>

          </div>
        </section>

        {/* ============================================================ */}
        {/* 6. FAQ TARIFFAIRE                                            */}
        {/* ============================================================ */}
        <section className="py-16 sm:py-24 bg-[#FBFBFC] border-t border-slate-200/80">
          <div className="max-w-4xl mx-auto px-6 sm:px-10">
            
            <div className="text-center pb-12">
              <span className="text-[11px] sm:text-xs font-bold uppercase tracking-widest text-emerald-600 block mb-2">
                Questions Fréquentes
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-[#0D1B3D] uppercase tracking-tight">
                Tout ce que vous devez savoir
              </h2>
            </div>

            <div className="space-y-4">
              {FAQS.map((faq, idx) => {
                const isOpen = activeFaqIndex === idx;

                return (
                  <div
                    key={idx}
                    className="border border-slate-200/90 rounded-2xl bg-white overflow-hidden transition-all shadow-2xs"
                  >
                    <button
                      type="button"
                      onClick={() => toggleFaq(idx)}
                      className="w-full px-6 py-5 text-left flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-[#0D1B3D] cursor-pointer"
                      style={{ touchAction: "manipulation" }}
                    >
                      <span>{faq.question}</span>
                      <ChevronDown
                        className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                          isOpen ? "rotate-180 text-emerald-600" : ""
                        }`}
                      />
                    </button>

                    {isOpen && (
                      <div className="px-6 pb-6 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed font-normal border-t border-slate-100">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

          </div>
        </section>

        {/* ============================================================ */}
        {/* 7. CTA BANNER COMMERCIAL FINAL                               */}
        {/* ============================================================ */}
        <section className="py-20 sm:py-28 bg-[#0D1B3D] text-white border-t border-slate-800">
          <div className="max-w-5xl mx-auto px-6 sm:px-10 text-center space-y-6">
            <span className="font-mono text-xs uppercase tracking-widest text-emerald-400 font-bold block">
              Prêt à transformer votre SAV ?
            </span>
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white uppercase tracking-tight leading-tight">
              Créez votre espace en 2 minutes.<br />
              <span className="text-slate-400 font-normal">Sans engagement.</span>
            </h2>
            <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto font-normal leading-relaxed">
              Démarrez gratuitement avec la formule Découverte ou choisissez directement votre formule Starter ou Pro.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link 
                href="/register"
                style={{ touchAction: "manipulation" }}
                className="w-full sm:w-auto h-12 px-8 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm inline-flex items-center justify-center gap-2 active:scale-[0.98] transition-all cursor-pointer shadow-xs"
              >
                <span>Créer mon espace</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/entreprises"
                style={{ touchAction: "manipulation" }}
                className="w-full sm:w-auto h-12 px-6 rounded-xl border border-slate-700 hover:border-slate-500 text-slate-200 hover:text-white font-semibold text-sm inline-flex items-center justify-center gap-2 active:scale-[0.98] transition-all cursor-pointer"
              >
                <span>Explorer les entreprises</span>
              </Link>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}

