'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  MessageSquare,
  FolderKanban,
  Users,
  UserCheck,
  Building2,
  Sparkles,
  BookOpen,
  PhoneCall,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  X,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { WorkspaceSwitcher } from './WorkspaceSwitcher';
import { useWorkspace } from './WorkspaceContext';
import { Role } from '@/types/workspace';

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  badge?: string | number;
  badgeColor?: string;
  exact?: boolean;
  minRole?: Role[];
}

interface NavSection {
  title: string;
  minRole?: Role[];
  items: NavItem[];
}

const agentNavSections: NavSection[] = [
  {
    title: 'ESPACE AGENT SAV',
    items: [
      { name: 'Tableau de bord', href: '/app', icon: LayoutDashboard, exact: true },
      { name: 'Mes tickets', href: '/app/tickets', icon: FolderKanban, exact: true },
      { name: 'Tickets partagés', href: '/app/tickets?tab=shared', icon: Users },
      { name: 'Mes conversations', href: '/app/conversations', icon: MessageSquare },
      { name: 'Historique', href: '/app/tickets?tab=history', icon: CheckCircle2 },
      { name: 'Mon profil', href: '/app/agent/profile', icon: UserCheck },
    ],
  },
];

const navSections: NavSection[] = [
  {
    title: 'SERVICE CLIENT',
    items: [
      { name: "Vue d'ensemble", href: '/app', icon: LayoutDashboard, exact: true },
      { name: 'Conversations', href: '/app/conversations', icon: MessageSquare, badge: 'WhatsApp', badgeColor: 'bg-emerald-50 text-emerald-700 border border-emerald-200' },
      { name: 'Demandes clients', href: '/app/tickets', icon: FolderKanban },
      { name: 'Clients', href: '/app/customers', icon: Users },
    ],
  },
  {
    title: 'MON ÉQUIPE & IMPLANTATIONS',
    items: [
      { name: 'Équipe et accès', href: '/app/agents', icon: UserCheck, minRole: ['OWNER', 'ADMIN', 'MANAGER'] },
      { name: 'Nos établissements', href: '/app/agencies', icon: Building2 },
    ],
  },
  {
    title: "CONNAISSANCES DE L'ENTREPRISE",
    minRole: ['OWNER', 'ADMIN', 'MANAGER'],
    items: [
      { name: 'Configuration IA', href: '/app/ai', icon: Sparkles, badge: 'Hybride', badgeColor: 'bg-indigo-50 text-indigo-700 border border-indigo-200' },
      { name: 'Connaissances', href: '/app/knowledge', icon: BookOpen },
    ],
  },
  {
    title: 'CONTACT',
    minRole: ['OWNER', 'ADMIN'],
    items: [
      { name: 'WhatsApp', href: '/app/whatsapp', icon: PhoneCall },
    ],
  },
  {
    title: 'PERFORMANCES',
    minRole: ['OWNER', 'ADMIN', 'MANAGER'],
    items: [
      { name: 'Statistiques', href: '/app/analytics', icon: BarChart3 },
    ],
  },
  {
    title: 'ADMINISTRATION',
    minRole: ['OWNER', 'ADMIN'],
    items: [
      { name: "Paramètres de l'entreprise", href: '/app/settings', icon: Settings },
    ],
  },
];

