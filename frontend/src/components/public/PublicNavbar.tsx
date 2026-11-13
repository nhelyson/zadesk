"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/ui/Logo";
import {
  Building2,
  Menu,
  X,
  Search,
  ChevronRight,
  ArrowRight,
  User,
} from "lucide-react";

export function PublicNavbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  const navLinks = [
    { label: "Accueil", href: "/" },
    { label: "Commerces & Services", href: "/entreprises" },
    { label: "Notre approche", href: "/#conversation-not-ticket" },
    { label: "Secteurs", href: "/#secteurs" },
    { label: "Tarifs", href: "/#tarifs" },
    { label: "FAQ", href: "/#faq" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 py-3 sm:py-3.5 bg-white/90 backdrop-blur-xl border-b border-slate-200/80 shadow-[0_2px_12px_-4px_rgba(13,27,61,0.04)] ${
        !mounted ? "opacity-0 -translate-y-2" : "opacity-100 translate-y-0"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          
          {/* ======================================================== */}
          {/* 1. LOGO PRINCIPAL (Thème Clair & Lumineux)              */}
          {/* ======================================================== */}
          <div className="flex items-center gap-8">
            <Link
              href="/"
              className="flex items-center gap-3 group focus:outline-none transition-transform duration-150 active:scale-[0.98]"
              aria-label="Accueil Zadesk"
            >
              <Logo size="md" isDark={false} />
            </Link>

            {/* Navigation Éditoriale Desktop */}
            <nav
              aria-label="Navigation principale"
              className="hidden lg:flex items-center gap-1.5 text-[13.5px] font-medium tracking-[-0.01em]"
            >
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.label}
                    href={link.href}
                    className={`px-3.5 py-1.5 rounded-full transition-all duration-150 ${
                      isActive
                        ? "text-slate-950 bg-slate-100 border border-slate-200/90 font-semibold shadow-2xs"
                        : "text-slate-600 hover:text-slate-950 hover:bg-slate-50"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* ======================================================== */}
          {/* 2. ACTIONS DESKTOP                                      */}
          {/* ======================================================== */}
          <div className="hidden md:flex items-center gap-3">
            {/* Déclencheur Focus Recherche / Raccourci ⌘K */}
            <button
              type="button"
              onClick={() => {
                const input = document.querySelector<HTMLInputElement>(
                  'input[data-directory-search="true"]'
                );
                if (input) {
                  input.focus();
                  input.scrollIntoView({ behavior: "smooth", block: "center" });
                }
              }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium text-slate-600 hover:text-slate-950 hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-all cursor-pointer"
              title="Rechercher dans l'annuaire (⌘K)"
            >
              <Search className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden xl:inline">Rechercher</span>
              <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 border border-slate-200/80">
                ⌘K
              </kbd>
            </button>

            <div className="h-4 w-px bg-slate-200" />

            {/* Connexion Utilisateur */}
            <Link
              href="/login"
              className="text-xs font-medium text-slate-600 hover:text-slate-950 px-2.5 py-1.5 transition-colors"
            >
              Connexion
            </Link>

            {/* Espace Entreprise CTA */}
            <Link
              href="/app"
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-full bg-[#0D1B3D] hover:bg-[#182C5E] text-white transition-all shadow-xs active:scale-95"
            >
              <Building2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Espace entreprise</span>
            </Link>
          </div>

          {/* ======================================================== */}
          {/* 3. MOBILE MENU TOGGLE                                   */}
          {/* ======================================================== */}
          <div className="flex md:hidden items-center gap-2">
            <Link
              href="/app"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full bg-slate-100 text-slate-800 border border-slate-200 transition-all"
            >
              <Building2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Espace pro</span>
            </Link>

            <button
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? "Fermer le menu" : "Ouvrir le menu"}
              className="p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 4. MOBILE DRAWER (Élégant, Lumineux, Safe Areas)         */}
      {/* ======================================================== */}
      {mobileOpen && (
        <div
          className="md:hidden mt-3 border-b border-slate-200 bg-white/98 backdrop-blur-xl px-4 pt-3 pb-6 space-y-4 shadow-xl animate-in slide-in-from-top-2 duration-200"
          style={{ paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))" }}
        >
          <div className="flex flex-col space-y-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? "text-emerald-800 bg-emerald-50/70 font-semibold"
                      : "text-slate-800 hover:bg-slate-50"
                  }`}
                >
                  <span>{link.label}</span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </Link>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2.5">
            <Link
              href="/app"
              onClick={() => setMobileOpen(false)}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 text-xs sm:text-sm font-semibold rounded-xl bg-[#0D1B3D] hover:bg-[#182C5E] text-white shadow-sm transition-all"
            >
              <Building2 className="w-4 h-4 text-emerald-400" />
              <span>Accéder à l&apos;Espace Entreprise</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/login"
              onClick={() => setMobileOpen(false)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition-all"
            >
              <User className="w-3.5 h-3.5" />
              <span>Se connecter</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}