'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Menu,
  Search,
  Bell,
  LogOut,
  ChevronDown,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Check,
  UserCheck,
  Sliders,
} from 'lucide-react';
import { useWorkspace } from './WorkspaceContext';
import { authApi } from '@/lib/api';

const routeTitleMap: Record<string, { title: string; category: string }> = {
  '/app': { title: "Vue d'ensemble", category: 'SAV' },
  '/app/onboarding': { title: 'Configuration & Onboarding', category: 'Assistant' },
  '/app/conversations': { title: 'Conversations WhatsApp', category: 'SAV' },
  '/app/tickets': { title: 'Dossiers de Continuité', category: 'SAV' },
  '/app/customers': { title: 'Base Clients 360°', category: 'Clients' },
  '/app/agents': { title: 'Agents & Compétences', category: 'Équipe' },
  '/app/agencies': { title: 'Nos établissements', category: 'Implantations' },
  '/app/ai': { title: 'Intelligence IA & Escalade', category: 'Intelligence' },
  '/app/knowledge': { title: 'Base de Connaissances RAG', category: 'Intelligence' },
  '/app/whatsapp': { title: 'Canal WhatsApp', category: 'Canaux' },
  '/app/analytics': { title: 'Analyses & KPIs', category: 'Pilotage' },
  '/app/settings': { title: 'Paramètres du Workspace', category: 'Administration' },
};

export interface TopbarProps {
  activePathOverride?: string;
  onNavigate?: (href: string) => void;
}

