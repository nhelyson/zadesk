"use client";

import React, { useState } from "react";
import { Users, ShieldCheck, ArrowRight, LayoutDashboard, UserCheck, CheckCircle2, Clock } from "lucide-react";
import { SpotlightCard } from "./motion/SpotlightCard";

export const ScaleTeamSection = () => {
  const [selectedAgent, setSelectedAgent] = useState(0);

  const agents = [
    {
      name: "Japhet I.",
      role: "Responsable SAV",
      status: "Disponible",
      activeTicket: "Ticket #4819 • Suivi livraison Brazzaville",
      resolvedToday: 12,
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80",
    },
    {
      name: "Sarah M.",
      role: "Conseillère Client",
      status: "En appel",
      activeTicket: "Ticket #4820 • Renseignement garantie",
      resolvedToday: 18,
      avatar: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=120&auto=format&fit=crop&q=80",
    },
    {
      name: "Patrick B.",
      role: "Support Technique",
      status: "En cours",
      activeTicket: "Ticket #4821 • Configuration compte",
      resolvedToday: 9,
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
    },
  ];

  return (
    <section className="py-20 md:py-28 bg-slate-50 relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-200">
            SCALABILITÉ &amp; COLLABORATION
          </span>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-navy-900 leading-tight">
            Votre équipe grandit. Votre SAV doit suivre.
          </h2>
          <p className="text-base sm:text-lg text-slate-600">
            Fini les téléphones qui passent de main en main : chaque demande est automatiquement attribuée et chacun sait exactement ce qu&apos;il doit faire.
          </p>
        </div>

        {/* Live Multi-Agent Dispatching Simulation */}
        <div className="max-w-5xl mx-auto mb-16">
          <SpotlightCard className="p-6 sm:p-10 shadow-2xl border-2 border-slate-200">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6 pb-6 border-b border-slate-200/80">
              <div>
                <h3 className="text-xl font-bold text-navy-900">
                  Distribution intelligente des demandes
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Cliquez sur un agent pour inspecter sa charge de travail et son ticket en cours.
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold text-xs border border-emerald-200 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                3 agents actifs en direct
              </span>
            </div>

            {/* Agent Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6">
              {agents.map((ag, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedAgent(idx)}
                  className={`p-4 rounded-2xl cursor-pointer transition-all border ${
                    selectedAgent === idx
                      ? "bg-navy-900 text-white border-emerald-500 shadow-lg scale-105"
                      : "bg-slate-50 text-slate-800 border-slate-200 hover:bg-white"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <img
                      src={ag.avatar}
                      alt={ag.name}
                      className="w-10 h-10 rounded-full object-cover border-2 border-emerald-400"
                    />
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm">{ag.name}</h4>
                      <p className={`text-[10px] ${selectedAgent === idx ? "text-slate-300" : "text-slate-500"}`}>
                        {ag.role}
                      </p>
                    </div>
                  </div>

                  <div className={`p-2.5 rounded-xl text-[11px] mb-2 ${
                    selectedAgent === idx ? "bg-slate-800 text-emerald-300" : "bg-white text-slate-700 border border-slate-200"
                  }`}>
                    <span className="font-bold block text-[10px] uppercase opacity-75">Demande en cours</span>
                    <p className="truncate font-medium mt-0.5">{ag.activeTicket}</p>
                  </div>

                  <div className="flex items-center justify-between text-[10px] pt-1">
                    <span className={selectedAgent === idx ? "text-slate-400" : "text-slate-500"}>
                      Traités aujourd&apos;hui :
                    </span>
                    <span className="font-bold text-emerald-400">
                      {ag.resolvedToday} tickets ✓
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </SpotlightCard>
        </div>

        {/* 4 Growth Stages Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <SpotlightCard className="p-6">
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider block mb-2">Étape 1</span>
            <h3 className="text-lg font-bold text-navy-900 mb-1">1 Agent</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Un espace clair pour ne plus mélanger vos messages personnels et professionnels.
            </p>
          </SpotlightCard>

          <SpotlightCard className="p-6">
            <span className="text-xs font-bold text-sky-600 uppercase tracking-wider block mb-2">Étape 2</span>
            <h3 className="text-lg font-bold text-navy-900 mb-1">3 Agents</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Fin des téléphones partagés : chacun son compte, les demandes sont réparties équitablement.
            </p>
          </SpotlightCard>

          <SpotlightCard className="p-6">
            <span className="text-xs font-bold text-amber-600 uppercase tracking-wider block mb-2">Étape 3</span>
            <h3 className="text-lg font-bold text-navy-900 mb-1">10 Agents</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Spécialisation par pôles (technique, facturation, réclamations) et règles automatiques.
            </p>
          </SpotlightCard>

          <div className="p-6 rounded-3xl bg-navy-900 text-white border border-slate-800 shadow-md">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block mb-2">Étape 4</span>
            <h3 className="text-lg font-bold text-white mb-1">Multi-Équipes</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Supervision globale, rapports d&apos;activité, gestion fine des rôles et des autorisations.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
};