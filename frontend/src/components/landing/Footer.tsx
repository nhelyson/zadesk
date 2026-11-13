"use client";

import React from "react";
import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { usePWA } from "@/components/pwa/PWAProvider";
import { Download, ArrowUpRight } from "lucide-react";

export const Footer: React.FC = () => {
  const { isInstallable, isInstalled, promptInstall } = usePWA();
  const currentYear = new Date().getFullYear();

  return (
    <footer
      data-nav-theme="navy"
      aria-label="Pied de page Zadesk"
      className="relative w-full bg-[#080E21] text-slate-400 text-xs border-t border-slate-800/90 py-16 sm:py-20 lg:py-24"
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
        
        {/* ============================================================ */}
        {/* GRILLE ASYMÉTRIQUE PRINCIPALE EN 2 ZONES                     */}
        {/* ============================================================ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 pb-12 sm:pb-16">
          
          {/* ========================================================== */}
          {/* ZONE 1 : IDENTITÉ DE MARQUE (5 colonnes)                   */}
          {/* ========================================================== */}
          <div className="lg:col-span-5 space-y-6">
            
            <Link href="/" className="inline-block focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-sm">
              <Logo isDark={true} size="md" />
            </Link>

            {/* Phrase de mission éditoriale */}
            <p className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-snug">
              Mieux servir commence par mieux se rencontrer.
            </p>

            {/* Présentation concise */}
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed max-w-md font-normal">
              Zadesk structure les échanges entre les entreprises et leurs clients : du premier message direct en ligne jusqu&apos;à la prise en charge au guichet physique.
            </p>



          </div>

          {/* ========================================================== */}
          {/* ZONE 2 : NAVIGATION ÉDITORIALE STRUCTURÉE (7 colonnes)     */}
          {/* ========================================================== */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-10">
            
            {/* Colonne A : Produit & Approche */}
            <div className="space-y-4">
              <span className="font-mono text-xs uppercase tracking-[0.15em] text-slate-300 font-semibold block">
                Produit
              </span>
              <ul className="space-y-3 font-normal text-xs sm:text-sm">
                <li>
                  <Link
                    href="/#conversation-not-ticket"
                    className="hover:text-white transition-colors duration-150 block"
                  >
                    Notre approche
                  </Link>
                </li>
                <li>
                  <Link
                    href="/#secteurs"
                    className="hover:text-white transition-colors duration-150 block"
                  >
                    Secteurs &amp; Corridors
                  </Link>
                </li>
                <li>
                  <Link
                    href="/#tarifs"
                    className="hover:text-white transition-colors duration-150 block"
                  >
                    Tarifs
                  </Link>
                </li>
                <li>
                  <Link
                    href="/#faq"
                    className="hover:text-white transition-colors duration-150 block"
                  >
                    Questions fréquentes
                  </Link>
                </li>
              </ul>
            </div>

            {/* Colonne B : Accès aux Deux Parcours */}
            <div className="space-y-4">
              <span className="font-mono text-xs uppercase tracking-[0.15em] text-slate-300 font-semibold block">
                Accès
              </span>
              <ul className="space-y-3 font-normal text-xs sm:text-sm">
                <li>
                  <Link
                    href="/entreprises"
                    className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors duration-150 inline-flex items-center gap-1"
                  >
                    <span>Contacter une entreprise</span>
                    <ArrowUpRight className="w-3.5 h-3.5 opacity-70" />
                  </Link>
                </li>
                <li>
                  <Link
                    href="/register"
                    className="hover:text-white transition-colors duration-150 block"
                  >
                    Créer mon espace
                  </Link>
                </li>
                <li>
                  <Link
                    href="/login"
                    className="hover:text-white transition-colors duration-150 block"
                  >
                    Se connecter
                  </Link>
                </li>
                <li>
                  <Link
                    href="/aide"
                    className="hover:text-white transition-colors duration-150 block"
                  >
                    Centre d&apos;aide
                  </Link>
                </li>
                {isInstallable && !isInstalled && (
                  <li className="pt-1">
                    <button
                      type="button"
                      onClick={promptInstall}
                      className="text-slate-400 hover:text-white transition-colors flex items-center gap-1.5 font-medium cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Installer l&apos;application</span>
                    </button>
                  </li>
                )}
              </ul>
            </div>

            {/* Colonne C : Ressources & Informations */}
            <div className="space-y-4">
              <span className="font-mono text-xs uppercase tracking-[0.15em] text-slate-300 font-semibold block">
                Ressources
              </span>
              <ul className="space-y-3 font-normal text-xs sm:text-sm">
                <li>
                  <Link
                    href="/comment-ca-marche"
                    className="hover:text-white transition-colors duration-150 block"
                  >
                    Comment ça marche
                  </Link>
                </li>
                <li>
                  <Link
                    href="/entreprises"
                    className="hover:text-white transition-colors duration-150 block"
                  >
                    Annuaire public
                  </Link>
                </li>
                <li>
                  <Link
                    href="/aide"
                    className="hover:text-white transition-colors duration-150 block"
                  >
                    Assistance utilisateurs
                  </Link>
                </li>
              </ul>
            </div>

          </div>

        </div>

        {/* ============================================================ */}
        {/* BANDEAU INFÉRIEUR : COPYRIGHT & RAPPEL DES PARCOURS          */}
        {/* ============================================================ */}
        <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-normal">
          <p>© {currentYear} Zadesk. Tous droits réservés.</p>
          
          <div className="flex items-center gap-6 text-xs">
            <Link
              href="/entreprises"
              className="text-slate-400 hover:text-white transition-colors duration-150"
            >
              Annuaire public
            </Link>
            <span className="text-slate-700">•</span>
            <Link
              href="/register"
              className="text-slate-400 hover:text-white transition-colors duration-150"
            >
              Espace entreprise
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
};
