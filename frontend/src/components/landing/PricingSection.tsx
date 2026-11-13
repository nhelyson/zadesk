"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export const PricingSection: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const commitmentsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    gsap.registerPlugin(ScrollTrigger);

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      if (headlineRef.current) {
        gsap.fromTo(
          headlineRef.current,
          { y: 30, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: {
              trigger: headlineRef.current,
              start: "top 85%",
              toggleActions: "play none none reverse",
            },
          }
        );
      }

      if (gridRef.current) {
        gsap.fromTo(
          gridRef.current,
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.9,
            ease: "power3.out",
            scrollTrigger: {
              trigger: gridRef.current,
              start: "top 80%",
              toggleActions: "play none none reverse",
            },
          }
        );
      }

      if (commitmentsRef.current) {
        gsap.fromTo(
          commitmentsRef.current,
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            ease: "power2.out",
            scrollTrigger: {
              trigger: commitmentsRef.current,
              start: "top 90%",
              toggleActions: "play none none reverse",
            },
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const plans = [
    {
      id: "decouverte",
      index: "01",
      name: "Découverte",
      audience: "Pour tester et lancer la relation client de son entreprise sans engagement financier.",
      agents: "1 agent",
      price: "0",
      periodLabel: "FCFA permanent",
      billingNote: "Offre gratuite permanente sans carte requise",
      cta: "Commencer gratuitement",
      href: "/register?plan=decouverte",
      features: [
        { label: "Équipe", value: "1 agent connecté (propriétaire)" },
        { label: "Points SAV", value: "1 établissement principal" },
        { label: "Canal", value: "Espace public & messagerie web directe Zadesk" },
        { label: "Accès client", value: "Chat instantané sans compte ni application requise" },
        { label: "Inbox", value: "Boîte partagée & historique des échanges" },
        { label: "Attribution", value: "Attribution manuelle des conversations" },
        { label: "Support", value: "Assistance standard par e-mail" },
      ],
      isHighlighted: false,
      footerNote: "Sans carte bancaire requise",
    },
    {
      id: "starter",
      index: "02",
      name: "Starter",
      audience: "Pour structurer la relation client en ligne d'une PME ou boutique active.",
      agents: "1 à 2 agents",
      price: "10 000",
      periodLabel: "FCFA / mois",
      billingNote: "Facturation mensuelle sans engagement",
      cta: "Choisir Starter",
      href: "/register?plan=starter",
      features: [
        { label: "Équipe", value: "1 à 2 agents connectés" },
        { label: "Points SAV", value: "1 établissement principal" },
        { label: "Canal", value: "Espace public & messagerie web directe Zadesk" },
        { label: "Accès client", value: "Chat instantané sans compte ni application requise" },
        { label: "Inbox", value: "Boîte partagée & historique des échanges unifié" },
        { label: "Routage", value: "Routage intelligent des demandes par compétences" },
        { label: "Attribution", value: "Attribution manuelle & organisation d'équipe" },
        { label: "IA", value: "100 résolutions automatiques / mois (En préparation)" },
        { label: "Support", value: "Assistance standard par e-mail" },
      ],
      isHighlighted: true,
      footerNote: "Abonnement mensuel sans engagement",
    },
    {
      id: "pro",
      index: "03",
      name: "Pro",
      audience: "Pour les entreprises avec une équipe relation client active et points de vente.",
      agents: "Jusqu'à 5 agents",
      price: "45 000",
      periodLabel: "FCFA / mois",
      billingNote: "Facturation mensuelle sans engagement",
      cta: "Choisir Pro",
      href: "/register?plan=pro",
      features: [
        { label: "Équipe", value: "Jusqu'à 5 agents avec rôles spécialisés" },
        { label: "Points SAV", value: "Gestion multi-établissements (jusqu'à 3 agences)" },
        { label: "Canal", value: "Messagerie Zadesk haute disponibilité" },
        { label: "Routage", value: "Routage intelligent et prioritaire par compétences" },
        { label: "Pilotage", value: "Mesure d'activité et charge des agents en temps réel" },
        { label: "IA Métier", value: "IA connectée aux documents & catalogue (En préparation)" },
        { label: "Comptoirs", value: "Génération de QR codes pour points de vente (En préparation)" },
        { label: "Support", value: "Assistance prioritaire dédiée" },
      ],
      isHighlighted: false,
      footerNote: "Abonnement mensuel sans engagement",
    },
  ];

  return (
    <section
      ref={sectionRef}
      id="tarifs"
      data-nav-theme="light"
      aria-label="Tarifs Zadesk"
      className="scroll-mt-16 relative w-full bg-[#FBFBFC] text-[#0D1B3D] py-24 sm:py-32 lg:py-36 border-t border-slate-200/70"
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
        
        {/* ============================================================ */}
        {/* 1. EN-TÊTE ÉDITORIAL & LIEN VERS LA GRILLE COMPLÈTE           */}
        {/* ============================================================ */}
        <div ref={headlineRef} className="pb-14 sm:pb-18 lg:pb-20">
          
          {/* Label discret épuré */}
          <div className="mb-4">
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-widest text-emerald-600 block">
              Tarifs &amp; Abonnements
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-end">
            
            {/* Monumental Title */}
            <div className="lg:col-span-8">
              <h2 className="text-4xl sm:text-6xl lg:text-7xl font-black text-[#0D1B3D] tracking-[-0.04em] leading-[0.98] uppercase">
                Des forfaits clairs.<br />
                <span className="text-slate-400 font-normal">Sans coût caché.</span>
              </h2>
              <p className="mt-5 text-base sm:text-lg text-slate-600 font-normal max-w-2xl leading-relaxed">
                Des abonnements mensuels sans engagement. Démarrez immédiatement avec l&apos;offre Découverte, sans carte bancaire requise.
              </p>
            </div>

            {/* Lien direct d'orientation vers la page complète /tarifs */}
            <div className="lg:col-span-4 lg:flex lg:justify-end">
              <Link
                href="/tarifs"
                style={{ touchAction: "manipulation" }}
                className="inline-flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-[#0D1B3D] text-[#0D1B3D] text-xs sm:text-sm font-semibold tracking-wide transition-all duration-150 active:scale-[0.98] cursor-pointer group"
              >
                <span>Voir les tarifs &amp; comparer</span>
                <ArrowRight className="w-4 h-4 text-emerald-600 group-hover:translate-x-0.5 transition-transform duration-150" />
              </Link>
            </div>

          </div>

        </div>

        {/* ============================================================ */}
        {/* 2. GRILLE MONOLITHIQUE ARCHITECTURALE (3 PLANS)             */}
        {/* ============================================================ */}
        <div
          ref={gridRef}
          className="border border-slate-200/90 rounded-3xl overflow-hidden bg-white shadow-[0_4px_24px_-8px_rgba(13,27,61,0.06)]"
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-slate-200/80 items-stretch">
            
            {plans.map((plan) => {
              if (plan.isHighlighted) {
                // ======================================================
                // PLAN STARTER : CENTRE DE GRAVITÉ (CONTRASTE NAVY ÉDITORIAL)
                // ======================================================
                return (
                  <div
                    key={plan.id}
                    className="bg-[#0D1B3D] text-white p-8 sm:p-10 flex flex-col justify-between relative"
                  >
                    <div>
                      {/* Top Meta */}
                      <div className="flex items-center justify-between pb-6 border-b border-slate-800">
                        <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                          Forfait Recommandé
                        </span>
                        <span className="font-mono text-xs font-semibold text-emerald-300 bg-emerald-950/70 border border-emerald-500/30 px-2.5 py-1 rounded-lg">
                          {plan.agents}
                        </span>
                      </div>

                      {/* Header & Description */}
                      <div className="pt-6 pb-8">
                        <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-white uppercase">
                          {plan.name}
                        </h3>
                        <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed font-normal min-h-[40px]">
                          {plan.audience}
                        </p>
                      </div>

                      {/* Price Section */}
                      <div className="py-6 border-y border-slate-800/90">
                        <div className="flex items-baseline gap-2">
                          <span className="text-4xl sm:text-5xl lg:text-6xl font-black font-mono tracking-tight text-white">
                            {plan.price}
                          </span>
                          <span className="font-mono text-xs sm:text-sm text-slate-400 font-normal">
                            {plan.periodLabel}
                          </span>
                        </div>

                        <div className="mt-2 min-h-[20px]">
                          <p className="text-xs text-slate-400 font-normal">
                            {plan.billingNote}
                          </p>
                        </div>
                      </div>

                      {/* Specifications List */}
                      <div className="pt-8 pb-10">
                        <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold mb-4">
                          Inclus dans l&apos;offre Starter :
                        </div>
                        <ul className="space-y-3.5 text-xs sm:text-sm">
                          {plan.features.map((feat, fIdx) => (
                            <li key={fIdx} className="flex items-start gap-3">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 mt-2" />
                              <div>
                                <span className="text-slate-400 font-medium font-mono text-xs mr-2">
                                  {feat.label} :
                                </span>
                                <span className="text-slate-100 font-normal">
                                  {feat.value}
                                </span>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* CTA Button */}
                    <div className="pt-6 border-t border-slate-800">
                      <Link 
                        href={plan.href} 
                        className="block w-full"
                        style={{ touchAction: "manipulation" }}
                      >
                        <button
                          type="button"
                          className="w-full h-12 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm inline-flex items-center justify-center gap-2 transition-colors duration-150 active:scale-[0.98] cursor-pointer"
                        >
                          <span>{plan.cta}</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </Link>
                      <p className="text-center text-[11px] text-slate-400 mt-2.5 font-normal">
                        {plan.footerNote}
                      </p>
                    </div>

                  </div>
                );
              }

              // ========================================================
              // PLANS STANDARDS : DÉCOUVERTE & PRO
              // ========================================================
              return (
                <div
                  key={plan.id}
                  className="bg-white p-8 sm:p-10 flex flex-col justify-between"
                >
                  <div>
                    {/* Top Meta */}
                    <div className="flex items-center justify-between pb-6 border-b border-slate-100">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Forfait {plan.name}
                      </span>
                      <span className="font-mono text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
                        {plan.agents}
                      </span>
                    </div>

                    {/* Header & Description */}
                    <div className="pt-6 pb-8">
                      <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-[#0D1B3D] uppercase">
                        {plan.name}
                      </h3>
                      <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed font-normal min-h-[40px]">
                        {plan.audience}
                      </p>
                    </div>

                    {/* Price Section */}
                    <div className="py-6 border-y border-slate-100">
                      <div className="flex items-baseline gap-2">
                        <span className="text-4xl sm:text-5xl font-black font-mono tracking-tight text-[#0D1B3D]">
                          {plan.price}
                        </span>
                        <span className="font-mono text-xs sm:text-sm text-slate-500 font-normal">
                          {plan.periodLabel}
                        </span>
                      </div>

                      <div className="mt-2 min-h-[20px]">
                        <p className="text-xs text-slate-500 font-normal">
                          {plan.billingNote}
                        </p>
                      </div>
                    </div>

                    {/* Specifications List */}
                    <div className="pt-8 pb-10">
                      <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold mb-4">
                        Inclus dans l&apos;offre :
                      </div>
                      <ul className="space-y-3.5 text-xs sm:text-sm">
                        {plan.features.map((feat, fIdx) => (
                          <li key={fIdx} className="flex items-start gap-3">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0 mt-2" />
                            <div>
                              <span className="text-slate-500 font-medium font-mono text-xs mr-2">
                                {feat.label} :
                              </span>
                              <span className="text-slate-700 font-normal">
                                {feat.value}
                              </span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <div className="pt-6 border-t border-slate-100">
                    <Link 
                      href={plan.href} 
                      className="block w-full"
                      style={{ touchAction: "manipulation" }}
                    >
                      <button
                        type="button"
                        className="w-full h-12 rounded-xl border border-slate-300 hover:border-[#0D1B3D] text-[#0D1B3D] hover:bg-slate-50 font-bold text-sm inline-flex items-center justify-center gap-2 transition-all duration-150 active:scale-[0.98] cursor-pointer"
                      >
                        <span>{plan.cta}</span>
                        <ArrowRight className="w-4 h-4 opacity-70" />
                      </button>
                    </Link>
                    <p className="text-center text-[11px] text-slate-500 mt-2.5 font-normal">
                      {plan.footerNote}
                    </p>
                  </div>

                </div>
              );
            })}

          </div>
        </div>

        {/* ============================================================ */}
        {/* 3. BANDEAU DE GARANTIES & TRANSPARENCE COMMERCIALE           */}
        {/* ============================================================ */}
        <div
          ref={commitmentsRef}
          className="mt-12 lg:mt-16 pt-8 border-t border-slate-200/80 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-xs text-slate-600 font-normal"
        >
          <div className="space-y-1">
            <span className="font-mono font-bold text-[#0D1B3D] text-[11px] block uppercase tracking-wider">
              Découverte 100% gratuit
            </span>
            <p className="text-slate-500 leading-relaxed">
              Démarrez immédiatement sans aucun frais et sans carte bancaire requise pour tester votre espace client.
            </p>
          </div>

          <div className="space-y-1">
            <span className="font-mono font-bold text-[#0D1B3D] text-[11px] block uppercase tracking-wider">
              Zéro application pour vos clients
            </span>
            <p className="text-slate-500 leading-relaxed">
              Vos clients vous écrivent directement depuis leur navigateur web, sans créer de compte ni télécharger d&apos;application.
            </p>
          </div>

          <div className="space-y-1">
            <span className="font-mono font-bold text-[#0D1B3D] text-[11px] block uppercase tracking-wider">
              Transparence totale
            </span>
            <p className="text-slate-500 leading-relaxed">
              Aucun coût caché d&apos;installation, aucune taxe additionnelle ni de frais de mise en service initial.
            </p>
          </div>

          <div className="space-y-1">
            <span className="font-mono font-bold text-[#0D1B3D] text-[11px] block uppercase tracking-wider">
              Liberté de résiliation
            </span>
            <p className="text-slate-500 leading-relaxed">
              Abonnements mensuels ajustables ou résiliables à tout moment depuis vos paramètres d&apos;espace.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
};
