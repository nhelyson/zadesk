'use client';

import React from 'react';
import Link from 'next/link';
import { Users, ArrowUpRight } from 'lucide-react';
import { DashboardAgentItem } from '../AppDashboardView';

interface AgentRosterProps {
  agents: DashboardAgentItem[];
  isAgent?: boolean;
}

export function AgentRoster({ agents, isAgent = false }: AgentRosterProps) {
  return (
    <div className="rounded-xl bg-white border border-[#E5E4DF] overflow-hidden">
      <div className="px-4 py-3 border-b border-[#E5E4DF] flex items-center justify-between">
        <span className="text-xs font-bold text-[#0D1B3D]">Conseillers</span>
        <span className="text-[11px] text-slate-400 tabular-nums">
          {agents.length} membre{agents.length > 1 ? 's' : ''}
        </span>
      </div>

      {agents.length === 0 ? (
        <div className="p-5 text-center text-xs text-slate-400 space-y-2">
          <Users className="w-5 h-5 text-slate-300 mx-auto" />
          <p>Aucun conseiller dans cet espace.</p>
          {!isAgent && (
            <Link
              href="/app/agents"
              className="inline-block text-xs font-semibold text-[#0D1B3D] hover:underline"
            >
              Inviter un collaborateur →
            </Link>
          )}
        </div>
      ) : (
        <div className="divide-y divide-[#E5E4DF]">
          {agents.slice(0, 5).map((agent) => {
            const presence = agent.presence || 'OFFLINE';
            const availability = agent.availability || (agent.status === 'AVAILABLE' ? 'AVAILABLE' : 'BUSY');
            const availabilityLabel =
              availability === 'AVAILABLE'
                ? 'Disponible'
                : availability === 'DND'
                ? 'Ne pas déranger'
                : 'Occupé';

            return (
              <div
                key={agent.id}
                className="px-4 py-2.5 flex items-center justify-between gap-2.5 hover:bg-[#FAFAF8] transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="relative shrink-0">
                    <div className="w-7 h-7 rounded-full bg-[#F4F3EF] text-[#0D1B3D] font-bold text-[11px] flex items-center justify-center border border-[#E5E4DF]">
                      {agent.name ? agent.name.charAt(0).toUpperCase() : 'A'}
                    </div>
                    <span
                      className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full ring-2 ring-white ${
                        presence === 'ONLINE'
                          ? 'bg-[#22C55E]'
                          : presence === 'AWAY'
                          ? 'bg-amber-500'
                          : 'bg-slate-300'
                      }`}
                      title={`Présence : ${
                        presence === 'ONLINE' ? 'En ligne' : presence === 'AWAY' ? 'Absent' : 'Hors ligne'
                      }`}
                    />
                  </div>

                  <div className="min-w-0">
                    <span className="text-xs font-semibold text-[#0D1B3D] truncate block">
                      {agent.name}
                    </span>
                    <span className="text-[11px] text-slate-400 truncate block">
                      {agent.title || agent.role || 'Conseiller SAV'} · {availabilityLabel}
                    </span>
                  </div>
                </div>

                <span className="text-[11px] font-medium text-slate-500 tabular-nums shrink-0">
                  {agent.activeChats || 0} actif{(agent.activeChats || 0) > 1 ? 's' : ''}
                </span>
              </div>
            );
          })}

          {!isAgent && (
            <div className="px-4 py-2.5 bg-[#FAFAF8] text-right">
              <Link
                href="/app/agents"
                className="text-xs font-medium text-slate-600 hover:text-[#0D1B3D] inline-flex items-center gap-1"
              >
                <span>Gérer l&apos;équipe</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
