'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import {
  RefreshCw,
  AlertCircle,
  MessageSquare,
  FolderKanban,
  Clock,
  CheckCircle2,
  ExternalLink,
  ArrowRight,
} from 'lucide-react';
import gsap from 'gsap';
import { useWorkspace } from '@/components/workspace/WorkspaceContext';
import { workspaceApi, agentApi } from '@/lib/api';
import { DashboardStats } from '@/types/workspace';
import { MonolithMetric } from './design-system';
import {
  normalizeDashboardStats,
  IncidentBay,
  DispatchTable,
  TeamCapacityIndicator,
  AgentRoster,
  ActivityLedger,
  BrandNewWorkspaceGuide,
} from './dashboard';

export interface DashboardAgentItem {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
  title?: string;
  role?: string;
  presence?: 'ONLINE' | 'AWAY' | 'OFFLINE';
  availability?: 'AVAILABLE' | 'BUSY' | 'DND';
  accountStatus?: 'ACTIVE' | 'SUSPENDED' | 'ARCHIVED';
  status: 'AVAILABLE' | 'BUSY' | 'DND' | 'AWAY' | 'OFFLINE';
  maxCapacity: number;
  activeChats: number;
  resolvedToday: number;
  skills?: Array<{ id: string; name: string }>;
}

export interface AppDashboardViewProps {
  previewStats?: DashboardStats;
  onNavigate?: (href: string) => void;
}

