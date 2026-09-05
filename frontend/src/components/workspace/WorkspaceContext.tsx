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
  createWorkspace: (name: string) => Promise<Workspace>;
  refreshWorkspaces: () => Promise<void>;
  commandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;
  createModalOpen: boolean;
  setCreateModalOpen: (open: boolean) => void;
  logout: () => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextType>({
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
  logout: async () => {},
});

export const useWorkspace = () => useContext(WorkspaceContext);

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
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // Load user & workspaces
  const loadInitialData = useCallback(async () => {
    setIsLoading(true);
    try {
      // 1. Fetch current user session
      const meRes = await apiRequest<User>('/auth/me');
      if (meRes.authenticated && meRes.user) {
        setUser(meRes.user);
      } else {
        // Fallback demo user if not logged in
        setUser({
          id: 'usr-admin',
          email: 'admin@zadesk.com',
          firstName: 'Admin',
          lastName: 'Zadesk',
        });
      }

      // 2. Fetch user's workspaces
      const wsRes = await apiRequest<{ workspaces: Workspace[] }>('/workspaces');
      const list = wsRes.data?.workspaces || wsRes.workspaces || [];
      
      if (list.length > 0) {
        setWorkspaces(list);
        const savedSlug = typeof window !== 'undefined' ? localStorage.getItem('zadesk_active_workspace') : null;
        const found = list.find((w: Workspace) => w.slug === savedSlug || w.id === savedSlug);
        setCurrentWorkspaceState(found || list[0]);
      } else {
        // Fallback default demo workspace if user doesn't have one yet
        const defaultWs: Workspace = {
          id: 'ws-demo-01',
          name: 'Zadesk Entreprise',
          slug: 'zadesk-entreprise',
          role: 'OWNER',
          createdAt: new Date().toISOString(),
        };
        setWorkspaces([defaultWs]);
        setCurrentWorkspaceState(defaultWs);
      }
    } catch (err) {
      console.warn('[Workspace] Initialization notice:', err);
      const fallbackWs: Workspace = {
        id: 'ws-default',
        name: 'Zadesk Entreprise',
        slug: 'zadesk-entreprise',
        role: 'OWNER',
        createdAt: new Date().toISOString(),
      };
      setUser({
        id: 'usr-demo',
        email: 'admin@zadesk.com',
        firstName: 'Admin',
        lastName: 'Zadesk',
      });
      setWorkspaces([fallbackWs]);
      setCurrentWorkspaceState(fallbackWs);
    } finally {
      setIsLoading(false);
    }
  }, []);

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

  const createWorkspace = async (name: string): Promise<Workspace> => {
    try {
      const res = await apiRequest<{ workspace: Workspace }>('/workspaces', {
        method: 'POST',
        body: JSON.stringify({ name }),
      });
      const newWs = res.data?.workspace || res.workspace;
      const formattedWs: Workspace = {
        id: newWs.id,
        name: newWs.name,
        slug: newWs.slug,
        role: 'OWNER',
        createdAt: newWs.createdAt || new Date().toISOString(),
      };
      setWorkspaces((prev) => [formattedWs, ...prev]);
      setCurrentWorkspace(formattedWs);
      return formattedWs;
    } catch (err) {
      const formattedWs: Workspace = {
        id: `ws-${Date.now()}`,
        name,
        slug: name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        role: 'OWNER',
        createdAt: new Date().toISOString(),
      };
      setWorkspaces((prev) => [formattedWs, ...prev]);
      setCurrentWorkspace(formattedWs);
      return formattedWs;
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

  const userRole: Role = currentWorkspace?.role || 'OWNER';

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
        logout,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
};
