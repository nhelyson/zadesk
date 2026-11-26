'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, MessageSquare, FolderKanban, Menu } from 'lucide-react';
import { useWorkspace } from './WorkspaceContext';

export const MobileBottomNav: React.FC = () => {
  const pathname = usePathname();
  const { mobileSidebarOpen, setMobileSidebarOpen } = useWorkspace();

  const items = [
    { name: 'Accueil', href: '/app', icon: LayoutDashboard, exact: true },
    { name: 'Messages', href: '/app/conversations', icon: MessageSquare },
    { name: 'Dossiers', href: '/app/tickets', icon: FolderKanban },
  ];

  const isActive = (item: (typeof items)[number]) => {
    if (item.exact) return pathname === item.href;
    return pathname === item.href || pathname?.startsWith(item.href + '/');
  };

  return (
    <nav
      aria-label="Navigation mobile rapide"
      className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E5E4DF] flex items-center justify-around px-2 select-none touch-manipulation"
      style={{ paddingBottom: 'max(0.35rem, env(safe-area-inset-bottom, 0px))' }}
    >
      {items.map((item) => {
        const Icon = item.icon;
        const active = isActive(item) && !mobileSidebarOpen;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setMobileSidebarOpen(false)}
            className={`flex flex-col items-center justify-center min-w-[64px] min-h-[48px] pt-1.5 pb-1 rounded-lg transition-colors active:scale-95 ${
              active ? 'text-[#0D1B3D]' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Icon className="w-5 h-5" />
            <span className={`text-[10px] mt-0.5 leading-none ${active ? 'font-bold' : 'font-medium'}`}>
              {item.name}
            </span>
          </Link>
        );
      })}

      <button
        type="button"
        onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
        className={`flex flex-col items-center justify-center min-w-[64px] min-h-[48px] pt-1.5 pb-1 rounded-lg transition-colors active:scale-95 cursor-pointer ${
          mobileSidebarOpen ? 'text-[#0D1B3D]' : 'text-slate-400 hover:text-slate-600'
        }`}
        aria-label="Ouvrir tout le menu"
        aria-expanded={mobileSidebarOpen}
      >
        <Menu className="w-5 h-5" />
        <span className={`text-[10px] mt-0.5 leading-none ${mobileSidebarOpen ? 'font-bold' : 'font-medium'}`}>
          Menu
        </span>
      </button>
    </nav>
  );
};

export default MobileBottomNav;
