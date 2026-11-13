'use client';

import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  Download,
} from 'lucide-react';

export default function AnalyticsPage() {
  const [period, setPeriod] = useState('30D');

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-600" />
            Métriques & Performance SAV
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Tableau de bord décisionnel — Analytique des flux WhatsApp, efficacité IA et productivité des équipes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center p-1 rounded-xl bg-white border border-slate-200 text-xs shadow-2xs">
            {['7D', '30D', '90D', '1Y'].map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  period === p
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {p === '7D' ? '7 Jours' : p === '30D' ? '30 Jours' : p === '90D' ? '3 Mois' : '1 An'}
              </button>
            ))}
          </div>

          <button
            onClick={() => alert('Export du rapport CSV / PDF')}
            className="px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200 transition-all flex items-center gap-2 shadow-2xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Exporter</span>
          </button>
        </div>
      </div>

      {/* 4 Top KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Temps de 1ère réponse (FRT)
          </span>
          <p className="text-2xl font-black text-slate-900">42s</p>
          <p className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            -68% grâce à l&apos;IA N1
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Délai Moyen de Résolution
          </span>
          <p className="text-2xl font-black text-slate-900">14 min</p>
          <p className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            -35% vs mois précédent
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Résolution au 1er contact
          </span>
          <p className="text-2xl font-black text-slate-900">84.2%</p>
          <p className="text-[11px] text-sky-600 font-semibold">
            Objectif SLA &gt; 80%
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Score Satisfaction (CSAT)
          </span>
          <p className="text-2xl font-black text-emerald-600">4.85 / 5</p>
          <p className="text-[11px] text-slate-500">
            Sur 840 avis clients vérifiés
          </p>
        </div>
      </div>

      {/* Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Motifs de Réclamation */}
        <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3">
            Répartition par Motif SAV
          </h3>

          <div className="space-y-3.5">
            {[
              { label: 'Suivi de livraison & Colis', count: 430, pct: 42, color: 'bg-emerald-500' },
              { label: 'Demande de Remboursement / Wave', count: 280, pct: 28, color: 'bg-sky-500' },
              { label: 'Assistance Technique & Pannes', count: 180, pct: 18, color: 'bg-indigo-500' },
              { label: 'Informations Produits & Garanties', count: 120, pct: 12, color: 'bg-amber-500' },
            ].map((item) => (
              <div key={item.label} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-700 font-semibold">{item.label}</span>
                  <span className="text-slate-500 font-medium">
                    {item.count} ({item.pct}%)
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Productivité par Agence */}
        <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3">
            Performance des Agences Physiques
          </h3>

          <div className="divide-y divide-slate-100 text-xs">
            {[
              { agency: 'Siège & Zone 4', chats: 540, csat: 4.9, time: '12 min' },
              { agency: 'Agence Centrale Plateau', chats: 380, csat: 4.8, time: '14 min' },
              { agency: 'SAV Cocody Duncan', chats: 290, csat: 4.9, time: '11 min' },
              { agency: 'Agence Yopougon Keneya', chats: 210, csat: 4.7, time: '16 min' },
            ].map((a) => (
              <div key={a.agency} className="py-3 flex items-center justify-between">
                <div>
                  <span className="text-slate-900 font-bold block">{a.agency}</span>
                  <span className="text-slate-400 text-[11px]">{a.chats} interactions traitées</span>
                </div>
                <div className="text-right">
                  <span className="text-emerald-600 font-bold block">★ {a.csat}</span>
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
