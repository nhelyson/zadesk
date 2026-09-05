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
  Compass,
} from 'lucide-react';
import { useWorkspace } from '@/components/workspace/WorkspaceContext';
import { workspaceApi } from '@/lib/api';
import { DashboardStats } from '@/types/workspace';

export default function AppDashboard() {
  const { currentWorkspace, user, userRole } = useWorkspace();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async () => {
    if (!currentWorkspace) return;
    try {
      const data = await workspaceApi.getDashboardStats(currentWorkspace.id);
      setStats(data);
    } catch (err) {
      console.error('Failed to load dashboard stats:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [currentWorkspace?.id]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  const overview = stats?.overview || {
    activeConversations: 18,
    waitingAgent: 4,
    openTickets: 7,
    aiResolutionRate: 78.5,
    avgResolutionTimeMinutes: 6.2,
    customerSatisfactionScore: 4.85,
  };

  const isAgent = userRole === 'AGENT';

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Banner / Welcome - Calm & Airy */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-sm relative overflow-hidden">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              SAV Opérationnel
            </span>
            <span className="text-xs text-slate-400">• Rôle : <strong className="text-slate-700 capitalize">{userRole.toLowerCase()}</strong></span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            {isAgent ? `Bonjour ${user?.firstName || 'Conseiller'}, vos conversations du jour` : (currentWorkspace ? currentWorkspace.name : 'Tableau de bord')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xl leading-relaxed">
            {isAgent
              ? 'Traitez vos flux WhatsApp assignés et créez des dossiers de suivi pour les cas complexes.'
              : 'Pilotage unifié de vos flux clients WhatsApp, performance IA et dossiers de continuité SAV.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-emerald-600' : ''}`} />
            <span>Actualiser</span>
          </button>

          <Link
            href="/app/conversations"
            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-bold shadow-md shadow-emerald-500/20 transition-all flex items-center gap-2"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Boîte WhatsApp Live</span>
          </Link>
        </div>
      </div>

      {/* 4 Airy Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Active Conversations */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:border-slate-300 transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Flux WhatsApp Actifs
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
              <span>Guichets agences</span>
            </div>
          </div>
        </div>

        {/* Card 3: Taux Résolution IA */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:border-slate-300 transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Résolution IA N1
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
              <span className="text-indigo-600 font-semibold">Autonomie RAG</span>
              <span>•</span>
              <span>Temps rép. ~1.2s</span>
            </div>
          </div>
        </div>

        {/* Card 4: CSAT Satisfaction */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:border-slate-300 transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Satisfaction CSAT
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
              <span>Flux WhatsApp</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Split Layout: Priority Conversations & SAV Engine */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Conversations prioritaires */}
        <div className="lg:col-span-2 p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 uppercase tracking-wide">
                <MessageSquare className="w-4 h-4 text-emerald-600" />
                Conversations Récentes à Traiter
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Chaque client dispose d&apos;un fil unique réconciliant IA et conseillers humains.
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
            {(stats?.priorityQueue || [
              {
                id: 'conv-1',
                customerName: 'Koffi Jean-Luc',
                phone: '+225 07 48 92 10 33',
                lastMessage: "Mon colis de commande #ZD-9482 n'est toujours pas arrivé au point relais Plateau.",
                status: 'AI_HANDLED',
                timeAgo: '4 min',
                category: 'Livraison & Colis',
                channel: 'WhatsApp',
                urgency: 'HIGH',
                unreadCount: 1,
              },
              {
                id: 'conv-2',
                customerName: 'Aïcha Traoré',
                phone: '+225 05 12 88 94 00',
                lastMessage: "Merci pour le remboursement rapide ! J'ai bien reçu la notification Wave.",
                status: 'RESOLVED',
                timeAgo: '18 min',
                category: 'Facturation Wave',
                channel: 'WhatsApp',
                urgency: 'MEDIUM',
                unreadCount: 0,
              },
              {
                id: 'conv-3',
                customerName: 'Groupe Bâtir SA (M. Sékou)',
                phone: '+225 01 02 03 04 05',
                lastMessage: 'Demande urgente de devis SAV pour la flotte de 12 groupes électrogènes.',
                status: 'ESCALATED',
                timeAgo: '32 min',
                category: 'Contrat Entreprise',
                channel: 'WhatsApp',
                urgency: 'CRITICAL',
                unreadCount: 2,
              },
            ]).map((conv) => (
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
                  {conv.status === 'AI_HANDLED' && (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-indigo-500" />
                      IA en cours
                    </span>
                  )}
                  {conv.status === 'RESOLVED' && (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      Résolue
                    </span>
                  )}
                  {conv.status === 'ESCALATED' && (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 text-rose-500" />
                      Escaladée
                    </span>
                  )}
                  {conv.status === 'WAITING_AGENT' && (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-amber-500" />
                      Attente Agent
                    </span>
                  )}
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
                Moteur SAV Hybride
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold uppercase border border-emerald-200">
                Opérationnel
              </span>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Zadesk réconcilie l&apos;immédiateté de WhatsApp avec la rigueur des dossiers de continuité SAV.
            </p>

            <div className="space-y-2.5 pt-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 font-medium">Résolution IA Autonome</span>
                <span className="text-indigo-600 font-bold">78.5%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full" style={{ width: '78.5%' }} />
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-slate-600 font-medium">Escalade Conseillers Humains</span>
                <span className="text-emerald-600 font-bold">21.5%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '21.5%' }} />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100">
              <Link
                href="/app/ai"
                className="w-full py-2.5 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-700 transition-all flex items-center justify-center gap-2 shadow-2xs"
              >
                <span>Ajuster les règles d&apos;escalade</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Redis Cache Status */}
          <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-emerald-600" />
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Accélération Cache L1
                </h4>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed">
              Redis 7 Alpine dédié à l&apos;accélération des sessions et des requêtes RAG sans surcharger PostgreSQL.
            </p>

            <div className="grid grid-cols-2 gap-2 pt-1 text-center">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 block font-medium">Latence Cache</span>
                <span className="text-xs font-bold text-emerald-600">&lt; 3 ms</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 block font-medium">Source Vérité</span>
                <span className="text-xs font-bold text-slate-800">PostgreSQL</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
