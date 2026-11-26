'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Menu,
  Search,
  LogOut,
  ChevronDown,
  ExternalLink,
  ShieldCheck,
  UserCheck,
  CreditCard,
  Eye,
  RotateCcw,
  Bell,
  BellRing,
  BellOff,
} from 'lucide-react';
import { useWorkspace } from './WorkspaceContext';
import { authApi, agentApi } from '@/lib/api';
import {
  isWebPushSupported,
  getExistingPushSubscription,
  subscribeBrowserToPush,
  unsubscribeBrowserFromPush,
} from '@/lib/pushClient';

const routeTitleMap: Record<string, string> = {
  '/app': "Vue d'ensemble",
  '/app/onboarding': 'Configuration',
  '/app/conversations': 'Conversations',
  '/app/tickets': 'Demandes clients',
  '/app/customers': 'Clients',
  '/app/agents': 'Équipe & accès',
  '/app/agencies': 'Nos agences',
  '/app/ai': 'Automatisation',
  '/app/knowledge': 'Base de connaissances',
  '/app/whatsapp': 'Canal WhatsApp',
  '/app/analytics': 'Statistiques',
  '/app/billing': 'Abonnement & Facturation',
  '/app/settings': 'Paramètres',
  '/app/agent/profile': 'Mon profil Agent',
};

export interface TopbarProps {
  activePathOverride?: string;
  onNavigate?: (href: string) => void;
}

