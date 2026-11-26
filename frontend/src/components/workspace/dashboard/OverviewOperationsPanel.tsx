'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  ArrowUpRight,
  FolderKanban,
  Users,
  Activity,
} from 'lucide-react';
import { DashboardAgentItem } from '../AppDashboardView';
import {
  DashboardActivity,
  DashboardDispatchItem,
  DashboardIncident,
} from './types';

type OperationsTab = 'QUEUE' | 'AGENTS' | 'ACTIVITY';
type QueueFilter = 'ALL' | 'WAITING' | 'PROGRESS';

const MAX_VISIBLE_ROWS = 5;

interface EnrichedDispatchItem extends DashboardDispatchItem {
  isFocal?: boolean;
}

interface OverviewOperationsPanelProps {
  incident: DashboardIncident | null;
  queueItems: DashboardDispatchItem[];
  agents: DashboardAgentItem[];
  activities: DashboardActivity[];
  isAgent?: boolean;
  onNavigate?: (href: string) => void;
}

export function OverviewOperationsPanel({
  incident,
  queueItems,
  agents,
  activities,
  isAgent = false,
  onNavigate,
}: OverviewOperationsPanelProps) {
  const [activeTab, setActiveTab] = useState<OperationsTab>('QUEUE');
  const [queueFilter, setQueueFilter] = useState<QueueFilter>('ALL');

  const navLinkProps = (href: string) =>
    onNavigate
      ? {
          href,
          onClick: (e: React.MouseEvent) => {
            e.preventDefault();
            onNavigate(href);
          },
        }
      : { href };

  const isIncidentPriority =
    Boolean(incident) &&
    (incident!.urgency === 'CRITICAL' ||
      incident!.urgency === 'HIGH' ||
      incident!.isUrgent ||
      incident!.isWaitingAgent ||
      incident!.status === 'WAITING_AGENT');

  // Intégrer le dossier focal en tête de file sans ajouter une carte encombrante au-dessus
  const mergedQueue = useMemo<EnrichedDispatchItem[]>(() => {
    if (!incident) return queueItems;
    const alreadyPresent = queueItems.some((item) => item.id === incident.id);
    if (alreadyPresent) {
      return queueItems.map((item) =>
        item.id === incident.id ? { ...item, isFocal: true } : item
      );
    }
    const focalRow: EnrichedDispatchItem = {
      id: incident.id,
      reference: incident.reference,
      customerName: incident.customerName,
      subject: incident.lastMessage || incident.title,
      timeAgo: incident.timeAgo,
      status: incident.isWaitingAgent ? 'À assigner' : 'En cours',
      urgency: incident.urgency,
      category: incident.category,
      isFocal: true,
    };
    return [focalRow, ...queueItems];
  }, [incident, queueItems]);

  const filteredQueue = mergedQueue.filter((item) => {
    if (queueFilter === 'WAITING') return item.status === 'À assigner';
    if (queueFilter === 'PROGRESS') return item.status === 'En cours';
    return true;
  });

  const visibleQueue = filteredQueue.slice(0, MAX_VISIBLE_ROWS);
  const visibleAgents = agents.slice(0, MAX_VISIBLE_ROWS);
  const visibleActivities = activities.slice(0, MAX_VISIBLE_ROWS);

  const tabs: Array<{ id: OperationsTab; label: string; count: number }> = [
    { id: 'QUEUE', label: 'File SAV', count: mergedQueue.length },
    ...(!isAgent
      ? [{ id: 'AGENTS' as const, label: 'Conseillers', count: agents.length }]
      : []),
    { id: 'ACTIVITY', label: 'Activité', count: activities.length },
  ];

  const headerActionHref =
    activeTab === 'AGENTS' ? '/app/agents' : '/app/tickets';
  const headerActionLabel =
    activeTab === 'AGENTS' ? 'Gérer' : 'Tout voir';

  return (
    <div className="flex flex-col flex-1 min-w-0">
      {/* En-tête léger posé directement sur le fond (sans boîte autour) */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3.5">
        <div className="flex items-center gap-5" role="tablist" aria-label="Vues opérationnelles">
          {tabs.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setActiveTab(tab.id)}
                className={`relative pb-1.5 text-sm transition-colors cursor-pointer inline-flex items-center gap-2 ${
                  active
                    ? 'font-bold text-[#0D1B3D]'
                    : 'font-medium text-slate-400 hover:text-[#0D1B3D]'
                }`}
              >
                <span>{tab.label}</span>
                <span className="text-[11px] font-medium text-slate-400 tabular-nums">
                  {tab.count}
                </span>
                {active && (
                  <span className="absolute left-0 right-0 bottom-0 h-[2px] rounded-full bg-[#0D1B3D]" />
                )}
              </button>
            );
          })}

          {isIncidentPriority && (
            <Link
              {...navLinkProps('/app/conversations')}
              className="hidden md:inline-flex items-center gap-1.5 text-xs font-semibold text-rose-700 hover:text-rose-800 pb-1.5"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
              <span>1 prioritaire</span>
            </Link>
          )}
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'QUEUE' && (
            <div className="flex items-center gap-1.5">
              {[
                { id: 'ALL' as const, label: 'Tous' },
                { id: 'WAITING' as const, label: 'À assigner' },
                { id: 'PROGRESS' as const, label: 'En cours' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setQueueFilter(tab.id)}
                  className={`px-3 min-h-[30px] rounded-full text-xs transition-colors cursor-pointer ${
                    queueFilter === tab.id
                      ? 'bg-white text-[#0D1B3D] font-semibold border border-[#E5E4DF] shadow-[0_1px_2px_rgba(13,27,61,0.04)]'
                      : 'text-slate-500 hover:text-[#0D1B3D] font-medium'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          )}

          <Link
            {...navLinkProps(headerActionHref)}
            className="text-xs font-medium text-slate-500 hover:text-[#0D1B3D] pl-2 min-h-[30px] inline-flex items-center gap-1 transition-colors"
          >
            <span>{headerActionLabel}</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
          </Link>
        </div>
      </div>

      {/* Surface épurée sans traits de tableau ni boîtes imbriquées */}
      <div className="flex-1 rounded-2xl bg-white border border-[#E5E4DF] px-4 sm:px-5 py-4 flex flex-col justify-between">
        {activeTab === 'QUEUE' && (
          <>
            {visibleQueue.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center py-8 text-center text-xs text-slate-400 space-y-2">
                <FolderKanban className="w-5 h-5 text-slate-300" />
                <p>Aucun dossier ne correspond à ce filtre.</p>
              </div>
            ) : (
              <div className="flex-1 flex flex-col">
                <div className="grid grid-cols-12 items-center gap-3 px-2.5 pb-2 text-[11px] font-medium text-slate-400">
                  <div className="col-span-6 sm:col-span-5">Client</div>
                  <div className="hidden sm:block sm:col-span-4">Demande</div>
                  <div className="col-span-3 sm:col-span-1 text-right">Délai</div>
                  <div className="col-span-3 sm:col-span-2 text-right">État</div>
                </div>

                <div className="flex-1 flex flex-col justify-evenly gap-1">
                  {visibleQueue.map((item) => {
                    const isWaiting = item.status === 'À assigner';
                    const isUrgent =
                      item.urgency === 'HIGH' || item.urgency === 'CRITICAL';
                    const initial = item.customerName
                      ? item.customerName.charAt(0).toUpperCase()
                      : 'C';

                    return (
                      <Link
                        key={item.id}
                        {...navLinkProps('/app/conversations')}
                        className="grid grid-cols-12 items-center gap-3 px-2.5 py-2.5 rounded-xl hover:bg-[#FAFAF8] transition-colors group"
                      >
                        <div className="col-span-6 sm:col-span-5 flex items-center gap-3 min-w-0">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${
                              isUrgent
                                ? 'bg-rose-950 text-white'
                                : isWaiting
                                ? 'bg-[#0D1B3D] text-white'
                                : 'bg-[#F4F3EF] text-[#0D1B3D]'
                            }`}
                          >
                            {initial}
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-[#0D1B3D] truncate group-hover:underline">
                              {item.customerName}
                            </div>
                            <div className="text-[11px] font-mono text-slate-400 truncate">
                              {item.reference}
                            </div>
                          </div>
                        </div>

                        <div className="hidden sm:block sm:col-span-4 text-xs text-slate-600 truncate">
                          {item.subject}
                        </div>

                        <div className="col-span-3 sm:col-span-1 text-xs text-slate-500 text-right whitespace-nowrap tabular-nums">
                          {item.timeAgo}
                        </div>

                        <div className="col-span-3 sm:col-span-2 text-right whitespace-nowrap">
                          <span
                            className={`text-xs font-semibold ${
                              isUrgent
                                ? 'text-rose-700'
                                : isWaiting
                                ? 'text-amber-700'
                                : 'text-[#15803D]'
                            }`}
                          >
                            {isUrgent ? 'Prioritaire' : item.status}
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {filteredQueue.length > MAX_VISIBLE_ROWS && (
              <div className="pt-3 mt-1 flex items-center justify-between text-[11px] text-slate-400">
                <span>
                  {MAX_VISIBLE_ROWS} affichés sur {filteredQueue.length} dossiers
                </span>
                <Link
                  {...navLinkProps('/app/tickets')}
                  className="font-semibold text-[#0D1B3D] hover:underline inline-flex items-center gap-1"
                >
                  <span>Voir tout</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            )}
          </>
        )}

        {activeTab === 'AGENTS' && (
          <>
            {visibleAgents.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center py-8 text-center text-xs text-slate-400 space-y-2">
                <Users className="w-5 h-5 text-slate-300" />
                <p>Aucun conseiller dans cet espace.</p>
                {!isAgent && (
                  <Link
                    {...navLinkProps('/app/agents')}
                    className="text-xs font-semibold text-[#0D1B3D] hover:underline"
                  >
                    Inviter un collaborateur →
                  </Link>
                )}
              </div>
            ) : (
              <div className="flex-1 flex flex-col justify-evenly gap-1">
                {visibleAgents.map((agent) => {
                  const presence = agent.presence || 'OFFLINE';
                  const availability =
                    agent.availability ||
                    (agent.status === 'AVAILABLE' ? 'AVAILABLE' : 'BUSY');
                  const availabilityLabel =
                    availability === 'AVAILABLE'
                      ? 'Disponible'
                      : availability === 'DND'
                      ? 'Ne pas déranger'
                      : 'Occupé';

                  return (
                    <div
                      key={agent.id}
                      className="flex items-center justify-between gap-3 px-2.5 py-2.5 rounded-xl hover:bg-[#FAFAF8] transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="relative shrink-0">
                          <div className="w-9 h-9 rounded-xl bg-[#F4F3EF] text-[#0D1B3D] font-bold text-xs flex items-center justify-center">
                            {agent.name ? agent.name.charAt(0).toUpperCase() : 'A'}
                          </div>
                          <span
                            className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ring-2 ring-white ${
                              presence === 'ONLINE'
                                ? 'bg-[#22C55E]'
                                : presence === 'AWAY'
                                ? 'bg-amber-500'
                                : 'bg-slate-300'
                            }`}
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-[#0D1B3D] truncate">
                            {agent.name}
                          </div>
                          <div className="text-[11px] text-slate-400 truncate">
                            {agent.title || agent.role || 'Conseiller SAV'}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-5 shrink-0 text-xs tabular-nums">
                        <span
                          className={`font-semibold ${
                            availability === 'AVAILABLE'
                              ? 'text-[#15803D]'
                              : availability === 'DND'
                              ? 'text-slate-400'
                              : 'text-amber-700'
                          }`}
                        >
                          {availabilityLabel}
                        </span>
                        <span className="text-slate-500 w-16 text-right">
                          <strong className="text-[#0D1B3D]">
                            {agent.activeChats || 0}
                          </strong>{' '}
                          actif{(agent.activeChats || 0) > 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {activeTab === 'ACTIVITY' && (
          <>
            {visibleActivities.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center py-8 text-center text-xs text-slate-400 space-y-2">
                <Activity className="w-5 h-5 text-slate-300" />
                <p>Aucun événement enregistré aujourd&apos;hui.</p>
              </div>
            ) : (
              <div className="flex-1 flex flex-col justify-evenly gap-1">
                {visibleActivities.map((act) => (
                  <div
                    key={act.id}
                    className="flex items-center justify-between gap-3 px-2.5 py-2.5 rounded-xl hover:bg-[#FAFAF8] transition-colors text-xs"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-[#F4F3EF] text-[#0D1B3D] font-mono text-[10px] font-semibold flex items-center justify-center shrink-0 tabular-nums">
                        {act.timestamp}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-[#0D1B3D] truncate">
                          {act.title}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate">
                          {act.description}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
