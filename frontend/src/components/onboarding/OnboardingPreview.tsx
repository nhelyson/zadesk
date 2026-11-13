"use client";

import React, { useMemo } from "react";
import { resolveCompanyBrandPalette, getBrandCssVariables } from "@/lib/brandTheme";
import { CompanyPublicHeader } from "@/components/public/CompanyPublicHeader";
import { CompanyHeroCard } from "@/components/public/CompanyHeroCard";
import {
  MessageSquare,
  Paperclip,
  Send,
  Building2,
  ExternalLink,
  Wifi,
  Battery,
} from "lucide-react";

export interface OnboardingPreviewData {
  companyName: string;
  slug: string;
  sector: string;
  description?: string;
  city?: string;
  country?: string;
  supportWhatsApp?: string;
  supportPhone?: string;
  supportEmail?: string;
  website?: string;
  openingHours?: string;
  supportCategories?: string[];
  brandPrimaryColor?: string;
  hasExistingSav?: string | null;
}

interface OnboardingPreviewProps {
  data: OnboardingPreviewData;
  className?: string;
}

export const OnboardingPreview: React.FC<OnboardingPreviewProps> = ({
  data,
  className = "",
}) => {
  const displayName = data.companyName?.trim() || "Nom de votre entreprise";
  const displaySlug = data.slug?.trim() || "votre-espace";
  const displaySector = data.sector?.trim() || "Commerce et boutique";

  // Derive responsive brand palette via the official engine
  const brandPalette = useMemo(() => {
    return resolveCompanyBrandPalette({
      slug: displaySlug,
      name: displayName,
      category: displaySector,
      brandColor: data.brandPrimaryColor,
    });
  }, [displaySlug, displayName, displaySector, data.brandPrimaryColor]);

  const brandStyles = useMemo(() => {
    return getBrandCssVariables(brandPalette);
  }, [brandPalette]);

  const cleanWhatsAppNumber = data.supportWhatsApp
    ? data.supportWhatsApp.replace(/[^0-9+]/g, "").trim()
    : "";

  return (
    <div
      style={brandStyles}
      className={`relative select-none transition-all duration-300 ${className}`}
    >
      {/* 
        CHÂSSIS DU SMARTPHONE GÉNÉRIQUE HAUTE FINITION
        - Pas de logo ni de marque commerciale
        - Finition titane ardoise sombre avec biseau subtil
        - Boutons physiques latéraux discrets
        - Défilement vertical indépendant à l'intérieur de l'écran
      */}
      <div className="relative mx-auto w-full max-w-[360px] sm:max-w-[380px] h-[620px] sm:h-[700px] bg-slate-950 rounded-[44px] sm:rounded-[48px] p-2.5 sm:p-3 shadow-[0_25px_60px_-15px_rgba(13,27,61,0.22),0_0_0_1px_rgba(255,255,255,0.08),0_10px_20px_-5px_rgba(0,0,0,0.15)] ring-1 ring-slate-800">
        {/* Boutons latéraux physiques gauche (Volume) */}
        <div
          aria-hidden="true"
          className="absolute -left-[3px] top-24 w-[3px] h-7 bg-slate-700/80 rounded-l-xs"
        />
        <div
          aria-hidden="true"
          className="absolute -left-[3px] top-36 w-[3px] h-7 bg-slate-700/80 rounded-l-xs"
        />

        {/* Bouton latéral physique droit (Alimentation) */}
        <div
          aria-hidden="true"
          className="absolute -right-[3px] top-28 w-[3px] h-11 bg-slate-700/80 rounded-r-xs"
        />

        {/* Écran Intérieur Réaliste */}
        <div className="relative w-full h-full rounded-[34px] sm:rounded-[38px] overflow-hidden flex flex-col bg-[#F5F5F7] text-[#1D1D1F]">
          {/* Barre de Statut Mobile Générique avec Poinçon Caméra Discret */}
          <div className="relative z-30 pt-2 pb-1 px-5 bg-white/95 backdrop-blur-md flex items-center justify-between text-[11px] font-semibold text-slate-800 shrink-0 border-b border-black/[0.04]">
            {/* Heure indicatrice neutre */}
            <span className="font-mono text-[10px] tracking-tight text-slate-700">12:30</span>

            {/* Poinçon Caméra Frontale Générique Centré */}
            <div className="absolute left-1/2 -translate-x-1/2 top-2.5 flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-950 ring-1 ring-slate-800/80" />
            </div>

            {/* Icônes Système Génériques (Réseau + Batterie) */}
            <div className="flex items-center gap-1.5 text-slate-600">
              <Wifi className="w-3 h-3 text-slate-700" />
              <div className="w-4 h-2 rounded-[3px] border border-slate-700 p-0.5 flex items-center">
                <div className="w-full h-full bg-slate-700 rounded-[1px]" />
              </div>
            </div>
          </div>

          {/* En-tête Public Réel Zadesk */}
          <CompanyPublicHeader
            name={displayName}
            category={displaySector}
            verified={false}
            statusBadge={null}
            humanAvailabilityText={null}
            isPreview={true}
          />

          {/* 
            ZONE DÉFILANTE AUTONOME
            L'utilisateur explore la future page publique sans déplacer la page d'onboarding
          */}
          <div
            tabIndex={0}
            role="region"
            aria-label="Aperçu interactif de votre page publique"
            className="flex-1 overflow-y-auto px-3.5 py-3 space-y-3 focus:outline-none [scrollbar-width:thin] [scrollbar-color:#CBD5E1_transparent] [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full"
          >
            {/* Hero Card Officielle de la Page Publique */}
            <CompanyHeroCard
              name={displayName}
              category={displaySector}
              city={data.city}
              country={data.country}
              description={data.description}
              isCompact={true}
              verified={false}
              availabilityText={null}
            />

            {/* Bulle d'Accueil Réelle du Service Client */}
            <div className="flex flex-col items-start space-y-1">
              <div className="flex items-center gap-1.5 px-1 text-[10.5px] font-semibold text-[#1D1D1F]">
                <Building2 className="w-3 h-3 text-slate-500 shrink-0" />
                <span className="truncate">Service Client • {displayName}</span>
              </div>

              <div
                className="w-full p-3.5 rounded-2xl rounded-tl-xs border shadow-[0_2px_8px_rgba(0,0,0,0.02)] text-xs leading-relaxed"
                style={{
                  backgroundColor: "var(--company-surface, #FFFFFF)",
                  borderColor: "var(--company-surface-border, rgba(0,0,0,0.06))",
                  borderLeftWidth: "3.5px",
                  borderLeftColor: "var(--company-primary)",
                  color: "var(--company-text, #1D1D1F)",
                }}
              >
                <p className="whitespace-pre-line text-[11.5px]">
                  Bonjour et bienvenue sur l&apos;espace officiel de service client de{" "}
                  <strong className="font-semibold text-[#1D1D1F]">{displayName}</strong>.
                  {"\n\n"}
                  Vous pouvez nous détailler votre question, exprimer une réclamation ou demander une assistance technique. Notre équipe prendra directement en charge votre dossier.
                </p>
              </div>
            </div>

            {/* Canal WhatsApp Professionnel (affiché uniquement si renseigné) */}
            {cleanWhatsAppNumber && (
              <div className="p-3 rounded-2xl bg-white border border-black/[0.06] shadow-2xs flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                    <MessageSquare className="w-4 h-4 fill-current" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-[#1D1D1F]">WhatsApp professionnel</p>
                    <p className="text-[11px] font-mono text-[#86868B] truncate">
                      {cleanWhatsAppNumber}
                    </p>
                  </div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-[#86868B] shrink-0" />
              </div>
            )}

            {/* Motifs Fréquents Réels */}
            <div className="space-y-1.5 pt-0.5">
              <p className="text-[9.5px] font-semibold uppercase tracking-wider text-[#86868B] px-0.5">
                Motifs fréquents :
              </p>
              <div className="flex flex-wrap gap-1.5">
                {[
                  "📦 Suivi de commande",
                  "🛠️ Assistance",
                  "💬 Parler à un conseiller",
                ].map((chip, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-white border border-black/[0.06] text-slate-700 shadow-2xs"
                  >
                    {chip}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Compositeur de Message Inférieur */}
          <footer className="p-2.5 bg-white/90 backdrop-blur-md border-t border-black/[0.05] shrink-0">
            <div className="flex items-center justify-between gap-2 p-1.5 rounded-2xl bg-[#F5F5F7] border border-black/[0.06] shadow-2xs">
              <div className="flex items-center gap-2 min-w-0 pl-1.5 flex-1">
                <Paperclip className="w-3.5 h-3.5 text-[#86868B] shrink-0" />
                <span className="text-xs text-[#86868B] truncate select-none">
                  Écrire un message...
                </span>
              </div>

              <div
                className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0 shadow-2xs"
                style={{
                  backgroundColor: "var(--company-primary)",
                  color: "var(--company-contrast)",
                }}
              >
                <Send className="w-3 h-3" />
              </div>
            </div>

            {/* Indicateur de geste inférieur discret */}
            <div className="w-24 h-1 bg-slate-300/80 rounded-full mx-auto mt-2" />
          </footer>
        </div>
      </div>
    </div>
  );
};