export interface SidebarProps {
  activePathOverride?: string;
  onNavigate?: (href: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activePathOverride, onNavigate }) => {
  const currentPath = usePathname();
  const pathname = activePathOverride || currentPath;
  const {
    sidebarCollapsed,
    setSidebarCollapsed,
    mobileSidebarOpen,
    setMobileSidebarOpen,
    userRole,
    currentWorkspace,
  } = useWorkspace();

  // Verrouillage du défilement de la page arrière-plan quand le drawer mobile est ouvert
  useEffect(() => {
    if (mobileSidebarOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [mobileSidebarOpen]);

  const isCurrentActive = (item: NavItem) => {
    if (item.exact) {
      return pathname === item.href;
    }
    return pathname.startsWith(item.href);
  };

  const hasRoleAccess = (allowedRoles?: Role[]) => {
    if (!allowedRoles || allowedRoles.length === 0) return true;
    return allowedRoles.includes(userRole);
  };

  const activeSections = userRole === 'AGENT' ? agentNavSections : navSections;


  const navContent = (
    <div className="flex flex-col h-full bg-white border-r border-slate-200/90 select-none text-slate-700">
      {/* Top Header with Logo */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-slate-100 bg-white">
        <div className="flex items-center gap-2 overflow-hidden">
          <Link
            href="/app"
            onClick={(e) => {
              if (onNavigate) {
                e.preventDefault();
                onNavigate('/app');
              }
            }}
            className="flex items-center gap-2.5 focus:outline-none"
          >
            <Logo size="sm" showText={!sidebarCollapsed} />
          </Link>
        </div>

        {/* Mobile close button */}
        <button
          onClick={() => setMobileSidebarOpen(false)}
          className="md:hidden text-slate-500 hover:text-slate-800 p-2.5 rounded-xl hover:bg-slate-100 active:bg-slate-200 transition-colors cursor-pointer"
          aria-label="Fermer le menu"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Desktop Collapse Toggle */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="hidden md:flex text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          title={sidebarCollapsed ? 'Agrandir la barre latérale' : 'Réduire la barre latérale'}
        >
          {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Workspace Switcher */}
      <div className="p-3 border-b border-slate-100 bg-slate-50/50">
        <WorkspaceSwitcher collapsed={sidebarCollapsed} />
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto overscroll-contain px-3 py-4 space-y-6 scrollbar-thin scrollbar-thumb-slate-200">
        {activeSections
          .filter((sec) => hasRoleAccess(sec.minRole))
          .map((section) => {
            const visibleItems = section.items.filter((item) => hasRoleAccess(item.minRole));
            if (visibleItems.length === 0) return null;

            return (
              <div key={section.title} className="space-y-1">
                {!sidebarCollapsed ? (
                  <p className="px-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {section.title}
                  </p>
                ) : (
                  <div className="h-1.5 border-t border-slate-100 my-2" />
                )}

                <div className="space-y-0.5">
                  {visibleItems.map((item) => {
                    const active = isCurrentActive(item);
                    const Icon = item.icon;

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={(e) => {
                          if (onNavigate) {
                            e.preventDefault();
                            onNavigate(item.href);
                          }
                          setMobileSidebarOpen(false);
                        }}
                        title={sidebarCollapsed ? item.name : undefined}
                        className={`group relative flex items-center gap-3 px-2.5 py-2.5 sm:py-2 rounded-xl text-xs font-semibold transition-all ${
                          active
                            ? 'bg-emerald-50 text-emerald-700 shadow-xs'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                        }`}
                      >
                        {active && (
                          <span className="absolute left-0 top-2 bottom-2 w-1 bg-emerald-500 rounded-r" />
                        )}

                        <Icon
                          className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-105 ${
                            active ? 'text-emerald-600' : 'text-slate-400 group-hover:text-slate-600'
                          }`}
                        />

                        {!sidebarCollapsed && (
                          <div className="flex items-center justify-between flex-1 min-w-0">
                            <span className="truncate">{item.name}</span>
                            {item.badge && (
                              <span
                                className={`ml-2 px-1.5 py-0.5 text-[10px] font-bold rounded-md shrink-0 ${
                                  item.badgeColor || 'bg-slate-100 text-slate-600'
                                }`}
                              >
                                {item.badge}
                              </span>
                            )}
                          </div>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
      </div>

      {/* Raccourci vers le Guichet Client Public de l'Entreprise */}
      {currentWorkspace?.slug && (
        <div className="p-3 border-t border-slate-100 bg-slate-50/70 shrink-0">
          <a
            href={`/entreprises/${currentWorkspace.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            title="Ouvrir le guichet SAV public client dans un nouvel onglet"
            className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl bg-white border border-slate-200/90 text-xs font-semibold text-slate-700 hover:text-emerald-700 hover:border-emerald-300 transition-all shadow-2xs group"
          >
            <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <ExternalLink className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
            </div>
            {!sidebarCollapsed && (
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-bold text-slate-800 truncate group-hover:text-emerald-700">
                  Guichet Client SAV
                </p>
                <p className="text-[9px] text-slate-400 truncate">
                  /entreprises/{currentWorkspace.slug}
                </p>
              </div>
            )}
          </a>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop & Tablet Sidebar */}
      <aside
        className={`hidden md:block shrink-0 transition-all duration-300 ease-in-out h-screen sticky top-0 ${
          sidebarCollapsed ? 'w-[72px]' : 'w-[250px]'
        }`}
      >
        {navContent}
      </aside>

      {/* Mobile Drawer Backdrop */}
      {mobileSidebarOpen && (
        <div
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs md:hidden animate-fade-in"
        />
      )}

      {/* Mobile Drawer Container */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-72 max-w-[calc(100vw-3rem)] md:hidden transition-transform duration-300 ease-in-out ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{
          paddingTop: 'env(safe-area-inset-top, 0px)',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        }}
      >
        {navContent}
      </div>
    </>
  );
};

export default Sidebar;
