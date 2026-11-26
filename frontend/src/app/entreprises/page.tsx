"use client";

import React, { useState, useEffect, useMemo, useRef, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { PublicNavbar } from "@/components/public/PublicNavbar";
import { Footer } from "@/components/landing/Footer";
import { DirectoryCompanyCard } from "@/components/public/DirectoryCompanyCard";
import { PublicCompany, PublicCategory } from "@/types/public";
import {
  Search,
  X,
  Building2,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  ArrowRight,
  Layers,
  Store,
  UtensilsCrossed,
  Truck,
  Laptop,
} from "lucide-react";

const SECTOR_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  "Alimentation et restauration": UtensilsCrossed,
  "Transport et livraison": Truck,
  "Commerce et boutique": Store,
  "Technologie et informatique": Laptop,
  "Autre": Building2,
};

function CardSkeleton() {
  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 flex flex-col justify-between h-72 animate-pulse shadow-sm">
      <div className="aspect-[16/9] w-full rounded-2xl bg-slate-100" />
      <div className="space-y-2 pt-4">
        <div className="w-1/3 h-3 bg-slate-100 rounded" />
        <div className="w-3/4 h-5 bg-slate-200 rounded" />
        <div className="w-full h-3 bg-slate-100 rounded" />
      </div>
      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
        <div className="w-20 h-3 bg-slate-100 rounded" />
        <div className="w-24 h-3 bg-slate-200 rounded" />
      </div>
    </div>
  );
}

function ProInviteCard() {
  return (
    <aside
      aria-label="Espace professionnel Zalisk"
      className="col-span-1 md:col-span-2 lg:col-span-3 rounded-3xl bg-[#0D1B3D] text-white p-6 sm:p-8 border border-slate-800 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-6 my-2"
    >
      <div className="space-y-2 max-w-xl">
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
          Espace Enseignes
        </span>
        <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-snug">
          Vous dirigez un commerce ou une entreprise ?
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
          Rendez votre équipe accessible à vos clients et structurez votre service après-vente en créant votre espace public sur Zalisk.
        </p>
      </div>

      <Link
        href="/register"
        className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm transition-all active:scale-[0.97] shrink-0 shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
      >
        <span>Référencer mon entreprise</span>
        <ArrowRight className="w-4 h-4" />
      </Link>
    </aside>
  );
}

