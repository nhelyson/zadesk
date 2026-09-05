"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { AlertTriangle, TrendingDown, XCircle, ArrowRight, ShieldAlert, DollarSign } from "lucide-react";
import { RevealOnScroll } from "./motion/RevealOnScroll";
import { TiltCard } from "./motion/TiltCard";

export const BusinessPainRuptureSection = () => {
  return (
    <section data-nav-theme="crimson" className="py-20 md:py-28 bg-[#16060A] text-white relative overflow-hidden border-y border-rose-950/60">
      
      {/* Intense Crimson Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-rose-600/15 blur-[160px] rounded-full pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <RevealOnScroll direction="up">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <span className="text-xs font-black uppercase tracking-widest text-rose-400 bg-rose-950/80 px-4 py-1.5 rounded-full border border-rose-800/60">
              LE COÛT DU CHAOS ACTUEL
            </span>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
              Chaque message sans réponse est une vente qui part chez vos concurrents.
            </h2>
            <p className="text-base sm:text-lg text-rose-200/80">
              Quand votre SAV repose sur des téléphones personnels, vous perdez de l&apos;argent tous les jours sans même vous en rendre compte.
            </p>
          </div>
        </RevealOnScroll>

        {/* 3 Shocking Cost Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-12">
          
          <RevealOnScroll direction="up" delay={100}>
            <TiltCard>
              <div className="p-8 rounded-3xl bg-[#220B10] border border-rose-900/60 shadow-xl space-y-4 h-full flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-rose-950 border border-rose-800 flex items-center justify-center text-rose-400">
                    <TrendingDown className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Clients frustrés &amp; perdus</h3>
                  <p className="text-xs text-rose-200/70 leading-relaxed">
                    Un client qui attend 3 heures sur WhatsApp achète chez le premier concurrent qui lui répond en 2 minutes. Vous perdez la vente et la fidélité.
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-900/80 text-[11px] font-bold text-rose-300">
                  ⚠️ Perte estimée : jusqu&apos;à 35% de réachats manqués
                </div>
              </div>
            </TiltCard>
          </RevealOnScroll>

          <RevealOnScroll direction="up" delay={200}>
            <TiltCard>
              <div className="p-8 rounded-3xl bg-[#220B10] border border-rose-900/60 shadow-xl space-y-4 h-full flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-rose-950 border border-rose-800 flex items-center justify-center text-rose-400">
                    <ShieldAlert className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Mémoire d&apos;entreprise piégée</h3>
                  <p className="text-xs text-rose-200/70 leading-relaxed">
                    Quand un employé part ou est en congé, tout l&apos;historique de vos clients reste enfermé dans son téléphone personnel. L&apos;entreprise est prise en otage.
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-900/80 text-[11px] font-bold text-rose-300">
                  ⚠️ Risque : Zéro visibilité patron &amp; perte de contacts
                </div>
              </div>
            </TiltCard>
          </RevealOnScroll>

          <RevealOnScroll direction="up" delay={300}>
            <TiltCard>
              <div className="p-8 rounded-3xl bg-[#220B10] border border-rose-900/60 shadow-xl space-y-4 h-full flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-rose-950 border border-rose-800 flex items-center justify-center text-rose-400">
                    <XCircle className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Clients obligés de tout répéter</h3>
                  <p className="text-xs text-rose-200/70 leading-relaxed">
                    Le client explique son problème sur WhatsApp, puis doit recommencer à zéro devant le technicien ou en agence. L&apos;expérience est perçue comme non professionnelle.
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-900/80 text-[11px] font-bold text-rose-300">
                  ⚠️ Conséquence : Image de marque dégradée
                </div>
              </div>
            </TiltCard>
          </RevealOnScroll>

        </div>

        {/* Transition CTA to Zadesk */}
        <RevealOnScroll direction="up">
          <div className="text-center pt-4">
            <Link href="/register">
              <Button
                size="lg"
                variant="gradient"
                className="font-bold shadow-xl shadow-emerald-500/25 hover:scale-105 transition-transform"
                rightIcon={<ArrowRight className="w-5 h-5" />}
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