import React from "react";
import Link from "next/link";
import { PublicCompany } from "@/types/public";
import { CheckCircle, MessageSquare, Phone, Mail, Globe, MapPin, ArrowRight } from "lucide-react";

interface CompanyCardProps {
  company: PublicCompany;
}

export function CompanyCard({ company }: CompanyCardProps) {
  const hasWhatsApp = Boolean(company.supportWhatsApp);
  const hasPhone = Boolean(company.supportPhone);
  const hasEmail = Boolean(company.supportEmail);
  const hasWeb = Boolean(company.website);

  return (
    <div className="group bg-white rounded-2xl border border-slate-200/90 hover:border-emerald-300 p-5 sm:p-6 transition-all duration-200 shadow-sm hover:shadow-md flex flex-col justify-between">
      <div>
        {/* Header: Logo + Verified Badge + Category */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-lg text-slate-700 overflow-hidden flex-shrink-0 group-hover:scale-105 transition-transform">
              {company.logoUrl ? (
                <img
                  src={company.logoUrl}
                  alt={company.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                company.name.charAt(0)
              )}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-slate-900 group-hover:text-emerald-700 transition-colors text-base line-clamp-1">
                  {company.name}
                </h3>
                {company.verified && (
                  <CheckCircle className="w-4 h-4 text-emerald-500 fill-emerald-100 flex-shrink-0" />
                )}
              </div>
              <span className="inline-block text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full mt-0.5">
                {company.category || "Entreprise"}
              </span>
            </div>
          </div>
        </div>

        {/* Description snippet */}
        <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 mb-4 leading-relaxed">
          {company.description || "Consultez les canaux officiels du service après-vente et d'assistance clientèle de cette entreprise."}
        </p>

        {/* Location / City */}
        {company.city && (
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-4">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            <span>{company.city}, {company.country || "Congo"}</span>
          </div>
        )}
      </div>

      {/* Footer: Channels availability + CTA */}
      <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          {hasWhatsApp && (
            <span className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center" title="WhatsApp disponible">
              <MessageSquare className="w-3.5 h-3.5" />
            </span>
          )}
          {hasPhone && (
            <span className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center" title="Téléphone direct">
              <Phone className="w-3.5 h-3.5" />
            </span>
          )}
          {hasEmail && (
            <span className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center" title="Email">
              <Mail className="w-3.5 h-3.5" />
            </span>
          )}
          {hasWeb && (
            <span className="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center" title="Site web">
              <Globe className="w-3.5 h-3.5" />
            </span>
          )}
        </div>

        <Link
          href={`/entreprises/${company.slug}`}
          className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800 group/link"
        >
          <span>Consulter le SAV</span>
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/link:translate-x-0.5" />
        </Link>
      </div>
    </div>
  );
}
