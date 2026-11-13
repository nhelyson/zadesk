"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import gsap from "gsap";

export const Hero = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const paragraphRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const visualContainerRef = useRef<HTMLDivElement>(null);
  const emblemRef = useRef<HTMLDivElement>(null);
  const subjectBottomRef = useRef<HTMLDivElement>(null);
  const subjectTopRef = useRef<HTMLDivElement>(null);
  const ribbonRef = useRef<HTMLDivElement>(null);
  const dotsRightRef = useRef<HTMLDivElement>(null);
  const dotsLeftRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Standard des grands SaaS : respect strict de prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      // ==============================================================
      // 1. TIMELINE D'ENTRÉE ORCHESTRÉE (Style Apple / Stripe)
      // ==============================================================
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      // Séquence typographique à gauche
      if (titleRef.current) {
        tl.fromTo(
          titleRef.current,
          { opacity: 0, y: 28 },
          { opacity: 1, y: 0, duration: 0.85 }
        );
      }
      if (paragraphRef.current) {
        tl.fromTo(
          paragraphRef.current,
          { opacity: 0, y: 18 },
          { opacity: 1, y: 0, duration: 0.75 },
          "-=0.6"
        );
      }
      if (ctaRef.current) {
        tl.fromTo(
          ctaRef.current,
          { opacity: 0, y: 16, scale: 0.96 },
          { opacity: 1, y: 0, scale: 1, duration: 0.65, ease: "back.out(1.5)" },
          "-=0.5"
        );
      }

      // Éléments de profondeur d'arrière-plan
      if (ribbonRef.current) {
        tl.fromTo(
          ribbonRef.current,
          { opacity: 0, scale: 0.94, transformOrigin: "right center" },
          { opacity: 1, scale: 1, duration: 1.1, ease: "power2.out" },
          "-=0.75"
        );
      }
      if (dotsRightRef.current) {
        tl.fromTo(
          dotsRightRef.current,
          { opacity: 0, x: 20 },
          { opacity: 0.55, x: 0, duration: 0.9 },
          "-=0.85"
        );
      }
      if (dotsLeftRef.current) {
        tl.fromTo(
          dotsLeftRef.current,
          { opacity: 0, x: -16 },
          { opacity: 0.35, x: 0, duration: 0.9 },
          "-=0.85"
        );
      }

      // Séquence visuelle droite (Emblème découpé)
      if (emblemRef.current) {
        tl.fromTo(
          emblemRef.current,
          { opacity: 0, scale: 0.88, y: 32 },
          { opacity: 1, scale: 1, y: 0, duration: 1.1, ease: "elastic.out(1, 0.88)" },
          "-=0.8"
        );
      }

      // Émergence du sujet (Breakout pop-out synchronisé)
      const subjects = [subjectBottomRef.current, subjectTopRef.current].filter(Boolean);
      if (subjects.length > 0) {
        tl.fromTo(
          subjects,
          { opacity: 0, y: 44, scale: 0.96 },
          { opacity: 1, y: 0, scale: 1, duration: 0.95, ease: "power3.out" },
          "-=0.7"
        );
      }

      // ==============================================================
      // 2. RESPIRATION EN APESANTEUR (Idle Floating Motion)
      // ==============================================================
      if (visualContainerRef.current) {
        gsap.to(visualContainerRef.current, {
          y: -7,
          duration: 3.6,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          delay: 1.2,
        });
      }
    }, sectionRef);

    // ==============================================================
    // 3. PARALLAXE FLUIDE AU CURSEUR SUR DESKTOP (Depth of Field)
    // ==============================================================
    const handleMouseMove = (e: MouseEvent) => {
      if (window.innerWidth < 1024 || !sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const mouseX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      const mouseY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;

      // Sujet (premier plan : réaction vive)
      const subjects = [subjectBottomRef.current, subjectTopRef.current].filter(Boolean);
      if (subjects.length > 0) {
        gsap.to(subjects, {
          x: mouseX * 12,
          y: mouseY * 8,
          duration: 0.65,
          ease: "power2.out",
          overwrite: "auto",
        });
      }

      // Emblème sculpté (plan intermédiaire : mouvement amorti)
      if (emblemRef.current) {
        gsap.to(emblemRef.current, {
          x: mouseX * 6,
          y: mouseY * 4,
          duration: 0.8,
          ease: "power2.out",
          overwrite: "auto",
        });
      }

      // Ruban et trame (arrière-plan : dérive subtile inverse)
      if (ribbonRef.current) {
        gsap.to(ribbonRef.current, {
          x: -mouseX * 10,
          y: -mouseY * 6,
          duration: 1.0,
          ease: "power2.out",
          overwrite: "auto",
        });
      }
    };

    const sectionEl = sectionRef.current;
    if (sectionEl) {
      sectionEl.addEventListener("mousemove", handleMouseMove);
    }

    return () => {
      ctx.revert();
      if (sectionEl) {
        sectionEl.removeEventListener("mousemove", handleMouseMove);
      }
    };
  }, []);

  return (
    <section 
      ref={sectionRef}
      data-nav-theme="light" 
      className="relative w-full overflow-hidden bg-[#FAFAF8] text-slate-900 selection:bg-emerald-600 selection:text-white pt-20 pb-14 sm:pt-24 sm:pb-18 lg:pt-28 lg:pb-20 min-h-[calc(100svh-4rem)] flex items-center"
      style={{
        WebkitTapHighlightColor: "transparent",
      }}
    >
      {/* ============================================================== */}
      {/* 1. ENRICHISSEMENT DU BACKGROUND (Discret & Haute Finition)    */}
      {/* ============================================================== */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Lueur studio chaude & menthe douce */}
        <div 
          aria-hidden="true" 
          className="absolute top-1/4 right-[12%] w-[460px] h-[460px] rounded-full bg-emerald-500/[0.06] blur-3xl" 
        />
        <div 
          aria-hidden="true" 
          className="absolute bottom-8 right-[20%] w-[340px] h-[340px] rounded-full bg-[#0D1B3D]/[0.04] blur-3xl" 
        />

        {/* Trame de points réguliers (Dot Matrix Wecare) - Flanc Droit */}
        <div 
          ref={dotsRightRef}
          aria-hidden="true"
          className="absolute top-20 right-4 sm:right-10 lg:right-16 hidden sm:block opacity-55"
        >
          <svg width="120" height="200" viewBox="0 0 120 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="wecare-dots" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
                <circle cx="5" cy="5" r="3.5" fill="#CBD5E1" />
              </pattern>
            </defs>
            <rect width="120" height="200" fill="url(#wecare-dots)" />
          </svg>
        </div>

        {/* Trame de points réguliers discrète - Flanc Gauche */}
        <div 
          ref={dotsLeftRef}
          aria-hidden="true"
          className="absolute bottom-12 left-6 sm:left-12 w-24 h-28 hidden lg:block opacity-35"
        >
          <svg width="100%" height="100%" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="hero-dots-left" x="0" y="0" width="18" height="18" patternUnits="userSpaceOnUse">
                <circle cx="3" cy="3" r="2" fill="#CBD5E1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#hero-dots-left)" />
          </svg>
        </div>

        {/* Disques décoratifs flottants doux */}
        <div 
          aria-hidden="true" 
          className="absolute top-20 left-[14%] w-8 h-8 rounded-full bg-slate-200/50 hidden lg:block" 
        />
        <div 
          aria-hidden="true" 
          className="absolute bottom-20 left-[44%] w-5 h-5 rounded-full bg-emerald-500/15 hidden sm:block" 
        />

        {/* Ruban dynamique de connexion fluide */}
        <div 
          ref={ribbonRef}
          aria-hidden="true"
          className="absolute top-1/4 right-0 w-[580px] h-[340px] hidden sm:block"
        >
          <svg viewBox="0 0 580 340" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <path 
              d="M -20 240 C 120 310, 240 90, 460 70 C 510 65, 550 85, 580 110" 
              stroke="#22C55E" 
              strokeWidth="3.5" 
              strokeLinecap="round" 
              className="opacity-70"
            />
            <path 
              d="M 10 265 C 140 335, 270 115, 480 95" 
              stroke="#10B981" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeDasharray="4 7"
              className="opacity-40"
            />
          </svg>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full relative z-10">
        
        {/* Grille Asymétrique : Contenu Éditorial (7 cols) / Mise en scène Visuelle (5 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 sm:gap-12 lg:gap-14 items-center">
          
          {/* ============================================================ */}
          {/* COLONNE GAUCHE (7 cols) : Typographie Apple Aérée & Déployée */}
          {/* ============================================================ */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-7 text-left relative">
            
            {/* Grand Titre Éditorial — Sans ponctuation & Font-size Décompressé */}
            <h1 
              ref={titleRef}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.35rem] xl:text-[3.65rem] font-extrabold text-slate-950 tracking-[-0.03em] leading-[1.12]"
            >
              Le service client de votre entreprise
              <span className="block text-emerald-800 font-extrabold mt-1 sm:mt-1.5">
                réuni au même endroit
              </span>
            </h1>

            {/* Proposition de Valeur Validée */}
            <p 
              ref={paragraphRef}
              className="text-base sm:text-lg text-slate-600 font-normal leading-[1.65] max-w-[530px]"
            >
              Vos clients vous contactent directement depuis leur navigateur, sans inscription ni mot de passe. Votre équipe reçoit leurs demandes, échange avec eux et assure leur suivi depuis un espace de travail commun.
            </p>

            {/* Bouton Primaire Tactile — Ergonomie & Finition Apple */}
            <div 
              ref={ctaRef}
              className="pt-2"
            >
              <Link 
                href="/register" 
                className="inline-block w-full sm:w-auto"
                style={{
                  touchAction: "manipulation",
                  userSelect: "none",
                  WebkitUserSelect: "none",
                  WebkitTouchCallout: "none"
                }}
              >
                <div
                  role="button"
                  tabIndex={0}
                  className="group relative w-full sm:w-auto h-[48px] px-7 rounded-xl bg-slate-950 hover:bg-slate-900 active:scale-[0.98] transition-all duration-150 ease-out shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_4px_14px_rgba(15,23,42,0.12)] inline-flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer touch-manipulation"
                >
                  <span className="text-[14px] sm:text-[15px] font-semibold text-white tracking-[-0.01em]">
                    Créer mon espace
                  </span>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-white group-hover:translate-x-0.5 transition-all duration-150 shrink-0" />
                </div>
              </Link>
            </div>

          </div>

          {/* ============================================================ */}
          {/* COLONNE DROITE (5 cols) : Rééquilibrée & Animée GSAP       */}
          {/* Calage harmonieux avec la colonne gauche                    */}
          {/* ============================================================ */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            
            {/* Conteneur global de la composition visuelle avec animation de respiration */}
            <div 
              ref={visualContainerRef}
              className="relative w-full max-w-[340px] sm:max-w-[380px] lg:max-w-[400px] h-[410px] sm:h-[440px] lg:h-[465px]"
            >
              
              {/* -------------------------------------------------------- */}
              {/* 1. EMBLÈME GÉOMÉTRIQUE DÉCOUPÉ (Option A - Hitz360 / 4)   */}
              {/* Diamètre réajusté (~350px) pour un équilibre parfait      */}
              {/* -------------------------------------------------------- */}
              <div 
                ref={emblemRef}
                aria-hidden="true"
                className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[300px] h-[300px] sm:w-[330px] sm:h-[330px] lg:w-[350px] lg:h-[350px] pointer-events-none -z-10"
              >
                {/* Plaque d'ancrage Midnight Navy asymétrique en arrière-plan */}
                <div 
                  className="absolute -bottom-2 -right-3 w-[56%] h-[56%] rounded-br-[64px] rounded-tl-[44px] rounded-tr-[32px] rounded-bl-[24px] bg-[#0D1B3D] shadow-[0_22px_45px_-10px_rgba(13,27,61,0.48)]"
                />

                {/* SVG de l'emblème circulaire découpé à bandes rythmées */}
                <svg 
                  viewBox="0 0 350 350" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="w-full h-full drop-shadow-[0_22px_40px_rgba(22,163,74,0.34)]"
                >
                  <defs>
                    <linearGradient id="optA-grad-top" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#22C55E" />
                      <stop offset="100%" stopColor="#16A34A" />
                    </linearGradient>
                    <linearGradient id="optA-grad-mid" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#16A34A" />
                      <stop offset="100%" stopColor="#15803D" />
                    </linearGradient>
                    <linearGradient id="optA-grad-bot" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#15803D" />
                      <stop offset="100%" stopColor="#0F766E" />
                    </linearGradient>
                    {/* Masque circulaire pour garantir un contour extérieur parfait */}
                    <clipPath id="optA-circle-clip">
                      <circle cx="175" cy="175" r="172" />
                    </clipPath>
                  </defs>

                  {/* Groupe masqué sur le disque */}
                  <g clipPath="url(#optA-circle-clip)">
                    {/* Fond d'accent émeraude */}
                    <rect width="350" height="350" fill="#15803D" />

                    {/* Segment 1 : Calotte supérieure gauche */}
                    <path 
                      d="M -40 -40 L 390 -40 L 10 350 L -40 350 Z" 
                      fill="url(#optA-grad-top)" 
                    />

                    {/* Fente diagonale 1 (découpe nette négative de la couleur de fond #FAFAF8) */}
                    <line 
                      x1="350" y1="-30" x2="-40" y2="360" 
                      stroke="#FAFAF8" 
                      strokeWidth="17" 
                      strokeLinecap="round" 
                    />

                    {/* Segment 2 : Bande diagonale centrale rythmée */}
                    <rect 
                      x="-30" y="153" width="410" height="46" rx="23" 
                      transform="rotate(-40 175 175)" 
                      fill="url(#optA-grad-mid)" 
                    />

                    {/* Fente diagonale 2 (seconde découpe négative #FAFAF8) */}
                    <line 
                      x1="390" y1="20" x2="0" y2="410" 
                      stroke="#FAFAF8" 
                      strokeWidth="15" 
                      strokeLinecap="round" 
                    />

                    {/* Segment 3 : Base inférieure droite */}
                    <path 
                      d="M 130 390 L 390 130 L 390 390 Z" 
                      fill="url(#optA-grad-bot)" 
                    />
                  </g>
                </svg>
              </div>

              {/* -------------------------------------------------------- */}
              {/* 2. SUJET EN BAS : CLIPPÉ PAR LE DISQUE (Socle Naturel)   */}
              {/* Plus aucun effet "posé maladroitement" ou tronc flottant */}
              {/* -------------------------------------------------------- */}
              <div 
                ref={subjectBottomRef}
                className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[300px] h-[300px] sm:w-[330px] sm:h-[330px] lg:w-[350px] lg:h-[350px] overflow-hidden rounded-full pointer-events-none z-10"
              >
                <img
                  src="/images/hero-african-contemporary-cutout.png"
                  alt="Entrepreneure africaine contemporaine souriante utilisant son smartphone"
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[300px] sm:w-[330px] lg:w-[350px] max-w-none h-auto object-contain select-none drop-shadow-[0_18px_30px_rgba(13,27,61,0.22)]"
                  loading="eager"
                  decoding="async"
                />
              </div>

              {/* -------------------------------------------------------- */}
              {/* 3. SUJET EN HAUT : BREAKOUT LIBRE (Tête, Afro, Épaules)   */}
              {/* Émerge hors du disque au sommet sans aucune rupture      */}
              {/* -------------------------------------------------------- */}
              <div 
                ref={subjectTopRef}
                className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[300px] h-[410px] sm:w-[330px] h-[440px] lg:w-[350px] lg:h-[465px] pointer-events-none z-20"
                style={{
                  clipPath: "inset(0 0 37% 0)",
                }}
              >
                <img
                  src="/images/hero-african-contemporary-cutout.png"
                  alt=""
                  aria-hidden="true"
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[300px] sm:w-[330px] lg:w-[350px] max-w-none h-auto object-contain select-none drop-shadow-[0_18px_30px_rgba(13,27,61,0.22)]"
                  loading="eager"
                  decoding="async"
                />
              </div>

              {/* Anneau graphique épuré d'accentuation en haut à droite */}
              <div 
                aria-hidden="true"
                className="absolute top-10 -right-2 w-14 h-14 rounded-full border-2 border-emerald-500/25 pointer-events-none -z-10 hidden sm:block"
              />

            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
