'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { apiRequest } from '@/lib/api';
import { Workspace, User, Role } from '@/types/workspace';

interface WorkspaceContextType {
  user: User | null;
  workspaces: Workspace[];
  currentWorkspace: Workspace | null;
  isLoading: boolean;
  loading: boolean;
  userRole: Role;
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
}

export const WorkspaceContext = createContext<WorkspaceContextType>({
  user: null,
  workspaces: [],
  currentWorkspace: null,
  isLoading: true,
  loading: true,
  userRole: 'AGENT',
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

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('zadesk_role_preview') as Role | null;
      if (saved) setRoleOverride(saved);
    }
  }, []);

  const setUserRole = (role: Role) => {
    // Règle stricte : un utilisateur ayant le rôle AGENT en base ne peut jamais s'élever en OWNER
    const actualRole = currentWorkspace?.role || 'OWNER';
    if (actualRole === 'AGENT') return;

    setRoleOverride(role);
    if (typeof window !== 'undefined') {
      localStorage.setItem('zadesk_role_preview', role);
    }
  };

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
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
};
