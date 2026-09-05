"use client";

import React, { useState } from "react";
import { 
  Inbox, 
  Ticket, 
  Users, 
  UserCheck, 
  Zap, 
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Clock,
  Layers,
  Search,
  MessageSquare,
  Check,
  ChevronRight
} from "lucide-react";
import { SpotlightCard } from "./motion/SpotlightCard";

export const ProductModules = () => {
  const [activeTab, setActiveTab] = useState(0);

  const modules = [
    {
      id: "inbox",
      tag: "CENTRALISATION",
      title: "Inbox Omnicanale",
      desc: "Toutes les conversations de votre équipe réunies dans un espace clair, qualifié et partagé.",
      icon: <Inbox className="w-5 h-5 text-emerald-500" />,
      features: [
        "Réception directe des messages clients",
        "Zéro message ouvert puis oublié",
        "Filtrage par urgence et par statut",
      ],
      preview: (
        <div className="bg-slate-950 rounded-2xl p-4 text-xs space-y-3 text-slate-300 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-800 font-bold">
            <span className="text-slate-100 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#25D366]" />
              Boîte de réception unifiée
            </span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px]">3 ouvertes</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-900 border border-emerald-500/40 space-y-1">
            <div className="flex items-center justify-between text-slate-200 font-bold">
              <span>Mamadou Kouka</span>
              <span className="text-[10px] text-emerald-400">À l&apos;instant</span>
            </div>
            <p className="text-slate-300 text-[11px]">« Bonjour, je souhaite modifier mon adresse de livraison »</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800/80 text-slate-400">
            <p className="font-semibold text-slate-300 text-[11px]">Clinique Ste-Marie</p>
            <p className="text-[11px]">Demande de renouvellement contrat</p>
          </div>
        </div>
      )
    },
    {
      id: "tickets",
      tag: "SUIVI RIGOUREUX",
      title: "Gestion des Tickets",
      desc: "Transformez chaque demande client en tâche claire, qualifiée et suivie d'un bout à l'autre.",
      icon: <Ticket className="w-5 h-5 text-sky-500" />,
      features: [
        "Cycle de vie clair : Nouveau → En cours → Résolu",
        "Priorisation automatique des urgences",
        "Historique des actions horodaté",
      ],
      preview: (
        <div className="bg-slate-950 rounded-2xl p-4 text-xs space-y-3 text-slate-300 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between text-[11px] font-bold pb-2 border-b border-slate-800">
            <span className="text-slate-200">Ticket #4819 • Suivi livraison</span>
            <span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 text-[10px]">En cours</span>
          </div>
          <div className="grid grid-cols-4 gap-1.5 text-[10px] text-center font-bold">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Nouveau ✓</div>
            <div className="p-2 rounded-xl bg-sky-500/30 text-sky-300 border border-sky-500/50 animate-pulse">En cours</div>
            <div className="p-2 rounded-xl bg-slate-900 text-slate-500 border border-slate-800">En attente</div>
            <div className="p-2 rounded-xl bg-slate-900 text-slate-500 border border-slate-800">Résolu</div>
          </div>
          <p className="text-[11px] text-slate-400 pt-1">Assigné à Japhet I. • Temps de réponse moyen : 3 min</p>
        </div>
      )
    },
    {
      id: "clients",
      tag: "MÉMOIRE COMMERCIALE",
      title: "Fiches & Historique Client",
      desc: "Retrouvez en un coup d'œil l'historique complet et les informations importantes de chaque client.",
      icon: <Users className="w-5 h-5 text-amber-500" />,
      features: [
        "Fiche client 360° avec coordonnées complètes",
        "Historique de toutes les interactions passées",
        "Indicateur de satisfaction et fidélité",
      ],
      preview: (
        <div className="bg-slate-950 rounded-2xl p-4 text-xs space-y-3 text-slate-300 border border-slate-800 shadow-xl">
          <div className="flex items-center gap-3 pb-2 border-b border-slate-800">
            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-amber-400 border border-slate-700">
              SN
            </div>
            <div>
              <p className="font-bold text-slate-100 text-sm">Société Nouveautés SARL</p>
              <p className="text-[10px] text-slate-400">Client fidèle • Brazzaville</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[10px] text-center">
            <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-slate-400 block">Total Commandes</span>
              <span className="font-bold text-slate-200 text-xs">14 traitées</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-slate-400 block">Satisfaction</span>
              <span className="font-bold text-emerald-400 text-xs">5/5 ★</span>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "equipe",
      tag: "COLLABORATION",
      title: "Organisation d'Équipe",
      desc: "Attribuez les demandes aux bonnes personnes et travaillez efficacement à plusieurs sans confusion.",
      icon: <UserCheck className="w-5 h-5 text-indigo-500" />,
      features: [
        "Fin des téléphones personnels qui circulent",
        "Attribution nominative des tickets",
        "Notes internes invisibles pour le client",
      ],
      preview: (
        <div className="bg-slate-950 rounded-2xl p-4 text-xs space-y-2.5 text-slate-300 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between text-[11px] font-bold pb-2 border-b border-slate-800 text-slate-200">
            <span>Membres du support</span>
            <span className="text-emerald-400">3 connectés</span>
          </div>
          <div className="space-y-2 text-[11px]">
            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900">
              <span className="font-semibold text-slate-200">Japhet I. (Superviseur)</span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px]">Disponible</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900">
              <span className="font-semibold text-slate-200">Sarah M. (Conseillère)</span>
              <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 text-[10px]">2 tickets en cours</span>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "automatisation",
      tag: "PRODUCTIVITÉ",
      title: "Règles & Automatisation",
      desc: "Automatisez les tâches répétitives pour permettre à votre équipe de se concentrer sur les clients.",
      icon: <Zap className="w-5 h-5 text-teal-500" />,
      features: [
        "Messages d'accueil et accusés de réception",
        "Règles d'escalade en cas d'urgence",
        "Attribution automatique selon le motif",
      ],
      preview: (
        <div className="bg-slate-950 rounded-2xl p-4 text-xs space-y-3 text-slate-300 border border-slate-800 shadow-xl">
          <div className="p-3 rounded-xl bg-teal-950/40 border border-teal-500/30 space-y-1">
            <span className="font-bold text-teal-300 text-xs block">Règle active : Horaires de fermeture</span>
            <p className="text-[11px] text-teal-100">
              « Nouveau message après 18h ➔ Accusé d&apos;accueil chaleureux &amp; enregistrement prioritaire pour le lendemain matin à 8h. »
            </p>
          </div>
          <p className="text-[10px] text-slate-400">Automatisation instantanée sans code.</p>
        </div>
      )
    },
    {
      id: "ia",
      tag: "INTELLIGENCE",
      title: "Assistance IA aux Agents",
      desc: "L'IA accompagne vos agents pour analyser les demandes, résumer les conversations et suggérer des réponses.",
      icon: <Sparkles className="w-5 h-5 text-purple-500" />,
      features: [
        "Suggestions de réponses adaptées au contexte",
        "Résumé en 3 lignes des longues discussions",
        "Compréhension des photos et documents reçus",
      ],
      preview: (
        <div className="bg-slate-950 rounded-2xl p-4 text-xs space-y-3 text-slate-300 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between text-[10px] text-purple-400 font-bold pb-2 border-b border-slate-800">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Suggestion IA prête
            </span>
            <span className="text-slate-400 font-normal">Générée en 0.8s</span>
          </div>
          <p className="text-[11px] text-purple-200 bg-purple-950/40 p-3 rounded-xl border border-purple-500/30 leading-relaxed">
            « Bonjour Mamadou, votre commande est en cours de livraison par notre coursier. Arrivée prévue d&apos;ici 16h30. »
          </p>
          <div className="flex justify-end">
            <span className="px-2.5 py-1 rounded-lg bg-emerald-500 text-slate-950 font-bold text-[10px]">
              1 clic pour envoyer ✓
            </span>
          </div>
        </div>
      )
    },
  ];

  return (
    <section id="produit" className="py-20 md:py-28 bg-slate-50 relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-200">
            FONCTIONNALITÉS COMPLÈTES
          </span>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-navy-900 leading-tight">
            Tout votre service après-vente au même endroit.
          </h2>
          <p className="text-base sm:text-lg text-slate-600">
            Explorez les modules interconnectés qui donnent à votre équipe les moyens de traiter chaque demande client avec excellence.
          </p>

          {/* Interactive Tab Selector */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
            {modules.map((m, idx) => (
              <button
                key={m.id}
                onClick={() => setActiveTab(idx)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  activeTab === idx
                    ? "bg-navy-900 text-white shadow-md scale-105"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                }`}
              >
                {m.icon}
                <span>{m.title}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Highlight Showcase of the Active Module */}
        <div className="max-w-5xl mx-auto mb-16">
          <SpotlightCard className="p-8 sm:p-12 shadow-2xl border-2 border-slate-200">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              <div className="lg:col-span-6 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                  <span>{modules[activeTab].tag}</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-navy-900">
                  {modules[activeTab].title}
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  {modules[activeTab].desc}
                </p>

                <ul className="space-y-2.5 pt-2 text-xs sm:text-sm text-slate-700">
                  {modules[activeTab].features.map((f, i) => (
                    <li key={i} className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="lg:col-span-6">
                {modules[activeTab].preview}
              </div>

            </div>
          </SpotlightCard>
        </div>

        {/* 6 Grid Cards for Quick Navigation */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((m, idx) => (
            <div
              key={m.id}
              onClick={() => setActiveTab(idx)}
              className={`p-6 rounded-3xl bg-white border cursor-pointer transition-all duration-300 flex flex-col justify-between space-y-4 hover:shadow-xl ${
                activeTab === idx ? "border-emerald-500 shadow-lg ring-2 ring-emerald-500/20" : "border-slate-200/80 hover:border-slate-300"
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                    {m.icon}
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {m.tag}
                  </span>
                </div>
                <h4 className="text-base font-bold text-navy-900">
                  {m.title}
                </h4>
                <p className="text-slate-600 text-xs leading-relaxed line-clamp-2">
                  {m.desc}
                </p>
              </div>

              <div className="flex items-center text-xs font-bold text-emerald-600 gap-1 pt-1">
                <span>Explorer le module</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};