import React from "react";
import Link from "next/link";
import { PublicCompany } from "@/types/public";
import {
  CheckCircle,
  MessageSquare,
  Phone,
  Mail,
  Globe,
  MapPin,
  ArrowRight,
  Clock,
  Sparkles,
  ExternalLink,
} from "lucide-react";

interface CompanyCardProps {
  company: PublicCompany;
}

export function CompanyCard({ company }: CompanyCardProps) {
  const hasWhatsApp = Boolean(company.supportWhatsApp);
  const hasPhone = Boolean(company.supportPhone);
  const hasEmail = Boolean(company.supportEmail);
  const hasWeb = Boolean(company.website);

  const cleanWhatsAppNumber = company.supportWhatsApp
    ? company.supportWhatsApp.replace(/[^0-9]/g, "")
    : "";

  const whatsappUrl = cleanWhatsAppNumber
    ? `https://wa.me/${cleanWhatsAppNumber}?text=${encodeURIComponent(
        `Bonjour le service après-vente de ${company.name}, je vous contacte depuis la plateforme Zadesk pour une demande d'assistance.`
      )}`
    : null;

  const displayCategories = Array.isArray(company.supportCategories)
    ? company.supportCategories.slice(0, 2)
    : [];

  return (
    <article className="group relative bg-white rounded-3xl border border-slate-200/90 hover:border-emerald-400/80 p-5 sm:p-6 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] shadow-xs hover:shadow-xl hover:shadow-slate-200/60 hover:-translate-y-1.5 flex flex-col justify-between h-full">
      <div className="space-y-4">
        {/* Top Header: Logo + Name + Verified Badge */}
        <div className="flex items-start gap-3.5">
          <div className="relative w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-white border border-slate-200/80 p-1 shadow-xs flex items-center justify-center font-black text-xl text-slate-800 overflow-hidden shrink-0 group-hover:scale-105 group-hover:border-emerald-300 transition-all duration-300">
            {company.logoUrl ? (
              <img
                src={company.logoUrl}
                alt={company.name}
                className="w-full h-full object-cover rounded-xl"
                loading="lazy"
              />
            ) : (
              <span className="font-bold text-slate-700">{company.name.charAt(0)}</span>
            )}
            {hasWhatsApp && (
              <span
                className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white"
                title="Canal WhatsApp actif"
              />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <Link
                href={`/entreprises/${company.slug}`}
                className="font-bold text-slate-900 group-hover:text-emerald-700 transition-colors text-base sm:text-lg leading-snug truncate"
              >
                {company.name}
              </Link>
              {company.verified && (
                <span title="SAV Officiel Vérifié" className="inline-flex">
                  <CheckCircle className="w-4 h-4 text-emerald-500 fill-emerald-100 shrink-0" />
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 mt-1">
              <span className="inline-block text-[11px] font-semibold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full">
                {company.category || "Service Client"}
              </span>

              {company.city && (
                <span className="flex items-center gap-1 text-[11px] text-slate-500">
                  <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                  <span className="truncate">{company.city}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed">
          {company.description ||
            "Canaux officiels d'assistance, traitement des réclamations et support client certifié."}
        </p>

        {/* Frequent Support Motifs / Topics Chips */}
        {displayCategories.length > 0 && (
          <div className="pt-1 flex flex-wrap gap-1.5">
            {displayCategories.map((topic, i) => (
              <span
                key={i}
                className="text-[10px] font-medium text-slate-600 bg-slate-50 border border-slate-200/70 px-2 py-0.5 rounded-md truncate max-w-[200px]"
                title={topic}
              >
                {topic}
              </span>
            ))}
          </div>
        )}

        {/* Availability / Operating hours indicator if provided */}
        {company.openingHours && (
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <Clock className="w-3 h-3 text-emerald-600 shrink-0" />
            <span className="truncate">{company.openingHours}</span>
          </div>
        )}
      </div>

      {/* Footer Area: Direct Channels & Actions */}
      <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between gap-3">
        {/* Contact Icons Indicator */}
        <div className="flex items-center gap-1.5">
          {hasWhatsApp && (
            <span
              className="w-7 h-7 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center transition-transform hover:scale-110"
              title="Support WhatsApp disponible"
            >
              <MessageSquare className="w-3.5 h-3.5" />
            </span>
          )}
          {hasPhone && (
            <span
              className="w-7 h-7 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center transition-transform hover:scale-110"
              title="Téléphone disponible"
            >
              <Phone className="w-3.5 h-3.5" />
            </span>
          )}
          {hasEmail && (
            <span
              className="w-7 h-7 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 flex items-center justify-center transition-transform hover:scale-110"
              title="Email support disponible"
            >
              <Mail className="w-3.5 h-3.5" />
            </span>
          )}
        </div>

        {/* Actions Button */}
        <div className="flex items-center gap-2">
          {whatsappUrl && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Contacter le SAV de ${company.name} sur WhatsApp`}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold transition-all shadow-xs hover:shadow-emerald-500/20"
              title="Ouvrir WhatsApp direct"
            >
              <MessageSquare className="w-3 h-3 fill-current" />
              <span className="hidden sm:inline">WhatsApp</span>
            </a>
          )}

          <Link
            href={`/entreprises/${company.slug}`}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-[#0D1B3D] text-slate-700 hover:text-white active:scale-95 text-xs font-bold transition-all duration-200 group/link"
          >
            <span>Fiche SAV</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover/link:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </article>
  );
}
