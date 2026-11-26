"use client";

import React from "react";
import { 
  Check, 
  ArrowRight, 
  ArrowLeft, 
  Users,
  Building2
} from "lucide-react";
import { OFFICIAL_PLANS_CONFIG, PlanConfig } from "@/config/plans";

export interface Step3PlanSelectionProps {
  selectedPlan: string;
  onSelectPlan: (planId: string) => void;
  onNext: () => void;
  onBack: () => void;
}

export const Step3PlanSelection: React.FC<Step3PlanSelectionProps> = ({
  selectedPlan,
  onSelectPlan,
  onNext,
  onBack,
}) => {
  const normSelected = (selectedPlan || "decouverte").toLowerCase().trim();
  const currentPlan =
    OFFICIAL_PLANS_CONFIG.find((p) => p.id === normSelected) ||
    OFFICIAL_PLANS_CONFIG[0];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 1. En-tête de l'étape */}
      <div className="text-left space-y-2">
        <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-600 block">
          Étape 03 • Formule d&apos;abonnement
        </span>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#0D1B3D] tracking-tight">
          Choisissez l&apos;offre adaptée à votre entreprise
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-2xl">
          Démarrez avec l&apos;offre permanente gratuite pour tester, ou activez une formule payante pour équiper vos conseillers et vos points de vente. Sans engagement et résiliable à tout moment.
        </p>
      </div>

      {/* 2. Grille des 4 Formules Officielles */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5 items-stretch">
        {OFFICIAL_PLANS_CONFIG.map((plan: PlanConfig) => {
          const isSelected = normSelected === plan.id;
          const isPro = plan.isPopular;

          const handleCardClick = () => {
            if (isSelected) {
              onNext();
            } else {
              onSelectPlan(plan.id);
            }
          };

          const handleButtonClick = (e: React.MouseEvent) => {
            e.stopPropagation();
            onSelectPlan(plan.id);
            onNext();
          };

          return (
            <div
              key={plan.id}
              onClick={handleCardClick}
              className={`rounded-3xl p-5 sm:p-6 flex flex-col justify-between cursor-pointer transition-all duration-200 relative text-left ${
                isSelected
                  ? isPro
                    ? "bg-[#0D1B3D] text-white shadow-xl shadow-[#0D1B3D]/20 ring-3 ring-emerald-500 scale-[1.01]"
                    : "bg-white border-2 border-emerald-500 text-[#0D1B3D] shadow-lg shadow-emerald-500/10 ring-2 ring-emerald-500/20 scale-[1.01]"
                  : isPro
                  ? "bg-[#0D1B3D]/95 text-white hover:bg-[#0D1B3D] shadow-sm hover:shadow-md border border-slate-700"
                  : "bg-white border border-slate-200/90 text-[#0D1B3D] hover:border-slate-300 hover:shadow-sm"
              }`}
            >
              {/* Badge Recommandé ou Type */}
              <div className="flex items-center justify-between mb-3 min-h-[24px]">
                {isPro ? (
                  <span className="bg-emerald-500 text-slate-950 font-extrabold text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                    Recommandé
                  </span>
                ) : (
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Formule
                  </span>
                )}

                {/* Pastille radio visuelle */}
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all ${
                    isSelected
                      ? "bg-emerald-500 border-emerald-500 text-slate-950"
                      : isPro
                      ? "border-slate-600 bg-slate-800/40"
                      : "border-slate-300 bg-slate-50"
                  }`}
                >
                  {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
              </div>

              {/* Titre & Description */}
              <div className="pb-4 border-b border-slate-100/15">
                <h3 className={`text-xl font-black uppercase tracking-tight ${isPro ? "text-white" : "text-[#0D1B3D]"}`}>
                  {plan.name}
                </h3>
                <p className={`mt-1.5 text-xs leading-relaxed min-h-[36px] ${isPro ? "text-slate-300" : "text-slate-500"}`}>
                  {plan.tagline}
                </p>
              </div>

              {/* Tarification */}
              <div className={`py-4 border-b ${isPro ? "border-slate-800" : "border-slate-100"}`}>
                <div className="flex items-baseline gap-1.5">
                  <span className={`font-mono text-2xl sm:text-3xl font-black tracking-tight ${isPro ? "text-white" : "text-[#0D1B3D]"}`}>
                    {plan.price}
                  </span>
                  <span className={`font-mono text-xs font-semibold ${isPro ? "text-emerald-400" : "text-emerald-700"}`}>
                    {plan.periodLabel}
                  </span>
                </div>
                <div className={`text-[11px] mt-1 ${isPro ? "text-slate-400" : "text-slate-400"}`}>
                  {plan.priceXaf === 0 ? "Sans carte ni paiement" : "Sans engagement • Mensuel"}
                </div>
              </div>

              {/* Quotas & Limites essentielles */}
              <div className="py-4 space-y-2 text-xs flex-1">
                <div className={`flex items-center gap-2 font-medium ${isPro ? "text-slate-200" : "text-slate-700"}`}>
                  <Users className={`w-3.5 h-3.5 shrink-0 ${isPro ? "text-emerald-400" : "text-emerald-600"}`} />
                  <span>{plan.quotas.agents}</span>
                </div>
                <div className={`flex items-center gap-2 font-medium ${isPro ? "text-slate-200" : "text-slate-700"}`}>
                  <Building2 className={`w-3.5 h-3.5 shrink-0 ${isPro ? "text-emerald-400" : "text-emerald-600"}`} />
                  <span>{plan.quotas.establishments}</span>
                </div>
                
                {/* 3 Caractéristiques majeures */}
                <div className="pt-2 space-y-1.5 border-t border-slate-100/10">
                  {plan.features.slice(2, 5).map((feat, fIdx) => (
                    <div
                      key={fIdx}
                      className={`text-[11px] leading-snug flex items-start gap-1.5 ${
                        isPro ? "text-slate-300" : "text-slate-600"
                      }`}
                    >
                      <Check className={`w-3 h-3 shrink-0 mt-0.5 ${isPro ? "text-emerald-400" : "text-emerald-600"}`} />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bouton d'Action direct de l'Offre */}
              <div className="pt-3">
                <button
                  type="button"
                  onClick={handleButtonClick}
                  className={`w-full h-11 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    isSelected
                      ? "bg-emerald-500 text-slate-950 shadow-md hover:bg-emerald-400 active:scale-[0.98]"
                      : isPro
                      ? "bg-white/10 hover:bg-white/20 text-white"
                      : "bg-slate-100 hover:bg-slate-200 text-[#0D1B3D]"
                  }`}
                >
                  {isSelected ? (
                    <>
                      <span>Continuer avec {plan.name}</span>
                      <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                    </>
                  ) : (
                    <>
                      <span>Choisir {plan.name}</span>
                      <ArrowRight className="w-3.5 h-3.5 opacity-60" />
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Barre d'action Principale */}
      <div className="pt-2 flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Retour</span>
        </button>

        <button
          type="button"
          onClick={onNext}
          className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl bg-[#0D1B3D] text-white font-bold text-sm hover:bg-slate-800 active:scale-[0.98] transition-all shadow-md shadow-slate-900/15 cursor-pointer"
        >
          <span>Continuer avec {currentPlan.name} ({currentPlan.price})</span>
          <ArrowRight className="w-4 h-4 text-slate-300" />
        </button>
      </div>
    </div>
  );
};
