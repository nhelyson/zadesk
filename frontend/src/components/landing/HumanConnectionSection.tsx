"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

interface HumanStory {
  id: string;
  title: string;
  subtitle: string;
  imageSrc: string;
  imageAlt: string;
}

const STORIES: HumanStory[] = [
  {
    id: "proximite",
    title: "Chaque client a un nom, une voix et des habitudes.",
    subtitle: "Retrouvez la chaleur et l'attention du commerce de quartier dans chacun de vos canaux numériques.",
    imageSrc: "/images/pexels-8475204.jpg",
    imageAlt: "Commerçants chaleureux et souriants accueillant les clients dans leur épicerie de quartier",
  },
  {
    id: "ecoute",
    title: "Répondre vite est bien. Répondre juste fidélise.",
    subtitle: "Prendre le temps d'écouter et de comprendre chaque besoin avant d'agir, pour une satisfaction réelle.",
    imageSrc: "/images/wla-barbershop-customer.jpg",
    imageAlt: "Artisan barbier et client complices échangeant un rire sincère",
  },
  {
    id: "confiance",
    title: "La technologie s'efface. La rencontre reste.",
    subtitle: "Des collaborateurs synchronisés et sereins pour ne plus jamais laisser une promesse sans suite.",
    imageSrc: "/images/pexels-3873735.jpg",
    imageAlt: "Entrepreneur contemporain attentif et serein dans la lumière naturelle",
  },
];

