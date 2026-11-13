"use client";

import React, { useState, useEffect, useMemo, useRef, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { PublicNavbar } from "@/components/public/PublicNavbar";
import { Footer } from "@/components/landing/Footer";
import { DirectoryCompanyCard } from "@/components/public/DirectoryCompanyCard";
import { PublicCompany, PublicCategory } from "@/types/public";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Search,
  X,
  Building2,
  MapPin,
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

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// Icônes représentatives par secteur
const SECTOR_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  "Alimentation et restauration": UtensilsCrossed,
  "Transport et livraison": Truck,
  "Commerce et boutique": Store,
  "Technologie et informatique": Laptop,
  "Autre": Building2,
};

// Squelette de chargement éditorial sans CLS
function CardSkeleton() {
  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-5 flex flex-col justify-between h-72 animate-pulse shadow-2xs">
      <div className="aspect-16/10 w-full rounded-2xl bg-slate-100" />
      <div className="space-y-2 pt-4">
        <div className="w-1/3 h-3 bg-slate-100 rounded" />
        <div className="w-3/4 h-5 bg-slate-200 rounded" />
        <div className="w-full h-3 bg-slate-100 rounded" />
      </div>
      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
        <div className="w-20 h-3 bg-slate-100 rounded" />
        <div className="w-16 h-3 bg-slate-200 rounded" />
      </div>
    </div>
  );
}

