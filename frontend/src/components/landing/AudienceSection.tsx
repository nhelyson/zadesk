"use client";

import React from "react";
import Link from "next/link";
import { CheckCircle2, ArrowRight, ShieldCheck, Sparkles, Building2, Store } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { RevealOnScroll } from "./motion/RevealOnScroll";
import { TiltCard } from "./motion/TiltCard";

export const AudienceSection = () => {
  return (
    <section data-nav-theme="light" className="py-20 md:py-28 bg-white relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <RevealOnScroll direction="up">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-200">
              POUR TOUTES LES ENTREPRISES
            </span>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-navy-900 leading-tight">
              Que vous ayez déjà un SAV ou que vous partiez de zéro.
            </h2>
            <p className="text-base sm:text-lg text-slate-600">
              Zadesk s&apos;adapte immédiatement à votre niveau d&apos;organisation pour structurer vos échanges clients.
            </p>
          </div>
        </RevealOnScroll>

        {/* Dual Audience Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          
          {/* Card 1: Existing SAV */}
          <RevealOnScroll direction="left" delay={100}>
            <TiltCard>
              <div className="p-8 sm:p-10 rounded-3xl bg-slate-50 border-2 border-slate-200 hover:border-emerald-500/50 hover:bg-white hover:shadow-2xl transition-all duration-300 flex flex-col justify-between h-full space-y-6">
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100/70 text-emerald-700 flex items-center justify-center font-bold">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-black text-navy-900">
                    Vous avez déjà un SAV ?
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    Passez à la vitesse supérieure. Structurez vos canaux, automatisez les tâches répétitives et donnez à vos agents les bons outils pour répondre 4x plus vite.
                  </p>

                  <ul className="space-y-3 pt-2 text-xs sm:text-sm text-slate-700">
                    <li className="flex items-center gap-3">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Centralisation de tous les flux dans une seule boîte</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Règles d&apos;assignation et de suivi des tickets</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Visibilité managériale et historique des échanges</span>
                    </li>
                  </ul>
                </div>

                <div className="pt-4">
                  <Link href="/register">
                    <Button variant="outline" className="w-full justify-center font-bold border-slate-300">
                      Optimiser mon SAV existant
                    </Button>
                  </Link>
                </div>
              </div>
            </TiltCard>
          </RevealOnScroll>

          {/* Card 2: Starting from scratch */}
          <RevealOnScroll direction="right" delay={200}>
            <TiltCard>
              <div className="p-8 sm:p-10 rounded-3xl bg-navy-900 border-2 border-slate-800 text-white hover:border-emerald-500 hover:shadow-2xl transition-all duration-300 flex flex-col justify-between h-full space-y-6">
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                    <Store className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-black text-white">
                    Vous n&apos;avez pas encore de SAV ?
                  </h3>
                  <p className="text-slate-300 text-sm leading-relaxed">
                    Mettez en place un service après-vente professionnel dès aujourd&apos;hui. Démarrez en quelques clics sans configuration technique complexe.
                  </p>

                  <ul className="space-y-3 pt-2 text-xs sm:text-sm text-slate-200">
                    <li className="flex items-center gap-3">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Prise en main immédiate en moins de 2 minutes</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Fini les téléphones personnels mélangés</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Image d&apos;entreprise crédible et structurée</span>
                    </li>
                  </ul>
                </div>

                <div className="pt-4">
                  <Link href="/register">
                    <Button variant="gradient" className="w-full justify-center font-bold shadow-lg shadow-emerald-500/25">
                      Créer mon premier SAV
                    </Button>
                  </Link>
                </div>
              </div>
            </TiltCard>
          </RevealOnScroll>

        </div>

      </div>
    </section>
  );
};