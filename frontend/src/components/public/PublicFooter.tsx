import React from "react";
import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { Building2, ShieldCheck, Heart } from "lucide-react";

export function PublicFooter() {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12 mb-12">
          {/* Col 1: Brand & Mission */}
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="inline-block focus:outline-none">
              <Logo isDark size="md" />
            </Link>
            <p className="text-slate-400 text-xs sm:text-sm max-w-sm leading-relaxed">
              Zadesk est le portail centralisé des services après-vente au Congo. Trouvez en un clic les canaux officiels et vérifiés (WhatsApp, téléphone, email) pour contacter le SAV des entreprises.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-800 text-slate-300 text-xs">
              <span>🇨🇬 Développé pour la République du Congo</span>
            </div>
          </div>

          {/* Col 2: Navigation Grand Public */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-4">
              Grand Public
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <Link href="/entreprises" className="hover:text-emerald-400 transition-colors">
                  Annuaire des entreprises
                </Link>
              </li>
              <li>
                <Link href="/comment-ca-marche" className="hover:text-emerald-400 transition-colors">
                  Comment ça marche
                </Link>
              </li>
              <li>
                <Link href="/aide" className="hover:text-emerald-400 transition-colors">
                  Centre d&apos;aide & FAQ
                </Link>
              </li>
              <li>
                <Link href="/entreprises?category=Télécommunications" className="hover:text-emerald-400 transition-colors">
                  SAV Télécoms
                </Link>
              </li>
              <li>
                <Link href="/entreprises?category=Banque%20%26%20Finance" className="hover:text-emerald-400 transition-colors">
                  SAV Banques
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Espace Entreprise B2B */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-4">
              Espace Entreprise
            </h4>
            <p className="text-xs text-slate-400 mb-3 leading-relaxed">
              Vous êtes une entreprise ? Rejoignez Zadesk pour gérer votre SAV omnicanal, IA & WhatsApp.
            </p>
            <Link
              href="/app"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors shadow-sm"
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Accéder à l&apos;Espace Entreprise</span>
            </Link>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Zadesk. Tous droits réservés.</p>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Données publiques certifiées</span>
            </span>
            <span>•</span>
            <Link href="/aide" className="hover:underline">
              Confidentialité & Mentions
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
