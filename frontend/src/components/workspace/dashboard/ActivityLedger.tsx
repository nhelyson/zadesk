'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { DashboardActivity } from './types';

interface ActivityLedgerProps {
  activities: DashboardActivity[];
}

export function ActivityLedger({ activities }: ActivityLedgerProps) {
  return (
    <div className="rounded-xl bg-white border border-[#E5E4DF] overflow-hidden">
      <div className="px-4 py-3 border-b border-[#E5E4DF] flex items-center justify-between">
        <span className="text-xs font-bold text-[#0D1B3D]">Activité récente</span>
        <span className="text-[11px] text-slate-400">Aujourd&apos;hui</span>
      </div>

      {activities.length === 0 ? (
        <div className="p-5 text-center text-xs text-slate-400">
          Aucun événement enregistré aujourd&apos;hui.
        </div>
      ) : (
        <div className="divide-y divide-[#E5E4DF]">
          {activities.slice(0, 5).map((act) => (
            <div
              key={act.id}
              className="px-4 py-2.5 flex items-start gap-2.5 hover:bg-[#FAFAF8] transition-colors text-xs"
            >
              <span className="font-mono text-[11px] text-slate-400 shrink-0 mt-0.5 tabular-nums">
                {act.timestamp}
              </span>
              <div className="min-w-0">
                <div className="font-semibold text-[#0D1B3D] truncate">{act.title}</div>
                <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                  {act.description}
                </div>
              </div>
            </div>
          ))}

          <div className="px-4 py-2.5 bg-[#FAFAF8] text-right">
            <Link
              href="/app/tickets"
              className="text-xs font-medium text-slate-600 hover:text-[#0D1B3D] inline-flex items-center gap-1"
            >
              <span>Voir tout</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
