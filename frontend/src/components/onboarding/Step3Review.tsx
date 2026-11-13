"use client";

import React from "react";
import {
  Building2,
  MapPin,
  MessageSquare,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  ShieldCheck,
  Edit3,
  AlertCircle,
} from "lucide-react";

export interface Step3ReviewProps {
  companyName: string;
  sector: string;
  country: string;
  city: string;
  supportWhatsApp: string;
  generatedSlug: string;
  selectedPlan?: string;
  isSubmitting: boolean;
  submitError?: string | null;
  onGoToStep: (step: number) => void;
  onSubmit: () => void;
  onBack: () => void;
}

const COUNTRY_FLAGS: Record<string, string> = {
  Congo: "🇨🇬",
  Cameroun: "🇨🇲",
  Gabon: "🇬🇦",
  Tchad: "🇹🇩",
  Centrafrique: "🇨🇫",
  "Guinée Équatoriale": "🇬🇶",
  RDC: "🇨🇩",
};

export const Step3Review: React.FC<Step3ReviewProps> = ({
  companyName,
  sector,
  country,
  city,
  supportWhatsApp,
  generatedSlug,
  selectedPlan = "decouverte",
  isSubmitting,
  submitError,
  onGoToStep,
  onSubmit,
  onBack,
}) => {
  const flag = COUNTRY_FLAGS[country] || "📍";
  const displaySlug = generatedSlug || "votre-entreprise";

  const planTitles: Record<string, { name: string; price: string; isPaid: boolean }> = {
    decouverte: { name: "Découverte", price: "0 FCFA permanent", isPaid: false },
    starter: { name: "Starter", price: "10 000 FCFA / mois", isPaid: true },
    pro: { name: "Pro", price: "45 000 FCFA / mois", isPaid: true },
    entreprise: { name: "Entreprise", price: "150 000 FCFA / mois", isPaid: true },
  };

  const normPlan = (selectedPlan || "decouverte").toLowerCase();
  const currentPlan = planTitles[normPlan] || planTitles.decouverte;

  return (
    <div className="space-y-6">
      {/* Message d'erreur éventuel */}
      {submitError && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs sm:text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-semibold">Impossible de finaliser la création</div>
            <p className="text-rose-700">{submitError}</p>
          </div>
        </div>
      )}

      {/* Carte Récapitulative Structurée Sobre (sans capsules décoratives) */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm divide-y divide-slate-100 overflow-hidden">
        {/* Section 1 : Entreprise */}
        <div className="p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3 mb-2.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Entreprise
            </span>
            <button
              type="button"
              onClick={() => onGoToStep(1)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0D1B3D] hover:text-blue-700 hover:underline transition-all cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              Modifier
            </button>
          </div>

          <div className="space-y-1.5">
            <div className="text-lg sm:text-xl font-extrabold text-[#0D1B3D] tracking-tight">
              {companyName || "Nom non défini"}
            </div>
            <div className="text-xs sm:text-sm text-slate-500 font-medium">
              {sector || "Secteur non spécifié"}
            </div>

            <div className="pt-2">
              <div className="text-xs text-slate-500 font-mono">
                <span>Lien public : </span>
                <span className="text-[#0D1B3D] font-bold">
                  zadesk.com/entreprises/{displaySlug}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2 : Localisation & Contact */}
        <div className="p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Implantation & Contact
            </span>
            <button
              type="button"
              onClick={() => onGoToStep(2)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0D1B3D] hover:text-blue-700 hover:underline transition-all cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              Modifier
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div className="bg-slate-50/80 rounded-2xl p-3.5 border border-slate-100">
              <div className="text-[11px] text-slate-400 font-medium mb-1">Localisation</div>
              <div className="text-[#0D1B3D] font-bold text-xs sm:text-sm flex items-center gap-1.5">
                <span>{flag}</span>
                <span>{city ? `${city}, ${country}` : country}</span>
              </div>
            </div>

            <div className="bg-slate-50/80 rounded-2xl p-3.5 border border-slate-100">
              <div className="text-[11px] text-slate-400 font-medium mb-1">Canal WhatsApp</div>
              <div className="text-[#0D1B3D] font-bold text-xs sm:text-sm flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                {supportWhatsApp.trim() ? (
                  <span className="font-mono">{supportWhatsApp}</span>
                ) : (
                  <span className="text-slate-400 font-normal italic text-xs">
                    Non renseigné (optionnel)
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Section 3 : Formule Tarifaire Choisi */}
        <div className="p-5 sm:p-6 bg-slate-50/40">
          <div className="flex items-center justify-between gap-3 mb-2.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Offre commerciale sélectionnée
            </span>
            <a
              href="/tarifs"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:underline transition-all cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              Modifier l&apos;offre
            </a>
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
            <div className="space-y-0.5">
              <div className="font-bold text-sm text-[#0D1B3D] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Formule {currentPlan.name}</span>
              </div>
              <p className="text-xs text-slate-500">
                {currentPlan.isPaid ? "Facturation mensuelle sans engagement" : "Offre permanente gratuite"}
              </p>
            </div>
            <div className="text-right">
              <span className="font-mono font-bold text-sm text-[#0D1B3D]">
                {currentPlan.price}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Note d'information claire et sobre */}
      <div className="p-4 rounded-2xl bg-slate-50/90 border border-slate-200/80 flex items-start gap-3 text-xs text-slate-600 leading-relaxed">
        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
        <span>
          {currentPlan.isPaid ? (
            <>Votre espace sera créé immédiatement avec l&apos;accès Découverte actif. Vous pourrez ensuite valider votre règlement mensuel sans aucun blocage.</>
          ) : (
            <>Votre espace de travail sera prêt instantanément. La formule Découverte est 100% gratuite et permanente sans carte requise.</>
          )}
        </span>
      </div>

      {/* Actions de validation Desktop */}
      <div className="pt-2 hidden sm:flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBack}
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors disabled:opacity-50 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Retour</span>
        </button>

        <button
          type="button"
          onClick={onSubmit}
          disabled={isSubmitting}
          className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl bg-[#0D1B3D] text-white font-bold text-sm hover:bg-slate-800 active:scale-[0.98] transition-all shadow-md shadow-slate-900/15 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Création de votre espace en cours...</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>
                {currentPlan.isPaid
                  ? "Créer mon espace & voir le récapitulatif"
                  : "Activer mon espace gratuitement"}
              </span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
