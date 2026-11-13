"use client";

import React, { useEffect } from "react";
import { PublicCompany } from "@/types/public";
import { getSupportAvailabilityInfo } from "@/lib/brandTheme";
import {
  X,
  MapPin,
  Clock,
  Phone,
  Mail,
  Globe,
  MessageSquare,
  ShieldCheck,
  ExternalLink,
  Info,
  CheckCircle2,
  Calendar,
  AlertTriangle,
  Building2,
  Store,
} from "lucide-react";

interface CompanyInfoBubbleModalProps {
  company: PublicCompany;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSelectEstablishment?: (id: string) => void;
  variant?: "floating" | "inline" | "modal-only";
}

export function CompanyInfoBubbleModal({
  company,
  isOpen = false,
  onOpenChange,
  onSelectEstablishment,
  variant = "modal-only",
}: CompanyInfoBubbleModalProps) {
  const setIsOpen = (open: boolean) => {
    onOpenChange?.(open);
  };

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const cleanWhatsAppNumber = company.supportWhatsApp
    ? company.supportWhatsApp.replace(/[^0-9]/g, "")
    : "";
  const whatsappUrl = cleanWhatsAppNumber
    ? `https://wa.me/${cleanWhatsAppNumber}?text=${encodeURIComponent(
        `Bonjour le service client de ${company.name}, je vous contacte depuis la plateforme Zadesk pour une demande d'assistance.`
      )}`
    : null;

  const initial = company.name?.trim().charAt(0).toUpperCase() || "E";
  const availability = getSupportAvailabilityInfo(company.openingHours, company.businessHours);

  return (
    <>
      {/* Inline trigger button if requested */}
      {variant === "inline" && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/[0.05] hover:bg-black/[0.08] active:scale-95 text-[#1D1D1F] text-xs font-medium border border-black/[0.04] transition-all cursor-pointer"
          title="Consulter les coordonnées et horaires officiels"
        >
          <Info className="w-3.5 h-3.5 text-[#86868B]" />
          <span>Coordonnées & Horaires</span>
        </button>
      )}

      {/* Floating trigger button if requested */}
      {variant === "floating" && (
        <div className="fixed top-4 right-4 sm:top-5 sm:right-6 z-30">
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            aria-label={`Ouvrir la fiche officielle de ${company.name}`}
            aria-expanded={isOpen}
            className="group relative w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/90 backdrop-blur-xl border border-black/[0.08] shadow-[0_4px_16px_rgba(0,0,0,0.08)] hover:shadow-xl active:scale-95 transition-all flex items-center justify-center cursor-pointer p-1 overflow-hidden"
          >
            {company.logoUrl ? (
              <img
                src={company.logoUrl}
                alt={company.name}
                className="w-full h-full object-cover rounded-xl"
              />
            ) : (
              <div
                className="w-full h-full rounded-xl flex items-center justify-center font-bold text-base sm:text-lg"
                style={{
                  backgroundColor: "var(--company-primary)",
                  color: "var(--company-contrast)",
                }}
              >
                {initial}
              </div>
            )}
            <span
              className="absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center shadow-xs"
              style={{
                backgroundColor: "var(--company-primary)",
                color: "var(--company-contrast)",
              }}
            >
              <Info className="w-2.5 h-2.5" />
            </span>
          </button>
        </div>
      )}

      {/* Slide-over Drawer / Modal Backdrop */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="company-details-title"
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:justify-end bg-black/30 backdrop-blur-md transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`w-full ${company.establishments && company.establishments.length > 0 ? "sm:max-w-xl md:max-w-2xl lg:max-w-3xl" : "sm:max-w-md"} h-[92vh] sm:h-full bg-[#F5F5F7] rounded-t-[32px] sm:rounded-none sm:rounded-l-[32px] shadow-2xl border-t sm:border-t-0 sm:border-l border-black/[0.08] flex flex-col overflow-hidden transition-all duration-300 ease-out`}
          >
            {/* Grab Handle for Mobile */}
            <div className="w-9 h-1 rounded-full bg-black/20 mx-auto mt-2.5 sm:hidden" />

            {/* Sheet Header */}
            <div className="relative px-5 py-4 border-b border-black/[0.06] bg-white/80 backdrop-blur-xl flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                {/* Logo */}
                <div className="w-11 h-11 rounded-2xl bg-white border border-black/[0.06] shadow-2xs flex items-center justify-center overflow-hidden shrink-0">
                  {company.logoUrl ? (
                    <img
                      src={company.logoUrl}
                      alt={company.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div
                      className="w-full h-full flex items-center justify-center font-bold text-base"
                      style={{
                        backgroundColor: "var(--company-primary)",
                        color: "var(--company-contrast)",
                      }}
                    >
                      {initial}
                    </div>
                  )}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3
                      id="company-details-title"
                      className="text-base font-semibold tracking-tight text-[#1D1D1F] truncate"
                    >
                      {company.name}
                    </h3>
                    {company.verified && (
                      <span title="Entreprise certifiée Zadesk">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 fill-emerald-50 shrink-0" />
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#86868B] font-medium truncate mt-0.5">
                    {company.category || "Service Client & SAV Officiel"}
                  </p>
                </div>
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-7 h-7 rounded-full bg-black/[0.05] hover:bg-black/[0.08] text-[#1D1D1F] flex items-center justify-center active:scale-95 transition-all cursor-pointer shrink-0"
                aria-label="Fermer le panneau"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5 text-xs text-[#1D1D1F]">
              {/* Description */}
              {company.description && (
                <div
                  className="rounded-2xl p-4 border shadow-[0_1px_3px_rgba(0,0,0,0.02)] leading-relaxed text-[#1D1D1F]"
                  style={{
                    backgroundColor: "var(--company-surface, #FFFFFF)",
                    borderColor: "var(--company-surface-border, rgba(0,0,0,0.06))",
                  }}
                >
                  {company.description}
                </div>
              )}

              {/* Service Availability */}
              <div className="space-y-2">
                <div className="flex items-center justify-between px-1">
                  <h4 className="text-[11px] font-semibold tracking-wide text-[#86868B] uppercase">
                    Disponibilité du service
                  </h4>
                  {availability.timezoneDisplay && (
                    <span className="text-[10px] text-[#86868B] font-medium">
                      {availability.timezoneDisplay}
                    </span>
                  )}
                </div>

                <div className="space-y-2.5">
                  {/* Reception 24/7 */}
                  <div
                    className="p-3.5 rounded-2xl border shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex items-start gap-3"
                    style={{
                      backgroundColor: "var(--company-surface, #FFFFFF)",
                      borderColor: "var(--company-surface-border, rgba(0,0,0,0.06))",
                    }}
                  >
                    <div className="w-8 h-8 rounded-xl bg-black/[0.04] flex items-center justify-center shrink-0">
                      <Clock className="w-4 h-4" style={{ color: "var(--company-primary)" }} />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                        <p className="font-semibold text-xs text-[#1D1D1F]">Réception & Dépôt des demandes</p>
                      </div>
                      <p className="text-[11px] text-[#86868B] mt-0.5 leading-relaxed">
                        {availability.automatedText}
                      </p>
                    </div>
                  </div>

                  {/* Exceptional Closure Callout (Apple Callout style) */}
                  {availability.isTemporarilyClosed && (
                    <div className="p-4 rounded-2xl bg-[#FFF8E6] border border-[#FFE58F] text-[#874D00] shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className="w-6 h-6 rounded-full bg-[#FAAD14] text-white flex items-center justify-center shrink-0">
                          <AlertTriangle className="w-3.5 h-3.5" />
                        </div>
                        <span className="font-semibold text-xs tracking-tight">Fermeture temporaire exceptionnelle</span>
                      </div>
                      <p className="text-[11px] leading-relaxed pl-8 font-medium">
                        {availability.humanText}
                      </p>
                    </div>
                  )}

                  {/* Human Advisor Hours */}
                  {!availability.isTemporarilyClosed && (
                    <div
                      className="p-3.5 rounded-2xl border shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex items-start gap-3"
                      style={{
                        backgroundColor: "var(--company-surface, #FFFFFF)",
                        borderColor: "var(--company-surface-border, rgba(0,0,0,0.06))",
                      }}
                    >
                      <div className="w-8 h-8 rounded-xl bg-black/[0.04] flex items-center justify-center shrink-0">
                        <Calendar className="w-4 h-4" style={{ color: "var(--company-primary)" }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${availability.statusBadge.dotColor} shrink-0`} />
                          <p className="font-semibold text-xs text-[#1D1D1F]">Conseillers du service client</p>
                        </div>
                        <p className="text-[11px] mt-0.5 leading-relaxed text-[#86868B]">
                          {availability.humanText}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Weekly Schedule Table */}
                  {availability.weeklySchedule && availability.weeklySchedule.length > 0 && (
                    <div
                      className="p-3.5 rounded-2xl border shadow-[0_1px_3px_rgba(0,0,0,0.02)]"
                      style={{
                        backgroundColor: "var(--company-surface, #FFFFFF)",
                        borderColor: "var(--company-surface-border, rgba(0,0,0,0.06))",
                      }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-[10px] uppercase tracking-wider font-semibold text-[#86868B]">
                          Planning d&apos;ouverture hebdomadaire
                        </p>
                        <span className="text-[10px] text-[#86868B]">
                          Heure locale
                        </span>
                      </div>
                      <div className="divide-y divide-black/[0.03] text-[11px]">
                        {availability.weeklySchedule.map((day) => (
                          <div key={day.key} className="py-1.5 flex items-center justify-between">
                            <span className={`font-medium ${day.isOpen ? "text-[#1D1D1F]" : "text-[#86868B]"}`}>
                              {day.label}
                            </span>
                            <span
                              className={
                                day.isOpen
                                  ? "font-semibold text-[#1D1D1F]"
                                  : "text-[#86868B] italic text-[10px]"
                              }
                            >
                              {day.hoursText}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Verified Direct Channels */}
              {(whatsappUrl || company.supportPhone || company.supportEmail || company.website) && (
                <div className="space-y-2">
                  <h4 className="text-[11px] font-semibold tracking-wide text-[#86868B] uppercase px-1">
                    Canaux directs certifiés
                  </h4>

                  <div
                    className="rounded-2xl bg-white border divide-y divide-black/[0.04] overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.02)]"
                    style={{
                      borderColor: "var(--company-surface-border, rgba(0,0,0,0.06))",
                    }}
                  >
                    {/* WhatsApp Direct */}
                    {whatsappUrl && (
                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-3.5 hover:bg-black/[0.02] active:bg-black/[0.04] transition-colors group cursor-pointer"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                            <MessageSquare className="w-4 h-4 fill-current" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-xs text-[#1D1D1F]">WhatsApp Officiel</p>
                            <p className="text-[11px] font-mono text-[#86868B] truncate">
                              {company.supportWhatsApp}
                            </p>
                          </div>
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 text-[#86868B] group-hover:text-[#1D1D1F] transition-colors shrink-0" />
                      </a>
                    )}

                    {/* Direct Phone */}
                    {company.supportPhone && (
                      <a
                        href={`tel:${company.supportPhone.replace(/\s+/g, "")}`}
                        className="flex items-center justify-between p-3.5 hover:bg-black/[0.02] active:bg-black/[0.04] transition-colors group cursor-pointer"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-xl bg-black/[0.04] text-[#1D1D1F] flex items-center justify-center shrink-0">
                            <Phone className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-xs text-[#1D1D1F]">Téléphone Assistance</p>
                            <p className="text-[11px] font-mono text-[#86868B] truncate">
                              {company.supportPhone}
                            </p>
                          </div>
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 text-[#86868B] group-hover:text-[#1D1D1F] transition-colors shrink-0" />
                      </a>
                    )}

                    {/* Official Support Email */}
                    {company.supportEmail && (
                      <a
                        href={`mailto:${company.supportEmail}?subject=${encodeURIComponent(
                          `Demande de support client — ${company.name}`
                        )}`}
                        className="flex items-center justify-between p-3.5 hover:bg-black/[0.02] active:bg-black/[0.04] transition-colors group cursor-pointer"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-xl bg-black/[0.04] text-[#1D1D1F] flex items-center justify-center shrink-0">
                            <Mail className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-xs text-[#1D1D1F]">Email Officiel</p>
                            <p className="text-[11px] font-mono text-[#86868B] truncate">
                              {company.supportEmail}
                            </p>
                          </div>
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 text-[#86868B] group-hover:text-[#1D1D1F] transition-colors shrink-0" />
                      </a>
                    )}

                    {/* Official Website */}
                    {company.website && (
                      <a
                        href={company.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-3.5 hover:bg-black/[0.02] active:bg-black/[0.04] transition-colors group cursor-pointer"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-xl bg-black/[0.04] text-[#1D1D1F] flex items-center justify-center shrink-0">
                            <Globe className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-xs text-[#1D1D1F]">Site Web</p>
                            <p className="text-[11px] font-mono text-[#86868B] truncate">
                              {company.website}
                            </p>
                          </div>
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 text-[#86868B] group-hover:text-[#1D1D1F] transition-colors shrink-0" />
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Physical Establishments / Responsive Masonry Gallery */}
              {company.establishments && company.establishments.length > 0 ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <h4 className="text-xs font-bold tracking-wide text-[#1D1D1F] uppercase">
                        Nos établissements & Boutiques ({company.establishments.length})
                      </h4>
                    </div>
                    <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 border border-emerald-200/60 px-2.5 py-0.5 rounded-full">
                      Accueil au public
                    </span>
                  </div>

                  {/* Responsive Masonry Layout */}
                  <div className="columns-1 sm:columns-2 gap-4 space-y-4 pt-1">
                    {company.establishments.map((est) => {
                      const typeLabels: Record<string, string> = {
                        HEADQUARTERS: "Siège social",
                        BRANCH: "Agence",
                        STORE: "Boutique",
                        POINT_OF_SALE: "Point de vente",
                        SERVICE_POINT: "Comptoir SAV",
                        PICKUP_POINT: "Point relais",
                        TECH_CENTER: "Centre technique",
                        OTHER: "Établissement",
                      };

                      return (
                        <div
                          key={est.id}
                          onClick={() => {
                            if (onSelectEstablishment) {
                              setIsOpen(false);
                              onSelectEstablishment(est.id);
                            }
                          }}
                          className={`break-inside-avoid rounded-2xl border shadow-sm overflow-hidden bg-white hover:shadow-md transition-all group/card border-black/[0.06] ${
                            onSelectEstablishment ? "cursor-pointer hover:border-slate-300" : ""
                          }`}
                          style={{
                            backgroundColor: "var(--company-surface, #FFFFFF)",
                          }}
                        >
                          {/* Storefront / Façade Image */}
                          {est.imageUrl ? (
                            <div className="relative w-full overflow-hidden bg-slate-100 group/img">
                              <img
                                src={est.imageUrl}
                                alt={est.name}
                                className="w-full h-auto max-h-60 object-cover group-hover/img:scale-105 transition-transform duration-500"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
                              <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-1.5 flex-wrap">
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold backdrop-blur-md bg-white/90 text-slate-800 shadow-sm border border-white/40">
                                  {typeLabels[est.type] || "Établissement"}
                                </span>
                                {est.isMain && (
                                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white backdrop-blur-md shadow-sm">
                                    Siège principal
                                  </span>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="p-3 bg-gradient-to-r from-slate-50 to-slate-100/60 border-b border-black/[0.04] flex items-center justify-between gap-1.5">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white border border-black/[0.06] text-slate-700">
                                {typeLabels[est.type] || "Établissement"}
                              </span>
                              {est.isMain && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                                  Siège principal
                                </span>
                              )}
                            </div>
                          )}

                          {/* Details Content */}
                          <div className="p-4 space-y-2.5">
                            <div className="flex items-start justify-between gap-2">
                              <p className="font-bold text-xs text-[#1D1D1F] leading-snug group-hover/card:text-sky-600 transition-colors">
                                {est.name}
                              </p>
                              {est.phone && (
                                <a
                                  href={`tel:${est.phone}`}
                                  onClick={(e) => e.stopPropagation()}
                                  className="text-[11px] font-mono text-slate-500 hover:text-slate-900 transition-colors flex items-center gap-1 shrink-0"
                                >
                                  <Phone className="w-3 h-3 text-emerald-600" />
                                  <span>{est.phone}</span>
                                </a>
                              )}
                            </div>

                            <p className="text-[11px] text-[#86868B] leading-relaxed flex items-start gap-1">
                              <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                              <span>
                                {[est.address, est.addressDetails && est.addressDetails !== est.address ? est.addressDetails : null, est.city, est.country].filter(Boolean).join(", ")}
                              </span>
                            </p>

                            {est.openingHours && (
                              <div className="flex items-center gap-1.5 text-[10px] text-[#86868B] pt-1.5 border-t border-black/[0.04]">
                                <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                                <span className="font-medium">{est.openingHours}</span>
                              </div>
                            )}

                            {est.services && est.services.length > 0 && (
                              <div className="flex flex-wrap gap-1 pt-0.5">
                                {est.services.map((srv, idx) => (
                                  <span
                                    key={idx}
                                    className="px-1.5 py-0.5 rounded-md bg-black/[0.04] text-[#86868B] text-[9px] font-medium"
                                  >
                                    {srv}
                                  </span>
                                ))}
                              </div>
                            )}

                            {est.practicalInfo && (
                              <p className="text-[10px] text-[#86868B] italic bg-black/[0.02] px-2 py-1 rounded-lg">
                                ℹ {est.practicalInfo}
                              </p>
                            )}

                            {onSelectEstablishment && (
                              <div className="pt-2 border-t border-black/[0.04] flex items-center justify-between text-[11px] text-sky-600 font-semibold group-hover/card:text-sky-700">
                                <span>Consulter la fiche complète</span>
                                <span className="group-hover/card:translate-x-0.5 transition-transform">→</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (company.address || company.city) ? (
                <div className="space-y-2">
                  <h4 className="text-[11px] font-semibold tracking-wide text-[#86868B] uppercase px-1">
                    Siège & Agences
                  </h4>
                  <div
                    className="p-3.5 rounded-2xl border shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex items-start gap-3"
                    style={{
                      backgroundColor: "var(--company-surface, #FFFFFF)",
                      borderColor: "var(--company-surface-border, rgba(0,0,0,0.06))",
                    }}
                  >
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                      style={{
                        backgroundColor: "var(--company-secondary, rgba(0,0,0,0.04))",
                        color: "var(--company-primary)",
                      }}
                    >
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-xs text-[#1D1D1F]">Adresse officielle</p>
                      <p className="text-[11px] text-[#86868B] mt-0.5 leading-relaxed">
                        {[company.address, company.city, company.country || "Congo"]
                          .filter(Boolean)
                          .join(", ")}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-3.5 rounded-2xl border border-dashed border-black/[0.08] text-center space-y-1">
                  <p className="font-semibold text-xs text-[#1D1D1F]">Service client 100% en ligne</p>
                  <p className="text-[11px] text-[#86868B]">
                    Cette entreprise opère exclusivement via ses canaux digitaux et WhatsApp.
                  </p>
                </div>
              )}

              {/* Zadesk Security & Transparency Guarantee */}
              <div
                className="p-4 rounded-2xl border flex items-start gap-3 text-[#86868B] leading-relaxed"
                style={{
                  backgroundColor: "var(--company-surface, rgba(255,255,255,0.6))",
                  borderColor: "var(--company-surface-border, rgba(0,0,0,0.06))",
                }}
              >
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                  style={{
                    backgroundColor: "var(--company-secondary, rgba(0,0,0,0.03))",
                    color: "var(--company-primary)",
                  }}
                >
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="space-y-0.5">
                  <p className="font-semibold text-xs text-[#1D1D1F]">Service vérifié par Zadesk</p>
                  <p className="text-[11px] text-[#86868B]">
                    Les échanges sur cette interface sont directement transmis au service après-vente
                    officiel de {company.name}.
                  </p>
                </div>
              </div>
            </div>

            {/* Sheet Footer */}
            <div className="p-4 px-5 border-t border-black/[0.06] bg-white/80 backdrop-blur-xl flex items-center justify-between">
              <span className="text-[11px] text-[#86868B]">Fiche certifiée Zadesk</span>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 rounded-full text-xs font-semibold text-[#1D1D1F] bg-black/[0.05] hover:bg-black/[0.08] active:scale-95 transition-all cursor-pointer"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
