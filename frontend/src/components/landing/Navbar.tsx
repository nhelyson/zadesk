"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { Menu, X, ArrowRight, Download } from "lucide-react";
import { usePWA } from "@/components/pwa/PWAProvider";

type NavTheme = "transparent" | "light" | "navy" | "midnight";

interface ThemeStyles {
  headerBg: string;
  headerBorder: string;
  headerShadow: string;
  isDark: boolean;
  navLinkText: string;
  navLinkHover: string;
  dividerColor: string;
  publicBtnText: string;
  publicBtnBorder: string;
  publicBtnHoverBg: string;
  loginBtnText: string;
  loginBtnHover: string;
  primaryBtnBg: string;
  primaryBtnText: string;
  primaryBtnHover: string;
  mobileToggleText: string;
  mobileToggleHoverBg: string;
  mobileDrawerBg: string;
  mobileDrawerBorder: string;
  mobileDrawerText: string;
  mobileDrawerHover: string;
}

const THEME_STYLES: Record<NavTheme, ThemeStyles> = {
  transparent: {
    headerBg: "bg-transparent",
    headerBorder: "border-transparent",
    headerShadow: "shadow-none",
    isDark: false,
    navLinkText: "text-slate-600",
    navLinkHover: "hover:text-slate-950",
    dividerColor: "bg-slate-200/80",
    publicBtnText: "text-emerald-700",
    publicBtnBorder: "border-emerald-600/25",
    publicBtnHoverBg: "hover:bg-emerald-50/70 hover:border-emerald-600/45",
    loginBtnText: "text-slate-600",
    loginBtnHover: "hover:text-slate-950",
    primaryBtnBg: "bg-slate-950",
    primaryBtnText: "text-white",
    primaryBtnHover: "hover:bg-slate-900",
    mobileToggleText: "text-slate-800",
    mobileToggleHoverBg: "hover:bg-slate-100",
    mobileDrawerBg: "bg-white/98",
    mobileDrawerBorder: "border-slate-200/90",
    mobileDrawerText: "text-slate-800",
    mobileDrawerHover: "hover:bg-slate-50",
  },
  light: {
    headerBg: "bg-white/85 backdrop-blur-xl saturate-150",
    headerBorder: "border-slate-200/60",
    headerShadow: "shadow-[0_2px_12px_-4px_rgba(13,27,61,0.05)]",
    isDark: false,
    navLinkText: "text-slate-600",
    navLinkHover: "hover:text-slate-950",
    dividerColor: "bg-slate-200/80",
    publicBtnText: "text-emerald-700",
    publicBtnBorder: "border-emerald-600/25",
    publicBtnHoverBg: "hover:bg-emerald-50/70 hover:border-emerald-600/45",
    loginBtnText: "text-slate-600",
    loginBtnHover: "hover:text-slate-950",
    primaryBtnBg: "bg-slate-950",
    primaryBtnText: "text-white",
    primaryBtnHover: "hover:bg-slate-900",
    mobileToggleText: "text-slate-800",
    mobileToggleHoverBg: "hover:bg-slate-100",
    mobileDrawerBg: "bg-white/98",
    mobileDrawerBorder: "border-slate-200/90",
    mobileDrawerText: "text-slate-800",
    mobileDrawerHover: "hover:bg-slate-50",
  },
  navy: {
    headerBg: "bg-[#0B1528]/90 backdrop-blur-xl saturate-150",
    headerBorder: "border-slate-800/70",
    headerShadow: "shadow-[0_4px_24px_-4px_rgba(0,0,0,0.5)]",
    isDark: true,
    navLinkText: "text-slate-300",
    navLinkHover: "hover:text-white",
    dividerColor: "bg-slate-800",
    publicBtnText: "text-emerald-400",
    publicBtnBorder: "border-emerald-500/35",
    publicBtnHoverBg: "hover:bg-emerald-950/40 hover:border-emerald-400/50",
    loginBtnText: "text-slate-300",
    loginBtnHover: "hover:text-white",
    primaryBtnBg: "bg-white",
    primaryBtnText: "text-slate-950",
    primaryBtnHover: "hover:bg-slate-100",
    mobileToggleText: "text-slate-100",
    mobileToggleHoverBg: "hover:bg-slate-800/60",
    mobileDrawerBg: "bg-[#0B1528]/98",
    mobileDrawerBorder: "border-slate-800/80",
    mobileDrawerText: "text-slate-100",
    mobileDrawerHover: "hover:bg-slate-800/50",
  },
  midnight: {
    headerBg: "bg-[#080E21]/90 backdrop-blur-xl saturate-150",
    headerBorder: "border-slate-800/70",
    headerShadow: "shadow-[0_4px_24px_-4px_rgba(0,0,0,0.5)]",
    isDark: true,
    navLinkText: "text-slate-300",
    navLinkHover: "hover:text-white",
    dividerColor: "bg-slate-800",
    publicBtnText: "text-emerald-400",
    publicBtnBorder: "border-emerald-500/35",
    publicBtnHoverBg: "hover:bg-emerald-950/40 hover:border-emerald-400/50",
    loginBtnText: "text-slate-300",
    loginBtnHover: "hover:text-white",
    primaryBtnBg: "bg-white",
    primaryBtnText: "text-slate-950",
    primaryBtnHover: "hover:bg-slate-100",
    mobileToggleText: "text-slate-100",
    mobileToggleHoverBg: "hover:bg-slate-800/60",
    mobileDrawerBg: "bg-[#080E21]/98",
    mobileDrawerBorder: "border-slate-800/80",
    mobileDrawerText: "text-slate-100",
    mobileDrawerHover: "hover:bg-slate-800/50",
  },
};

