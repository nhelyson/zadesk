'use client';

import React from 'react';
import { NormalizedDashboardData } from './types';

interface DashboardMastheadProps {
  data: NormalizedDashboardData;
  workspaceName?: string;
  userName?: string;
}

export function DashboardMasthead({
  data,
  workspaceName = 'votre établissement',
  userName = 'Responsable',
}: DashboardMastheadProps) {
  const { metrics, isBrandNew, isAgent, focalIncident, teamCapacity } = data;
  const { openTickets, waitingAgent, activeConversations, resolvedTickets } = metrics;

  // Formatage de la date du jour en français formel
  const todayFormatted = new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date());

  // Génération du bulletin narratif selon la réalité stricte des données
  let narrativeText = '';

  if (isBrandNew) {
    narrativeText = `Bienvenue, ${userName}. Votre guichet SAV est prêt à recevoir vos premières sollicitations clients.`;
  } else if (isAgent) {
    if (openTickets === 0) {
      narrativeText = `Bonjour, ${userName}. Aucun dossier n'est actuellement assigné à votre file. Vous êtes disponible pour de nouvelles prises en charge.`;
    } else {
      narrativeText = `Bonjour, ${userName}. Vous avez ${openTickets} dossier${openTickets > 1 ? 's' : ''} en cours de traitement${focalIncident ? ', dont 1 dossier prioritaire requérant votre intervention' : ''}.`;
    }
  } else {
    if (openTickets === 0 && activeConversations === 0) {
      narrativeText = `Situation opérationnelle sereine pour ${workspaceName}. Aucune demande en souffrance sur le portail ce ${todayFormatted}.`;
    } else {
      const waitPhrase = waitingAgent > 0
        ? `, dont ${waitingAgent} en attente d'attribution`
        : ' et aucune demande en souffrance';
      narrativeText = `${openTickets} dossier${openTickets > 1 ? 's' : ''} en traitement pour ${workspaceName}${waitPhrase}. Équipe SAV : ${teamCapacity.availableOperationalCount} conseiller${teamCapacity.availableOperationalCount > 1 ? 's' : ''} disponible${teamCapacity.availableOperationalCount > 1 ? 's' : ''}.`;
    }
  }

  return (
    <header className="space-y-4 pt-1">
      {/* 1. Masthead Eyebrow */}
      <div className="flex items-center gap-2">
        <span className="w-5 h-[1.5px] bg-[#0D1B3D]" />
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-slate-400 font-semibold">
          BULLETIN OPÉRATIONNEL DU QUART • {todayFormatted.toUpperCase()}
        </span>
      </div>

      {/* 2. Titre Narratif en Typographie Éditoriale Outfit */}
      <h1 className="text-xl sm:text-2xl lg:text-[26px] font-bold text-[#0D1B3D] tracking-tight leading-snug font-sans max-w-4xl">
        {narrativeText}
      </h1>

      {/* 3. Tension Ribbon (Ruban des 3 Métriques Maîtresses) */}
      <div className="inline-flex items-center gap-4 sm:gap-6 pt-1 pb-1 border-y border-slate-200/90 text-left">
        {/* Métrique 1 : Dossiers Ouverts */}
        <div className="flex items-baseline gap-2">
          <span className="font-mono text-xl sm:text-2xl font-bold text-[#0D1B3D] tabular-nums">
            {openTickets}
          </span>
          <span className="text-[11px] sm:text-xs text-slate-500 font-medium">
            {isAgent ? 'Assignés' : 'Dossiers ouverts'}
          </span>
        </div>

        <span className="w-[1px] h-5 bg-slate-200" />

        {/* Métrique 2 : En Attente d'Agent */}
        <div className="flex items-baseline gap-2">
          <span
            className={`font-mono text-xl sm:text-2xl font-bold tabular-nums ${
              waitingAgent > 0 ? 'text-amber-600' : 'text-[#0D1B3D]'
            }`}
          >
            {waitingAgent}
          </span>
          <span className="text-[11px] sm:text-xs text-slate-500 font-medium">
            En attente d&apos;agent
          </span>
        </div>

        <span className="w-[1px] h-5 bg-slate-200" />

        {/* Métrique 3 : Conversations Actives / Dossiers Résolus (Cumulé Réel) */}
        <div className="flex items-baseline gap-2">
          <span className="font-mono text-xl sm:text-2xl font-bold text-emerald-600 tabular-nums">
            {activeConversations > 0 ? activeConversations : resolvedTickets}
          </span>
          <span className="text-[11px] sm:text-xs text-slate-500 font-medium">
            {activeConversations > 0 ? 'Conversations directes' : 'Dossiers résolus'}
          </span>
        </div>
      </div>
    </header>
  );
}