export const Topbar: React.FC<TopbarProps> = ({ activePathOverride, onNavigate }) => {
  const currentPath = usePathname();
  const pathname = activePathOverride || currentPath;
  const router = useRouter();
  const {
    currentWorkspace,
    user,
    userRole,
    setUserRole,
    setMobileSidebarOpen,
    setCommandPaletteOpen,
  } = useWorkspace();

  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentRouteInfo = routeTitleMap[pathname] || {
    title: 'Espace Entreprise',
    category: 'Workspace',
  };

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch {}
    router.push('/login');
  };

  const actualRole = currentWorkspace?.role || 'OWNER';
  const isActualAdminOrOwner = actualRole === 'OWNER' || actualRole === 'ADMIN' || actualRole === 'MANAGER';

  return (
    <header className="h-16 bg-white border-b border-slate-200/90 px-3 sm:px-4 md:px-6 flex items-center justify-between sticky top-0 z-30 select-none">
      {/* Left side: Hamburger + Breadcrumb */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <button
          onClick={() => setMobileSidebarOpen(true)}
          className="md:hidden p-2.5 text-slate-500 hover:text-slate-800 rounded-xl hover:bg-slate-100 active:bg-slate-200 transition-colors cursor-pointer shrink-0"
          aria-label="Ouvrir le menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex items-center gap-2 text-xs truncate">
          <span className="text-slate-500 font-medium truncate max-w-[120px]">
            {currentWorkspace?.name || 'Workspace'}
          </span>
          <span className="text-slate-300">/</span>
          <span className="text-slate-500 font-medium">{currentRouteInfo.category}</span>
          <span className="text-slate-300">/</span>
          <span className="text-slate-900 font-bold truncate">{currentRouteInfo.title}</span>
        </div>

        <div className="sm:hidden font-bold text-xs xs:text-sm text-slate-900 truncate max-w-[110px] xs:max-w-[150px]">
          {currentRouteInfo.title}
        </div>
      </div>

      {/* Center / Search bar shortcut */}
      <div className="flex-1 max-w-md mx-4 hidden md:block">
        <button
          onClick={() => setCommandPaletteOpen(true)}
          className="w-full flex items-center justify-between px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-400 hover:text-slate-700 hover:border-slate-300 transition-all text-xs group cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-500 transition-colors" />
            <span>Rechercher client, dossier, conversation...</span>
          </div>
          <kbd className="hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono font-semibold text-slate-500 bg-white border border-slate-200 rounded shadow-2xs">
            <span>Ctrl</span>
            <span>K</span>
          </kbd>
        </button>
      </div>

      {/* Right side: Redis Cache Badge, Notifications, User Profile */}
      <div className="flex items-center gap-1 sm:gap-2.5 shrink-0">
        <button
          onClick={() => setCommandPaletteOpen(true)}
          className="md:hidden p-2.5 text-slate-500 hover:text-slate-800 rounded-xl hover:bg-slate-100 active:bg-slate-200 transition-colors cursor-pointer shrink-0"
          title="Rechercher"
          aria-label="Rechercher"
        >
          <Search className="w-4 h-4" />
        </button>

        {/* Raccourci vers l'Espace Client (Guichet Public SAV) */}
        {currentWorkspace?.slug && (
          <a
            href={`/entreprises/${currentWorkspace.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/90 text-xs font-bold transition-all shadow-2xs group cursor-pointer"
            title="Ouvrir le guichet client SAV officiel de l'entreprise dans un nouvel onglet"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Guichet Client</span>
            <ExternalLink className="w-3.5 h-3.5 text-emerald-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </a>
        )}

        {/* Notifications Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="relative p-2.5 text-slate-500 hover:text-slate-800 rounded-xl hover:bg-slate-100 active:bg-slate-200 transition-colors cursor-pointer shrink-0"
            title="Notifications SAV"
            aria-label="Notifications SAV"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white" />
          </button>

          {notificationsOpen && (
            <div className="fixed inset-x-3 top-16 max-w-sm mx-auto sm:max-w-none sm:mx-0 sm:absolute sm:inset-x-auto sm:right-0 sm:top-auto sm:mt-2 sm:w-80 rounded-2xl bg-white border border-slate-200 shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              <div className="p-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                  Notifications SAV
                </span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                  3 Récentes
                </span>
              </div>
              <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto overscroll-contain text-xs">
                <div className="p-3 hover:bg-slate-50 transition-colors cursor-pointer">
                  <p className="font-semibold text-slate-900 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Nouvelle conversation WhatsApp
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                    +225 07 89 45 12 : Demande de suivi colis #4892
                  </p>
                  <span className="text-[9px] text-slate-400 mt-1 block">Il y a 3 min</span>
                </div>
                <div className="p-3 hover:bg-slate-50 transition-colors cursor-pointer">
                  <p className="font-semibold text-indigo-700 flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-indigo-500" />
                    Escalade IA vers Conseiller
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                    Client mécontent sur réclamation SAV #TK-104
                  </p>
                  <span className="text-[9px] text-slate-400 mt-1 block">Il y a 14 min</span>
                </div>
                <div className="p-3 hover:bg-slate-50 transition-colors cursor-pointer">
                  <p className="font-semibold text-emerald-700 flex items-center gap-1.5">
                    <Check className="w-3 h-3 text-emerald-600" />
                    Dossier résolu
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                    Remboursement validé pour dossier #TK-098
                  </p>
                  <span className="text-[9px] text-slate-400 mt-1 block">Il y a 1 heure</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Menu */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 p-1.5 sm:p-2 rounded-xl hover:bg-slate-100 active:bg-slate-200 transition-colors text-left cursor-pointer shrink-0"
            aria-label="Menu profil utilisateur"
          >
            <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold text-xs shadow-xs shrink-0">
              {user?.firstName?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="hidden xl:block">
              <p className="text-xs font-bold text-slate-800 truncate max-w-[120px]">
                {user?.firstName ? `${user.firstName} ${user.lastName || ''}` : user?.email?.split('@')[0]}
              </p>
              <p className="text-[10px] text-emerald-600 font-semibold capitalize">
                {userRole?.toLowerCase()}
              </p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden xl:block" />
          </button>

          {profileOpen && (
            <div className="fixed inset-x-3 top-16 max-w-xs mx-auto sm:max-w-none sm:mx-0 sm:absolute sm:inset-x-auto sm:right-0 sm:top-auto sm:mt-2 sm:w-64 rounded-2xl bg-white border border-slate-200 shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150 divide-y divide-slate-100">
              {/* Profile Card */}
              <div className="p-3.5 bg-slate-50/50">
                <p className="text-xs font-bold text-slate-900 truncate">
                  {user?.firstName ? `${user.firstName} ${user.lastName || ''}` : 'Utilisateur'}
                </p>
                <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase tracking-wider">
                    {userRole}
                  </span>
                  <span className="text-[10px] text-slate-500 truncate">
                    {currentWorkspace?.name}
                  </span>
                </div>
              </div>

              {/* Mode de Navigation / Rôle Switcher (Strictement réservé aux Propriétaires et Admins réels) */}
              {isActualAdminOrOwner && (
                <div className="p-2.5 bg-slate-50/80 border-b border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5 px-0.5">
                    Mode de travail
                  </span>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      onClick={() => { setUserRole('OWNER'); setProfileOpen(false); }}
                      className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        userRole !== 'AGENT'
                          ? 'bg-slate-900 text-white shadow-2xs'
                          : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <span>👑 Admin</span>
                    </button>
                    <button
                      onClick={() => { setUserRole('AGENT'); setProfileOpen(false); }}
                      className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        userRole === 'AGENT'
                          ? 'bg-emerald-600 text-white shadow-2xs'
                          : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <span>🎧 Agent SAV</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Links */}
              <div className="p-1.5 space-y-0.5">
                <Link
                  href="/app/agent/profile"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-colors"
                >
                  <UserCheck className="w-4 h-4 text-emerald-600" />
                  <span>Mon profil Agent SAV</span>
                </Link>
                {isActualAdminOrOwner && (
                  <Link
                    href="/app/settings"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-colors"
                  >
                    <ShieldCheck className="w-4 h-4 text-slate-400" />
                    <span>Paramètres & Sécurité</span>
                  </Link>
                )}
                {currentWorkspace?.slug ? (
                  <a
                    href={`/entreprises/${currentWorkspace.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-emerald-800 hover:bg-emerald-50 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <ExternalLink className="w-4 h-4 text-emerald-600" />
                      <span>Guichet Client (SAV Public)</span>
                    </div>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-bold">
                      Public
                    </span>
                  </a>
                ) : (
                  <Link
                    href="/"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4 text-slate-400" />
                    <span>Voir le site public</span>
                  </Link>
                )}
              </div>

              {/* Logout Button */}
              <div className="p-1.5">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors text-left"
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