function EntreprisesDirectoryContent() {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get("search") || "";
  const initialCategory = searchParams.get("category") || "Toutes";

  const [search, setSearch] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedCity, setSelectedCity] = useState("all");
  const [sortBy, setSortBy] = useState<"name" | "recent">("name");

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(9);

  const [companies, setCompanies] = useState<PublicCompany[]>([]);
  const [categories, setCategories] = useState<PublicCategory[]>([]);
  const [totalDirectoryCount, setTotalDirectoryCount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Raccourci clavier ⌘K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
        searchInputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Chargement des catégories réelles et calcul du total réel de l'annuaire
  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await fetch("/api/public/companies/categories");
        const json = await res.json();
        const cats: PublicCategory[] = json.categories || json.data?.categories || [];
        if (json.success && cats.length > 0) {
          setCategories(cats);
          const sum = cats.reduce((acc, c) => acc + (Number(c.count) || 0), 0);
          setTotalDirectoryCount(sum);
        }
      } catch (err) {
        console.error("Échec du chargement des catégories:", err);
      }
    }
    loadCategories();
  }, []);

  const fetchCompanies = async () => {
    setIsLoading(true);
    const query = new URLSearchParams();
    if (search.trim()) query.set("search", search.trim());
    if (selectedCategory && selectedCategory !== "Toutes" && selectedCategory !== "all") {
      query.set("category", selectedCategory);
    }
    if (selectedCity && selectedCity !== "all") {
      query.set("city", selectedCity);
    }

    try {
      const res = await fetch(`/api/public/companies?${query.toString()}`);
      const json = await res.json();
      const list: PublicCompany[] = json.companies || json.data?.companies || [];
      setCompanies(list);
      if (
        !search.trim() &&
        (selectedCategory === "Toutes" || selectedCategory === "all") &&
        selectedCity === "all" &&
        totalDirectoryCount === null
      ) {
        setTotalDirectoryCount(list.length);
      }
      setCurrentPage(1);
    } catch {
      setCompanies([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCompanies();
    }, 120);
    return () => clearTimeout(timer);
  }, [search, selectedCategory, selectedCity]);

  const availableCities = useMemo(() => {
    const set = new Set<string>();
    companies.forEach((c) => {
      if (c.city && c.city.trim()) set.add(c.city.trim());
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [companies]);

  const sortedCompanies = useMemo(() => {
    const list = [...companies];
    if (sortBy === "name") {
      list.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    } else if (sortBy === "recent") {
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    return list;
  }, [companies, sortBy]);

  const totalPages = Math.max(1, Math.ceil(sortedCompanies.length / itemsPerPage));
  const paginatedCompanies = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedCompanies.slice(start, start + itemsPerPage);
  }, [sortedCompanies, currentPage, itemsPerPage]);

  const isFiltered = Boolean(
    search ||
      (selectedCategory !== "Toutes" && selectedCategory !== "all") ||
      selectedCity !== "all"
  );

  const resetFilters = () => {
    setSearch("");
    setSelectedCategory("Toutes");
    setSelectedCity("all");
    setSortBy("name");
    setCurrentPage(1);
  };

  const allTabCount = totalDirectoryCount !== null ? totalDirectoryCount : companies.length;

  return (
    <div className="flex-1 flex flex-col">
      {/* 1. EN-TÊTE COMPACTE & ORIENTÉE ACTION */}
      <section
        aria-label="Recherche et filtres"
        className="w-full pt-24 sm:pt-28 pb-6 sm:pb-8 px-4 sm:px-6 lg:px-8 border-b border-slate-200/80 bg-white"
      >
        <div className="max-w-4xl mx-auto text-center space-y-5">
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-4xl font-black text-[#0D1B3D] tracking-tight leading-tight">
              Annuaire des Services Clients
            </h1>
            <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto leading-relaxed">
              Trouvez une entreprise certifiée sur Zalisk et ouvrez directement un échange avec son service après-vente.
            </p>
          </div>

          {/* Barre de recherche principale */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              fetchCompanies();
            }}
            className="max-w-2xl mx-auto"
          >
            <div className="relative bg-white rounded-full border border-slate-300/90 shadow-sm p-1.5 pl-4 sm:pl-5 flex items-center gap-2.5 transition-shadow focus-within:ring-2 focus-within:ring-[#0D1B3D] focus-within:border-[#0D1B3D]">
              <Search className="w-5 h-5 text-slate-400 shrink-0" />
              <input
                ref={searchInputRef}
                data-directory-search="true"
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher une entreprise, un secteur, une ville..."
                aria-label="Rechercher une entreprise dans l'annuaire"
                enterKeyHint="search"
                className="w-full bg-transparent text-sm sm:text-base text-slate-900 placeholder:text-slate-400 focus:outline-none"
                style={{ fontSize: "16px" }}
              />

              <div className="flex items-center gap-1.5 shrink-0">
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="p-2 text-slate-500 hover:text-slate-800 rounded-full transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0D1B3D]"
                    title="Effacer la recherche"
                    aria-label="Effacer le texte recherché"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}

                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-4 sm:px-5 py-2.5 rounded-full bg-[#0D1B3D] hover:bg-[#182C5E] text-white font-bold text-xs sm:text-sm transition-colors cursor-pointer active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0D1B3D] focus-visible:ring-offset-2"
                >
                  <span>Rechercher</span>
                  <kbd className="hidden sm:inline text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/15 text-slate-100">
                    ⌘K
                  </kbd>
                </button>
              </div>
            </div>
          </form>

          {/* 2. FILTRES PAR SECTEURS (Pilules lisibles sans troncature) */}
          <div className="pt-1">
            <div className="flex sm:flex-wrap items-center justify-start sm:justify-center gap-2 overflow-x-auto sm:overflow-visible [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden py-1 px-1">
              <button
                type="button"
                onClick={() => setSelectedCategory("Toutes")}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0D1B3D] ${
                  selectedCategory === "Toutes" || selectedCategory === "all"
                    ? "bg-[#0D1B3D] text-white shadow-sm"
                    : "bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200"
                }`}
              >
                <Layers className="w-3.5 h-3.5 shrink-0" />
                <span>Toutes</span>
                <span
                  className={`text-[11px] font-mono px-1.5 py-0.5 rounded-full ${
                    selectedCategory === "Toutes" || selectedCategory === "all"
                      ? "bg-white/20 text-white"
                      : "bg-slate-200/70 text-slate-700"
                  }`}
                >
                  {allTabCount}
                </span>
              </button>

              {categories.map((cat) => {
                const isSelected = selectedCategory === cat.name;
                const IconComponent = SECTOR_ICONS[cat.name] || Building2;

                return (
                  <button
                    key={cat.name}
                    type="button"
                    onClick={() => setSelectedCategory(isSelected ? "Toutes" : cat.name)}
                    className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0D1B3D] ${
                      isSelected
                        ? "bg-[#0D1B3D] text-white shadow-sm"
                        : "bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200"
                    }`}
                  >
                    <IconComponent className="w-3.5 h-3.5 shrink-0" />
                    <span>{cat.name}</span>
                    <span
                      className={`text-[11px] font-mono px-1.5 py-0.5 rounded-full ${
                        isSelected
                          ? "bg-white/20 text-white"
                          : "bg-slate-200/70 text-slate-700"
                      }`}
                    >
                      {cat.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* 3. CATALOGUE DES ENSEIGNES (Grille homogène sans trous asymétriques) */}
      <section
        aria-label="Catalogue des enseignes"
        className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10"
      >
        <div className="space-y-6">
          {/* Barre de commande */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
              <Building2 className="w-4 h-4 text-[#0D1B3D]" />
              <span>
                {sortedCompanies.length} enseigne{sortedCompanies.length > 1 ? "s" : ""}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {availableCities.length > 0 && (
                <label className="flex items-center gap-1.5 text-xs text-slate-600">
                  <span>Ville :</span>
                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 font-semibold text-slate-700 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0D1B3D]"
                  >
                    <option value="all">Toutes</option>
                    {availableCities.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                </label>
              )}

              <label className="flex items-center gap-1.5 text-xs text-slate-600">
                <span>Trier :</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as "name" | "recent")}
                  className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 font-semibold text-slate-700 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0D1B3D]"
                >
                  <option value="name">Nom (A - Z)</option>
                  <option value="recent">Plus récentes</option>
                </select>
              </label>

              {isFiltered && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="text-xs text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1 cursor-pointer transition-colors px-2 py-1 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Réinitialiser</span>
                </button>
              )}
            </div>
          </div>

          {/* Grille régulière 1 / 2 / 3 colonnes */}
          <div>
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <CardSkeleton key={i} />
                ))}
              </div>
            ) : paginatedCompanies.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedCompanies.map((company, index) => (
                  <React.Fragment key={company.id}>
                    <DirectoryCompanyCard
                      company={company}
                      index={(currentPage - 1) * itemsPerPage + index}
                    />
                    {index === 2 && paginatedCompanies.length > 3 && <ProInviteCard />}
                  </React.Fragment>
                ))}

                {paginatedCompanies.length <= 3 && <ProInviteCard />}
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 text-center space-y-4 shadow-sm my-6">
                <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mx-auto">
                  <Building2 className="w-6 h-6" />
                </div>
                <div className="space-y-1.5 max-w-md mx-auto">
                  <h3 className="text-base font-bold text-slate-900">
                    Aucune enseigne ne correspond à votre recherche
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Essayez de modifier votre mot-clé ou de réinitialiser les filtres pour
                    explorer l&apos;ensemble des entreprises disponibles.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#0D1B3D] text-white rounded-xl text-xs font-semibold hover:bg-[#182C5E] transition-colors cursor-pointer shadow-sm active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0D1B3D] focus-visible:ring-offset-2"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Réinitialiser les filtres</span>
                </button>
              </div>
            )}
          </div>

          {/* Pagination */}
          {paginatedCompanies.length > 0 && totalPages > 1 && (
            <nav
              aria-label="Pagination"
              className="pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600"
            >
              <label className="flex items-center gap-2">
                <span>Afficher</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-slate-700 font-semibold cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0D1B3D]"
                >
                  <option value={6}>6</option>
                  <option value={9}>9</option>
                  <option value={12}>12</option>
                </select>
                <span>par page</span>
              </label>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="w-8 h-8 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0D1B3D]"
                  aria-label="Page précédente"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {Array.from({ length: totalPages }).map((_, idx) => {
                  const pageNum = idx + 1;
                  const isActive = currentPage === pageNum;
                  return (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => setCurrentPage(pageNum)}
                      aria-current={isActive ? "page" : undefined}
                      className={`w-8 h-8 rounded-lg font-bold text-xs transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0D1B3D] ${
                        isActive
                          ? "bg-[#0D1B3D] text-white shadow-sm"
                          : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 shadow-sm"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  type="button"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="w-8 h-8 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0D1B3D]"
                  aria-label="Page suivante"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </nav>
          )}
        </div>
      </section>

      <Footer brandName="Zalisk" />
    </div>
  );
}

export default function EntreprisesDirectoryPage() {
  return (
    <div
      className="min-h-screen flex flex-col bg-[#F8FAFC]"
      style={{
        paddingTop: "env(safe-area-inset-top, 0px)",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      <PublicNavbar />
      <Suspense
        fallback={
          <div className="flex-1 max-w-7xl mx-auto px-4 py-28 flex items-center justify-center w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
              {Array.from({ length: 6 }).map((_, i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          </div>
        }
      >
        <EntreprisesDirectoryContent />
      </Suspense>
    </div>
  );
}
