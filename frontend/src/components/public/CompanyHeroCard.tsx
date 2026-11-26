"use client";

import React from "react";
import { Headphones, Clock, ShieldCheck, MapPin } from "lucide-react";

export interface CompanyHeroCardProps {
  name: string;
  logoUrl?: string | null;
  category?: string | null;
  city?: string | null;
  country?: string | null;
  description?: string | null;
  isCompact?: boolean;
  verified?: boolean;
  availabilityText?: string | null;
}

export const CompanyHeroCard: React.FC<CompanyHeroCardProps> = ({
  name,
  logoUrl,
  category,
  city,
  country,
  description,
  isCompact = false,
  verified = false,
  availabilityText = null,
}) => {
  const displayName = name?.trim() || "Nom de l'entreprise";
  const displayCategory = category?.trim() || "Service client";
  const locationText = [city, country].filter(Boolean).join(", ");

  return (
    <div
      className={`${
        isCompact ? "p-3.5 sm:p-4 rounded-2xl" : "p-4 sm:p-5 rounded-3xl"
      } border shadow-sm transition-all`}
      style={{
        backgroundColor: "var(--company-surface, #FFFFFF)",
        borderColor: "var(--company-surface-border, rgba(0,0,0,0.08))",
      }}
    >
      <div className="flex items-start gap-3.5">
        <div
          className={`${
            isCompact ? "w-9 h-9 rounded-xl" : "w-11 h-11 rounded-2xl"
          } flex items-center justify-center shrink-0 shadow-sm overflow-hidden`}
          style={{
            backgroundColor: "var(--company-primary)",
            color: "var(--company-contrast)",
          }}
        >
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={displayName}
              className="w-full h-full object-cover"
            />
          ) : (
            <Headphones className={isCompact ? "w-4 h-4" : "w-5 h-5"} />
          )}
        </div>

        <div className="space-y-1.5 flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className="px-2.5 py-0.5 rounded-full border text-[11px] font-semibold"
              style={{
                backgroundColor: "var(--company-secondary, #F1F5F9)",
                borderColor: "var(--company-surface-border, #E2E8F0)",
                color: "var(--company-text, #0F172A)",
              }}
            >
              {displayCategory}
            </span>
            {locationText && (
              <span className="inline-flex items-center gap-1 text-xs text-slate-600 font-medium">
                <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span className="truncate">{locationText}</span>
              </span>
            )}
          </div>

          <p className={`${isCompact ? "text-xs" : "text-xs sm:text-[13px]"} text-slate-600 leading-relaxed`}>
            {description || (
              <>
                Échangez directement avec les conseillers de{" "}
                <strong className="text-[#1D1D1F] font-semibold">{displayName}</strong> sur Zalisk pour toute question, réclamation ou suivi de dossier.
              </>
            )}
          </p>

          {(availabilityText || verified) && (
            <div className="pt-1 flex flex-wrap items-center gap-2.5 text-xs text-slate-600">
              {availabilityText && (
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span>{availabilityText}</span>
                </span>
              )}
              {availabilityText && verified && <span className="text-slate-300">•</span>}
              {verified && (
                <span className="inline-flex items-center gap-1.5 font-medium text-emerald-800">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Guichet vérifié</span>
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
