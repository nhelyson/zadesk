'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, ArrowUpRight } from 'lucide-react';
import { DashboardIncident } from './types';

interface IncidentBayProps {
  incident: DashboardIncident | null;
  isAgent?: boolean;
}

export function IncidentBay({ incident, isAgent = false }: IncidentBayProps) {
  if (!incident) {
    return (
      <div className="rounded-xl bg-white border border-[#E5E4DF] p-5 space-y-2">
        <div className="flex items-center gap-2 text-xs font-medium text-[#15803D]">
          <CheckCircle2 className="w-4 h-4 text-[#22C55E] shrink-0" />
          <span>Situation nominale · Aucune urgence en attente</span>
        </div>
        <h2 className="text-base font-bold text-[#0D1B3D] tracking-tight">
          Toutes les demandes entrantes sont prises en charge
        </h2>
        <p className="text-xs text-slate-500 leading-relaxed max-w-2xl">
          Aucun dossier critique ou conversation non assignée ne nécessite d&apos;arbitrage immédiat.
        </p>
      </div>
    );
  }

  const isCritical =
    incident.urgency === 'CRITICAL' || incident.urgency === 'HIGH' || incident.isUrgent;
  const isWaiting = incident.isWaitingAgent || incident.status === 'WAITING_AGENT';

  return (
    <div
      className={`rounded-xl bg-white border p-5 space-y-4 ${
        isCritical
          ? 'border-rose-200 border-l-[3px] border-l-rose-600'
          : isWaiting
          ? 'border-amber-200 border-l-[3px] border-l-amber-500'
          : 'border-[#E5E4DF]'
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E5E4DF] pb-3">
        <div className="flex items-center gap-2 text-xs font-semibold">
          <span
            className={`w-2 h-2 rounded-full ${
              isCritical ? 'bg-rose-600' : isWaiting ? 'bg-amber-500' : 'bg-[#22C55E]'
            }`}
          />
          <span
            className={
              isCritical ? 'text-rose-800' : isWaiting ? 'text-amber-900' : 'text-[#0D1B3D]'
            }
          >
            {isCritical
              ? 'Intervention prioritaire'
              : isWaiting
              ? 'Attribution requise'
              : 'Dossier actif'}
          </span>
        </div>

        <div className="text-xs text-slate-500 tabular-nums">
          Attente : <strong className="text-[#0D1B3D]">{incident.timeAgo}</strong>
        </div>
      </div>

      <div className="space-y-2">
        <h2 className="text-base font-bold text-[#0D1B3D] tracking-tight leading-snug">
          <span className="font-mono text-slate-400 font-medium mr-2">
            {incident.reference}
          </span>
          {incident.title}
        </h2>

        <p className="text-xs text-slate-600 leading-relaxed bg-[#FAFAF8] p-3.5 rounded-lg border border-[#E5E4DF]">
          « {incident.lastMessage} »
        </p>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-[#0D1B3D] text-white font-bold text-xs flex items-center justify-center shrink-0">
            {incident.customerName ? incident.customerName.charAt(0).toUpperCase() : 'C'}
          </div>
          <div className="min-w-0">
            <div className="text-xs font-semibold text-[#0D1B3D] truncate">
              {incident.customerName}
            </div>
            <div className="text-[11px] text-slate-500 truncate">
              {incident.channel} · {incident.category || 'SAV'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {!isAgent && (
            <Link
              href="/app/tickets"
              className="min-h-[38px] px-3 rounded-lg bg-white border border-[#E5E4DF] hover:border-[#0D1B3D]/25 text-[#0D1B3D] text-xs font-medium transition-colors flex items-center gap-1.5"
            >
              <span>Voir le dossier</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
            </Link>
          )}

          <Link
            href="/app/conversations"
            className="min-h-[38px] px-4 rounded-lg bg-[#0D1B3D] hover:bg-[#152C61] text-white text-xs font-semibold shadow-[inset_0_1px_0_rgba(255,255,255,0.16)] flex items-center gap-2 transition-all active:scale-[0.98]"
          >
            <span>Traiter la demande</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
