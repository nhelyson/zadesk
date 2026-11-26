'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Search,
  Plus,
  Mail,
  Phone,
  Copy,
  CheckCircle2,
  X,
  Send,
  Loader2,
  Sliders,
  Check,
  Trash2,
  AlertCircle,
  RefreshCw,
  UserX,
  Pencil,
  Power,
} from 'lucide-react';
import { useWorkspace, notifyWorkspaceDataUpdated } from '@/components/workspace/WorkspaceContext';
import { workspaceApi } from '@/lib/api';
import { PresenceState, AvailabilityState, AccountStatus } from '@/types/workspace';

interface SkillItem {
  id: string;
  name: string;
  description?: string | null;
  isActive?: boolean;
  validatedAt?: string | null;
  _count?: { agents: number };
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
  presence: PresenceState;
  presenceInfo?: {
    state: PresenceState;
    activeSessions: number;
    lastHeartbeatAt: string | null;
    lastActivityAt: string | null;
  };
  availability: AvailabilityState;
  accountStatus: AccountStatus;
  maxCapacity?: number | null;
  autoAssignmentEnabled?: boolean | null;
  activeChats?: number;
  resolvedToday?: number;
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
}

const PRESENCE_META: Record<
  PresenceState,
  { label: string; dotClass: string; textClass: string }
> = {
  ONLINE: {
    label: 'En ligne',
    dotClass: 'bg-[#22C55E]',
    textClass: 'text-[#0D1B3D]',
  },
  AWAY: {
    label: 'Absent',
    dotClass: 'bg-amber-500',
    textClass: 'text-amber-900',
  },
  OFFLINE: {
    label: 'Hors ligne',
    dotClass: 'bg-slate-300',
    textClass: 'text-slate-500',
  },
};

const AVAILABILITY_META: Record<AvailabilityState, { label: string; textClass: string }> = {
  AVAILABLE: { label: 'Disponible', textClass: 'text-[#0D1B3D] font-semibold' },
  BUSY: { label: 'Occupé', textClass: 'text-amber-800 font-medium' },
  DND: { label: 'Ne pas déranger', textClass: 'text-slate-600 font-medium' },
};

const ACCOUNT_STATUS_META: Record<AccountStatus, { label: string; textClass: string }> = {
  ACTIVE: { label: 'Actif', textClass: 'text-[#0D1B3D]' },
  SUSPENDED: { label: 'Suspendu', textClass: 'text-rose-700 font-semibold' },
  ARCHIVED: { label: 'Archivé', textClass: 'text-slate-500' },
};

const ROLE_LABELS: Record<TeamMember['role'], string> = {
  OWNER: 'Propriétaire',
  ADMIN: 'Administrateur',
  MANAGER: 'Superviseur',
  AGENT: 'Conseiller',
};

