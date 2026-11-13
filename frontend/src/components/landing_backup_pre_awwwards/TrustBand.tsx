"use client";

import React from "react";
import { TrendingUp, Clock, Users, HeartHandshake } from "lucide-react";
import { RevealOnScroll } from "./motion/RevealOnScroll";

export const TrustBand = () => {
  const metrics = [
    {
      value: "30 sec",
      label: "Temps de réponse moyen",
      desc: "Prise en charge instantanée par l'IA",
      icon: <Clock className="w-5 h-5 text-emerald-600" />,
    },
    {
      value: "4x plus",
      label: "De demandes traitées",
      desc: "Sans recruter d'agents supplémentaires",
      icon: <TrendingUp className="w-5 h-5 text-sky-600" />,
    },
    {
      value: "98.4%",
      label: "De satisfaction client",
      desc: "Des acheteurs rassurés et fidélisés",
      icon: <HeartHandshake className="w-5 h-5 text-amber-600" />,
    },
    {
      value: "0 client",
      label: "Perdu ou oublié",
      desc: "Historique et traçabilité 100% garantis",
      icon: <Users className="w-5 h-5 text-indigo-600" />,
    },
  ];

  return (
    <section data-nav-theme="light" className="py-14 bg-white border-y border-slate-200 text-slate-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        <RevealOnScroll direction="up">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <p className="text-xs font-black uppercase tracking-widest text-emerald-800">
              L&apos;IMPACT DIRECT SUR VOTRE CHIFFRE D&apos;AFFAIRES
            </p>
          </div>
        </RevealOnScroll>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {metrics.map((m, idx) => (
            <RevealOnScroll key={idx} delay={idx * 80} direction="up">
              <div className="group p-6 rounded-3xl bg-slate-50 border border-slate-200/90 hover:bg-white hover:border-emerald-300 hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1 transition-all duration-300 ease-out flex flex-col justify-between space-y-3 cursor-default">
                <div className="flex items-center justify-between">
                  <span className="text-3xl sm:text-4xl font-black text-navy-900 tracking-tight font-mono group-hover:text-emerald-700 transition-colors duration-200">
                    {m.value}
                  </span>
                  <div className="p-2.5 rounded-2xl bg-white shadow-xs border border-slate-200 group-hover:scale-110 group-hover:border-emerald-200 transition-all duration-300">
                    {m.icon}
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">{m.label}</h3>
                  <p className="text-slate-500 text-xs mt-0.5">{m.desc}</p>
                </div>
              </div>
            </RevealOnScroll>
          ))}
        </div>

      </div>
    </section>
  );
};