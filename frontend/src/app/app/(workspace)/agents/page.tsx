'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  UserCheck,
  Search,
  Plus,
  Mail,
  Phone,
  Copy,
  CheckCircle2,
  X,
  Shield,
  Send,
  Loader2,
  Award,
  Sliders,
  Check,
  Clock,
  Trash2,
  AlertCircle,
  RefreshCw,
  Sparkles,
  UserX,
  Calendar,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useWorkspace } from '@/components/workspace/WorkspaceContext';
import { workspaceApi } from '@/lib/api';

interface SkillItem {
  id: string;
  name: string;
  description?: string | null;
  validatedAt?: string | null;
}

interface TeamMember {
  id: string;
  membershipId?: string;
  firstName?: string;
  lastName?: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
  role: 'AGENT' | 'MANAGER' | 'ADMIN' | 'OWNER';
  joinedAt?: string;
  hasAgentProfile: boolean;
  profileId?: string | null;
  title: string;
  phone?: string;
  status: 'AVAILABLE' | 'BUSY' | 'AWAY' | 'OFFLINE';
  availability?: string | null;
  maxCapacity?: number | null;
  autoAssignmentEnabled?: boolean | null;
  specialties: string[];
  skills: SkillItem[];
}

interface WorkspaceInvitationItem {
  id: string;
  email: string;
  role: string;
  token: string;
  expiresAt: string;
  createdAt: string;
  acceptedAt?: string | null;
  revokedAt?: string | null;
  status: 'PENDING' | 'ACCEPTED' | 'EXPIRED' | 'REVOKED';
  dispatchStatus?: string;
  invitedBy?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export default function AgentsPage() {
  const { currentWorkspace, userRole } = useWorkspace();

  // Core Data State
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [skills, setSkills] = useState<SkillItem[]>([]);
  const [invitations, setInvitations] = useState<WorkspaceInvitationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters & Tabs
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'AGENTS' | 'MANAGERS' | 'ADMINS'>('ALL');
  const [activeTab, setActiveTab] = useState<'team' | 'invitations'>('team');

  // Invite modal
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [lastInvitedEmail, setLastInvitedEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'AGENT' | 'MANAGER' | 'ADMIN'>('AGENT');
  const [inviting, setInviting] = useState(false);
  const [inviteSuccessLink, setInviteSuccessLink] = useState<string | null>(null);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [inviteError, setInviteError] = useState<string | null>(null);

  // Skill management modal for a specific agent
  const [skillModalAgent, setSkillModalAgent] = useState<TeamMember | null>(null);
  const [newSkillName, setNewSkillName] = useState('');
  const [creatingSkill, setCreatingSkill] = useState(false);
  const [updatingSkillId, setUpdatingSkillId] = useState<string | null>(null);

  const canManage = ['OWNER', 'ADMIN', 'MANAGER'].includes(userRole);
  const canInvite = ['OWNER', 'ADMIN'].includes(userRole);

  // Load live data from real endpoints
  const loadData = useCallback(
    async (isSilent = false) => {
      if (!currentWorkspace?.id) return;
      if (!isSilent) setLoading(true);
      else setRefreshing(true);
      setError(null);

      try {
        const [teamData, skillsData, invitesData] = await Promise.all([
          workspaceApi.getTeamMembers(currentWorkspace.id),
          workspaceApi.getSkills(currentWorkspace.id).catch(() => []),
          canManage
            ? workspaceApi.getInvitations(currentWorkspace.id).catch(() => [])
            : Promise.resolve([]),
        ]);

        setMembers(teamData || []);
        setSkills(skillsData || []);
        setInvitations(invitesData || []);
      } catch (err: any) {
        setError(err.message || 'Erreur lors du chargement des collaborateurs.');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [currentWorkspace?.id, canManage]
  );

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle Send Invite
  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail || !currentWorkspace?.id) return;
    setInviting(true);
    setInviteError(null);

    try {
      const data = await workspaceApi.createInvitation(
        currentWorkspace.id,
        inviteEmail.trim(),
        inviteRole
      );

      if (data.success && data.invitation) {
        const link = `${window.location.origin}/invite/${data.invitation.token}`;
        setLastInvitedEmail(inviteEmail.trim());
        setInviteSuccessLink(link);
        await loadData(true);
      } else {
        setInviteError(data.message || "Erreur lors de l'invitation.");
      }
    } catch (err: any) {
      setInviteError(err.message || "Erreur réseau lors de l'envoi de l'invitation.");
    } finally {
      setInviting(false);
    }
  };

  // Copy link helper
  const handleCopy = (link: string, id: string) => {
    navigator.clipboard.writeText(link);
    setCopiedToken(id);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  // Revoke / Cancel Invitation
  const handleCancelInvitation = async (invitationId: string) => {
    if (!currentWorkspace?.id) return;
    if (!confirm('Voulez-vous révoquer cette invitation ?')) return;

    try {
      await workspaceApi.cancelInvitation(currentWorkspace.id, invitationId);
      await loadData(true);
    } catch (err: any) {
      alert(err.message || "Impossible d'annuler l'invitation.");
    }
  };

  // Toggle Agent Skill
  const handleToggleSkill = async (agent: TeamMember, skillId: string, isAssigned: boolean) => {
    if (!currentWorkspace?.id) return;
    setUpdatingSkillId(skillId);

    try {
      if (isAssigned) {
        await workspaceApi.removeAgentSkill(currentWorkspace.id, agent.id, skillId);
      } else {
        await workspaceApi.assignAgentSkill(currentWorkspace.id, agent.id, skillId);
      }

      await loadData(true);

      if (skillModalAgent && skillModalAgent.id === agent.id) {
        const targetSkill = skills.find((s) => s.id === skillId);
        const updatedSkills = isAssigned
          ? skillModalAgent.skills.filter((s) => s.id !== skillId)
          : targetSkill
          ? [...skillModalAgent.skills, targetSkill]
          : skillModalAgent.skills;

        setSkillModalAgent({
          ...skillModalAgent,
          skills: updatedSkills,
          specialties: updatedSkills.map((s) => s.name),
        });
      }
    } catch (err: any) {
      alert(err.message || "Erreur lors de l'attribution de la compétence.");
    } finally {
      setUpdatingSkillId(null);
    }
  };

  // Create New Skill
  const handleCreateSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillName.trim() || !currentWorkspace?.id) return;
    setCreatingSkill(true);

    try {
      const newSkill = await workspaceApi.createSkill(currentWorkspace.id, {
        name: newSkillName.trim(),
      });
      setSkills((prev) => [...prev, newSkill]);
      setNewSkillName('');

      if (skillModalAgent && newSkill?.id) {
        await handleToggleSkill(skillModalAgent, newSkill.id, false);
      }
    } catch (err: any) {
      alert(err.message || 'Erreur lors de la création de la compétence.');
    } finally {
      setCreatingSkill(false);
    }
  };

  // Update Agent Status
  const handleStatusChange = async (
    agentId: string,
    newStatus: 'AVAILABLE' | 'BUSY' | 'AWAY' | 'OFFLINE'
  ) => {
    if (!currentWorkspace?.id) return;

    setMembers((prev) =>
      prev.map((m) => (m.id === agentId ? { ...m, status: newStatus } : m))
    );

    try {
      await workspaceApi.updateAgentStatus(currentWorkspace.id, agentId, {
        availability: newStatus,
      });
      await loadData(true);
    } catch (err: any) {
      loadData(true);
      alert(err.message || 'Impossible de mettre à jour le statut.');
    }
  };

  // Filtered members list
  const filteredMembers = members.filter((m) => {
    // Role filter
    if (roleFilter === 'AGENTS' && m.role !== 'AGENT') return false;
    if (roleFilter === 'MANAGERS' && m.role !== 'MANAGER') return false;
    if (roleFilter === 'ADMINS' && !['OWNER', 'ADMIN'].includes(m.role)) return false;

    // Search query
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      m.name.toLowerCase().includes(q) ||
      m.email.toLowerCase().includes(q) ||
      m.role.toLowerCase().includes(q) ||
      m.title.toLowerCase().includes(q) ||
      (m.specialties && m.specialties.some((s) => s.toLowerCase().includes(q)))
    );
  });

