"use client";

import React from "react";
import { Check } from "lucide-react";

export interface OnboardingStepIndicatorProps {
  currentStep: number; // 1, 2, 3 or 4
  onStepClick?: (step: number) => void;
  maxAccessibleStep?: number;
  hasCommercialRecap?: boolean;
}

const BASE_STEPS = [
  { id: 1, label: "Entreprise", number: "01" },
  { id: 2, label: "Localisation & Contact", number: "02" },
  { id: 3, label: "Aperçu & Validation", number: "03" },
];

export const OnboardingStepIndicator: React.FC<OnboardingStepIndicatorProps> = ({
  currentStep,
  onStepClick,
  maxAccessibleStep = 1,
  hasCommercialRecap = false,
}) => {
  const steps = hasCommercialRecap || currentStep === 4
    ? [
        ...BASE_STEPS,
        { id: 4, label: "Récapitulatif", number: "04" },
      ]
    : BASE_STEPS;

  return (
    <nav aria-label="Étapes d'onboarding" className="w-full">
      <div className="flex items-center justify-between sm:justify-start gap-2 sm:gap-6">
        {steps.map((step, index) => {
          const isCurrent = step.id === currentStep;
          const isDone = step.id < currentStep;
          const isClickable = onStepClick && (isDone || step.id <= maxAccessibleStep);

          return (
            <React.Fragment key={step.id}>
              {index > 0 && (
                <div
                  className={`h-px w-4 sm:w-8 transition-colors duration-300 hidden xs:block ${
                    isDone ? "bg-emerald-500" : "bg-slate-200"
                  }`}
                />
              )}

              <button
                type="button"
                disabled={!isClickable}
                onClick={() => isClickable && onStepClick?.(step.id)}
                className={`group flex items-center gap-2 py-1 text-left transition-all ${
                  isClickable ? "cursor-pointer" : "cursor-default"
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold transition-all duration-200 ${
                    isCurrent
                      ? "bg-[#0D1B3D] text-white shadow-xs scale-105"
                      : isDone
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-300/80"
                      : "bg-slate-100 text-slate-400 border border-slate-200"
                  }`}
                >
                  {isDone ? (
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  ) : (
                    <span>{step.id}</span>
                  )}
                </div>

                <div className="hidden sm:block">
                  <span
                    className={`text-xs tracking-tight transition-colors ${
                      isCurrent
                        ? "font-bold text-[#0D1B3D]"
                        : isDone
                        ? "font-medium text-slate-700 hover:text-slate-900"
                        : "text-slate-400 font-normal"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              </button>
            </React.Fragment>
          );
        })}
      </div>
    </nav>
  );
};

