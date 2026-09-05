"use client";

import React, { useState, useEffect, Suspense } from "react";
import { TopInfoBar } from "@/components/public/TopInfoBar";
import { PublicNavbar } from "@/components/public/PublicNavbar";
import { PublicFooter } from "@/components/public/PublicFooter";
import { CompanyCard } from "@/components/public/CompanyCard";
import { PublicCompany, PublicCategory } from "@/types/public";
import { Search, Loader2, Building, MapPin, X, RefreshCw } from "lucide-react";
import { useSearchParams } from "next/navigation";

function EntreprisesDirectoryContent() {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get("search") || "";
  const initialCategory = searchParams.get("category") || "Toutes";

  const [search, setSearch] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedCity, setSelectedCity] = useState("all");
  const [companies, setCompanies] = useState<PublicCompany[]>([]);
  const [categories, setCategories] = useState<PublicCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load categories once
  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await fetch("/api/public/companies/categories");
        const json = await res.json();
        if (json.success && json.data?.categories) {
          setCategories(json.data.categories);
        }
      } catch (err) {
        console.error("Failed to load categories:", err);
      }
    }
    loadCategories();
  }, []);

  // Fetch companies based on filters
  useEffect(() => {
    let isSubscribed = true;
    setIsLoading(true);

    const query = new URLSearchParams();
    if (search.trim()) query.set("search", search.trim());
    if (selectedCategory && selectedCategory !== "Toutes" && selectedCategory !== "all") {
      query.set("category", selectedCategory);
    }
    if (selectedCity && selectedCity !== "all") {
      query.set("city", selectedCity);
    }

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/public/companies?${query.toString()}`);
        const json = await res.json();
        if (isSubscribed && json.success && json.data?.companies) {
          setCompanies(json.data.companies);
        } else if (isSubscribed) {
          setCompanies([]);
        }
      } catch (err) {
        if (isSubscribed) setCompanies([]);
      } finally {
        if (isSubscribed) setIsLoading(false);
      }
    }, 150);

    return () => {
      isSubscribed = false;
      clearTimeout(timer);
    };
  }, [search, selectedCategory, selectedCity]);

  const resetFilters = () => {
    setSearch("");
    setSelectedCategory("Toutes");
    setSelectedCity("all");
  };

  return (
    <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Page Header */}
      <div className="mb-8 sm:mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold mb-3">
          <span>Annuaire National</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Annuaire des Services Après-Vente
        </h1>
        <p className="text-base text-slate-600 mt-2 max-w-2xl">
          Recherchez et filtrez les entreprises par secteur ou localisation pour trouver leurs canaux de contact officiels.
        </p>
      </div>

      {/* Filter Controls Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 mb-8 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search Input */}
          <div className="flex-1 relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher par nom d'entreprise ou mot-clé..."
              className="w-full pl-10 pr-10 py-2.5 text-sm text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* City Dropdown */}
          <div className="w-full md:w-56 relative">
            <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full pl-9 pr-8 py-2.5 text-sm text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all appearance-none cursor-pointer"
            >
              <option value="all">Toutes les villes</option>
              <option value="Brazzaville">Brazzaville</option>
              <option value="Pointe-Noire">Pointe-Noire</option>
              <option value="Dolisie">Dolisie</option>
            </select>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none pt-2 border-t border-slate-100">
          <button
            onClick={() => setSelectedCategory("Toutes")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedCategory === "Toutes"
                ? "bg-emerald-600 text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Toutes les catégories
          </button>
          {categories.map((cat) => (
            <button
              key={cat.name}
              onClick={() => setSelectedCategory(cat.name)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === cat.name
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {cat.name} ({cat.count})
            </button>
          ))}
        </div>
      </div>

      {/* Results Info & Reset */}
      <div className="flex items-center justify-between text-xs text-slate-500 mb-6">
        <span>
          {isLoading ? "Recherche en cours..." : `${companies.length} entreprise${companies.length > 1 ? "s" : ""} trouvée${companies.length > 1 ? "s" : ""}`}
        </span>
        {(search || selectedCategory !== "Toutes" || selectedCity !== "all") && (
          <button
            onClick={resetFilters}
            className="inline-flex items-center gap-1 font-semibold text-emerald-700 hover:text-emerald-800"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Réinitialiser les filtres</span>
          </button>
        )}
      </div>

      {/* Companies Grid or Empty State */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mb-3" />
          <p className="text-sm">Chargement des entreprises...</p>
        </div>
      ) : companies.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
          {companies.map((comp) => (
            <CompanyCard key={comp.id} company={comp} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-lg mx-auto">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
            <Building className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-1">
            Aucune entreprise ne correspond à votre recherche
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 mb-6 leading-relaxed">
            Essayez de modifier votre terme de recherche ou d&apos;élargir les filtres de secteur et de ville.
          </p>
          <button
            onClick={resetFilters}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition-colors"
          >
            Voir toutes les entreprises
          </button>
        </div>
      )}
    </main>
  );
}

export default function EntreprisesDirectoryPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <TopInfoBar />
      <PublicNavbar />
      <Suspense
        fallback={
          <div className="flex-1 max-w-7xl mx-auto px-4 py-20 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          </div>
        }
      >
        <EntreprisesDirectoryContent />
      </Suspense>
      <PublicFooter />
    </div>
  );
}
