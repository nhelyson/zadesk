'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { CommandPalette } from './CommandPalette';
import { useWorkspace } from './WorkspaceContext';
import { Loader2, Plus, Building2, ArrowRight } from 'lucide-react';

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const {
    loading,
    workspaces,
    user,
  } = useWorkspace();

  // Dedicated full-screen experience: Onboarding is completely decoupled from Workspace shell
  const isOnboarding = pathname?.startsWith('/app/onboarding');
  if (isOnboarding) {
    return <>{children}</>;
  }

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center text-slate-600">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
          <p className="text-xs font-semibold text-slate-500 animate-pulse">
            Chargement de l&apos;espace Entreprise Zadesk...
          </p>
        </div>
      </div>
    );
  }

  // If user has zero workspaces, prompt to launch the full onboarding flow
  if (workspaces.length === 0) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
        <div className="max-w-md w-full p-8 rounded-3xl bg-white border border-slate-200/90 shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
            <Building2 className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Bienvenue sur Zadesk Entreprise
            </h1>
            <p className="text-xs text-slate-500 leading-relaxed">
              Pour commencer à piloter le SAV conversationnel de votre organisation, configurez votre premier espace d&apos;assistance.
            </p>
          </div>

          <button
            onClick={() => router.push('/app/onboarding')}
            className="w-full py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs transition-all shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Lancer la création de mon SAV</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-[#F8FAFC] text-slate-900 flex antialiased selection:bg-emerald-500 selection:text-white">
      {/* Sidebar (Desktop / Tablet / Mobile Drawer) */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-dvh">
        <Topbar />

        <main className="flex-1 p-3.5 sm:p-4 md:p-6 lg:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>

      {/* Global Modals */}
      <CommandPalette />
    </div>
  );
};

export default AppShell;