  // Real database metrics (no simulated stats)
  const totalMembers = members.length;
  const activeSavAgents = members.filter(
    (m) => m.role === 'AGENT' || m.role === 'MANAGER' || m.hasAgentProfile
  ).length;
  const adminCount = members.filter((m) => ['OWNER', 'ADMIN'].includes(m.role)).length;
  const pendingInvitesCount = invitations.filter((i) => i.status === 'PENDING').length;

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* 1. Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-emerald-600" />
            Équipe SAV & Compétences
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Gestion des conseillers, membres d&apos;équipe et invitations au sein de{' '}
            <strong className="text-slate-800">{currentWorkspace?.name}</strong>.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => loadData(true)}
            disabled={refreshing || loading}
            title="Actualiser les membres réels"
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-xs cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-emerald-600' : ''}`} />
          </button>

          {canInvite && (
            <button
              onClick={() => {
                setInviteSuccessLink(null);
                setInviteEmail('');
                setInviteError(null);
                setInviteModalOpen(true);
              }}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-md shadow-slate-900/10 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Inviter un Conseiller</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Real Metrics KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Membres Workspace
            </span>
            <span className="text-xl font-extrabold text-slate-900 mt-0.5 block">{totalMembers}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Conseillers SAV
            </span>
            <span className="text-xl font-extrabold text-emerald-600 mt-0.5 block">{activeSavAgents}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Direction & Admin
            </span>
            <span className="text-xl font-extrabold text-indigo-600 mt-0.5 block">{adminCount}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <Shield className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Invitations en attente
            </span>
            <span className="text-xl font-extrabold text-amber-600 mt-0.5 block">{pendingInvitesCount}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Clock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 3. Navigation Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100/90 border border-slate-200/70 w-fit">
          <button
            onClick={() => setActiveTab('team')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'team'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Équipe & Conseillers ({members.length})</span>
          </button>

          {canManage && (
            <button
              onClick={() => setActiveTab('invitations')}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'invitations'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Invitations envoyées ({invitations.length})</span>
            </button>
          )}
        </div>

        {activeTab === 'team' && (
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Quick role filter pills */}
            <div className="hidden md:flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-[11px] font-semibold text-slate-600">
              <button
                onClick={() => setRoleFilter('ALL')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  roleFilter === 'ALL' ? 'bg-white text-slate-900 shadow-xs font-bold' : ''
                }`}
              >
                Tous
              </button>
              <button
                onClick={() => setRoleFilter('AGENTS')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  roleFilter === 'AGENTS' ? 'bg-white text-slate-900 shadow-xs font-bold' : ''
                }`}
              >
                Agents
              </button>
              <button
                onClick={() => setRoleFilter('MANAGERS')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  roleFilter === 'MANAGERS' ? 'bg-white text-slate-900 shadow-xs font-bold' : ''
                }`}
              >
                Managers
              </button>
              <button
                onClick={() => setRoleFilter('ADMINS')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  roleFilter === 'ADMINS' ? 'bg-white text-slate-900 shadow-xs font-bold' : ''
                }`}
              >
                Admins
              </button>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Rechercher par nom, rôle ou spécialité..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-8 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 shadow-2xs"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 4. Tab Content: Team Members */}
      {activeTab === 'team' && (
        <>
          {loading ? (
            <div className="py-20 text-center space-y-3 bg-white rounded-3xl border border-slate-200">
              <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
              <p className="text-xs text-slate-500">Chargement des membres réels du workspace...</p>
            </div>
          ) : error ? (
            <div className="p-8 rounded-3xl bg-rose-50 border border-rose-200 text-center space-y-3">
              <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
              <h3 className="text-sm font-bold text-rose-900">Impossible de charger l&apos;équipe</h3>
              <p className="text-xs text-rose-600 max-w-md mx-auto">{error}</p>
              <Button variant="outline" size="sm" onClick={() => loadData()}>
                Réessayer
              </Button>
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className="p-12 rounded-3xl bg-white border border-slate-200 text-center space-y-3">
              <UserX className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-sm font-bold text-slate-800">
                {searchTerm || roleFilter !== 'ALL'
                  ? 'Aucun membre ne correspond à vos critères'
                  : 'Aucun collaborateur dans cet espace'}
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {searchTerm || roleFilter !== 'ALL'
                  ? 'Modifiez votre recherche ou réinitialisez les filtres.'
                  : 'Invitez votre premier conseiller SAV pour débuter.'}
              </p>
              {canInvite && !searchTerm && roleFilter === 'ALL' && (
                <Button variant="gradient" size="sm" onClick={() => setInviteModalOpen(true)}>
                  <Plus className="w-4 h-4 mr-1.5" />
                  Inviter un Conseiller
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredMembers.map((member) => (
                <div
                  key={member.id}
                  className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-4 hover:border-slate-300 transition-all"
                >
                  {/* Card Header: Avatar + Identity + Role */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                        {member.hasAgentProfile && (
                          <span
                            className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full ring-2 ring-white ${
                              member.status === 'AVAILABLE'
                                ? 'bg-emerald-500'
                                : member.status === 'BUSY'
                                ? 'bg-amber-500'
                                : member.status === 'AWAY'
                                ? 'bg-sky-500'
                                : 'bg-slate-300'
                            }`}
                            title={`Statut SAV : ${member.status}`}
                          />
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-sm font-bold text-slate-900">{member.name}</h3>
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                              member.role === 'OWNER'
                                ? 'bg-amber-100 text-amber-900'
                                : member.role === 'ADMIN'
                                ? 'bg-indigo-100 text-indigo-900'
                                : member.role === 'MANAGER'
                                ? 'bg-purple-100 text-purple-900'
                                : 'bg-emerald-100 text-emerald-900'
                            }`}
                          >
                            {member.role === 'OWNER'
                              ? 'PROPRIÉTAIRE'
                              : member.role === 'ADMIN'
                              ? 'ADMIN'
                              : member.role === 'MANAGER'
                              ? 'MANAGER'
                              : 'AGENT SAV'}
                          </span>
                        </div>

                        <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                          <Mail className="w-3 h-3 text-slate-400" />
                          <span className="truncate max-w-[220px]">{member.email}</span>
                          {member.phone && (
                            <>
                              <span className="text-slate-300">•</span>
                              <Phone className="w-3 h-3 text-slate-400" />
                              <span>{member.phone}</span>
                            </>
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[11px] font-semibold text-slate-700 block">
                        {member.title}
                      </span>
                      {member.joinedAt && (
                        <span className="text-[10px] text-slate-400 flex items-center justify-end gap-1 mt-0.5">
                          <Calendar className="w-3 h-3" />
                          <span>
                            {new Date(member.joinedAt).toLocaleDateString('fr-FR', {
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Skills / Specialties Section */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Spécialités & Compétences SAV ({member.specialties?.length || 0})
                      </span>
                      {canManage && (
                        <button
                          onClick={() => setSkillModalAgent(member)}
                          className="text-[11px] font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 cursor-pointer"
                        >
                          <Sliders className="w-3 h-3" />
                          <span>Gérer</span>
                        </button>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-1.5 min-h-[28px] items-center">
                      {member.specialties && member.specialties.length > 0 ? (
                        member.specialties.map((s) => (
                          <span
                            key={s}
                            className="px-2.5 py-0.5 rounded-lg bg-emerald-50 text-emerald-800 text-[11px] font-semibold border border-emerald-200 flex items-center gap-1"
                          >
                            <Sparkles className="w-2.5 h-2.5 text-emerald-600" />
                            <span>{s}</span>
                          </span>
                        ))
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">
                          {member.hasAgentProfile
                            ? 'Aucune spécialité attribuée pour le moment.'
                            : 'Membre workspace (profil conseiller non initialisé).'}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Live Status Selector & Real Capacity */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-400 text-[11px]">
                        {member.hasAgentProfile
                          ? `Capacité max : ${member.maxCapacity || 10} dossiers`
                          : "Accès d'équipe standard"}
                      </span>
                    </div>

                    {canManage ? (
                      <select
                        value={member.status || 'AVAILABLE'}
                        onChange={(e) => handleStatusChange(member.id, e.target.value as any)}
                        className="px-2 py-0.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px] font-bold text-slate-700 cursor-pointer focus:outline-none focus:border-emerald-500"
                      >
                        <option value="AVAILABLE">🟢 Disponible</option>
                        <option value="BUSY">🟠 En ligne (Occupé)</option>
                        <option value="AWAY">🔵 Absent</option>
                        <option value="OFFLINE">⚪ Hors ligne</option>
                      </select>
                    ) : (
                      <span className="text-[11px] text-slate-500 font-medium">
                        {member.status === 'AVAILABLE'
                          ? '🟢 Disponible'
                          : member.status === 'BUSY'
                          ? '🟠 Occupé'
                          : member.status === 'AWAY'
                          ? '🔵 Absent'
                          : '⚪ Hors ligne'}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* 5. Tab Content: Invitations List */}
      {activeTab === 'invitations' && (
        <div className="space-y-4">
          {invitations.length === 0 ? (
            <div className="p-12 rounded-3xl bg-white border border-slate-200 text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-sm font-bold text-slate-800">Aucune invitation envoyée</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Invitez des collaborateurs pour qu&apos;ils rejoignent votre espace SAV.
              </p>
              {canInvite && (
                <Button variant="gradient" size="sm" onClick={() => setInviteModalOpen(true)}>
                  <Plus className="w-4 h-4 mr-1.5" />
                  Inviter un Conseiller
                </Button>
              )}
            </div>
          ) : (
            <div className="rounded-3xl bg-white border border-slate-200 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-500 uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="px-6 py-3.5">Email destinataire</th>
                      <th className="px-6 py-3.5">Rôle proposé</th>
                      <th className="px-6 py-3.5">Date d&apos;envoi</th>
                      <th className="px-6 py-3.5">Expire le</th>
                      <th className="px-6 py-3.5">Statut</th>
                      <th className="px-6 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {invitations.map((inv) => {
                      const inviteLink = `${typeof window !== 'undefined' ? window.location.origin : ''}/invite/${inv.token}`;
                      const isCopied = copiedToken === inv.id;
                      const isPending = inv.status === 'PENDING';

                      return (
                        <tr key={inv.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="px-6 py-4 font-semibold text-slate-900 flex items-center gap-2">
                            <Mail className="w-3.5 h-3.5 text-slate-400" />
                            <span>{inv.email}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700">
                              {inv.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-slate-500">
                            {new Date(inv.createdAt).toLocaleDateString('fr-FR', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </td>
                          <td className="px-6 py-4 text-slate-500">
                            {new Date(inv.expiresAt).toLocaleDateString('fr-FR', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </td>
                          <td className="px-6 py-4">
                            {inv.status === 'ACCEPTED' ? (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                Acceptée
                              </span>
                            ) : inv.status === 'REVOKED' ? (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                Révoquée
                              </span>
                            ) : inv.status === 'EXPIRED' ? (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500">
                                Expirée
                              </span>
                            ) : (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                En attente
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right space-x-2">
                            {isPending && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleCopy(inviteLink, inv.id)}
                                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-bold transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                                >
                                  <Copy className="w-3 h-3" />
                                  <span>{isCopied ? 'Copié !' : 'Copier le lien'}</span>
                                </button>
                                {canInvite && (
                                  <button
                                    type="button"
                                    onClick={() => handleCancelInvitation(inv.id)}
                                    title="Révoquer cette invitation"
                                    className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors inline-flex items-center cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 6. Modal: Manage Agent Skills */}
      {skillModalAgent && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="max-w-lg w-full p-6 sm:p-7 rounded-3xl bg-white border border-slate-200 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Award className="w-5 h-5 text-emerald-600" />
                  Compétences & Spécialités SAV
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Conseiller : <strong className="text-slate-800">{skillModalAgent.name}</strong>
                </p>
              </div>
              <button
                onClick={() => setSkillModalAgent(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* List of Available Skills */}
            <div className="space-y-3">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Cochez les spécialités traitées par ce conseiller :
              </span>

              <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                {skills.map((skill) => {
                  const isAssigned = skillModalAgent.skills.some(
                    (s) => s.id === skill.id || s.name === skill.name
                  );
                  const isUpdating = updatingSkillId === skill.id;

                  return (
                    <div
                      key={skill.id}
                      onClick={() =>
                        !isUpdating && handleToggleSkill(skillModalAgent, skill.id, isAssigned)
                      }
                      className={`p-3 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                        isAssigned
                          ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950'
                          : 'bg-slate-50/60 border-slate-200 hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <div className="pr-3">
                        <strong className="text-xs block font-bold">{skill.name}</strong>
                        {skill.description && (
                          <span className="text-[11px] text-slate-500 block mt-0.5 leading-tight">
                            {skill.description}
                          </span>
                        )}
                      </div>

                      <div
                        className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 ${
                          isAssigned
                            ? 'bg-emerald-600 border-emerald-600 text-white'
                            : 'border-slate-300 bg-white'
                        }`}
                      >
                        {isUpdating ? (
                          <Loader2 className="w-3 h-3 animate-spin text-white" />
                        ) : isAssigned ? (
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Inline Form to Add a New Workspace Skill */}
            <form onSubmit={handleCreateSkill} className="pt-2 border-t border-slate-100 flex gap-2">
              <input
                type="text"
                placeholder="Créer une nouvelle spécialité SAV..."
                value={newSkillName}
                onChange={(e) => setNewSkillName(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
              />
              <Button
                variant="outline"
                size="sm"
                type="submit"
                isLoading={creatingSkill}
                disabled={!newSkillName.trim()}
              >
                Ajouter
              </Button>
            </form>

            <div className="pt-2 flex justify-end">
              <Button variant="gradient" onClick={() => setSkillModalAgent(null)}>
                Terminer
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 7. Modal: Invite Team Member */}
      {inviteModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="max-w-md w-full p-6 sm:p-7 rounded-3xl bg-white border border-slate-200 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                Inviter un membre d&apos;équipe
              </h3>
              <button
                onClick={() => setInviteModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {inviteSuccessLink ? (
              <div className="space-y-4">
                {/* 1. Notification Zavu Email Sent */}
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-left space-y-1.5">
                  <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>E-mail d&apos;invitation expédié avec succès !</span>
                  </div>
                  <p className="text-[11px] text-emerald-700 leading-relaxed">
                    Un e-mail d&apos;activation officiel a été transmis automatiquement via Zavu à{' '}
                    <strong className="text-emerald-950 font-bold">{lastInvitedEmail || inviteEmail}</strong>.
                    Le collaborateur peut cliquer directement sur le lien sécurisé reçu dans sa boîte de réception.
                  </p>
                </div>

                {/* 2. Direct Shareable Link (WhatsApp / SMS / Slack) */}
                <div className="space-y-2 pt-1 text-left">
                  <label className="text-[11px] font-bold text-slate-700 block">
                    Ou partagez-lui le lien direct (WhatsApp, SMS, Slack) :
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={inviteSuccessLink}
                      className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 font-mono select-all focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => handleCopy(inviteSuccessLink, 'modal-success')}
                      className="px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>{copiedToken === 'modal-success' ? 'Copié !' : 'Copier'}</span>
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    variant="outline"
                    className="w-full text-xs font-semibold"
                    onClick={() => setInviteModalOpen(false)}
                  >
                    Fermer
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSendInvite} className="space-y-4 text-xs">
                {inviteError && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700">
                    {inviteError}
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700">
                    Adresse e-mail du collaborateur
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="conseiller@entreprise.ci"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700">Rôle à attribuer</label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="AGENT">Agent (Traitement quotidien des flux SAV)</option>
                    <option value="MANAGER">Manager (Supervision & escalades SAV)</option>
                    <option value="ADMIN">Admin (Gestion des collaborateurs & réglages)</option>
                  </select>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <Button variant="ghost" type="button" onClick={() => setInviteModalOpen(false)}>
                    Annuler
                  </Button>
                  <Button
                    variant="gradient"
                    type="submit"
                    isLoading={inviting}
                    rightIcon={<Send className="w-3.5 h-3.5" />}
                  >
                    Créer l&apos;invitation
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
