"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { 
  Building2, 
  Info, 
  MessageSquare, 
  Users, 
  BookOpen, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight,
  ChevronRight
} from "lucide-react";
import { RevealOnScroll } from "./motion/RevealOnScroll";
import { SpotlightCard } from "./motion/SpotlightCard";

export const CreateSAVPreviewSection = () => {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      title: "1. Nom de l'entreprise",
      desc: "Définissez le nom de votre espace de travail et votre logo.",
      icon: <Building2 className="w-5 h-5 text-emerald-500" />,
      preview: (
        <div className="space-y-3">
          <label className="text-xs text-slate-300 font-bold block">Nom de votre structure</label>
          <div className="p-3 rounded-xl bg-slate-900 border border-emerald-500/50 text-white text-xs font-semibold">
            Société Générale de Distribution (SGD)
          </div>
          <p className="text-[11px] text-slate-400">Votre espace d&apos;administration dédié est immédiatement configuré.</p>
        </div>
      )
    },
    {
      title: "2. Informations de l'entreprise",
      desc: "Renseignez vos horaires d'ouverture et l'adresse de vos agences.",
      icon: <Info className="w-5 h-5 text-sky-500" />,
      preview: (
        <div className="space-y-3">
          <label className="text-xs text-slate-300 font-bold block">Horaires du SAV &amp; Agences</label>
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs space-y-1">
            <p>🕒 Lun - Sam : 08h00 - 18h30</p>
            <p>📍 Agence Centre-Ville • Brazzaville</p>
          </div>
          <p className="text-[11px] text-slate-400">L&apos;IA informe automatiquement vos clients en cas de demande hors horaires.</p>
        </div>
      )
    },
    {
      title: "3. Canal de messagerie SAV",
      desc: "Activez votre canal de support intégré et personnalisez l'accès pour vos clients.",
      icon: <MessageSquare className="w-5 h-5 text-emerald-500" />,
      preview: (
        <div className="space-y-3">
          <label className="text-xs text-emerald-400 font-bold block">Canal SAV Actif &amp; Accessible</label>
          <div className="p-4 rounded-xl bg-slate-900 border border-emerald-500/40 text-center space-y-2">
            <div className="p-3 bg-slate-800 rounded-xl border border-slate-700 text-xs text-slate-200">
              💬 Lien SAV : zadesk.com/entreprises/votre-nom
            </div>
            <p className="text-xs text-slate-200 font-bold">Accès direct pour vos clients sans création de compte</p>
          </div>
        </div>
      )
    },
    {
      title: "4. Ajout des agents",
      desc: "Invitez vos conseillers et attribuez leurs spécialités (Tech, Facturation).",
      icon: <Users className="w-5 h-5 text-indigo-500" />,
      preview: (
        <div className="space-y-2 text-xs">
          <label className="text-slate-300 font-bold block">Équipe du support</label>
          <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-700 flex justify-between items-center text-slate-200">
            <span>Japhet I. (Superviseur SAV)</span>
            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px]">Actif</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-700 flex justify-between items-center text-slate-200">
            <span>Sarah M. (Conseillère Client)</span>
            <span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-400 text-[10px]">Actif</span>
          </div>
        </div>
      )
    },
    {
      title: "5. Connaissances & Documents",
      desc: "Importez vos FAQ, fiches produits, manuels et politiques de garantie.",
      icon: <BookOpen className="w-5 h-5 text-amber-500" />,
      preview: (
        <div className="space-y-2 text-xs">
          <label className="text-slate-300 font-bold block">Documents indexés pour l&apos;IA</label>
          <div className="p-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200">
            📄 Manuel_Technique_Routeur_4G.pdf (Indexé ✓)
          </div>
          <div className="p-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200">
            📄 Conditions_Garantie_et_Retour.pdf (Indexé ✓)
          </div>
        </div>
      )
    },
    {
      title: "6. Configuration de l'Assistant SAV",
      desc: "Ajustez le ton des réponses et les critères de transfert vers un agent.",
      icon: <Sparkles className="w-5 h-5 text-purple-500" />,
      preview: (
        <div className="space-y-3">
          <label className="text-purple-400 font-bold block text-xs">Comportement de l&apos;IA</label>
          <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-500/30 text-xs text-purple-200 space-y-1">
            <p>✓ Ton : Professionnel, chaleureux &amp; précis</p>
            <p>✓ Transfert automatique si échec après 2 échanges</p>
          </div>
        </div>
      )
    },
    {
      title: "7. Activation du SAV",
      desc: "Votre SAV est en ligne ! Vos clients reçoivent des réponses dès le premier message.",
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
      preview: (
        <div className="text-center p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/40 space-y-2">
          <span className="w-3 h-3 rounded-full bg-emerald-400 inline-block animate-ping" />
          <h4 className="font-bold text-white text-sm">SAV Zadesk Activé avec Succès !</h4>
          <p className="text-[11px] text-emerald-200">Votre équipe est prête à recevoir les premières demandes.</p>
        </div>
      )
    },
  ];

  return (
    <section data-nav-theme="light" className="py-20 md:py-28 bg-slate-50 relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <RevealOnScroll direction="up">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-navy-900 leading-tight">
              Créer votre SAV est aussi simple que créer un compte.
            </h2>
            <p className="text-base sm:text-lg text-slate-600">
              Un parcours guidé étape par étape pour configurer votre SAV intelligent et outiller vos équipes en quelques minutes.
            </p>
          </div>
        </RevealOnScroll>

        {/* Interactive Step Navigator Showcase */}
        <div className="max-w-5xl mx-auto">
          <SpotlightCard className="p-6 sm:p-10 border-slate-200 shadow-2xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              {/* Left Steps List */}
              <div className="lg:col-span-6 space-y-2">
                {steps.map((s, idx) => (
                  <div
                    key={idx}
                    onClick={() => setActiveStep(idx)}
                    className={`p-3 rounded-2xl cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] flex items-center justify-between ${
                      activeStep === idx
                        ? "bg-navy-900 text-white shadow-lg shadow-navy-900/30 scale-[1.02] border border-emerald-500/50"
                        : "bg-slate-50 text-slate-700 hover:bg-slate-100 hover:scale-[1.008] border border-slate-200/70"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-1.5 rounded-xl transition-all duration-300 ${activeStep === idx ? "bg-slate-800 scale-105" : "bg-white shadow-xs"}`}>
                        {s.icon}
                      </div>
                      <span className="font-bold text-xs sm:text-sm">{s.title}</span>
                    </div>
                    <ChevronRight className={`w-4 h-4 transition-transform duration-300 ${activeStep === idx ? "text-emerald-400 translate-x-0.5" : "text-slate-400"}`} />
                  </div>
                ))}
              </div>

              {/* Right Live Simulation Box */}
              <div className="lg:col-span-6 bg-slate-950 rounded-3xl p-6 sm:p-8 text-white border border-slate-800 shadow-xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
                  <span className="font-bold text-slate-200">Aperçu Configuration</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold transition-all duration-300">
                    Étape {activeStep + 1} / 7
                  </span>
                </div>

                <div key={activeStep} className="py-2 animate-fadeIn transition-opacity duration-300">
                  <h4 className="text-base font-bold text-slate-100 mb-1">
                    {steps[activeStep].title}
                  </h4>
                  <p className="text-xs text-slate-400 mb-4">
                    {steps[activeStep].desc}
                  </p>
                  {steps[activeStep].preview}
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                  <button
                    onClick={() => setActiveStep((prev) => Math.max(0, prev - 1))}
                    disabled={activeStep === 0}
                    className="text-xs font-semibold text-slate-400 hover:text-white disabled:opacity-40"
                  >
                    ← Précédent
                  </button>
                  <button
                    onClick={() => setActiveStep((prev) => Math.min(steps.length - 1, prev + 1))}
                    disabled={activeStep === steps.length - 1}
                    className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 transition-colors disabled:opacity-40"
                  >
                    Suivant →
                  </button>
                </div>
              </div>

            </div>
          </SpotlightCard>
        </div>

      </div>
    </section>
  );
};