export const Navbar = () => {
  const [currentTheme, setCurrentTheme] = useState<NavTheme>("transparent");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isNavHidden, setIsNavHidden] = useState(false);
  const { isInstallable, isInstalled, promptInstall } = usePWA();

  useEffect(() => {
    setMounted(true);

    const handleDiveState = (e: Event) => {
      const customEvent = e as CustomEvent<{ isEntered: boolean }>;
      if (customEvent.detail) {
        setIsNavHidden(customEvent.detail.isEntered);
      }
    };
    window.addEventListener("zadesk:dive-state", handleDiveState);

    const updateNavbarTheme = () => {
      const isDiveEntered = document.body.dataset.diveEntered === "true";
      if (isDiveEntered) {
        setIsNavHidden(true);
      } else {
        setIsNavHidden(false);
      }

      if (window.scrollY <= 20) {
        setCurrentTheme("transparent");
        return;
      }

      const sections = document.querySelectorAll<HTMLElement>("[data-nav-theme]");
      const navCheckY = 40;
      let detectedTheme: NavTheme = "light";

      for (let i = 0; i < sections.length; i++) {
        const rect = sections[i].getBoundingClientRect();
        if (rect.top <= navCheckY && rect.bottom > navCheckY) {
          const theme = sections[i].getAttribute("data-nav-theme") as NavTheme;
          if (theme && THEME_STYLES[theme]) {
            detectedTheme = theme;
          }
          break;
        }
      }

      setCurrentTheme(detectedTheme);
    };

    updateNavbarTheme();
    window.addEventListener("scroll", updateNavbarTheme, { passive: true });
    window.addEventListener("resize", updateNavbarTheme, { passive: true });

    return () => {
      window.removeEventListener("zadesk:dive-state", handleDiveState);
      window.removeEventListener("scroll", updateNavbarTheme);
      window.removeEventListener("resize", updateNavbarTheme);
    };
  }, []);

  const styles = THEME_STYLES[currentTheme];
  const isTop = currentTheme === "transparent";

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
        isTop ? "py-5" : "py-3.5 border-b"
      } ${styles.headerBg} ${styles.headerBorder} ${styles.headerShadow} ${
        !mounted
          ? "opacity-0 -translate-y-2"
          : isNavHidden
          ? "-translate-y-full opacity-0 pointer-events-none"
          : "opacity-100 translate-y-0"
      }`}
      style={{
        transitionProperty: "background-color, border-color, box-shadow, padding, transform, opacity",
      }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          
          {/* ============================================================ */}
          {/* 1. LOGO PRINCIPAL                                            */}
          {/* ============================================================ */}
          <Link
            href="/"
            className="group flex items-center transition-transform duration-150 active:scale-[0.98]"
            aria-label="Accueil Zadesk"
          >
            <Logo size="md" isDark={styles.isDark} />
          </Link>

          {/* ============================================================ */}
          {/* 2. NAVIGATION ÉDITORIALE CENTRALE (Desktop)                   */}
          {/* ============================================================ */}
          <nav
            aria-label="Navigation principale"
            className={`hidden lg:flex items-center gap-7 text-[13.5px] font-medium tracking-[-0.01em] transition-colors duration-150 ${styles.navLinkText}`}
          >
            <Link
              href="#conversation-not-ticket"
              className={`py-1 transition-colors duration-150 ${styles.navLinkHover}`}
            >
              Notre approche
            </Link>
            <Link
              href="#secteurs"
              className={`py-1 transition-colors duration-150 ${styles.navLinkHover}`}
            >
              Secteurs
            </Link>
            <Link
              href="#tarifs"
              className={`py-1 transition-colors duration-150 ${styles.navLinkHover}`}
            >
              Tarifs
            </Link>
            <Link
              href="#faq"
              className={`py-1 transition-colors duration-150 ${styles.navLinkHover}`}
            >
              FAQ
            </Link>
          </nav>

          {/* ============================================================ */}
          {/* 3. ACTIONS & PORTES D'ENTRÉE (Desktop)                       */}
          {/* ============================================================ */}
          <div className="hidden md:flex items-center gap-3">
            
            {/* Action Grand Public — Porte d'entrée Particulier / Client */}
            <Link
              href="/entreprises"
              className={`px-3.5 py-1.5 rounded-lg border text-[13px] font-semibold tracking-[-0.01em] transition-all duration-150 ${styles.publicBtnText} ${styles.publicBtnBorder} ${styles.publicBtnHoverBg}`}
            >
              Contacter une entreprise
            </Link>

            {/* Séparateur capillaire discret */}
            <div className={`h-4 w-[1px] ${styles.dividerColor} mx-0.5`} aria-hidden="true" />

            {/* Action Secondaire — Collaborateurs & Entreprises enregistrées */}
            <Link
              href="/login"
              className={`px-3 py-1.5 text-[13px] font-medium transition-colors duration-150 ${styles.loginBtnText} ${styles.loginBtnHover}`}
            >
              Se connecter
            </Link>

            {/* Action Primaire Entreprise — Création d'espace */}
            <Link
              href="/register"
              className={`h-[38px] px-4 rounded-xl text-[13px] font-semibold tracking-[-0.01em] inline-flex items-center gap-1.5 active:scale-[0.98] transition-all duration-150 shadow-xs ${styles.primaryBtnBg} ${styles.primaryBtnText} ${styles.primaryBtnHover}`}
            >
              <span>Créer mon espace</span>
              <ArrowRight className="w-3.5 h-3.5 opacity-80" />
            </Link>

            {/* Action Optionnelle PWA — Installation de l'application */}
            {isInstallable && !isInstalled && (
              <button
                onClick={promptInstall}
                aria-label="Installer l'application Zadesk"
                className={`p-2 rounded-lg border text-slate-500 hover:text-slate-900 border-slate-200/80 hover:bg-slate-100 transition-colors duration-150 ${
                  styles.isDark ? "text-slate-400 hover:text-white border-slate-800 hover:bg-slate-800" : ""
                }`}
                title="Installer l'application Zadesk"
              >
                <Download className="w-4 h-4" />
              </button>
            )}

          </div>

          {/* ============================================================ */}
          {/* 4. DÉCLENCHEUR DU MENU MOBILE                                */}
          {/* ============================================================ */}
          <div className="flex lg:hidden items-center gap-2">
            {/* Accès rapide grand public sur tablette/mobile si l'espace le permet */}
            <Link
              href="/entreprises"
              className={`hidden sm:inline-flex md:hidden px-3 py-1.5 rounded-lg border text-xs font-semibold ${styles.publicBtnText} ${styles.publicBtnBorder}`}
            >
              Contacter une entreprise
            </Link>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`p-2 rounded-xl transition-colors duration-150 ${styles.mobileToggleText} ${styles.mobileToggleHoverBg}`}
              aria-label={mobileMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* ============================================================ */}
      {/* 5. TIROIR DE NAVIGATION MOBILE                               */}
      {/* ============================================================ */}
      {mobileMenuOpen && (
        <div className={`lg:hidden mx-3 mt-2 rounded-3xl ${styles.mobileDrawerBg} backdrop-blur-2xl border ${styles.mobileDrawerBorder} p-5 space-y-4 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-150`}>
          
          {/* Bloc d'entrée prioritaire : Le Particulier / Client */}
          <Link
            href="/entreprises"
            onClick={() => setMobileMenuOpen(false)}
            className="block p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/60 hover:bg-emerald-100/60 transition-colors duration-150"
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-800 font-semibold block mb-0.5">
                  Accès Grand Public
                </span>
                <span className="text-base font-bold text-slate-900 block">
                  Contacter une entreprise
                </span>
                <span className="text-xs text-slate-600 font-normal block mt-0.5">
                  Échangez directement avec le service client sans créer de compte
                </span>
              </div>
              <ArrowRight className="w-5 h-5 text-emerald-700 shrink-0 ml-3" />
            </div>
          </Link>

          {/* Navigation éditoriale principale */}
          <nav
            aria-label="Navigation mobile"
            className={`flex flex-col space-y-1 font-medium ${styles.mobileDrawerText}`}
          >
            <Link
              href="#conversation-not-ticket"
              onClick={() => setMobileMenuOpen(false)}
              className={`px-4 py-3 rounded-xl transition-all duration-150 text-sm ${styles.mobileDrawerHover}`}
            >
              Notre approche
            </Link>
            <Link
              href="#secteurs"
              onClick={() => setMobileMenuOpen(false)}
              className={`px-4 py-3 rounded-xl transition-all duration-150 text-sm ${styles.mobileDrawerHover}`}
            >
              Secteurs
            </Link>
            <Link
              href="#tarifs"
              onClick={() => setMobileMenuOpen(false)}
              className={`px-4 py-3 rounded-xl transition-all duration-150 text-sm ${styles.mobileDrawerHover}`}
            >
              Tarifs
            </Link>
            <Link
              href="#faq"
              onClick={() => setMobileMenuOpen(false)}
              className={`px-4 py-3 rounded-xl transition-all duration-150 text-sm ${styles.mobileDrawerHover}`}
            >
              FAQ
            </Link>
          </nav>

          {/* Actions Entreprise & Authentification */}
          <div className={`pt-3 border-t ${styles.mobileDrawerBorder} flex flex-col gap-2.5`}>
            
            <Link
              href="/register"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full h-11 rounded-xl bg-slate-950 text-white font-semibold text-sm inline-flex items-center justify-center gap-2 active:scale-[0.98] transition-transform shadow-xs"
            >
              <span>Créer mon espace</span>
              <ArrowRight className="w-4 h-4 opacity-80" />
            </Link>

            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full h-10 rounded-xl border border-slate-200 text-slate-700 font-medium text-sm inline-flex items-center justify-center hover:bg-slate-50 transition-colors"
            >
              Se connecter
            </Link>

            {isInstallable && !isInstalled && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  promptInstall();
                }}
                className="w-full h-10 rounded-xl text-slate-600 font-medium text-xs inline-flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>Installer l&apos;application Zadesk</span>
              </button>
            )}

          </div>

        </div>
      )}
    </header>
  );
};
