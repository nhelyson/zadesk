"use client";

import React, { useState, useEffect } from "react";
import { 
  CheckCircle2, 
  Sparkles, 
  Send, 
  User, 
  Clock, 
  Inbox, 
  Tag, 
  Check,
  ChevronRight,
  ShieldAlert,
  Search,
  MessageSquare
} from "lucide-react";

export const ProductMockup = () => {
  // Animation simulation cycle: 0 -> 1 -> 2 -> 3 -> 4
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setStep((prev) => (prev + 1) % 5);
    }, 3200);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full max-w-6xl mx-auto rounded-3xl bg-slate-900/95 p-3 sm:p-5 shadow-2xl border border-slate-700/60 text-slate-100 font-sans backdrop-blur-xl relative overflow-hidden">
      
      {/* Top Browser Bar */}
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-rose-500/80" />
          <div className="w-3 h-3 rounded-full bg-amber-500/80" />
          <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
          <span className="ml-2 text-slate-400 font-medium hidden sm:inline">app.zadesk.com / inbox / ticket #4819</span>
        </div>
        
        {/* Step Indicator Pill */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 text-[11px] border border-slate-700">
          <span className="text-slate-400">Simulation en direct :</span>
          <span className="font-bold text-emerald-400">
            {step === 0 && "1. Réception de la demande"}
            {step === 1 && "2. Organisation & Priorité"}
            {step === 2 && "3. Assignation à un agent"}
            {step === 3 && "4. Suggestion intelligente"}
            {step === 4 && "5. Demande résolue ✓"}
          </span>
        </div>
      </div>

      {/* 3-Column Dashboard Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 text-xs">
        
        {/* Left: Inbox List */}
        <div className="lg:col-span-4 bg-slate-950/60 rounded-2xl p-3.5 border border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between font-bold text-slate-300">
            <span className="flex items-center gap-2">
              <Inbox className="w-4 h-4 text-emerald-400" />
              Boîte de réception
            </span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px]">
              3 ouvertes
            </span>
          </div>

          {/* Search bar */}
          <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 text-[11px]">
            <Search className="w-3.5 h-3.5" />
            <span>Rechercher client, ticket...</span>
          </div>

          {/* Ticket Items */}
          <div className="space-y-2">
            
            {/* Active Simulated Ticket */}
            <div className={`p-3 rounded-xl border transition-all duration-300 ${
              step >= 4 ? "bg-slate-900/40 border-emerald-500/30" : "bg-slate-900 border-emerald-500/80 shadow-md shadow-emerald-500/10"
            }`}>
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-slate-100 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  Mamadou Kouka
                </span>
                <span className="text-[10px] text-slate-400">Il y a 2 min</span>
              </div>
              <p className="text-[11px] text-slate-300 truncate">
                « Bonjour, j&apos;ai un problème avec ma commande #4819 »
              </p>
              <div className="flex items-center gap-1.5 mt-2">
                <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300 border border-slate-700">
                  #4819
                </span>
                <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 text-[10px] font-semibold">
                  Livraison
                </span>
                {step >= 2 && (
                  <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-[10px] font-semibold">
                    Japhet I.
                  </span>
                )}
                {step >= 4 && (
                  <span className="ml-auto px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                    Résolu ✓
                  </span>
                )}
              </div>
            </div>

            {/* Other Queue Tickets */}
            <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800/60 opacity-70">
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-slate-300">Clinique Ste-Marie</span>
                <span className="text-[10px] text-slate-500">14:20</span>
              </div>
              <p className="text-[11px] text-slate-400 truncate">Demande de renouvellement contrat</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800/60 opacity-70">
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-slate-300">Grace Ngoma</span>
                <span className="text-[10px] text-slate-500">Hier</span>
              </div>
              <p className="text-[11px] text-slate-400 truncate">Question sur la garantie produit</p>
            </div>

          </div>
        </div>

        {/* Center: Conversation & Action Area */}
        <div className="lg:col-span-5 bg-slate-950/80 rounded-2xl p-4 border border-slate-800/80 flex flex-col justify-between min-h-[380px]">
          
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-slate-100 text-sm">Ticket #4819 — Suivi commande</h4>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-semibold">
                  Priorité Normale
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Canal Messagerie Directe • Mamadou Kouka (+242 06 ...)</p>
            </div>

            <div className="flex items-center gap-1.5 text-[11px] bg-slate-900 px-2.5 py-1 rounded-xl border border-slate-800">
              <User className="w-3.5 h-3.5 text-emerald-400" />
              <span>{step >= 2 ? "Japhet I." : "Non assigné"}</span>
            </div>
          </div>

          {/* Messages Thread */}
          <div className="space-y-3 my-4 overflow-y-auto max-h-[220px]">
            
            {/* Incoming Client Message */}
            <div className="flex flex-col items-start">
              <div className="bg-slate-900 p-3 rounded-2xl rounded-tl-sm border border-slate-800 max-w-[85%]">
                <p className="text-[11px] text-slate-200">
                  Bonjour l&apos;équipe, je voudrais savoir où en est la livraison de ma commande #4819 passée hier matin.
                </p>
                <span className="text-[9px] text-slate-500 mt-1 block">15:02</span>
              </div>
            </div>

            {/* AI Suggestion Box (Step >= 3) */}
            {step >= 3 && (
              <div className="bg-emerald-950/40 border border-emerald-500/40 p-3 rounded-2xl space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="flex items-center justify-between text-[10px] text-emerald-400 font-bold">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    Suggestion intelligente Zadesk
                  </span>
                  <span className="text-slate-400 font-normal">Générée en 0.8s</span>
                </div>
                <p className="text-[11px] text-emerald-200 leading-relaxed bg-slate-900/80 p-2 rounded-xl border border-emerald-500/20">
                  « Bonjour Mamadou, votre commande #4819 est en cours de livraison par notre coursier. Arrivée estimée d&apos;ici 16h30 à votre adresse. »
                </p>
                <div className="flex items-center justify-end gap-2 pt-1">
                  <button className="px-2.5 py-1 rounded-lg bg-emerald-500 text-slate-950 font-bold text-[10px] hover:bg-emerald-400 transition-colors flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    {step >= 4 ? "Envoyé ✓" : "Utiliser la réponse"}
                  </button>
                </div>
              </div>
            )}

            {/* Agent Sent Message (Step >= 4) */}
            {step >= 4 && (
              <div className="flex flex-col items-end animate-in fade-in duration-300">
                <div className="bg-emerald-600 text-white p-3 rounded-2xl rounded-tr-sm max-w-[85%] shadow-md">
                  <p className="text-[11px]">
                    Bonjour Mamadou, votre commande #4819 est en cours de livraison par notre coursier. Arrivée estimée d&apos;ici 16h30 à votre adresse.
                  </p>
                  <span className="text-[9px] text-emerald-200 mt-1 block text-right">15:03 • Envoyé par Japhet</span>
                </div>
              </div>
            )}

          </div>

          {/* Quick Reply Bar */}
          <div className="pt-2 border-t border-slate-800/80 flex items-center gap-2">
            <div className="flex-1 bg-slate-900 px-3 py-2 rounded-xl border border-slate-800 text-[11px] text-slate-400">
              {step >= 4 ? "Demande clôturée et résolue." : "Rédiger une réponse ou utiliser l'IA..."}
            </div>
            <button className="p-2 rounded-xl bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-400 transition-colors">
              <Send className="w-4 h-4" />
            </button>
          </div>

        </div>

        {/* Right: Client Card & History */}
        <div className="lg:col-span-3 bg-slate-950/60 rounded-2xl p-3.5 border border-slate-800/80 space-y-3.5">
          <div className="font-bold text-slate-300 flex items-center gap-2">
            <User className="w-4 h-4 text-emerald-400" />
            Fiche Client 360°
          </div>

          {/* Avatar Profile */}
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center space-y-1">
            <div className="w-12 h-12 rounded-full bg-slate-800 mx-auto flex items-center justify-center font-bold text-emerald-400 text-base border border-slate-700">
              MK
            </div>
            <h5 className="font-bold text-slate-100 text-xs">Mamadou Kouka</h5>
            <p className="text-[10px] text-slate-400">Client depuis mars 2025</p>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 gap-2 text-center text-[10px]">
            <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-slate-400 block">Total Commandes</span>
              <span className="font-bold text-slate-200 text-xs">14</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-slate-400 block">Satisfaction</span>
              <span className="font-bold text-emerald-400 text-xs">5/5 ★</span>
            </div>
          </div>

          {/* History */}
          <div className="space-y-1.5 pt-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Dernières interactions
            </span>
            <div className="text-[10px] text-slate-300 space-y-1">
              <p className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Commande livrée (02/09)
              </p>
              <p className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                Demande d&apos;information (18/08)
              </p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};