"use client";

import React from "react";
import { AlertCircle, Edit2, CheckCircle2 } from "lucide-react";
import { OnboardingPreview, OnboardingPreviewData } from "../OnboardingPreview";
import { PlanConfig } from "@/config/plans";

export interface MobileStep4ReviewProps {
  companyName: string;
  sector: string;
  country: string;
  city: string;
  supportWhatsApp: string;
  generatedSlug: string;
  selectedPlanConfig: PlanConfig;
  previewData: OnboardingPreviewData;
  submitError?: string | null;
  onGoToStep: (step: number) => void;
}

export const MobileStep4Review: React.FC<MobileStep4ReviewProps> = ({
  companyName,
  sector,
  country,
  city,
  supportWhatsApp,
  generatedSlug,
  selectedPlanConfig,
  previewData,
  submitError,
  onGoToStep,
}) => {
  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Title & subtitle */}
      <div className="space-y-1 text-left">
        <h1 className="text-xl font-extrabold text-[#0D1B3D] tracking-tight">
          Votre guichet public officiel
        </h1>
        <p className="text-xs text-slate-500 leading-relaxed">
          Voici le rendu exact de la page d&apos;accueil que vos clients consulteront pour échanger avec votre équipe.
        </p>
      </div>

      {/* Error alert if any */}
      {submitError && (
        <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <p className="font-medium leading-relaxed">{submitError}</p>
        </div>
      )}

      {/* Faithful Zadesk Public Desk Preview */}
      <div className="flex flex-col items-center">
        <div className="w-full flex items-center justify-between px-1 mb-1.5 text-[11px] font-semibold text-slate-400">
          <span>Aperçu interactif</span>
          <span className="font-mono text-slate-600 truncate max-w-[200px]">
            /{generatedSlug}
          </span>
        </div>

        <div className="w-full flex justify-center scale-[0.88] xs:scale-95 origin-top -mb-16 xs:-mb-10">
          <OnboardingPreview data={previewData} />
        </div>
      </div>

      {/* Summary card with edit shortcuts */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 space-y-3 shadow-2xs text-left">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <span className="text-xs font-bold text-[#0D1B3D] uppercase tracking-wider">
            Récapitulatif
          </span>
          <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Prêt à activer</span>
          </span>
        </div>

        <div className="space-y-2 text-xs divide-y divide-slate-50">
          <div className="flex items-center justify-between pt-1">
            <span className="text-slate-500">Entreprise</span>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-900">{companyName}</span>
              <button
                type="button"
                onClick={() => onGoToStep(1)}
                className="text-slate-400 hover:text-slate-700 p-0.5"
                title="Modifier"
              >
                <Edit2 className="w-3 h-3" />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-slate-500">Localisation</span>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-900">{city}, {country}</span>
              <button
                type="button"
                onClick={() => onGoToStep(2)}
                className="text-slate-400 hover:text-slate-700 p-0.5"
                title="Modifier"
              >
                <Edit2 className="w-3 h-3" />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-slate-500">Formule</span>
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#0D1B3D]">
                {selectedPlanConfig.name} ({selectedPlanConfig.price} FCFA)
              </span>
              <button
                type="button"
                onClick={() => onGoToStep(3)}
                className="text-slate-400 hover:text-slate-700 p-0.5"
                title="Modifier"
              >
                <Edit2 className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