export const Topbar: React.FC<TopbarProps> = ({ activePathOverride }) => {
  const currentPath = usePathname();
  const pathname = activePathOverride || currentPath;
  const router = useRouter();
  const {
    currentWorkspace,
    user,
    userRole,
    actualRole,
    isActualAdminOrOwner,
    setUserRole,
    setMobileSidebarOpen,
    setCommandPaletteOpen,
  } = useWorkspace();

  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  const [pushSupported, setPushSupported] = useState(false);
  const [pushSubscribed, setPushSubscribed] = useState(false);
  const [pushLoading, setPushLoading] = useState(false);
  const [pushDenied, setPushDenied] = useState(false);

  const canManageBilling = userRole === 'OWNER' || userRole === 'ADMIN';

  useEffect(() => {
    let active = true;
    if (!isWebPushSupported() || !currentWorkspace?.id) return;
    setPushSupported(true);
    setPushDenied(typeof Notification !== 'undefined' && Notification.permission === 'denied');

    (async () => {
      try {
        const existing = await getExistingPushSubscription();
        if (!active) return;
        if (existing) {
          const status = await agentApi.getPushStatus(currentWorkspace.id, existing.endpoint).catch(() => null);
          if (active) setPushSubscribed(Boolean(status?.subscribed));
        } else if (active) {
          setPushSubscribed(false);
        }
      } catch {}
    })();

    return () => {
      active = false;
    };
  }, [currentWorkspace?.id]);

  const handleToggleAgentPush = async () => {
    if (!currentWorkspace?.id || pushLoading || !pushSupported) return;
    setPushLoading(true);
    try {
      if (pushSubscribed) {
        const endpoint = await unsubscribeBrowserFromPush();
        await agentApi.unsubscribePush(currentWorkspace.id, endpoint || undefined);
        setPushSubscribed(false);
      } else {
        const vapidKey = await agentApi.getPushVapidKey(currentWorkspace.id);
        if (!vapidKey) return;
        const { subscription, permission } = await subscribeBrowserToPush(vapidKey);
        if (permission === 'denied') {
          setPushDenied(true);
          return;
        }
        if (subscription) {
          await agentApi.subscribePush(currentWorkspace.id, subscription);
          setPushSubscribed(true);
          setPushDenied(false);
        }
      }
    } catch (err) {
      console.error('Push toggle error:', err);
    } finally {
      setPushLoading(false);
    }
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    }
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setProfileOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const title = routeTitleMap[pathname] || 'Espace Entreprise';

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch {}
    router.push('/login');
  };

  return (
    <header
      className="h-14 bg-white/95 backdrop-blur-md border-b border-[#E5E4DF] px-3 sm:px-6 flex items-center justify-between sticky top-0 z-30 select-none shrink-0"
      style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
    >
      {/* Gauche : Hamburger mobile + Titre sobre */}
      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
        <button
          type="button"
          onClick={() => setMobileSidebarOpen(true)}
          className="md:hidden w-10 h-10 -ml-1 flex items-center justify-center text-slate-600 hover:text-[#0D1B3D] rounded-lg hover:bg-[#F4F3EF] active:scale-95 transition-all cursor-pointer touch-manipulation shrink-0"
          aria-label="Ouvrir le menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-baseline gap-2.5 min-w-0">
          <h1 className="text-[15px] sm:text-[17px] font-bold tracking-tight text-[#0D1B3D] truncate">
            {title}
          </h1>
          <span className="hidden sm:inline text-xs text-slate-400 truncate">
            {currentWorkspace?.name || 'Zalisk'}
          </span>
        </div>
      </div>

      {/* Droite : Alertes bureau + Recherche rapide ⌘K + Profil sobre */}
      <div className="flex items-center gap-2 shrink-0">
        {pushSupported && currentWorkspace?.id && (
          <button
            type="button"
            onClick={handleToggleAgentPush}
            disabled={pushLoading}
            className={`relative h-9 px-2.5 rounded-lg border transition-all flex items-center gap-1.5 cursor-pointer touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D1B3D]/30 ${
              pushSubscribed
                ? 'bg-white border-[#E5E4DF] text-[#0D1B3D] hover:border-[#0D1B3D]/25'
                : pushDenied
                ? 'bg-[#FAFAF8] border-[#E5E4DF] text-slate-400'
                : 'bg-[#FAFAF8] border-[#E5E4DF] text-slate-600 hover:text-[#0D1B3D] hover:border-[#0D1B3D]/25'
            }`}
            title={
              pushDenied
                ? 'Notifications bloquées dans les paramètres du navigateur'
                : pushSubscribed
                ? 'Alertes bureau actives (même hors application) — cliquer pour désactiver'
                : 'Activer les alertes bureau pour recevoir les messages même hors de Zalisk'
            }
            aria-label="Activer ou désactiver les alertes bureau"
          >
            {pushDenied ? (
              <BellOff className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            ) : pushSubscribed ? (
              <BellRing className="w-3.5 h-3.5 text-[#0D1B3D] shrink-0" />
            ) : (
              <Bell className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            )}
            <span className="hidden xl:inline text-xs font-medium">
              {pushDenied ? 'Bloquées' : pushSubscribed ? 'Alertes ON' : 'Alertes'}
            </span>
            {pushSubscribed && (
              <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] shrink-0" />
            )}
          </button>
        )}

        <button
          type="button"
          onClick={() => setCommandPaletteOpen(true)}
          className="h-9 px-3 rounded-lg bg-[#FAFAF8] border border-[#E5E4DF] text-slate-500 hover:text-[#0D1B3D] hover:border-[#0D1B3D]/25 active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D1B3D]/30"
          title="Recherche rapide (Ctrl+K)"
          aria-label="Recherche rapide"
        >
          <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="hidden lg:inline text-xs font-medium text-slate-500">
            Rechercher…
          </span>
          <kbd className="hidden lg:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono font-medium text-slate-500 bg-white border border-[#E5E4DF] rounded">
            ⌘K
          </kbd>
        </button>

        <div className="relative" ref={profileRef}>
          <button
            type="button"
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 pl-1.5 pr-2.5 h-9 rounded-lg bg-[#FAFAF8] border border-[#E5E4DF] hover:border-[#0D1B3D]/25 active:scale-[0.98] transition-all text-left cursor-pointer touch-manipulation shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D1B3D]/30"
            aria-label="Menu profil utilisateur"
            aria-expanded={profileOpen}
          >
            <div className="w-6 h-6 rounded-full bg-[#0D1B3D] flex items-center justify-center text-white font-bold text-[11px] shrink-0">
              {user?.firstName?.charAt(0)?.toUpperCase() ||
                user?.email?.charAt(0)?.toUpperCase() ||
                'U'}
            </div>
            <span className="hidden sm:inline text-xs font-medium text-[#0D1B3D] truncate max-w-[110px]">
              {user?.firstName || user?.email?.split('@')[0] || 'Profil'}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
          </button>

          {profileOpen && (
            <div className="fixed inset-x-3 top-[60px] max-w-xs mx-auto sm:max-w-none sm:mx-0 sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-1.5 sm:w-64 rounded-xl bg-white border border-[#E5E4DF] shadow-xl z-50 overflow-hidden divide-y divide-[#E5E4DF]">
              <div className="p-3.5 bg-[#FAFAF8]">
                <p className="text-xs font-bold text-[#0D1B3D] truncate">
                  {user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Utilisateur'}
                </p>
                <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                <div className="mt-1.5 flex items-center gap-2 text-[11px] text-slate-500">
                  <span className="font-semibold text-[#0D1B3D] uppercase">{userRole}</span>
                  <span>·</span>
                  <span className="truncate">{currentWorkspace?.name}</span>
                </div>
              </div>

              {isActualAdminOrOwner && (
                <div className="p-1.5 bg-white">
                  <button
                    type="button"
                    onClick={() => {
                      setUserRole(userRole === 'AGENT' ? actualRole : 'AGENT');
                      setProfileOpen(false);
                    }}
                    className={`w-full px-3 min-h-[38px] rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center justify-center gap-2 ${
                      userRole === 'AGENT'
                        ? 'bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100/70'
                        : 'bg-[#FAFAF8] border border-[#E5E4DF] text-slate-700 hover:text-[#0D1B3D]'
                    }`}
                  >
                    {userRole === 'AGENT' ? (
                      <>
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Quitter la vue Agent</span>
                      </>
                    ) : (
                      <>
                        <Eye className="w-3.5 h-3.5 text-slate-400" />
                        <span>Tester la vue Agent</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              <div className="p-1.5 space-y-0.5">
                <Link
                  href="/app/agent/profile"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2.5 px-2.5 min-h-[38px] rounded-lg text-xs font-medium text-slate-700 hover:text-[#0D1B3D] hover:bg-[#FAFAF8] transition-colors"
                >
                  <UserCheck className="w-4 h-4 text-slate-400" />
                  <span>Mon profil Agent SAV</span>
                </Link>
                {canManageBilling && (
                  <Link
                    href="/app/billing"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2.5 px-2.5 min-h-[38px] rounded-lg text-xs font-medium text-slate-700 hover:text-[#0D1B3D] hover:bg-[#FAFAF8] transition-colors"
                  >
                    <CreditCard className="w-4 h-4 text-slate-400" />
                    <span>Abonnement & Facturation</span>
                  </Link>
                )}
                {isActualAdminOrOwner && (
                  <Link
                    href="/app/settings"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2.5 px-2.5 min-h-[38px] rounded-lg text-xs font-medium text-slate-700 hover:text-[#0D1B3D] hover:bg-[#FAFAF8] transition-colors"
                  >
                    <ShieldCheck className="w-4 h-4 text-slate-400" />
                    <span>Paramètres</span>
                  </Link>
                )}
                {currentWorkspace?.slug && (
                  <a
                    href={`/entreprises/${currentWorkspace.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center justify-between px-2.5 min-h-[38px] rounded-lg text-xs font-medium text-[#0D1B3D] hover:bg-[#FAFAF8] transition-colors"
                  >
                    <span>Guichet client public</span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                  </a>
                )}
              </div>

              <div className="p-1.5">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-2.5 min-h-[38px] rounded-lg text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors text-left cursor-pointer"
                >
                  <LogOut className="w-4 h-4 text-rose-600" />
                  <span>Déconnexion</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Topbar;
