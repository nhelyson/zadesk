"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export const ConversationNotTicketSection: React.FC = () => {
  const containerRef = useRef<HTMLElement>(null);
  const headlineLine1Ref = useRef<HTMLSpanElement>(null);
  const headlineLine2Ref = useRef<HTMLSpanElement>(null);
  const headlineLine3Ref = useRef<HTMLSpanElement>(null);
  const introTextRef = useRef<HTMLParagraphElement>(null);
  const strikeLineRef = useRef<HTMLDivElement>(null);
  
  // Principles lines and numbers
  const divider1Ref = useRef<HTMLDivElement>(null);
  const divider2Ref = useRef<HTMLDivElement>(null);
  const divider3Ref = useRef<HTMLDivElement>(null);
  const principleRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Metaphor SVG path and nodes
  const threadPathRef = useRef<SVGPathElement>(null);
  const node1Ref = useRef<SVGCircleElement>(null);
  const node2Ref = useRef<SVGCircleElement>(null);
  const node3Ref = useRef<SVGCircleElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    gsap.registerPlugin(ScrollTrigger);

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      // ==============================================================
      // 1. ZONE A : MONUMENTAL HEADLINE REVEAL
      // ==============================================================
      const headlineTl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 75%",
          toggleActions: "play none none reverse",
        },
      });

      headlineTl
        .fromTo(
          [headlineLine1Ref.current, headlineLine2Ref.current, headlineLine3Ref.current],
          { y: 50, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.9,
            stagger: 0.14,
            ease: "power3.out",
          }
        )
        .fromTo(
          strikeLineRef.current,
          { scaleX: 0 },
          { scaleX: 1, duration: 0.65, ease: "power2.inOut" },
          "-=0.35"
        )
        .fromTo(
          introTextRef.current,
          { y: 25, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8, ease: "power2.out" },
          "-=0.4"
        );

      // ==============================================================
      // 2. ZONE B : THE THREE PRINCIPLES HAIRLINE DRAWING
      // ==============================================================
      const dividers = [divider1Ref.current, divider2Ref.current, divider3Ref.current].filter(Boolean);
      dividers.forEach((divider) => {
        gsap.fromTo(
          divider,
          { scaleX: 0 },
          {
            scaleX: 1,
            transformOrigin: "left center",
            duration: 0.85,
            ease: "power2.inOut",
            scrollTrigger: {
              trigger: divider,
              start: "top 85%",
              toggleActions: "play none none reverse",
            },
          }
        );
      });

      principleRefs.current.forEach((el) => {
        if (!el) return;
        gsap.fromTo(
          el,
          { y: 30, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.75,
            ease: "power2.out",
            scrollTrigger: {
              trigger: el,
              start: "top 85%",
              toggleActions: "play none none reverse",
            },
          }
        );
      });

      // ==============================================================
      // 3. ZONE C : GRAPHIC METAPHOR CONTINUOUS LIVING THREAD
      // ==============================================================
      if (threadPathRef.current) {
        const pathLength = threadPathRef.current.getTotalLength();
        gsap.set(threadPathRef.current, {
          strokeDasharray: pathLength,
          strokeDashoffset: pathLength,
        });

        gsap.to(threadPathRef.current, {
          strokeDashoffset: 0,
          ease: "none",
          scrollTrigger: {
            trigger: threadPathRef.current,
            start: "top 80%",
            end: "bottom 55%",
            scrub: 1.2,
          },
        });

        // Illuminate nodes sequentially
        const nodes = [node1Ref.current, node2Ref.current, node3Ref.current].filter(Boolean);
        nodes.forEach((node, i) => {
          gsap.fromTo(
            node,
            { scale: 0.6, opacity: 0.3 },
            {
              scale: 1,
              opacity: 1,
              duration: 0.5,
              ease: "back.out(2)",
              scrollTrigger: {
                trigger: node,
                start: `top ${80 - i * 8}%`,
                toggleActions: "play none none reverse",
              },
            }
          );
        });
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      id="conversation-not-ticket"
      data-nav-theme="light"
      aria-label="Philosophie : Une conversation n'est pas un ticket"
      className="scroll-mt-16 relative w-full bg-white text-[#0D1B3D] py-28 sm:py-36 lg:py-44 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
        
        {/* ============================================================== */}
        {/* ZONE A : LA GRANDE DÉCLARATION TYPOGRAPHIQUE                   */}
        {/* ============================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-end pb-20 sm:pb-28 lg:pb-36">
          
          {/* Monumental Swiss-inspired typography (8 cols) */}
          <div className="lg:col-span-8 space-y-1 sm:space-y-2">
            <span
              ref={headlineLine1Ref}
              className="block text-5xl sm:text-7xl lg:text-8xl xl:text-[7.25rem] font-black text-[#0D1B3D] tracking-[-0.045em] leading-[0.96] uppercase"
            >
              Une conversation
            </span>

            <span
              ref={headlineLine2Ref}
              className="block text-5xl sm:text-7xl lg:text-8xl xl:text-[7.25rem] font-black text-[#0D1B3D] tracking-[-0.045em] leading-[0.96] uppercase"
            >
              n&apos;est pas un
            </span>

            {/* Word "ticket" with refined architectural accent */}
            <div className="relative inline-block mt-2">
              <span
                ref={headlineLine3Ref}
                className="block text-5xl sm:text-7xl lg:text-8xl xl:text-[7.25rem] font-black tracking-[-0.045em] leading-[0.96] uppercase text-emerald-600"
              >
                ticket.
              </span>
              
              {/* Fine editorial line striking through with surgical elegance */}
              <div
                ref={strikeLineRef}
                aria-hidden="true"
                className="absolute top-1/2 left-0 right-0 h-[3px] sm:h-[4px] lg:h-[5px] bg-[#0D1B3D] origin-left pointer-events-none"
              />
            </div>
          </div>

          {/* Integrated Editorial Introduction (4 cols) */}
          <div className="lg:col-span-4 lg:pl-6 pb-2">
            <div className="w-10 h-[1.5px] bg-emerald-600 mb-6 hidden lg:block" />
            <p
              ref={introTextRef}
              className="text-base sm:text-lg lg:text-xl text-slate-600 font-normal leading-[1.65]"
            >
              Une demande client ne devrait pas se perdre dans des formulaires, des numéros de dossier ou des échanges impersonnels. Chez Zadesk, nous plaçons la conversation au centre de la relation entre votre entreprise et ses clients.
            </p>
          </div>

        </div>

        {/* ============================================================== */}
        {/* ZONE B : LES TROIS PRINCIPES FONDAMENTAUX (Swiss Grid)        */}
        {/* ============================================================== */}
        <div className="pt-12 sm:pt-16 pb-24 sm:pb-32">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16">
            
            {/* Principe 01 */}
            <div
              ref={(el) => {
                principleRefs.current[0] = el;
              }}
              className="space-y-6"
            >
              <div ref={divider1Ref} className="w-full h-[1px] bg-stone-200" />
              <div className="flex items-baseline justify-between pt-2">
                <span className="text-3xl sm:text-4xl font-light text-slate-300 font-mono tracking-tight">
                  01
                </span>
                <span className="text-[11px] font-mono tracking-widest uppercase text-emerald-700">
                  Accès Direct
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-[#0D1B3D] tracking-[-0.03em] leading-snug">
                Simple dès le premier contact
              </h3>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
                Vos clients peuvent contacter votre entreprise directement depuis leur navigateur ou messagerie préférée, sans aucune obligation de créer un compte préalable.
              </p>
            </div>

            {/* Principe 02 */}
            <div
              ref={(el) => {
                principleRefs.current[1] = el;
              }}
              className="space-y-6"
            >
              <div ref={divider2Ref} className="w-full h-[1px] bg-stone-200" />
              <div className="flex items-baseline justify-between pt-2">
                <span className="text-3xl sm:text-4xl font-light text-slate-300 font-mono tracking-tight">
                  02
                </span>
                <span className="text-[11px] font-mono tracking-widest uppercase text-emerald-700">
                  Dialogue
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-[#0D1B3D] tracking-[-0.03em] leading-snug">
                Un échange, pas une succession de formalités
              </h3>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
                Votre équipe reçoit les demandes dans son espace de travail unifié et échange avec les clients de façon fluide, naturelle et instantanée.
              </p>
            </div>

            {/* Principe 03 */}
            <div
              ref={(el) => {
                principleRefs.current[2] = el;
              }}
              className="space-y-6"
            >
              <div ref={divider3Ref} className="w-full h-[1px] bg-stone-200" />
              <div className="flex items-baseline justify-between pt-2">
                <span className="text-3xl sm:text-4xl font-light text-slate-300 font-mono tracking-tight">
                  03
                </span>
                <span className="text-[11px] font-mono tracking-widest uppercase text-emerald-700">
                  Continuité
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-[#0D1B3D] tracking-[-0.03em] leading-snug">
                Une relation qui mérite un suivi
              </h3>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
                Les échanges permettent à l&apos;équipe de retrouver tout le contexte historique et de poursuivre le traitement sans jamais faire recommencer le client à zéro.
              </p>
            </div>

          </div>
        </div>

        {/* ============================================================== */}
        {/* ZONE C : MÉTAPHORE GRAPHIQUE ORIGINALE (Rupture vs Continuité)*/}
        {/* ============================================================== */}
        <div className="pt-16 sm:pt-20 border-t border-stone-200/80">
          
          <div className="max-w-2xl mb-12">
            <span className="text-[11px] font-mono font-bold tracking-[0.22em] text-emerald-600 uppercase block mb-2">
              Modèle Conceptuel
            </span>
            <h4 className="text-2xl sm:text-3xl font-extrabold text-[#0D1B3D] tracking-[-0.03em]">
              De la rupture administrative au fil continu
            </h4>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            {/* Visual Vector Architecture (8 cols) */}
            <div className="lg:col-span-8 bg-stone-50 rounded-[32px] p-8 sm:p-12 relative overflow-hidden">
              
              {/* Paradigm 1: Le Ticket Fragmenté (Disjointed, broken) */}
              <div className="space-y-4 mb-12">
                <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                  <span className="uppercase tracking-widest">Le système traditionnel (Tickets)</span>
                  <span className="text-red-500/80 font-medium">Contexte perdu</span>
                </div>

                <div className="grid grid-cols-3 gap-4 items-center">
                  <div className="p-4 rounded-xl bg-white border border-stone-200/80 text-center">
                    <span className="text-xs font-mono text-slate-400 block mb-1">#4091</span>
                    <span className="text-xs font-semibold text-slate-700 block">Formulaire initial</span>
                  </div>
                  
                  <div className="flex items-center justify-center">
                    <span className="w-8 h-[1px] border-b-2 border-dashed border-red-300" />
                    <span className="mx-2 text-xs text-red-500 font-mono">✕</span>
                    <span className="w-8 h-[1px] border-b-2 border-dashed border-red-300" />
                  </div>

                  <div className="p-4 rounded-xl bg-white border border-stone-200/80 text-center">
                    <span className="text-xs font-mono text-slate-400 block mb-1">#4092</span>
                    <span className="text-xs font-semibold text-slate-700 block">Dossier clôturé</span>
                  </div>
                </div>
              </div>

              {/* Paradigm 2: Le Fil Vivant Zadesk (Continuous Flowing Ribbon) */}
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                  <span className="uppercase tracking-widest">L&apos;Approche Zadesk (Conversation)</span>
                  <span className="text-emerald-600 font-medium">Fil continu préservé</span>
                </div>

                <div className="relative pt-6 pb-2">
                  <svg
                    viewBox="0 0 600 80"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-full h-auto overflow-visible"
                  >
                    {/* Background guide rail */}
                    <path
                      d="M 20 40 Q 150 10, 300 40 T 580 40"
                      stroke="#E2E8F0"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />

                    {/* Animated living emerald thread */}
                    <path
                      ref={threadPathRef}
                      d="M 20 40 Q 150 10, 300 40 T 580 40"
                      stroke="#16A34A"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                    />

                    {/* Node 1: Premier contact */}
                    <circle
                      ref={node1Ref}
                      cx="60"
                      cy="33"
                      r="7"
                      fill="#16A34A"
                      stroke="#FFFFFF"
                      strokeWidth="3"
                    />

                    {/* Node 2: Dialogue en cours */}
                    <circle
                      ref={node2Ref}
                      cx="300"
                      cy="40"
                      r="7"
                      fill="#16A34A"
                      stroke="#FFFFFF"
                      strokeWidth="3"
                    />

                    {/* Node 3: Fidélité durable */}
                    <circle
                      ref={node3Ref}
                      cx="540"
                      cy="47"
                      r="7"
                      fill="#16A34A"
                      stroke="#FFFFFF"
                      strokeWidth="3"
                    />
                  </svg>

                  {/* Node Labels */}
                  <div className="grid grid-cols-3 gap-4 text-center mt-3 text-xs">
                    <div>
                      <span className="font-bold text-[#0D1B3D] block">Premier contact</span>
                      <span className="text-[11px] text-slate-500">Sans friction</span>
                    </div>
                    <div>
                      <span className="font-bold text-[#0D1B3D] block">Échange fluide</span>
                      <span className="text-[11px] text-slate-500">Contexte actif</span>
                    </div>
                    <div>
                      <span className="font-bold text-[#0D1B3D] block">Suivi naturel</span>
                      <span className="text-[11px] text-slate-500">Mémoire préservée</span>
                    </div>
                  </div>
                </div>

              </div>

            </div>

            {/* Editorial Synthesis Column (4 cols) */}
            <div className="lg:col-span-4 space-y-5">
              <h5 className="text-xl font-extrabold text-[#0D1B3D] tracking-tight leading-snug">
                La mémoire de l&apos;échange ne s&apos;efface jamais.
              </h5>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
                Quand un client revient vers vous trois jours ou six mois plus tard, la conversation reprend là où elle s&apos;était arrêtée. Plus d&apos;identifiant de ticket à chercher, plus de répétition pénible.
              </p>
              <div className="pt-2 text-xs font-mono text-emerald-700 tracking-wider uppercase font-semibold">
                ✓ Continuité totale • WhatsApp, Web &amp; E-mail
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
