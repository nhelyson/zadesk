'use client';

import React from 'react';
import { Users, AlertCircle, CheckCircle2 } from 'lucide-react';
import { TeamCapacitySummary } from './types';

interface TeamCapacityIndicatorProps {
  summary: TeamCapacitySummary;
}

export function TeamCapacityIndicator({ summary }: TeamCapacityIndicatorProps) {
  const {
    availableOperationalCount,
    totalOperationalCount,
    activeLoadCount,
    waitingCount,
    state,
  } = summary;

  return (
    <div className="rounded-xl bg-white border border-[#E5E4DF] p-4 space-y-3">
      <div className="flex items-center justify-between pb-2.5 border-b border-[#E5E4DF]">
        <span className="text-xs font-bold text-[#0D1B3D]">Capacité de l&apos;équipe</span>
        <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-600">
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              state === 'BUSY'
                ? 'bg-amber-500'
                : state === 'NOMINAL'
                ? 'bg-[#22C55E]'
                : 'bg-slate-300'
            }`}
          />
          {state === 'BUSY' ? 'Sollicitée' : state === 'NOMINAL' ? 'Disponible' : 'Hors ligne'}
        </span>
      </div>

      <div className="space-y-2 text-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-600">
            <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>Conseillers disponibles</span>
          </div>
          <span className="font-mono font-semibold text-[#0D1B3D] tabular-nums">
            {availableOperationalCount} / {totalOperationalCount || 1}
          </span>
        </div>

        <div className="flex items-center justify-between text-slate-600">
          <span>Dossiers actifs</span>
          <span className="font-mono font-semibold text-[#0D1B3D] tabular-nums">
            {activeLoadCount}
          </span>
        </div>
      </div>

      {waitingCount > 0 ? (
        <div className="p-2.5 rounded-lg bg-amber-50/70 border border-amber-200/80 text-amber-900 text-[11px] flex items-center gap-2">
          <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span>
            <strong>{waitingCount}</strong> conversation{waitingCount > 1 ? 's' : ''} en attente d&apos;attribution.
          </span>
        </div>
      ) : (
        <div className="p-2.5 rounded-lg bg-[#FAFAF8] border border-[#E5E4DF] text-slate-600 text-[11px] flex items-center gap-2">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#22C55E] shrink-0" />
          <span>Toutes les demandes sont prises en charge.</span>
        </div>
      )}
    </div>
  );
}
