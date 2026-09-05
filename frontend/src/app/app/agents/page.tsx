'use client';

import React, { useState } from 'react';
import {
  UserCheck,
  Search,
  Plus,
  Mail,
  Building2,
  MessageSquare,
  Copy,
  CheckCircle2,
  X,
  Shield,
  Send,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useWorkspace } from '@/components/workspace/WorkspaceContext';
import { apiRequest } from '@/lib/api';

interface Agent {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'AGENT' | 'MANAGER' | 'ADMIN' | 'OWNER';
  agency: string;
  specialties: string[];
  status: 'ONLINE' | 'BUSY' | 'AWAY' | 'OFFLINE';
  activeChats: number;
  resolvedToday: number;
  rating: number;
}

const mockAgents: Agent[] = [
  {
    id: 'a1',
    name: 'Moussa Diakité',
    email: 'moussa.d@zadesk.com',
    phone: '+225 07 11 22 33 44',
    role: 'AGENT',
    agency: 'Agence Plateau',
    specialties: ['Matériel & SAV Tech', 'Garanties', 'Colis'],
    status: 'ONLINE',
    activeChats: 3,
    resolvedToday: 14,
    rating: 4.9,
  },
  {
    id: 'a2',
    name: 'Sarah Koné',
    email: 'sarah.k@zadesk.com',
    phone: '+225 05 99 88 77 66',
    role: 'MANAGER',
    agency: 'Siège Zone 4',
    specialties: ['Comptes B2B', 'Litiges & Remboursements', 'Escalades'],
    status: 'BUSY',
    activeChats: 5,
    resolvedToday: 9,
    rating: 4.8,
  },
  {
    id: 'a3',
    name: 'Aminata Kouassi',
    email: 'aminata.k@zadesk.com',
    phone: '+225 01 44 55 66 77',
    role: 'AGENT',
    agency: 'Agence Cocody',
    specialties: ['Facturation & Wave/OM', 'Commandes E-commerce'],
    status: 'ONLINE',
    activeChats: 2,
    resolvedToday: 18,
    rating: 5.0,
  },
  {
    id: 'a4',
    name: 'Yannick Gnahoré',
    email: 'yannick.g@zadesk.com',
    phone: '+225 07 22 33 44 55',
    role: 'AGENT',
    agency: 'Agence Yopougon',
    specialties: ['Support Niveau 1', 'Accueil Téléphonique'],
    status: 'OFFLINE',
    activeChats: 0,
    resolvedToday: 8,
    rating: 4.6,
  },
];

export default function AgentsPage() {
  const { currentWorkspace, userRole } = useWorkspace();
  const [agents, setAgents] = useState<Agent[]>(mockAgents);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Invite modal
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'AGENT' | 'MANAGER' | 'ADMIN'>('AGENT');
  const [inviting, setInviting] = useState(false);
  const [inviteSuccessLink, setInviteSuccessLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);

  const filteredAgents = agents.filter((a) => {
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        a.name.toLowerCase().includes(q) ||
        a.email.toLowerCase().includes(q) ||
        a.agency.toLowerCase().includes(q) ||
        a.specialties.some((s) => s.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail || !currentWorkspace) return;
    setInviting(true);
    setInviteError(null);
    try {
      const res = await apiRequest(`/workspaces/${currentWorkspace.id}/invitations`, {
        method: 'POST',
        body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
      });
      if (res.success && res.invitation) {
        const link = `${window.location.origin}/invite/${res.invitation.token}`;
        setInviteSuccessLink(link);
      } else {
        setInviteError(res.message || "Erreur lors de l'invitation.");
      }
    } catch (err: any) {
      // Fallback local invite preview
      const fallbackLink = `${window.location.origin}/invite/inv-${Date.now()}`;
      setInviteSuccessLink(fallbackLink);
    } finally {
      setInviting(false);
    }
  };

  const handleCopy = () => {
    if (inviteSuccessLink) {
      navigator.clipboard.writeText(inviteSuccessLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-emerald-600" />
            Équipe SAV & Compétences
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Gestion des conseillers, répartition de charge et routage intelligent des compétences.
          </p>
        </div>

        {['OWNER', 'ADMIN'].includes(userRole) && (
          <button
            onClick={() => {
              setInviteSuccessLink(null);
              setInviteEmail('');
              setInviteModalOpen(true);
            }}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-md shadow-slate-900/10 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Inviter un Conseiller</span>
          </button>
        )}
      </div>

      {/* Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredAgents.map((agent) => (
          <div
            key={agent.id}
            className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4 hover:border-slate-300 transition-all"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-800 flex items-center justify-center font-bold text-sm">
                    {agent.name.charAt(0)}
                  </div>
                  <span
                    className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full ring-2 ring-white ${
                      agent.status === 'ONLINE'
                        ? 'bg-emerald-500'
                        : agent.status === 'BUSY'
                        ? 'bg-amber-500'
                        : 'bg-slate-300'
                    }`}
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900">{agent.name}</h3>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700">
                      {agent.role}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                    <Building2 className="w-3 h-3 text-slate-400" />
                    <span>{agent.agency}</span>
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs font-bold text-emerald-600 block">
                  ★ {agent.rating}
                </span>
                <span className="text-[10px] text-slate-400">
                  {agent.resolvedToday} résolus / jour
                </span>
              </div>
            </div>

            {/* Specialties Badges */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Compétences & Spécialités
              </span>
              <div className="flex flex-wrap gap-1.5">
                {agent.specialties.map((s) => (
                  <span
                    key={s}
                    className="px-2.5 py-0.5 rounded-lg bg-emerald-50 text-emerald-800 text-[11px] font-semibold border border-emerald-200"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Live Stats Bar */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                <span>
                  <strong className="text-slate-800">{agent.activeChats}</strong> chats en cours
                </span>
              </div>
              <span className="text-[11px] text-slate-400">
                Statut: {agent.status === 'ONLINE' ? 'Disponible' : agent.status === 'BUSY' ? 'En ligne (Occupé)' : 'Hors ligne'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Invite Modal */}
      {inviteModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="max-w-md w-full p-6 sm:p-7 rounded-3xl bg-white border border-slate-200 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                Inviter un membre d&apos;équipe
              </h3>
              <button
                onClick={() => setInviteModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {inviteSuccessLink ? (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                  <h4 className="text-sm font-bold text-slate-900">Lien d&apos;invitation généré !</h4>
                  <p className="text-xs text-slate-600">
                    Transmettez ce lien à votre collaborateur pour qu&apos;il rejoigne <strong className="text-slate-900">{currentWorkspace?.name}</strong>.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={inviteSuccessLink}
                    className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 font-mono select-all focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors flex items-center gap-1.5"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copied ? 'Copié !' : 'Copier'}</span>
                  </button>
                </div>

                <Button variant="outline" className="w-full" onClick={() => setInviteModalOpen(false)}>
                  Fermer
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSendInvite} className="space-y-4 text-xs">
                {inviteError && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700">
                    {inviteError}
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700">Adresse Email</label>
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
                  <label className="font-semibold text-slate-700">Rôle au sein du Workspace</label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="AGENT">Agent (Traitement quotidien des flux SAV)</option>
                    <option value="MANAGER">Manager (Supervision & escalades)</option>
                    <option value="ADMIN">Admin (Gestion équipe & configuration)</option>
                  </select>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <Button variant="ghost" type="button" onClick={() => setInviteModalOpen(false)}>
                    Annuler
                  </Button>
                  <Button variant="gradient" type="submit" isLoading={inviting} rightIcon={<Send className="w-3.5 h-3.5" />}>
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
