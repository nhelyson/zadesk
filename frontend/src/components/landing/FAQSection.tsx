"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowRight, Plus, Minus } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

interface FAQItem {
  id: string;
  category: "public" | "pro";
  categoryLabel: string;
  question: string;
  answer: string;
}

export const FAQSection: React.FC = () => {
  const [openId, setOpenId] = useState<string | null>("faq-1");
  const [filter, setFilter] = useState<"all" | "public" | "pro">("all");

  const sectionRef = useRef<HTMLElement>(null);
  const leftColRef = useRef<HTMLDivElement>(null);
  const rightColRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    gsap.registerPlugin(ScrollTrigger);

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      if (leftColRef.current) {
        gsap.fromTo(
          leftColRef.current,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: {
              trigger: leftColRef.current,
              start: "top 85%",
              toggleActions: "play none none reverse",
            },
          }
        );
      }

      if (rightColRef.current) {
        gsap.fromTo(
          rightColRef.current,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 0.9,
            ease: "power3.out",
            scrollTrigger: {
              trigger: rightColRef.current,
              start: "top 80%",
              toggleActions: "play none none reverse",
            },
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const faqs: FAQItem[] = [
    // ================================================================
    // GRAND PUBLIC & PARTICULIERS (LES CLIENTS)
    // ================================================================
    {
      id: "faq-1",
      category: "public",
      categoryLabel: "Grand Public",
      question: "Comment contacter une entreprise présente sur Zadesk ?",
      answer:
        "Consultez le répertoire public des commerces et services (/entreprises). Sélectionnez l'enseigne souhaitée, puis ouvrez immédiatement la conversation en direct depuis votre navigateur web, ou repérez ses établissements les plus proches.",
    },
    {
      id: "faq-2",
      category: "public",
      categoryLabel: "Grand Public",
      question: "Dois-je créer un compte ou fournir mes données pour contacter une entreprise ?",
      answer:
        "Non, absolument pas. Aucun compte, mot de passe ou formulaire préalable n'est exigé des clients. Vous échangez directement depuis votre navigateur avec l'équipe de l'entreprise, en toute simplicité.",
    },
    {
      id: "faq-3",
      category: "public",
      categoryLabel: "Grand Public",
      question: "Dois-je installer une application spécifique sur mon smartphone ?",
      answer:
        "Aucune application supplémentaire n'est requise. Tout se déroule directement dans votre navigateur web habituel. Si votre demande nécessite une visite au guichet, vous recevez directement dans votre fil de discussion un récapitulatif avec référence et QR code.",
    },
    {
      id: "faq-4",
      category: "public",
      categoryLabel: "Grand Public",
      question: "Comment se déroule la continuité si un passage en agence physique est nécessaire ?",
      answer:
        "Si votre problème ne peut être résolu à distance (ex: diagnostic technique, échange de pièce ou formalité guichet), un dossier officiel est créé avec une référence unique (ex: ZDK-48291). En agence, le conseiller scanne votre QR code et accède immédiatement à tout l'historique sans vous faire répéter.",
    },

    // ================================================================
    // ENTREPRISES & ÉQUIPES PROFESSIONNELLES
    // ================================================================
    {
      id: "faq-5",
      category: "pro",
      categoryLabel: "Entreprises",
      question: "Comment créer et configurer l'espace de mon entreprise ?",
      answer:
        "La création s'effectue en quelques minutes depuis l'inscription (/register). Vous renseignez les informations de votre entreprise, vos horaires d'ouverture et vos établissements. Votre espace public et votre messagerie sont opérationnels immédiatement.",
    },
    {
      id: "faq-6",
      category: "pro",
      categoryLabel: "Entreprises",
      question: "Plusieurs collaborateurs peuvent-ils traiter les messages en simultané ?",
      answer:
        "Oui. Zadesk est une plateforme conçue pour le travail en équipe. Vous invitez vos agents par e-mail en leur attribuant des rôles (manager, agent) et des compétences. Vos équipes répondent depuis une interface web unifiée sur ordinateur, sans jamais dévoiler leurs numéros personnels.",
    },
    {
      id: "faq-7",
      category: "pro",
      categoryLabel: "Entreprises",
      question: "Comment fonctionne l'assistance IA de première ligne ?",
      answer:
        "Vous importez votre documentation vérifiée (FAQ, fiches techniques, conditions de retour). L'IA s'appuie strictement sur ces documents pour apporter des réponses immédiates et précises aux interrogations récurrentes. Si la demande nécessite une expertise humaine, elle est réorientée vers l'agent qualifié avec tout son contexte.",
    },
    {
      id: "faq-8",
      category: "pro",
      categoryLabel: "Entreprises",
      question: "Comment les clients découvrent-ils le service de mon entreprise ?",
      answer:
        "Dès l'activation de votre espace, votre entreprise bénéficie d'une page publique sur le répertoire Zadesk. Vous pouvez également intégrer votre lien direct ou QR code sur vos supports commerciaux, votre site internet, vos emballages et dans vos points de vente physiques.",
    },
  ];

  const filteredFaqs = faqs.filter((item) => {
    if (filter === "all") return true;
    return item.category === filter;
  });

  const toggleFAQ = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <section
      ref={sectionRef}
      id="faq"
      data-nav-theme="light"
      aria-label="Foire aux questions"
      className="scroll-mt-16 relative w-full bg-white text-[#0D1B3D] py-24 sm:py-32 lg:py-40 border-t border-slate-200/70"
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
        
        {/* Grille asymétrique principale (5 colonnes à gauche / 7 à droite) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* ========================================================== */}
          {/* ZONE GAUCHE : ANCRAGE ÉDITORIAL & FILTRES DE LECTURE        */}
          {/* ========================================================== */}
          <div ref={leftColRef} className="lg:col-span-5 lg:sticky lg:top-32 space-y-8">
            
            {/* Label discret épuré */}
            <div>
              <div className="mb-4">
                <span className="text-[11px] sm:text-xs font-bold uppercase tracking-widest text-emerald-600 block">
                  Questions fréquentes
                </span>
              </div>

              {/* Titre monumental */}
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#0D1B3D] tracking-[-0.04em] leading-[1.0] uppercase">
                Comprendre<br />
                <span className="text-slate-400 font-normal">Zadesk.</span>
              </h2>

              <p className="mt-5 text-base sm:text-lg text-slate-600 font-normal leading-relaxed">
                Que vous soyez un particulier souhaitant joindre une entreprise ou un professionnel organisant sa relation client, retrouvez des réponses directes et sans détour.
              </p>
            </div>

            {/* Sélecteur d'audience éditorial */}
            <div className="pt-2">
              <span className="font-mono text-[11px] uppercase tracking-wider text-slate-400 font-semibold block mb-3">
                Filtrer par préoccupation :
              </span>
              <div
                role="radiogroup"
                aria-label="Filtrer les questions par public"
                className="inline-flex flex-wrap items-center gap-2"
              >
                <button
                  type="button"
                  role="radio"
                  aria-checked={filter === "all"}
                  onClick={() => setFilter("all")}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all duration-150 cursor-pointer ${
                    filter === "all"
                      ? "bg-[#0D1B3D] text-white shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-[#0D1B3D]"
                  }`}
                >
                  Toutes les questions ({faqs.length})
                </button>

                <button
                  type="button"
                  role="radio"
                  aria-checked={filter === "public"}
                  onClick={() => setFilter("public")}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all duration-150 cursor-pointer ${
                    filter === "public"
                      ? "bg-[#0D1B3D] text-white shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-[#0D1B3D]"
                  }`}
                >
                  Grand Public (4)
                </button>

                <button
                  type="button"
                  role="radio"
                  aria-checked={filter === "pro"}
                  onClick={() => setFilter("pro")}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all duration-150 cursor-pointer ${
                    filter === "pro"
                      ? "bg-[#0D1B3D] text-white shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-[#0D1B3D]"
                  }`}
                >
                  Entreprises (4)
                </button>
              </div>
            </div>

            {/* Encadré d'orientation directe */}
            <div className="pt-6 border-t border-slate-200/80">
              <div className="bg-[#FBFBFC] border border-slate-200/80 rounded-2xl p-5 space-y-3">
                <span className="font-mono text-xs font-bold text-[#0D1B3D] block uppercase tracking-wider">
                  Une question non couverte ?
                </span>
                <p className="text-xs text-slate-600 leading-relaxed font-normal">
                  Consultez notre annuaire pour échanger avec une entreprise ou écrivez à notre équipe support pour être guidé.
                </p>
                <div className="pt-1 flex items-center gap-4 text-xs font-bold">
                  <Link
                    href="/entreprises"
                    className="inline-flex items-center gap-1.5 text-emerald-700 hover:text-emerald-800 transition-colors"
                  >
                    <span>Explorer l&apos;annuaire</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <span className="text-slate-300">/</span>
                  <Link
                    href="/register"
                    className="inline-flex items-center gap-1.5 text-[#0D1B3D] hover:text-slate-700 transition-colors"
                  >
                    <span>Créer un espace</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>

          </div>

          {/* ========================================================== */}
          {/* ZONE DROITE : LISTE ARCHITECTURALE DES QUESTIONS/RÉPONSES  */}
          {/* ========================================================== */}
          <div ref={rightColRef} className="lg:col-span-7">
            <div className="border-t border-slate-200/80 divide-y divide-slate-200/80">
              {filteredFaqs.map((faq, idx) => {
                const isOpen = openId === faq.id;
                const formattedIndex = String(idx + 1).padStart(2, "0");

                return (
                  <div
                    key={faq.id}
                    className={`transition-colors duration-200 ${
                      isOpen ? "bg-[#FBFBFC]/70" : "hover:bg-slate-50/50"
                    }`}
                  >
                    <h3>
                      <button
                        type="button"
                        id={`faq-btn-${faq.id}`}
                        aria-expanded={isOpen}
                        aria-controls={`faq-answer-${faq.id}`}
                        onClick={() => toggleFAQ(faq.id)}
                        className="w-full text-left py-6 sm:py-7 px-4 sm:px-6 flex items-start justify-between gap-6 cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-lg"
                      >
                        <div className="flex items-start gap-4 sm:gap-6">
                          {/* Numérotation monospace suisse */}
                          <span className={`font-mono text-xs sm:text-sm font-bold shrink-0 pt-0.5 transition-colors duration-150 ${
                            isOpen ? "text-emerald-600" : "text-slate-400"
                          }`}>
                            {formattedIndex}
                          </span>

                          <div className="space-y-1">
                            {/* Catégorie discrète */}
                            <span className="font-mono text-[10px] uppercase tracking-wider text-slate-400 block font-semibold">
                              {faq.categoryLabel}
                            </span>
                            {/* Question text */}
                            <span className={`text-base sm:text-lg font-bold tracking-tight block transition-colors duration-150 ${
                              isOpen ? "text-[#0D1B3D]" : "text-slate-800 hover:text-[#0D1B3D]"
                            }`}>
                              {faq.question}
                            </span>
                          </div>
                        </div>

                        {/* Indicateur minimaliste plus/moins */}
                        <div className={`shrink-0 w-8 h-8 rounded-full border flex items-center justify-center transition-all duration-200 mt-1 ${
                          isOpen
                            ? "border-[#0D1B3D] bg-[#0D1B3D] text-white"
                            : "border-slate-200 text-slate-500 hover:border-slate-400"
                        }`}>
                          {isOpen ? (
                            <Minus className="w-3.5 h-3.5 stroke-[2.5]" />
                          ) : (
                            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                          )}
                        </div>
                      </button>
                    </h3>

                    {/* Déploiement fluide de la réponse (CSS Grid Rows) */}
                    <div
                      id={`faq-answer-${faq.id}`}
                      role="region"
                      aria-labelledby={`faq-btn-${faq.id}`}
                      className={`grid transition-[grid-template-rows] duration-250 ease-out ${
                        isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                      }`}
                    >
                      <div className="overflow-hidden">
                        <div className="pl-14 sm:pl-20 pr-6 sm:pr-12 pb-7 pt-1 text-slate-600 text-sm sm:text-base leading-relaxed font-normal">
                          <p>{faq.answer}</p>
                        </div>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