// Cartel professionnel sobre inséré avec discrétion dans le catalogue
function ProInviteCard() {
  return (
    <aside
      aria-label="Espace professionnel"
      className="col-span-1 md:col-span-2 lg:col-span-3 rounded-3xl bg-[#0D1B3D] text-white p-6 sm:p-8 border border-slate-800 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-6 my-2 relative overflow-hidden"
    >
      <div className="space-y-2 max-w-xl relative z-10">
        <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
          Espace Enseignes
        </span>
        <h4 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-snug">
          Vous dirigez un commerce ou une entreprise ?
        </h4>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
          Rendez votre équipe accessible à vos clients et structurez vos échanges en créant votre espace public sur Zadesk.
        </p>
      </div>

      <Link
        href="/register"
        className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm transition-all active:scale-[0.97] shrink-0 shadow-xs relative z-10"
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

  // États de filtrage et recherche
  const [search, setSearch] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedCity, setSelectedCity] = useState("all");
  const [sortBy, setSortBy] = useState<"name" | "recent">("name");

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(9);

  // Données
  const [companies, setCompanies] = useState<PublicCompany[]>([]);
  const [categories, setCategories] = useState<PublicCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Refs pour GSAP & focus
  const heroContainerRef = useRef<HTMLDivElement>(null);
  const heroHeaderRef = useRef<HTMLDivElement>(null);
  const heroSearchRef = useRef<HTMLDivElement>(null);
  const categoryTilesRef = useRef<HTMLDivElement>(null);
  const catalogSectionRef = useRef<HTMLDivElement>(null);
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

  // Chargement des catégories réelles depuis l'API
  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await fetch("/api/public/companies/categories");
        const json = await res.json();
        const cats = json.categories || json.data?.categories || [];
        if (json.success && cats.length > 0) {
          setCategories(cats);
        }
      } catch (err) {
        console.error("Échec du chargement des catégories:", err);
      }
    }
    loadCategories();
  }, []);

  // Requête API pour charger les entreprises filtrées
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
      setCurrentPage(1);
    } catch (err) {
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

  // Villes réelles issues des entreprises enregistrées
  const availableCities = useMemo(() => {
    const set = new Set<string>();
    companies.forEach((c) => {
      if (c.city && c.city.trim()) set.add(c.city.trim());
    });
    return Array.from(set);
  }, [companies]);

  // Tri côté client
  const sortedCompanies = useMemo(() => {
    const list = [...companies];
    if (sortBy === "name") {
      list.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    } else if (sortBy === "recent") {
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    return list;
  }, [companies, sortBy]);

  // Pagination
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

  // Animation d'entrée GSAP
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion || !heroContainerRef.current) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.fromTo(
        heroHeaderRef.current,
        { opacity: 0, y: 14 },
        { opacity: 1, y: 0, duration: 0.5 }
      )
        .fromTo(
          heroSearchRef.current,
          { opacity: 0, y: 16, scale: 0.99 },
          { opacity: 1, y: 0, scale: 1, duration: 0.5 },
          "-=0.25"
        )
        .fromTo(
          categoryTilesRef.current,
          { opacity: 0, y: 12 },
          { opacity: 1, y: 0, duration: 0.5 },
          "-=0.25"
        );
    }, heroContainerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div className="flex-1 flex flex-col">
      {/* ======================================================== */}
      {/* 1. EN-TÊTE CENTRÉE & ÉPURÉE (Inspirée de ClassiAds)      */}
      {/* ======================================================== */}
      <section
        ref={heroContainerRef}
        aria-label="Recherche et filtres"
        className="w-full relative pt-28 sm:pt-32 pb-8 sm:pb-10 px-4 sm:px-6 lg:px-8 border-b border-slate-200/80 bg-gradient-to-b from-white via-[#F8FAFC] to-[#F8FAFC]"
      >
        <div className="max-w-4xl mx-auto text-center space-y-6">
          
          {/* Titre & Sous-Titre Directs */}
          <div ref={heroHeaderRef} className="space-y-3">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-[#0D1B3D] tracking-tight leading-[1.08]">
              Commerces &amp; Services
            </h1>

            <p className="text-sm sm:text-base md:text-lg text-slate-500 max-w-xl mx-auto leading-relaxed font-normal">
              Retrouvez vos enseignes locales et contactez-les directement.
            </p>
          </div>

          {/* Capsule de Recherche Flottante Centrée */}
          <div ref={heroSearchRef} className="max-w-2xl mx-auto pt-1">
            <div className="relative bg-white rounded-full border border-slate-200/90 shadow-[0_10px_35px_rgba(13,27,61,0.06)] p-2 pl-5 sm:pl-6 flex items-center gap-3 transition-all focus-within:ring-2 focus-within:ring-[#0D1B3D]">
              <Search className="w-5 h-5 text-slate-400 shrink-0" />
              <input
                ref={searchInputRef}
                data-directory-search="true"
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher une enseigne, un commerce, une ville..."
                enterKeyHint="search"
                className="w-full bg-transparent text-sm sm:text-base text-slate-900 placeholder:text-slate-400 focus:outline-hidden"
                style={{ fontSize: "16px" }}
              />

              <div className="flex items-center gap-2 pr-1 shrink-0">
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full transition-colors cursor-pointer active:scale-95"
                    title="Effacer la recherche"
                    aria-label="Effacer le texte recherché"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}

                {/* Bouton de recherche intégré en pilule */}
                <button
                  type="button"
                  onClick={() => fetchCompanies()}
                  className="inline-flex items-center gap-1.5 px-5 sm:px-6 py-2.5 rounded-full bg-[#0D1B3D] hover:bg-[#182C5E] text-white font-bold text-xs sm:text-sm transition-all shadow-xs cursor-pointer active:scale-[0.97]"
                >
                  <span>Rechercher</span>
                  <kbd className="hidden sm:inline text-[9px] font-mono px-1 py-0.5 rounded bg-white/20 text-slate-200">
                    ⌘K
                  </kbd>
                </button>
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* 2. HUB DES CATÉGORIES (Tuiles Desktop + Ruban Mobile)    */}
          {/* ======================================================== */}
          <div ref={categoryTilesRef} className="pt-2">
            
            {/* Version Desktop & Tablette : Tuiles carrées aérées (ClassiAds) */}
            <div className="hidden sm:grid grid-cols-3 md:grid-cols-6 gap-3 max-w-4xl mx-auto">
              
              {/* Tuile "Toutes" */}
              <button
                type="button"
                onClick={() => setSelectedCategory("Toutes")}
                className={`p-3.5 sm:p-4 rounded-2xl flex flex-col items-center justify-center gap-2 border transition-all duration-200 cursor-pointer active:scale-[0.97] ${
                  selectedCategory === "Toutes" || selectedCategory === "all"
                    ? "bg-[#0D1B3D] text-white border-[#0D1B3D] shadow-md -translate-y-0.5"
                    : "bg-white text-slate-700 hover:bg-slate-50 border-slate-200/80 shadow-2xs hover:border-slate-300"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                    selectedCategory === "Toutes" || selectedCategory === "all"
                      ? "bg-white/20 text-white"
                      : "bg-slate-100 text-[#0D1B3D]"
                  }`}
                >
                  <Layers className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-center leading-tight truncate w-full">
                  Toutes
                </span>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                    selectedCategory === "Toutes" || selectedCategory === "all"
                      ? "bg-white/20 text-white"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {companies.length}
                </span>
              </button>

              {/* Tuiles par Secteur réel */}
              {categories.map((cat) => {
                const isSelected = selectedCategory === cat.name;
                const IconComponent = SECTOR_ICONS[cat.name] || Building2;

                return (
                  <button
                    key={cat.name}
                    type="button"
                    onClick={() => setSelectedCategory(isSelected ? "Toutes" : cat.name)}
                    className={`p-3.5 sm:p-4 rounded-2xl flex flex-col items-center justify-center gap-2 border transition-all duration-200 cursor-pointer active:scale-[0.97] ${
                      isSelected
                        ? "bg-[#0D1B3D] text-white border-[#0D1B3D] shadow-md -translate-y-0.5"
                        : "bg-white text-slate-700 hover:bg-slate-50 border-slate-200/80 shadow-2xs hover:border-slate-300"
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                        isSelected ? "bg-white/20 text-white" : "bg-slate-100 text-[#0D1B3D]"
                      }`}
                    >
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold text-center leading-tight truncate w-full">
                      {cat.name}
                    </span>
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                        isSelected ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {cat.count}
                    </span>
                  </button>
                );
              })}

            </div>

            {/* Version Mobile : Ruban tactile horizontal fluide (Inspiré de @uix.vikram) */}
            <div className="flex sm:hidden items-center gap-2 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden snap-x py-1 px-1">
              
              {/* Pilule "Toutes" */}
              <button
                type="button"
                onClick={() => setSelectedCategory("Toutes")}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer shrink-0 snap-start active:scale-[0.97] ${
                  selectedCategory === "Toutes" || selectedCategory === "all"
                    ? "bg-[#0D1B3D] text-white shadow-xs"
                    : "bg-white hover:bg-slate-100 text-slate-700 border border-slate-200/80 shadow-2xs"
                }`}
              >
                <Layers className="w-3.5 h-3.5 shrink-0" />
                <span>Toutes</span>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${
                    selectedCategory === "Toutes" || selectedCategory === "all"
                      ? "bg-white/20 text-white"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {companies.length}
                </span>
              </button>

              {/* Pilules par secteur */}
              {categories.map((cat) => {
                const isSelected = selectedCategory === cat.name;
                const IconComponent = SECTOR_ICONS[cat.name] || Building2;

                return (
                  <button
                    key={cat.name}
                    type="button"
                    onClick={() => setSelectedCategory(isSelected ? "Toutes" : cat.name)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer shrink-0 snap-start active:scale-[0.97] ${
                      isSelected
                        ? "bg-[#0D1B3D] text-white shadow-xs"
                        : "bg-white hover:bg-slate-100 text-slate-700 border border-slate-200/80 shadow-2xs"
                    }`}
                  >
                    <IconComponent className="w-3.5 h-3.5 shrink-0" />
                    <span>{cat.name}</span>
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${
                        isSelected ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
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

      {/* ======================================================== */}
      {/* 3. CATALOGUE CURATÉ DES ENSEIGNES (ACCÈS DIRECT)        */}
      {/* ======================================================== */}
      <section
        ref={catalogSectionRef}
        aria-label="Catalogue des enseignes"
        className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10"
      >
        <div className="space-y-6">
          
          {/* Barre de Commande & Filtres du Catalogue */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
              <Building2 className="w-4 h-4 text-[#0D1B3D]" />
              <span>
                {sortedCompanies.length} enseigne{sortedCompanies.length > 1 ? "s" : ""}
              </span>
            </div>

            <div className="flex items-center gap-3">
              {/* Filtre Ville (si > 0) */}
              {availableCities.length > 0 && (
                <div className="flex items-center gap-1.5 text-xs text-slate-600">
                  <span>Ville :</span>
                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 font-semibold text-slate-700 cursor-pointer focus:outline-hidden"
                  >
                    <option value="all">Toutes</option>
                    {availableCities.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Tri */}
              <div className="flex items-center gap-1.5 text-xs text-slate-600">
                <span>Trier :</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as "name" | "recent")}
                  className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 font-semibold text-slate-700 cursor-pointer focus:outline-hidden"
                >
                  <option value="name">Nom (A - Z)</option>
                  <option value="recent">Plus récents</option>
                </select>
              </div>

              {/* Réinitialiser si filtré */}
              {isFiltered && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="text-xs text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span className="hidden sm:inline">Réinitialiser</span>
                </button>
              )}
            </div>
          </div>

          {/* Grille Asymétrique & Rythmée du Catalogue */}
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
                    {/* Insertion rythmée d'un cartel pro après la 3ème enseigne */}
                    {index === 2 && paginatedCompanies.length > 3 && <ProInviteCard />}
                  </React.Fragment>
                ))}

                {/* Si moins de 3 enseignes, afficher le cartel pro à la fin */}
                {paginatedCompanies.length <= 3 && <ProInviteCard />}
              </div>
            ) : (
              /* État vide soigné */
              <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 text-center space-y-4 shadow-2xs my-6">
                <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                  <Building2 className="w-6 h-6" />
                </div>
                <div className="space-y-1.5 max-w-md mx-auto">
                  <h3 className="text-base font-bold text-slate-900">
                    Aucune enseigne ne correspond à votre recherche
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                    Essayez de modifier votre mot-clé ou de réinitialiser les filtres pour
                    explorer l&apos;ensemble des commerces et services.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#0D1B3D] text-white rounded-xl text-xs font-semibold hover:bg-emerald-600 transition-colors cursor-pointer shadow-xs active:scale-95"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Réinitialiser les filtres</span>
                </button>
              </div>
            )}
          </div>

          {/* Pagination sobre et fonctionnelle */}
          {paginatedCompanies.length > 0 && totalPages > 1 && (
            <nav
              aria-label="Pagination"
              className="pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500"
            >
              {/* Sélecteur du nombre par page */}
              <div className="flex items-center gap-2">
                <span>Afficher</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-slate-700 font-semibold cursor-pointer focus:outline-hidden"
                >
                  <option value={6}>6</option>
                  <option value={9}>9</option>
                  <option value={12}>12</option>
                </select>
                <span>par page</span>
              </div>

              {/* Boutons de navigation */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="w-8 h-8 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors shadow-2xs active:scale-95"
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
                      className={`w-8 h-8 rounded-lg font-bold text-xs transition-colors cursor-pointer active:scale-95 ${
                        isActive
                          ? "bg-[#0D1B3D] text-white shadow-2xs"
                          : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 shadow-2xs"
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
                  className="w-8 h-8 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors shadow-2xs active:scale-95"
                  aria-label="Page suivante"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </nav>
          )}

        </div>
      </section>

      {/* Pied de page unifié Zadesk */}
      <Footer />
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
          <div className="flex-1 max-w-7xl mx-auto px-4 py-24 flex items-center justify-center">
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
