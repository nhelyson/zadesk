"use client";

import React from "react";
import { Inbox, Users, ShieldCheck, QrCode } from "lucide-react";
import { RevealOnScroll } from "./motion/RevealOnScroll";

export const TrustBand = () => {
  const pillars = [
    {
      title: "Centralisation",
      desc: "Tous vos flux clients réunis dans une boîte de réception partagée et ordonnée.",
      icon: <Inbox className="w-5 h-5 text-emerald-600" />,
    },
    {
      title: "Coordination",
      desc: "Attribution claire des demandes selon les compétences de vos agents.",
      icon: <Users className="w-5 h-5 text-sky-600" />,
    },
    {
      title: "Traçabilité",
      desc: "Un historique complet pour chaque client, sans dépendre de téléphones personnels.",
      icon: <ShieldCheck className="w-5 h-5 text-amber-600" />,
    },
    {
      title: "Continuité",
      desc: "Passage fluide du message en ligne à la prise en charge au guichet physique.",
      icon: <QrCode className="w-5 h-5 text-indigo-600" />,
    },
  ];

  return (
    <section data-nav-theme="light" className="py-14 sm:py-16 bg-white border-y border-slate-200/80 text-slate-900 relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {pillars.map((p, idx) => (
            <RevealOnScroll key={idx} delay={idx * 60} direction="up">
              <div className="p-6 rounded-2xl bg-slate-50/70 border border-slate-200/80 hover:border-slate-300 hover:bg-slate-50 transition-all duration-200 flex flex-col justify-between space-y-3 cursor-default">
                <div className="flex items-center justify-between">
                  <span className="apple-display-title text-lg font-bold text-navy-900">
                    {p.title}
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-white shadow-xs border border-slate-200/80 flex items-center justify-center">
                    {p.icon}
                  </div>
                </div>
                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                  {p.desc}
                </p>
              </div>
            </RevealOnScroll>
          ))}
        </div>

      </div>
    </section>
  );
};