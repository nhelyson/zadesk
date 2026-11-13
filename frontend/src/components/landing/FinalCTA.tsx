"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export const FinalCTA: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);
  const principlesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    gsap.registerPlugin(ScrollTrigger);

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      if (headlineRef.current) {
        gsap.fromTo(
          headlineRef.current,
          { opacity: 0, y: 35 },
          {
            opacity: 1,
            y: 0,
            duration: 0.9,
            ease: "power3.out",
            scrollTrigger: {
              trigger: headlineRef.current,
              start: "top 85%",
              toggleActions: "play none none reverse",
            },
          }
        );
      }

      if (actionsRef.current) {
        gsap.fromTo(
          actionsRef.current,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 0.9,
            ease: "power3.out",
            scrollTrigger: {
              trigger: actionsRef.current,
              start: "top 80%",
              toggleActions: "play none none reverse",
            },
          }
        );
      }

      if (principlesRef.current) {
        gsap.fromTo(
          principlesRef.current,
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            ease: "power2.out",
            scrollTrigger: {
              trigger: principlesRef.current,
              start: "top 90%",
              toggleActions: "play none none reverse",
            },
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="conclusion"
      data-nav-theme="navy"
      aria-label="Conclusion éditoriale Zadesk"
      className="relative w-full bg-[#0D1B3D] text-white py-24 sm:py-32 lg:py-40 border-t border-slate-800/80 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 relative z-10">
        
        {/* ============================================================ */}
        {/* 1. GRILLE ASYMÉTRIQUE PRINCIPALE                             */}
        {/* ============================================================ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-end">
          
          {/* Bloc éditorial monumental (7 colonnes) */}
          <div ref={headlineRef} className="lg:col-span-7 space-y-6">

            {/* Titre monumental en 3 plans */}
            <h2 className="text-4xl sm:text-6xl lg:text-7xl xl:text-8xl font-black text-white tracking-[-0.045em] leading-[0.96] uppercase">
              Chaque relation<br />
              <span className="text-slate-400 font-normal">commence par</span><br />
              <span className="text-emerald-400">un échange.</span>
            </h2>

            {/* Paragraphe manifeste sobre */}
            <p className="pt-2 text-base sm:text-lg lg:text-xl text-slate-300 font-normal max-w-2xl leading-relaxed">
              Vos clients méritent une réponse attentive et rapide. Votre équipe mérite un espace partagé pour l&apos;apporter avec calme, clarté et continuité.
            </p>

          </div>

          {/* Bloc d'actions à deux entrées (5 colonnes) */}
          <div ref={actionsRef} className="lg:col-span-5">
            <div className="bg-[#12234D]/80 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
              
              {/* Entrée 1 : Entreprises & Équipes (Action Principale) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] uppercase tracking-wider text-emerald-400 font-semibold block">
                    Pour les entreprises
                  </span>
                  <span className="font-mono text-[11px] text-slate-400">
                    B2B &amp; SAV
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 font-normal leading-relaxed">
                  Créez l&apos;espace de votre entreprise, invitez vos agents et organisez vos conversations client sur une plateforme unifiée.
                </p>
                <Link href="/register" className="block pt-1">
                  <button
                    type="button"
                    className="w-full h-12 sm:h-13 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm sm:text-base inline-flex items-center justify-center gap-2.5 transition-all duration-150 active:scale-[0.99] cursor-pointer shadow-xs"
                  >
                    <span>Créer mon espace</span>
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </Link>
              </div>

              {/* Filet séparateur discret */}
              <div className="relative py-1">
                <div className="h-px bg-slate-800 w-full" />
                <span className="absolute left-1/2 -translate-x-1/2 -top-2 bg-[#12234D] px-3 font-mono text-[10px] text-slate-500 uppercase tracking-widest">
                  ou
                </span>
              </div>

              {/* Entrée 2 : Particuliers & Grand Public (Action Secondaire) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] uppercase tracking-wider text-slate-400 font-semibold block">
                    Pour les particuliers
                  </span>
                  <span className="font-mono text-[11px] text-slate-400">
                    Grand Public
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-400 font-normal leading-relaxed">
                  Recherchez un établissement vérifié et échangez directement avec son équipe en ligne, sans créer de compte.
                </p>
                <Link href="/entreprises" className="block pt-1">
                  <button
                    type="button"
                    className="w-full h-11 rounded-xl border border-slate-700/90 hover:border-slate-500 text-slate-200 hover:text-white hover:bg-slate-800/50 font-semibold text-xs sm:text-sm inline-flex items-center justify-center gap-2 transition-all duration-150 active:scale-[0.99] cursor-pointer"
                  >
                    <span>Contacter une entreprise</span>
                    <ArrowRight className="w-4 h-4 opacity-70" />
                  </button>
                </Link>
              </div>

            </div>
          </div>

        </div>

        {/* ============================================================ */}
        {/* 2. BANDEAU DE POSTURE ÉDITORIALE BASSE                      */}
        {/* ============================================================ */}
        <div
          ref={principlesRef}
          className="mt-16 sm:mt-24 pt-8 border-t border-slate-800/90 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-xs text-slate-400 font-normal"
        >
          <div className="space-y-1">
            <span className="font-mono font-bold text-white text-[11px] block uppercase tracking-wider">
              Simplicité d&apos;accès
            </span>
            <p className="text-slate-400 leading-relaxed">
              Zéro application ni compte obligatoire pour vos clients : ils vous contactent directement depuis le web.
            </p>
          </div>

          <div className="space-y-1">
            <span className="font-mono font-bold text-white text-[11px] block uppercase tracking-wider">
              Dignité d&apos;équipe
            </span>
            <p className="text-slate-400 leading-relaxed">
              Vos agents travaillent depuis un espace centralisé sans jamais dévoiler leurs numéros personnels.
            </p>
          </div>

          <div className="space-y-1">
            <span className="font-mono font-bold text-white text-[11px] block uppercase tracking-wider">
              Continuité physique
            </span>
            <p className="text-slate-400 leading-relaxed">
              Du premier message en ligne jusqu&apos;à la prise en charge au guichet, aucun contexte n&apos;est perdu.
            </p>
          </div>

          <div className="space-y-1">
            <span className="font-mono font-bold text-white text-[11px] block uppercase tracking-wider">
              Ancrage local
            </span>
            <p className="text-slate-400 leading-relaxed">
              Pensé pour les spécificités des commerces, agences et réseaux d&apos;Afrique centrale et de l&apos;Ouest.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
};
