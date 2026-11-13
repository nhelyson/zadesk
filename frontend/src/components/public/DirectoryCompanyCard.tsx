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
} from "lucide-react";

interface DirectoryCompanyCardProps {
  company: PublicCompany;
  index?: number;
  layoutVariant?: "auto" | "featured" | "standard" | "typographic";
}

// Icônes de secteur sobres
const SECTOR_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  "Alimentation et restauration": UtensilsCrossed,
  "Transport et livraison": Truck,
  "Commerce et boutique": Store,
  "Technologie et informatique": Laptop,
  "Autre": Building2,
};

export function DirectoryCompanyCard({
  company,
  index = 0,
  layoutVariant = "auto",
}: DirectoryCompanyCardProps) {
  // Purge stricte de tout terme "SAV" ou artéfact éventuel dans le nom pour respecter l'interdiction éditoriale
  const displayName = (company.name || "Entreprise")
    .replace(/\bSAV\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();

  const initial = displayName.charAt(0).toUpperCase() || "E";
  const locationText = [company.city, company.country].filter(Boolean).join(", ");
  const categoryName = company.category || "Autre";
  const SectorIcon = SECTOR_ICONS[categoryName] || Building2;
  const hasDescription = Boolean(company.description && company.description.trim().length > 0);
  const hasLogo = Boolean(company.logoUrl);

  // Détermination de la variante éditoriale
  let variant = layoutVariant;
  if (variant === "auto") {
    // Si l'entreprise a un logo et une description, et qu'elle se trouve à une position clé (ex: première ou 4ème)
    if (hasLogo && hasDescription && (index === 0 || index === 3)) {
      variant = "featured";
    } else if (hasLogo) {
      variant = "standard";
    } else {
      variant = "typographic";
    }
  }

  // 1. CARTE PHARE (FEATURED) : Format généreux 2 colonnes avec logo & description mise en valeur
  if (variant === "featured") {
    return (
      <article
        data-company-id={company.id}
        className="group relative bg-white rounded-3xl border border-slate-200/90 hover:border-slate-300 p-6 sm:p-7 transition-all duration-300 shadow-[0_4px_24px_-4px_rgba(13,27,61,0.04)] hover:shadow-[0_16px_36px_-6px_rgba(13,27,61,0.08)] col-span-1 md:col-span-2 flex flex-col justify-between overflow-hidden focus-within:ring-2 focus-within:ring-[#0D1B3D]"
      >
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
          {/* Vitrine Logo Généreuse */}
          <div className="sm:col-span-5 flex items-center justify-center">
            <Link
              href={`/entreprises/${company.slug}`}
              className="w-full aspect-[4/3] rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center p-6 group-hover:scale-[1.02] transition-transform duration-300 focus:outline-hidden"
              tabIndex={-1}
              aria-hidden="true"
            >
              <img
                src={company.logoUrl!}
                alt={`Logo ${displayName}`}
                className="w-full h-full object-contain filter drop-shadow-xs"
                loading="lazy"
              />
            </Link>
          </div>

          {/* Corps Éditorial */}
          <div className="sm:col-span-7 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-[11px] font-semibold tracking-wide">
                <SectorIcon className="w-3.5 h-3.5 text-slate-500" />
                <span>{categoryName}</span>
              </span>
              {locationText && (
                <span className="inline-flex items-center gap-1 text-xs text-slate-500 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{locationText}</span>
                </span>
              )}
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-[#0D1B3D] tracking-tight group-hover:text-emerald-700 transition-colors leading-snug">
              <Link
                href={`/entreprises/${company.slug}`}
                className="hover:underline focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#0D1B3D] rounded-sm"
              >
                {displayName}
              </Link>
            </h3>

            {company.description && (
              <p className="text-sm text-slate-600 leading-relaxed font-normal line-clamp-3">
                « {company.description} »
              </p>
            )}
          </div>
        </div>

        {/* Pied d'action */}
        <div className="pt-5 mt-5 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-600 font-medium">Enseigne répertoriée</span>
          <Link
            href={`/entreprises/${company.slug}`}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#0D1B3D] group-hover:text-emerald-600 transition-colors"
          >
            <span>Consulter la fiche</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </article>
    );
  }

  // 2. CARTE STANDARD : Pour les enseignes avec logo
  if (variant === "standard") {
    return (
      <article
        data-company-id={company.id}
        className="group relative bg-white rounded-3xl border border-slate-200/90 hover:border-slate-300 p-5 transition-all duration-300 shadow-[0_4px_20px_-4px_rgba(13,27,61,0.04)] hover:shadow-[0_14px_30px_-6px_rgba(13,27,61,0.08)] flex flex-col justify-between overflow-hidden focus-within:ring-2 focus-within:ring-[#0D1B3D]"
      >
        <div className="space-y-4">
          {/* Vitrine Logo */}
          <Link
            href={`/entreprises/${company.slug}`}
            className="w-full aspect-[16/10] rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center p-6 group-hover:scale-[1.01] transition-transform duration-300 focus:outline-hidden"
            tabIndex={-1}
            aria-hidden="true"
          >
            <img
              src={company.logoUrl!}
              alt={`Logo ${displayName}`}
              className="w-full h-full object-contain filter drop-shadow-xs"
              loading="lazy"
            />
          </Link>

          {/* Informations */}
          <div className="space-y-2 px-1">
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500">
                <SectorIcon className="w-3 h-3 text-slate-400" />
                <span>{categoryName}</span>
              </span>
              {locationText && (
                <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  <span>{company.city || locationText}</span>
                </span>
              )}
            </div>

            <h3 className="text-lg font-black text-slate-900 group-hover:text-emerald-700 transition-colors tracking-tight truncate leading-snug">
              <Link
                href={`/entreprises/${company.slug}`}
                className="hover:underline focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#0D1B3D] rounded-sm"
              >
                {displayName}
              </Link>
            </h3>

            {company.description && (
              <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                {company.description}
              </p>
            )}
          </div>
        </div>

        {/* Action */}
        <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-end">
          <Link
            href={`/entreprises/${company.slug}`}
            className="inline-flex items-center gap-1 text-xs font-bold text-[#0D1B3D] group-hover:text-emerald-600 transition-colors"
          >
            <span>Consulter la fiche</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </article>
    );
  }

  // 3. CARTE TYPOGRAPHIQUE / REGISTRE ARCHITECTURAL : Pour les enseignes sans logo
  // Présentation noble, ciselée, valorisant la marque sans artifices
  return (
    <article
      data-company-id={company.id}
      className="group relative bg-white rounded-3xl border border-slate-200/90 hover:border-slate-300 p-5 sm:p-6 transition-all duration-300 shadow-[0_4px_20px_-4px_rgba(13,27,61,0.04)] hover:shadow-[0_14px_30px_-6px_rgba(13,27,61,0.08)] flex flex-col justify-between overflow-hidden focus-within:ring-2 focus-within:ring-[#0D1B3D]"
    >
      <div className="space-y-4">
        {/* En-tête Monogramme & Secteur */}
        <div className="flex items-start justify-between gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#0D1B3D] text-white flex items-center justify-center font-black text-lg shadow-2xs group-hover:scale-105 transition-transform duration-300 select-none">
            {initial}
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-[11px] font-semibold">
            <SectorIcon className="w-3 h-3 text-slate-500" />
            <span>{categoryName}</span>
          </span>
        </div>

        {/* Titre & Localisation */}
        <div className="space-y-2 pt-1">
          <h3 className="text-lg sm:text-xl font-black text-slate-900 group-hover:text-emerald-700 transition-colors tracking-tight leading-snug">
            <Link
              href={`/entreprises/${company.slug}`}
              className="hover:underline focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#0D1B3D] rounded-sm"
            >
              {displayName}
            </Link>
          </h3>

          {locationText && (
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{locationText}</span>
            </div>
          )}

          {company.description ? (
            <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed">
              {company.description}
            </p>
          ) : (
            <p className="text-xs text-slate-500 italic">
              Établissement professionnel répertorié à {company.city || "Brazzaville"}.
            </p>
          )}
        </div>
      </div>

      {/* Action */}
      <div className="pt-4 mt-5 border-t border-slate-100 flex items-center justify-between">
        <span className="text-[11px] text-slate-600 font-medium">Fiche publique</span>
        <Link
          href={`/entreprises/${company.slug}`}
          className="inline-flex items-center gap-1 text-xs font-bold text-[#0D1B3D] group-hover:text-emerald-600 transition-colors"
        >
          <span>Consulter la fiche</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </article>
  );
}
