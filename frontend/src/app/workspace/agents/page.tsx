'use client';

import React, { useState } from 'react';
import {
  UserCheck,
  Search,
  Plus,
  Mail,
  Phone,
  Shield,
  Award,
  CheckCircle2,
  Clock,
  MessageSquare,
  Building2,
} from 'lucide-react';
import { useWorkspace } from '@/components/workspace/WorkspaceContext';

interface Agent {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'AGENT' | 'MANAGER' | 'ADMIN';
  agency: string;
  specialties: string[];
  status: 'ONLINE' | 'BUSY' | 'OFFLINE';
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
  const { currentWorkspace } = useWorkspace();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredAgents = mockAgents.filter((a) => {
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

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-emerald-400" />
            Équipe SAV & Compétences
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Gestion des conseillers, répartition des charges et routage intelligent des compétences.
          </p>
        </div>

        <button
          onClick={() => alert('Invitation d’un membre')}
          className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-semibold shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Inviter un Conseiller</span>
        </button>
      </div>

      {/* Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredAgents.map((agent) => (
          <div
            key={agent.id}
            className="p-5 rounded-2xl bg-[#0D1B3D] border border-slate-800 shadow-xl space-y-4 hover:border-slate-700 transition-all"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-white font-bold text-sm ring-1 ring-slate-700">
                    {agent.name.charAt(0)}
                  </div>
                  <span
                    className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full ring-2 ring-[#0D1B3D] ${
                      agent.status === 'ONLINE'
                        ? 'bg-emerald-500'
                        : agent.status === 'BUSY'
                        ? 'bg-amber-500'
                        : 'bg-slate-600'
                    }`}
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white">{agent.name}</h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">
                      {agent.role}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                    <Building2 className="w-3 h-3 text-slate-500" />
                    <span>{agent.agency}</span>
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs font-bold text-emerald-400 block">
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
                    className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-300 text-[11px] font-medium border border-emerald-500/20"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Live Stats Bar */}
            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                <span>
                  <strong className="text-white">{agent.activeChats}</strong> chats en cours
                </span>
              </div>
              <span className="text-[11px] text-slate-400">
                Statut: {agent.status === 'ONLINE' ? 'Disponible' : agent.status === 'BUSY' ? 'En ligne (Occupé)' : 'Hors ligne'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
