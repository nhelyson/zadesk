"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";
import { Menu, X, ArrowRight, Download } from "lucide-react";
import { usePWA } from "@/components/pwa/PWAProvider";

type NavTheme = "transparent" | "light" | "crimson" | "midnight" | "navy";

interface ThemeStyles {
  headerBg: string;
  headerBorder: string;
  headerShadow: string;
  isDark: boolean;
  navLinkText: string;
  navLinkHover: string;
  navUnderline: string;
  loginBtnText: string;
  loginBtnHoverBg: string;
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
    navLinkHover: "hover:text-navy-900",
    navUnderline: "bg-emerald-500",
    loginBtnText: "text-slate-700 hover:text-navy-900",
    loginBtnHoverBg: "hover:bg-slate-100/80",
    mobileToggleText: "text-slate-700",
    mobileToggleHoverBg: "hover:bg-slate-100",
    mobileDrawerBg: "bg-white/98",
    mobileDrawerBorder: "border-slate-200",
    mobileDrawerText: "text-slate-700",
    mobileDrawerHover: "hover:bg-slate-50",
  },
  light: {
    headerBg: "bg-white/90 backdrop-blur-xl",
    headerBorder: "border-slate-200/80",
    headerShadow: "shadow-xs",
    isDark: false,
    navLinkText: "text-slate-600",
    navLinkHover: "hover:text-navy-900",
    navUnderline: "bg-emerald-500",
    loginBtnText: "text-slate-700 hover:text-navy-900",
    loginBtnHoverBg: "hover:bg-slate-100/80",
    mobileToggleText: "text-slate-700",
    mobileToggleHoverBg: "hover:bg-slate-100",
    mobileDrawerBg: "bg-white/98",
    mobileDrawerBorder: "border-slate-200",
    mobileDrawerText: "text-slate-700",
    mobileDrawerHover: "hover:bg-slate-50",
  },
  crimson: {
    headerBg: "bg-[#16060A]/90 backdrop-blur-xl",
    headerBorder: "border-rose-950/70",
    headerShadow: "shadow-lg shadow-rose-950/25",
    isDark: true,
    navLinkText: "text-rose-200/85",
    navLinkHover: "hover:text-white",
    navUnderline: "bg-rose-500",
    loginBtnText: "text-rose-100 hover:text-white",
    loginBtnHoverBg: "hover:bg-rose-950/60",
    mobileToggleText: "text-rose-100",
    mobileToggleHoverBg: "hover:bg-rose-950/60",
    mobileDrawerBg: "bg-[#16060A]/98",
    mobileDrawerBorder: "border-rose-950",
    mobileDrawerText: "text-rose-100",
    mobileDrawerHover: "hover:bg-rose-950/50",
  },
  midnight: {
    headerBg: "bg-[#080E21]/90 backdrop-blur-xl",
    headerBorder: "border-slate-800/80",
    headerShadow: "shadow-lg shadow-slate-950/30",
    isDark: true,
    navLinkText: "text-slate-300",
    navLinkHover: "hover:text-white",
    navUnderline: "bg-emerald-400",
    loginBtnText: "text-slate-200 hover:text-white",
    loginBtnHoverBg: "hover:bg-slate-800/60",
    mobileToggleText: "text-slate-200",
    mobileToggleHoverBg: "hover:bg-slate-800/60",
    mobileDrawerBg: "bg-[#080E21]/98",
    mobileDrawerBorder: "border-slate-800",
    mobileDrawerText: "text-slate-200",
    mobileDrawerHover: "hover:bg-slate-800/50",
  },
  navy: {
    headerBg: "bg-[#0B1528]/90 backdrop-blur-xl",
    headerBorder: "border-slate-800/80",
    headerShadow: "shadow-lg shadow-navy-950/40",
    isDark: true,
    navLinkText: "text-slate-300",
    navLinkHover: "hover:text-white",
    navUnderline: "bg-emerald-400",
    loginBtnText: "text-slate-200 hover:text-white",
    loginBtnHoverBg: "hover:bg-navy-900/60",
    mobileToggleText: "text-slate-200",
    mobileToggleHoverBg: "hover:bg-navy-900/60",
    mobileDrawerBg: "bg-[#0B1528]/98",
    mobileDrawerBorder: "border-slate-800",
    mobileDrawerText: "text-slate-200",
    mobileDrawerHover: "hover:bg-navy-900/50",
  },
};

