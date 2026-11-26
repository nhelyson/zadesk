"use client";

import React from "react";
import { ArrowLeft, Check, Cloud, CloudOff, Loader2, X } from "lucide-react";
import { SaveStatus } from "../OnboardingHeader";

export interface MobileOnboardingTopBarProps {
  currentStep: number;
  totalSteps: number;
  saveStatus: SaveStatus;
  onBack: () => void;
  onPause: () => void;
}

export const MobileOnboardingTopBar: React.FC<MobileOnboardingTopBarProps> = ({
  currentStep,
  totalSteps,
  saveStatus,
  onBack,
  onPause,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-[#FAFAF8]/95 backdrop-blur-md border-b border-slate-200/80 px-4 pt-3 pb-2.5 transition-colors">
      {/* Top Row: Back button, Step progress label, Auto-save status, Pause/Exit */}
      <div className="flex items-center justify-between gap-2 max-w-lg mx-auto">
        <div className="flex items-center gap-2">
          {currentStep > 1 && currentStep < 5 && (
            <button
              type="button"
              onClick={onBack}
              aria-label="Étape précédente"
              className="w-9 h-9 rounded-full bg-white border border-slate-200/90 text-slate-700 flex items-center justify-center active:scale-95 transition-transform touch-manipulation shadow-2xs"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}

          <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-[#0D1B3D]">
            <span>0{currentStep}</span>
            <span className="text-slate-300">/</span>
            <span className="text-slate-400">0{totalSteps}</span>
          </div>
        </div>

        {/* Center/Right: Auto-save status pill */}
        <div className="flex items-center gap-2">
          <div className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 bg-white/80 border border-slate-200/70 px-2 py-0.5 rounded-full shadow-2xs">
            {saveStatus === "saving" && (
              <>
                <Loader2 className="w-3 h-3 text-[#0D1B3D] animate-spin" />
                <span>Sauvegarde...</span>
              </>
            )}
            {saveStatus === "saved" && (
              <>
                <Cloud className="w-3 h-3 text-emerald-600" />
                <span className="text-emerald-700">Enregistré</span>
              </>
            )}
            {saveStatus === "error" && (
              <>
                <CloudOff className="w-3 h-3 text-rose-500" />
                <span className="text-rose-600">Brouillon local</span>
              </>
            )}
            {saveStatus === "idle" && (
              <>
                <Cloud className="w-3 h-3 text-slate-400" />
                <span className="text-slate-500">Zadesk Cloud</span>
              </>
            )}
          </div>

          {/* Pause / Exit button */}
          <button
            type="button"
            onClick={onPause}
            aria-label="Reprendre plus tard"
            className="w-9 h-9 rounded-full bg-white border border-slate-200/90 text-slate-600 hover:text-slate-900 flex items-center justify-center active:scale-95 transition-transform touch-manipulation shadow-2xs text-xs font-semibold"
            title="Enregistrer et quitter"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Segmented Progress Bar */}
      <div className="flex items-center gap-1.5 mt-2.5 max-w-lg mx-auto" aria-hidden="true">
        {Array.from({ length: totalSteps }).map((_, idx) => {
          const stepNumber = idx + 1;
          const isDone = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;

          return (
            <div
              key={stepNumber}
              className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                isDone
                  ? "bg-emerald-500"
                  : isCurrent
                  ? "bg-[#0D1B3D]"
                  : "bg-slate-200/80"
              }`}
            />
          );
        })}
      </div>
    </header>
  );
};
