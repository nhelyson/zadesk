import React from "react";
import Link from "next/link";
import { PublicCompany } from "@/types/public";
import { CompanyCard } from "./CompanyCard";
import { ArrowRight, Flame } from "lucide-react";

interface PopularCompaniesProps {
  companies: PublicCompany[];
}

export function PopularCompanies({ companies }: PopularCompaniesProps) {
  if (!companies || companies.length === 0) return null;

  return (
    <section className="py-12 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 uppercase tracking-wider mb-2">
            <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span>SAV les plus consultés</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Entreprises populaires
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Accédez directement aux coordonnées et canaux d&apos;assistance officiels.
          </p>
        </div>

        <Link
          href="/entreprises"
          className="inline-flex items-center gap-1.5 text-sm font-bold text-emerald-700 hover:text-emerald-800 group self-start sm:self-auto"
        >
          <span>Voir toutes les entreprises</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
        {companies.slice(0, 8).map((comp) => (
          <CompanyCard key={comp.id} company={comp} />
        ))}
      </div>
    </section>
  );
}