export const Navbar = () => {
  const [currentTheme, setCurrentTheme] = useState<NavTheme>("transparent");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { isInstallable, isInstalled, promptInstall } = usePWA();

  useEffect(() => {
    setMounted(true);

    const updateNavbarTheme = () => {
      if (window.scrollY <= 20) {
        setCurrentTheme("transparent");
        return;
      }

      const sections = document.querySelectorAll<HTMLElement>("[data-nav-theme]");
      const navCheckY = 40; // Bounding probe point inside viewport
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
      window.removeEventListener("scroll", updateNavbarTheme);
      window.removeEventListener("resize", updateNavbarTheme);
    };
  }, []);

  const styles = THEME_STYLES[currentTheme];
  const isTop = currentTheme === "transparent";

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isTop ? "py-5" : "py-3.5 border-b"
      } ${styles.headerBg} ${styles.headerBorder} ${styles.headerShadow} ${
        mounted ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
      }`}
      style={{
        transitionProperty: "background-color, border-color, box-shadow, padding, transform, opacity",
      }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          
          {/* Logo with adaptive theme color */}
          <Link
            href="/"
            className="group flex items-center transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Logo size="md" isDark={styles.isDark} />
          </Link>

          {/* Minimalist Center Nav with section-adaptive text & hover */}
          <nav className={`hidden md:flex items-center gap-7 text-sm font-semibold transition-colors duration-200 ${styles.navLinkText}`}>
            <Link
              href="#produit"
              className={`relative py-1 ${styles.navLinkHover} transition-colors group`}
            >
              <span>Produit</span>
              <span className={`absolute bottom-0 left-0 w-0 h-0.5 ${styles.navUnderline} rounded-full transition-all duration-200 group-hover:w-full`} />
            </Link>
            <Link
              href="#comment-ca-marche"
              className={`relative py-1 ${styles.navLinkHover} transition-colors group`}
            >
              <span>Comment ça marche</span>
              <span className={`absolute bottom-0 left-0 w-0 h-0.5 ${styles.navUnderline} rounded-full transition-all duration-200 group-hover:w-full`} />
            </Link>
            <Link
              href="#tarifs"
              className={`relative py-1 ${styles.navLinkHover} transition-colors group`}
            >
              <span>Tarifs</span>
              <span className={`absolute bottom-0 left-0 w-0 h-0.5 ${styles.navUnderline} rounded-full transition-all duration-200 group-hover:w-full`} />
            </Link>
            <Link
              href="#faq"
              className={`relative py-1 ${styles.navLinkHover} transition-colors group`}
            >
              <span>FAQ</span>
              <span className={`absolute bottom-0 left-0 w-0 h-0.5 ${styles.navUnderline} rounded-full transition-all duration-200 group-hover:w-full`} />
            </Link>
            <Link
              href="/entreprises"
              className="relative py-1 text-emerald-600 hover:text-emerald-700 font-bold transition-colors group flex items-center gap-1"
            >
              <span>Trouver un SAV</span>
              <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </Link>
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {isInstallable && !isInstalled && (
              <Button
                variant="outline"
                size="sm"
                className={`font-semibold border-emerald-500/40 text-emerald-600 hover:bg-emerald-500/10 transition-all duration-200 ${
                  styles.isDark ? "text-emerald-400 border-emerald-500/30 hover:bg-emerald-950/40" : ""
                }`}
                onClick={promptInstall}
                leftIcon={<Download className="w-3.5 h-3.5" />}
              >
                Installer l&apos;app
              </Button>
            )}
            <Link href="/login">
              <Button
                variant="ghost"
                size="sm"
                className={`font-bold transition-all duration-200 ${styles.loginBtnText} ${styles.loginBtnHoverBg}`}
              >
                Se connecter
              </Button>
            </Link>
            <Link href="/register">
              <Button
                variant="gradient"
                size="sm"
                className="font-bold shadow-md shadow-emerald-500/20 hover:shadow-emerald-500/35 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
                rightIcon={<ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />}
              >
                Créer mon SAV
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`p-2 rounded-xl transition-colors ${styles.mobileToggleText} ${styles.mobileToggleHoverBg}`}
              aria-label="Ouvrir le menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer with theme-adapted backdrop & styles */}
      {mobileMenuOpen && (
        <div className={`md:hidden ${styles.mobileDrawerBg} backdrop-blur-2xl border-b ${styles.mobileDrawerBorder} px-4 pt-4 pb-6 space-y-4 shadow-xl animate-in fade-in slide-in-from-top-4 duration-200`}>
          <nav className={`flex flex-col space-y-3 font-semibold ${styles.mobileDrawerText}`}>
            <Link
              href="#produit"
              onClick={() => setMobileMenuOpen(false)}
              className={`px-3 py-2 rounded-lg transition-colors ${styles.mobileDrawerHover}`}
            >
              Produit
            </Link>
            <Link
              href="#comment-ca-marche"
              onClick={() => setMobileMenuOpen(false)}
              className={`px-3 py-2 rounded-lg transition-colors ${styles.mobileDrawerHover}`}
            >
              Comment ça marche
            </Link>
            <Link
              href="#tarifs"
              onClick={() => setMobileMenuOpen(false)}
              className={`px-3 py-2 rounded-lg transition-colors ${styles.mobileDrawerHover}`}
            >
              Tarifs
            </Link>
            <Link
              href="#faq"
              onClick={() => setMobileMenuOpen(false)}
              className={`px-3 py-2 rounded-lg transition-colors ${styles.mobileDrawerHover}`}
            >
              FAQ
            </Link>
            <Link
              href="/entreprises"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-emerald-600 font-bold bg-emerald-50/70 hover:bg-emerald-100/70 transition-colors flex items-center justify-between"
            >
              <span>Trouver un SAV (Grand Public)</span>
              <span>🇨🇬</span>
            </Link>
          </nav>
          <div className={`pt-3 border-t ${styles.mobileDrawerBorder} flex flex-col gap-2.5`}>
            {isInstallable && !isInstalled && (
              <Button
                variant="outline"
                className={`w-full justify-center font-semibold border-emerald-500/40 text-emerald-600 hover:bg-emerald-500/10 ${
                  styles.isDark ? "text-emerald-400 border-emerald-500/30 hover:bg-emerald-950/40" : ""
                }`}
                onClick={() => {
                  setMobileMenuOpen(false);
                  promptInstall();
                }}
                leftIcon={<Download className="w-4 h-4" />}
              >
                Installer l&apos;application
              </Button>
            )}
            <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
              <Button
                variant="outline"
                className={`w-full justify-center font-semibold ${
                  styles.isDark
                    ? "border-slate-700 text-slate-100 hover:bg-slate-800"
                    : "border-slate-300 text-slate-700 hover:bg-slate-50"
                }`}
              >
                Se connecter
              </Button>
            </Link>
            <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="gradient" className="w-full justify-center font-bold">
                Créer mon SAV
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};