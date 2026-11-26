"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  CheckCircle2, 
  CreditCard, 
  Smartphone, 
  ArrowRight, 
  ShieldCheck, 
  Info, 
  Loader2,
  Lock,
  AlertCircle
} from "lucide-react";
import { apiRequest } from "@/lib/api";

export interface Step4CommercialRecapProps {
  companyName: string;
  planId: string;
  planName: string;
  priceXaf: number;
  workspaceId?: string;
  workspaceSlug?: string;
  onContinueToWorkspace: () => void;
}

export const Step4CommercialRecap: React.FC<Step4CommercialRecapProps> = ({
  companyName,
  planId,
  planName,
  priceXaf,
  workspaceId,
  workspaceSlug,
  onContinueToWorkspace,
}) => {
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const formattedPrice = new Intl.NumberFormat("fr-FR").format(priceXaf);

  const handleProceedToSasPay = async () => {
    setErrorMessage(null);
    setIsRedirecting(true);

    try {
      // Résolution du workspaceId actif si non passé directement
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

      const res = await apiRequest("/commercial/upgrade/checkout-session", {
        method: "POST",
        body: JSON.stringify({
          workspaceId: resolvedWorkspaceId,
          targetPlanId: planId.toUpperCase(),
          returnUrl,
        }),
      });

      const checkoutUrl = res.data?.checkoutUrl || (res as any).checkoutUrl;

      if (res.success && checkoutUrl) {
        // Redirection sécurisée vers la page de paiement hébergée par SasPay
        window.location.href = checkoutUrl;
      } else {
        throw new Error(
          res.message || "Impossible d'initialiser la session de paiement SasPay."
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
    <div className="space-y-6">
      {/* 1. Bannière de succès immédiat : Espace créé et Découverte active */}
      <div className="p-5 rounded-3xl bg-emerald-50/80 border border-emerald-200/90 text-emerald-950 flex items-start gap-4 shadow-xs">
        <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-xs">
          <CheckCircle2 className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <div className="text-sm font-bold tracking-tight text-emerald-900">
            Votre espace entreprise est prêt • Accès Découverte actif
          </div>
          <p className="text-xs leading-relaxed text-emerald-800">
            Votre espace <span className="font-semibold text-emerald-950">« {companyName} »</span> a été initialisé avec succès. Vous bénéficiez d&apos;ores et déjà de l&apos;accès gratuit Découverte en illimité.
          </p>
        </div>
      </div>

      {/* Message d'erreur éventuel */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs sm:text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-semibold">Paiement en ligne non disponible</div>
            <p className="text-rose-700">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* 2. Fiche Récapitulative Commerciale Contractuelle */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden divide-y divide-slate-100">
        
        {/* Entête du bon de commande / souscription */}
        <div className="p-6 sm:p-7 bg-[#FBFBFC]">
          <div className="flex items-center justify-between gap-4 mb-2">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500">
              Récapitulatif de souscription
            </span>
            <span className="font-mono text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800">
              Intention enregistrée
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[#0D1B3D] tracking-tight uppercase">
            Formule {planName}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Entreprise bénéficiaire : <span className="font-semibold text-slate-800">{companyName}</span>
          </p>
        </div>

        {/* Détail financier rigoureux sans artifice */}
        <div className="p-6 sm:p-7 space-y-4 text-xs sm:text-sm">
          
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <span className="text-slate-600">Abonnement mensuel {planName}</span>
            <span className="font-mono font-bold text-slate-900">{formattedPrice} FCFA</span>
          </div>

          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <span className="text-slate-600">Périodicité</span>
            <span className="font-medium text-slate-900">Mensuelle sans engagement</span>
          </div>

          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <span className="text-slate-600">Frais de mise en service</span>
            <span className="font-mono font-semibold text-emerald-700">0 FCFA (Offerts)</span>
          </div>

          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <span className="text-slate-600">Engagement de durée</span>
            <span className="font-medium text-slate-900">Aucun (résiliation libre)</span>
          </div>

          {/* Montant total à régler maintenant */}
          <div className="pt-2 flex items-baseline justify-between text-base sm:text-lg font-black text-[#0D1B3D]">
            <span>Total à régler aujourd&apos;hui</span>
            <div className="text-right">
              <span className="font-mono text-2xl sm:text-3xl text-emerald-700">{formattedPrice}</span>
              <span className="font-mono text-xs sm:text-sm text-slate-500 ml-1.5 font-normal">FCFA (XAF)</span>
            </div>
          </div>

        </div>

        {/* Moyens de paiement disponibles */}
        <div className="p-6 sm:p-7 bg-slate-50/60 space-y-3">
          <span className="text-xs font-semibold text-slate-700 block">
            Moyens de paiement acceptés en zone CEMAC :
          </span>
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
            <div className="px-3 py-2 rounded-xl bg-white border border-slate-200/90 font-medium inline-flex items-center gap-2">
              <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
              <span>Airtel Money Congo</span>
            </div>
            <div className="px-3 py-2 rounded-xl bg-white border border-slate-200/90 font-medium inline-flex items-center gap-2">
              <Smartphone className="w-3.5 h-3.5 text-amber-500" />
              <span>MTN Mobile Money Congo</span>
            </div>
            <div className="px-3 py-2 rounded-xl bg-white border border-slate-200/90 font-medium inline-flex items-center gap-2">
              <CreditCard className="w-3.5 h-3.5 text-[#0D1B3D]" />
              <span>Cartes bancaires (Visa / Mastercard)</span>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Paiement sécurisé par SasPay CEMAC. Vos fonds sont traités directement sans conservation de coordonnées bancaires sur Zadesk.
          </p>
        </div>

      </div>

      {/* 3. Garantie fondamentale de non-blocage de l'espace */}
      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 flex items-start gap-3 text-xs text-slate-600 leading-relaxed">
        <Info className="w-4 h-4 text-[#0D1B3D] shrink-0 mt-0.5" />
        <span>
          <strong className="text-slate-900">Règle de continuité :</strong> Si vous choisissez de différer ce règlement, votre espace reste immédiatement accessible en offre Découverte. Vous conservez toutes vos données et vos accès sans aucun blocage.
        </span>
      </div>

      {/* 4. Actions Explicites */}
      <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Action Secondaire : Découverte immédiate sans payer */}
        <button
          type="button"
          onClick={onContinueToWorkspace}
          disabled={isRedirecting}
          style={{ touchAction: "manipulation" }}
          className="w-full sm:w-auto order-2 sm:order-1 h-12 px-5 rounded-xl border border-slate-300 hover:border-slate-400 text-slate-700 hover:text-slate-950 font-semibold text-xs sm:text-sm inline-flex items-center justify-center gap-2 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
        >
          <span>Accéder à mon espace en Découverte</span>
        </button>

        {/* Action Principale : Passer au paiement SasPay réel */}
        <button
          type="button"
          onClick={handleProceedToSasPay}
          disabled={isRedirecting}
          style={{ touchAction: "manipulation" }}
          className="w-full sm:w-auto order-1 sm:order-2 h-12 px-7 rounded-xl bg-[#0D1B3D] hover:bg-slate-900 active:scale-[0.98] text-white font-bold text-sm inline-flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-slate-900/10 disabled:opacity-50"
        >
          {isRedirecting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Initialisation SasPay sécurisée...</span>
            </>
          ) : (
            <>
              <Lock className="w-4 h-4 text-emerald-400" />
              <span>Procéder au paiement ({formattedPrice} FCFA)</span>
              <ArrowRight className="w-4 h-4 text-slate-300" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
