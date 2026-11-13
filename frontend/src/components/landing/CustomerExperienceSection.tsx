"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowRight, Search, MessageSquare, Compass } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export const CustomerExperienceSection: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);
  const stepsContainerRef = useRef<HTMLDivElement>(null);
  const photoContainerRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    gsap.registerPlugin(ScrollTrigger);

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion || !sectionRef.current) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 75%",
          toggleActions: "play none none reverse",
        },
        defaults: { ease: "power3.out" },
      });

      if (headlineRef.current) {
        tl.fromTo(
          headlineRef.current,
          { opacity: 0, y: 24 },
          { opacity: 1, y: 0, duration: 0.6 }
        );
      }

      if (photoContainerRef.current) {
        tl.fromTo(
          photoContainerRef.current,
          { opacity: 0, y: 28, scale: 0.98 },
          { opacity: 1, y: 0, scale: 1, duration: 0.7 },
          "-=0.4"
        );
      }

      if (stepsContainerRef.current) {
        const stepItems = stepsContainerRef.current.querySelectorAll(".customer-step-item");
        tl.fromTo(
          stepItems,
          { opacity: 0, x: -16 },
          { opacity: 1, x: 0, duration: 0.5, stagger: 0.15 },
          "-=0.4"
        );
      }

      if (ctaRef.current) {
        tl.fromTo(
          ctaRef.current,
          { opacity: 0, y: 12 },
          { opacity: 1, y: 0, duration: 0.4 },
          "-=0.2"
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const steps = [
    {
      step: "01",
      label: "TROUVER",
      title: "Retrouvez l'entreprise que vous recherchez.",
      description:
        "Parcourez le répertoire Zadesk et découvrez les entreprises, leurs activités et leurs informations.",
      icon: Search,
    },
    {
      step: "02",
      label: "CONTACTER",
      title: "Accédez à son espace de contact.",
      description:
        "Consultez sa présentation et accédez à son espace public pour lui adresser votre demande.",
      icon: Compass,
    },
    {
      step: "03",
      label: "ÉCHANGER",
      title: "Entrez en relation avec son équipe.",
      description:
        "Échangez avec l'équipe de l'entreprise directement depuis votre navigateur, sans avoir à créer un compte client.",
      icon: MessageSquare,
    },
  ];

  return (
    <section
      ref={sectionRef}
      id="experience-client"
      data-nav-theme="light"
      aria-label="L'expérience côté client"
      className="relative w-full bg-white text-[#0D1B3D] py-20 sm:py-28 lg:py-32 border-t border-slate-200/70 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* ======================================================== */}
        {/* 1. EN-TÊTE ÉDITORIALE DE LA SECTION                     */}
        {/* ======================================================== */}
        <div ref={headlineRef} className="max-w-3xl space-y-4 mb-14 sm:mb-16 lg:mb-20">
          <span className="text-[11px] sm:text-xs font-bold uppercase tracking-widest text-emerald-600 block">
            L&apos;expérience côté client
          </span>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#0D1B3D] tracking-tight leading-[1.1]">
            Une entreprise à contacter ?<br />
            Tout commence ici.
          </h2>

          <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal pt-1">
            Retrouvez les entreprises présentes sur Zadesk, découvrez leur activité et entrez directement
            en relation avec leur équipe. Une expérience simple, pensée pour rapprocher les entreprises
            des personnes qui les contactent.
          </p>
        </div>

        {/* ======================================================== */}
        {/* 2. COMPOSITION ASYMÉTRIQUE : NARRATION & PHOTOGRAPHIE   */}
        {/* ======================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          
          {/* Colonne Narration des 3 Étapes (7 colonnes sur desktop) */}
          <div className="lg:col-span-7 space-y-8">
            <div
              ref={stepsContainerRef}
              className="relative pl-6 sm:pl-8 border-l-2 border-slate-200 space-y-10 sm:space-y-12"
            >
              {steps.map((item, index) => {
                const IconComponent = item.icon;
                return (
                  <div
                    key={item.step}
                    className="customer-step-item relative group transition-transform duration-200"
                  >
                    {/* Repère d'étape sur la ligne continue */}
                    <div className="absolute -left-[31px] sm:-left-[39px] top-1 w-4 h-4 rounded-full bg-white border-2 border-[#0D1B3D] group-hover:border-emerald-500 group-hover:bg-emerald-50 transition-colors" />

                    <div className="space-y-2">
                      {/* Numéro & Libellé */}
                      <div className="flex items-center gap-2 text-xs font-mono font-bold tracking-wider text-slate-400">
                        <span className="text-emerald-600">{item.step}</span>
                        <span>—</span>
                        <span className="uppercase text-slate-500">{item.label}</span>
                      </div>

                      {/* Titre de l'étape */}
                      <h3 className="text-lg sm:text-xl font-bold text-slate-950 tracking-tight leading-snug">
                        {item.title}
                      </h3>

                      {/* Description éditoriale */}
                      <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-xl font-normal">
                        {item.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* CTA Unique de la section */}
            <div ref={ctaRef} className="pt-4 pl-6 sm:pl-8">
              <Link
                href="/entreprises"
                className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-full bg-[#0D1B3D] hover:bg-[#182C5E] text-white font-bold text-sm sm:text-base transition-all shadow-sm active:scale-[0.97] group cursor-pointer"
              >
                <span>Trouver une entreprise</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Colonne Visuelle : Photographie Documentaire Authentique (5 colonnes) */}
          <div
            ref={photoContainerRef}
            className="lg:col-span-5 flex justify-center lg:justify-end"
          >
            <div className="w-full max-w-md rounded-3xl bg-slate-50 border border-slate-200/90 shadow-[0_16px_40px_-12px_rgba(13,27,61,0.08)] overflow-hidden flex flex-col">
              
              {/* Photographie Documentaire Réelle */}
              <div className="relative aspect-4/3 sm:aspect-5/4 w-full bg-slate-100 overflow-hidden">
                <img
                  src="/images/hero-african-customer.jpg"
                  alt="Une cliente consulte les informations et contacte un commerce sur smartphone"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>

              {/* Légende Sobre et Honnête */}
              <div className="p-5 bg-white border-t border-slate-100 space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Usage Quotidien
                </span>
                <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed">
                  Accès direct aux coordonnées et échange instantané avec les équipes locales.
                </p>
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
};

export default CustomerExperienceSection;

