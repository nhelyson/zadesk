'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  FolderKanban,
  Search,
  Plus,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ChevronRight,
  Users,
  Shield,
  Eye,
  Edit3,
  Calendar,
  UserCheck,
  Send,
  X,
  RefreshCw,
  Share2,
  ArrowRightLeft,
  Info,
} from 'lucide-react';
import { useWorkspace } from '@/components/workspace/WorkspaceContext';
import { agentApi, workspaceApi } from '@/lib/api';
import { AgentTicket } from '@/types/workspace';

export default function TicketsPage() {
  const { currentWorkspace, userRole, user } = useWorkspace();
  const searchParams = useSearchParams();

  // Tabs: 'my' | 'shared' | 'history'
  const initialTab = (searchParams.get('tab') as 'my' | 'shared' | 'history') || 'my';
  const initialTicketId = searchParams.get('ticketId') || null;

  const [activeTab, setActiveTab] = useState<'my' | 'shared' | 'history'>(initialTab);
  const [tickets, setTickets] = useState<AgentTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState<string>(searchParams.get('priority') || 'ALL');
  const [filterStatus, setFilterStatus] = useState<string>(searchParams.get('status') || 'ALL');

  // Selected Ticket for Modal / Drawer
  const [selectedTicket, setSelectedTicket] = useState<AgentTicket | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isReassignModalOpen, setIsReassignModalOpen] = useState(false);

  // Team agents list for sharing / reassigning
  const [teamAgents, setTeamAgents] = useState<any[]>([]);

  // Form states
  const [createForm, setCreateForm] = useState({
    title: '',
    description: '',
    category: 'Général',
    priority: 'MEDIUM',
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    dueDays: '3',
  });
  const [submittingCreate, setSubmittingCreate] = useState(false);

  const [shareForm, setShareForm] = useState({
    targetAgentId: '',
    accessLevel: 'READ_ONLY' as 'READ_ONLY' | 'CONTRIBUTE',
    expiresInDays: '7',
  });
  const [submittingShare, setSubmittingShare] = useState(false);

  const [reassignForm, setReassignForm] = useState({
    newAgentId: '',
    reason: '',
  });
  const [submittingReassign, setSubmittingReassign] = useState(false);

  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Fetch tickets based on tab
  const fetchTickets = async () => {
    if (!currentWorkspace) return;
    setLoading(true);
    setActionMessage(null);
    try {
      if (activeTab === 'my') {
        const res = await agentApi.getMyTickets(currentWorkspace.id, {
          search: searchTerm || undefined,
          priority: filterPriority !== 'ALL' ? filterPriority : undefined,
          status: filterStatus !== 'ALL' ? filterStatus : undefined,
          page,
          limit: 10,
        });
        setTickets(res.tickets || []);
        setTotalCount(res.total || 0);
        setTotalPages(res.totalPages || 1);
      } else if (activeTab === 'shared') {
        const shared = await agentApi.getSharedTickets(currentWorkspace.id);
        setTickets(shared || []);
        setTotalCount(shared?.length || 0);
        setTotalPages(1);
      } else if (activeTab === 'history') {
        const history = await agentApi.getHistoryTickets(currentWorkspace.id);
        setTickets(history || []);
        setTotalCount(history?.length || 0);
        setTotalPages(1);
      }
    } catch (err: any) {
      console.error('Failed to fetch tickets:', err);
      setActionMessage({ type: 'error', text: err.message || 'Erreur de chargement des tickets.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [currentWorkspace?.id, activeTab, filterPriority, filterStatus, page]);

  // Load team agents for reassign/share
  useEffect(() => {
    if (!currentWorkspace) return;
    workspaceApi.getAgents(currentWorkspace.id).then((res) => {
      setTeamAgents(res || []);
    }).catch(() => {});
  }, [currentWorkspace?.id]);

  // Handle direct ticket ID in URL
  useEffect(() => {
    if (initialTicketId && currentWorkspace) {
      openTicketDetails(initialTicketId);
    }
  }, [initialTicketId, currentWorkspace?.id]);

  const openTicketDetails = async (ticketId: string) => {
    if (!currentWorkspace) return;
    setLoadingDetails(true);
    try {
      const details = await agentApi.getTicketDetails(currentWorkspace.id, ticketId);
      setSelectedTicket(details);
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err.message || 'Impossible de charger les détails du ticket.' });
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    if (!currentWorkspace || !selectedTicket) return;
    try {
      await agentApi.updateTicketStatus(currentWorkspace.id, selectedTicket.id, newStatus);
      setActionMessage({ type: 'success', text: `Statut mis à jour : ${newStatus}` });
      await openTicketDetails(selectedTicket.id);
      fetchTickets();
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err.message || 'Échec de mise à jour du statut.' });
    }
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentWorkspace) return;
    setSubmittingCreate(true);
    try {
      const dueAt = new Date(Date.now() + Number(createForm.dueDays) * 86400000).toISOString();
      const res = await agentApi.createTicket(currentWorkspace.id, {
        title: createForm.title,
        description: createForm.description,
        category: createForm.category,
        priority: createForm.priority,
        customerName: createForm.customerName,
        customerPhone: createForm.customerPhone || undefined,
        customerEmail: createForm.customerEmail || undefined,
        dueAt,
      });

      setIsCreateModalOpen(false);
      setCreateForm({
        title: '',
        description: '',
        category: 'Général',
        priority: 'MEDIUM',
        customerName: '',
        customerPhone: '',
        customerEmail: '',
        dueDays: '3',
      });
      setActionMessage({
        type: 'success',
        text: `Dossier ${res.reference} créé avec succès ! Attribué automatiquement selon les compétences.`,
      });
      fetchTickets();
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err.message || 'Échec de création du ticket.' });
    } finally {
      setSubmittingCreate(false);
    }
  };

  const handleShareTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentWorkspace || !selectedTicket || !shareForm.targetAgentId) return;
    setSubmittingShare(true);
    try {
      const expiresAt = shareForm.expiresInDays
        ? new Date(Date.now() + Number(shareForm.expiresInDays) * 86400000).toISOString()
        : undefined;

      await agentApi.shareTicket(currentWorkspace.id, selectedTicket.id, {
        targetAgentId: shareForm.targetAgentId,
        accessLevel: shareForm.accessLevel,
        expiresAt,
      });

      setIsShareModalOpen(false);
      setActionMessage({ type: 'success', text: 'Ticket partagé avec succès avec votre collègue.' });
      await openTicketDetails(selectedTicket.id);
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err.message || 'Échec du partage du ticket.' });
    } finally {
      setSubmittingShare(false);
    }
  };

  const handleReassignTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentWorkspace || !selectedTicket || !reassignForm.newAgentId) return;
    setSubmittingReassign(true);
    try {
      await agentApi.reassignTicket(currentWorkspace.id, selectedTicket.id, {
        newAgentId: reassignForm.newAgentId,
        reason: reassignForm.reason || 'Réaffectation opérationnelle',
      });

      setIsReassignModalOpen(false);
      setActionMessage({ type: 'success', text: 'Dossier réaffecté avec succès. L’historique a été conservé.' });
      await openTicketDetails(selectedTicket.id);
      fetchTickets();
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err.message || 'Échec de réaffectation du ticket.' });
    } finally {
      setSubmittingReassign(false);
    }
  };

  const isReadOnly = selectedTicket?.isShared && selectedTicket?.myAccessLevel === 'READ_ONLY';
  const canReassign = ['OWNER', 'ADMIN', 'MANAGER'].includes(userRole);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Toast Notification */}
      {actionMessage && (
        <div
          className={`p-4 rounded-2xl flex items-center justify-between gap-3 text-xs font-semibold ${
            actionMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {actionMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{actionMessage.text}</span>
          </div>
          <button
            onClick={() => setActionMessage(null)}
            className="p-1 hover:bg-slate-200/50 rounded-lg cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Header with Title and Create Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Moteur SAV Zadesk
            </span>
            <span className="text-xs text-slate-400">• Total : <strong>{totalCount}</strong></span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Gestion des Dossiers & Tickets SAV
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xl">
            Suivi des réclamations, attributions déterministes par compétences et continuité des dossiers clients.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => fetchTickets()}
            className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
            title="Actualiser la liste"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
          </button>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-bold shadow-md shadow-emerald-500/20 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nouveau Dossier SAV</span>
          </button>
        </div>
      </div>

      {/* Tabs navigation: Mes Tickets / Tickets Partagés / Historique */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => { setActiveTab('my'); setPage(1); }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'my'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <FolderKanban className="w-3.5 h-3.5" />
          <span>Mes tickets attribués</span>
        </button>

        <button
          onClick={() => { setActiveTab('shared'); setPage(1); }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'shared'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Tickets partagés avec moi</span>
        </button>

        <button
          onClick={() => { setActiveTab('history'); setPage(1); }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'history'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Historique & Résolus</span>
        </button>
      </div>

      {/* Search & Filters (Shown on 'my' tab) */}
      {activeTab === 'my' && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Rechercher par référence (ex: TK-1001), client ou objet..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchTickets()}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-slate-800"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              aria-label="Filtrer par priorité"
              value={filterPriority}
              onChange={(e) => { setFilterPriority(e.target.value); setPage(1); }}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="ALL">Toutes les priorités</option>
              <option value="URGENT">🔴 Urgent</option>
              <option value="HIGH">🟠 Élevée</option>
              <option value="MEDIUM">🔵 Moyenne</option>
              <option value="LOW">⚪ Basse</option>
            </select>

            <select
              aria-label="Filtrer par statut"
              value={filterStatus}
              onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="ALL">Tous les statuts</option>
              <option value="OPEN">Ouvert</option>
              <option value="IN_PROGRESS">En cours</option>
              <option value="WAITING_CUSTOMER">Attente client</option>
              <option value="RESOLVED">Résolu</option>
              <option value="CLOSED">Clôturé</option>
            </select>
          </div>
        </div>
      )}

      {/* Tickets List */}
      <div className="rounded-3xl bg-white border border-slate-200/90 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-xs text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-emerald-600 mb-2" />
            <span>Chargement des dossiers SAV...</span>
          </div>
        ) : tickets.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
              <FolderKanban className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">Aucun dossier trouvé</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {activeTab === 'shared'
                ? 'Aucun ticket ne vous a été partagé par un collègue pour le moment.'
                : activeTab === 'history'
                ? 'Aucun ticket résolu ou clôturé dans votre historique.'
                : 'Aucun ticket ne correspond à vos critères de recherche.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {tickets.map((t) => (
              <div
                key={t.id}
                onClick={() => openTicketDetails(t.id)}
                className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/80 transition-colors cursor-pointer group"
              >
                <div className="space-y-1.5 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200">
                      {t.reference}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                      {t.title}
                    </h3>
                    {t.isShared && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1">
                        <Share2 className="w-2.5 h-2.5" />
                        Partagé ({t.myAccessLevel === 'READ_ONLY' ? 'Lecture' : 'Contribution'})
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-1">
                    {t.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                    <span className="text-slate-700 font-medium">
                      Client : {t.customerName} {t.customerPhone ? `(${t.customerPhone})` : ''}
                    </span>
                    <span>•</span>
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-semibold">
                      {t.category}
                    </span>
                    <span>•</span>
                    <span>Créé le {new Date(t.createdAt).toLocaleDateString('fr-FR')}</span>
                    {t.dueAt && (
                      <>
                        <span>•</span>
                        <span className="text-amber-600 font-semibold flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Échéance : {new Date(t.dueAt).toLocaleDateString('fr-FR')}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {/* Priority Badge */}
                  {t.priority === 'URGENT' && (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 text-rose-500" />
                      Urgent
                    </span>
                  )}
                  {t.priority === 'HIGH' && (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-orange-50 text-orange-700 border border-orange-200">
                      Élevée
                    </span>
                  )}
                  {t.priority === 'MEDIUM' && (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                      Moyenne
                    </span>
                  )}
                  {t.priority === 'LOW' && (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                      Basse
                    </span>
                  )}

                  {/* Status Badge */}
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold border ${
                      t.status === 'RESOLVED' || t.status === 'CLOSED'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : t.status === 'IN_PROGRESS'
                        ? 'bg-sky-50 text-sky-700 border-sky-200'
                        : t.status === 'WAITING_CUSTOMER'
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    {t.status === 'IN_PROGRESS'
                      ? 'En cours'
                      : t.status === 'WAITING_CUSTOMER'
                      ? 'Attente client'
                      : t.status === 'RESOLVED'
                      ? 'Résolu'
                      : t.status === 'CLOSED'
                      ? 'Clôturé'
                      : 'Ouvert'}
                  </span>

                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-colors" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination (if applicable) */}
        {activeTab === 'my' && totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Page {page} sur {totalPages}</span>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 disabled:opacity-50 hover:bg-slate-50 cursor-pointer"
              >
                Précédent
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 disabled:opacity-50 hover:bg-slate-50 cursor-pointer"
              >
                Suivant
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* MODAL / DRAWER : DÉTAILS DU TICKET SAV                     */}
      {/* ========================================================= */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-end animate-fade-in">
          <div className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col overflow-hidden animate-slide-in-right">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-start justify-between bg-slate-50/50">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200">
                    {selectedTicket.reference}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">
                    Catégorie : <strong>{selectedTicket.category}</strong>
                  </span>
                  {selectedTicket.isShared && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                      Partagé ({selectedTicket.myAccessLevel})
                    </span>
                  )}
                </div>
                <h2 className="text-lg font-bold text-slate-900">
                  {selectedTicket.title}
                </h2>
              </div>

              <button
                onClick={() => setSelectedTicket(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Read-only Alert if shared as READ_ONLY */}
            {isReadOnly && (
              <div className="px-6 py-2.5 bg-amber-50 border-b border-amber-200 text-xs font-semibold text-amber-800 flex items-center gap-2">
                <Info className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Accès en lecture seule accordé : vous pouvez consulter le dossier mais pas modifier son statut.</span>
              </div>
            )}

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Status and Action Buttons */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Statut actuel
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black text-slate-800">
                      {selectedTicket.status}
                    </span>
                    {selectedTicket.dueAt && (
                      <span className="text-xs text-amber-600 font-medium">
                        • Échéance : {new Date(selectedTicket.dueAt).toLocaleDateString('fr-FR')}
                      </span>
                    )}
                  </div>
                </div>

                {!isReadOnly && (
                  <div className="flex flex-wrap items-center gap-2">
                    {selectedTicket.status !== 'IN_PROGRESS' && (
                      <button
                        onClick={() => handleUpdateStatus('IN_PROGRESS')}
                        className="px-3 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold transition-all cursor-pointer"
                      >
                        Prendre en charge
                      </button>
                    )}
                    {selectedTicket.status !== 'WAITING_CUSTOMER' && (
                      <button
                        onClick={() => handleUpdateStatus('WAITING_CUSTOMER')}
                        className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-all cursor-pointer"
                      >
                        Attente client
                      </button>
                    )}
                    {selectedTicket.status !== 'RESOLVED' && (
                      <button
                        onClick={() => handleUpdateStatus('RESOLVED')}
                        className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-bold transition-all cursor-pointer"
                      >
                        Marquer résolu
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Description du problème client
                </h4>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {selectedTicket.description}
                </div>
              </div>

              {/* Customer Info Card */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Informations client
                </h4>
                <div className="p-4 rounded-2xl bg-white border border-slate-200/90 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Nom complet</span>
                    <strong className="text-slate-800">{selectedTicket.customerName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Téléphone</span>
                    <strong className="text-slate-800">{selectedTicket.customerPhone || 'Non renseigné'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">E-mail</span>
                    <strong className="text-slate-800">{selectedTicket.customerEmail || 'Non renseigné'}</strong>
                  </div>
                </div>
              </div>

              {/* Assigned Agent & Share Controls */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Agent Responsable Principal
                  </span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <UserCheck className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-bold text-slate-800">
                      {selectedTicket.assignedAgent?.user
                        ? `${selectedTicket.assignedAgent.user.firstName || ''} ${selectedTicket.assignedAgent.user.lastName || ''} (${selectedTicket.assignedAgent.user.email})`
                        : 'En attente d\'attribution'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {!isReadOnly && (
                    <button
                      onClick={() => setIsShareModalOpen(true)}
                      className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <Share2 className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Partager</span>
                    </button>
                  )}

                  {canReassign && (
                    <button
                      onClick={() => setIsReassignModalOpen(true)}
                      className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <ArrowRightLeft className="w-3.5 h-3.5 text-amber-600" />
                      <span>Réaffecter</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Active Shares List */}
              {selectedTicket.shares && selectedTicket.shares.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Partages actifs
                  </h4>
                  <div className="space-y-1.5">
                    {selectedTicket.shares.map((s) => (
                      <div
                        key={s.id}
                        className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
                      >
                        <div>
                          <span className="font-bold text-slate-800">
                            {s.sharedWithAgent?.user?.firstName || 'Collègue'} ({s.sharedWithAgent?.user?.email})
                          </span>
                          <span className="text-[10px] text-slate-400 block">
                            Partagé par {s.sharedByUser?.firstName || 'Responsable'} le {new Date(s.createdAt).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                          {s.accessLevel === 'READ_ONLY' ? 'Lecture seule' : 'Contribution'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Activities Timeline */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Historique des activités & Traçabilité
                </h4>
                {selectedTicket.activities && selectedTicket.activities.length > 0 ? (
                  <div className="space-y-2 border-l-2 border-slate-200 pl-4 ml-1">
                    {selectedTicket.activities.map((act) => (
                      <div key={act.id} className="text-xs space-y-0.5 relative">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 absolute -left-[21px] top-1.5" />
                        <div className="flex items-center gap-2 text-slate-800 font-semibold">
                          <span>{act.action}</span>
                          <span className="text-[10px] text-slate-400 font-normal">
                            {new Date(act.createdAt).toLocaleString('fr-FR')}
                          </span>
                        </div>
                        {act.details?.reason && (
                          <p className="text-[11px] text-slate-500 italic">Raison : {act.details.reason}</p>
                        )}
                        {act.user && (
                          <p className="text-[10px] text-slate-400">
                            Par : {act.user.firstName} {act.user.lastName} ({act.user.email})
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">Aucune activité enregistrée.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL : CRÉER UN NOUVEAU TICKET SAV                        */}
      {/* ========================================================= */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Nouveau Dossier SAV</h3>
                <p className="text-xs text-slate-500">
                  Attribution automatique intelligente selon les compétences requises.
                </p>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Objet du ticket *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Réclamation litige livraison colis #ZD-920"
                  value={createForm.title}
                  onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Catégorie métier *
                  </label>
                  <select
                    value={createForm.category}
                    onChange={(e) => setCreateForm({ ...createForm, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer"
                  >
                    <option value="Paiement Mobile">Paiement Mobile (Airtel/MTN/Wave)</option>
                    <option value="SAV Matériel">SAV Matériel & Équipements</option>
                    <option value="Livraison & Colis">Livraison & Colis</option>
                    <option value="Garantie & Retours">Garantie & Retours</option>
                    <option value="Facturation & B2B">Facturation & B2B</option>
                    <option value="Général">Assistance Générale</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Priorité *
                  </label>
                  <select
                    value={createForm.priority}
                    onChange={(e) => setCreateForm({ ...createForm, priority: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer"
                  >
                    <option value="LOW">Basse (Pondération 1)</option>
                    <option value="MEDIUM">Moyenne (Pondération 1)</option>
                    <option value="HIGH">Élevée (Pondération 2)</option>
                    <option value="URGENT">Urgente (Pondération 3)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Description détaillée du problème *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Expliquez la demande du client, le contexte et les étapes déjà réalisées..."
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Nom du client *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Koffi Jean-Luc"
                    value={createForm.customerName}
                    onChange={(e) => setCreateForm({ ...createForm, customerName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Téléphone client
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: +242 06 489 10 33"
                    value={createForm.customerPhone}
                    onChange={(e) => setCreateForm({ ...createForm, customerPhone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submittingCreate}
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-bold shadow-md shadow-emerald-500/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {submittingCreate ? 'Attribution en cours...' : 'Créer et Attribuer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL : PARTAGER LE TICKET AVEC UN COLLÈGUE               */}
      {/* ========================================================= */}
      {isShareModalOpen && selectedTicket && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Partager le ticket</h3>
                <p className="text-xs text-slate-500">{selectedTicket.reference} — {selectedTicket.title}</p>
              </div>
              <button
                onClick={() => setIsShareModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleShareTicket} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Choisir l&apos;agent bénéficiaire *
                </label>
                <select
                  required
                  value={shareForm.targetAgentId}
                  onChange={(e) => setShareForm({ ...shareForm, targetAgentId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer"
                >
                  <option value="">Sélectionner un collègue...</option>
                  {teamAgents.map((ag) => (
                    <option key={ag.id} value={ag.id}>
                      {ag.name || ag.email} ({ag.role})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Niveau d&apos;accès *
                </label>
                <select
                  value={shareForm.accessLevel}
                  onChange={(e) => setShareForm({ ...shareForm, accessLevel: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer"
                >
                  <option value="READ_ONLY">Lecture seule (Consultation sans modification)</option>
                  <option value="CONTRIBUTE">Contribution (Peut mettre à jour et ajouter des notes)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Durée de validité du partage
                </label>
                <select
                  value={shareForm.expiresInDays}
                  onChange={(e) => setShareForm({ ...shareForm, expiresInDays: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer"
                >
                  <option value="3">3 jours</option>
                  <option value="7">7 jours</option>
                  <option value="30">30 jours</option>
                  <option value="">Permanent (Sans expiration)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsShareModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submittingShare}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-bold shadow-md shadow-emerald-500/20 transition-all cursor-pointer disabled:opacity-50"
                >
                  {submittingShare ? 'Partage...' : 'Confirmer le partage'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL : RÉAFFECTER LE TICKET (SUPERVISEUR)                */}
      {/* ========================================================= */}
      {isReassignModalOpen && selectedTicket && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Réaffecter le dossier</h3>
                <p className="text-xs text-slate-500">Changer l&apos;agent responsable principal</p>
              </div>
              <button
                onClick={() => setIsReassignModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleReassignTicket} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Nouveau responsable *
                </label>
                <select
                  required
                  value={reassignForm.newAgentId}
                  onChange={(e) => setReassignForm({ ...reassignForm, newAgentId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer"
                >
                  <option value="">Sélectionner un agent...</option>
                  {teamAgents.map((ag) => (
                    <option key={ag.id} value={ag.id}>
                      {ag.name || ag.email} ({ag.role})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Motif de la réaffectation
                </label>
                <input
                  type="text"
                  placeholder="Ex: Spécialiste litiges, absence imprévue, rééquilibrage"
                  value={reassignForm.reason}
                  onChange={(e) => setReassignForm({ ...reassignForm, reason: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsReassignModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submittingReassign}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold shadow-md shadow-amber-500/20 transition-all cursor-pointer disabled:opacity-50"
                >
                  {submittingReassign ? 'Réaffectation...' : 'Valider la réaffectation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
