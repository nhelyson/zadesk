'use client';

import React, { useState } from 'react';
import {
  Users,
  Search,
  Plus,
  Phone,
  Mail,
  Building2,
  Calendar,
  MessageSquare,
  FolderKanban,
  Star,
  ExternalLink,
} from 'lucide-react';
import { useWorkspace } from '@/components/workspace/WorkspaceContext';

interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  organization?: string;
  tier: 'VIP' | 'STANDARD' | 'PRO';
  totalConversations: number;
  totalTickets: number;
  lastContact: string;
  satisfaction: number;
}

const mockCustomers: Customer[] = [
  {
    id: 'c1',
    name: 'Koffi Jean-Luc',
    phone: '+225 07 48 92 10 33',
    email: 'koffi.jeanluc@gmail.com',
    organization: 'Indépendant',
    tier: 'VIP',
    totalConversations: 12,
    totalTickets: 2,
    lastContact: 'Aujourd’hui',
    satisfaction: 4.9,
  },
  {
    id: 'c2',
    name: 'Aïcha Traoré',
    phone: '+225 05 12 88 94 00',
    email: 'aicha.traore@yahoo.fr',
    organization: 'Boutique Élégance',
    tier: 'PRO',
    totalConversations: 8,
    totalTickets: 1,
    lastContact: 'Hier',
    satisfaction: 5.0,
  },
  {
    id: 'c3',
    name: 'M. Sékou (Groupe Bâtir SA)',
    phone: '+225 01 02 03 04 05',
    email: 'contact@batir-ci.com',
    organization: 'Groupe Bâtir SA',
    tier: 'VIP',
    totalConversations: 34,
    totalTickets: 7,
    lastContact: 'Il y a 3 jours',
    satisfaction: 4.7,
  },
  {
    id: 'c4',
    name: 'Dr. Éric Kouamé',
    phone: '+225 07 00 11 22 33',
    email: 'e.kouame@clinique-sante.ci',
    organization: 'Polyclinique Santé+',
    tier: 'STANDARD',
    totalConversations: 4,
    totalTickets: 1,
    lastContact: '02 Sept 2026',
    satisfaction: 4.5,
  },
];

export default function CustomersPage() {
  const { currentWorkspace } = useWorkspace();
  const [searchTerm, setSearchTerm] = useState('');
  const [tierFilter, setTierFilter] = useState('ALL');

  const filteredCustomers = mockCustomers.filter((c) => {
    if (tierFilter !== 'ALL' && c.tier !== tierFilter) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.organization?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-400" />
            Base Clients & Profils SAV 360°
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Historique unifié de chaque client interagissant par WhatsApp ou au guichet de vos agences.
          </p>
        </div>

        <button
          onClick={() => alert('Création de fiche client')}
          className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-semibold shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Nouveau Client</span>
        </button>
      </div>

      {/* Search & Filter */}
      <div className="p-4 rounded-2xl bg-[#0D1B3D] border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3 shadow-lg">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Rechercher par nom, téléphone, entreprise..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500/50"
          />
        </div>

        <div className="flex items-center gap-2">
          {['ALL', 'VIP', 'PRO', 'STANDARD'].map((tier) => (
            <button
              key={tier}
              onClick={() => setTierFilter(tier)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                tierFilter === tier
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {tier === 'ALL' ? 'Tous les segments' : tier}
            </button>
          ))}
        </div>
      </div>

      {/* Customers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredCustomers.map((c) => (
          <div
            key={c.id}
            className="p-5 rounded-2xl bg-[#0D1B3D] border border-slate-800 hover:border-slate-700 transition-all shadow-xl space-y-4 relative group"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-white font-bold text-sm ring-1 ring-slate-700">
                  {c.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white">{c.name}</h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {c.tier}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{c.organization}</p>
                </div>
              </div>

              <div className="flex items-center gap-1 text-amber-400 text-xs font-semibold">
                <Star className="w-3.5 h-3.5 fill-current" />
                <span>{c.satisfaction}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-900/70 border border-slate-800/80 flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="font-mono text-[11px] text-slate-200 truncate">{c.phone}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/70 border border-slate-800/80 flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span className="text-[11px] text-slate-200 truncate">{c.email}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs text-slate-400">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
                  {c.totalConversations} convs
                </span>
                <span className="flex items-center gap-1">
                  <FolderKanban className="w-3.5 h-3.5 text-slate-500" />
                  {c.totalTickets} dossiers
                </span>
              </div>
              <span className="text-[11px]">Vu {c.lastContact}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
