"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Sparkles, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { RevealOnScroll } from "./motion/RevealOnScroll";

export const FinalCTA = () => {
  return (
    <section data-nav-theme="navy" className="py-20 md:py-28 bg-navy-900 text-white relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-emerald-500/15 blur-[150px] rounded-full pointer-events-none" />

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-8">
        
        <RevealOnScroll direction="up">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-800/80 border border-slate-700 text-xs font-bold text-emerald-400">
            <Sparkles className="w-4 h-4" />
            <span>Prêt à révolutionner votre relation client ?</span>
          </div>

          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight mt-4">
            Créez le SAV de votre entreprise sur WhatsApp dès aujourd&apos;hui.
          </h2>

          <p className="text-base sm:text-xl text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed mt-4">
            Laissez l&apos;IA traiter les demandes courantes, transmettez les cas complexes aux bons agents et assurez la continuité jusqu&apos;à vos agences.
          </p>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register" className="w-full sm:w-auto">
              <Button
                size="xl"
                variant="gradient"
                className="w-full sm:w-auto text-base font-bold shadow-2xl shadow-emerald-500/30 hover:scale-105 transition-all"
                rightIcon={<ArrowRight className="w-5 h-5" />}
              >
                Créer mon SAV — 14 jours gratuits
              </Button>
            </Link>
          </div>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400 font-medium">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Installation en 2 minutes
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Sans engagement
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Continuité agence garantie
            </span>
          </div>
        </RevealOnScroll>

      </div>
    </section>
  );
};