export const HumanConnectionSection: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const ghostTextRef = useRef<HTMLDivElement>(null);
  const card2Ref = useRef<HTMLDivElement>(null);
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
      // DESKTOP: CINEMATIC MULTI-LAYER TRAVELLING (>= 1024px)
      // ==============================================================
      mm.add("(min-width: 1024px)", () => {
        if (!triggerRef.current || !trackRef.current) return;

        const track = trackRef.current;
        const getScrollDistance = () => track.scrollWidth - window.innerWidth + 140;

        // 1. Horizontal Camera Travelling
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

        // 2. Background Ghost Typography Parallax (Conserved as requested)
        if (ghostTextRef.current) {
          gsap.to(ghostTextRef.current, {
            x: () => -getScrollDistance() * 0.45,
            ease: "none",
            scrollTrigger: {
              trigger: triggerRef.current,
              start: "top top",
              end: () => `+=${getScrollDistance()}`,
              scrub: 1.1,
            },
          });
        }

        // 3. Card 2 Dynamic Tilt Straightening
        if (card2Ref.current) {
          gsap.fromTo(
            card2Ref.current,
            { rotate: -3.5, y: -10 },
            {
              rotate: 0,
              y: 0,
              ease: "power1.out",
              scrollTrigger: {
                trigger: triggerRef.current,
                start: "top top+=100",
                end: () => `+=${getScrollDistance() * 0.6}`,
                scrub: 1,
              },
            }
          );
        }

        // 4. Parallax Inner Images (Living Window Effect)
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
      {/* DESKTOP CINEMATIC STAGE (>= 1024px)                            */}
      {/* ============================================================== */}
      <div className="hidden lg:block w-full">
        <div
          ref={triggerRef}
          className="relative w-full h-screen overflow-hidden flex items-center bg-[#FAFAF8]"
        >
          {/* ============================================================ */}
          {/* GHOST BACKGROUND TYPOGRAPHY (Conserved as requested)        */}
          {/* ============================================================ */}
          <div
            ref={ghostTextRef}
            aria-hidden="true"
            className="absolute top-1/2 -translate-y-1/2 left-8 pointer-events-none select-none z-0 whitespace-nowrap opacity-[0.06] font-black tracking-tight text-[18vw] leading-none text-[#0D1B3D]"
          >
            RELATION • PROXIMITÉ • CONFIANCE • HUMAIN
          </div>

          {/* ============================================================ */}
          {/* KINETIC TRACK: ZERO BORDERS, ASYMMETRICAL SILHOUETTES       */}
          {/* ============================================================ */}
          <div className="relative w-full flex items-center overflow-visible pl-12 xl:pl-20 z-10">
            <div
              ref={trackRef}
              className="flex items-center gap-12 xl:gap-16 will-change-transform pr-24"
            >
              {/* SCENE 1: BROAD PANORAMA (Local Store Owners) */}
              <article className="relative flex-shrink-0 w-[840px] xl:w-[920px] h-[500px] xl:h-[540px] rounded-[40px] overflow-hidden bg-stone-900 shadow-[0_36px_80px_-20px_rgba(13,27,61,0.22)]">
                <div className="absolute inset-0 overflow-hidden">
                  <img
                    ref={img1Ref}
                    src="/images/pexels-8475204.jpg"
                    alt="Commerçants chaleureux et souriants accueillant les clients dans leur épicerie de quartier"
                    className="w-[125%] h-full max-w-none object-cover object-center will-change-transform filter brightness-[0.86] contrast-[1.04]"
                    loading="eager"
                  />
                </div>

                {/* Natural Light Gradient Scrim */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/92 via-slate-950/30 to-transparent pointer-events-none" />

                {/* Pure Typography in Breathing Room (No Badges, No Borders) */}
                <div className="absolute inset-x-0 bottom-0 p-10 xl:p-14 pointer-events-none text-white max-w-2xl">
                  <h3 className="text-2xl xl:text-3xl font-extrabold tracking-[-0.03em] leading-snug drop-shadow-sm">
                    « {STORIES[0].title} »
                  </h3>
                  <p className="mt-3 text-sm xl:text-base text-slate-200/90 font-normal leading-relaxed">
                    {STORIES[0].subtitle}
                  </p>
                </div>
              </article>

              {/* SCENE 2: TILTED TALL PORTRAIT (Barber & Laughing Customer) */}
              <div ref={card2Ref} className="will-change-transform -my-4">
                <article className="relative flex-shrink-0 w-[480px] xl:w-[520px] h-[580px] xl:h-[620px] rounded-[44px] overflow-hidden bg-stone-900 shadow-[0_42px_90px_-20px_rgba(13,27,61,0.28)]">
                  <div className="absolute inset-0 overflow-hidden">
                    <img
                      ref={img2Ref}
                      src="/images/wla-barbershop-customer.jpg"
                      alt="Artisan barbier et client complices échangeant un rire sincère"
                      className="w-[130%] h-full max-w-none object-cover object-center will-change-transform filter brightness-[0.88] contrast-[1.03]"
                      loading="lazy"
                    />
                  </div>

                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/35 to-transparent pointer-events-none" />

                  {/* Pure Typography */}
                  <div className="absolute inset-x-0 bottom-0 p-8 xl:p-10 pointer-events-none text-white">
                    <h3 className="text-2xl xl:text-[1.75rem] font-extrabold tracking-[-0.03em] leading-snug drop-shadow-sm">
                      « {STORIES[1].title} »
                    </h3>
                    <p className="mt-3 text-sm text-slate-200/90 font-normal leading-relaxed">
                      {STORIES[1].subtitle}
                    </p>
                  </div>
                </article>
              </div>

              {/* SCENE 3: ARCHITECTURAL FRAME (Thoughtful Host by Window) */}
              <article className="relative flex-shrink-0 w-[680px] xl:w-[740px] h-[500px] xl:h-[540px] rounded-[40px] overflow-hidden bg-stone-900 shadow-[0_36px_80px_-20px_rgba(13,27,61,0.22)]">
                <div className="absolute inset-0 overflow-hidden">
                  <img
                    ref={img3Ref}
                    src="/images/pexels-3873735.jpg"
                    alt="Entrepreneur contemporain attentif et serein dans la lumière naturelle"
                    className="w-[125%] h-full max-w-none object-cover object-center will-change-transform filter brightness-[0.85] contrast-[1.04]"
                    loading="lazy"
                  />
                </div>

                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/92 via-slate-950/30 to-transparent pointer-events-none" />

                {/* Pure Typography */}
                <div className="absolute inset-x-0 bottom-0 p-10 xl:p-14 pointer-events-none text-white max-w-xl">
                  <h3 className="text-2xl xl:text-3xl font-extrabold tracking-[-0.03em] leading-snug drop-shadow-sm">
                    « {STORIES[2].title} »
                  </h3>
                  <p className="mt-3 text-sm xl:text-base text-slate-200/90 font-normal leading-relaxed">
                    {STORIES[2].subtitle}
                  </p>
                </div>
              </article>

              {/* FINAL MANIFESTO CARD (Transition without Borders) */}
              <div className="flex-shrink-0 w-[440px] xl:w-[480px] h-[500px] xl:h-[540px] rounded-[40px] bg-white p-10 xl:p-14 flex flex-col justify-center shadow-[0_30px_70px_-15px_rgba(13,27,61,0.1)]">
                <div className="space-y-6">
                  <span className="text-xs font-mono font-bold uppercase tracking-widest text-emerald-600 block">
                    Manifeste Zadesk
                  </span>
                  <h3 className="text-2xl xl:text-3xl font-extrabold text-[#0D1B3D] tracking-[-0.03em] leading-snug">
                    Un service client qui redonne la priorité à l&apos;humain.
                  </h3>
                  <p className="text-sm xl:text-base text-slate-600 leading-relaxed font-normal">
                    Demandes d&apos;assistance, questions et messages directs : toutes vos conversations réunies au même endroit, pour que votre équipe consacre son énergie à ce qui compte vraiment.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* MOBILE NATIVE EXPERIENCE (< 1024px)                           */}
      {/* ============================================================== */}
      <div className="lg:hidden px-5 sm:px-8 py-16 sm:py-20 space-y-8 max-w-2xl mx-auto">
        {/* Pure Mobile Story Cards: Zero borders, zero badges */}
        <div className="space-y-6">
          {STORIES.map((story) => (
            <div
              key={story.id}
              className="relative rounded-3xl overflow-hidden bg-stone-900 shadow-xl"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden">
                <img
                  src={story.imageSrc}
                  alt={story.imageAlt}
                  className="w-full h-full object-cover object-center filter brightness-[0.86]"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/92 via-slate-950/30 to-transparent pointer-events-none" />

                <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                  <h3 className="text-lg font-bold tracking-tight leading-snug">
                    « {story.title} »
                  </h3>
                  <p className="mt-1 text-xs text-slate-200/90 leading-relaxed font-normal">
                    {story.subtitle}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {/* Mobile Manifest Card */}
          <div className="rounded-3xl bg-white p-6 shadow-md space-y-3">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-emerald-600 block">
              Manifeste Zadesk
            </span>
            <h3 className="text-lg font-bold text-[#0D1B3D] leading-snug">
              Un service client qui redonne la priorité à l&apos;humain.
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Toutes vos conversations clients réunies dans un espace clair, sans transformer vos échanges en numéros de ticket.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
