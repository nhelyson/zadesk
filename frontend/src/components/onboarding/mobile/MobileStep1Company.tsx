"use client";

import React from "react";
import {
  Building2,
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
} from "lucide-react";

export interface MobileStep1CompanyProps {
  companyName: string;
  sector: string;
  nameAvailability: {
    checking: boolean;
    available?: boolean;
    reason?: string;
  };
  onUpdateField: (field: "companyName" | "sector", value: string) => void;
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

export const MobileStep1Company: React.FC<MobileStep1CompanyProps> = ({
  companyName,
  sector,
  nameAvailability,
  onUpdateField,
}) => {
  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Title & subtitle */}
      <div className="space-y-1 text-left">
        <h1 className="text-xl font-extrabold text-[#0D1B3D] tracking-tight">
          Votre entreprise ou organisation
        </h1>
        <p className="text-xs text-slate-500 leading-relaxed">
          Ces informations déterminent le nom officiel de votre guichet et son identité visuelle.
        </p>
      </div>

      {/* Input: Nom de l'entreprise */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label
            htmlFor="mobile-company-name-input"
            className="text-xs font-bold text-slate-900 flex items-center gap-1.5"
          >
            <Building2 className="w-3.5 h-3.5 text-slate-500" />
            <span>Nom de l&apos;entreprise</span>
            <span className="text-rose-500">*</span>
          </label>

          {/* Validation Feedback */}
          {companyName.trim().length >= 2 && (
            <div className="text-[11px]">
              {nameAvailability.checking && (
                <span className="text-slate-400 flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>Vérification...</span>
                </span>
              )}
              {!nameAvailability.checking && nameAvailability.available === true && (
                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                  <Check className="w-3 h-3 stroke-[2.5]" />
                  <span>Disponible</span>
                </span>
              )}
              {!nameAvailability.checking && nameAvailability.available === false && (
                <span className="text-rose-600 font-semibold flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>Déjà utilisé</span>
                </span>
              )}
            </div>
          )}
        </div>

        <input
          id="mobile-company-name-input"
          type="text"
          value={companyName}
          onChange={(e) => onUpdateField("companyName", e.target.value)}
          placeholder="Ex : Pharmacie Centrale, Express Livraisons..."
          autoCapitalize="words"
          autoCorrect="off"
          spellCheck="false"
          className="w-full h-12 px-3.5 rounded-2xl bg-white border border-slate-300 text-base text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0D1B3D]/15 focus:border-[#0D1B3D] transition-all shadow-2xs"
        />

        {/* Suggestion pills if input empty */}
        {companyName.trim().length === 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto py-1 [scrollbar-width:none]">
            <span className="text-[10px] text-slate-400 shrink-0 font-medium">Exemples :</span>
            {NAME_SUGGESTIONS.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => onUpdateField("companyName", suggestion)}
                className="px-2 py-0.5 rounded-lg bg-white border border-slate-200 text-[10.5px] text-slate-600 hover:text-slate-900 active:scale-95 shrink-0 transition-transform touch-manipulation font-medium shadow-2xs"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}

        {/* Error message if unavailable */}
        {!nameAvailability.checking && nameAvailability.available === false && nameAvailability.reason && (
          <p className="text-[11px] text-rose-600 leading-snug">
            {nameAvailability.reason}
          </p>
        )}
      </div>

      {/* Grid: Secteur d'activité */}
      <div className="space-y-2 pt-1">
        <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
          <span>Secteur d&apos;activité</span>
          <span className="text-rose-500">*</span>
        </label>

        <div className="grid grid-cols-2 gap-2">
          {ACTIVITY_SECTORS.map((s) => {
            const Icon = s.icon;
            const isSelected = sector === s.id;

            return (
              <button
                key={s.id}
                type="button"
                onClick={() => onUpdateField("sector", s.id)}
                className={`p-2.5 rounded-2xl border text-left flex items-start gap-2.5 transition-all touch-manipulation active:scale-[0.98] ${
                  isSelected
                    ? "bg-[#0D1B3D] text-white border-[#0D1B3D] shadow-xs"
                    : "bg-white text-slate-700 border-slate-200/90 hover:border-slate-300"
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
                    isSelected
                      ? "bg-white/15 text-emerald-400"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>

                <div className="min-w-0 flex-1 pt-0.5">
                  <p className="text-[11.5px] font-bold leading-tight truncate">
                    {s.label}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
