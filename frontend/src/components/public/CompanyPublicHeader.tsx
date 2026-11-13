"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  PanelRightClose,
  PanelRightOpen,
} from "lucide-react";

export interface CompanyPublicHeaderProps {
  name: string;
  logoUrl?: string | null;
  category?: string | null;
  verified?: boolean;
  statusBadge?: {
    dotColor: string;
    textColor: string;
    label: string;
  } | null;
  humanAvailabilityText?: string | null;
  showContextPanel?: boolean;
  onToggleContextPanel?: () => void;
  onOpenDrawer?: () => void;
  isPreview?: boolean;
  backHref?: string;
}

export const CompanyPublicHeader: React.FC<CompanyPublicHeaderProps> = ({
  name,
  logoUrl,
  category,
  verified = false,
  statusBadge = null,
  humanAvailabilityText = null,
  showContextPanel = false,
  onToggleContextPanel,
  onOpenDrawer,
  isPreview = false,
  backHref = "/entreprises",
}) => {
  const displayName = name?.trim() || "Nom de l'entreprise";
  const initial = displayName.charAt(0).toUpperCase() || "E";

  return (
    <header
      className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-black/[0.06] px-3 sm:px-6 py-2.5 sm:py-3 shrink-0 shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-all"
      style={{
        paddingLeft: isPreview ? "0.75rem" : "max(0.75rem, env(safe-area-inset-left, 0px))",
        paddingRight: isPreview ? "0.75rem" : "max(0.75rem, env(safe-area-inset-right, 0px))",
      }}
    >
      <div className={`w-full ${isPreview ? "" : "max-w-7xl mx-auto"} flex items-center justify-between gap-2 sm:gap-3`}>
        {/* Left: Back Link + Company Identity */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {!isPreview ? (
            <Link
              href={backHref}
              className="inline-flex items-center justify-center gap-1.5 p-2 sm:px-3 sm:py-1.5 rounded-full text-slate-600 hover:text-slate-900 bg-black/[0.03] hover:bg-black/[0.06] active:scale-95 transition-all shrink-0"
              title="Retour à l'annuaire des entreprises"
            >
              <ArrowLeft className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
              <span className="text-xs font-medium hidden md:inline">Annuaire SAV</span>
            </Link>
          ) : (
            <div
              className="inline-flex items-center justify-center p-1.5 rounded-full text-slate-400 bg-black/[0.03] shrink-0"
              title="Guichet SAV"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
            </div>
          )}

          <div className="h-4 w-px bg-black/[0.08] hidden sm:block shrink-0" />

          {/* Logo / Monogram */}
          <div
            className={`${
              isPreview ? "w-8 h-8 text-xs" : "w-9 h-9 sm:w-10 sm:h-10 text-sm"
            } rounded-2xl bg-white border shadow-[0_2px_8px_rgba(0,0,0,0.04)] flex items-center justify-center overflow-hidden shrink-0 transition-transform`}
            style={{ borderColor: "var(--company-surface-border, rgba(0,0,0,0.08))" }}
          >
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={displayName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center font-bold"
                style={{
                  backgroundColor: "var(--company-primary)",
                  color: "var(--company-contrast)",
                }}
              >
                {initial}
              </div>
            )}
          </div>

          {/* Titles & Real-Time Status */}
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <h1
                className={`${
                  isPreview ? "text-xs font-bold" : "text-xs sm:text-base font-semibold"
                } tracking-tight text-[#1D1D1F] truncate ${
                  isPreview ? "max-w-[130px] sm:max-w-[170px]" : "max-w-[120px] xs:max-w-[180px] sm:max-w-none"
                }`}
                title={displayName}
              >
                {displayName}
              </h1>

              {verified && (
                <span
                  className="inline-flex items-center gap-1 px-1.5 py-0.5 sm:px-2 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200/60 shrink-0"
                  title="Service client certifié Zadesk"
                >
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span className={isPreview ? "hidden" : "hidden sm:inline"}>Certifié</span>
                </span>
              )}

              <span
                className={`${
                  isPreview ? "hidden" : "hidden sm:inline-flex"
                } items-center px-2 py-0.5 rounded-full text-[10px] font-medium border shrink-0`}
                style={{
                  backgroundColor: "var(--company-secondary, #F1F5F9)",
                  borderColor: "var(--company-surface-border, #E2E8F0)",
                  color: "var(--company-text, #0F172A)",
                }}
              >
                SAV Officiel
              </span>
            </div>

            {statusBadge ? (
              <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-[11px] text-[#86868B] truncate mt-0.5">
                <span className="inline-flex items-center gap-1.5 truncate">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${statusBadge.dotColor}`} />
                  <span className={`font-medium ${statusBadge.textColor}`}>
                    {statusBadge.label}
                  </span>
                </span>
                {!isPreview && humanAvailabilityText && (
                  <>
                    <span className="hidden md:inline text-black/20">•</span>
                    <span className="hidden md:inline truncate text-[#86868B]" title={humanAvailabilityText}>
                      {humanAvailabilityText}
                    </span>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-[#86868B] truncate mt-0.5">
                <span className="truncate">{category || "Guichet SAV"}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {!isPreview ? (
            <>
              {/* Desktop: Toggle Context Panel */}
              {onToggleContextPanel && (
                <button
                  type="button"
                  onClick={onToggleContextPanel}
                  className="hidden lg:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border text-xs font-medium transition-all active:scale-95 cursor-pointer"
                  style={{
                    backgroundColor: showContextPanel
                      ? "var(--company-secondary, rgba(0,0,0,0.04))"
                      : "rgba(0,0,0,0.04)",
                    borderColor: "var(--company-surface-border, rgba(0,0,0,0.06))",
                    color: showContextPanel ? "var(--company-text, #1D1D1F)" : "#1D1D1F",
                  }}
                  title={showContextPanel ? "Masquer les informations" : "Afficher les informations"}
                  aria-expanded={showContextPanel}
                >
                  {showContextPanel ? (
                    <>
                      <PanelRightClose className="w-3.5 h-3.5 text-[#86868B]" />
                      <span>Masquer détails</span>
                    </>
                  ) : (
                    <>
                      <PanelRightOpen className="w-3.5 h-3.5 text-[#86868B]" />
                      <span>Détails & Contacts</span>
                    </>
                  )}
                </button>
              )}

              {/* Mobile / Tablet: Open Slide-Over Drawer */}
              {onOpenDrawer && (
                <button
                  type="button"
                  onClick={onOpenDrawer}
                  className="lg:hidden inline-flex items-center gap-1 px-2.5 sm:px-3.5 py-2 sm:py-1.5 rounded-full border text-xs font-medium transition-all active:scale-95 cursor-pointer"
                  style={{
                    backgroundColor: "var(--company-secondary, rgba(0,0,0,0.04))",
                    borderColor: "var(--company-surface-border, rgba(0,0,0,0.06))",
                    color: "var(--company-text, #1D1D1F)",
                  }}
                >
                  <Building2 className="w-3.5 h-3.5 text-[#86868B]" />
                  <span className="hidden xs:inline">Horaires & Contacts</span>
                  <span className="xs:hidden">Infos</span>
                </button>
              )}
            </>
          ) : (
            <div
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-[10px] font-medium"
              style={{
                backgroundColor: "var(--company-secondary, rgba(0,0,0,0.04))",
                borderColor: "var(--company-surface-border, rgba(0,0,0,0.06))",
                color: "var(--company-text, #1D1D1F)",
              }}
            >
              <Building2 className="w-3 h-3 text-[#86868B]" />
              <span>Infos SAV</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
