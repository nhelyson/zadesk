'use client';

import React from 'react';
import {
  Sparkles,
  Sliders,
  ShieldAlert,
  Clock,
  CheckCircle2,
  Cpu,
  Bot,
  ArrowRight,
  ShieldCheck,
  Lock,
} from 'lucide-react';
import { useWorkspace } from '@/components/workspace/WorkspaceContext';

export default function AiConfigPage() {
  const { currentWorkspace } = useWorkspace();

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-xs text-slate-500">
          Organisation : <strong className="text-[#0D1B3D]">{currentWorkspace?.name}</strong>
        </span>
        <span className="inline-flex items-center gap-1.5 px-3 h-8 rounded-lg bg-white border border-[#E5E4DF] text-xs font-medium text-slate-600">
          <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span>Intégration en cours de qualification</span>
        </span>
      </div>

      {/* Carte d'information sobre Midnight Navy */}
      <div className="p-6 sm:p-7 rounded-xl bg-[#0D1B3D] text-white border border-[#152C61] shadow-[inset_0_1px_0_rgba(255,255,255,0.14)] space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-white/10 text-white flex items-center justify-center border border-white/15 shrink-0">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-medium text-slate-300">
              Sécurité opérationnelle garantie
            </span>
            <h2 className="text-lg font-bold text-white tracking-tight">
              Moteur d&apos;assistance conversationnelle en préparation
            </h2>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
          Zalisk prépare un module d&apos;assistance contextuelle pour pré-qualifier les demandes et assister vos conseillers. Ce module ne déclenche <strong>aucune réponse automatique non supervisée</strong> sur vos conversations actuelles.
        </p>

        <div className="pt-1 flex flex-wrap items-center gap-4 text-xs text-slate-300">
          <span className="flex items-center gap-1.5 font-medium text-white">
            <ShieldCheck className="w-4 h-4 text-[#22C55E]" />
            Zéro réponse hors contrôle
          </span>
          <span className="flex items-center gap-1.5 font-medium text-white">
            <Lock className="w-4 h-4 text-slate-300" />
            Données isolées par espace
          </span>
          <span className="flex items-center gap-1.5 font-medium text-white">
            <CheckCircle2 className="w-4 h-4 text-[#22C55E]" />
            Validation humaine par défaut
          </span>
        </div>
      </div>

      {/* Spécifications architecturales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-xl bg-white border border-[#E5E4DF] space-y-2.5">
          <Sliders className="w-4 h-4 text-slate-400" />
          <h3 className="text-sm font-bold text-[#0D1B3D]">Seuil de confiance</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Calibrage du score minimal requis avant toute suggestion ou transmission au conseiller.
          </p>
        </div>

        <div className="p-5 rounded-xl bg-white border border-[#E5E4DF] space-y-2.5">
          <ShieldAlert className="w-4 h-4 text-slate-400" />
          <h3 className="text-sm font-bold text-[#0D1B3D]">Escalade automatique</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Détection des litiges financiers et transfert immédiat au responsable SAV en poste.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Tonalité & Style de Marque</h3>
            <span className="text-[10px] font-semibold text-emerald-700 uppercase tracking-wider">Voix officielle</span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Adaptation du registre d&apos;expression (chaleureux, concis, technique ou protocolaire) en cohérence avec vos valeurs de marque.
          </p>
        </div>
      </div>
    </div>
  );
}
