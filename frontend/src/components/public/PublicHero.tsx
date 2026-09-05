"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2, CheckCircle, ArrowRight, MessageSquare, Phone, MapPin, X } from "lucide-react";
import { PublicCompany } from "@/types/public";
import Link from "next/link";

const POPULAR_QUERIES = [
  "Airtel Congo",
  "MTN Congo",
  "Canal+ Congo",
  "Ecobank",
  "E2C",
  "TotalEnergies",
];

export function PublicHero() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PublicCompany[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Debounced live search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsOpen(false);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(`/api/public/companies?search=${encodeURIComponent(query.trim())}&limit=6`);
        const json = await res.json();
        if (json.success && json.data?.companies) {
          setResults(json.data.companies);
          setIsOpen(true);
        } else {
          setResults([]);
          setIsOpen(true);
        }
      } catch (err) {
        console.error("Search error:", err);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 200);

    return () => clearTimeout(timeout);
  }, [query]);

  // Click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/entreprises?search=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <section className="relative bg-gradient-to-b from-slate-50 via-white to-slate-50/50 pt-12 pb-16 sm:pt-16 sm:pb-24 border-b border-slate-200/80 overflow-hidden">
      {/* Background Subtle Grid / Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-emerald-100/40 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Country Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold mb-6 shadow-sm">
          <span>🇨🇬</span>
          <span>Le portail centralisé du SAV au Congo</span>
        </div>

        {/* Main Title */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.15] mb-4">
          Trouvez le <span className="text-emerald-600 underline decoration-emerald-300 decoration-wavy decoration-2">SAV</span> d&apos;une entreprise
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed">
          Recherchez une entreprise, une marque ou un service et trouvez rapidement les informations officielles et les moyens de contacter son service après-vente.
        </p>

        {/* Search Container */}
        <div className="relative max-w-2xl mx-auto text-left" ref={dropdownRef}>
          <form onSubmit={handleSearchSubmit} className="relative z-20">
            <div className="relative flex items-center shadow-lg hover:shadow-xl focus-within:shadow-xl focus-within:ring-2 focus-within:ring-emerald-500 rounded-2xl bg-white border border-slate-300 transition-all">
              <div className="pl-4 sm:pl-5 text-slate-400">
                <Search className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>

              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => {
                  if (query.trim() && results.length > 0) setIsOpen(true);
                }}
                placeholder="Rechercher une entreprise ou une marque (ex: Airtel, MTN, Canal+...)"
                className="w-full py-4 sm:py-5 pl-3 pr-24 text-base sm:text-lg text-slate-900 placeholder:text-slate-400 bg-transparent rounded-2xl focus:outline-none"
              />

              <div className="absolute right-3 flex items-center gap-2">
                {isLoading && (
                  <Loader2 className="w-5 h-5 text-emerald-600 animate-spin mr-1" />
                )}
                {query && !isLoading && (
                  <button
                    type="button"
                    onClick={() => {
                      setQuery("");
                      setResults([]);
                      setIsOpen(false);
                    }}
                    className="p-1 text-slate-400 hover:text-slate-600 rounded-full"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition-colors hidden sm:inline-flex items-center gap-1 shadow-sm"
                >
                  <span>Trouver</span>
                </button>
              </div>
            </div>
          </form>

          {/* Autocomplete Dropdown */}
          {isOpen && query.trim().length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden z-30 animate-in fade-in-50 slide-in-from-top-1 duration-150">
              {results.length > 0 ? (
                <div>
                  <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                    <span>Entreprises trouvées ({results.length})</span>
                    <span className="text-[11px] text-emerald-600 font-normal">Accès direct SAV</span>
                  </div>
                  <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
                    {results.map((comp) => (
                      <Link
                        key={comp.id}
                        href={`/entreprises/${comp.slug}`}
                        onClick={() => setIsOpen(false)}
                        className="flex items-center justify-between p-3.5 sm:p-4 hover:bg-emerald-50/60 transition-colors group"
                      >
                        <div className="flex items-center gap-3.5">
                          <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 overflow-hidden flex-shrink-0">
                            {comp.logoUrl ? (
                              <img src={comp.logoUrl} alt={comp.name} className="w-full h-full object-cover" />
                            ) : (
                              comp.name.charAt(0)
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-900 group-hover:text-emerald-700 text-sm sm:text-base">
                                {comp.name}
                              </span>
                              {comp.verified && (
                                <CheckCircle className="w-4 h-4 text-emerald-500 fill-emerald-100" />
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                              <span>{comp.category}</span>
                              {comp.city && (
                                <>
                                  <span>•</span>
                                  <span className="flex items-center gap-0.5">
                                    <MapPin className="w-3 h-3" />
                                    {comp.city}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {comp.supportWhatsApp && (
                            <span className="hidden sm:inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-100/70 px-2 py-1 rounded-lg">
                              <MessageSquare className="w-3 h-3" />
                              <span>WhatsApp</span>
                            </span>
                          )}
                          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
                        </div>
                      </Link>
                    ))}
                  </div>
                  <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
                    <Link
                      href={`/entreprises?search=${encodeURIComponent(query.trim())}`}
                      onClick={() => setIsOpen(false)}
                      className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
                    >
                      Voir tous les résultats pour &quot;{query}&quot; →
                    </Link>
                  </div>
                </div>
              ) : (
                !isLoading && (
                  <div className="p-6 text-center text-slate-500">
                    <p className="text-sm font-medium text-slate-700 mb-1">
                      Aucune entreprise trouvée pour &quot;{query}&quot;
                    </p>
                    <p className="text-xs text-slate-500">
                      Essayez avec un autre nom (ex: Airtel, MTN, Canal+, Ecobank...) ou explorez l&apos;annuaire complet.
                    </p>
                    <Link
                      href="/entreprises"
                      onClick={() => setIsOpen(false)}
                      className="mt-3 inline-block text-xs font-semibold text-emerald-600 hover:underline"
                    >
                      Explorer l&apos;annuaire complet →
                    </Link>
                  </div>
                )
              )}
            </div>
          )}
        </div>

        {/* Popular chips */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-600">
          <span className="font-medium text-slate-500 mr-1">Recherches fréquentes :</span>
          {POPULAR_QUERIES.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => {
                setQuery(item);
                router.push(`/entreprises?search=${encodeURIComponent(item)}`);
              }}
              className="px-3 py-1 bg-white hover:bg-emerald-50 hover:text-emerald-700 border border-slate-200 rounded-full transition-colors shadow-2xs"
            >
              {item}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
