'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, FolderKanban } from 'lucide-react';
import { DashboardDispatchItem } from './types';

interface DispatchTableProps {
  items: DashboardDispatchItem[];
  totalTicketsCount?: number;
}

export function DispatchTable({ items }: DispatchTableProps) {
  const [filter, setFilter] = useState<'ALL' | 'WAITING' | 'PROGRESS'>('ALL');

  const filteredItems = items.filter((item) => {
    if (filter === 'WAITING') return item.status === 'À assigner';
    if (filter === 'PROGRESS') return item.status === 'En cours';
    return true;
  });

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-1">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold text-[#0D1B3D]">
            File de traitement
          </h3>
          <span className="text-xs text-slate-400 tabular-nums">({items.length})</span>
        </div>

        <div className="flex items-center gap-1">
          {[
            { id: 'ALL' as const, label: `Tous (${items.length})` },
            { id: 'WAITING' as const, label: 'À assigner' },
            { id: 'PROGRESS' as const, label: 'En cours' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilter(tab.id)}
              className={`px-3 min-h-[32px] rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                filter === tab.id
                  ? 'bg-[#F4F3EF] text-[#0D1B3D] font-semibold'
                  : 'text-slate-500 hover:text-[#0D1B3D]'
              }`}
            >
              {tab.label}
            </button>
          ))}

          <Link
            href="/app/tickets"
            className="text-xs font-medium text-slate-500 hover:text-[#0D1B3D] ml-2 inline-flex items-center gap-1"
          >
            <span>Tout voir</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
          </Link>
        </div>
      </div>

      {filteredItems.length === 0 ? (
        <div className="py-8 text-center text-xs text-slate-400 space-y-2 rounded-xl bg-white border border-[#E5E4DF]">
          <FolderKanban className="w-5 h-5 text-slate-300 mx-auto" />
          <p>Aucun dossier ne correspond à ce filtre.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[#E5E4DF] bg-white">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E5E4DF] text-[11px] font-medium text-slate-400 bg-[#FAFAF8]">
                <th className="py-2.5 px-4 font-medium w-24">Réf.</th>
                <th className="py-2.5 px-4 font-medium w-40">Client</th>
                <th className="py-2.5 px-4 font-medium">Objet</th>
                <th className="py-2.5 px-4 font-medium w-24 text-right">Attente</th>
                <th className="py-2.5 px-4 font-medium w-28 text-right">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E4DF] text-xs">
              {filteredItems.map((item) => {
                const isWaiting = item.status === 'À assigner';
                const isUrgent = item.urgency === 'HIGH' || item.urgency === 'CRITICAL';

                return (
                  <tr
                    key={item.id}
                    className="hover:bg-[#FAFAF8] transition-colors cursor-pointer"
                  >
                    <td className="py-3.5 px-4 font-mono text-[11px] font-medium text-slate-600">
                      <Link href="/app/tickets" className="hover:text-[#0D1B3D]">
                        {item.reference}
                      </Link>
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-[#0D1B3D] truncate max-w-[160px]">
                      {item.customerName}
                    </td>

                    <td className="py-3.5 px-4 text-slate-600 truncate max-w-[220px] sm:max-w-md">
                      <Link href="/app/conversations" className="hover:text-[#0D1B3D]">
                        {item.subject}
                      </Link>
                    </td>

                    <td className="py-3.5 px-4 text-xs text-slate-400 text-right whitespace-nowrap tabular-nums">
                      {item.timeAgo}
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-md text-[11px] font-medium border ${
                          isUrgent
                            ? 'bg-rose-50 text-rose-800 border-rose-200'
                            : isWaiting
                            ? 'bg-amber-50 text-amber-900 border-amber-200'
                            : 'bg-[#F4F3EF] text-[#0D1B3D] border-[#E5E4DF]'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
