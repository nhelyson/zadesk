"use client";

import React, { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";
import { RevealOnScroll } from "./motion/RevealOnScroll";

export const FAQSection = () => {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs = [
    {
      q: "Mes clients doivent-ils créer un compte Zadesk ou installer une application ?",
      a: "Non, absolument pas. Vos clients accèdent directement à l'espace SAV de votre entreprise via leur navigateur. Aucun compte n'est requis pour démarrer une conversation et ils n'ont rien à installer.",
    },
    {
      q: "Pourquoi dites-vous qu'une conversation n'est pas un ticket ?",
      a: "Dans la majorité des cas (renseignement, disponibilité, réinitialisation simple), la demande est résolue immédiatement par l'IA ou un agent. Créer un ticket pour chaque message alourdirait inutilement le travail de vos équipes. Un ticket n'est créé que lorsqu'un suivi ou une visite en agence est indispensable.",
    },
    {
      q: "Comment l'IA sait-elle répondre aux questions de mon entreprise ?",
      a: "Lors de la configuration de votre SAV, vous importez vos documents internes : FAQ, fiches produits, manuels d'utilisation, politiques de retour et conditions de garantie. L'IA s'appuie strictement sur ces connaissances vérifiées.",
    },
    {
      q: "Comment se passe le transfert vers un agent humain si l'IA ne sait pas répondre ?",
      a: "Zadesk identifie automatiquement le type de problème et le transmet à un agent disponible et spécialisé (par exemple un technicien pour une panne). L'agent reçoit tout le résumé, les photos et les tests déjà tentés. Le client n'a jamais besoin de répéter son histoire.",
    },
    {
      q: "Comment le personnel d'agence retrouve-t-il le dossier physique ?",
      a: "Lorsqu'un ticket est créé pour une visite en agence, le client reçoit une référence officielle (ex: ZDK-48291) et un QR Code de suivi. Au guichet, le conseiller scanne le code ou saisit le numéro de référence pour voir tout l'historique immédiatement.",
    },
    {
      q: "Mes agents doivent-ils utiliser leurs téléphones personnels ?",
      a: "Non. Vos agents se connectent simplement à l'espace Zadesk depuis leur ordinateur ou leur navigateur. Le numéro personnel de vos employés n'est jamais dévoilé aux clients.",
    },
    {
      q: "Puis-je tester Zadesk gratuitement avant de m'engager ?",
      a: "Oui, vous bénéficiez de 14 jours d'essai gratuit avec toutes les fonctionnalités débloquées pour configurer votre messagerie SAV et tester les flux avec votre équipe.",
    },
  ];

  return (
    <section id="faq" data-nav-theme="light" className="py-20 md:py-28 bg-white relative">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <RevealOnScroll direction="up">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-navy-900 leading-tight">
              Tout ce que vous devez savoir sur Zadesk.
            </h2>
            <p className="text-base sm:text-lg text-slate-600">
              Des réponses claires pour comprendre le fonctionnement de votre plateforme SAV Zadesk.
            </p>
          </div>
        </RevealOnScroll>

        {/* Accordion list */}
        <div className="space-y-4">
          {faqs.map((f, idx) => {
            const isOpen = openIdx === idx;
            return (
              <RevealOnScroll key={idx} delay={idx * 40} direction="up">
                <div
                  className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                    isOpen ? "border-emerald-500 bg-slate-50/50 shadow-md" : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <button
                    onClick={() => setOpenIdx(isOpen ? null : idx)}
                    className="w-full text-left p-5 sm:p-6 flex items-center justify-between gap-4 font-bold text-navy-900 text-sm sm:text-base focus:outline-hidden cursor-pointer"
                  >
                    <span className="flex items-center gap-3">
                      <HelpCircle className={`w-4 h-4 shrink-0 transition-colors duration-200 ${isOpen ? "text-emerald-600" : "text-slate-400"}`} />
                      {f.q}
                    </span>
                    <ChevronDown
                      className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                        isOpen ? "rotate-180 text-emerald-600" : ""
                      }`}
                    />
                  </button>

                  <div
                    className={`grid transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                      isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <div className="px-5 pb-6 sm:px-6 text-slate-600 text-xs sm:text-sm leading-relaxed border-t border-slate-100 pt-3">
                        {f.a}
                      </div>
                    </div>
                  </div>
                </div>
              </RevealOnScroll>
            );
          })}
        </div>

      </div>
    </section>
  );
};