export function AppDashboardView({ previewStats, onNavigate }: AppDashboardViewProps = {}) {
  const { currentWorkspace, user, userRole } = useWorkspace();
  const [stats, setStats] = useState<any | null>(previewStats || null);
  const [agents, setAgents] = useState<DashboardAgentItem[]>([]);
  const [loading, setLoading] = useState(!previewStats);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const isAgent = userRole === 'AGENT';
  const canManageBilling = !isAgent && (userRole === 'OWNER' || userRole === 'ADMIN');

  const fetchStats = async () => {
    if (previewStats || !currentWorkspace) return;
    try {
      setError(null);
      if (isAgent) {
        const data = await agentApi.getDashboardStats(currentWorkspace.id);
        setStats(data);
      } else {
        const [statsData, agentsData] = await Promise.all([
          workspaceApi.getDashboardStats(currentWorkspace.id),
          workspaceApi.getAgents(currentWorkspace.id).catch(() => []),
        ]);
        setStats(statsData);
        setAgents(Array.isArray(agentsData) ? agentsData : []);
      }
    } catch (err: any) {
      console.error('Failed to load dashboard stats:', err);
      setError(err?.message || "Impossible d'actualiser les données.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (previewStats) {
      setStats(previewStats);
      setLoading(false);
      return;
    }
    fetchStats();
  }, [currentWorkspace?.id, isAgent, previewStats]);

  useEffect(() => {
    const handleInvalidation = () => fetchStats();
    if (typeof window !== 'undefined') {
      window.addEventListener('zadesk:data-invalidated', handleInvalidation);
      return () => window.removeEventListener('zadesk:data-invalidated', handleInvalidation);
    }
  }, [currentWorkspace?.id, isAgent]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || loading || !containerRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.dashboard-plane',
        { opacity: 0, y: 6 },
        { opacity: 1, y: 0, duration: 0.22, stagger: 0.04, ease: 'power2.out' }
      );
    }, containerRef);

    return () => ctx.revert();
  }, [loading]);

  const normalizedData = normalizeDashboardStats(stats, userRole, user?.id, agents);
  const { metrics, teamCapacity } = normalizedData;

  const waitingMetric = isAgent ? teamCapacity.waitingCount : metrics.waitingAgent;
  const totalVolume = Math.max(metrics.totalTickets, metrics.openTickets + metrics.resolvedTickets);
  const resolvedPct =
    totalVolume > 0 ? Math.round((metrics.resolvedTickets / totalVolume) * 100) : 0;
  const openPct = totalVolume > 0 ? Math.max(0, 100 - resolvedPct) : 0;

  const navLinkProps = (href: string) =>
    onNavigate
      ? {
          href,
          onClick: (e: React.MouseEvent) => {
            e.preventDefault();
            onNavigate(href);
          },
        }
      : { href };

  if (loading && !stats) {
    return (
      <div className="space-y-6 pb-12 animate-pulse select-none" aria-busy="true">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-5 h-36 bg-white rounded-xl border border-[#E5E4DF]" />
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div className="h-36 bg-white rounded-xl border border-[#E5E4DF]" />
            <div className="h-36 bg-white rounded-xl border border-[#E5E4DF]" />
            <div className="h-36 bg-white rounded-xl border border-[#E5E4DF]" />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 h-64 bg-white rounded-xl border border-[#E5E4DF]" />
          <div className="lg:col-span-4 h-64 bg-white rounded-xl border border-[#E5E4DF]" />
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="space-y-6 pb-12 select-none">
      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span className="truncate">{error}</span>
          </div>
          <button
            type="button"
            onClick={() => {
              setRefreshing(true);
              fetchStats();
            }}
            className="px-3 min-h-[34px] rounded-lg bg-rose-100 font-semibold hover:bg-rose-200 cursor-pointer shrink-0"
          >
            Réessayer
          </button>
        </div>
      )}

      {/* Barre d'action compacte (sans double en-tête) */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          {currentWorkspace?.isPublic !== false && (
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
          )}
          <span>
            {isAgent
              ? `Bonjour ${user?.firstName || 'Conseiller'}, suivi de vos demandes assignées`
              : `${currentWorkspace?.name || 'Zalisk'} · Activité en direct`}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setRefreshing(true);
              fetchStats();
            }}
            disabled={refreshing}
            className="min-h-[38px] px-3 rounded-lg bg-white border border-[#E5E4DF] hover:border-[#0D1B3D]/25 flex items-center gap-1.5 text-xs font-medium text-[#0D1B3D] transition-colors cursor-pointer active:scale-[0.98] touch-manipulation"
            title="Actualiser les données"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${
                refreshing ? 'animate-spin text-[#0D1B3D]' : 'text-slate-400'
              }`}
            />
            <span className="hidden sm:inline">Actualiser</span>
          </button>

          <Link
            {...navLinkProps('/app/tickets')}
            className="min-h-[38px] px-3.5 rounded-lg bg-white border border-[#E5E4DF] hover:border-[#0D1B3D]/25 text-[#0D1B3D] text-xs font-medium flex items-center gap-1.5 transition-colors active:scale-[0.98] touch-manipulation"
          >
            <FolderKanban className="w-3.5 h-3.5 text-slate-400" />
            <span>Dossiers SAV</span>
          </Link>

          <Link
            {...navLinkProps('/app/conversations')}
            className="min-h-[38px] px-4 rounded-lg bg-[#0D1B3D] hover:bg-[#152C61] text-white text-xs font-semibold shadow-[inset_0_1px_0_rgba(255,255,255,0.16)] flex items-center gap-2 transition-all active:scale-[0.98] touch-manipulation"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Conversations</span>
          </Link>
        </div>
      </div>

      {/* Synthèse Camaïeu Zalisk : Navy, Lin Pierre, Champagne & Vert Forêt */}
      <div className="dashboard-plane grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        {/* Carte 1 : Volume total (Bleu Navy saturé) */}
        <div className="lg:col-span-5 rounded-xl bg-[#C8D9F0] border border-[#9BB8DB] shadow-[inset_0_1px_0_rgba(255,255,255,0.65)] p-5 flex flex-col justify-between">
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="text-xs font-medium text-[#0D1B3D]/80">
                Volume total des dossiers
              </span>
              <div className="mt-1.5 flex items-baseline gap-3 flex-wrap">
                <span className="text-3xl font-bold tracking-tight text-[#0D1B3D] tabular-nums">
                  {totalVolume}
                </span>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/80 border border-[#9BB8DB] text-xs font-medium text-[#0D1B3D]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
                  {metrics.activeConversations} conversation{metrics.activeConversations > 1 ? 's' : ''} active
                  {metrics.activeConversations > 1 ? 's' : ''}
                </span>
              </div>
            </div>
            <Link
              {...navLinkProps(isAgent ? '/app/tickets' : '/app/analytics')}
              className="text-xs font-medium text-[#0D1B3D]/75 hover:text-[#0D1B3D] transition-colors shrink-0"
            >
              {isAgent ? 'Détails →' : 'Statistiques →'}
            </Link>
          </div>

          <div className="mt-5 space-y-2">
            <div className="flex items-center justify-between text-xs text-[#0D1B3D]/75">
              <span>Taux de résolution</span>
              <span className="tabular-nums font-semibold text-[#0D1B3D]">
                {totalVolume > 0 ? `${resolvedPct}%` : '—'}
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-white/85 border border-[#9BB8DB] overflow-hidden flex">
              <div
                className="h-full bg-[#0D1B3D] transition-all duration-300 motion-reduce:transition-none"
                style={{ width: `${resolvedPct}%` }}
              />
              <div
                className="h-full bg-[#9BB8DB]/70 transition-all duration-300 motion-reduce:transition-none"
                style={{ width: `${openPct}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-[#0D1B3D]/65">
              <span>{metrics.resolvedTickets} clôturés</span>
              <span>{metrics.openTickets} en traitement</span>
            </div>
          </div>
        </div>

        {/* Cartes 2, 3, 4 : KPI Camaïeu Zalisk (Lin Pierre, Champagne, Vert Forêt) */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <MonolithMetric
            tone="stone"
            icon={<FolderKanban className="w-4 h-4" />}
            label="Tickets ouverts"
            value={metrics.openTickets}
            subtext={isAgent ? 'À votre charge' : 'Dossiers actifs'}
            trend={
              metrics.openTickets > 0
                ? { value: 'En cours', isNeutral: true }
                : { value: 'À jour', isPositive: true }
            }
          />
          <MonolithMetric
            tone="champagne"
            icon={<Clock className="w-4 h-4" />}
            label={isAgent ? 'Attente client' : 'À attribuer'}
            value={waitingMetric}
            subtext={isAgent ? 'Relance attendue' : 'Sans conseiller'}
            trend={
              waitingMetric > 0
                ? { value: 'Prioritaire', isPositive: false }
                : { value: 'Aucune attente', isPositive: true }
            }
          />
          <MonolithMetric
            tone="forest"
            icon={<CheckCircle2 className="w-4 h-4" />}
            label="Dossiers résolus"
            value={metrics.resolvedTickets}
            subtext="Total clôturé"
            trend={{
              value: totalVolume > 0 ? `${resolvedPct}%` : '—',
              isPositive: true,
            }}
          />
        </div>
      </div>

      {/* Grille principale 8 / 4 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <section className="dashboard-plane lg:col-span-8 space-y-5 min-w-0">
          {normalizedData.isBrandNew ? (
            <BrandNewWorkspaceGuide workspaceSlug={currentWorkspace?.slug} />
          ) : (
            <>
              <IncidentBay
                incident={normalizedData.focalIncident}
                isAgent={normalizedData.isAgent}
              />
              <DispatchTable
                items={normalizedData.dispatchQueue}
                totalTicketsCount={metrics.totalTickets}
              />
            </>
          )}
        </section>

        <aside className="dashboard-plane lg:col-span-4 space-y-5 min-w-0">
          {/* Carte opérationnelle Midnight Navy (Guichet public / Capacité, pas promo commerciale) */}
          <div className="rounded-xl bg-[#0D1B3D] text-white p-5 border border-[#152C61] shadow-[inset_0_1px_0_rgba(255,255,255,0.14)] space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span className="font-medium">Guichet SAV Public</span>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-white">
                <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
                {currentWorkspace?.isPublic !== false ? 'En ligne' : 'Masqué'}
              </span>
            </div>
            <h2 className="text-base font-bold tracking-tight leading-snug">
              {currentWorkspace?.name || 'Votre espace client'}
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              {canManageBilling
                ? 'Vos clients vous écrivent directement sans inscription. Suivez l’équipe et vos quotas en temps réel.'
                : 'Accédez à la file de conversations entrantes et traitez les demandes prioritaires.'}
            </p>
            <div className="pt-1 flex flex-wrap items-center gap-2">
              {currentWorkspace?.slug && (
                <a
                  href={`/entreprises/${currentWorkspace.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 min-h-[38px] px-3.5 rounded-lg bg-white hover:bg-[#FAFAF8] text-[#0D1B3D] text-xs font-semibold transition-colors"
                >
                  <span>Ouvrir le guichet</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
              {canManageBilling ? (
                <Link
                  {...navLinkProps('/app/billing')}
                  className="inline-flex items-center gap-1.5 min-h-[38px] px-3 rounded-lg bg-white/10 hover:bg-white/15 text-white text-xs font-medium transition-colors"
                >
                  <span>Abonnement</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              ) : (
                <Link
                  {...navLinkProps('/app/conversations')}
                  className="inline-flex items-center gap-1.5 min-h-[38px] px-3 rounded-lg bg-white/10 hover:bg-white/15 text-white text-xs font-medium transition-colors"
                >
                  <span>Conversations</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>
          </div>

          <TeamCapacityIndicator summary={teamCapacity} />
          <AgentRoster agents={agents} isAgent={normalizedData.isAgent} />
          <ActivityLedger activities={normalizedData.recentActivity} />
        </aside>
      </div>
    </div>
  );
}

export default AppDashboardView;
