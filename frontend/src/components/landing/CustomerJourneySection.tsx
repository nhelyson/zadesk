"use client";

import React from "react";
import { MessageSquare, Inbox, UserCheck, Sparkles, Send, CheckCircle2, HeartHandshake } from "lucide-react";
import { RevealOnScroll } from "./motion/RevealOnScroll";

export const CustomerJourneySection = () => {
  const steps = [
    {
      num: "01",
      title: "Le client pose sa question",
      desc: "Depuis son canal habituel, le message est envoyé instantanément.",
      icon: <MessageSquare className="w-5 h-5 text-emerald-600" />,
    },
    {
      num: "02",
      title: "Centralisation Zadesk",
      desc: "La demande est qualifiée, horodatée et placée dans l'inbox d'équipe.",
      icon: <Inbox className="w-5 h-5 text-sky-600" />,
    },
    {
      num: "03",
      title: "Assignation à l'agent",
      desc: "Le bon conseiller prend en charge le ticket. Zéro doublon possible.",
      icon: <UserCheck className="w-5 h-5 text-indigo-600" />,
    },
    {
      num: "04",
      title: "Assistance intelligente",
      desc: "L'historique client et des suggestions de réponses s'affichent.",
      icon: <Sparkles className="w-5 h-5 text-purple-600" />,
    },
    {
      num: "05",
      title: "Réponse envoyée",
      desc: "Le client reçoit une réponse claire, chaleureuse et professionnelle.",
      icon: <Send className="w-5 h-5 text-teal-600" />,
    },
    {
      num: "06",
      title: "Résolution & Traçabilité",
      desc: "Le ticket est clôturé avec conservation intégrale dans la fiche client.",
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" />,
    },
    {
      num: "07",
      title: "Fidélisation acquise",
      desc: "Un client rassuré qui rachètera chez vous en toute confiance.",
      icon: <HeartHandshake className="w-5 h-5 text-amber-600" />,
    },
  ];

  return (
    <section className="py-20 md:py-28 bg-slate-900 text-white relative overflow-hidden">
      <div className="absolute top-0 right-1/4 w-[600px] h-[300px] bg-emerald-500/10 blur-[140px] rounded-full pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <RevealOnScroll direction="up">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 bg-emerald-950/80 px-3.5 py-1.5 rounded-full border border-emerald-500/30">
              PARCOURS DE BOUT EN BOUT
            </span>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
              De la demande du client à sa fidélisation.
            </h2>
            <p className="text-base sm:text-lg text-slate-300">
              Découvrez les 7 étapes fluides qui transforment un simple message en opportunité de fidélisation durable.
            </p>
          </div>
        </RevealOnScroll>

        {/* 7-Step Journey Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((s, idx) => (
            <RevealOnScroll key={idx} delay={idx * 80} direction="up">
              <div className="p-6 rounded-3xl bg-slate-800/80 border border-slate-700/80 hover:border-emerald-500/60 hover:bg-slate-800 transition-all duration-300 flex flex-col justify-between h-full space-y-4 shadow-lg group">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-black text-emerald-400 font-mono tracking-widest bg-emerald-950 px-2.5 py-1 rounded-lg border border-emerald-500/30">
                      ÉTAPE {s.num}
                    </span>
                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 group-hover:scale-110 group-hover:text-emerald-400 transition-transform">
                      {s.icon}
                    </div>
                  </div>
                  <h3 className="text-base font-bold text-white mb-1.5">
                    {s.title}
                  </h3>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    {s.desc}
                  </p>
                </div>
              </div>
            </RevealOnScroll>
          ))}
        </div>

      </div>
    </section>
  );
};