'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useWorkspace } from './WorkspaceContext';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { CommandPalette } from './CommandPalette';
import { MobileBottomNav } from './MobileBottomNav';
import { PulseNotifications } from '@/components/pulse/PulseNotifications';
import { Building2, ArrowRight, AlertTriangle, X } from 'lucide-react';

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const {
    workspaces,
    isLoading,
    userRole,
    actualRole,
    isActualAdminOrOwner,
    setUserRole,
    pulseNotifications,
    dismissPulseNotification,
    dismissPulseConversationNotifications,
    workspaceUsage,
    currentWorkspace,
  } = useWorkspace();

  const [dismissedQuotaSig, setDismissedQuotaSig] = useState<string | null>(null);

  const activeQuotaSig = useMemo(() => {
    if (!workspaceUsage || !workspaceUsage.alerts || workspaceUsage.alerts.length === 0) {
      return null;
    }
    const keys = workspaceUsage.alerts.map((a) => `${a.key}:${a.severity}`).join('|');
    return `${currentWorkspace?.id || 'ws'}:${workspaceUsage.plan.id}:${keys}`;
  }, [workspaceUsage, currentWorkspace?.id]);

  useEffect(() => {
    if (typeof window === 'undefined' || !activeQuotaSig) {
      setDismissedQuotaSig(null);
      return;
    }
    const saved = sessionStorage.getItem('zadesk_dismissed_quota_sig');
    setDismissedQuotaSig(saved);
  }, [activeQuotaSig]);

  const showGlobalQuotaBanner = Boolean(
    activeQuotaSig &&
      dismissedQuotaSig !== activeQuotaSig &&
      userRole !== 'AGENT' &&
      pathname !== '/app/billing' &&
      workspaceUsage &&
      workspaceUsage.alerts.length > 0
  );

  const handleDismissQuotaBanner = () => {
    if (!activeQuotaSig) return;
    setDismissedQuotaSig(activeQuotaSig);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('zadesk_dismissed_quota_sig', activeQuotaSig);
    }
  };

  const isOnboardingPage = pathname?.startsWith('/app/onboarding');
  if (isOnboardingPage) {
    return (
      <div className="min-h-dvh bg-[#FAF9F6] antialiased selection:bg-emerald-500 selection:text-white">
        {children}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="h-dvh w-full bg-[#FAFAF8] flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-[#E5E4DF] border-t-[#0D1B3D] animate-spin" />
          <p className="text-xs font-medium text-slate-500">
            Chargement de votre espace Zalisk…
          </p>
        </div>
      </div>
    );
  }

  if (workspaces.length === 0) {
    return (
      <div className="min-h-dvh bg-[#FAFAF8] flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-xl p-8 border border-[#E5E4DF] shadow-sm text-center space-y-5">
          <div className="w-12 h-12 rounded-xl bg-[#F4F3EF] border border-[#E5E4DF] text-[#0D1B3D] flex items-center justify-center mx-auto">
            <Building2 className="w-6 h-6" />
          </div>
          <div className="space-y-1.5">
            <h1 className="text-xl font-bold text-[#0D1B3D] tracking-tight">
              Bienvenue sur Zalisk
            </h1>
            <p className="text-xs text-slate-500 leading-relaxed">
              Vous n&apos;avez pas encore d&apos;espace configuré. Créez votre premier espace SAV en quelques secondes.
            </p>
          </div>
          <Link
            href="/app/onboarding"
            className="w-full min-h-[44px] rounded-lg bg-[#0D1B3D] hover:bg-[#152C61] text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          >
            <span>Configurer mon espace</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-dvh w-full bg-[#FAFAF8] flex overflow-hidden antialiased selection:bg-[#0D1B3D] selection:text-white">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-[#FAFAF8]">
        <Topbar />

        {isActualAdminOrOwner && userRole === 'AGENT' && (
          <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center justify-between text-xs text-amber-950 font-medium shrink-0">
            <span className="truncate">
              <strong>Mode Aperçu Agent</strong> : vous visualisez l&apos;interface Conseiller SAV.
            </span>
            <button
              type="button"
              onClick={() => setUserRole(actualRole)}
              className="text-xs font-semibold bg-amber-900 hover:bg-amber-950 text-white px-3 min-h-[30px] rounded-md transition-colors cursor-pointer shrink-0 ml-2 active:scale-95"
            >
              Quitter
            </button>
          </div>
        )}

        {showGlobalQuotaBanner && workspaceUsage && (
          <div
            className={`border-b px-4 sm:px-6 py-2 flex items-center justify-between gap-3 text-xs shrink-0 ${
              workspaceUsage.globalSeverity === 'REACHED'
                ? 'bg-rose-50/90 border-rose-200 text-rose-950'
                : 'bg-amber-50/90 border-amber-200 text-amber-950'
            }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <AlertTriangle
                className={`w-3.5 h-3.5 shrink-0 ${
                  workspaceUsage.globalSeverity === 'REACHED' ? 'text-rose-600' : 'text-amber-600'
                }`}
              />
              <p className="truncate">
                <strong className="font-semibold">{workspaceUsage.alerts[0].title}</strong>
                {workspaceUsage.alerts.length > 1 && (
                  <span className="hidden sm:inline opacity-80">
                    {' '}
                    (+{workspaceUsage.alerts.length - 1} autre
                    {workspaceUsage.alerts.length > 2 ? 's' : ''})
                  </span>
                )}
                <span className="hidden md:inline opacity-80">
                  {' '}
                  · Forfait {workspaceUsage.plan.name}
                </span>
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Link
                href="/app/billing"
                className={`px-3 h-7 rounded-full text-[11px] font-semibold inline-flex items-center gap-1 transition-colors ${
                  workspaceUsage.globalSeverity === 'REACHED'
                    ? 'bg-rose-700 hover:bg-rose-800 text-white'
                    : 'bg-amber-900 hover:bg-amber-950 text-white'
                }`}
              >
                <span>Voir les quotas</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
              <button
                type="button"
                onClick={handleDismissQuotaBanner}
                aria-label="Masquer cet avertissement pour cette session"
                className="p-1 rounded-full hover:bg-black/5 opacity-70 hover:opacity-100 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        <main className="flex-1 overflow-y-auto overscroll-contain px-4 py-5 sm:px-6 lg:px-8 sm:py-6 pb-24 md:pb-8">
          <div className="max-w-[1440px] mx-auto w-full">{children}</div>
        </main>
      </div>

      <MobileBottomNav />
      <CommandPalette />
      <PulseNotifications
        notifications={pulseNotifications}
        onSelectConversation={(conversationId) => {
          dismissPulseConversationNotifications(conversationId);
          if (pathname === '/app/conversations') {
            window.dispatchEvent(
              new CustomEvent('zadesk:select-conversation', { detail: { conversationId } })
            );
          } else {
            router.push(`/app/conversations?id=${encodeURIComponent(conversationId)}`);
          }
        }}
        onDismiss={dismissPulseNotification}
      />
    </div>
  );
};

export default AppShell;
