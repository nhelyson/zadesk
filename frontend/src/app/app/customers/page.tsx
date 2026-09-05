'use client';

import React, { useState } from 'react';
import {
  Users,
  Search,
  Plus,
  Phone,
  Mail,
  Star,
  MessageSquare,
  FolderKanban,
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
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-500" />
            Base Clients & Profils SAV 360°
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Historique unifié de chaque client interagissant par WhatsApp ou au guichet de vos agences.
          </p>
        </div>

        <button
          onClick={() => alert('Création de fiche client')}
          className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-md shadow-slate-900/10 transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Nouveau Client</span>
        </button>
      </div>

      {/* Search & Filter */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/90 flex flex-col md:flex-row items-center justify-between gap-3 shadow-2xs">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Rechercher nom, téléphone, entreprise..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-2">
          {['ALL', 'VIP', 'PRO', 'STANDARD'].map((tier) => (
            <button
              key={tier}
              onClick={() => setTierFilter(tier)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                tierFilter === tier
                  ? 'bg-amber-500 text-slate-950 shadow-2xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
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
            className="p-6 rounded-3xl bg-white border border-slate-200/90 hover:border-slate-300 transition-all shadow-sm space-y-4 relative group"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-800 flex items-center justify-center font-bold text-sm">
                  {c.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900">{c.name}</h3>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                      {c.tier}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{c.organization}</p>
                </div>
              </div>

              <div className="flex items-center gap-1 text-amber-600 text-xs font-bold">
                <Star className="w-3.5 h-3.5 fill-current" />
                <span>{c.satisfaction}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="font-mono text-[11px] text-slate-700 truncate">{c.phone}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                <span className="text-[11px] text-slate-700 truncate">{c.email}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-500">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                  {c.totalConversations} convs
                </span>
                <span className="flex items-center gap-1">
                  <FolderKanban className="w-3.5 h-3.5 text-slate-400" />
                  {c.totalTickets} dossiers
                </span>
              </div>
              <span className="text-[11px] text-slate-400">Vu {c.lastContact}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
