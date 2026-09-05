"use client";

import React from "react";
import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { usePWA } from "@/components/pwa/PWAProvider";
import { Download } from "lucide-react";

export const Footer = () => {
  const { isInstallable, isInstalled, promptInstall } = usePWA();

  return (
    <footer data-nav-theme="navy" className="bg-navy-900 text-slate-400 text-xs border-t border-slate-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 mb-12">
          
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="inline-block">
              <Logo isDark={true} size="md" />
            </Link>
            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              Le service après-vente pensé pour les entreprises qui veulent mieux servir leurs clients.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-slate-500">
              <span>🇨🇬 Conçu pour l&apos;Afrique centrale • Brazzaville, Congo</span>
            </div>
          </div>

          {/* Produit */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">Produit</h4>
            <ul className="space-y-2">
              <li><Link href="#produit" className="hover:text-white transition-colors">Produit</Link></li>
              <li><Link href="#produit" className="hover:text-white transition-colors">Fonctionnalités</Link></li>
              <li><Link href="#tarifs" className="hover:text-white transition-colors">Tarifs</Link></li>
              {isInstallable && !isInstalled && (
                <li>
                  <button
                    onClick={promptInstall}
                    className="hover:text-white text-emerald-400 transition-colors flex items-center gap-1.5 font-medium"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Installer l&apos;application</span>
                  </button>
                </li>
              )}
            </ul>
          </div>

          {/* Entreprise */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">Entreprise</h4>
            <ul className="space-y-2">
              <li><Link href="#" className="hover:text-white transition-colors">À propos</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Contact</Link></li>
              <li><Link href="/login" className="hover:text-white transition-colors font-semibold text-emerald-400">Connexion</Link></li>
            </ul>
          </div>

          {/* Légal */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">Légal &amp; Ressources</h4>
            <ul className="space-y-2">
              <li><Link href="#faq" className="hover:text-white transition-colors">FAQ</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Confidentialité</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Conditions Générales (CGU/CGV)</Link></li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <p>© {new Date().getFullYear()} Zadesk. Tous droits réservés.</p>
          <div className="flex items-center gap-4">
            <Link href="/register" className="text-emerald-400 font-bold hover:underline">
              Commencer gratuitement — 14 jours
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
};