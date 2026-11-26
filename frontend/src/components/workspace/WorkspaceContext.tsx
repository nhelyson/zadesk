'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { apiRequest, agentApi, commercialApi } from '@/lib/api';
import {
  Workspace,
  User,
  Role,
  PresenceState,
  WorkspaceUsageSummary,
} from '@/types/workspace';
import { usePulseStream, PulseNotificationItem, PulseEventData } from '@/hooks/usePulseStream';

export const notifyWorkspaceDataUpdated = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('zadesk:data-invalidated'));
  }
};

interface WorkspaceContextType {
  user: User | null;
  workspaces: Workspace[];
  currentWorkspace: Workspace | null;
  isLoading: boolean;
  loading: boolean;
  userRole: Role;
  actualRole: Role;
  isActualAdminOrOwner: boolean;
  isEnterprise: boolean;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  mobileSidebarOpen: boolean;
  setMobileSidebarOpen: (open: boolean) => void;
  setCurrentWorkspace: (workspace: Workspace) => void;
  createWorkspace: (data: string | Record<string, any>) => Promise<Workspace>;
  refreshWorkspaces: () => Promise<void>;
  commandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;
  createModalOpen: boolean;
  setCreateModalOpen: (open: boolean) => void;
  setUserRole: (role: Role) => void;
  logout: () => Promise<void>;
  sseStatus: 'connecting' | 'connected' | 'disconnected';
  pulseNotifications: PulseNotificationItem[];
  dismissPulseNotification: (id: string) => void;
  dismissPulseConversationNotifications: (conversationId: string) => void;
  setActiveViewedConversationId: (conversationId: string | null) => void;
  myPresence: PresenceState;
  workspaceUsage: WorkspaceUsageSummary | null;
  refreshWorkspaceUsage: () => Promise<void>;
}

export const WorkspaceContext = createContext<WorkspaceContextType>({
  user: null,
  workspaces: [],
  currentWorkspace: null,
  isLoading: true,
  loading: true,
  userRole: 'AGENT',
  actualRole: 'OWNER',
  isActualAdminOrOwner: true,
  isEnterprise: true,
  sidebarCollapsed: false,
  setSidebarCollapsed: () => {},
  mobileSidebarOpen: false,
  setMobileSidebarOpen: () => {},
  setCurrentWorkspace: () => {},
  createWorkspace: async () => ({ id: '', name: '', slug: '', role: 'OWNER', createdAt: '' }),
  refreshWorkspaces: async () => {},
  commandPaletteOpen: false,
  setCommandPaletteOpen: () => {},
  createModalOpen: false,
  setCreateModalOpen: () => {},
  setUserRole: () => {},
  logout: async () => {},
  sseStatus: 'disconnected',
  pulseNotifications: [],
  dismissPulseNotification: () => {},
  dismissPulseConversationNotifications: () => {},
  setActiveViewedConversationId: () => {},
  myPresence: 'OFFLINE',
  workspaceUsage: null,
  refreshWorkspaceUsage: async () => {},
});

export const useWorkspace = () => useContext(WorkspaceContext);

/**
 * Preview Provider dedicated to immersive showcase and landing page camera dive.
 * Reuses the exact same real context, hooks, and types without requiring an active backend JWT session.
 */
export interface WorkspacePreviewProviderProps {
  children: React.ReactNode;
  initialWorkspace?: Workspace;
  initialWorkspaces?: Workspace[];
  initialUser?: User;
  initialRole?: Role;
}

