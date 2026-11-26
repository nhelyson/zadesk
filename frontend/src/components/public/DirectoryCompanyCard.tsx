"use client";

import React from "react";
import Link from "next/link";
import { PublicCompany } from "@/types/public";
import {
  MapPin,
  ArrowRight,
  Building2,
  Store,
  UtensilsCrossed,
  Truck,
  Laptop,
  CheckCircle2,
} from "lucide-react";

interface DirectoryCompanyCardProps {
  company: PublicCompany;
  index?: number;
}

const SECTOR_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  "Alimentation et restauration": UtensilsCrossed,
  "Transport et livraison": Truck,
  "Commerce et boutique": Store,
  "Technologie et informatique": Laptop,
  "Autre": Building2,
};

export function DirectoryCompanyCard({ company }: DirectoryCompanyCardProps) {
  const displayName = (company.name || "Entreprise")
    .replace(/\bSAV\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();

  const initial = displayName.charAt(0).toUpperCase() || "E";
  const locationText = [company.city, company.country].filter(Boolean).join(", ");
  const categoryName = company.category || "Autre";
  const SectorIcon = SECTOR_ICONS[categoryName] || Building2;
  const hasLogo = Boolean(company.logoUrl);

  return (
    <article
      data-company-id={company.id}
      className="group relative bg-white rounded-3xl border border-slate-200/90 hover:border-slate-300 p-5 sm:p-6 transition-all duration-200 shadow-sm hover:shadow-md flex flex-col justify-between overflow-hidden focus-within:ring-2 focus-within:ring-[#0D1B3D]"
    >
      <div className="space-y-4">
        {/* En-tête Logo ou Monogramme + Secteur */}
        {hasLogo ? (
          <Link
            href={`/entreprises/${company.slug}`}
            className="w-full aspect-[16/9] rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center p-5 group-hover:bg-slate-100/70 transition-colors focus:outline-none"
            tabIndex={-1}
            aria-hidden="true"
          >
            <img
              src={company.logoUrl!}
              alt={`Logo ${displayName}`}
              className="w-full h-full object-contain"
              loading="lazy"
            />
          </Link>
        ) : (
          <div className="flex items-center justify-between gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#0D1B3D] text-white flex items-center justify-center font-black text-lg select-none shrink-0">
              {initial}
            </div>
            {company.verified && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/80 text-[11px] font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Certifié</span>
              </span>
            )}
          </div>
        )}

        {/* Métadonnées Secteur & Localisation */}
        <div className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600">
              <SectorIcon className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span>{categoryName}</span>
            </span>

            {hasLogo && company.verified && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/80 text-[11px] font-semibold">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>Certifié</span>
              </span>
            )}
          </div>

          <h3 className="text-lg font-extrabold text-[#0D1B3D] group-hover:text-emerald-700 transition-colors tracking-tight leading-snug">
            <Link
              href={`/entreprises/${company.slug}`}
              className="hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0D1B3D] rounded-sm"
            >
              {displayName}
            </Link>
          </h3>

          {locationText && (
            <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
              <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span className="truncate">{locationText}</span>
            </div>
          )}

          {company.description ? (
            <p className="text-xs sm:text-[13px] text-slate-600 line-clamp-2 leading-relaxed">
              {company.description}
            </p>
          ) : (
            <p className="text-xs text-slate-500 leading-relaxed">
              Service client officiel disponible en ligne{company.city ? ` à ${company.city}` : ""}.
            </p>
          )}
        </div>
      </div>

      {/* Action */}
      <div className="pt-4 mt-5 border-t border-slate-100 flex items-center justify-between">
        <span className="text-xs text-slate-500 font-medium">Guichet SAV</span>
        <Link
          href={`/entreprises/${company.slug}`}
          className="inline-flex items-center gap-1.5 text-xs sm:text-[13px] font-bold text-[#0D1B3D] group-hover:text-emerald-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0D1B3D] rounded-md px-1"
        >
          <span>Contacter le SAV</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </article>
  );
}
