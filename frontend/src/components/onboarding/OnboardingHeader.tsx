"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/ui/Logo";
import { Check, Loader2, AlertCircle, LogOut } from "lucide-react";

export type SaveStatus = "saved" | "saving" | "error" | "idle";

interface OnboardingHeaderProps {
  saveStatus: SaveStatus;
  currentStep?: number;
  totalSteps?: number;
  hasWorkspace?: boolean;
  onPause?: () => void;
}

export const OnboardingHeader: React.FC<OnboardingHeaderProps> = ({
  saveStatus,
  currentStep,
  totalSteps,
  hasWorkspace = false,
  onPause,
}) => {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-3.5 shrink-0 shadow-2xs">
      <div className="max-w-[1440px] mx-auto flex items-center justify-between gap-4">
        {/* Left: Zadesk Brand Logo & Title */}
        <div className="flex items-center gap-3.5 min-w-0">
          <Link href={hasWorkspace ? "/app" : "/"} className="shrink-0 hover:opacity-90 transition-opacity">
            <Logo size="sm" isDark={false} showText={true} />
          </Link>

          <div className="h-5 w-px bg-slate-200 hidden sm:block shrink-0" />

          <div className="hidden sm:flex items-center gap-2 min-w-0">
            {currentStep && totalSteps ? (
              <span className="text-xs font-semibold text-slate-700 truncate">
                Étape {currentStep} sur {totalSteps}
              </span>
            ) : (
              <span className="text-xs font-semibold text-slate-700 truncate">
                Création de votre espace
              </span>
            )}
          </div>
        </div>

        {/* Right: Auto-Save status & Pause button */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-50 border border-slate-200/80">
            {saveStatus === "saving" && (
              <>
                <Loader2 className="w-3 h-3 text-slate-500 animate-spin" />
                <span className="text-slate-500">Enregistrement...</span>
              </>
            )}
            {saveStatus === "saved" && (
              <>
                <Check className="w-3 h-3 text-emerald-600 stroke-[2.5]" />
                <span className="text-slate-600 hidden xs:inline">Brouillon sauvegardé</span>
                <span className="text-slate-600 xs:hidden">Sauvegardé</span>
              </>
            )}
            {saveStatus === "error" && (
              <>
                <AlertCircle className="w-3 h-3 text-rose-500" />
                <span className="text-rose-600">Erreur réseau</span>
              </>
            )}
            {saveStatus === "idle" && (
              <span className="text-slate-400">Prêt</span>
            )}
          </div>

          <button
            type="button"
            onClick={onPause || (() => router.push(hasWorkspace ? "/app" : "/"))}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 shadow-2xs transition-colors cursor-pointer"
            title="Quitter et reprendre ultérieurement"
          >
            <LogOut className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Reprendre plus tard</span>
            <span className="sm:hidden">Quitter</span>
          </button>
        </div>
      </div>
    </header>
  );
};
