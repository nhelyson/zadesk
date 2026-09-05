'use client';

import React from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { CommandPalette } from './CommandPalette';
import { CreateWorkspaceModal } from './CreateWorkspaceModal';
import { useWorkspace } from './WorkspaceContext';
import { Loader2, Plus, Building2 } from 'lucide-react';

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const {
    loading,
    workspaces,
    setCreateModalOpen,
  } = useWorkspace();

  if (loading) {
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

  // If user has zero workspaces, prompt to create one
  if (!loading && workspaces.length === 0) {
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
              Pour commencer à piloter le SAV conversationnel de votre organisation, créez votre premier Workspace.
            </p>
          </div>

          <button
            onClick={() => setCreateModalOpen(true)}
            className="w-full py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs transition-all shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Créer mon Workspace</span>
          </button>
        </div>

        <CreateWorkspaceModal />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex antialiased selection:bg-emerald-500 selection:text-white">
      {/* Sidebar (Desktop / Tablet / Mobile Drawer) */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <Topbar />

        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>

      {/* Global Modals */}
      <CommandPalette />
      <CreateWorkspaceModal />
    </div>
  );
};

export default AppShell;
