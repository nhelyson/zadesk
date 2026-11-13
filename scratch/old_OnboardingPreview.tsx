"use client";

import React from "react";
import { getContrastTextColor } from "@/lib/brandTheme";
import {
  CheckCircle2,
  Clock,
  MessageSquare,
  Phone,
  Mail,
  ShieldCheck,
  Globe,
  CornerDownLeft,
  Building2,
  Send,
  Lock,
} from "lucide-react";

export interface OnboardingPreviewData {
  companyName: string;
  slug: string;
  sector: string;
  description?: string;
  city?: string;
  country?: string;
  supportWhatsApp?: string;
  supportPhone?: string;
  supportEmail?: string;
  website?: string;
  openingHours?: string;
  supportCategories: string[];
  brandPrimaryColor: string;
  hasExistingSav?: string | null;
}

interface OnboardingPreviewProps {
  data: OnboardingPreviewData;
}

export const OnboardingPreview: React.FC<OnboardingPreviewProps> = ({ data }) => {
  const primaryColor = data.brandPrimaryColor || "#0D1B3D";
  const contrastColor = getContrastTextColor(primaryColor);
  const displayName = data.companyName.trim() || "Nom de votre Entreprise";
  const initial = displayName.charAt(0).toUpperCase() || "E";
  const displaySlug = data.slug.trim() || "votre-entreprise";

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-200/50 overflow-hidden flex flex-col w-full text-slate-800">
      {/* 1. Mini Browser Chrome Bar */}
      <div className="px-3.5 py-2.5 bg-slate-100/90 border-b border-slate-200/80 flex items-center justify-between gap-2 select-none">
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-400/80" />
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400/80" />
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/80" />
        </div>

        <div className="px-2.5 py-0.5 rounded-full bg-white border border-slate-200/90 text-[10px] font-mono text-slate-500 truncate flex items-center gap-1.5 min-w-0 max-w-[200px] xl:max-w-[230px] shadow-2xs">
          <Lock className="w-2.5 h-2.5 text-emerald-600 shrink-0" />
          <span className="truncate">zadesk.com/entreprises/{displaySlug}</span>
        </div>

        <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0">
          Direct
        </span>
      </div>

      {/* 2. Public SAV Header Mockup */}
      <div className="p-3.5 border-b border-slate-100 flex items-center justify-between gap-2.5 bg-white">
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 shadow-xs transition-colors duration-300"
            style={{
              backgroundColor: primaryColor,
              color: contrastColor,
            }}
          >
            {initial}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h4 className="text-xs font-bold text-slate-900 truncate">
                {displayName}
              </h4>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            </div>
            <p className="text-[10px] text-slate-500 flex items-center gap-1.5 mt-0.5">
              <span className="relative flex h-1.5 w-1.5 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
              </span>
              <span className="truncate">Assistance active 24/7</span>
            </p>
          </div>
        </div>

        <span className="px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200/80 text-[10px] font-semibold text-slate-600 truncate shrink-0 max-w-[110px]">
          {data.sector || "SAV"}
        </span>
      </div>

      {/* 3. Simulated Conversational Public Stage */}
      <div className="p-3.5 space-y-3 bg-[#F7F8FA] flex-1 text-xs">
        {/* Automated Assistant Welcome Message Bubble */}
        <div className="p-3 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-[10px] text-slate-400 border-b border-slate-100 pb-1.5">
            <span className="font-semibold text-slate-600 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Accueil Automatisé
            </span>
            <span>24h/24 • Instantané</span>
          </div>

          <p className="text-[11px] text-slate-700 leading-relaxed">
            {data.description?.trim()
              ? data.description.trim()
              : `Bonjour et bienvenue sur l'espace d'assistance officielle de ${displayName}. Posez votre question ou déposez une réclamation sans inscription.`}
          </p>
        </div>

        {/* Dynamic Category Chips / Quick Replies */}
        {data.supportCategories.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Demandes fréquentes :
            </p>
            <div className="flex flex-wrap gap-1.5">
              {data.supportCategories.slice(0, 4).map((cat, i) => (
                <span
                  key={i}
                  className="px-2 py-1 rounded-xl bg-white hover:bg-slate-50 border border-slate-200/90 text-slate-700 text-[10px] font-medium flex items-center gap-1 shadow-2xs transition-all cursor-default"
                >
                  <span className="truncate max-w-[150px]">{cat}</span>
                  <CornerDownLeft className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                </span>
              ))}
              {data.supportCategories.length > 4 && (
                <span className="px-2 py-1 rounded-xl bg-slate-100 text-slate-500 text-[10px] font-semibold">
                  +{data.supportCategories.length - 4} autres
                </span>
              )}
            </div>
          </div>
        )}

        {/* Operating Hours distinction */}
        <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 flex items-start gap-2 shadow-2xs">
          <Clock className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
          <div className="min-w-0 text-[10px] text-slate-500 leading-tight">
            <span className="font-bold text-slate-700 block">Horaires des conseillers :</span>
            <span className="truncate block mt-0.5 text-slate-600">
              {data.openingHours || "Lundi - Vendredi : 08h00 - 18h00 | Samedi : 09h00 - 13h00"}
            </span>
          </div>
        </div>

        {/* Direct Contact Channels */}
        <div className="space-y-1.5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Canaux directs certifiés :
          </p>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            {data.supportWhatsApp ? (
              <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center gap-1.5 text-emerald-900 min-w-0 overflow-hidden">
                <MessageSquare className="w-3.5 h-3.5 text-emerald-600 fill-current shrink-0" />
                <span className="truncate font-mono text-[10px] font-bold">
                  {data.supportWhatsApp}
                </span>
              </div>
            ) : (
              <div className="p-2 rounded-xl bg-white border border-dashed border-slate-200 text-slate-400 text-[10px] truncate">
                WhatsApp : à renseigner
              </div>
            )}

            {data.supportPhone ? (
              <div className="p-2 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-1.5 text-slate-800 min-w-0 overflow-hidden">
                <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span className="truncate font-mono text-[10px] font-bold">
                  {data.supportPhone}
                </span>
              </div>
            ) : (
              <div className="p-2 rounded-xl bg-white border border-dashed border-slate-200 text-slate-400 text-[10px] truncate">
                Tél : à renseigner
              </div>
            )}
          </div>
        </div>

        {/* Simulated Chat Input Bar */}
        <div className="pt-1">
          <div className="p-1.5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center justify-between gap-2">
            <span className="text-[10px] text-slate-400 px-2 truncate flex-1 select-none">
              Écrire au service client...
            </span>
            <div
              className="w-6 h-6 rounded-xl flex items-center justify-center shrink-0 shadow-2xs transition-colors"
              style={{
                backgroundColor: primaryColor,
                color: contrastColor,
              }}
            >
              <Send className="w-3 h-3" />
            </div>
          </div>
        </div>

        {/* Reassurance Seal */}
        <div className="p-2 rounded-xl bg-slate-100/90 flex items-center gap-1.5 text-[9px] text-slate-500 select-none">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span className="truncate font-medium">Guichet vérifié Zadesk • Confidentialité assurée</span>
        </div>
      </div>
    </div>
  );
};
