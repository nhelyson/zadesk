"use client";

import React from "react";
import { Sparkles, GitBranch, RefreshCw, MessageSquare, TrendingUp, Building, HeartHandshake, ShieldCheck, Zap } from "lucide-react";
import { RevealOnScroll } from "./motion/RevealOnScroll";
import { SpotlightCard } from "./motion/SpotlightCard";
import { TiltCard } from "./motion/TiltCard";

export const WhyZadeskSection = () => {
  const values = [
    {
      title: "Des réponses en 30 secondes chrono",
      desc: "L'IA SAV traite instantanément les questions courantes 24h/24 et 7j/7 à partir de vos documents. Vos clients n'attendent plus jamais.",
      icon: <Zap className="w-6 h-6 text-emerald-500" />,
      tag: "VITESSE RECORD",
    },
    {
      title: "Routage automatique par compétences",
      desc: "Les demandes techniques vont aux techniciens, les questions de facturation vont aux gestionnaires. Fini les messages qui tournent en rond.",
      icon: <GitBranch className="w-6 h-6 text-sky-500" />,
      tag: "ÉQUIPE EFFICACE",
    },
    {
      title: "Zéro répétition pour vos clients",
      desc: "L'agent récupère immédiatement le résumé complet de la conversation. Le client se sent écouté et valorisé dès les premières secondes.",
      icon: <RefreshCw className="w-6 h-6 text-indigo-500" />,
      tag: "EXPÉRIENCE CLIENT VIP",
    },
    {
      title: "Une messagerie directe sans friction",
      desc: "Messagerie SAV intégrée : zéro compte obligatoire à créer, accès immédiat depuis le web. Vous offrez un canal direct et fluide à vos clients.",
      icon: <MessageSquare className="w-6 h-6 text-emerald-500" />,
      tag: "ACCESSIBILITÉ FLUIDE",
    },
    {
      title: "Une mémoire d'entreprise pérenne",
      desc: "L'historique client reste dans votre entreprise, plus jamais piégé dans les téléphones personnels de vos employés.",
      icon: <ShieldCheck className="w-6 h-6 text-amber-500" />,
      tag: "SÉCURITÉ DU BUSINESS",
    },
    {
      title: "Continuité parfaite jusqu'au guichet",
      desc: "Si une visite physique est requise, le dossier avec QR code permet une prise en charge immédiate au guichet de votre agence.",
      icon: <Building className="w-6 h-6 text-purple-500" />,
      tag: "FIDÉLISATION ASSURÉE",
    },
  ];

  return (
    <section data-nav-theme="light" className="py-20 md:py-28 bg-white relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <RevealOnScroll direction="up">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-navy-900 leading-tight">
              Transformez votre service après-vente en machine à fidéliser.
            </h2>
            <p className="text-base sm:text-lg text-slate-600">
              Ne considérez plus le SAV comme un coût ou un casse-tête : avec Zadesk, il devient votre meilleur avantage concurrentiel.
            </p>
          </div>
        </RevealOnScroll>

        {/* 6 Value Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {values.map((v, idx) => (
            <RevealOnScroll key={idx} delay={idx * 60} direction="up">
              <TiltCard>
                <SpotlightCard className="group p-8 h-full flex flex-col justify-between space-y-4 border-slate-200 shadow-md hover:shadow-xl hover:border-emerald-200 transition-all duration-300 cursor-default">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center shadow-xs group-hover:scale-110 group-hover:bg-emerald-50/80 transition-all duration-300">
                        {v.icon}
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 group-hover:text-emerald-700 transition-colors duration-200">
                        {v.tag}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-navy-900">
                      {v.title}
                    </h3>

                    <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                      {v.desc}
                    </p>
                  </div>
                </SpotlightCard>
              </TiltCard>
            </RevealOnScroll>
          ))}
        </div>

      </div>
    </section>
  );
};