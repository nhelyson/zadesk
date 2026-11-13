"use client";

import React from "react";
import { 
  Inbox, 
  ShieldCheck, 
  QrCode, 
  CheckCircle2, 
  ArrowRight,
  Layers,
  Building,
  Smartphone,
  Users2
} from "lucide-react";
import { RevealOnScroll } from "./motion/RevealOnScroll";

export const WhySwitchSection = () => {
  const pillars = [
    {
      number: "01",
      icon: <Inbox className="w-5 h-5 text-emerald-600" />,
      title: "Une boîte partagée pour toute l'équipe",
      problem: "Quand un client écrit sur le WhatsApp personnel d'un employé, personne d'autre ne voit le message. Si l'employé est absent ou occupé, le client attend sans réponse.",
      solution: "Chaque message arrive dans une boîte d'équipe unique. Vos agents disponibles prennent immédiatement le relais sans bloquer le flux.",
      benefit: "Continuité de service garantie 7j/7 sans dépendre d'une seule personne.",
      badge: "Disponibilité"
    },
    {
      number: "02",
      icon: <ShieldCheck className="w-5 h-5 text-sky-600" />,
      title: "L'historique client reste dans l'entreprise",
      problem: "Quand un collaborateur change de numéro ou quitte l'entreprise, tout le carnet client, les engagements passés et les échanges s'envolent avec son appareil personnel.",
      solution: "Toutes les fiches clients, historiques de pannes, réclamations et accords restent sauvegardés et sécurisés sur votre espace Zadesk.",
      benefit: "Votre mémoire d'entreprise reste votre propriété exclusive et pérenne.",
      badge: "Sécurité & Données"
    },
    {
      number: "03",
      icon: <QrCode className="w-5 h-5 text-indigo-600" />,
      title: "Du message en ligne jusqu'au guichet physique",
      problem: "Le client détaille son problème sur WhatsApp puis se déplace en agence ou en boutique. L'agent d'accueil ne sait rien et lui fait tout réexpliquer depuis le début.",
      solution: "L'agent au comptoir saisit le numéro du client et retrouve instantanément la conversation en ligne, les photos transmises et les pièces jointes.",
      benefit: "Prise en charge immédiate au comptoir sans répéter la même histoire.",
      badge: "Continuité Guichet"
    }
  ];

  return (
    <section data-nav-theme="light" className="py-20 sm:py-28 bg-slate-50/60 border-y border-slate-200/80 text-slate-900 relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <RevealOnScroll direction="up">
          <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20 space-y-4">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-slate-200 text-xs font-semibold text-slate-700 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Organisation &amp; Clarté Opérationnelle
            </span>
            <h2 className="apple-display-title text-3xl sm:text-5xl font-extrabold tracking-[-0.03em] text-slate-950 leading-[1.14]">
              Pourquoi remplacer les téléphones personnels par Zadesk ?
            </h2>
            <p className="apple-body-relaxed text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
              Ce qui change concrètement pour votre équipe et vos clients dès le premier jour d&apos;utilisation.
            </p>
          </div>
        </RevealOnScroll>

        {/* 3 Real Operational Pillars */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {pillars.map((p, idx) => (
            <RevealOnScroll key={idx} delay={idx * 100} direction="up">
              <div className="h-full p-8 rounded-3xl bg-white border border-slate-200/90 shadow-lg shadow-slate-200/40 hover:shadow-xl hover:border-slate-300 transition-all duration-300 flex flex-col justify-between space-y-6">
                
                {/* Top: Icon & Number Badge */}
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-center shadow-2xs">
                      {p.icon}
                    </div>
                    <span className="text-xs font-bold font-mono text-slate-400 bg-slate-100/70 px-2.5 py-1 rounded-lg">
                      {p.number}
                    </span>
                  </div>

                  <h3 className="apple-display-title text-xl font-bold text-slate-950 leading-snug">
                    {p.title}
                  </h3>

                  {/* Problem vs Solution Comparison Card */}
                  <div className="space-y-3 pt-2">
                    {/* Le problème réel */}
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        La réalité sans Zadesk
                      </span>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {p.problem}
                      </p>
                    </div>

                    {/* La réponse Zadesk */}
                    <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200/70 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                        Avec Zadesk
                      </span>
                      <p className="text-xs text-emerald-950 font-medium leading-relaxed">
                        {p.solution}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Bottom Highlight */}
                <div className="pt-4 border-t border-slate-100 flex items-center gap-2 text-xs font-semibold text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{p.benefit}</span>
                </div>

              </div>
            </RevealOnScroll>
          ))}
        </div>

      </div>
    </section>
  );
};

