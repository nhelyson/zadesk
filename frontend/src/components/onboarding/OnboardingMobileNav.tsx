"use client";

import React from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2 } from "lucide-react";

export interface OnboardingMobileNavProps {
  currentStep: number; // 1, 2, 3
  isSubmitting?: boolean;
  canProceed: boolean;
  customSubmitLabel?: string;
  onNext: () => void;
  onBack: () => void;
}

export const OnboardingMobileNav: React.FC<OnboardingMobileNavProps> = ({
  currentStep,
  isSubmitting = false,
  canProceed,
  customSubmitLabel,
  onNext,
  onBack,
}) => {
  return (
    <div
      className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-4 pt-3 transition-transform duration-200"
      style={{
        paddingBottom: "max(0.875rem, env(safe-area-inset-bottom, 0px))",
      }}
    >
      <div className="flex items-center gap-3 max-w-lg mx-auto">
        {currentStep > 1 && (
          <button
            type="button"
            onClick={onBack}
            disabled={isSubmitting}
            aria-label="Étape précédente"
            className="flex items-center justify-center w-12 h-12 rounded-xl border border-slate-200 text-slate-700 bg-slate-50 hover:bg-slate-100 active:scale-[0.97] transition-all disabled:opacity-40 shrink-0 touch-manipulation cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}

        <button
          type="button"
          onClick={onNext}
          disabled={!canProceed || isSubmitting}
          className={`flex-1 flex items-center justify-center gap-2 h-12 px-4 rounded-xl font-bold text-sm transition-all touch-manipulation active:scale-[0.98] cursor-pointer shadow-sm ${
            canProceed && !isSubmitting
              ? "bg-[#0D1B3D] text-white hover:bg-slate-800 shadow-slate-900/15"
              : "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
          }`}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Création en cours...</span>
            </>
          ) : currentStep === 3 ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{customSubmitLabel || "Activer mon espace"}</span>
            </>
          ) : (
            <>
              <span>Continuer</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
