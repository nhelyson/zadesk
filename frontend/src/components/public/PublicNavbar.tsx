"use client";

import React, { useState } from "react";
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
  const pathname = usePathname();
  const isDirectoryPage = pathname === "/entreprises";

  const navLinks = [
    { label: "Accueil", href: "/" },
    { label: "Commerces & Services", href: "/entreprises" },
    { label: "Notre approche", href: "/#conversation-not-ticket" },
    { label: "Secteurs", href: "/#secteurs" },
    { label: "Tarifs", href: "/#tarifs" },
    { label: "FAQ", href: "/#faq" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 py-3 sm:py-3.5 bg-white/95 backdrop-blur-xl border-b border-slate-200/80 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo principal & Navigation */}
          <div className="flex items-center gap-8">
            <Link
              href="/"
              className="flex items-center gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0D1B3D] rounded-lg transition-transform duration-150 active:scale-[0.98]"
              aria-label="Accueil Zalisk"
            >
              <Logo size="md" isDark={false} brandName="Zalisk" />
            </Link>

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
                    className={`px-3.5 py-1.5 rounded-full transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0D1B3D] ${
                      isActive
                        ? "text-slate-950 bg-slate-100 border border-slate-200 font-semibold"
                        : "text-slate-600 hover:text-slate-950 hover:bg-slate-50"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Actions Desktop */}
          <div className="hidden md:flex items-center gap-3">
            {!isDirectoryPage && (
              <>
                <Link
                  href="/entreprises"
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium text-slate-600 hover:text-slate-950 hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0D1B3D]"
                >
                  <Search className="w-3.5 h-3.5 text-slate-500" />
                  <span>Annuaire</span>
                </Link>
                <div className="h-4 w-px bg-slate-200" />
              </>
            )}

            <Link
              href="/login"
              className="text-xs font-semibold text-slate-700 hover:text-slate-950 px-3 py-1.5 rounded-full hover:bg-slate-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0D1B3D]"
            >
              Connexion
            </Link>

            <Link
              href="/app"
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-full bg-[#0D1B3D] hover:bg-[#182C5E] text-white transition-all shadow-sm active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0D1B3D] focus-visible:ring-offset-2"
            >
              <Building2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Espace entreprise</span>
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex md:hidden items-center gap-2">
            <Link
              href="/app"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full bg-slate-100 text-slate-800 border border-slate-200 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0D1B3D]"
            >
              <Building2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Espace pro</span>
            </Link>

            <button
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? "Fermer le menu" : "Ouvrir le menu"}
              aria-expanded={mobileOpen}
              className="p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0D1B3D]"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div
          className="md:hidden mt-3 border-b border-slate-200 bg-white px-4 pt-3 pb-6 space-y-4 shadow-xl"
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
                      ? "text-emerald-900 bg-emerald-50 font-semibold"
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
