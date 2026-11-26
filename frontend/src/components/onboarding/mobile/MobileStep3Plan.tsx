"use client";

import React from "react";
import { Check, Star, Building2, Users } from "lucide-react";
import { OFFICIAL_PLANS_CONFIG, PlanConfig } from "@/config/plans";

export interface MobileStep3PlanProps {
  selectedPlan: string;
  onSelectPlan: (planId: string) => void;
}

export const MobileStep3Plan: React.FC<MobileStep3PlanProps> = ({
  selectedPlan,
  onSelectPlan,
}) => {
  const normSelected = (selectedPlan || "decouverte").toLowerCase().trim();
  const currentPlan =
    OFFICIAL_PLANS_CONFIG.find((p) => p.id === normSelected) ||
    OFFICIAL_PLANS_CONFIG[0];

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Title & subtitle */}
      <div className="space-y-1 text-left">
        <h1 className="text-xl font-extrabold text-[#0D1B3D] tracking-tight">
          Choisissez votre formule
        </h1>
        <p className="text-xs text-slate-500 leading-relaxed">
          Démarrez avec l&apos;offre permanente gratuite pour tester, ou activez une formule pour équiper vos conseillers.
        </p>
      </div>

      {/* Segmented plan switcher tabs (4 plans) */}
      <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100 rounded-2xl border border-slate-200/80">
        {OFFICIAL_PLANS_CONFIG.map((p) => {
          const isSelected = normSelected === p.id;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => onSelectPlan(p.id)}
              className={`py-2 px-1 rounded-xl text-center text-xs transition-all touch-manipulation active:scale-95 ${
                isSelected
                  ? "bg-[#0D1B3D] text-white font-bold shadow-xs"
                  : "text-slate-600 hover:text-slate-900 font-medium"
              }`}
            >
              <span className="block truncate">{p.name}</span>
              <span className="block text-[10px] opacity-75 truncate font-mono">
                {p.priceXaf > 0 ? `${p.priceXaf / 1000}k` : "0 F"}
              </span>
            </button>
          );
        })}
      </div>

      {/* Hero card of the active plan */}
      <div
        className={`rounded-3xl p-5 border text-left transition-all ${
          currentPlan.isPopular
            ? "bg-[#0D1B3D] text-white border-[#0D1B3D] shadow-lg shadow-[#0D1B3D]/15"
            : "bg-white text-[#0D1B3D] border-slate-200 shadow-2xs"
        }`}
      >
        {/* Header tag */}
        <div className="flex items-center justify-between gap-2 mb-3">
          {currentPlan.isPopular ? (
            <span className="inline-flex items-center gap-1 bg-emerald-500 text-slate-950 font-extrabold text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full">
              <Star className="w-3 h-3 fill-current" />
              <span>Recommandé</span>
            </span>
          ) : (
            <span
              className={`text-[10.5px] font-bold uppercase tracking-wider ${
                currentPlan.isPopular ? "text-slate-300" : "text-slate-400"
              }`}
            >
              Formule officielle
            </span>
          )}

          <span
            className={`text-xs font-mono font-bold ${
              currentPlan.isPopular ? "text-emerald-400" : "text-slate-600"
            }`}
          >
            {currentPlan.id === "entreprise" ? "Sur mesure" : currentPlan.periodLabel}
          </span>
        </div>

        {/* Plan name & price */}
        <div className="space-y-1 mb-3">
          <h2 className="text-2xl font-black tracking-tight">{currentPlan.name}</h2>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-mono font-black">
              {currentPlan.price}
            </span>
            <span
              className={`text-xs font-mono ${
                currentPlan.isPopular ? "text-slate-300" : "text-slate-500"
              }`}
            >
              FCFA {currentPlan.id === "decouverte" ? "permanent" : "/ mois"}
            </span>
          </div>
          <p
            className={`text-xs leading-relaxed ${
              currentPlan.isPopular ? "text-slate-300" : "text-slate-500"
            }`}
          >
            {currentPlan.tagline}
          </p>
        </div>

        {/* Quotas */}
        <div
          className={`p-3 rounded-2xl mb-4 space-y-1.5 text-xs ${
            currentPlan.isPopular
              ? "bg-white/10 text-slate-200"
              : "bg-slate-50 text-slate-700 border border-slate-100"
          }`}
        >
          <div className="flex items-center gap-2">
            <Users className="w-3.5 h-3.5 shrink-0 opacity-70" />
            <span className="font-medium truncate">{currentPlan.quotas.agents}</span>
          </div>
          <div className="flex items-center gap-2">
            <Building2 className="w-3.5 h-3.5 shrink-0 opacity-70" />
            <span className="font-medium truncate">{currentPlan.quotas.establishments}</span>
          </div>
        </div>

        {/* Features list */}
        <div className="space-y-2">
          <p
            className={`text-[11px] font-bold uppercase tracking-wider ${
              currentPlan.isPopular ? "text-slate-300" : "text-slate-400"
            }`}
          >
            Fonctionnalités incluses :
          </p>
          <ul className="space-y-1.5 text-xs">
            {currentPlan.features.slice(0, 5).map((feature, i) => (
              <li key={i} className="flex items-start gap-2">
                <Check
                  className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${
                    currentPlan.isPopular ? "text-emerald-400" : "text-emerald-600"
                  }`}
                />
                <span
                  className={currentPlan.isPopular ? "text-slate-200" : "text-slate-700"}
                >
                  {feature}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
