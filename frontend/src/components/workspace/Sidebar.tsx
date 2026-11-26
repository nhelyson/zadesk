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
  Cpu,
  BookOpen,
  BarChart3,
  Settings,
  CreditCard,
  X,
  LogOut,
  ShieldCheck,
  ExternalLink,
  Eye,
  RotateCcw,
} from 'lucide-react';
import { useWorkspace } from './WorkspaceContext';
import { WorkspaceSwitcher } from './WorkspaceSwitcher';
import { Logo } from '@/components/ui/Logo';

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  exact?: boolean;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export interface SidebarProps {
  activePathOverride?: string;
  onNavigate?: (href: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activePathOverride, onNavigate }) => {
  const currentPath = usePathname();
  const pathname = activePathOverride || currentPath;

  const {
    currentWorkspace,
    user,
    userRole,
    actualRole,
    isActualAdminOrOwner,
    setUserRole,
    mobileSidebarOpen,
    setMobileSidebarOpen,
    logout,
  } = useWorkspace();

  const isAgent = userRole === 'AGENT';
  const canManageBilling = !isAgent && (userRole === 'OWNER' || userRole === 'ADMIN');

  useEffect(() => {
    if (!mobileSidebarOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileSidebarOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [mobileSidebarOpen, setMobileSidebarOpen]);

  // Organisation par pôles pour OWNER / ADMIN / MANAGER
  const managementSections: NavSection[] = [
    {
      title: 'Relation client',
      items: [
        { name: "Vue d'ensemble", href: '/app', icon: LayoutDashboard, exact: true },
        { name: 'Conversations', href: '/app/conversations', icon: MessageSquare },
        { name: 'Demandes clients', href: '/app/tickets', icon: FolderKanban },
        { name: 'Clients', href: '/app/customers', icon: Users },
      ],
    },
    {
      title: 'Organisation',
      items: [
        { name: 'Équipe & accès', href: '/app/agents', icon: UserCheck },
        { name: 'Nos agences', href: '/app/agencies', icon: Building2 },
        { name: 'Base de connaissances', href: '/app/knowledge', icon: BookOpen },
        { name: 'Automatisation', href: '/app/ai', icon: Cpu },
      ],
    },
    {
      title: 'Pilotage',
      items: [{ name: 'Statistiques', href: '/app/analytics', icon: BarChart3 }],
    },
    {
      title: 'Paramètres et compte',
      items: [
        { name: 'Paramètres', href: '/app/settings', icon: Settings },
        ...(canManageBilling
          ? [{ name: 'Abonnement & Facturation', href: '/app/billing', icon: CreditCard }]
          : []),
      ],
    },
  ];

  const agentSections: NavSection[] = [
    {
      title: 'Poste de travail',
      items: [
        { name: "Vue d'ensemble", href: '/app', icon: LayoutDashboard, exact: true },
        { name: 'Mes conversations', href: '/app/conversations', icon: MessageSquare },
        { name: 'Dossiers assignés', href: '/app/tickets', icon: FolderKanban },
        { name: 'Clients', href: '/app/customers', icon: Users },
      ],
    },
    {
      title: 'Mon compte',
      items: [{ name: 'Mon profil Agent', href: '/app/agent/profile', icon: ShieldCheck }],
    },
  ];

  const sections = isAgent ? agentSections : managementSections;

  const isActive = (item: NavItem) => {
    if (item.exact) return pathname === item.href;
    return pathname === item.href || pathname?.startsWith(item.href + '/');
  };

  const renderSidebarInner = (isMobileDrawer = false) => (
    <div className="flex flex-col h-full bg-white text-[#0D1B3D] select-none">
      {/* En-tête sobre aligné landing page */}
      <div className="px-4 pt-4 pb-3 border-b border-[#E5E4DF] space-y-3 shrink-0">
        <div className="flex items-center justify-between">
          <Link
            href="/app"
            onClick={(e) => {
              if (onNavigate) {
                e.preventDefault();
                onNavigate('/app');
              }
              setMobileSidebarOpen(false);
            }}
            className="flex items-center gap-2.5 min-w-0 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D1B3D]/30 rounded-lg p-1 -ml-1"
          >
            <div className="w-7 h-7 rounded-lg bg-[#0D1B3D] text-white flex items-center justify-center shrink-0">
              <Logo size="sm" showText={false} />
            </div>
            <span className="text-[15px] font-bold tracking-tight text-[#0D1B3D]">
              Zalisk
            </span>
          </Link>

          <div className="flex items-center gap-2">
            {currentWorkspace?.isPublic !== false && (
              <span
                className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-500"
                title="Guichet SAV en ligne"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
                <span className="hidden sm:inline">En ligne</span>
              </span>
            )}
            {isMobileDrawer && (
              <button
                type="button"
                onClick={() => setMobileSidebarOpen(false)}
                className="w-10 h-10 rounded-lg flex items-center justify-center text-slate-500 hover:text-[#0D1B3D] hover:bg-[#F4F3EF] active:scale-95 transition-all touch-manipulation cursor-pointer"
                aria-label="Fermer le menu"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {!onNavigate && <WorkspaceSwitcher />}
      </div>

      {/* Navigation blanche épurée (Clarity style : fond lin #F4F3EF + filet #0D1B3D) */}
      <nav
        aria-label="Navigation principale"
        className="flex-1 overflow-y-auto overscroll-contain px-2.5 py-4 space-y-5"
      >
        {sections.map((section) => (
          <div key={section.title} className="space-y-1">
            <div className="px-2.5 pb-1 text-[11px] font-medium text-slate-400">
              {section.title}
            </div>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const active = isActive(item);

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
                    className={`relative group flex items-center gap-2.5 px-2.5 min-h-[40px] md:min-h-[36px] rounded-lg text-[13px] transition-colors duration-150 touch-manipulation active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D1B3D]/30 ${
                      active
                        ? 'bg-[#F4F3EF] text-[#0D1B3D] font-semibold'
                        : 'text-slate-600 font-medium hover:bg-[#FAFAF8] hover:text-[#0D1B3D]'
                    }`}
                  >
                    {active && (
                      <span
                        aria-hidden="true"
                        className="absolute left-0 top-1.5 bottom-1.5 w-[2.5px] rounded-r bg-[#0D1B3D]"
                      />
                    )}
                    <Icon
                      className={`w-4 h-4 shrink-0 transition-colors ${
                        active ? 'text-[#0D1B3D]' : 'text-slate-400 group-hover:text-[#0D1B3D]'
                      }`}
                    />
                    <span className="truncate">{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Pied de page sobre */}
      <div className="p-3 border-t border-[#E5E4DF] space-y-2 shrink-0 bg-white">
        {currentWorkspace?.slug && !isAgent && (
          <a
            href={`/entreprises/${currentWorkspace.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setMobileSidebarOpen(false)}
            className="flex items-center justify-between px-2.5 min-h-[38px] rounded-lg bg-white hover:bg-[#FAFAF8] border border-[#E5E4DF] text-[#0D1B3D] text-xs font-medium transition-colors active:scale-[0.98] touch-manipulation"
          >
            <span className="truncate">Guichet client public</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          </a>
        )}

        {isActualAdminOrOwner && (
          <button
            type="button"
            onClick={() => {
              setUserRole(userRole === 'AGENT' ? actualRole : 'AGENT');
              setMobileSidebarOpen(false);
            }}
            className={`w-full flex items-center justify-center gap-2 px-2.5 min-h-[38px] rounded-lg text-xs font-medium transition-colors active:scale-[0.98] cursor-pointer touch-manipulation ${
              userRole === 'AGENT'
                ? 'bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100/70'
                : 'bg-[#FAFAF8] border border-[#E5E4DF] text-slate-600 hover:text-[#0D1B3D]'
            }`}
          >
            {userRole === 'AGENT' ? (
              <>
                <RotateCcw className="w-3.5 h-3.5 shrink-0" />
                <span>Revenir en vue Admin</span>
              </>
            ) : (
              <>
                <Eye className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>Tester la vue Agent</span>
              </>
            )}
          </button>
        )}

        {!onNavigate && (
          <div className="flex items-center justify-between gap-2 px-2 py-1.5 rounded-lg">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="relative shrink-0">
                <div className="w-7 h-7 rounded-full bg-[#0D1B3D] text-white flex items-center justify-center text-[11px] font-bold">
                  {user?.firstName?.charAt(0)?.toUpperCase() ||
                    user?.email?.charAt(0)?.toUpperCase() ||
                    'U'}
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#22C55E] ring-2 ring-white" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-[#0D1B3D] truncate leading-tight">
                  {user?.firstName
                    ? `${user.firstName} ${user.lastName || ''}`.trim()
                    : user?.email?.split('@')[0] || 'Équipe'}
                </p>
                <p className="text-[11px] font-normal text-slate-500 truncate capitalize">
                  {userRole?.toLowerCase()}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={logout}
              title="Déconnexion"
              aria-label="Se déconnecter"
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer active:scale-95 shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden md:flex md:w-60 lg:w-[244px] shrink-0 h-full border-r border-[#E5E4DF] bg-white flex-col z-20">
        {renderSidebarInner(false)}
      </aside>

      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-50 md:hidden flex"
          role="dialog"
          aria-modal="true"
          aria-label="Menu de navigation"
        >
          <div
            className="fixed inset-0 bg-[#0D1B3D]/25 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <aside
            className="relative w-[84vw] max-w-[296px] h-full bg-white shadow-2xl border-r border-[#E5E4DF] flex flex-col z-10"
            style={{
              paddingTop: 'env(safe-area-inset-top, 0px)',
              paddingBottom: 'env(safe-area-inset-bottom, 0px)',
            }}
          >
            {renderSidebarInner(true)}
          </aside>
        </div>
      )}
    </>
  );
};

export default Sidebar;