export const WorkspacePreviewProvider: React.FC<WorkspacePreviewProviderProps> = ({
  children,
  initialWorkspace,
  initialWorkspaces,
  initialUser,
  initialRole = 'OWNER',
}) => {
  const defaultWorkspace: Workspace = {
    id: 'cmvzqrcuq000lpl2264x7nkop',
    name: 'MTN Congo SAV',
    slug: 'mtn-congo-1',
    role: 'OWNER',
    category: 'Télécoms & Services Numériques',
    description: 'Centre de relation client et support SAV officiel MTN Congo',
    verified: true,
    isPublic: true,
    supportPhone: '+242 06 600 00 00',
    supportEmail: 'serviceclient@mtncongo.net',
    supportWhatsApp: '+242 06 600 00 00',
    address: 'Boulevard Denis Sassou Nguesso, Centre-Ville',
    city: 'Brazzaville',
    country: 'Congo',
    openingHours: 'Lundi - Vendredi : 08h00 - 18h00 · Samedi : 09h00 - 13h00',
    createdAt: '2026-01-15T10:00:00.000Z',
  };

  const defaultWorkspaces: Workspace[] = [
    defaultWorkspace,
    {
      id: 'cmvzo3j2u0000pl1121m8e3gq',
      name: 'Otaku Game fest',
      slug: 'clinique-sainte-marie',
      role: 'ADMIN',
      category: 'Loisirs & Gaming',
      verified: true,
      isPublic: true,
      createdAt: '2026-02-01T12:00:00.000Z',
    },
    {
      id: 'cmw02i17b000bpl2273vjygx4',
      name: 'Louvounou Market',
      slug: 'louvounou-market-5',
      role: 'OWNER',
      category: 'Grande Distribution',
      verified: true,
      isPublic: true,
      createdAt: '2026-02-10T15:00:00.000Z',
    },
  ];

  const defaultUser: User = {
    id: 'usr-preview',
    email: 'j.makosso@mtncongo.net',
    firstName: 'Jean-Pierre',
    lastName: 'Makosso',
    name: 'Jean-Pierre Makosso',
  };

  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace>(initialWorkspace || defaultWorkspace);
  const [workspaces, setWorkspaces] = useState<Workspace[]>(initialWorkspaces || defaultWorkspaces);
  const [user, setUser] = useState<User | null>(initialUser || defaultUser);
  const [userRole, setUserRole] = useState<Role>(initialRole);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  const value: WorkspaceContextType = {
    user,
    workspaces,
    currentWorkspace,
    isLoading: false,
    loading: false,
    userRole,
    actualRole: initialRole,
    isActualAdminOrOwner: initialRole === 'OWNER' || initialRole === 'ADMIN' || initialRole === 'MANAGER',
    isEnterprise: true,
    sidebarCollapsed,
    setSidebarCollapsed,
    mobileSidebarOpen,
    setMobileSidebarOpen,
    setCurrentWorkspace,
    createWorkspace: async () => defaultWorkspace,
    refreshWorkspaces: async () => {},
    commandPaletteOpen,
    setCommandPaletteOpen,
    createModalOpen: false,
    setCreateModalOpen: () => {},
    setUserRole,
    logout: async () => {},
    sseStatus: 'connected',
    pulseNotifications: [],
    dismissPulseNotification: () => {},
    dismissPulseConversationNotifications: () => {},
    setActiveViewedConversationId: () => {},
    myPresence: 'ONLINE',
    workspaceUsage: null,
    refreshWorkspaceUsage: async () => {},
  };

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
};

