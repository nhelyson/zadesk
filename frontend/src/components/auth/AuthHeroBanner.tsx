"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Star, Sparkles, CheckCircle2, ShieldCheck, Zap } from "lucide-react";

export const AuthHeroBanner: React.FC = () => {
  const pathname = usePathname();
  const isLogin = pathname?.includes("/login");

  if (isLogin) {
    return (
      <div className="relative mx-auto max-w-md xl:max-w-lg animate-fade-in">
        {/* Main Photo Card for Login */}
        <div className="relative w-full h-[580px] xl:h-[620px] rounded-[32px] overflow-hidden border border-slate-200/90 shadow-2xl shadow-slate-300/50 group bg-slate-900">
          <img
            src="/images/auth-login-hero.jpg"
            alt="Jeune fille souriante au pont — Fidélité et sérénité avec Zadesk"
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
          />
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/65 via-slate-950/15 to-transparent pointer-events-none" />

          {/* Bottom Quote Bar with Distinct Retention & Speed Feedback */}
          <div className="absolute bottom-4 left-4 right-4 p-4 rounded-2xl bg-white/95 backdrop-blur-xl border border-slate-200/90 shadow-xl text-left space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex text-amber-400">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                <Star className="w-3.5 h-3.5 fill-amber-400" />
              </div>
              <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                Fidélisation +45%
              </span>
            </div>
            <p className="text-xs font-bold text-slate-900 leading-relaxed">
              « Zadesk permet à nos clients de recevoir des réponses instantanées et de retrouver leur historique en un clic. »
            </p>
            <p className="text-[11px] text-slate-500 font-medium">
              Mamadou T. • Responsable Expérience Client
            </p>
          </div>
        </div>

        {/* Floating WhatsApp Bubble Top-Left */}
        <div className="absolute -top-5 -left-5 z-20 p-3.5 rounded-2xl bg-white text-slate-900 shadow-2xl border border-slate-200/90 animate-float-gentle max-w-[250px] text-left">
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#25D366] animate-ping-subtle" />
              <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                Notification Pro
              </span>
            </div>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/60">
              Délivré
            </span>
          </div>
          <p className="text-xs font-semibold text-slate-900 leading-snug">
            « Bonjour ! Votre colis #Z-420 est prêt en agence. »
          </p>
          <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
            <span>Envoi automatique</span>
            <span className="text-emerald-600 font-bold flex items-center gap-0.5">
              <Zap className="w-3 h-3 text-amber-500 fill-amber-500" /> 0s d&apos;attente
            </span>
          </div>
        </div>

        {/* Floating Business Metric Bottom-Right */}
        <div className="absolute -bottom-4 -right-4 z-20 p-3.5 rounded-2xl bg-[#0D1B3D] text-white shadow-2xl border border-slate-700/80 animate-float-reverse max-w-[220px] text-left">
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-xs font-black text-white">Espace Sécurisé</span>
          </div>
          <p className="text-[11px] text-slate-300 leading-snug">
            Accès protégé avec synchronisation instantanée de toutes vos agences.
          </p>
        </div>
      </div>
    );
  }

  // Registration hero banner (Default)
  return (
    <div className="relative mx-auto max-w-md xl:max-w-lg animate-fade-in">
      {/* Main Photo Card for Registration */}
      <div className="relative w-full h-[580px] xl:h-[620px] rounded-[32px] overflow-hidden border border-slate-200/90 shadow-2xl shadow-slate-300/50 group bg-slate-900">
        <img
          src="/images/auth-hero.jpg"
          alt="Entrepreneure souriante et accueillante utilisant Zadesk"
          className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700 ease-out"
        />
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-slate-900/10 pointer-events-none" />

        {/* Bottom Quote Bar with Distinct B2B Manager Feedback */}
        <div className="absolute bottom-4 left-4 right-4 p-4 rounded-2xl bg-white/95 backdrop-blur-xl border border-slate-200/90 shadow-xl text-left space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="flex text-amber-400">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              <Star className="w-3.5 h-3.5 fill-amber-400" />
            </div>
            <span className="text-xs font-bold text-navy-900 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
              Productivité ×3
            </span>
          </div>
          <p className="text-xs font-bold text-slate-900 leading-relaxed">
            « Nos équipes traitent désormais 4 fois plus de demandes SAV sans stress ni perte d&apos;information. »
          </p>
          <p className="text-[11px] text-slate-500 font-medium">
            Aïcha D. • Directrice des Ventes & Opérations
          </p>
        </div>
      </div>

      {/* Floating Live Conversation Snippet Top-Left */}
      <div className="absolute -top-5 -left-5 z-20 p-3.5 rounded-2xl bg-white text-slate-900 shadow-2xl border border-slate-200/90 animate-float-gentle max-w-[250px] text-left">
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#25D366] animate-ping-subtle" />
            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">
              Demande Client
            </span>
          </div>
          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/60">
            En cours
          </span>
        </div>
        <p className="text-xs font-semibold text-slate-900 leading-snug">
          « Bonjour, pouvez-vous modifier l&apos;adresse de facturation du bon #B-108 ? »
        </p>
        <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
          <span>Assigné à Sarah</span>
          <span className="text-emerald-600 font-bold flex items-center gap-0.5">
            <CheckCircle2 className="w-3 h-3" /> Pris en charge
          </span>
        </div>
      </div>

      {/* Floating Live Business Metric Bottom-Right */}
      <div className="absolute -bottom-4 -right-4 z-20 p-3.5 rounded-2xl bg-[#0D1B3D] text-white shadow-2xl border border-slate-700/80 animate-float-reverse max-w-[220px] text-left">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-xs font-black text-white">Centralisation 360°</span>
        </div>
        <p className="text-[11px] text-slate-300 leading-snug">
          Historique client, agents et agences synchronisés en temps réel.
        </p>
      </div>
    </div>
  );
};
