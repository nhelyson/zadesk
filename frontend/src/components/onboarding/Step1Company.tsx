"use client";

import React from "react";
import {
  Building2,
  Compass,
  ShoppingBag,
  UtensilsCrossed,
  HeartPulse,
  Briefcase,
  Truck,
  Laptop,
  Hammer,
  Check,
  Loader2,
  AlertCircle,
  ArrowRight,
} from "lucide-react";

export interface Step1CompanyProps {
  companyName: string;
  sector: string;
  nameAvailability: {
    checking: boolean;
    available?: boolean;
    reason?: string;
  };
  onUpdateField: (field: "companyName" | "sector", value: string) => void;
  onNext: () => void;
}

const ACTIVITY_SECTORS = [
  { id: "Commerce et boutique", label: "Commerce & Vente", icon: ShoppingBag },
  { id: "Alimentation et restauration", label: "Restauration & Alimentation", icon: UtensilsCrossed },
  { id: "Beauté et bien-être", label: "Santé, Beauté & Soins", icon: HeartPulse },
  { id: "Services", label: "Services & Conseil", icon: Briefcase },
  { id: "Transport et livraison", label: "Transport & Logistique", icon: Truck },
  { id: "Technologie et informatique", label: "Tech & Télécoms", icon: Laptop },
  { id: "Artisanat", label: "Artisanat & Atelier", icon: Hammer },
  { id: "Autre", label: "Autre organisation", icon: Building2 },
];

const NAME_SUGGESTIONS = [
  "Boutique Japhet",
  "Clinique Sainte-Marie",
  "Express Logistique",
  "Groupe Horizon",
];

export const Step1Company: React.FC<Step1CompanyProps> = ({
  companyName,
  sector,
  nameAvailability,
  onUpdateField,
  onNext,
}) => {
  const isNameValid = companyName.trim().length >= 2;
  const isAvailable = nameAvailability.available !== false;
  const canContinue = isNameValid && isAvailable && !nameAvailability.checking;

  return (
    <div className="space-y-6">
      {/* 1. Header de l'étape */}
      <div className="space-y-1.5 text-left">
        <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          <span>01</span>
          <span>•</span>
          <span>Identité de l&apos;espace</span>
        </div>
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-[#0D1B3D] tracking-tight">
          Votre entreprise ou organisation
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-xl">
          Ces informations déterminent le nom officiel de votre guichet et son identité visuelle.
        </p>
      </div>

      {/* 2. Champ : Nom de l'entreprise */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label
            htmlFor="company-name-input"
            className="text-xs font-bold text-slate-900 flex items-center gap-1.5"
          >
            <Building2 className="w-3.5 h-3.5 text-slate-500" />
            <span>Nom de l&apos;entreprise</span>
            <span className="text-rose-500">*</span>
          </label>

          {/* Validation d'état sobre (affichée uniquement lorsque pertinent) */}
          {companyName.trim().length >= 2 && (
            <div className="text-[11px]">
              {nameAvailability.checking && (
                <span className="text-slate-400 flex items-center gap-1">
                  <Loader2 className="w-2.5 h-2.5 animate-spin" />
                  <span>Vérification...</span>
                </span>
              )}
              {!nameAvailability.checking && nameAvailability.available === true && (
                <span className="text-emerald-700 font-medium flex items-center gap-1">
                  <Check className="w-3 h-3 text-emerald-600 stroke-[2.5]" />
                  <span>Nom disponible</span>
                </span>
              )}
              {!nameAvailability.checking && nameAvailability.available === false && (
                <span className="text-rose-600 font-medium flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 text-rose-500" />
                  <span>{nameAvailability.reason || "Déjà utilisé dans ce pays"}</span>
                </span>
              )}
            </div>
          )}
        </div>

        <div className="relative">
          <input
            id="company-name-input"
            type="text"
            required
            maxLength={50}
            value={companyName}
            onChange={(e) => onUpdateField("companyName", e.target.value)}
            placeholder="Ex : Boutique Japhet, Clinique Sainte-Marie..."
            className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-base sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0D1B3D] focus:ring-4 focus:ring-[#0D1B3D]/10 bg-white transition-all shadow-2xs"
          />
        </div>

        {/* Suggestions rapides discrètes */}
        {!companyName && (
          <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
            <span className="text-[11px] text-slate-400">Exemples :</span>
            {NAME_SUGGESTIONS.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => onUpdateField("companyName", suggestion)}
                className="text-[11px] px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200/80 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 3. Champ : Secteur d'activité — Sélection compacte & éditoriale */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-slate-500" />
            <span>Secteur d&apos;activité</span>
            <span className="text-rose-500">*</span>
          </label>
          <span className="text-[10px] text-slate-400">Pour adapter le guichet</span>
        </div>

        {/* Grille compacte et éditoriale (2 colonnes, haute lisibilité, zéro encombrement) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {ACTIVITY_SECTORS.map((s) => {
            const isSelected = sector === s.id;
            const Icon = s.icon;

            return (
              <button
                key={s.id}
                type="button"
                onClick={() => onUpdateField("sector", s.id)}
                className={`group flex items-center justify-between px-3.5 py-2.5 rounded-xl border text-left transition-all duration-150 cursor-pointer active:scale-[0.98] ${
                  isSelected
                    ? "bg-[#0D1B3D] border-[#0D1B3D] text-white shadow-xs"
                    : "bg-white hover:bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                      isSelected
                        ? "bg-white/15 text-white"
                        : "bg-slate-100 text-slate-500 group-hover:text-slate-800"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span
                    className={`text-xs font-medium truncate ${
                      isSelected ? "text-white font-semibold" : "text-slate-800"
                    }`}
                  >
                    {s.label}
                  </span>
                </div>

                <div
                  className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                    isSelected
                      ? "border-emerald-400 bg-emerald-500 text-white"
                      : "border-slate-300 bg-transparent"
                  }`}
                >
                  {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Bouton Continuer Desktop (La barre mobile gère le mobile) */}
      <div className="hidden lg:flex justify-end pt-3">
        <button
          type="button"
          disabled={!canContinue}
          onClick={onNext}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#0D1B3D] hover:bg-[#152C61] active:scale-[0.98] text-white font-bold text-sm transition-all shadow-[0_4px_16px_rgba(13,27,61,0.14)] hover:shadow-[0_8px_24px_rgba(13,27,61,0.22)] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          <span>Continuer</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

