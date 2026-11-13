"use client";

import React from "react";
import { 
  MessageSquare, 
  Sparkles, 
  GitBranch, 
  FileText, 
  CheckCircle2, 
  Ticket, 
  Building, 
  ArrowRight,
  TrendingUp,
  ShieldCheck
} from "lucide-react";
import { RevealOnScroll } from "./motion/RevealOnScroll";
import { TiltCard } from "./motion/TiltCard";

export const HowItWorksSection = () => {
  const steps = [
    {
      num: "01",
      tag: "POINT D'ENTRÉE NATUREL",
      title: "Le client ouvre la messagerie SAV",
      desc: "Il accède directement à l'espace d'échange de l'entreprise. Zéro application obligatoire à télécharger, zéro compte imposé : son contact suffit pour démarrer.",
      icon: <MessageSquare className="w-6 h-6 text-emerald-400" />,
      detail: "Accès direct sans friction",
    },
    {
      num: "02",
      tag: "1ÈRE LIGNE IA",
      title: "L'IA SAV résout 80% des demandes",
      desc: "L'assistant analyse la demande et consulte vos documents d'entreprise (FAQ, notices, garanties) pour répondre immédiatement et avec précision.",
      icon: <Sparkles className="w-6 h-6 text-emerald-400" />,
      detail: "Réponse en 1 seconde chrono",
    },
    {
      num: "03",
      tag: "ROUTAGE EXPERT",
      title: "Transfert vers l'agent qualifié",
      desc: "Si l'IA ne suffit pas, Zadesk oriente directement vers l'agent compétent (ex: technicien pour une panne). Le numéro personnel de l'agent reste 100% masqué.",
      icon: <GitBranch className="w-6 h-6 text-sky-400" />,
      detail: "Fini le désordre des téléphones partagés",
    },
    {
      num: "04",
      tag: "ZÉRO RÉPÉTITION",
      title: "L'agent reçoit tout le contexte",
      desc: "L'agent ouvre la discussion avec le résumé de l'IA, les photos reçues et les étapes déjà essayées. Le client n'a plus jamais à répéter son histoire.",
      icon: <FileText className="w-6 h-6 text-indigo-400" />,
      detail: "Expérience client ultra-fluide",
    },
    {
      num: "05",
      tag: "RÉSOLUTION IMMÉDIATE",
      title: "Demande résolue sans lourdeur",
      desc: "Si l'agent règle le souci à distance, la conversation se clôture simplement. Zéro bureaucratie inutile pour l'équipe.",
      icon: <CheckCircle2 className="w-6 h-6 text-emerald-400" />,
      detail: "Fermeture rapide & satisfaction client",
    },
    {
      num: "06",
      tag: "DOSSIER AGENCE",
      title: "Création du dossier de continuité",
      desc: "Si une visite physique est nécessaire (échange de pièce, réparation), Zadesk génère un dossier avec référence unique (ZDK-48291) et QR code.",
      icon: <Ticket className="w-6 h-6 text-amber-400" />,
      detail: "Réf officielle + QR Code de suivi",
    },
    {
      num: "07",
      tag: "CONTINUITÉ PHYSIQUE",
      title: "L'agence reprend immédiatement le dossier",
      desc: "Au guichet physique, le conseiller scanne le QR code et a tout le diagnostic sous les yeux. Le client est pris en charge en 1 minute sans attendre.",
      icon: <Building className="w-6 h-6 text-purple-400" />,
      detail: "Continuité digitale ➔ physique garantie",
    },
  ];

  return (
    <section id="comment-ca-marche" data-nav-theme="midnight" className="py-20 md:py-28 bg-[#080E21] text-white relative overflow-hidden border-y border-slate-800">
      
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 right-1/4 w-[700px] h-[500px] bg-indigo-500/10 blur-[180px] rounded-full pointer-events-none -z-10" />
      <div className="absolute bottom-10 left-10 w-[500px] h-[400px] bg-emerald-500/10 blur-[160px] rounded-full pointer-events-none -z-10" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <RevealOnScroll direction="up">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
              Le canal peut changer, mais le contexte ne doit jamais être perdu.
            </h2>
            <p className="text-base sm:text-lg text-slate-300">
              Découvrez comment Zadesk orchestre chaque échange client, du premier message en ligne jusqu&apos;à la prise en charge au guichet physique.
            </p>
          </div>
        </RevealOnScroll>

        {/* 7-Step Sequential Storytelling */}
        <div className="max-w-5xl mx-auto space-y-5">
          {steps.map((s, idx) => (
            <RevealOnScroll key={idx} delay={idx * 50} direction="up">
              <TiltCard>
                <div className="group p-6 sm:p-8 rounded-3xl bg-[#0F172A]/90 border border-slate-700/80 hover:border-emerald-500/80 hover:shadow-2xl hover:shadow-emerald-950/30 hover:-translate-y-0.5 transition-all duration-300 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 cursor-default">
                  
                  <div className="flex items-start gap-4 sm:gap-6">
                    <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-700 group-hover:scale-110 group-hover:border-emerald-500/40 group-hover:bg-slate-800 flex items-center justify-center shrink-0 shadow-inner transition-all duration-300">
                      {s.icon}
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2.5">
                        <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 font-mono text-[11px] font-black border border-emerald-500/30">
                          {s.num}
                        </span>
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                          {s.tag}
                        </span>
                      </div>

                      <h3 className="text-lg sm:text-xl font-bold text-white">
                        {s.title}
                      </h3>

                      <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-2xl">
                        {s.desc}
                      </p>
                    </div>
                  </div>

                  <div className="sm:text-right shrink-0 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                    <span className="inline-block px-3.5 py-1.5 rounded-xl bg-slate-900 text-emerald-400 text-xs font-bold border border-slate-700 shadow-xs">
                      {s.detail}
                    </span>
                  </div>

                </div>
              </TiltCard>
            </RevealOnScroll>
          ))}
        </div>

      </div>
    </section>
  );
};