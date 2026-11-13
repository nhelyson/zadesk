"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Check, ArrowRight, Sparkles } from "lucide-react";
import { RevealOnScroll } from "./motion/RevealOnScroll";
import { TiltCard } from "./motion/TiltCard";

export const PricingSection = () => {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly");

  const plans = [
    {
      name: "Starter",
      desc: "Idéal pour lancer son premier SAV intelligent professionnel.",
      priceMonthly: "15 000",
      priceYearly: "12 000",
      agents: "1 à 2 agents",
      popular: false,
      features: [
        "Messagerie SAV intégrée & lien dédié",
        "Inbox partagée & historique client",
        "IA SAV 1ère ligne (100 résolutions/mois)",
        "Attribution manuelle des tickets",
        "Support standard par email",
      ],
      cta: "Commencer en Starter",
      variant: "outline" as const,
    },
    {
      name: "Pro",
      desc: "Pour les entreprises avec une équipe de relation client active.",
      priceMonthly: "45 000",
      priceYearly: "36 000",
      agents: "Jusqu'à 5 agents",
      popular: true,
      features: [
        "Tout du plan Starter",
        "IA SAV Illimitée branchée sur vos documents",
        "Routage intelligent par compétences (Tech/SAV)",
        "Tickets de continuité & QR Codes Agence",
        "Statistiques & temps de réponse d'équipe",
        "Support prioritaire dédié",
      ],
      cta: "Essayer le plan Pro",
      variant: "gradient" as const,
    },
    {
      name: "Entreprise",
      desc: "Pour les réseaux de distribution, cliniques et multi-agences.",
      priceMonthly: "150 000",
      priceYearly: "120 000",
      agents: "Agents & Agences illimités",
      popular: false,
      features: [
        "Tout du plan Pro",
        "Multi-canaux SAV & Multi-agences",
        "Règles d'escalade sur-mesure",
        "Intégration logicielle & API personnalisée",
        "Accompagnement & formation dédiée",
        "Gestionnaire de compte dédié",
      ],
      cta: "Contacter l'équipe",
      variant: "outline" as const,
    },
  ];

  return (
    <section id="tarifs" data-nav-theme="light" className="py-20 md:py-28 bg-slate-50 relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <RevealOnScroll direction="up">
          <div className="text-center max-w-3xl mx-auto mb-14 space-y-4">
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-navy-900 leading-tight">
              Des forfaits adaptés à la taille de votre SAV.
            </h2>
            <p className="text-base sm:text-lg text-slate-600">
              Démarrez avec 14 jours d&apos;essai gratuit. Sans engagement ni carte bancaire.
            </p>

            {/* Toggle Monthly / Yearly */}
            <div className="pt-4 flex items-center justify-center gap-3">
              <span className={`text-xs font-bold ${billingPeriod === "monthly" ? "text-navy-900" : "text-slate-500"}`}>
                Mensuel
              </span>
              <button
                onClick={() => setBillingPeriod(billingPeriod === "monthly" ? "yearly" : "monthly")}
                className="w-14 h-8 rounded-full bg-navy-900 p-1 relative transition-colors focus:outline-hidden hover:bg-navy-800 cursor-pointer shadow-inner"
                aria-label="Changer de période de facturation"
              >
                <div
                  className={`w-6 h-6 rounded-full bg-emerald-400 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] shadow-sm ${
                    billingPeriod === "yearly" ? "translate-x-6" : "translate-x-0"
                  }`}
                />
              </button>
              <span className={`text-xs font-bold flex items-center gap-1.5 transition-colors duration-200 ${billingPeriod === "yearly" ? "text-navy-900" : "text-slate-500"}`}>
                <span>Annuel</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black animate-pulse">
                  -20%
                </span>
              </span>
            </div>
          </div>
        </RevealOnScroll>

        {/* 3 Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
          {plans.map((p, idx) => {
            const price = billingPeriod === "yearly" ? p.priceYearly : p.priceMonthly;
            return (
              <RevealOnScroll key={idx} delay={idx * 100} direction="up">
                <TiltCard className="h-full">
                  <div
                    className={`rounded-3xl p-8 flex flex-col justify-between h-full relative transition-all duration-300 ease-out hover:-translate-y-1 ${
                      p.popular
                        ? "bg-navy-900 text-white shadow-2xl shadow-navy-950/40 border-2 border-emerald-500 ring-4 ring-emerald-500/15"
                        : "bg-white text-slate-900 border border-slate-200 shadow-lg hover:shadow-2xl hover:border-slate-300"
                    }`}
                  >
                    {p.popular && (
                      <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-[11px] uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-emerald-500/30">
                        <Sparkles className="w-3 h-3 animate-spin duration-3000" />
                        Recommandé
                      </div>
                    )}

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xl font-black">{p.name}</h3>
                        <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full transition-colors duration-200 ${
                          p.popular ? "bg-slate-800 text-emerald-400" : "bg-slate-100 text-slate-600"
                        }`}>
                          {p.agents}
                        </span>
                      </div>

                      <p className={`text-xs min-h-[36px] ${p.popular ? "text-slate-300" : "text-slate-600"}`}>
                        {p.desc}
                      </p>

                      <div className="my-6">
                        <span key={price} className="inline-block text-4xl sm:text-5xl font-black font-mono tracking-tight animate-fadeIn transition-opacity duration-200">
                          {price}
                        </span>
                        <span className={`text-xs ml-2 font-medium ${p.popular ? "text-slate-300" : "text-slate-500"}`}>
                          FCFA / mois
                        </span>
                      </div>

                      <div className="space-y-3 pt-4 border-t border-slate-200/40 text-xs">
                        {p.features.map((f, fIdx) => (
                          <div key={fIdx} className="flex items-start gap-2.5">
                            <Check className={`w-4 h-4 shrink-0 mt-0.5 ${p.popular ? "text-emerald-400" : "text-emerald-600"}`} />
                            <span className={p.popular ? "text-slate-200" : "text-slate-700"}>
                              {f}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-8">
                      <Link href="/register" className="w-full block">
                        <Button
                          variant={p.variant}
                          className={`w-full justify-center font-bold ${
                            !p.popular ? "border-slate-300 text-slate-800 hover:bg-slate-50" : ""
                          }`}
                          size="lg"
                        >
                          {p.cta}
                        </Button>
                      </Link>
                    </div>
                  </div>
                </TiltCard>
              </RevealOnScroll>
            );
          })}
        </div>

      </div>
    </section>
  );
};