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
  Building,
} from "lucide-react";

interface CompanyInfoBubbleModalProps {
  company: PublicCompany;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  variant?: "floating" | "inline" | "modal-only";
}

export function CompanyInfoBubbleModal({
  company,
  isOpen = false,
  onOpenChange,
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
  const availability = getSupportAvailabilityInfo(company.openingHours);

  return (
    <>
      {/* Inline trigger button if requested */}
      {variant === "inline" && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/90 text-slate-700 text-xs font-semibold border border-slate-200/80 transition-all cursor-pointer"
          title="Consulter les coordonnées et horaires officiels"
        >
          <Info className="w-3.5 h-3.5 text-slate-500" />
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
            className="group relative w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white border border-slate-200/90 shadow-lg shadow-slate-900/5 hover:shadow-xl active:scale-95 transition-all flex items-center justify-center cursor-pointer p-1 overflow-hidden"
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
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:justify-end bg-slate-950/40 backdrop-blur-xs transition-opacity duration-200"
          onClick={() => setIsOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full sm:max-w-md h-[88vh] sm:h-full bg-white rounded-t-3xl sm:rounded-none sm:rounded-l-3xl shadow-2xl border-t sm:border-t-0 sm:border-l border-slate-200/90 flex flex-col overflow-hidden transition-transform duration-200 ease-out"
          >
            {/* Sheet Header */}
            <div className="relative px-6 py-5 border-b border-slate-100 bg-slate-50/70 flex items-start justify-between gap-4">
              <div className="flex items-center gap-3.5 min-w-0">
                {/* Logo */}
                <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center justify-center overflow-hidden shrink-0">
                  {company.logoUrl ? (
                    <img
                      src={company.logoUrl}
                      alt={company.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div
                      className="w-full h-full flex items-center justify-center font-bold text-lg"
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
                      className="text-base font-bold text-slate-900 truncate"
                    >
                      {company.name}
                    </h3>
                    {company.verified && (
                      <span title="Entreprise certifiée Zadesk">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 fill-emerald-50 shrink-0" />
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 font-medium truncate mt-0.5">
                    {company.category || "Service Client & SAV Officiel"}
                  </p>
                </div>
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-white hover:bg-slate-100 text-slate-500 hover:text-slate-900 border border-slate-200 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                aria-label="Fermer le panneau"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6 text-xs text-slate-600">
              {/* Description */}
              {company.description && (
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/70 leading-relaxed text-slate-700">
                  {company.description}
                </div>
              )}

              {/* Service Availability Distinction */}
              <div className="space-y-3">
                <h4 className="text-[11px] uppercase tracking-wider font-bold text-slate-400">
                  Disponibilité du service
                </h4>

                <div className="space-y-2">
                  {/* Automated Reception */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 text-slate-700 flex items-center justify-center shrink-0">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        <p className="font-bold text-slate-900">Accueil & Prise en charge</p>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                        {availability.automatedText}
                      </p>
                    </div>
                  </div>

                  {/* Human Advisor Hours */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 text-slate-700 flex items-center justify-center shrink-0">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">Conseillers du service après-vente</p>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                        {availability.humanText}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Verified Direct Channels */}
              <div className="space-y-3">
                <h4 className="text-[11px] uppercase tracking-wider font-bold text-slate-400">
                  Canaux directs certifiés
                </h4>

                <div className="space-y-2">
                  {/* WhatsApp Direct */}
                  {whatsappUrl && (
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3.5 rounded-2xl bg-emerald-50/60 hover:bg-emerald-100/60 border border-emerald-200/80 transition-all group cursor-pointer"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                          <MessageSquare className="w-4 h-4 fill-current" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900">WhatsApp Officiel</p>
                          <p className="text-[11px] font-mono text-emerald-800 truncate">
                            {company.supportWhatsApp}
                          </p>
                        </div>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-emerald-600 group-hover:translate-x-0.5 transition-transform shrink-0" />
                    </a>
                  )}

                  {/* Direct Phone */}
                  {company.supportPhone && (
                    <a
                      href={`tel:${company.supportPhone.replace(/\s+/g, "")}`}
                      className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 transition-all group cursor-pointer"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-white text-slate-700 flex items-center justify-center shrink-0 border border-slate-200">
                          <Phone className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900">Téléphone Assistance</p>
                          <p className="text-[11px] font-mono text-slate-500 truncate">
                            {company.supportPhone}
                          </p>
                        </div>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 shrink-0" />
                    </a>
                  )}

                  {/* Official Support Email */}
                  {company.supportEmail && (
                    <a
                      href={`mailto:${company.supportEmail}?subject=${encodeURIComponent(
                        `Demande de support client — ${company.name}`
                      )}`}
                      className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 transition-all group cursor-pointer"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-white text-slate-700 flex items-center justify-center shrink-0 border border-slate-200">
                          <Mail className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900">Email Officiel</p>
                          <p className="text-[11px] font-mono text-slate-500 truncate">
                            {company.supportEmail}
                          </p>
                        </div>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 shrink-0" />
                    </a>
                  )}

                  {/* Official Website */}
                  {company.website && (
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 transition-all group cursor-pointer"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-white text-slate-700 flex items-center justify-center shrink-0 border border-slate-200">
                          <Globe className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900">Site Web</p>
                          <p className="text-[11px] font-mono text-slate-500 truncate">
                            {company.website}
                          </p>
                        </div>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 shrink-0" />
                    </a>
                  )}
                </div>
              </div>

              {/* Physical Address / Headquarters */}
              {(company.address || company.city) && (
                <div className="space-y-3 pt-4 border-t border-slate-100">
                  <h4 className="text-[11px] uppercase tracking-wider font-bold text-slate-400">
                    Siège & Agences
                  </h4>
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 text-slate-700 flex items-center justify-center shrink-0">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">Adresse</p>
                      <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                        {[company.address, company.city, company.country || "Congo"]
                          .filter(Boolean)
                          .join(", ")}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Zadesk Security & Transparency Guarantee */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3 text-slate-700 leading-relaxed">
                <ShieldCheck className="w-4 h-4 text-slate-900 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold text-slate-900">Service vérifié par Zadesk</p>
                  <p className="text-[11px] text-slate-500">
                    Les échanges sur cette interface sont directement transmis au service après-vente
                    officiel de {company.name}. Aucun compte utilisateur n&apos;est requis.
                  </p>
                </div>
              </div>
            </div>

            {/* Sheet Footer */}
            <div className="p-4 px-6 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">Fiche certifiée Zadesk</span>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 shadow-2xs transition-colors cursor-pointer"
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
