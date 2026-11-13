"use client";

import React, { useState } from "react";
import { 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight, 
  XCircle, 
  Clock, 
  Users, 
  FileX, 
  Sparkles,
  Inbox,
  RefreshCw,
  MessageSquare
} from "lucide-react";
import { SpotlightCard } from "./motion/SpotlightCard";

export const ProblemTransformation = () => {
  const [viewState, setViewState] = useState<"before" | "after">("before");

  return (
    <section className="py-20 md:py-28 bg-slate-50 relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-navy-900 leading-tight">
            Quand le SAV repose sur des canaux dispersés, les problèmes commencent vite.
          </h2>
          <p className="text-base sm:text-lg text-slate-600">
            Comparez en direct l&apos;impact d&apos;une boîte de réception non structurée face à la puissance d&apos;un espace de travail Zadesk.
          </p>

          {/* Interactive Toggle Switcher */}
          <div className="pt-4 flex items-center justify-center gap-3">
            <button
              onClick={() => setViewState("before")}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all ${
                viewState === "before"
                  ? "bg-rose-600 text-white shadow-lg shadow-rose-600/20 scale-105"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              ❌ Le Chaos Informel
            </button>
            <button
              onClick={() => setViewState("after")}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all ${
                viewState === "after"
                  ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20 scale-105"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              ✨ La Solution Zadesk
            </button>
          </div>
        </div>

        {/* Dynamic Interactive Stage */}
        <div className="max-w-5xl mx-auto">
          {viewState === "before" ? (
            /* CHAOS STATE */
            <div className="rounded-3xl bg-white p-6 sm:p-10 border-2 border-rose-200 shadow-xl relative animate-in fade-in zoom-in-95 duration-300 space-y-6">
              
              <div className="flex items-center justify-between pb-4 border-b border-rose-100">
                <div className="flex items-center gap-2 text-rose-700 font-bold text-sm">
                  <AlertTriangle className="w-5 h-5 text-rose-500 animate-bounce" />
                  Situation Actuelle : Téléphones personnels dispersés
                </div>
                <span className="px-3 py-1 rounded-full bg-rose-100 text-rose-700 text-xs font-bold">
                  3 demandes oubliées
                </span>
              </div>

              {/* Cluttered Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200 text-xs space-y-2 relative">
                  <div className="flex items-center justify-between text-rose-800 font-bold">
                    <span>Canal Perso (Employé 1)</span>
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                  </div>
                  <p className="text-slate-700 font-medium">« Client en colère : message lu hier sans réponse »</p>
                  <span className="text-[10px] text-rose-600 font-semibold block">⚠️ Ticket bloqué • Zéro visibilité patron</span>
                </div>

                <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200 text-xs space-y-2">
                  <div className="flex items-center justify-between text-rose-800 font-bold">
                    <span>Canal Perso (Employé 2)</span>
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                  </div>
                  <p className="text-slate-700 font-medium">« Double réponse : 2 agents ont dit le contraire »</p>
                  <span className="text-[10px] text-rose-600 font-semibold block">⚠️ Confusion client • Perte de crédibilité</span>
                </div>

                <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200 text-xs space-y-2">
                  <div className="flex items-center justify-between text-rose-800 font-bold">
                    <span>Téléphone Éteint (Congé)</span>
                    <span className="w-2 h-2 rounded-full bg-slate-400" />
                  </div>
                  <p className="text-slate-700 font-medium">« Impossible de retrouver l&apos;historique de vente »</p>
                  <span className="text-[10px] text-rose-600 font-semibold block">⚠️ Données piégées sur le mobile</span>
                </div>

              </div>

              {/* Transformation Prompt */}
              <div className="pt-4 text-center">
                <button
                  onClick={() => setViewState("after")}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-navy-900 text-white hover:bg-emerald-600 text-xs font-bold transition-all shadow-md hover:scale-105"
                >
                  <RefreshCw className="w-4 h-4 text-emerald-400" />
                  Cliquer pour voir la transformation avec Zadesk
                </button>
              </div>

            </div>
          ) : (
            /* ZADESK ORGANIZED STATE */
            <div className="rounded-3xl bg-navy-900 p-6 sm:p-10 border-2 border-emerald-500 text-white shadow-2xl relative animate-in fade-in zoom-in-95 duration-300 space-y-6">
              
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  Avec Zadesk : Hub SAV Centralisé &amp; Collaboratif
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold">
                  100% des demandes traitées
                </span>
              </div>

              {/* Structured Zadesk Ticket Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                <div className="p-4 rounded-2xl bg-slate-800/90 border border-slate-700 text-xs space-y-2">
                  <div className="flex items-center justify-between text-slate-200 font-bold">
                    <span>Ticket #4819 • Suivi commande</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px]">Japhet I.</span>
                  </div>
                  <p className="text-slate-300">Réponse envoyée en 2 min • Client satisfait</p>
                  <span className="text-[10px] text-emerald-400 font-semibold block">✓ Clôturé &amp; Historisé</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-800/90 border border-slate-700 text-xs space-y-2">
                  <div className="flex items-center justify-between text-slate-200 font-bold">
                    <span>Ticket #4820 • Renseignement</span>
                    <span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 text-[10px]">Sarah M.</span>
                  </div>
                  <p className="text-slate-300">Suggestion IA validée • Zéro doublon</p>
                  <span className="text-[10px] text-sky-300 font-semibold block">✓ Communication harmonisée</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-800/90 border border-slate-700 text-xs space-y-2">
                  <div className="flex items-center justify-between text-slate-200 font-bold">
                    <span>Fiche Client Société Nouveautés</span>
                    <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px]">Supervision</span>
                  </div>
                  <p className="text-slate-300">Historique accessible à toute l&apos;équipe 24/7</p>
                  <span className="text-[10px] text-amber-300 font-semibold block">✓ Mémoire d&apos;entreprise pérenne</span>
                </div>

              </div>

              {/* Status Message */}
              <div className="pt-4 text-center">
                <p className="text-xs text-slate-300 font-medium">
                  Chaque message client a son responsable, son statut et son historique accessible à toute l&apos;équipe.
                </p>
              </div>

            </div>
          )}
        </div>

      </div>
    </section>
  );
};