export const WorkspaceProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const pathname = usePathname();

  const [user, setUser] = useState<User | null>(null);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [currentWorkspace, setCurrentWorkspaceState] = useState<Workspace | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const createModalOpen = false;
  const setCreateModalOpen = (open: boolean) => {
    if (open && typeof window !== 'undefined') {
      router.push('/app/onboarding');
    }
  };
  const [roleOverride, setRoleOverride] = useState<Role | null>(null);

  // Élimine toute persistance résiduelle de prévisualisation dans localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('zadesk_role_preview');
    }
  }, []);

  const setUserRole = (role: Role) => {
    // Règle stricte : un utilisateur ayant le rôle AGENT en base ne peut jamais s'élever en OWNER
    const actualRole = currentWorkspace?.role || 'OWNER';
    if (actualRole === 'AGENT') return;

    // Prévisualisation purement volatile en mémoire (jamais persistée en localStorage)
    setRoleOverride(role);
  };

  const activeViewedConvIdRef = useRef<string | null>(null);
  const setActiveViewedConversationId = useCallback((conversationId: string | null) => {
    activeViewedConvIdRef.current = conversationId;
  }, []);

  const handleGlobalPulseEvent = useCallback((event: PulseEventData) => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('zadesk:pulse-event', { detail: event }));
      notifyWorkspaceDataUpdated();
    }
  }, []);

  const handleGlobalPulseSync = useCallback(async () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('zadesk:pulse-sync'));
      notifyWorkspaceDataUpdated();
    }
  }, []);

  const shouldSuppressGlobalToast = useCallback(
    (event: PulseEventData) => {
      if (typeof document === 'undefined') return false;
      if (document.hidden) return false;
      if (
        pathname === '/app/conversations' &&
        event.type === 'PULSE_MESSAGE_CREATED' &&
        event.conversationId &&
        activeViewedConvIdRef.current === event.conversationId
      ) {
        return true;
      }
      return false;
    },
    [pathname]
  );

  const {
    status: sseStatus,
    notifications: pulseNotifications,
    dismissNotification: dismissPulseNotification,
    dismissConversationNotifications: dismissPulseConversationNotifications,
  } = usePulseStream({
    workspaceId: currentWorkspace?.id,
    enabled: Boolean(currentWorkspace?.id) && !pathname?.startsWith('/app/onboarding'),
    onEvent: handleGlobalPulseEvent,
    onFullSyncNeeded: handleGlobalPulseSync,
    shouldSuppressNotification: shouldSuppressGlobalToast,
  });

  // Détection automatique de présence multi-onglets (Heartbeat 30s + activité utilisateur + sendBeacon à la fermeture)
  const [myPresence, setMyPresence] = useState<PresenceState>('OFFLINE');
  const [workspaceUsage, setWorkspaceUsage] = useState<WorkspaceUsageSummary | null>(null);
  const lastActivityAtRef = useRef<number>(Date.now());
  const tabIdRef = useRef<string>('');

  const refreshWorkspaceUsage = useCallback(async () => {
    const wsId = currentWorkspace?.id;
    if (!wsId || pathname?.startsWith('/app/onboarding')) {
      setWorkspaceUsage(null);
      return;
    }
    try {
      const usage = await commercialApi.getUsage(wsId);
      setWorkspaceUsage(usage);
    } catch {
      // Keep prior state silently on transient failures
    }
  }, [currentWorkspace?.id, pathname]);

  useEffect(() => {
    refreshWorkspaceUsage();
  }, [refreshWorkspaceUsage]);

  useEffect(() => {
    if (typeof window === 'undefined' || !currentWorkspace?.id) return;
    let timer: ReturnType<typeof setTimeout> | null = null;
    const handleDataInvalidated = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        refreshWorkspaceUsage();
      }, 600);
    };
    window.addEventListener('zadesk:data-invalidated', handleDataInvalidated);
    return () => {
      if (timer) clearTimeout(timer);
      window.removeEventListener('zadesk:data-invalidated', handleDataInvalidated);
    };
  }, [currentWorkspace?.id, refreshWorkspaceUsage]);

  useEffect(() => {
    const wsId = currentWorkspace?.id;
    const isOnboarding = pathname?.startsWith('/app/onboarding');
    if (!wsId || !user?.id || isOnboarding || typeof window === 'undefined') {
      setMyPresence('OFFLINE');
      return;
    }

    if (!tabIdRef.current) {
      let storedTabId = sessionStorage.getItem('zadesk_presence_tab_id');
      if (!storedTabId) {
        storedTabId =
          typeof crypto !== 'undefined' && crypto.randomUUID
            ? crypto.randomUUID()
            : `tab-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        sessionStorage.setItem('zadesk_presence_tab_id', storedTabId);
      }
      tabIdRef.current = storedTabId;
    }

    let lastActivityRecorded = Date.now();
    lastActivityAtRef.current = lastActivityRecorded;

    const markActivity = () => {
      if (document.visibilityState !== 'visible') return;
      const now = Date.now();
      if (now - lastActivityRecorded > 3000) {
        lastActivityRecorded = now;
        lastActivityAtRef.current = now;
      }
    };

    const activityEvents = ['pointerdown', 'keydown', 'scroll', 'touchstart', 'mousemove'];
    activityEvents.forEach((evt) =>
      window.addEventListener(evt, markActivity, { passive: true })
    );

    let lastSentAt = 0;
    const sendHeartbeat = async (force = false) => {
      const now = Date.now();
      if (!force && now - lastSentAt < 5000) return;
      if (!navigator.onLine) return;
      lastSentAt = now;
      try {
        const idleMs = Math.max(0, now - lastActivityAtRef.current);
        const res = await agentApi.sendPresenceHeartbeat(wsId, {
          tabId: tabIdRef.current,
          idleMs,
        });
        if (res?.presence?.state) {
          setMyPresence(res.presence.state);
        }
      } catch {}
    };

    // Signal initial immédiat
    sendHeartbeat(true);

    // Heartbeat périodique toutes les 30 secondes
    const interval = setInterval(() => {
      sendHeartbeat(true);
    }, 30000);

    const handleVisibilityOrFocus = () => {
      if (document.visibilityState === 'visible') {
        lastActivityAtRef.current = Date.now();
        lastActivityRecorded = lastActivityAtRef.current;
        sendHeartbeat(true);
      }
    };

    const handleOnline = () => {
      lastActivityAtRef.current = Date.now();
      sendHeartbeat(true);
    };

    const handleLeave = () => {
      try {
        const apiBase = process.env.NEXT_PUBLIC_API_URL || '/api';
        const url = `${apiBase}/workspaces/${encodeURIComponent(wsId)}/agent/presence/leave`;
        const payload = new Blob([JSON.stringify({ tabId: tabIdRef.current })], {
          type: 'application/json',
        });
        if (navigator.sendBeacon) {
          navigator.sendBeacon(url, payload);
        }
      } catch {}
    };

    document.addEventListener('visibilitychange', handleVisibilityOrFocus);
    window.addEventListener('focus', handleVisibilityOrFocus);
    window.addEventListener('online', handleOnline);
    window.addEventListener('pagehide', handleLeave);

    return () => {
      clearInterval(interval);
      activityEvents.forEach((evt) => window.removeEventListener(evt, markActivity));
      document.removeEventListener('visibilitychange', handleVisibilityOrFocus);
      window.removeEventListener('focus', handleVisibilityOrFocus);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('pagehide', handleLeave);
    };
  }, [currentWorkspace?.id, user?.id, pathname]);

  // Load user & workspaces
  const loadInitialData = useCallback(async () => {
    setIsLoading(true);
    try {
      // 1. Fetch current user session
      const meRes = await apiRequest<User>('/auth/me');
      if (!meRes.authenticated || !meRes.user) {
        setUser(null);
        setWorkspaces([]);
        setCurrentWorkspaceState(null);
        setIsLoading(false);
        if (typeof window !== 'undefined') {
          const target = pathname?.startsWith('/app') ? pathname : '/app';
          window.location.replace(`/login?redirect=${encodeURIComponent(target)}`);
        }
        return;
      }

      setUser(meRes.user);

      // 2. Fetch user's workspaces
      const wsRes = await apiRequest<{ workspaces: Workspace[] }>('/workspaces');
      const list = wsRes.data?.workspaces || wsRes.workspaces || [];
      
      if (list.length > 0) {
        setWorkspaces(list);
        const savedSlug = typeof window !== 'undefined' ? localStorage.getItem('zadesk_active_workspace') : null;
        const isValid = savedSlug && savedSlug !== 'ws-demo-01' && savedSlug !== 'ws-default';
        const found = isValid ? list.find((w: Workspace) => w.slug === savedSlug || w.id === savedSlug) : null;
        const active = found || list[0];
        setCurrentWorkspaceState(active);
        if (typeof window !== 'undefined') {
          localStorage.setItem('zadesk_active_workspace', active.id);
        }
      } else {
        setWorkspaces([]);
        setCurrentWorkspaceState(null);
        if (typeof window !== 'undefined') {
          localStorage.removeItem('zadesk_active_workspace');
          // If accessing /app without having created a SAV yet, navigate to the onboarding guide
          if (pathname === '/app' || (pathname.startsWith('/app') && !pathname.includes('/onboarding'))) {
            router.push('/app/onboarding');
          }
        }
      }
    } catch (err: any) {
      console.warn('[Workspace] Initialization notice:', err);
      setUser(null);
      setWorkspaces([]);
      setCurrentWorkspaceState(null);
      if (typeof window !== 'undefined') {
        const target = pathname?.startsWith('/app') ? pathname : '/app';
        window.location.replace(`/login?redirect=${encodeURIComponent(target)}`);
        return;
      }
    } finally {
      setIsLoading(false);
    }
  }, [pathname, router]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Keyboard shortcut for Command Palette (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setCommandPaletteOpen(false);
        setCreateModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const setCurrentWorkspace = (workspace: Workspace) => {
    setCurrentWorkspaceState(workspace);
    if (typeof window !== 'undefined') {
      localStorage.setItem('zadesk_active_workspace', workspace.slug);
    }
  };

  const createWorkspace = async (param: string | Record<string, any>): Promise<Workspace> => {
    const payload = typeof param === 'string' ? { name: param } : param;
    try {
      const res = await apiRequest<{ workspace: Workspace }>('/workspaces', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      const newWs = res.data?.workspace || res.workspace || (res as any).data;
      const formattedWs: Workspace = {
        id: newWs.id,
        name: newWs.name,
        slug: newWs.slug,
        role: 'OWNER',
        createdAt: newWs.createdAt || new Date().toISOString(),
      };
      setWorkspaces((prev) => [formattedWs, ...prev.filter(w => w.id !== formattedWs.id)]);
      setCurrentWorkspace(formattedWs);
      return formattedWs;
    } catch (err) {
      console.error('Failed to create workspace:', err);
      throw err;
    }
  };

  const refreshWorkspaces = async () => {
    try {
      const wsRes = await apiRequest<{ workspaces: Workspace[] }>('/workspaces');
      const list = wsRes.data?.workspaces || wsRes.workspaces || [];
      if (list.length > 0) setWorkspaces(list);
    } catch (e) {}
  };

  const logout = async () => {
    try {
      await apiRequest('/auth/logout', { method: 'POST' });
    } catch (e) {
    } finally {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('zadesk_active_workspace');
      }
      router.push('/login');
    }
  };

  // Règle de sécurité : Un AGENT en base reste strictement AGENT.
  // Seul un OWNER, ADMIN ou MANAGER peut prévisualiser la vue AGENT.
  const actualRole = currentWorkspace?.role || 'OWNER';
  const isActualAdminOrOwner = actualRole === 'OWNER' || actualRole === 'ADMIN' || actualRole === 'MANAGER';
  const userRole: Role = isActualAdminOrOwner
    ? (roleOverride === 'AGENT' ? 'AGENT' : actualRole)
    : 'AGENT';

  return (
    <WorkspaceContext.Provider
      value={{
        user,
        workspaces,
        currentWorkspace,
        isLoading,
        loading: isLoading,
        userRole,
        actualRole,
        isActualAdminOrOwner,
        isEnterprise: true,
        sidebarCollapsed,
        setSidebarCollapsed,
        mobileSidebarOpen,
        setMobileSidebarOpen,
        setCurrentWorkspace,
        createWorkspace,
        refreshWorkspaces,
        commandPaletteOpen,
        setCommandPaletteOpen,
        createModalOpen,
        setCreateModalOpen,
        setUserRole,
        logout,
        sseStatus,
        pulseNotifications,
        dismissPulseNotification,
        dismissPulseConversationNotifications,
        setActiveViewedConversationId,
        myPresence,
        workspaceUsage,
        refreshWorkspaceUsage,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
};
