"use client";

import React, { useState } from "react";
import { 
  Sparkles, 
  Check, 
  MessageSquare, 
  FileText, 
  CheckCircle2, 
  Zap, 
  Eye,
  FileImage,
  ArrowRight
} from "lucide-react";
import { SpotlightCard } from "./motion/SpotlightCard";

export const AIAssistanceSection = () => {
  const [demoType, setDemoType] = useState<"text" | "document">("text");
  const [actionDone, setActionDone] = useState(false);

  const handleUseReply = () => {
    setActionDone(true);
    setTimeout(() => setActionDone(false), 3500);
  };

  return (
    <section className="py-20 md:py-28 bg-white relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-4">
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-navy-900 leading-tight">
            Une IA qui aide vos agents, pas une IA qui les remplace.
          </h2>
          <p className="text-base sm:text-lg text-slate-600">
            L&apos;IA comprend les demandes et les documents envoyés par vos clients pour aider vos agents à répondre plus rapidement et avec plus de précision.
          </p>

          {/* Mode Selector */}
          <div className="pt-2 flex items-center justify-center gap-3">
            <button
              onClick={() => { setDemoType("text"); setActionDone(false); }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                demoType === "text"
                  ? "bg-navy-900 text-white shadow-md scale-105"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              💬 Demande Client Standard
            </button>
            <button
              onClick={() => { setDemoType("document"); setActionDone(false); }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                demoType === "document"
                  ? "bg-navy-900 text-white shadow-md scale-105"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              📄 Photo / Document Transmis
            </button>
          </div>
        </div>

        {/* 2-Column Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Left: Interactive Live Simulator */}
          <div className="lg:col-span-6 bg-slate-900 rounded-3xl p-6 sm:p-8 text-white border border-slate-800 shadow-2xl space-y-5">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
              <span className="font-bold text-slate-200 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                Simulateur d&apos;assistance en direct
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                {demoType === "text" ? "Texte" : "Pièce jointe"}
              </span>
            </div>

            {demoType === "text" ? (
              /* Text Case */
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">1. Message du client</span>
                  <div className="bg-slate-800 p-3.5 rounded-2xl rounded-tl-sm text-xs text-slate-200 border border-slate-700">
                    « Bonjour, je voudrais savoir où en est la livraison de ma commande #4819. »
                  </div>
                </div>

                <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>Zadesk analyse le contexte client et la commande liée...</span>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">2. Suggestion proposée à l&apos;agent</span>
                  <div className="bg-emerald-950/40 p-3.5 rounded-2xl border border-emerald-500/30 text-xs text-emerald-200 leading-relaxed">
                    « Bonjour, votre commande #4819 est en cours de livraison par notre coursier. Arrivée estimée d&apos;ici 16h30 à votre adresse. »
                  </div>
                </div>
              </div>
            ) : (
              /* Document / Image Case */
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">1. Photo / Document envoyé par le client</span>
                  <div className="bg-slate-800 p-3 rounded-2xl border border-slate-700 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-amber-400">
                      <FileImage className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-xs text-slate-200">photo_produit_endommage.jpg</p>
                      <p className="text-[10px] text-slate-400">« Voici la pièce reçue qui ne correspond pas »</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-sky-400">
                  <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
                  <span>L&apos;IA extrait automatiquement la référence du produit et qualifie la réclamation...</span>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400">2. Diagnostic et proposition de remplacement</span>
                  <div className="bg-sky-950/40 p-3.5 rounded-2xl border border-sky-500/30 text-xs text-sky-200 leading-relaxed">
                    « Nous avons bien identifié la pièce REF-902 sur votre photo. Notre équipe prépare un échange gratuit sans frais supplémentaires. »
                  </div>
                </div>
              </div>
            )}

            {/* Action Bar */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              <span className="text-[11px] text-slate-400">L&apos;agent valide en 1 clic :</span>
              <button
                onClick={handleUseReply}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 active:scale-95"
              >
                <Check className="w-4 h-4" />
                {actionDone ? "Réponse envoyée au client ✓" : "Utiliser la réponse"}
              </button>
            </div>

          </div>

          {/* Right: Key AI Capabilities */}
          <div className="lg:col-span-6 space-y-4">
            
            <SpotlightCard className="p-5">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
                  <MessageSquare className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h4 className="font-bold text-navy-900 text-sm">Suggestions de réponses adaptées</h4>
                  <p className="text-slate-600 text-xs mt-1 leading-relaxed">
                    Vos agents n&apos;ont plus besoin de retaper les mêmes explications : l&apos;IA prépare la réponse idéale basée sur votre historique.
                  </p>
                </div>
              </div>
            </SpotlightCard>

            <SpotlightCard className="p-5">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5 text-sky-600" />
                </div>
                <div>
                  <h4 className="font-bold text-navy-900 text-sm">Résumé automatique des longues discussions</h4>
                  <p className="text-slate-600 text-xs mt-1 leading-relaxed">
                    Quand un ticket passe d&apos;un agent à un autre, un résumé clair en 3 lignes permet de reprendre immédiatement le fil sans relire 50 messages.
                  </p>
                </div>
              </div>
            </SpotlightCard>

            <SpotlightCard className="p-5">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
                  <Eye className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h4 className="font-bold text-navy-900 text-sm">Compréhension des documents et photos reçus</h4>
                  <p className="text-slate-600 text-xs mt-1 leading-relaxed">
                    Lorsqu&apos;un client transmet une photo ou un document, l&apos;IA extrait automatiquement les informations clés pour faire gagner du temps à l&apos;équipe.
                  </p>
                </div>
              </div>
            </SpotlightCard>

            <SpotlightCard className="p-5">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center shrink-0">
                  <Zap className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-bold text-navy-900 text-sm">Classification et détection d&apos;urgence</h4>
                  <p className="text-slate-600 text-xs mt-1 leading-relaxed">
                    Les réclamations sensibles sont immédiatement repérées et remontées en priorité aux responsables pour éviter tout mécontentement.
                  </p>
                </div>
              </div>
            </SpotlightCard>

          </div>

        </div>

      </div>
    </section>
  );
};