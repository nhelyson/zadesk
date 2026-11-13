"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { AlertTriangle, TrendingDown, XCircle, ArrowRight, ShieldAlert, DollarSign } from "lucide-react";
import { RevealOnScroll } from "./motion/RevealOnScroll";
import { TiltCard } from "./motion/TiltCard";

export const BusinessPainRuptureSection = () => {
  return (
    <section data-nav-theme="crimson" className="pt-28 pb-24 md:pt-36 md:pb-32 bg-[#140508] text-white relative overflow-hidden border-y border-rose-950/70">
      
      {/* Top and Bottom Ambient Transition Gradients */}
      <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-black/30 via-transparent to-transparent pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />

      {/* Intense Crimson Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-rose-600/15 blur-[160px] rounded-full pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header with Apple Display Typography & Breathing Room */}
        <RevealOnScroll direction="up">
          <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20 space-y-5">
            <h2 className="apple-display-title text-3xl sm:text-5xl lg:text-[54px] font-extrabold tracking-[-0.03em] text-white leading-[1.12]">
              Chaque message sans réponse est une vente qui part chez vos concurrents.
            </h2>
            <p className="apple-body-relaxed text-base sm:text-lg lg:text-xl text-rose-200/85 font-normal leading-relaxed">
              Quand votre SAV repose sur des téléphones personnels, vous perdez de l&apos;argent tous les jours sans même vous en rendre compte.
            </p>
          </div>
        </RevealOnScroll>

        {/* 3 Shocking Cost Cards with Apple Glass Crimson Material */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-14">
          
          <RevealOnScroll direction="up" delay={100}>
            <TiltCard className="h-full">
              <div className="apple-glass-card-crimson group p-8 rounded-[32px] border border-rose-500/25 hover:border-rose-400/50 hover:shadow-[0_24px_54px_-12px_rgba(225,29,72,0.35)] hover:-translate-y-1 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] space-y-4 h-full flex flex-col justify-between cursor-default">
                <div className="space-y-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-rose-950/90 border border-rose-800/80 flex items-center justify-center text-rose-400 group-hover:scale-105 group-hover:border-rose-500 transition-all duration-300">
                    <TrendingDown className="w-6 h-6" />
                  </div>
                  <h3 className="apple-display-title text-xl font-bold text-white group-hover:text-rose-100 transition-colors duration-200">
                    Clients frustrés &amp; perdus
                  </h3>
                  <p className="text-sm text-rose-200/80 leading-relaxed font-normal">
                    Un client qui attend sans réponse se tourne immédiatement vers un concurrent. Chaque délai excessif détruit la fidélité et le réachat.
                  </p>
                </div>
                <div className="pt-2 text-xs font-semibold text-rose-300/90 border-t border-rose-900/60">
                  Impact direct : baisse des réachats et dégradation de la réputation
                </div>
              </div>
            </TiltCard>
          </RevealOnScroll>

          <RevealOnScroll direction="up" delay={200}>
            <TiltCard className="h-full">
              <div className="apple-glass-card-crimson group p-8 rounded-[32px] border border-rose-500/25 hover:border-rose-400/50 hover:shadow-[0_24px_54px_-12px_rgba(225,29,72,0.35)] hover:-translate-y-1 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] space-y-4 h-full flex flex-col justify-between cursor-default">
                <div className="space-y-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-rose-950/90 border border-rose-800/80 flex items-center justify-center text-rose-400 group-hover:scale-105 group-hover:border-rose-500 transition-all duration-300">
                    <ShieldAlert className="w-6 h-6" />
                  </div>
                  <h3 className="apple-display-title text-xl font-bold text-white group-hover:text-rose-100 transition-colors duration-200">
                    Mémoire d&apos;entreprise piégée
                  </h3>
                  <p className="text-sm text-rose-200/80 leading-relaxed font-normal">
                    Quand un employé est absent ou quitte l&apos;entreprise, tout l&apos;historique de vos clients reste enfermé dans son téléphone personnel. L&apos;entreprise perd la trace de ses engagements.
                  </p>
                </div>
                <div className="pt-2 text-xs font-semibold text-rose-300/90 border-t border-rose-900/60">
                  Risque opérationnel : perte de données et dépendance aux appareils privés
                </div>
              </div>
            </TiltCard>
          </RevealOnScroll>

          <RevealOnScroll direction="up" delay={300}>
            <TiltCard className="h-full">
              <div className="apple-glass-card-crimson group p-8 rounded-[32px] border border-rose-500/25 hover:border-rose-400/50 hover:shadow-[0_24px_54px_-12px_rgba(225,29,72,0.35)] hover:-translate-y-1 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] space-y-4 h-full flex flex-col justify-between cursor-default">
                <div className="space-y-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-rose-950/90 border border-rose-800/80 flex items-center justify-center text-rose-400 group-hover:scale-105 group-hover:border-rose-500 transition-all duration-300">
                    <XCircle className="w-6 h-6" />
                  </div>
                  <h3 className="apple-display-title text-xl font-bold text-white group-hover:text-rose-100 transition-colors duration-200">
                    Clients obligés de tout répéter
                  </h3>
                  <p className="text-sm text-rose-200/80 leading-relaxed font-normal">
                    Le client détaille sa situation lors d&apos;une première interaction, puis doit tout réexpliquer au technicien ou en agence. L&apos;expérience est perçue comme désorganisée.
                  </p>
                </div>
                <div className="pt-2 text-xs font-semibold text-rose-300/90 border-t border-rose-900/60">
                  Conséquence : frustration client et sentiment de désorganisation
                </div>
              </div>
            </TiltCard>
          </RevealOnScroll>

        </div>

        {/* Transition CTA to Zadesk */}
        <RevealOnScroll direction="up">
          <div className="text-center pt-2">
            <Link href="/register">
              <Button
                size="xl"
                variant="gradient"
                className="font-bold shadow-2xl shadow-emerald-500/30 hover:shadow-emerald-500/50 active:scale-[0.975] transition-all duration-200"
                rightIcon={<ArrowRight className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-1" />}
              >
                Résoudre ce problème avec Zadesk dès aujourd&apos;hui
              </Button>
            </Link>
          </div>
        </RevealOnScroll>

      </div>
    </section>
  );
};