export default function AgentsPage() {
  const { currentWorkspace, user, userRole, workspaceUsage } = useWorkspace();

  const [members, setMembers] = useState<TeamMember[]>([]);
  const [skills, setSkills] = useState<SkillItem[]>([]);
  const [invitations, setInvitations] = useState<WorkspaceInvitationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'AGENTS' | 'MANAGERS' | 'ADMINS'>('ALL');
  const [activeTab, setActiveTab] = useState<'team' | 'skills' | 'invitations'>('team');

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
  const [modalNewSkillName, setModalNewSkillName] = useState('');
  const [creatingModalSkill, setCreatingModalSkill] = useState(false);
  const [updatingSkillId, setUpdatingSkillId] = useState<string | null>(null);

  // Workspace Skills Tab state
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillDesc, setNewSkillDesc] = useState('');
  const [creatingSkill, setCreatingSkill] = useState(false);
  const [skillFormError, setSkillFormError] = useState<string | null>(null);
  const [editingSkill, setEditingSkill] = useState<SkillItem | null>(null);
  const [editSkillName, setEditSkillName] = useState('');
  const [editSkillDesc, setEditSkillDesc] = useState('');
  const [savingSkillEdit, setSavingSkillEdit] = useState(false);

  const canManage = ['OWNER', 'ADMIN', 'MANAGER'].includes(userRole);
  const canInvite = ['OWNER', 'ADMIN'].includes(userRole);

  const loadData = useCallback(
    async (isSilent = false) => {
      if (!currentWorkspace?.id) return;
      if (!isSilent) setLoading(true);
      else setRefreshing(true);
      setError(null);

      try {
        const [teamData, skillsData, invitesData] = await Promise.all([
          workspaceApi.getTeamMembers(currentWorkspace.id),
          workspaceApi.getSkills(currentWorkspace.id, true).catch(() => []),
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

  // Refresh live presence silently every 30s
  useEffect(() => {
    if (!currentWorkspace?.id) return;
    const timer = setInterval(() => {
      loadData(true);
    }, 30000);
    return () => clearInterval(timer);
  }, [currentWorkspace?.id, loadData]);

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
        notifyWorkspaceDataUpdated();
      } else {
        setInviteError(data.message || "Erreur lors de l'invitation.");
      }
    } catch (err: any) {
      setInviteError(err.message || "Erreur réseau lors de l'envoi de l'invitation.");
    } finally {
      setInviting(false);
    }
  };

  const handleCopy = (link: string, id: string) => {
    navigator.clipboard.writeText(link);
    setCopiedToken(id);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const handleCancelInvitation = async (invitationId: string) => {
    if (!currentWorkspace?.id) return;
    if (!confirm('Voulez-vous révoquer cette invitation ?')) return;

    try {
      await workspaceApi.cancelInvitation(currentWorkspace.id, invitationId);
      await loadData(true);
      notifyWorkspaceDataUpdated();
    } catch (err: any) {
      alert(err.message || "Impossible d'annuler l'invitation.");
    }
  };

  const handleToggleAgentSkill = async (
    agent: TeamMember,
    skillId: string,
    isAssigned: boolean
  ) => {
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

  const handleCreateSkillFromModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalNewSkillName.trim() || !currentWorkspace?.id) return;
    setCreatingModalSkill(true);

    try {
      const newSkill = await workspaceApi.createSkill(currentWorkspace.id, {
        name: modalNewSkillName.trim(),
      });
      setSkills((prev) => [...prev, newSkill]);
      setModalNewSkillName('');

      if (skillModalAgent && newSkill?.id) {
        await handleToggleAgentSkill(skillModalAgent, newSkill.id, false);
      }
    } catch (err: any) {
      alert(err.message || 'Erreur lors de la création de la compétence.');
    } finally {
      setCreatingModalSkill(false);
    }
  };

  const handleCreateWorkspaceSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillName.trim() || !currentWorkspace?.id) return;
    setCreatingSkill(true);
    setSkillFormError(null);

    try {
      await workspaceApi.createSkill(currentWorkspace.id, {
        name: newSkillName.trim(),
        description: newSkillDesc.trim() || undefined,
      });
      setNewSkillName('');
      setNewSkillDesc('');
      await loadData(true);
    } catch (err: any) {
      setSkillFormError(err.message || 'Impossible de créer cette compétence.');
    } finally {
      setCreatingSkill(false);
    }
  };

  const handleSaveSkillEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSkill || !editSkillName.trim() || !currentWorkspace?.id) return;
    setSavingSkillEdit(true);

    try {
      await workspaceApi.updateSkill(currentWorkspace.id, editingSkill.id, {
        name: editSkillName.trim(),
        description: editSkillDesc.trim() || null,
      });
      setEditingSkill(null);
      await loadData(true);
    } catch (err: any) {
      alert(err.message || 'Impossible de modifier cette compétence.');
    } finally {
      setSavingSkillEdit(false);
    }
  };

  const handleToggleSkillActive = async (skill: SkillItem) => {
    if (!currentWorkspace?.id) return;
    try {
      await workspaceApi.updateSkill(currentWorkspace.id, skill.id, {
        isActive: skill.isActive === false,
      });
      await loadData(true);
    } catch (err: any) {
      alert(err.message || 'Impossible de changer le statut de cette compétence.');
    }
  };

  const filteredMembers = members.filter((m) => {
    if (roleFilter === 'AGENTS' && m.role !== 'AGENT') return false;
    if (roleFilter === 'MANAGERS' && m.role !== 'MANAGER') return false;
    if (roleFilter === 'ADMINS' && !['OWNER', 'ADMIN'].includes(m.role)) return false;

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

  const activeSkills = skills.filter((s) => s.isActive !== false);
  const totalMembers = members.length;
  const onlineCount = members.filter((m) => m.presence === 'ONLINE').length;
  const availableCount = members.filter(
    (m) => m.accountStatus === 'ACTIVE' && m.availability === 'AVAILABLE'
  ).length;
  const pendingInvitesCount = invitations.filter((i) => i.status === 'PENDING').length;
  const agentsQuota = workspaceUsage?.metrics?.agents;
  const isAgentsQuotaReached = agentsQuota?.status === 'REACHED';

  return (
    <div className="space-y-6 pb-12">
      {isAgentsQuotaReached && canManage && (
        <div className="px-4 py-3 rounded-xl bg-amber-50/90 border border-amber-200 text-amber-950 text-xs flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
            <span>
              <strong>Quota d&apos;équipe atteint</strong> ({agentsQuota?.used}/
              {agentsQuota?.limit} sur la formule {workspaceUsage?.plan?.name}).
              {['OWNER', 'ADMIN'].includes(userRole)
                ? ' Passez à une formule supérieure pour inviter de nouveaux conseillers.'
                : ' Contactez un administrateur pour augmenter la capacité.'}
            </span>
          </div>
          {['OWNER', 'ADMIN'].includes(userRole) && (
            <Link
              href="/app/billing"
              className="px-3 h-7 rounded-full bg-amber-900 hover:bg-amber-950 text-white text-[11px] font-semibold inline-flex items-center shrink-0"
            >
              Gérer le forfait
            </Link>
          )}
        </div>
      )}
      {/* Synthèse & actions */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
          <span>
            <strong className="text-[#0D1B3D] tabular-nums">{totalMembers}</strong> membre
            {totalMembers > 1 ? 's' : ''}
          </span>
          <span>·</span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
            <strong className="text-[#0D1B3D] tabular-nums">{onlineCount}</strong> en ligne
          </span>
          <span>·</span>
          <span>
            <strong className="text-[#0D1B3D] tabular-nums">{availableCount}</strong> disponible
            {availableCount > 1 ? 's' : ''}
          </span>
          {canManage && (
            <>
              <span>·</span>
              <span>
                <strong className="text-[#0D1B3D] tabular-nums">{pendingInvitesCount}</strong>{' '}
                invitation{pendingInvitesCount > 1 ? 's' : ''} en attente
              </span>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => loadData(true)}
            disabled={refreshing || loading}
            title="Actualiser"
            className="w-9 h-9 rounded-lg bg-white hover:bg-[#F4F3EF] text-slate-600 border border-[#E5E4DF] transition-colors flex items-center justify-center cursor-pointer"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-[#0D1B3D]' : ''}`}
            />
          </button>

          {canInvite && (
            <button
              type="button"
              onClick={() => {
                setInviteSuccessLink(null);
                setInviteEmail('');
                setInviteError(null);
                setInviteModalOpen(true);
              }}
              className="px-3.5 h-9 rounded-lg bg-[#0D1B3D] hover:bg-[#152C61] text-white text-xs font-semibold shadow-[inset_0_1px_0_rgba(255,255,255,0.16)] transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Inviter un conseiller</span>
            </button>
          )}
        </div>
      </div>

      {/* Onglets & recherche */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E5E4DF] pb-3">
        <div className="flex items-center gap-5 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('team')}
            className={`pb-2 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'team'
                ? 'border-[#0D1B3D] text-[#0D1B3D] font-semibold'
                : 'border-transparent text-slate-500 hover:text-[#0D1B3D] font-medium'
            }`}
          >
            Équipe ({members.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('skills')}
            className={`pb-2 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'skills'
                ? 'border-[#0D1B3D] text-[#0D1B3D] font-semibold'
                : 'border-transparent text-slate-500 hover:text-[#0D1B3D] font-medium'
            }`}
          >
            Compétences ({activeSkills.length})
          </button>

          {canManage && (
            <button
              type="button"
              onClick={() => setActiveTab('invitations')}
              className={`pb-2 border-b-2 transition-colors cursor-pointer ${
                activeTab === 'invitations'
                  ? 'border-[#0D1B3D] text-[#0D1B3D] font-semibold'
                  : 'border-transparent text-slate-500 hover:text-[#0D1B3D] font-medium'
              }`}
            >
              Invitations ({invitations.length})
            </button>
          )}
        </div>

        {activeTab === 'team' && (
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="hidden md:flex items-center gap-0.5 bg-[#F4F3EF] p-0.5 rounded-lg border border-[#E5E4DF] text-xs">
              {(
                [
                  { id: 'ALL', label: 'Tous' },
                  { id: 'AGENTS', label: 'Conseillers' },
                  { id: 'MANAGERS', label: 'Superviseurs' },
                  { id: 'ADMINS', label: 'Admins' },
                ] as const
              ).map((rf) => (
                <button
                  key={rf.id}
                  type="button"
                  onClick={() => setRoleFilter(rf.id)}
                  className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                    roleFilter === rf.id
                      ? 'bg-white text-[#0D1B3D] font-semibold shadow-sm'
                      : 'text-slate-600 hover:text-[#0D1B3D]'
                  }`}
                >
                  {rf.label}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Rechercher nom, compétence…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-8 pl-9 pr-7 rounded-lg bg-white border border-[#E5E4DF] text-xs text-[#0D1B3D] placeholder:text-slate-400 focus:outline-none focus:border-[#0D1B3D]"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#0D1B3D] cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ONGLET 1 : ÉQUIPE */}
      {activeTab === 'team' && (
        <>
          {loading ? (
            <div className="py-16 text-center space-y-2.5 bg-white rounded-xl border border-[#E5E4DF]">
              <Loader2 className="w-5 h-5 text-[#0D1B3D] animate-spin mx-auto" />
              <p className="text-xs text-slate-500">Chargement de l&apos;équipe…</p>
            </div>
          ) : error ? (
            <div className="p-6 rounded-xl bg-rose-50 border border-rose-200 text-center space-y-2.5">
              <AlertCircle className="w-6 h-6 text-rose-600 mx-auto" />
              <p className="text-xs font-semibold text-rose-900">{error}</p>
              <button
                type="button"
                onClick={() => loadData()}
                className="px-3 h-8 rounded-lg bg-white border border-rose-200 text-xs font-semibold text-rose-800 cursor-pointer"
              >
                Réessayer
              </button>
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className="p-10 rounded-xl bg-white border border-[#E5E4DF] text-center space-y-2.5">
              <UserX className="w-8 h-8 text-slate-300 mx-auto" />
              <h3 className="text-sm font-bold text-[#0D1B3D]">
                {searchTerm || roleFilter !== 'ALL'
                  ? 'Aucun collaborateur ne correspond aux filtres'
                  : 'Aucun collaborateur dans cet espace'}
              </h3>
              <p className="text-xs text-slate-500">
                {searchTerm || roleFilter !== 'ALL'
                  ? 'Modifiez votre recherche ou réinitialisez le filtre.'
                  : 'Invitez un premier conseiller pour commencer.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredMembers.map((member) => {
                const presenceInfo = PRESENCE_META[member.presence || 'OFFLINE'];
                const availabilityInfo =
                  AVAILABILITY_META[member.availability || 'AVAILABLE'] ||
                  AVAILABILITY_META.AVAILABLE;
                const accountInfo =
                  ACCOUNT_STATUS_META[member.accountStatus || 'ACTIVE'] ||
                  ACCOUNT_STATUS_META.ACTIVE;
                const isSelf = Boolean(user?.id && member.id === user.id);

                return (
                  <div
                    key={member.id}
                    className="p-4 sm:p-5 rounded-xl bg-white border border-[#E5E4DF] space-y-3.5 flex flex-col justify-between"
                  >
                    {/* Identité & rôle */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="relative shrink-0">
                          <div className="w-10 h-10 rounded-lg bg-[#0D1B3D] text-white flex items-center justify-center font-bold text-xs">
                            {member.name.charAt(0).toUpperCase()}
                          </div>
                          <span
                            className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ring-2 ring-white ${presenceInfo.dotClass}`}
                            title={`Présence détectée : ${presenceInfo.label}`}
                          />
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-sm font-bold text-[#0D1B3D] truncate">
                              {member.name}
                            </h3>
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-[#FAFAF8] text-slate-700 border border-[#E5E4DF]">
                              {ROLE_LABELS[member.role]}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5 truncate">
                            <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate">{member.email}</span>
                            {member.phone && (
                              <>
                                <span className="text-slate-300">·</span>
                                <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                                <span className="font-mono">{member.phone}</span>
                              </>
                            )}
                          </p>
                        </div>
                      </div>

                      <span className="text-[11px] font-medium text-slate-500 shrink-0">
                        {member.title}
                      </span>
                    </div>

                    {/* 3 états distincts en lecture seule : Présence / Disponibilité / Compte */}
                    <div className="grid grid-cols-3 gap-2 p-2.5 rounded-lg bg-[#FAFAF8] border border-[#E5E4DF] text-xs">
                      <div>
                        <span className="text-[10px] font-medium text-slate-400 block">
                          Présence
                        </span>
                        <span
                          className={`mt-0.5 inline-flex items-center gap-1.5 font-medium ${presenceInfo.textClass}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${presenceInfo.dotClass}`} />
                          <span>{presenceInfo.label}</span>
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] font-medium text-slate-400 block">
                          Disponibilité
                        </span>
                        <div className="mt-0.5 flex items-center gap-1.5 flex-wrap">
                          <span className={availabilityInfo.textClass}>
                            {availabilityInfo.label}
                          </span>
                          {isSelf && (
                            <Link
                              href="/app/agent/profile"
                              className="text-[10px] text-slate-500 hover:text-[#0D1B3D] underline"
                            >
                              Modifier
                            </Link>
                          )}
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] font-medium text-slate-400 block">
                          Compte
                        </span>
                        <span className={`mt-0.5 block font-medium ${accountInfo.textClass}`}>
                          {accountInfo.label}
                        </span>
                      </div>
                    </div>

                    {/* Compétences */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-medium text-slate-500">
                          Compétences
                        </span>
                        {canManage && (
                          <button
                            type="button"
                            onClick={() => setSkillModalAgent(member)}
                            className="text-[11px] font-semibold text-[#0D1B3D] hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <Sliders className="w-3 h-3 text-slate-400" />
                            <span>Associer</span>
                          </button>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-1.5 items-center min-h-[24px]">
                        {member.skills && member.skills.length > 0 ? (
                          member.skills.map((s) => (
                            <span
                              key={s.id}
                              className="px-2 py-0.5 rounded-md bg-[#F4F3EF] text-[#0D1B3D] text-[11px] font-medium border border-[#E5E4DF]"
                            >
                              {s.name}
                            </span>
                          ))
                        ) : (
                          <span className="text-[11px] text-slate-400">
                            {activeSkills.length === 0
                              ? 'Conseiller polyvalent (aucune compétence configurée)'
                              : 'Aucune compétence associée'}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Charge de travail réelle */}
                    <div className="pt-2.5 border-t border-[#F0EFEA] flex items-center justify-between text-[11px] text-slate-500">
                      <span className="tabular-nums">
                        Charge :{' '}
                        <strong className="text-[#0D1B3D]">
                          {member.activeChats ?? 0} / {member.maxCapacity || 10}
                        </strong>{' '}
                        dossiers actifs
                      </span>
                      <span className="tabular-nums">
                        <strong className="text-[#0D1B3D]">{member.resolvedToday ?? 0}</strong>{' '}
                        résolu{(member.resolvedToday ?? 0) > 1 ? 's' : ''} aujourd&apos;hui
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ONGLET 2 : COMPÉTENCES DE L'ENTREPRISE */}
      {activeTab === 'skills' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-white border border-[#E5E4DF] flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-0.5">
              <h2 className="text-sm font-bold text-[#0D1B3D]">
                Référentiel des compétences ({activeSkills.length} active
                {activeSkills.length > 1 ? 's' : ''})
              </h2>
              <p className="text-xs text-slate-500">
                Configuration facultative : sans compétences configurées, tous vos conseillers
                restent polyvalents.
              </p>
            </div>
          </div>

          {canManage && (
            <form
              onSubmit={handleCreateWorkspaceSkill}
              className="p-4 rounded-xl bg-white border border-[#E5E4DF] space-y-3"
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <input
                  type="text"
                  required
                  placeholder="Nom (ex : Commandes, Livraison, Paiements…)"
                  value={newSkillName}
                  onChange={(e) => setNewSkillName(e.target.value)}
                  className="h-9 px-3 rounded-lg bg-[#FAFAF8] border border-[#E5E4DF] text-xs text-[#0D1B3D] placeholder:text-slate-400 focus:outline-none focus:border-[#0D1B3D] focus:bg-white"
                />
                <input
                  type="text"
                  placeholder="Description courte (facultatif)"
                  value={newSkillDesc}
                  onChange={(e) => setNewSkillDesc(e.target.value)}
                  className="h-9 px-3 rounded-lg bg-[#FAFAF8] border border-[#E5E4DF] text-xs text-[#0D1B3D] placeholder:text-slate-400 focus:outline-none focus:border-[#0D1B3D] focus:bg-white"
                />
                <button
                  type="submit"
                  disabled={creatingSkill || !newSkillName.trim()}
                  className="h-9 px-4 rounded-lg bg-[#0D1B3D] hover:bg-[#152C61] text-white text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{creatingSkill ? 'Ajout…' : 'Ajouter une compétence'}</span>
                </button>
              </div>
              {skillFormError && <p className="text-xs text-rose-600">{skillFormError}</p>}
            </form>
          )}

          <div className="rounded-xl bg-white border border-[#E5E4DF] overflow-hidden">
            {skills.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500 space-y-1">
                <p className="font-semibold text-[#0D1B3D]">
                  Aucune compétence configurée dans cet espace
                </p>
                <p>
                  L&apos;affectation continue de fonctionner normalement pour des conseillers
                  polyvalents.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-[#F0EFEA]">
                {skills.map((sk) => {
                  const isActive = sk.isActive !== false;
                  const isEditingThis = editingSkill?.id === sk.id;

                  return (
                    <div
                      key={sk.id}
                      className="px-4 py-3 flex flex-wrap items-center justify-between gap-3"
                    >
                      {isEditingThis ? (
                        <form
                          onSubmit={handleSaveSkillEdit}
                          className="flex-1 flex flex-wrap items-center gap-2"
                        >
                          <input
                            type="text"
                            required
                            value={editSkillName}
                            onChange={(e) => setEditSkillName(e.target.value)}
                            className="h-8 px-2.5 rounded-md border border-[#E5E4DF] text-xs text-[#0D1B3D] focus:outline-none focus:border-[#0D1B3D]"
                          />
                          <input
                            type="text"
                            placeholder="Description"
                            value={editSkillDesc}
                            onChange={(e) => setEditSkillDesc(e.target.value)}
                            className="flex-1 min-w-[160px] h-8 px-2.5 rounded-md border border-[#E5E4DF] text-xs text-[#0D1B3D] focus:outline-none focus:border-[#0D1B3D]"
                          />
                          <button
                            type="submit"
                            disabled={savingSkillEdit}
                            className="h-8 px-3 rounded-md bg-[#0D1B3D] text-white text-xs font-semibold cursor-pointer"
                          >
                            {savingSkillEdit ? '…' : 'Enregistrer'}
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingSkill(null)}
                            className="h-8 px-2.5 rounded-md bg-[#FAFAF8] border border-[#E5E4DF] text-xs text-slate-600 cursor-pointer"
                          >
                            Annuler
                          </button>
                        </form>
                      ) : (
                        <>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span
                                className={`text-xs font-semibold ${
                                  isActive ? 'text-[#0D1B3D]' : 'text-slate-400 line-through'
                                }`}
                              >
                                {sk.name}
                              </span>
                              <span className="text-[11px] text-slate-400 tabular-nums">
                                · {sk._count?.agents ?? 0} conseiller
                                {(sk._count?.agents ?? 0) > 1 ? 's' : ''}
                              </span>
                              {!isActive && (
                                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-[#FAFAF8] border border-[#E5E4DF] text-slate-500">
                                  Désactivée
                                </span>
                              )}
                            </div>
                            {sk.description && (
                              <p className="text-[11px] text-slate-500 mt-0.5">{sk.description}</p>
                            )}
                          </div>

                          {canManage && (
                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingSkill(sk);
                                  setEditSkillName(sk.name);
                                  setEditSkillDesc(sk.description || '');
                                }}
                                className="h-8 px-2.5 rounded-lg border border-[#E5E4DF] bg-white hover:bg-[#FAFAF8] text-xs font-medium text-slate-700 flex items-center gap-1 cursor-pointer"
                              >
                                <Pencil className="w-3 h-3 text-slate-400" />
                                <span>Modifier</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleToggleSkillActive(sk)}
                                className={`h-8 px-2.5 rounded-lg border text-xs font-medium flex items-center gap-1 cursor-pointer ${
                                  isActive
                                    ? 'border-[#E5E4DF] bg-white hover:bg-rose-50 hover:text-rose-700 text-slate-600'
                                    : 'border-[#E5E4DF] bg-[#FAFAF8] hover:bg-white text-[#0D1B3D]'
                                }`}
                              >
                                <Power className="w-3 h-3" />
                                <span>{isActive ? 'Désactiver' : 'Réactiver'}</span>
                              </button>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ONGLET 3 : INVITATIONS */}
      {activeTab === 'invitations' && (
        <div className="space-y-4">
          {invitations.length === 0 ? (
            <div className="p-10 rounded-xl bg-white border border-[#E5E4DF] text-center space-y-2.5">
              <CheckCircle2 className="w-8 h-8 text-slate-300 mx-auto" />
              <h3 className="text-sm font-bold text-[#0D1B3D]">Aucune invitation envoyée</h3>
              <p className="text-xs text-slate-500">
                Invitez des collaborateurs pour qu&apos;ils rejoignent votre espace Zalisk.
              </p>
            </div>
          ) : (
            <div className="rounded-xl bg-white border border-[#E5E4DF] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAFAF8] border-b border-[#E5E4DF] text-slate-500 font-semibold">
                    <tr>
                      <th className="px-4 py-3">Destinataire</th>
                      <th className="px-4 py-3">Rôle</th>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Expiration</th>
                      <th className="px-4 py-3">Statut</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F0EFEA]">
                    {invitations.map((inv) => {
                      const inviteLink = `${
                        typeof window !== 'undefined' ? window.location.origin : ''
                      }/invite/${inv.token}`;
                      const isCopied = copiedToken === inv.id;
                      const isPending = inv.status === 'PENDING';

                      return (
                        <tr key={inv.id} className="hover:bg-[#FAFAF8]/60">
                          <td className="px-4 py-3 font-semibold text-[#0D1B3D]">
                            {inv.email}
                          </td>
                          <td className="px-4 py-3 text-slate-600">{inv.role}</td>
                          <td className="px-4 py-3 text-slate-500">
                            {new Date(inv.createdAt).toLocaleDateString('fr-FR', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </td>
                          <td className="px-4 py-3 text-slate-500">
                            {new Date(inv.expiresAt).toLocaleDateString('fr-FR', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-[#FAFAF8] border border-[#E5E4DF] text-[#0D1B3D]">
                              {inv.status === 'ACCEPTED'
                                ? 'Acceptée'
                                : inv.status === 'REVOKED'
                                ? 'Révoquée'
                                : inv.status === 'EXPIRED'
                                ? 'Expirée'
                                : 'En attente'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right space-x-1.5">
                            {isPending && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleCopy(inviteLink, inv.id)}
                                  className="px-2.5 py-1 rounded-md bg-[#FAFAF8] hover:bg-[#F4F3EF] border border-[#E5E4DF] text-[#0D1B3D] text-[11px] font-medium inline-flex items-center gap-1 cursor-pointer"
                                >
                                  <Copy className="w-3 h-3" />
                                  <span>{isCopied ? 'Copié' : 'Copier le lien'}</span>
                                </button>
                                {canInvite && (
                                  <button
                                    type="button"
                                    onClick={() => handleCancelInvitation(inv.id)}
                                    title="Révoquer cette invitation"
                                    className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 inline-flex items-center cursor-pointer"
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

      {/* MODALE : ASSOCIER DES COMPÉTENCES À UN CONSEILLER */}
      {skillModalAgent && (
        <div className="fixed inset-0 z-50 bg-[#0D1B3D]/35 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-md w-full p-5 rounded-xl bg-white border border-[#E5E4DF] shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#E5E4DF] pb-3">
              <div>
                <h3 className="text-sm font-bold text-[#0D1B3D]">Compétences du conseiller</h3>
                <p className="text-xs text-slate-500 mt-0.5">{skillModalAgent.name}</p>
              </div>
              <button
                type="button"
                onClick={() => setSkillModalAgent(null)}
                className="p-1.5 text-slate-400 hover:text-[#0D1B3D] rounded-lg hover:bg-[#F4F3EF] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1">
              {activeSkills.length === 0 ? (
                <p className="text-xs text-slate-500 py-3 text-center">
                  Aucune compétence active dans cet espace. Créez-en une ci-dessous si nécessaire.
                </p>
              ) : (
                activeSkills.map((skill) => {
                  const isAssigned = skillModalAgent.skills.some((s) => s.id === skill.id);
                  const isUpdating = updatingSkillId === skill.id;

                  return (
                    <button
                      type="button"
                      key={skill.id}
                      disabled={isUpdating}
                      onClick={() => handleToggleAgentSkill(skillModalAgent, skill.id, isAssigned)}
                      className={`w-full p-3 rounded-lg border text-left transition-colors flex items-center justify-between cursor-pointer ${
                        isAssigned
                          ? 'bg-[#FAFAF8] border-[#0D1B3D]/40 text-[#0D1B3D]'
                          : 'bg-white border-[#E5E4DF] hover:bg-[#FAFAF8] text-slate-700'
                      }`}
                    >
                      <div className="pr-3 min-w-0">
                        <span className="text-xs font-semibold block truncate">{skill.name}</span>
                        {skill.description && (
                          <span className="text-[11px] text-slate-500 block truncate">
                            {skill.description}
                          </span>
                        )}
                      </div>

                      <div
                        className={`w-4 h-4 rounded flex items-center justify-center shrink-0 border ${
                          isAssigned
                            ? 'bg-[#0D1B3D] border-[#0D1B3D] text-white'
                            : 'border-slate-300 bg-white'
                        }`}
                      >
                        {isUpdating ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : isAssigned ? (
                          <Check className="w-3 h-3 stroke-[3]" />
                        ) : null}
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            <form
              onSubmit={handleCreateSkillFromModal}
              className="pt-3 border-t border-[#E5E4DF] flex gap-2"
            >
              <input
                type="text"
                placeholder="Nouvelle compétence…"
                value={modalNewSkillName}
                onChange={(e) => setModalNewSkillName(e.target.value)}
                className="flex-1 h-9 px-3 rounded-lg bg-[#FAFAF8] border border-[#E5E4DF] text-xs text-[#0D1B3D] focus:outline-none focus:border-[#0D1B3D]"
              />
              <button
                type="submit"
                disabled={creatingModalSkill || !modalNewSkillName.trim()}
                className="h-9 px-3 rounded-lg border border-[#E5E4DF] bg-white hover:bg-[#FAFAF8] text-xs font-semibold text-[#0D1B3D] cursor-pointer disabled:opacity-40"
              >
                {creatingModalSkill ? '…' : 'Ajouter'}
              </button>
            </form>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setSkillModalAgent(null)}
                className="h-9 px-4 rounded-lg bg-[#0D1B3D] hover:bg-[#152C61] text-white text-xs font-semibold cursor-pointer"
              >
                Terminer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODALE : INVITER UN COLLABORATEUR */}
      {inviteModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#0D1B3D]/35 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-md w-full p-5 rounded-xl bg-white border border-[#E5E4DF] shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#E5E4DF] pb-3">
              <h3 className="text-sm font-bold text-[#0D1B3D]">Inviter un collaborateur</h3>
              <button
                type="button"
                onClick={() => setInviteModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-[#0D1B3D] rounded-lg hover:bg-[#F4F3EF] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {inviteSuccessLink ? (
              <div className="space-y-4">
                <div className="p-3.5 rounded-lg bg-[#FAFAF8] border border-[#E5E4DF] space-y-1">
                  <div className="flex items-center gap-2 text-[#0D1B3D] font-bold text-xs">
                    <CheckCircle2 className="w-4 h-4 text-[#22C55E] shrink-0" />
                    <span>Invitation créée et envoyée</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Un e-mail d&apos;invitation a été envoyé à{' '}
                    <strong>{lastInvitedEmail || inviteEmail}</strong>.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-slate-600 block">
                    Lien direct de secours
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={inviteSuccessLink}
                      className="flex-1 h-9 px-3 rounded-lg bg-[#FAFAF8] border border-[#E5E4DF] text-xs text-[#0D1B3D] font-mono select-all focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => handleCopy(inviteSuccessLink, 'modal-success')}
                      className="h-9 px-3 rounded-lg bg-[#0D1B3D] text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shrink-0"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>{copiedToken === 'modal-success' ? 'Copié' : 'Copier'}</span>
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setInviteModalOpen(false)}
                  className="w-full h-9 rounded-lg border border-[#E5E4DF] bg-white hover:bg-[#FAFAF8] text-xs font-semibold text-[#0D1B3D] cursor-pointer"
                >
                  Fermer
                </button>
              </div>
            ) : (
              <form onSubmit={handleSendInvite} className="space-y-4 text-xs">
                {inviteError && (
                  <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700">
                    {inviteError}
                  </div>
                )}

                <div className="space-y-1">
                  <label className="font-semibold text-[#0D1B3D] block">Adresse e-mail</label>
                  <input
                    type="email"
                    required
                    placeholder="conseiller@entreprise.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg bg-[#FAFAF8] border border-[#E5E4DF] text-[#0D1B3D] focus:outline-none focus:border-[#0D1B3D]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-[#0D1B3D] block">Rôle</label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as any)}
                    className="w-full h-9 px-3 rounded-lg bg-[#FAFAF8] border border-[#E5E4DF] text-[#0D1B3D] focus:outline-none focus:border-[#0D1B3D]"
                  >
                    <option value="AGENT">Conseiller (Traitement quotidien SAV)</option>
                    <option value="MANAGER">Superviseur (Supervision & compétences)</option>
                    <option value="ADMIN">Administrateur (Équipe & paramètres)</option>
                  </select>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setInviteModalOpen(false)}
                    className="h-9 px-3.5 rounded-lg border border-[#E5E4DF] text-slate-600 font-medium cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={inviting}
                    className="h-9 px-4 rounded-lg bg-[#0D1B3D] hover:bg-[#152C61] text-white font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{inviting ? 'Envoi…' : "Envoyer l'invitation"}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
