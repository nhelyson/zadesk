"use client";

import React, { useState } from "react";
import { CheckCircle2, Lock, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { apiRequest } from "@/lib/api";

export interface MobileStep5SasPayProps {
  companyName: string;
  planId: string;
  planName: string;
  priceXaf: number;
  workspaceId?: string;
  onContinueToWorkspace: () => void;
}

export const MobileStep5SasPay: React.FC<MobileStep5SasPayProps> = ({
  companyName,
  planId,
  planName,
  priceXaf,
  workspaceId,
  onContinueToWorkspace,
}) => {
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const formattedPrice = new Intl.NumberFormat("fr-FR").format(priceXaf);

  const handleProceedToSasPay = async () => {
    setErrorMessage(null);
    setIsRedirecting(true);

    try {
      const resolvedWorkspaceId =
        workspaceId ||
        (typeof window !== "undefined"
          ? localStorage.getItem("zadesk_active_workspace")
          : null);

      if (!resolvedWorkspaceId) {
        throw new Error(
          "Identifiant de l'espace de travail introuvable. Veuillez actualiser ou accéder à votre espace."
        );
      }

      const returnUrl = `${window.location.origin}/app/billing?session_id={CHECKOUT_SESSION_ID}&from=onboarding&plan=${planId.toLowerCase()}`;

      const res = await apiRequest<any>("/commercial/upgrade/checkout-session", {
        method: "POST",
        body: JSON.stringify({
          workspaceId: resolvedWorkspaceId,
          targetPlanId: planId.toUpperCase(),
          returnUrl,
        }),
      });

      const checkoutUrl = res?.data?.checkoutUrl || res?.checkoutUrl;

      if (res?.success && checkoutUrl) {
        window.location.href = checkoutUrl;
      } else {
        throw new Error(
          res?.message || "Impossible d'initialiser la session de paiement SasPay."
        );
      }
    } catch (err: any) {
      console.error("SasPay checkout initialization failed:", err);
      setErrorMessage(
        err.message ||
          "La passerelle de paiement SasPay est momentanément inaccessible. Votre espace reste disponible en Découverte."
      );
      setIsRedirecting(false);
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Success banner: Workspace initialized with Découverte plan */}
      <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200/90 text-emerald-950 flex items-start gap-3">
        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
        <div className="space-y-1 text-left">
          <p className="text-xs font-bold text-emerald-900 leading-snug">
            Espace créé • Accès Découverte actif
          </p>
          <p className="text-[11px] text-emerald-800 leading-relaxed">
            Votre espace <span className="font-semibold">{companyName}</span> est initialisé. Vous pouvez finaliser votre abonnement {planName} via SasPay.
          </p>
        </div>
      </div>

      {/* Error alert if SasPay fails */}
      {errorMessage && (
        <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <p className="leading-snug">{errorMessage}</p>
        </div>
      )}

      {/* Subscription summary card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 space-y-4 text-left shadow-2xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500">
            Bon de souscription
          </span>
          <span className="font-mono text-[11px] font-semibold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
            Intention enregistrée
          </span>
        </div>

        <div className="space-y-1">
          <h2 className="text-lg font-black text-[#0D1B3D]">Formule {planName}</h2>
          <p className="text-xs text-slate-500">
            Bénéficiaire : <span className="font-semibold text-slate-800">{companyName}</span>
          </p>
        </div>

        <div className="space-y-2.5 text-xs pt-1 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <span className="text-slate-600">Abonnement mensuel</span>
            <span className="font-mono font-bold text-slate-900">{formattedPrice} FCFA</span>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <span className="font-bold text-slate-900">Total à régler aujourd&apos;hui</span>
            <div className="text-right">
              <span className="font-mono text-xl font-black text-emerald-700">{formattedPrice}</span>
              <span className="font-mono text-[11px] text-slate-500 ml-1">FCFA</span>
            </div>
          </div>
        </div>

        <p className="text-[10.5px] text-slate-400 leading-relaxed pt-1">
          Paiement sécurisé par SasPay (Airtel Money, MTN Mobile Money et cartes bancaires).
        </p>

        {/* Proceed to SasPay Button */}
        <button
          type="button"
          onClick={handleProceedToSasPay}
          disabled={isRedirecting}
          className="w-full h-12 rounded-2xl bg-[#0D1B3D] text-white font-bold text-xs flex items-center justify-center gap-2 hover:bg-slate-800 active:scale-[0.98] transition-all touch-manipulation disabled:opacity-60 shadow-xs cursor-pointer"
        >
          {isRedirecting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Initialisation SasPay...</span>
            </>
          ) : (
            <>
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>Régler {formattedPrice} FCFA via SasPay</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-300" />
            </>
          )}
        </button>
      </div>

      {/* Free fallback / Skip to workspace */}
      <div className="text-center pt-1">
        <button
          type="button"
          onClick={onContinueToWorkspace}
          className="text-xs font-semibold text-slate-600 hover:text-slate-900 underline underline-offset-4 touch-manipulation active:scale-95"
        >
          Accéder à mon espace sans régler pour le moment
        </button>
      </div>
    </div>
  );
};
