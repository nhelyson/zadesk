'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  Bot,
  Sliders,
  ShieldAlert,
  Save,
  CheckCircle2,
  Zap,
  Info,
  Layers,
} from 'lucide-react';
import { useWorkspace } from '@/components/workspace/WorkspaceContext';

export default function AiConfigPage() {
  const { currentWorkspace } = useWorkspace();
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
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            Intelligence IA & Règles d&apos;Escalade
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Configurez le cerveau conversationnel N1 de Zadesk pour répondre en autonomie et savoir quand passer la main.
          </p>
        </div>

        {saved && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30">
            <CheckCircle2 className="w-4 h-4" />
            <span>Configuration enregistrée !</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Modèle & Persona */}
        <div className="p-6 rounded-2xl bg-[#0D1B3D] border border-slate-800 shadow-xl space-y-5">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-3">
            <Bot className="w-4 h-4 text-indigo-400" />
            Modèle & Persona Conversationnel
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Moteur LLM
              </label>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="claude-3-5-sonnet">Claude 3.5 Sonnet (Recommandé - Raisonnement SAV supérieur)</option>
                <option value="gpt-4o">GPT-4o (Ultra-rapide)</option>
                <option value="deepseek-v3">DeepSeek V3 (Économique & Précis)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Tonalité de la Réponse
              </label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="PROFESSIONAL_WARM">Professionnel, chaleureux et empathique</option>
                <option value="CONCISE">Ultra-concis et direct</option>
                <option value="FORMAL">Très formel & institutionnel</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Seuil d'autonomie */}
        <div className="p-6 rounded-2xl bg-[#0D1B3D] border border-slate-800 shadow-xl space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Sliders className="w-4 h-4 text-emerald-400" />
              Seuil de Confiance RAG & Autonomie
            </h2>
            <span className="text-xs font-bold text-emerald-400 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
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
            <p className="text-[11px] text-slate-400">
              Si la confiance dans la base de connaissances descend sous {confidenceThreshold}%, l&apos;IA ne répond pas au hasard et transfère immédiatement la conversation à un conseiller humain.
            </p>
          </div>
        </div>

        {/* Section 3: Règles d'Escalade */}
        <div className="p-6 rounded-2xl bg-[#0D1B3D] border border-slate-800 shadow-xl space-y-5">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-3">
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            Déclencheurs d&apos;Escalade Immédiate
          </h2>

          <div className="space-y-4">
            <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/80 border border-slate-800 cursor-pointer">
              <input
                type="checkbox"
                checked={autoEscalateFrustration}
                onChange={(e) => setAutoEscalateFrustration(e.target.checked)}
                className="rounded accent-emerald-500 w-4 h-4"
              />
              <div>
                <span className="text-xs font-semibold text-white block">
                  Détection du sentiment négatif et de la frustration
                </span>
                <span className="text-[11px] text-slate-400">
                  Escalade automatiquement vers un responsable si le client exprime une colère ou une insatisfaction vive.
                </span>
              </div>
            </label>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Mots-clés déclencheurs d&apos;alerte rouge (séparés par des virgules)
              </label>
              <textarea
                rows={3}
                value={escalationKeywords}
                onChange={(e) => setEscalationKeywords(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Enregistrer la Configuration IA</span>
          </button>
        </div>
      </form>
    </div>
  );
}
