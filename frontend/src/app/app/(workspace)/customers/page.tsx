'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  Search,
  Phone,
  Mail,
  MessageSquare,
  FolderKanban,
  RefreshCw,
  AlertCircle,
  ArrowUpRight,
  ExternalLink,
  ChevronRight,
  X,
  Copy,
  Check,
  Calendar,
  Clock,
  Filter,
} from 'lucide-react';
import { useWorkspace } from '@/components/workspace/WorkspaceContext';
import { workspaceApi } from '@/lib/api';

interface RealCustomer {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  conversationsCount: number;
  ticketsCount: number;
  lastInteraction: string;
  status: string;
  tags?: string[];
}

export default function CustomersPage() {
  const { currentWorkspace } = useWorkspace();
  const [customers, setCustomers] = useState<RealCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<RealCustomer | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const fetchCustomers = async () => {
    if (!currentWorkspace?.id) return;
    try {
      setError(null);
      const data = await workspaceApi.getCustomers(currentWorkspace.id);
      setCustomers(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error('Failed to load customers:', err);
      setError(err?.message || 'Impossible de charger la liste des clients.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [currentWorkspace?.id]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchCustomers();
  };

  const copyToClipboard = (text: string, fieldName: string) => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2000);
    }
  };

  const filteredCustomers = customers.filter((c) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      (c.name && c.name.toLowerCase().includes(q)) ||
      (c.phone && c.phone.includes(q)) ||
      (c.email && c.email.toLowerCase().includes(q))
    );
  });

  const totalConversations = customers.reduce(
    (sum, c) => sum + (c.conversationsCount || 0),
    0
  );
  const totalTickets = customers.reduce(
    (sum, c) => sum + (c.ticketsCount || 0),
    0
  );

  return (
    <div className="space-y-6 pb-12 select-none max-w-7xl mx-auto">
      {/* 1. Alerte Incident Réseau */}
      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={handleRefresh}
            className="px-2.5 py-1 rounded-lg bg-rose-100 font-semibold hover:bg-rose-200 cursor-pointer active:scale-95 transition-transform"
          >
            Réessayer
          </button>
        </div>
      )}

      {/* Barre de synthèse & actions compacte */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
          <span>
            <strong className="text-[#0D1B3D] tabular-nums">{loading ? '—' : customers.length}</strong> contacts uniques
          </span>
          <span>·</span>
          <span>
            <strong className="text-[#0D1B3D] tabular-nums">{loading ? '—' : totalConversations}</strong> échanges
          </span>
          <span>·</span>
          <span>
            <strong className="text-[#0D1B3D] tabular-nums">{loading ? '—' : totalTickets}</strong> tickets rattachés
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing || loading}
            className="h-9 px-3 rounded-lg bg-white border border-[#E5E4DF] hover:border-[#0D1B3D]/25 flex items-center gap-1.5 text-xs font-medium text-[#0D1B3D] transition-colors cursor-pointer disabled:opacity-50"
            title="Actualiser les contacts"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${
                refreshing ? 'animate-spin text-[#0D1B3D]' : 'text-slate-400'
              }`}
            />
            <span className="hidden sm:inline">Actualiser</span>
          </button>

          {currentWorkspace?.slug && (
            <Link
              href={`/entreprises/${currentWorkspace.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="h-9 px-3.5 rounded-lg bg-[#0D1B3D] hover:bg-[#152C61] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <span>Guichet public</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      </div>

      {/* Barre de recherche */}
      <div className="p-3 rounded-xl bg-white border border-[#E5E4DF] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Rechercher par nom, téléphone, e-mail..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-9 pl-9 pr-8 bg-[#FAFAF8] border border-[#E5E4DF] rounded-lg text-xs focus:outline-none focus:border-[#0D1B3D] focus:bg-white text-[#0D1B3D] placeholder:text-slate-400 transition-colors"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-0.5 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="text-xs text-slate-500 font-mono self-end sm:self-center">
          <span>
            {filteredCustomers.length} contact{filteredCustomers.length > 1 ? 's' : ''} trouvé
            {filteredCustomers.length > 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 5. LISTE / TABLEAU STRUCTURÉ DES CLIENTS                       */}
      {/* ============================================================== */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-2 animate-pulse"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100" />
                <div className="space-y-1.5 flex-1">
                  <div className="h-4 bg-slate-100 rounded w-1/4" />
                  <div className="h-3 bg-slate-100 rounded w-1/3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredCustomers.length === 0 ? (
        /* État Vide */
        <div className="p-12 sm:p-16 rounded-2xl bg-white border border-slate-200/80 text-center space-y-4 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 text-slate-400 flex items-center justify-center mx-auto">
            <Users className="w-6 h-6 text-slate-400" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-[#0D1B3D]">
              {searchTerm
                ? 'Aucun contact ne correspond à votre recherche'
                : 'Aucun client enregistré pour le moment'}
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              {searchTerm
                ? 'Vérifiez l’orthographe ou réinitialisez le champ de recherche pour afficher tous les contacts.'
                : 'Les fiches clients sont créées automatiquement dès qu’une personne initie un échange depuis votre guichet public Zalisk.'}
            </p>
          </div>
          {currentWorkspace && !searchTerm && (
            <div className="pt-2">
              <Link
                href={`/entreprises/${currentWorkspace.slug}`}
                target="_blank"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0D1B3D] hover:bg-[#152C61] text-white text-xs font-semibold shadow-sm transition-all active:scale-95"
              >
                <span>Accéder au guichet public</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
              </Link>
            </div>
          )}
        </div>
      ) : (
        /* Tableau Desktop & Cartes Tactiles Mobiles */
        <div className="rounded-2xl bg-white border border-slate-200/80 shadow-sm overflow-hidden">
          {/* Version Desktop (Tableau structuré haute lisibilité) */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-mono text-[10px] uppercase tracking-[0.14em]">
                  <th className="py-3 px-4 font-semibold">Client</th>
                  <th className="py-3 px-4 font-semibold">Téléphone</th>
                  <th className="py-3 px-4 font-semibold">E-mail</th>
                  <th className="py-3 px-4 font-semibold text-center">Échanges</th>
                  <th className="py-3 px-4 font-semibold text-center">Dossiers SAV</th>
                  <th className="py-3 px-4 font-semibold text-right">Dernier contact</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCustomers.map((c) => (
                  <tr
                    key={c.id}
                    onClick={() => setSelectedCustomer(c)}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#0D1B3D] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
                          {c.name ? c.name.charAt(0).toUpperCase() : 'C'}
                        </div>
                        <div className="min-w-0">
                          <span className="font-bold text-slate-900 group-hover:text-emerald-700 transition-colors block truncate">
                            {c.name}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            Origine : Guichet Web
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-slate-600">
                      {c.phone || <span className="text-slate-300">Non renseigné</span>}
                    </td>

                    <td className="py-3.5 px-4 text-slate-600">
                      {c.email || <span className="text-slate-300">Non renseigné</span>}
                    </td>

                    <td className="py-3.5 px-4 text-center font-mono font-semibold text-slate-800">
                      {c.conversationsCount}
                    </td>

                    <td className="py-3.5 px-4 text-center font-mono font-semibold text-slate-800">
                      {c.ticketsCount}
                    </td>

                    <td className="py-3.5 px-4 text-right text-slate-500 font-mono text-[11px]">
                      {c.lastInteraction || 'Récent'}
                    </td>

                    <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/app/conversations?search=${encodeURIComponent(
                            c.phone || c.name
                          )}`}
                          className="p-1.5 rounded-lg bg-slate-50 hover:bg-emerald-50 text-slate-500 hover:text-emerald-700 border border-slate-200/80 transition-colors"
                          title="Ouvrir la conversation"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                        </Link>
                        <Link
                          href={`/app/tickets?search=${encodeURIComponent(
                            c.phone || c.name
                          )}`}
                          className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-900 border border-slate-200/80 transition-colors"
                          title="Voir les tickets"
                        >
                          <FolderKanban className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          onClick={() => setSelectedCustomer(c)}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs transition-colors cursor-pointer"
                        >
                          Détails
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Version Mobile (Cartes tactiles fluides min-h 44px) */}
          <div className="md:hidden divide-y divide-slate-100">
            {filteredCustomers.map((c) => (
              <div
                key={c.id}
                onClick={() => setSelectedCustomer(c)}
                className="p-4 active:bg-slate-50 transition-colors cursor-pointer space-y-2.5"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-[#0D1B3D] text-white flex items-center justify-center font-bold text-xs shrink-0">
                      {c.name ? c.name.charAt(0).toUpperCase() : 'C'}
                    </div>
                    <div className="min-w-0">
                      <span className="font-bold text-slate-900 text-xs truncate block">
                        {c.name}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono truncate block">
                        {c.phone || c.email || 'Contact web'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {c.conversationsCount} conv.
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-300" />
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-50">
                  <span>Dossiers : {c.ticketsCount}</span>
                  <span className="font-mono text-slate-400">
                    {c.lastInteraction ? `Dernier contact : ${c.lastInteraction}` : 'Actif'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 6. FICHE DÉTAIL CLIENT (Slide-over Drawer / Sheet)             */}
      {/* ============================================================== */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop avec flou discret */}
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
            onClick={() => setSelectedCustomer(null)}
          />

          {/* Panneau latéral rétractable */}
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl z-10 flex flex-col justify-between animate-in slide-in-from-right duration-200 select-none">
            {/* Haut du tiroir : Titre & Fermeture */}
            <div>
              <div className="p-5 border-b border-slate-200/80 flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-slate-400 font-semibold">
                  FICHE CLIENT
                </span>
                <button
                  onClick={() => setSelectedCustomer(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                  aria-label="Fermer la fiche"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Contenu de la fiche client */}
              <div className="p-6 space-y-6 overflow-y-auto">
                {/* Identité Principale */}
                <div className="flex items-center gap-3.5">
                  <div className="w-14 h-14 rounded-2xl bg-[#0D1B3D] text-white flex items-center justify-center font-bold text-xl shadow-sm shrink-0">
                    {selectedCustomer.name
                      ? selectedCustomer.name.charAt(0).toUpperCase()
                      : 'C'}
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-lg font-black text-[#0D1B3D] tracking-tight truncate">
                      {selectedCustomer.name}
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span>Contact Zalisk vérifié</span>
                    </p>
                  </div>
                </div>

                {/* Coordonnées détaillées */}
                <div className="space-y-3">
                  <h3 className="font-mono text-[10px] uppercase tracking-[0.14em] text-slate-400 font-semibold">
                    Coordonnées
                  </h3>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="text-xs font-mono text-slate-800 truncate">
                        {selectedCustomer.phone || 'Aucun numéro renseigné'}
                      </span>
                    </div>
                    {selectedCustomer.phone && (
                      <button
                        onClick={() =>
                          copyToClipboard(selectedCustomer.phone!, 'phone')
                        }
                        className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                        title="Copier le numéro"
                      >
                        {copiedField === 'phone' ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    )}
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Mail className="w-4 h-4 text-sky-600 shrink-0" />
                      <span className="text-xs text-slate-800 truncate">
                        {selectedCustomer.email || 'Aucune adresse e-mail renseignée'}
                      </span>
                    </div>
                    {selectedCustomer.email && (
                      <button
                        onClick={() =>
                          copyToClipboard(selectedCustomer.email!, 'email')
                        }
                        className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                        title="Copier l'adresse e-mail"
                      >
                        {copiedField === 'email' ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* Métriques d'activité relationnelle */}
                <div className="space-y-3">
                  <h3 className="font-mono text-[10px] uppercase tracking-[0.14em] text-slate-400 font-semibold">
                    Activité & Historique SAV
                  </h3>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                      <span className="text-[11px] text-slate-500 block">
                        Conversations
                      </span>
                      <span className="text-xl font-black text-[#0D1B3D] font-mono tabular-nums mt-0.5 block">
                        {selectedCustomer.conversationsCount}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                      <span className="text-[11px] text-slate-500 block">
                        Dossiers SAV
                      </span>
                      <span className="text-xl font-black text-[#0D1B3D] font-mono tabular-nums mt-0.5 block">
                        {selectedCustomer.ticketsCount}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 text-xs text-slate-500 space-y-1">
                    <div className="flex items-center justify-between">
                      <span>Dernier échange :</span>
                      <span className="font-semibold text-slate-800 font-mono">
                        {selectedCustomer.lastInteraction || 'Récent'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Canal d&apos;origine :</span>
                      <span className="font-semibold text-slate-800">
                        Guichet Web
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bas du tiroir : Actions rapides contextuelles */}
            <div className="p-5 border-t border-slate-200/80 bg-slate-50/50 space-y-2">
              <Link
                href={`/app/conversations?search=${encodeURIComponent(
                  selectedCustomer.phone || selectedCustomer.name
                )}`}
                className="w-full py-2.5 px-4 rounded-xl bg-[#0D1B3D] hover:bg-[#152C61] text-white text-xs font-semibold shadow-sm flex items-center justify-center gap-2 transition-all active:scale-[0.985]"
              >
                <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                <span>Ouvrir les conversations de ce client</span>
              </Link>

              <Link
                href={`/app/tickets?search=${encodeURIComponent(
                  selectedCustomer.phone || selectedCustomer.name
                )}`}
                className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-800 text-xs font-semibold border border-slate-200 shadow-sm flex items-center justify-center gap-2 transition-all active:scale-[0.985]"
              >
                <FolderKanban className="w-3.5 h-3.5 text-slate-500" />
                <span>Consulter les dossiers SAV rattachés</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
