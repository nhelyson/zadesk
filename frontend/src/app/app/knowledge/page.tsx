'use client';

import React, { useState } from 'react';
import {
  BookOpen,
  Plus,
  Search,
  Upload,
  CheckCircle2,
  Database,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface KnowledgeDoc {
  id: string;
  title: string;
  category: string;
  contentSnippet: string;
  indexedTokens: number;
  lastUpdated: string;
  status: 'INDEXED' | 'SYNCING';
}

const mockArticles: KnowledgeDoc[] = [
  {
    id: 'k-1',
    title: 'Politique de Retour & Remboursements Wave / OM',
    category: 'Finances & SAV',
    contentSnippet: 'Tout article retourné sous 14 jours en bon état fait l’objet d’un remboursement immédiat via Wave ou Orange Money...',
    indexedTokens: 1420,
    lastUpdated: '04 Sept 2026',
    status: 'INDEXED',
  },
  {
    id: 'k-2',
    title: 'Délais et Frais de Livraison Abidjan & Intérieur',
    category: 'Logistique',
    contentSnippet: 'Livraison express en 3h dans la zone Abidjan Sud (Zone 4, Marcory, Koumassi, Treichville). Expéditions province sous 24-48h...',
    indexedTokens: 2150,
    lastUpdated: '02 Sept 2026',
    status: 'INDEXED',
  },
  {
    id: 'k-3',
    title: 'Guide de Diagnostic Matériel - Terminaux de Paiement & Routeurs',
    category: 'Support Technique',
    contentSnippet: 'Procédure de redémarrage forcé et réinitialisation des paramètres d’usine pour les boîtiers Zadesk Pro 5G...',
    indexedTokens: 3890,
    lastUpdated: '28 Août 2026',
    status: 'INDEXED',
  },
  {
    id: 'k-4',
    title: 'Conditions Générales de Garantie Pièces & Main d’œuvre',
    category: 'Légal & Contrats',
    contentSnippet: 'Les équipements sous contrat Entreprise Gold bénéficient d’un échange standard sous 2h en cas de panne critique...',
    indexedTokens: 1800,
    lastUpdated: '25 Août 2026',
    status: 'INDEXED',
  },
];

export default function KnowledgePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [articles, setArticles] = useState(mockArticles);

  const filtered = articles.filter(
    (a) =>
      a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.contentSnippet.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-600" />
            Base de Connaissances RAG & SAV
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Documents, fiches procédures et FAQs vectorisés pour alimenter les réponses ultra-précises de l&apos;IA Zadesk.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => alert('Téléversement de document PDF / Docx')}
            className="px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200 transition-all flex items-center gap-2 shadow-2xs cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5 text-indigo-600" />
            <span>Importer PDF</span>
          </button>
          <button
            onClick={() => alert('Nouvel article')}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-md shadow-slate-900/10 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Créer un Article</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/90 flex items-center gap-3 shadow-2xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Rechercher dans la base vectorielle..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((doc) => (
          <div
            key={doc.id}
            className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-3 hover:border-slate-300 transition-all group"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {doc.category}
                </span>
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                  {doc.title}
                </h3>
              </div>

              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1 shrink-0">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                Vectorisé
              </span>
            </div>

            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
              {doc.contentSnippet}
            </p>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1 text-slate-600 font-medium">
                <Database className="w-3 h-3 text-indigo-500" />
                {doc.indexedTokens} tokens indexés
              </span>
              <span>Modifié le {doc.lastUpdated}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
