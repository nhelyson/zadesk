"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export const HumanConnectionSection: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const img1Ref = useRef<HTMLImageElement>(null);
  const img2Ref = useRef<HTMLImageElement>(null);
  const img3Ref = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    gsap.registerPlugin(ScrollTrigger);

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      // ==============================================================
      // DESKTOP: CINEMATIC ASYMMETRICAL HORIZONTAL TRAVELLING (>= 1024px)
      // ==============================================================
      mm.add("(min-width: 1024px)", () => {
        if (!triggerRef.current || !trackRef.current) return;

        const track = trackRef.current;
        const getScrollDistance = () => track.scrollWidth - window.innerWidth + 140;

        // 1. Horizontal camera travelling driven by vertical scroll
        gsap.to(track, {
          x: () => -getScrollDistance(),
          ease: "none",
          scrollTrigger: {
            trigger: triggerRef.current,
            start: "top top",
            end: () => `+=${getScrollDistance()}`,
            pin: true,
            pinSpacing: true,
            scrub: 1.1,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });

        // 2. Parallax internal window motion for each varied frame
        [img1Ref.current, img2Ref.current, img3Ref.current].forEach((img) => {
          if (!img) return;
          gsap.fromTo(
            img,
            { xPercent: -12, scale: 1.16 },
            {
              xPercent: 12,
              scale: 1.05,
              ease: "none",
              scrollTrigger: {
                trigger: triggerRef.current,
                start: "top top",
                end: () => `+=${getScrollDistance()}`,
                scrub: 1.1,
              },
            }
          );
        });
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="human-connection"
      data-nav-theme="light"
      aria-label="La relation humaine au cœur de Zadesk"
      className="relative w-full bg-[#FAFAF8] text-[#0D1B3D] overflow-hidden"
    >
      {/* ============================================================== */}
      {/* DESKTOP EXPERIENCE (>= 1024px)                                 */}
      {/* ============================================================== */}
      <div className="hidden lg:block w-full">
        <div
          ref={triggerRef}
          className="relative w-full h-screen overflow-hidden flex items-center bg-[#FAFAF8]"
        >
          {/* The Kinetic Parallax Track with Varied Photographic Proportions */}
          <div
            ref={trackRef}
            className="flex items-center gap-12 xl:gap-16 will-change-transform pl-12 xl:pl-20 pr-24"
          >
            {/* 0. INTRODUCTORY EDITORIAL STATEMENT (Integrated into the flow) */}
            <div className="flex-shrink-0 w-[420px] xl:w-[480px] pr-4 flex flex-col justify-center">
              <span className="text-xs font-mono font-bold tracking-[0.25em] text-emerald-600 uppercase mb-3 block">
                La Relation Humaine
              </span>
              <h2 className="text-4xl xl:text-5xl font-extrabold text-[#0D1B3D] tracking-[-0.04em] leading-[1.1]">
                Derrière chaque écran, il y a un visage.
              </h2>
              <p className="mt-5 text-base xl:text-lg text-slate-500 font-normal leading-relaxed">
                L&apos;expérience au-delà des tickets. Retrouvez l&apos;authenticité de la rencontre dans chacun de vos canaux numériques.
              </p>
              <div className="mt-8 flex items-center gap-2 text-xs font-mono text-slate-400">
                <span>Faites défiler</span>
                <span className="text-emerald-500 font-sans text-sm">→</span>
              </div>
            </div>

            {/* 1. SCENE 1: CINEMATIC BROAD PANORAMA (Warm Local Store Owners) */}
            <article className="relative flex-shrink-0 w-[840px] xl:w-[920px] h-[480px] xl:h-[500px] rounded-[36px] overflow-hidden bg-stone-900 shadow-[0_36px_80px_-20px_rgba(13,27,61,0.22)]">
              <div className="absolute inset-0 overflow-hidden">
                <img
                  ref={img1Ref}
                  src="/images/pexels-8475204.jpg"
                  alt="Commerçants chaleureux et souriants accueillant les clients dans leur épicerie de quartier"
                  className="w-[125%] h-full max-w-none object-cover object-center will-change-transform filter brightness-[0.86] contrast-[1.04]"
                  loading="eager"
                />
              </div>

              {/* Natural light gradient absorption */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/92 via-slate-950/35 to-transparent pointer-events-none" />

              {/* Text placed in natural breathing room without any badges */}
              <div className="absolute inset-x-0 bottom-0 p-8 xl:p-12 pointer-events-none text-white max-w-2xl">
                <h3 className="text-2xl xl:text-3xl font-extrabold tracking-[-0.03em] leading-snug drop-shadow-sm">
                  « Chaque client a un nom, une voix et des habitudes. »
                </h3>
                <p className="mt-3 text-sm xl:text-base text-slate-200/90 font-normal leading-relaxed">
                  Retrouvez la chaleur et l&apos;attention du commerce de quartier dans chacun de vos canaux numériques.
                </p>
              </div>
            </article>

            {/* 2. SCENE 2: TALL EDITORIAL PORTRAIT FORMAT (Barber & Laughing Customer) */}
            <article className="relative flex-shrink-0 w-[480px] xl:w-[520px] h-[560px] xl:h-[600px] rounded-[40px] overflow-hidden bg-stone-900 shadow-[0_40px_90px_-20px_rgba(13,27,61,0.25)] -my-6">
              <div className="absolute inset-0 overflow-hidden">
                <img
                  ref={img2Ref}
                  src="/images/wla-barbershop-customer.jpg"
                  alt="Artisan barbier et client échangeant un rire complice et sincère"
                  className="w-[130%] h-full max-w-none object-cover object-center will-change-transform filter brightness-[0.88] contrast-[1.03]"
                  loading="lazy"
                />
              </div>

              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/40 to-transparent pointer-events-none" />

              <div className="absolute inset-x-0 bottom-0 p-8 xl:p-10 pointer-events-none text-white">
                <h3 className="text-2xl xl:text-[1.75rem] font-extrabold tracking-[-0.03em] leading-snug drop-shadow-sm">
                  « Répondre vite est bien. Répondre juste fidélise. »
                </h3>
                <p className="mt-3 text-sm text-slate-200/90 font-normal leading-relaxed">
                  Prendre le temps d&apos;écouter et de comprendre chaque situation avant d&apos;exécuter, pour une fidélité qui dure.
                </p>
              </div>
            </article>

            {/* 3. SCENE 3: ARCHITECTURAL BALANCED CANVAS (Thoughtful Host by Window) */}
            <article className="relative flex-shrink-0 w-[660px] xl:w-[720px] h-[490px] xl:h-[510px] rounded-[36px] overflow-hidden bg-stone-900 shadow-[0_36px_80px_-20px_rgba(13,27,61,0.22)]">
              <div className="absolute inset-0 overflow-hidden">
                <img
                  ref={img3Ref}
                  src="/images/pexels-3873735.jpg"
                  alt="Entrepreneur contemporain attentif et serein dans la lumière naturelle"
                  className="w-[125%] h-full max-w-none object-cover object-center will-change-transform filter brightness-[0.85] contrast-[1.04]"
                  loading="lazy"
                />
              </div>

              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/92 via-slate-950/35 to-transparent pointer-events-none" />

              <div className="absolute inset-x-0 bottom-0 p-8 xl:p-12 pointer-events-none text-white max-w-xl">
                <h3 className="text-2xl xl:text-3xl font-extrabold tracking-[-0.03em] leading-snug drop-shadow-sm">
                  « La technologie s&apos;efface. La rencontre reste. »
                </h3>
                <p className="mt-3 text-sm xl:text-base text-slate-200/90 font-normal leading-relaxed">
                  Des collaborateurs synchronisés et sereins pour ne plus jamais laisser une promesse client sans suite.
                </p>
              </div>
            </article>

            {/* 4. FINAL MANIFESTO TRANSITION CARD (Seamless bridge to Section 3) */}
            <div className="flex-shrink-0 w-[420px] xl:w-[460px] h-[480px] xl:h-[500px] rounded-[36px] bg-white p-10 xl:p-12 flex flex-col justify-between shadow-[0_30px_70px_-15px_rgba(13,27,61,0.1)]">
              <div className="space-y-5">
                <span className="text-xs font-mono font-bold uppercase tracking-widest text-emerald-600 block">
                  Manifeste Zadesk
                </span>
                <h3 className="text-2xl xl:text-3xl font-extrabold text-[#0D1B3D] tracking-[-0.03em] leading-snug">
                  Un service client qui redonne la priorité à l&apos;humain.
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed font-normal">
                  WhatsApp, e-mails, messages : toutes vos conversations réunies au même endroit, pour que votre équipe consacre son énergie à ce qui compte vraiment.
                </p>
              </div>

              <div className="pt-6 border-t border-stone-100 flex items-center gap-3 text-xs font-medium text-slate-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Découvrez la suite ci-dessous ↓
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* MOBILE NATIVE EXPERIENCE (< 1024px)                           */}
      {/* ============================================================== */}
      <div className="lg:hidden px-5 sm:px-8 py-16 sm:py-20 space-y-10 max-w-2xl mx-auto">
        <div className="space-y-3">
          <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-emerald-700 font-mono block">
            La Relation Humaine
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0D1B3D] tracking-[-0.03em] leading-tight">
            Derrière chaque écran, il y a un visage.
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Une rencontre authentique qui mérite attention et considération, bien au-delà des tickets anonymes.
          </p>
        </div>

        {/* Varied Mobile Cards: Zero borders, pure photography */}
        <div className="space-y-8">
          {/* Card 1: Panorama */}
          <div className="relative rounded-3xl overflow-hidden bg-stone-900 shadow-xl aspect-[16/11] w-full">
            <img
              src="/images/pexels-8475204.jpg"
              alt="Commerçants chaleureux accueillant les clients dans leur boutique"
              className="w-full h-full object-cover object-center filter brightness-[0.86]"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/92 via-slate-950/35 to-transparent pointer-events-none" />
            <div className="absolute inset-x-0 bottom-0 p-5 text-white">
              <h3 className="text-lg font-bold tracking-tight leading-snug">
                « Chaque client a un nom, une voix et des habitudes. »
              </h3>
              <p className="mt-1 text-xs text-slate-200/90 leading-relaxed font-normal">
                Retrouvez l&apos;authenticité du contact humain sans noyer vos clients sous la bureaucratie.
              </p>
            </div>
          </div>

          {/* Card 2: Vertical Portrait */}
          <div className="relative rounded-3xl overflow-hidden bg-stone-900 shadow-xl aspect-[4/5] w-full">
            <img
              src="/images/wla-barbershop-customer.jpg"
              alt="Artisan barbier et client complices"
              className="w-full h-full object-cover object-center filter brightness-[0.88]"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/40 to-transparent pointer-events-none" />
            <div className="absolute inset-x-0 bottom-0 p-6 text-white">
              <h3 className="text-xl font-bold tracking-tight leading-snug">
                « Répondre vite est bien. Répondre juste fidélise. »
              </h3>
              <p className="mt-1.5 text-xs text-slate-200/90 leading-relaxed font-normal">
                Prendre le temps de comprendre la demande avant d&apos;agir, pour une satisfaction réelle.
              </p>
            </div>
          </div>

          {/* Card 3: Balanced Architectural */}
          <div className="relative rounded-3xl overflow-hidden bg-stone-900 shadow-xl aspect-[16/11] w-full">
            <img
              src="/images/pexels-3873735.jpg"
              alt="Entrepreneur attentif dans la lumière naturelle"
              className="w-full h-full object-cover object-center filter brightness-[0.85]"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/92 via-slate-950/35 to-transparent pointer-events-none" />
            <div className="absolute inset-x-0 bottom-0 p-5 text-white">
              <h3 className="text-lg font-bold tracking-tight leading-snug">
                « La technologie s&apos;efface. La rencontre reste. »
              </h3>
              <p className="mt-1 text-xs text-slate-200/90 leading-relaxed font-normal">
                Des collaborateurs synchronisés pour que chaque engagement pris envers un client soit honoré.
              </p>
            </div>
          </div>

          {/* Manifest Card */}
          <div className="rounded-3xl bg-white p-6 shadow-lg space-y-3">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-emerald-600 block">
              Manifeste Zadesk
            </span>
            <h3 className="text-lg font-bold text-[#0D1B3D] leading-snug">
              Un service client qui redonne la priorité à l&apos;humain.
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              WhatsApp, e-mails et messages réunis dans un espace clair, sans transformer vos clients en numéros.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
