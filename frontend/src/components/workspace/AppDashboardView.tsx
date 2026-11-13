'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  MessageSquare,
  FolderKanban,
  Users,
  Sparkles,
  ArrowUpRight,
  RefreshCw,
  Zap,
  CheckCircle2,
  AlertCircle,
  Clock,
  UserCheck,
  ShieldAlert,
  Sliders,
  ChevronRight,
  AlertTriangle,
} from 'lucide-react';
import { useWorkspace } from '@/components/workspace/WorkspaceContext';
import { workspaceApi, agentApi, apiRequest } from '@/lib/api';
import { DashboardStats, AgentDashboardStats } from '@/types/workspace';

export interface AppDashboardViewProps {
  previewStats?: DashboardStats;
  onNavigate?: (href: string) => void;
}

export function AppDashboardView({ previewStats, onNavigate }: AppDashboardViewProps = {}) {
  const { currentWorkspace, user, userRole } = useWorkspace();
  const [stats, setStats] = useState<DashboardStats | null>(previewStats || null);
  const [agentStats, setAgentStats] = useState<AgentDashboardStats | null>(null);
  const [loading, setLoading] = useState(!previewStats);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingAvailability, setUpdatingAvailability] = useState(false);
  const [welcomeDismissed, setWelcomeDismissed] = useState(false);
  const [commercialIntent, setCommercialIntent] = useState<any>(null);

  const isAgent = userRole === 'AGENT';

  useEffect(() => {
    if (!currentWorkspace?.id) return;
    apiRequest('/commercial/intent?workspaceId=' + currentWorkspace.id)
      .then((res) => {
        const intent = res.data?.intent || res.intent;
        if (intent && intent.plan?.isPaid) {
          setCommercialIntent(intent);
        }
      })
      .catch(() => {});
  }, [currentWorkspace?.id]);

  const fetchStats = async () => {
    if (previewStats || !currentWorkspace) return;
    try {
      if (isAgent) {
        const data = await agentApi.getDashboardStats(currentWorkspace.id);
        setAgentStats(data);
      } else {
        const data = await workspaceApi.getDashboardStats(currentWorkspace.id);
        setStats(data);
      }
    } catch (err) {
      console.error('Failed to load dashboard stats:', err);
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

  const handleRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  const handleAvailabilityChange = async (newAvailability: 'AVAILABLE' | 'BUSY' | 'AWAY' | 'OFFLINE') => {
    if (!currentWorkspace || updatingAvailability) return;
    try {
      setUpdatingAvailability(true);
      await agentApi.updateProfile(currentWorkspace.id, { availability: newAvailability });
      await fetchStats();
    } catch (err) {
      console.error('Failed to update availability:', err);
    } finally {
      setUpdatingAvailability(false);
    }
  };

  if (!currentWorkspace && !loading) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 text-center space-y-6 animate-fade-in">
        <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
          <Zap className="w-8 h-8 text-emerald-600" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Bienvenue sur votre Espace Zadesk
          </h1>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            Vous n’avez pas encore configuré de guichet SAV pour votre entreprise. Lancez le guide de création pour déployer votre service client.
          </p>
        </div>
        <div>
          <Link href="/app/onboarding">
            <button className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/20 transition-all">
              <span>Créer et configurer mon SAV</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </Link>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // VUE 1 : ESPACE AGENT SAV DÉDIÉ (Strictement conforme à Section 5.A)
  // -------------------------------------------------------------
  if (isAgent) {
    const profile = agentStats?.profile;
    const currentAvailability = profile?.availability || 'AVAILABLE';
    const assignedOpen = agentStats?.assignedOpenTickets ?? 0;
    const urgentCount = agentStats?.urgentOrNearDueTickets ?? 0;
    const waitingCustomer = agentStats?.waitingCustomerTickets ?? 0;
    const activeConversations = agentStats?.activeConversations ?? 0;
    const resolvedRecently = agentStats?.resolvedRecentlyCount ?? 0;
    const maxCapacity = profile?.maxCapacity || 10;
    const loadPercent = Math.min(100, Math.round((assignedOpen / maxCapacity) * 100));

    return (
      <div className="space-y-8 animate-fade-in">
        {/* Agent Top Banner with Availability & Validated Skills */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-sm relative overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Espace Agent SAV
                </span>
                <span className="text-xs text-slate-400">
                  Workspace : <strong className="text-slate-700">{currentWorkspace?.name}</strong>
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                Bonjour {user?.firstName ? `${user.firstName} ${user.lastName || ''}` : 'Agent'}, votre pupitre opérationnel
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 max-w-xl leading-relaxed">
                Traitez les tickets et conversations qui vous sont attribués ou partagés. Vos actions sont synchronisées en direct sur la plateforme Zadesk.
              </p>

              {/* Compétences validées */}
              {profile?.skills && profile.skills.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 pt-2">
                  <span className="text-xs font-semibold text-slate-400 mr-1">Compétences validées :</span>
                  {profile.skills.map((sk: any, idx: number) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-lg text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200"
                    >
                      {sk.skill?.name || sk.skill?.code || 'Compétence'}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Disponibilité & Actualiser */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0 w-full sm:w-auto">
              <div className="flex items-center justify-between sm:justify-start gap-2 p-1.5 rounded-2xl bg-slate-50 border border-slate-200 shadow-2xs">
                <span className="text-xs font-medium text-slate-500 pl-2 shrink-0">Disponibilité :</span>
                <select
                  aria-label="Disponibilité de l'agent"
                  value={currentAvailability}
                  disabled={updatingAvailability}
                  onChange={(e) => handleAvailabilityChange(e.target.value as any)}
                  className="bg-white text-xs font-bold text-slate-800 rounded-xl px-2.5 py-2 sm:py-1.5 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer shadow-2xs min-h-[38px] flex-1 sm:flex-none"
                >
                  <option value="AVAILABLE">🟢 Disponible</option>
                  <option value="BUSY">🟠 En ligne / Occupé</option>
                  <option value="AWAY">🟡 En pause / Absent</option>
                  <option value="OFFLINE">⚪ Hors ligne</option>
                </select>
              </div>

              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="px-4 py-2.5 sm:py-2 rounded-xl bg-slate-50 hover:bg-slate-100 active:scale-95 text-slate-700 text-xs font-semibold border border-slate-200 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs min-h-[38px]"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-emerald-600' : ''}`} />
                <span>Actualiser</span>
              </button>
            </div>
          </div>
        </div>

        {/* 5 Real Metric Cards (Section 5.A) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* 1: Tickets ouverts attribués */}
          <Link
            href="/app/tickets"
            className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:border-emerald-300 hover:shadow-xs transition-all group block"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Mes Tickets Ouverts
              </span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <FolderKanban className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-2xl font-black text-slate-900">
                {loading ? '...' : assignedOpen}
              </p>
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                <span>En cours de traitement</span>
                <ChevronRight className="w-3 h-3 text-slate-400" />
              </p>
            </div>
          </Link>

          {/* 2: Tickets urgents ou proches échéance */}
          <Link
            href="/app/tickets?priority=URGENT"
            className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:border-rose-300 hover:shadow-xs transition-all group block"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Urgents / Échéance
              </span>
              <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-2xl font-black text-rose-600">
                {loading ? '...' : urgentCount}
              </p>
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                <span>Priorité haute ou SLA</span>
                <ChevronRight className="w-3 h-3 text-slate-400" />
              </p>
            </div>
          </Link>

          {/* 3: Tickets en attente de réponse */}
          <Link
            href="/app/tickets?status=WAITING_CUSTOMER"
            className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:border-amber-300 hover:shadow-xs transition-all group block"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                En Attente Client
              </span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-2xl font-black text-amber-600">
                {loading ? '...' : waitingCustomer}
              </p>
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                <span>Relances nécessaires</span>
                <ChevronRight className="w-3 h-3 text-slate-400" />
              </p>
            </div>
          </Link>

          {/* 4: Conversations actives attribuées */}
          <Link
            href="/app/conversations"
            className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:border-indigo-300 hover:shadow-xs transition-all group block"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Mes Conversations
              </span>
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <MessageSquare className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-2xl font-black text-slate-900">
                {loading ? '...' : activeConversations}
              </p>
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                <span>Messages & Notes internes</span>
                <ChevronRight className="w-3 h-3 text-slate-400" />
              </p>
            </div>
          </Link>

          {/* 5: Tickets résolus récemment */}
          <Link
            href="/app/tickets?tab=history"
            className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:border-emerald-300 hover:shadow-xs transition-all group block"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Résolus Récemment
              </span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-2xl font-black text-emerald-600">
                {loading ? '...' : resolvedRecently}
              </p>
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                <span>Historique clôturé</span>
                <ChevronRight className="w-3 h-3 text-slate-400" />
              </p>
            </div>
          </Link>
        </div>

        {/* Section 2 colonnes : Tickets récents & Charge/Notifications */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Colonne gauche (2/3) : Mes Tickets Récents */}
          <div className="lg:col-span-2 p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 uppercase tracking-wide">
                  <FolderKanban className="w-4 h-4 text-emerald-600" />
                  Mes Dossiers & Tickets en Cours
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Dossiers qui vous sont actuellement attribués pour résolution.
                </p>
              </div>
              <Link
                href="/app/tickets"
                className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
              >
                <span>Gérer tous les tickets</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {loading ? (
              <div className="py-8 text-center text-xs text-slate-400">Chargement de vos dossiers...</div>
            ) : !agentStats?.recentAssignedTickets || agentStats.recentAssignedTickets.length === 0 ? (
              <div className="py-12 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-slate-800">Aucun ticket en attente pour le moment</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Votre file est vide ! Le moteur d&apos;attribution automatique vous affectera de nouveaux dossiers selon vos compétences.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {agentStats.recentAssignedTickets.map((ticket) => (
                  <Link
                    key={ticket.id}
                    href={`/app/tickets?ticketId=${ticket.id}`}
                    className="py-4 flex items-start justify-between gap-4 hover:bg-slate-50/80 px-3 rounded-2xl transition-colors group block"
                  >
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                          {ticket.reference}
                        </span>
                        <span className="text-xs font-bold text-slate-900 truncate">
                          {ticket.title}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-1">
                        Client : <strong className="text-slate-700">{ticket.customerName}</strong> {ticket.customerPhone ? `(${ticket.customerPhone})` : ''} • {ticket.category}
                      </p>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400">
                        <span>Créé le {new Date(ticket.createdAt).toLocaleDateString('fr-FR')}</span>
                        {ticket.dueAt && (
                          <>
                            <span>•</span>
                            <span className="text-amber-600 font-semibold">
                              Échéance : {new Date(ticket.dueAt).toLocaleDateString('fr-FR')}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {ticket.priority === 'URGENT' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          Urgent
                        </span>
                      )}
                      {ticket.priority === 'HIGH' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-50 text-orange-700 border border-orange-200">
                          Élevée
                        </span>
                      )}
                      {ticket.priority === 'MEDIUM' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                          Moyenne
                        </span>
                      )}
                      {ticket.priority === 'LOW' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                          Basse
                        </span>
                      )}

                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {ticket.status === 'IN_PROGRESS' ? 'En cours' : ticket.status === 'WAITING_CUSTOMER' ? 'Attente client' : 'Ouvert'}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Colonne droite (1/3) : Capacité & Notifications */}
          <div className="space-y-6">
            {/* Capacité de traitement */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-emerald-600" />
                  Charge de Traitement
                </h3>
                <span className="text-xs font-bold text-slate-700">
                  {assignedOpen} / {maxCapacity}
                </span>
              </div>

              <div className="space-y-1.5">
                <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      loadPercent >= 90 ? 'bg-rose-500' : loadPercent >= 60 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${loadPercent}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>Capacité max autorisée : {maxCapacity}</span>
                  <span>{loadPercent}%</span>
                </div>
              </div>

              <p className="text-[11px] text-slate-500 leading-relaxed pt-1">
                Le moteur Zadesk pondère automatiquement les dossiers selon leur priorité pour éviter la surcharge.
              </p>
            </div>

            {/* Notifications & Nouvelles Affectations */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Clock className="w-4 h-4 text-indigo-600" />
                  Affectations Récentes
                </h3>
                <span className="text-[10px] font-bold text-slate-400">En direct</span>
              </div>

              {agentStats?.notifications && agentStats.notifications.length > 0 ? (
                <div className="space-y-3">
                  {agentStats.notifications.map((notif) => (
                    <div key={notif.id} className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                        <span>{notif.title}</span>
                        <span className="text-[10px] text-slate-400 font-normal">
                          {new Date(notif.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600">{notif.message}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 text-center py-4">
                  Aucune nouvelle notification d&apos;affectation.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // VUE 2 : TABLEAU DE BORD SUPERVISEUR / OWNER / ADMIN
  // -------------------------------------------------------------
  const overview = stats?.overview || {
    activeConversations: 18,
    waitingAgent: 4,
    openTickets: 7,
    aiResolutionRate: 78.5,
    avgResolutionTimeMinutes: 6.2,
    customerSatisfactionScore: 4.85,
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Banner / Welcome - Calm & Airy */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-sm relative overflow-hidden">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              SAV & Supervision
            </span>
            <span className="text-xs text-slate-400">• Rôle : <strong className="text-slate-700 capitalize">{userRole.toLowerCase()}</strong></span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            {currentWorkspace ? currentWorkspace.name : 'Tableau de bord'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xl leading-relaxed">
            Pilotage unifié de vos dossiers de continuité SAV, attribution intelligente des agents et flux d&apos;assistance.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="px-4 py-2.5 sm:py-2 rounded-xl bg-slate-50 hover:bg-slate-100 active:scale-95 text-slate-700 text-xs font-semibold border border-slate-200 transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer shadow-2xs min-h-[38px]"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-emerald-600' : ''}`} />
            <span>Actualiser</span>
          </button>

          <Link
            href="/app/tickets"
            className="px-4 py-2.5 sm:py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-slate-950 text-xs font-bold shadow-md shadow-emerald-500/20 transition-all flex items-center gap-2 min-h-[38px]"
          >
            <FolderKanban className="w-3.5 h-3.5" />
            <span>Gestion des Dossiers SAV</span>
          </Link>
        </div>
      </div>

      {/* Bannière de continuité commerciale pour les intentions payantes en attente */}
      {commercialIntent?.plan?.isPaid && (
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in duration-200">
          <div className="flex items-start gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0 mt-1" />
            <div className="space-y-0.5">
              <span className="font-bold text-xs sm:text-sm text-[#0D1B3D]">
                Formule Découverte active • Intention enregistrée : Formule {commercialIntent.plan.name} ({new Intl.NumberFormat('fr-FR').format(commercialIntent.priceXaf)} FCFA/mois)
              </span>
              <p className="text-slate-500 text-xs">
                Votre espace Découverte est pleinement opérationnel. Vos données sont conservées sans limite de durée. Vous pouvez activer votre formule à tout moment.
              </p>
            </div>
          </div>
          <Link
            href="/tarifs"
            className="px-4 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 font-semibold text-xs text-[#0D1B3D] hover:text-black transition-colors shrink-0 whitespace-nowrap shadow-2xs cursor-pointer"
          >
            Consulter l&apos;offre {commercialIntent.plan.name}
          </Link>
        </div>
      )}

      {/* Recommandations contextuelles de démarrage non bloquantes */}
      {!welcomeDismissed && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-[#0D1B3D] to-slate-900 text-white shadow-md relative overflow-hidden animate-fade-in border border-slate-800">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Démarrage
                </span>
                <h3 className="text-sm font-bold text-white">
                  Bienvenue dans votre espace {currentWorkspace?.name} !
                </h3>
              </div>
              <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                Votre espace est créé et prêt. Vous pouvez commencer à traiter vos demandes immédiatement ou enrichir vos paramètres à tout moment.
              </p>
            </div>
            <button
              onClick={() => setWelcomeDismissed(true)}
              className="text-slate-400 hover:text-white px-2 py-1 rounded-lg hover:bg-white/10 transition-colors text-xs font-semibold cursor-pointer shrink-0"
              title="Masquer ces conseils"
            >
              Fermer
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4 pt-4 border-t border-white/10">
            <Link
              href="/app/whatsapp"
              className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-xs group flex items-start gap-2.5"
            >
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <MessageSquare className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-white text-xs group-hover:text-emerald-400 transition-colors">
                  Canal WhatsApp
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                  Connecter Meta Cloud API
                </p>
              </div>
            </Link>

            <Link
              href="/app/agents"
              className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-xs group flex items-start gap-2.5"
            >
              <div className="w-7 h-7 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center shrink-0">
                <Users className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-white text-xs group-hover:text-sky-400 transition-colors">
                  Collaborateurs
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                  Inviter des membres d&apos;équipe
                </p>
              </div>
            </Link>

            <Link
              href={currentWorkspace ? `/entreprises/${currentWorkspace.slug}` : "#"}
              target="_blank"
              className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-xs group flex items-start gap-2.5"
            >
              <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                <ArrowUpRight className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-white text-xs group-hover:text-purple-400 transition-colors">
                  Page publique
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                  Voir votre guichet en direct
                </p>
              </div>
            </Link>

            <Link
              href="/app/settings"
              className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-xs group flex items-start gap-2.5"
            >
              <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                <Clock className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-white text-xs group-hover:text-amber-400 transition-colors">
                  Horaires & Détails
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                  Définir vos plages de permanence
                </p>
              </div>
            </Link>
          </div>
        </div>
      )}

      {/* 4 Airy Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Active Conversations */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:border-slate-300 transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Conversations Zadesk
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-slate-900">
              {loading ? '...' : overview.activeConversations}
            </p>
            <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-500">
              <span className="text-emerald-600 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {overview.waitingAgent} attente agent
              </span>
              <span>•</span>
              <span>{overview.avgResolutionTimeMinutes}m délai moy.</span>
            </div>
          </div>
        </div>

        {/* Card 2: Dossiers de Continuité */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:border-slate-300 transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Dossiers & Tickets
            </span>
            <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <FolderKanban className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-slate-900">
              {loading ? '...' : overview.openTickets}
            </p>
            <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-500">
              <span className="text-sky-600 font-semibold">En cours de résolution</span>
              <span>•</span>
              <span>Attribution auto</span>
            </div>
          </div>
        </div>

        {/* Card 3: Taux Résolution IA */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:border-slate-300 transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Assistance & Qualité
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-slate-900">
              {loading ? '...' : `${overview.aiResolutionRate}%`}
            </p>
            <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-500">
              <span className="text-indigo-600 font-semibold">Taux de résolution</span>
              <span>•</span>
              <span>Autonomie SAV</span>
            </div>
          </div>
        </div>

        {/* Card 4: CSAT Satisfaction */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:border-slate-300 transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Satisfaction Clients
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-emerald-600">
              {loading ? '...' : `${overview.customerSatisfactionScore} / 5`}
            </p>
            <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-500">
              <span className="text-amber-600 font-semibold">★ Avis vérifiés</span>
              <span>•</span>
              <span>Zone CEMAC</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Conversations prioritaires */}
        <div className="lg:col-span-2 p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 uppercase tracking-wide">
                <MessageSquare className="w-4 h-4 text-emerald-600" />
                Conversations & Dossiers Réconciliés
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Chaque client dispose d&apos;un fil unique réconciliant requêtes immédiates et dossiers de continuité.
              </p>
            </div>
            <Link
              href="/app/conversations"
              className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
            >
              <span>Voir tout</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {(stats?.priorityQueue || []).map((conv) => (
              <div
                key={conv.id}
                className="py-4 flex items-start justify-between gap-4 hover:bg-slate-50/80 px-3 rounded-2xl transition-colors cursor-pointer"
              >
                <div className="flex items-start gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-800 flex items-center justify-center font-bold text-xs shrink-0">
                    {conv.customerName.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 truncate">
                        {conv.customerName}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {conv.phone}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 line-clamp-1">
                      {conv.lastMessage}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5 text-[10px] text-slate-400">
                      <span className="font-semibold text-slate-500">{conv.category}</span>
                      <span>•</span>
                      <span>Il y a {conv.timeAgo}</span>
                    </div>
                  </div>
                </div>

                <div className="shrink-0">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                    {conv.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 1 Col: Moteur SAV Hybride & Cache */}
        <div className="space-y-6">
          <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                Moteur SAV Zadesk
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold uppercase border border-emerald-200">
                Opérationnel
              </span>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Zadesk gère en toute autonomie vos tickets, compétences d&apos;agents, partages et attributions déterministes.
            </p>

            <div className="pt-3 border-t border-slate-100">
              <Link
                href="/app/tickets"
                className="w-full py-2.5 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-700 transition-all flex items-center justify-center gap-2 shadow-2xs"
              >
                <span>Accéder aux tickets & dossiers</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AppDashboardView;
