'use client';

import React from 'react';
import {
  BookOpen,
  Clock,
  Database,
  Search,
  CheckCircle2,
  FileText,
  Lock,
  Sparkles,
  ShieldCheck,
  FolderTree,
} from 'lucide-react';
import { useWorkspace } from '@/components/workspace/WorkspaceContext';

export default function KnowledgePage() {
  const { currentWorkspace } = useWorkspace();

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-xs text-slate-500">
          Organisation : <strong className="text-[#0D1B3D]">{currentWorkspace?.name}</strong>
        </span>
        <span className="inline-flex items-center gap-1.5 px-3 h-8 rounded-lg bg-white border border-[#E5E4DF] text-xs font-medium text-slate-600">
          <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span>Indexation documentaire en préparation</span>
        </span>
      </div>

      {/* Carte d'information sobre Midnight Navy */}
      <div className="p-6 sm:p-7 rounded-xl bg-[#0D1B3D] text-white border border-[#152C61] shadow-[inset_0_1px_0_rgba(255,255,255,0.14)] space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-white/10 text-white flex items-center justify-center border border-white/15 shrink-0">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-medium text-slate-300">
              Référentiel documentaire isolé
            </span>
            <h2 className="text-lg font-bold text-white tracking-tight">
              Base de connaissances et recherche sémantique en qualification
            </h2>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
          Importez prochainement vos conditions générales, notices de garantie et procédures internes pour alimenter les suggestions d&apos;assistance de votre équipe à partir de <strong>vos seules sources vérifiées</strong>.
        </p>

        <div className="pt-1 flex flex-wrap items-center gap-4 text-xs text-slate-300">
          <span className="flex items-center gap-1.5 font-medium text-white">
            <ShieldCheck className="w-4 h-4 text-[#22C55E]" />
            Citations sourcées
          </span>
          <span className="flex items-center gap-1.5 font-medium text-white">
            <Lock className="w-4 h-4 text-slate-300" />
            Cloisonnement strict par entreprise
          </span>
          <span className="flex items-center gap-1.5 font-medium text-white">
            <FolderTree className="w-4 h-4 text-slate-300" />
            Classement par service
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-xl bg-white border border-[#E5E4DF] space-y-2.5">
          <FileText className="w-4 h-4 text-slate-400" />
          <h3 className="text-sm font-bold text-[#0D1B3D]">Ingestion multi-formats</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Importation de vos PDF de garantie, notices techniques, fiches produits et FAQ textuelles.
          </p>
        </div>

        <div className="p-5 rounded-xl bg-white border border-[#E5E4DF] space-y-2.5">
          <Search className="w-4 h-4 text-slate-400" />
          <h3 className="text-sm font-bold text-[#0D1B3D]">Recherche hybride</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Recherche sémantique et par mots-clés exacts pour retrouver la clause applicable en un instant.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Assistance Conseiller</h3>
            <span className="text-[10px] font-semibold text-sky-700 uppercase tracking-wider">Gain de temps opérationnel</span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Suggestion automatique du paragraphe de réponse aux agents dans le fil de discussion en direct, validable d&apos;un clic avant transmission au client.
          </p>
        </div>
      </div>
    </div>
  );
}
