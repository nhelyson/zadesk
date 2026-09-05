import React from "react";
import Link from "next/link";
import { PublicCategory } from "@/types/public";
import {
  Smartphone,
  Landmark,
  Zap,
  Tv,
  ShoppingBag,
  Truck,
  HeartPulse,
  Building,
  ArrowUpRight,
} from "lucide-react";

interface CategoryDirectoryProps {
  categories: PublicCategory[];
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  "Télécommunications": <Smartphone className="w-6 h-6 text-emerald-600" />,
  "Banque & Finance": <Landmark className="w-6 h-6 text-blue-600" />,
  "Énergie & Services Publics": <Zap className="w-6 h-6 text-amber-500" />,
  "Médias & Divertissement": <Tv className="w-6 h-6 text-purple-600" />,
  "E-commerce & Distribution": <ShoppingBag className="w-6 h-6 text-rose-600" />,
  "Transport & Logistique": <Truck className="w-6 h-6 text-cyan-600" />,
  "Santé & Pharmacie": <HeartPulse className="w-6 h-6 text-red-500" />,
};

export function CategoryDirectory({ categories }: CategoryDirectoryProps) {
  return (
    <section className="py-12 sm:py-16 bg-slate-50 border-y border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider bg-emerald-100/70 px-3 py-1 rounded-full">
            Catégories
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-3">
            Explorer par secteur d&apos;activité
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            Trouvez les canaux d&apos;assistance adaptés à vos besoins quotidiens.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
          {categories.map((cat) => {
            const icon = CATEGORY_ICONS[cat.name] || <Building className="w-6 h-6 text-slate-600" />;
            return (
              <Link
                key={cat.name}
                href={`/entreprises?category=${encodeURIComponent(cat.name)}`}
                className="group p-5 bg-white rounded-2xl border border-slate-200 hover:border-emerald-300 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    {icon}
                  </div>
                  <h3 className="font-bold text-slate-900 group-hover:text-emerald-700 text-sm sm:text-base leading-snug">
                    {cat.name}
                  </h3>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 mt-4 pt-3 border-t border-slate-50">
                  <span>{cat.count} entreprise{cat.count > 1 ? "s" : ""}</span>
                  <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
