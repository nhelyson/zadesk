"use client";

import React from "react";
import { MessageSquare, Ticket, CheckCircle2, ArrowRight, ShieldCheck, QrCode, Sparkles, XCircle } from "lucide-react";
import { RevealOnScroll } from "./motion/RevealOnScroll";
import { TiltCard } from "./motion/TiltCard";

export const ConversationNotTicketSection = () => {
  return (
    <section data-nav-theme="light" className="py-20 md:py-28 bg-white relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <RevealOnScroll direction="up">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-navy-900 leading-tight">
              Une conversation n&apos;est pas un ticket.
            </h2>
            <p className="text-base sm:text-lg text-slate-600">
              Créer un ticket pour chaque simple &quot;bonjour&quot; ou question d&apos;horaire étouffe les équipes. Zadesk traite 80% des demandes en direct et ne crée un ticket que lorsqu&apos;un véritable suivi physique ou technique est nécessaire.
            </p>
          </div>
        </RevealOnScroll>

        {/* 2 Comparative Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          
          {/* Column 1: Fast Direct Conversation */}
          <RevealOnScroll direction="left" delay={100}>
            <TiltCard>
              <div className="group p-8 rounded-3xl bg-slate-50 border-2 border-slate-200 hover:border-emerald-500/40 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col justify-between h-full space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-110">
                      <MessageSquare className="w-6 h-6" />
                    </div>
                    <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold transition-colors duration-200">
                      80% des cas • Immédiat
                    </span>
                  </div>

                  <h3 className="text-2xl font-black text-navy-900 group-hover:text-emerald-950 transition-colors duration-200">
                    La Conversation Directe
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    Le client pose une question (prix, stock, manuel, procédure). L&apos;IA ou l&apos;agent répond instantanément. La conversation se clôture sans lourdeur administrative.
                  </p>

                  <div className="p-4 rounded-2xl bg-white border border-slate-200 group-hover:border-slate-300 shadow-sm text-xs space-y-2 transition-all duration-200">
                    <div className="flex items-center justify-between font-bold text-slate-800">
                      <span>Exemple : Renseignement garantie</span>
                      <span className="text-emerald-600">✓ Résolu en 45s</span>
                    </div>
                    <p className="text-slate-500">
                      L&apos;IA a transmis la fiche de garantie au client via la messagerie instantanée. Zéro ticket créé inutilement.
                    </p>
                  </div>
                </div>

                <div className="pt-2 text-xs text-slate-500 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Fluidité maximale pour le client et légèreté pour l&apos;équipe.</span>
                </div>
              </div>
            </TiltCard>
          </RevealOnScroll>

          {/* Column 2: The Actionable Continuity Ticket */}
          <RevealOnScroll direction="right" delay={200}>
            <TiltCard>
              <div className="group p-8 rounded-3xl bg-navy-900 text-white border-2 border-slate-800 hover:border-amber-500/80 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col justify-between h-full space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-110">
                      <Ticket className="w-6 h-6" />
                    </div>
                    <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold transition-colors duration-200">
                      Cas complexes &amp; Agence
                    </span>
                  </div>

                  <h3 className="text-2xl font-black text-white group-hover:text-amber-200 transition-colors duration-200">
                    Le Ticket de Continuité
                  </h3>
                  <p className="text-slate-300 text-sm leading-relaxed">
                    L&apos;agent détermine qu&apos;une réparation ou un passage physique en agence est requis. Zadesk génère alors un dossier officiel avec référence et QR code.
                  </p>

                  <div className="p-4 rounded-2xl bg-slate-800/90 border border-slate-700 group-hover:border-slate-600 shadow-sm text-xs space-y-2 transition-all duration-200">
                    <div className="flex items-center justify-between font-bold text-amber-400">
                      <span>Dossier Réf: ZDK-48291</span>
                      <span className="text-emerald-400">QR Code envoyé</span>
                    </div>
                    <p className="text-slate-300">
                      Le client se présente à l&apos;agence : le guichetier scanne et voit tout l&apos;historique technique sans faire répéter le client.
                    </p>
                  </div>
                </div>

                <div className="pt-2 text-xs text-slate-400 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Continuité absolue entre le canal digital et le guichet physique.</span>
                </div>
              </div>
            </TiltCard>
          </RevealOnScroll>

        </div>

      </div>
    </section>
  );
};