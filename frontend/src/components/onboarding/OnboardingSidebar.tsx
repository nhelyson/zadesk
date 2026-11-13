"use client";

import React from "react";
import {
  Building2,
  Tag,
  Users,
  PhoneCall,
  Palette,
  CheckCircle2,
  Check,
} from "lucide-react";

export interface OnboardingStepItem {
  id: number;
  title: string;
  shortDesc: string;
  icon: React.ElementType;
}

export const ONBOARDING_STEPS: OnboardingStepItem[] = [
  {
    id: 1,
    title: "Activité & Localisation",
    shortDesc: "Nom, domaine et ville",
    icon: Building2,
  },
  {
    id: 2,
    title: "Motifs d'accueil",
    shortDesc: "Demandes et questions fréquentes",
    icon: Tag,
  },
  {
    id: 3,
    title: "Organisation",
    shortDesc: "Équipe et disponibilité",
    icon: Users,
  },
  {
    id: 4,
    title: "Canaux de contact",
    shortDesc: "WhatsApp officiel et coordonnées",
    icon: PhoneCall,
  },
  {
    id: 5,
    title: "Apparence & Page",
    shortDesc: "Couleur et lien de votre page",
    icon: Palette,
  },
  {
    id: 6,
    title: "Récapitulatif & Déploiement",
    shortDesc: "Vérification et activation",
    icon: CheckCircle2,
  },
];

interface OnboardingSidebarProps {
  currentStep: number;
  onSelectStep: (stepId: number) => void;
  maxAccessibleStep: number;
}

export const OnboardingSidebar: React.FC<OnboardingSidebarProps> = ({
  currentStep,
  onSelectStep,
  maxAccessibleStep,
}) => {
  return (
    <nav
      aria-label="Progression de l'onboarding"
      className="w-full lg:w-64 xl:w-72 shrink-0 space-y-1.5"
    >
      <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 hidden lg:block">
        Étapes de configuration
      </div>

      <div className="flex lg:flex-col gap-1.5 overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
        {ONBOARDING_STEPS.map((step) => {
          const isDone = step.id < currentStep;
          const isCurrent = step.id === currentStep;
          const isAccessible = step.id <= maxAccessibleStep || isDone;
          const Icon = step.icon;

          return (
            <button
              key={step.id}
              type="button"
              disabled={!isAccessible}
              onClick={() => isAccessible && onSelectStep(step.id)}
              className={`flex items-center gap-3 w-full p-2.5 sm:p-3 rounded-2xl text-left transition-all shrink-0 lg:shrink cursor-pointer disabled:cursor-not-allowed ${
                isCurrent
                  ? "bg-white text-navy-900 font-bold border border-slate-200/90 shadow-xs"
                  : isDone
                  ? "text-slate-700 hover:bg-white/60 hover:text-navy-900 font-medium"
                  : "text-slate-400 opacity-60"
              }`}
            >
              {/* Step indicator circle / badge */}
              <div
                className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                  isCurrent
                    ? "bg-[#0D1B3D] text-white shadow-2xs"
                    : isDone
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-slate-200/80 text-slate-500"
                }`}
              >
                {isDone ? (
                  <Check className="w-3.5 h-3.5 text-emerald-700 stroke-[3]" />
                ) : (
                  <span>{step.id}</span>
                )}
              </div>

              {/* Step labels */}
              <div className="min-w-0 flex-1 hidden lg:block">
                <p className="text-xs font-bold truncate leading-snug">
                  {step.title}
                </p>
                <p className="text-[10px] text-slate-400 truncate font-normal mt-0.5">
                  {step.shortDesc}
                </p>
              </div>

              {/* Mobile text */}
              <span className="text-xs font-semibold lg:hidden whitespace-nowrap">
                {step.title}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
