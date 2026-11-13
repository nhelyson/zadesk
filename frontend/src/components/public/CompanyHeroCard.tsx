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
  const displayCategory = category?.trim() || "Assistance SAV";
  const locationText = [city, country].filter(Boolean).join(", ");

  return (
    <div
      className={`${
        isCompact ? "p-4 sm:p-5 rounded-2xl" : "p-6 rounded-3xl"
      } border shadow-[0_2px_12px_rgba(0,0,0,0.02)] transition-all`}
      style={{
        backgroundColor: "var(--company-surface, #FFFFFF)",
        borderColor: "var(--company-surface-border, rgba(0,0,0,0.06))",
      }}
    >
      <div className="flex items-start gap-3.5 sm:gap-4">
        {/* Monogram / Logo */}
        <div
          className={`${
            isCompact ? "w-10 h-10 rounded-xl" : "w-12 h-12 rounded-2xl"
          } flex items-center justify-center shrink-0 shadow-xs overflow-hidden`}
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

        {/* Info */}
        <div className="space-y-1.5 flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <h2 className={`${isCompact ? "text-sm" : "text-base sm:text-lg"} font-semibold tracking-tight text-[#1D1D1F]`}>
              Service Client Officiel
            </h2>
            <span
              className="px-2.5 py-0.5 rounded-full border text-[10px] font-medium"
              style={{
                backgroundColor: "var(--company-secondary, #F1F5F9)",
                borderColor: "var(--company-surface-border, #E2E8F0)",
                color: "var(--company-text, #0F172A)",
              }}
            >
              {displayCategory}
            </span>
          </div>

          <p className={`${isCompact ? "text-xs" : "text-xs sm:text-[13px]"} text-[#86868B] leading-relaxed`}>
            {description || (
              <>
                Espace d&apos;assistance officiel de <strong className="text-[#1D1D1F] font-semibold">{displayName}</strong>. Vos demandes sont transmises directement aux conseillers de l&apos;entreprise pour un traitement rapide et personnalisé.
              </>
            )}
          </p>

          {locationText && (
            <div className="flex items-center gap-1 text-[11px] text-[#86868B] pt-0.5">
              <MapPin className="w-3 h-3 text-[#86868B] shrink-0" />
              <span className="truncate">{locationText}</span>
            </div>
          )}

          {(availabilityText || verified) && (
            <div className="pt-1.5 flex flex-wrap items-center gap-2.5 sm:gap-3 text-[11px] text-[#86868B]">
              {availabilityText && (
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#86868B] shrink-0" />
                  <span>{availabilityText}</span>
                </span>
              )}
              {availabilityText && verified && <span className="text-black/20">•</span>}
              {verified && (
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Canal certifié</span>
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
