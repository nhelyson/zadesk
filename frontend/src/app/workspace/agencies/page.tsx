'use client';

import React, { useState } from 'react';
import {
  Building2,
  Plus,
  MapPin,
  Phone,
  Clock,
  Users,
  FolderKanban,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { useWorkspace } from '@/components/workspace/WorkspaceContext';

interface Agency {
  id: string;
  name: string;
  city: string;
  address: string;
  phone: string;
  agentsCount: number;
  openTickets: number;
  openingHours: string;
  isMain: boolean;
}

const mockAgencies: Agency[] = [
  {
    id: 'ag-1',
    name: 'Siège & Centre Technique Zone 4',
    city: 'Abidjan',
    address: 'Rue du Canal, Zone 4C, Marcory',
    phone: '+225 27 21 00 11 22',
    agentsCount: 8,
    openTickets: 12,
    openingHours: '08:00 - 18:30 (Lun - Ven)',
    isMain: true,
  },
  {
    id: 'ag-2',
    name: 'Agence Centrale Plateau',
    city: 'Abidjan',
    address: 'Avenue Chardy, Imm. Horizon, Plateau',
    phone: '+225 27 20 33 44 55',
    agentsCount: 5,
    openTickets: 7,
    openingHours: '08:00 - 18:00 (Lun - Sam)',
    isMain: false,
  },
  {
    id: 'ag-3',
    name: 'Point Relais & SAV Cocody',
    city: 'Abidjan',
    address: 'Boulevard Latrille, Carrefour Duncan',
    phone: '+225 27 22 44 66 88',
    agentsCount: 4,
    openTickets: 5,
    openingHours: '08:30 - 19:00 (Lun - Sam)',
    isMain: false,
  },
  {
    id: 'ag-4',
    name: 'Agence Yopougon Keneya',
    city: 'Abidjan',
    address: 'En face Pharmacie Keneya',
    phone: '+225 27 23 55 77 99',
    agentsCount: 3,
    openTickets: 4,
    openingHours: '08:30 - 18:00 (Lun - Sam)',
    isMain: false,
  },
];

export default function AgenciesPage() {
  const { currentWorkspace } = useWorkspace();

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-400" />
            Réseau d&apos;Agences & Guichets SAV
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Gestion du maillage territorial de vos agences physiques connectées aux flux WhatsApp Zadesk.
          </p>
        </div>

        <button
          onClick={() => alert('Création d’agence')}
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Ajouter une Agence</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {mockAgencies.map((agency) => (
          <div
            key={agency.id}
            className="p-5 rounded-2xl bg-[#0D1B3D] border border-slate-800 shadow-xl space-y-4 hover:border-slate-700 transition-all relative group"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white">{agency.name}</h3>
                  {agency.isMain && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Siège Principal
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  <span>{agency.address}</span>
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-900/70 border border-slate-800 flex items-center gap-2">
                <Users className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="text-slate-300">{agency.agentsCount} Conseillers</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/70 border border-slate-800 flex items-center gap-2">
                <FolderKanban className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span className="text-slate-300">{agency.openTickets} Dossiers en cours</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs text-slate-400">
              <span className="flex items-center gap-1 text-[11px]">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                {agency.openingHours}
              </span>
              <span className="font-mono text-[11px] text-slate-300">{agency.phone}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
