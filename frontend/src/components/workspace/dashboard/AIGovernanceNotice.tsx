'use client';

import React from 'react';
import { Sparkles } from 'lucide-react';

export function AIGovernanceNotice() {
  return (
    <div className="rounded-xl bg-slate-50 border border-slate-200/90 p-3.5 space-y-1.5 text-slate-700">
      <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider font-bold text-slate-500">
        <Sparkles className="w-3.5 h-3.5 text-slate-400" />
        <span>Gouvernance IA • Information</span>
      </div>
      <p className="text-xs text-slate-600 leading-relaxed font-sans">
        Module IA en préparation. Le traitement des demandes repose actuellement sur l&apos;équipe humaine.
      </p>
    </div>
  );
}
