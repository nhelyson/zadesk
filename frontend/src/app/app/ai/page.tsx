'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  Bot,
  Sliders,
  ShieldAlert,
  Save,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function AiConfigPage() {
  const [model, setModel] = useState('claude-3-5-sonnet');
  const [confidenceThreshold, setConfidenceThreshold] = useState(85);
  const [tone, setTone] = useState('PROFESSIONAL_WARM');
  const [autoEscalateFrustration, setAutoEscalateFrustration] = useState(true);
  const [escalationKeywords, setEscalationKeywords] = useState(
    'remboursement immédiat, plainte, avocat, arnaque, directeur, incompétent, litige juridique'
  );
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            Intelligence IA & Règles d&apos;Escalade
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configurez le moteur conversationnel N1 de Zadesk pour répondre en autonomie et savoir quand passer la main.
          </p>
        </div>

        {saved && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
            <CheckCircle2 className="w-4 h-4" />
            <span>Configuration enregistrée !</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Modèle & Persona */}
        <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-5">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
            <Bot className="w-4 h-4 text-indigo-600" />
            Modèle & Tonalité Conversationnelle
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5 text-xs">
              <label className="font-semibold text-slate-700">Moteur LLM & Raisonnement</label>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:border-indigo-500"
              >
                <option value="claude-3-5-sonnet">Claude 3.5 Sonnet (Recommandé - Raisonnement SAV supérieur)</option>
                <option value="gpt-4o">GPT-4o (Ultra-rapide)</option>
                <option value="deepseek-v3">DeepSeek V3 (Économique & Précis)</option>
              </select>
            </div>

            <div className="space-y-1.5 text-xs">
              <label className="font-semibold text-slate-700">Tonalité de la Réponse</label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:border-indigo-500"
              >
                <option value="PROFESSIONAL_WARM">Professionnel, chaleureux et empathique</option>
                <option value="CONCISE">Ultra-concis et direct</option>
                <option value="FORMAL">Très formel & institutionnel</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Seuil d'autonomie */}
        <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Sliders className="w-4 h-4 text-emerald-600" />
              Seuil de Confiance RAG & Autonomie
            </h2>
            <span className="text-xs font-bold text-emerald-700 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200">
              {confidenceThreshold}% de certitude requise
            </span>
          </div>

          <div className="space-y-2">
            <input
              type="range"
              min="50"
              max="99"
              value={confidenceThreshold}
              onChange={(e) => setConfidenceThreshold(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Si la confiance dans la base de connaissances descend sous {confidenceThreshold}%, l&apos;IA ne répond pas au hasard et transfère immédiatement la conversation à un conseiller humain.
            </p>
          </div>
        </div>

        {/* Section 3: Règles d'Escalade */}
        <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
            <ShieldAlert className="w-4 h-4 text-rose-500" />
            Déclencheurs d&apos;Escalade Immédiate
          </h2>

          <div className="space-y-4">
            <label className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200 cursor-pointer">
              <input
                type="checkbox"
                checked={autoEscalateFrustration}
                onChange={(e) => setAutoEscalateFrustration(e.target.checked)}
                className="rounded accent-emerald-500 w-4 h-4"
              />
              <div>
                <span className="text-xs font-bold text-slate-900 block">
                  Détection du sentiment négatif et de la frustration
                </span>
                <span className="text-[11px] text-slate-500">
                  Escalade automatiquement vers un responsable si le client exprime une colère ou une insatisfaction vive.
                </span>
              </div>
            </label>

            <div className="space-y-1.5 text-xs">
              <label className="font-semibold text-slate-700">
                Mots-clés déclencheurs d&apos;alerte rouge (séparés par des virgules)
              </label>
              <textarea
                rows={3}
                value={escalationKeywords}
                onChange={(e) => setEscalationKeywords(e.target.value)}
                className="w-full p-3.5 rounded-xl border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" variant="gradient" rightIcon={<Save className="w-4 h-4" />}>
            Enregistrer la Configuration IA
          </Button>
        </div>
      </form>
    </div>
  );
}
