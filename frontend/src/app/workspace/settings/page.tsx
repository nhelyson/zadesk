'use client';

import React, { useState } from 'react';
import {
  Settings,
  ShieldCheck,
  Users,
  Building2,
  Trash2,
  Mail,
  UserPlus,
  Save,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { useWorkspace } from '@/components/workspace/WorkspaceContext';

interface Member {
  id: string;
  name: string;
  email: string;
  role: 'OWNER' | 'ADMIN' | 'MANAGER' | 'AGENT';
  joinedAt: string;
}

const mockMembers: Member[] = [
  {
    id: 'm-1',
    name: 'Japhet (Propriétaire)',
    email: 'japhet@zadesk.com',
    role: 'OWNER',
    joinedAt: '01 Août 2026',
  },
  {
    id: 'm-2',
    name: 'Sarah Koné',
    email: 'sarah.k@zadesk.com',
    role: 'ADMIN',
    joinedAt: '05 Août 2026',
  },
  {
    id: 'm-3',
    name: 'Moussa Diakité',
    email: 'moussa.d@zadesk.com',
    role: 'AGENT',
    joinedAt: '12 Août 2026',
  },
];

export default function SettingsPage() {
  const { currentWorkspace, userRole, isEnterprise } = useWorkspace();
  const [workspaceName, setWorkspaceName] = useState(currentWorkspace?.name || 'Zadesk Enterprise');
  const [slug, setSlug] = useState(currentWorkspace?.slug || 'zadesk-enterprise');
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-emerald-400" />
            Paramètres du Workspace
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Gérez les informations générales de l&apos;entreprise, les membres et les droits d&apos;accès RBAC.
          </p>
        </div>

        {saved && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30">
            <CheckCircle2 className="w-4 h-4" />
            <span>Modifications enregistrées !</span>
          </div>
        )}
      </div>

      {/* Section 1: Informations Générales */}
      <form onSubmit={handleSave} className="p-6 rounded-2xl bg-[#0D1B3D] border border-slate-800 shadow-xl space-y-5">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-3 flex items-center gap-2">
          <Building2 className="w-4 h-4 text-emerald-400" />
          Profil de l&apos;Entreprise
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              Nom de l&apos;organisation / Workspace
            </label>
            <input
              type="text"
              value={workspaceName}
              onChange={(e) => setWorkspaceName(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              Identifiant URL unique (Slug)
            </label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Enregistrer</span>
          </button>
        </div>
      </form>

      {/* Section 2: Membres & Permissions RBAC */}
      <div className="p-6 rounded-2xl bg-[#0D1B3D] border border-slate-800 shadow-xl space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-400" />
            Membres & Rôles d&apos;Accès (RBAC)
          </h2>

          <button
            onClick={() => alert('Inviter un nouveau collaborateur')}
            className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-500/20 transition-all flex items-center gap-1.5"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Inviter un Membre</span>
          </button>
        </div>

        <div className="divide-y divide-slate-800/60">
          {mockMembers.map((member) => (
            <div key={member.id} className="py-3.5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-white font-bold text-xs ring-1 ring-slate-700">
                  {member.name.charAt(0)}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">{member.name}</h4>
                  <p className="text-[11px] text-slate-400">{member.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                    member.role === 'OWNER'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : member.role === 'ADMIN'
                      ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                      : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {member.role}
                </span>
                <span className="text-[11px] text-slate-500 hidden sm:inline">
                  Membre depuis {member.joinedAt}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 3: Zone de Danger */}
      <div className="p-6 rounded-2xl bg-rose-950/20 border border-rose-500/30 shadow-xl space-y-3">
        <h2 className="text-sm font-bold text-rose-400 uppercase tracking-wider flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-400" />
          Zone de Danger
        </h2>
        <p className="text-xs text-slate-400">
          La suppression de ce workspace est irréversible et supprimera l&apos;intégralité des conversations, données clients et fichiers de connaissances.
        </p>
        <div className="pt-2">
          <button
            onClick={() => {
              if (confirm('Êtes-vous absolument certain de vouloir supprimer ce workspace ?')) {
                alert('Action bloquée pour le workspace de démonstration.');
              }
            }}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            <span>Supprimer ce Workspace</span>
          </button>
        </div>
      </div>
    </div>
  );
}
