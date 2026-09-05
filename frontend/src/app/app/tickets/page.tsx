'use client';

import React, { useState } from 'react';
import {
  FolderKanban,
  Search,
  Plus,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ChevronRight,
  Building2,
} from 'lucide-react';
import { useWorkspace } from '@/components/workspace/WorkspaceContext';

interface Ticket {
  id: string;
  reference: string;
  title: string;
  customerName: string;
  customerPhone: string;
  assignedAgent: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW' | 'URGENT';
  status: 'OPEN' | 'IN_PROGRESS' | 'WAITING_CUSTOMER' | 'RESOLVED';
  createdAt: string;
  agency: string;
}

const mockTickets: Ticket[] = [
  {
    id: '1',
    reference: 'TK-1082',
    title: 'Remplacement écran tablette sous garantie 24 mois',
    customerName: 'Koffi Jean-Luc',
    customerPhone: '+225 07 48 92 10 33',
    assignedAgent: 'Moussa D.',
    priority: 'HIGH',
    status: 'IN_PROGRESS',
    createdAt: '05 Sept 2026',
    agency: 'Agence Plateau',
  },
  {
    id: '2',
    reference: 'TK-1081',
    title: 'Litige facturation commande B2B #B-9023',
    customerName: 'Groupe Bâtir SA',
    customerPhone: '+225 01 02 03 04 05',
    assignedAgent: 'Sarah K.',
    priority: 'URGENT',
    status: 'OPEN',
    createdAt: '05 Sept 2026',
    agency: 'Siège Zone 4',
  },
  {
    id: '3',
    reference: 'TK-1080',
    title: 'Remboursement Wave validé suite retour produit défectueux',
    customerName: 'Aïcha Traoré',
    customerPhone: '+225 05 12 88 94 00',
    assignedAgent: 'Aminata K.',
    priority: 'MEDIUM',
    status: 'RESOLVED',
    createdAt: '04 Sept 2026',
    agency: 'Agence Cocody',
  },
  {
    id: '4',
    reference: 'TK-1079',
    title: 'Assistance configuration routeur 5G Pro',
    customerName: 'Dr. Éric Kouamé',
    customerPhone: '+225 07 00 11 22 33',
    assignedAgent: 'Moussa D.',
    priority: 'LOW',
    status: 'RESOLVED',
    createdAt: '03 Sept 2026',
    agency: 'Agence Yopougon',
  },
];

export default function TicketsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');

  const filteredTickets = mockTickets.filter((t) => {
    if (filterPriority !== 'ALL' && t.priority !== filterPriority) return false;
    if (filterStatus !== 'ALL' && t.status !== filterStatus) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        t.reference.toLowerCase().includes(q) ||
        t.title.toLowerCase().includes(q) ||
        t.customerName.toLowerCase().includes(q) ||
        t.customerPhone.includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FolderKanban className="w-5 h-5 text-sky-600" />
            Dossiers de Continuité SAV
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Suivi des actions lourdes (réparations, expertises, remboursements) sans casser le lien WhatsApp avec le client.
          </p>
        </div>

        <button
          onClick={() => alert('Création de dossier')}
          className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-md shadow-slate-900/10 transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Nouveau Dossier</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/90 flex flex-col md:flex-row items-center justify-between gap-3 shadow-2xs">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Rechercher par référence, titre, client..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-sky-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 focus:outline-none"
          >
            <option value="ALL">Tous les statuts</option>
            <option value="OPEN">Nouveau / Ouvert</option>
            <option value="IN_PROGRESS">En cours</option>
            <option value="RESOLVED">Résolu</option>
          </select>

          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 focus:outline-none"
          >
            <option value="ALL">Toutes les priorités</option>
            <option value="URGENT">Urgent (SLA &lt; 2h)</option>
            <option value="HIGH">Haute</option>
            <option value="MEDIUM">Moyenne</option>
            <option value="LOW">Basse</option>
          </select>
        </div>
      </div>

      {/* Tickets Table / List */}
      <div className="rounded-3xl bg-white border border-slate-200/90 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">Dossier</th>
                <th className="py-3.5 px-4">Client & Contact</th>
                <th className="py-3.5 px-4">Agence Référente</th>
                <th className="py-3.5 px-4">Responsable</th>
                <th className="py-3.5 px-4">Priorité</th>
                <th className="py-3.5 px-4">Statut</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTickets.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 px-4">
                    <div>
                      <span className="font-bold text-slate-900 block">{t.reference}</span>
                      <span className="text-slate-500 text-[11px] line-clamp-1">{t.title}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div>
                      <span className="text-slate-900 font-semibold block">{t.customerName}</span>
                      <span className="text-slate-400 font-mono text-[10px]">{t.customerPhone}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 flex items-center gap-1.5 pt-4.5">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    <span>{t.agency}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 font-semibold">
                      {t.assignedAgent}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    {t.priority === 'URGENT' && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                        URGENT
                      </span>
                    )}
                    {t.priority === 'HIGH' && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        Haute
                      </span>
                    )}
                    {t.priority === 'MEDIUM' && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-sky-50 text-sky-700">
                        Moyenne
                      </span>
                    )}
                    {t.priority === 'LOW' && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-500">
                        Basse
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    {t.status === 'IN_PROGRESS' && (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-sky-50 text-sky-700 flex items-center gap-1 w-fit">
                        <Clock className="w-3 h-3 text-sky-500" />
                        En cours
                      </span>
                    )}
                    {t.status === 'OPEN' && (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 flex items-center gap-1 w-fit">
                        <AlertTriangle className="w-3 h-3 text-amber-500" />
                        Nouveau
                      </span>
                    )}
                    {t.status === 'RESOLVED' && (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 flex items-center gap-1 w-fit">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Résolu
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => alert(`Détails du dossier ${t.reference}`)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                      title="Ouvrir le dossier"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
