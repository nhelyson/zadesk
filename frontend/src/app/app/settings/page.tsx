'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Settings,
  Users,
  Building2,
  Trash2,
  UserPlus,
  Save,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
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
  const { currentWorkspace, userRole } = useWorkspace();
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
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Settings className="w-5 h-5 text-emerald-600" />
            Paramètres du Workspace
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Gérez les informations générales de l&apos;entreprise, les membres et les droits d&apos;accès RBAC.
          </p>
        </div>

        {saved && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
            <CheckCircle2 className="w-4 h-4" />
            <span>Modifications enregistrées !</span>
          </div>
        )}
      </div>

      {/* Section 1: Informations Générales */}
      <form onSubmit={handleSave} className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-5">
        <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center gap-2">
          <Building2 className="w-4 h-4 text-emerald-600" />
          Profil de l&apos;Entreprise
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5 text-xs">
            <label className="font-semibold text-slate-700">Nom de l&apos;organisation / Workspace</label>
            <input
              type="text"
              value={workspaceName}
              onChange={(e) => setWorkspaceName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="space-y-1.5 text-xs">
            <label className="font-semibold text-slate-700">Identifiant URL unique (Slug)</label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:border-emerald-500 font-mono"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button type="submit" variant="gradient" rightIcon={<Save className="w-4 h-4" />}>
            Enregistrer
          </Button>
        </div>
      </form>

      {/* Section 2: Membres & Permissions RBAC */}
      <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Users className="w-4 h-4 text-sky-600" />
            Membres & Rôles d&apos;Accès (RBAC)
          </h2>

          <Link href="/app/agents">
            <Button variant="outline" size="sm" leftIcon={<UserPlus className="w-3.5 h-3.5" />}>
              Gérer l&apos;équipe
            </Button>
          </Link>
        </div>

        <div className="divide-y divide-slate-100">
          {mockMembers.map((member) => (
            <div key={member.id} className="py-3.5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-800 flex items-center justify-center font-bold text-xs">
                  {member.name.charAt(0)}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{member.name}</h4>
                  <p className="text-[11px] text-slate-400">{member.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={`px-2.5 py-1 rounded-md text-[10px] font-bold ${
                    member.role === 'OWNER'
                      ? 'bg-amber-50 text-amber-800 border border-amber-200'
                      : member.role === 'ADMIN'
                      ? 'bg-indigo-50 text-indigo-800 border border-indigo-200'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {member.role}
                </span>
                <span className="text-[11px] text-slate-400 hidden sm:inline">
                  Membre depuis {member.joinedAt}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 3: Zone de Danger */}
      {userRole === 'OWNER' && (
        <div className="p-6 sm:p-7 rounded-3xl bg-rose-50/50 border border-rose-200 shadow-sm space-y-3">
          <h2 className="text-xs font-bold text-rose-700 uppercase tracking-wider flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            Zone de Danger
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            La suppression de ce workspace est irréversible et effacera l&apos;intégralité des conversations, dossiers clients et documents RAG associés.
          </p>
          <div className="pt-2">
            <button
              onClick={() => {
                if (confirm('Êtes-vous absolument certain de vouloir supprimer ce workspace ?')) {
                  alert('Action désactivée en mode démonstration.');
                }
              }}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <Trash2 className="w-4 h-4" />
              <span>Supprimer ce Workspace</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
