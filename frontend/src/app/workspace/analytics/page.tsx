'use client';

import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  Clock,
  CheckCircle2,
  Users,
  Calendar,
  Download,
  Filter,
  Sparkles,
  MessageSquare,
} from 'lucide-react';
import { useWorkspace } from '@/components/workspace/WorkspaceContext';

export default function AnalyticsPage() {
  const { currentWorkspace } = useWorkspace();
  const [period, setPeriod] = useState('30D');

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-400" />
            Métriques & Performance SAV
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Tableau de bord décisionnel — Analytique des flux WhatsApp, efficacité IA et productivité des équipes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center p-1 rounded-xl bg-[#0D1B3D] border border-slate-800 text-xs">
            {['7D', '30D', '90D', '1Y'].map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  period === p
                    ? 'bg-emerald-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {p === '7D' ? '7 Jours' : p === '30D' ? '30 Jours' : p === '90D' ? '3 Mois' : '1 An'}
              </button>
            ))}
          </div>

          <button
            onClick={() => alert('Export du rapport CSV / PDF')}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all flex items-center gap-2"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Exporter</span>
          </button>
        </div>
      </div>

      {/* 4 Top KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[#0D1B3D] border border-slate-800 shadow-xl space-y-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Temps de 1ère réponse (FRT)
          </span>
          <p className="text-2xl font-bold text-white">42s</p>
          <p className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            -68% grâce à l&apos;IA N1
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[#0D1B3D] border border-slate-800 shadow-xl space-y-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Temps Moyen de Résolution
          </span>
          <p className="text-2xl font-bold text-white">14 min</p>
          <p className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            -35% vs mois précédent
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[#0D1B3D] border border-slate-800 shadow-xl space-y-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Résolution au 1er contact
          </span>
          <p className="text-2xl font-bold text-white">84.2%</p>
          <p className="text-[11px] text-blue-400 font-semibold">
            Objectif SLA &gt; 80%
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[#0D1B3D] border border-slate-800 shadow-xl space-y-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Score Satisfaction (CSAT)
          </span>
          <p className="text-2xl font-bold text-emerald-400">4.85 / 5</p>
          <p className="text-[11px] text-slate-400">
            Sur 840 avis vérifiés
          </p>
        </div>
      </div>

      {/* Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Motifs de Réclamation */}
        <div className="p-6 rounded-2xl bg-[#0D1B3D] border border-slate-800 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-3">
            Répartition par Motif SAV
          </h3>

          <div className="space-y-3">
            {[
              { label: 'Suivi de livraison & Colis', count: 430, pct: 42, color: 'bg-emerald-500' },
              { label: 'Demande de Remboursement / Facturation', count: 280, pct: 28, color: 'bg-blue-500' },
              { label: 'Assistance Technique & Pannes', count: 180, pct: 18, color: 'bg-indigo-500' },
              { label: 'Informations Produits & Garanties', count: 120, pct: 12, color: 'bg-amber-500' },
            ].map((item) => (
              <div key={item.label} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300">{item.label}</span>
                  <span className="text-slate-400 font-medium">
                    {item.count} ({item.pct}%)
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Productivité par Agence */}
        <div className="p-6 rounded-2xl bg-[#0D1B3D] border border-slate-800 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-3">
            Performance des Agences Physiques
          </h3>

          <div className="divide-y divide-slate-800/60">
            {[
              { agency: 'Siège & Zone 4', chats: 540, csat: 4.9, time: '12 min' },
              { agency: 'Agence Centrale Plateau', chats: 380, csat: 4.8, time: '14 min' },
              { agency: 'SAV Cocody Duncan', chats: 290, csat: 4.9, time: '11 min' },
              { agency: 'Agence Yopougon Keneya', chats: 210, csat: 4.7, time: '16 min' },
            ].map((a) => (
              <div key={a.agency} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <span className="text-white font-bold block">{a.agency}</span>
                  <span className="text-slate-400 text-[11px]">{a.chats} interactions traitées</span>
                </div>
                <div className="text-right">
                  <span className="text-emerald-400 font-semibold block">★ {a.csat}</span>
                  <span className="text-[11px] text-slate-400">Délai moyen: {a.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
