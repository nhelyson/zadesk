'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  BarChart3,
  RefreshCw,
  FolderKanban,
  CheckCircle2,
  Users,
  AlertCircle,
  MessageSquare,
  ArrowUpRight,
} from 'lucide-react';
import { useWorkspace } from '@/components/workspace/WorkspaceContext';
import { workspaceApi } from '@/lib/api';

interface AnalyticsData {
  period: string;
  kpis: Array<{ label: string; value: string; change: string | null }>;
  topIssues: Array<{ category: string; count: number; percentage: number }>;
  agentPerformance: Array<{
    agentId: string;
    name: string;
    role: string;
    handled: number;
    resolved: number;
    avgTime: string | null;
    satisfaction: string | null;
  }>;
}

export default function AnalyticsPage() {
  const { currentWorkspace } = useWorkspace();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    if (!currentWorkspace?.id) return;
    try {
      setError(null);
      const res = await workspaceApi.getAnalytics(currentWorkspace.id);
      setData(res || null);
    } catch (err: any) {
      console.error('Failed to load analytics:', err);
      setError(err?.message || 'Impossible de charger les statistiques d’activité.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [currentWorkspace?.id]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAnalytics();
  };

  const totalRequests = Number(data?.kpis?.find((k) => k.label.includes('Total Demandes'))?.value || '0');
  const ticketsCreated = Number(data?.kpis?.find((k) => k.label.includes('Tickets Créés'))?.value || '0');
  const ticketsResolved = Number(data?.kpis?.find((k) => k.label.includes('Tickets Résolus'))?.value || '0');
  const resolutionRate = ticketsCreated > 0 ? Math.round((ticketsResolved / ticketsCreated) * 100) : null;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Barre de contexte compacte */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-xs text-slate-500">
          Période analysée : <strong className="text-[#0D1B3D]">{data?.period || 'Derniers 30 jours'}</strong>
        </span>

        <button
          onClick={handleRefresh}
          disabled={refreshing || loading}
          className="px-3.5 h-9 rounded-lg bg-white hover:bg-[#F4F3EF] text-[#0D1B3D] text-xs font-medium border border-[#E5E4DF] transition-colors flex items-center gap-2 disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-slate-400 ${refreshing ? 'animate-spin text-[#0D1B3D]' : ''}`} />
          <span>Actualiser</span>
        </button>
      </div>

      {/* Alerte erreur */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span className="font-semibold">{error}</span>
          </div>
          <button
            onClick={handleRefresh}
            className="px-3 py-1.5 rounded-lg bg-white border border-rose-200 font-semibold text-rose-900 hover:bg-rose-100/60 transition-colors"
          >
            Réessayer
          </button>
        </div>
      )}

      {/* 4 Cartes de métriques sobres */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl bg-white border border-[#E5E4DF] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Demandes reçues</span>
            <MessageSquare className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-[#0D1B3D] tabular-nums">
            {loading ? '—' : totalRequests}
          </p>
          <p className="text-[11px] text-slate-400">
            Messages initiés sur le guichet public
          </p>
        </div>

        <div className="p-5 rounded-xl bg-white border border-[#E5E4DF] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Dossiers & Tickets</span>
            <FolderKanban className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-[#0D1B3D] tabular-nums">
            {loading ? '—' : ticketsCreated}
          </p>
          <p className="text-[11px] text-slate-400">
            Dossiers SAV pris en charge
          </p>
        </div>

        <div className="p-5 rounded-xl bg-white border border-[#E5E4DF] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Dossiers clôturés</span>
            <CheckCircle2 className="w-4 h-4 text-[#22C55E]" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-[#0D1B3D] tabular-nums">
            {loading ? '—' : ticketsResolved}
          </p>
          <p className="text-[11px] text-slate-400">
            Réclamations menées à résolution
          </p>
        </div>

        <div className="p-5 rounded-xl bg-white border border-[#E5E4DF] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Taux de résolution</span>
            <BarChart3 className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-[#0D1B3D] tabular-nums">
            {loading ? '—' : (resolutionRate !== null ? `${resolutionRate}%` : '—')}
          </p>
          <p className="text-[11px] text-slate-400">
            {resolutionRate !== null ? 'Dossiers résolus / créés' : 'En attente de volume'}
          </p>
        </div>
      </div>

      {/* Grille détaillée : Motifs et Performances équipe */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-5 sm:p-6 rounded-xl bg-white border border-[#E5E4DF] space-y-4">
          <h3 className="text-xs font-bold text-[#0D1B3D] border-b border-[#E5E4DF] pb-3">
            Répartition par motif SAV
          </h3>

          {loading ? (
            <div className="space-y-3 py-4">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-6 bg-slate-100 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : (!data?.topIssues || data.topIssues.length === 0) ? (
            <div className="py-8 text-center space-y-2">
              <p className="text-xs text-slate-500">
                Aucun motif répertorié sur les 30 derniers jours.
              </p>
              <p className="text-[11px] text-slate-400">
                Les catégories se construiront automatiquement lors de la création de vos tickets.
              </p>
            </div>
          ) : (
            <div className="space-y-3.5">
              {data.topIssues.map((item, idx) => (
                <div key={item.category || idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-700 font-semibold">{item.category}</span>
                    <span className="text-slate-500 font-medium">
                      {item.count} dossier{item.count > 1 ? 's' : ''} ({item.percentage}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Performance réelle par collaborateur */}
        <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center justify-between">
            <span>Activité de l&apos;Équipe SAV</span>
            <Users className="w-3.5 h-3.5 text-slate-400" />
          </h3>

          {loading ? (
            <div className="space-y-3 py-4">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-8 bg-slate-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : (!data?.agentPerformance || data.agentPerformance.length === 0) ? (
            <div className="py-8 text-center space-y-2">
              <p className="text-xs text-slate-500">
                Aucun membre d&apos;équipe n&apos;a encore traité de ticket.
              </p>
              <Link
                href="/app/agents"
                className="text-xs text-emerald-600 font-semibold hover:underline inline-flex items-center gap-1"
              >
                <span>Inviter des collaborateurs</span>
                <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 text-xs">
              {data.agentPerformance.map((a) => (
                <div key={a.agentId} className="py-3 flex items-center justify-between">
                  <div className="min-w-0">
                    <span className="text-slate-900 font-bold block truncate">{a.name}</span>
                    <span className="text-slate-400 text-[11px] capitalize">Rôle : {a.role.toLowerCase()}</span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-emerald-700 font-bold block">
                      {a.resolved} résolu{a.resolved > 1 ? 's' : ''} / {a.handled} confié{a.handled > 1 ? 's' : ''}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {a.handled > 0 ? `${Math.round((a.resolved / a.handled) * 100)}% d'efficacité` : 'En attente d’assignation'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
