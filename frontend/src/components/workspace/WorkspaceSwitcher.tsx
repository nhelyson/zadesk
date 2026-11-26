'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Check, ChevronDown, Plus } from 'lucide-react';
import { useWorkspace } from './WorkspaceContext';
import { Role } from '@/types/workspace';

interface WorkspaceSwitcherProps {
  collapsed?: boolean;
}

export const WorkspaceSwitcher: React.FC<WorkspaceSwitcherProps> = ({ collapsed = false }) => {
  const { workspaces, currentWorkspace, setCurrentWorkspace } = useWorkspace();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getRoleLabel = (role: Role) => {
    switch (role) {
      case 'OWNER':
        return 'Propriétaire';
      case 'ADMIN':
        return 'Admin';
      case 'MANAGER':
        return 'Manager';
      default:
        return 'Agent';
    }
  };

  if (collapsed) {
    return (
      <div className="relative flex justify-center" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-10 h-10 rounded-lg bg-[#F4F3EF] hover:bg-[#EAE8E2] text-[#0D1B3D] font-bold flex items-center justify-center transition-colors border border-[#E5E4DF] cursor-pointer"
          title={currentWorkspace?.name || 'Changer de workspace'}
        >
          {currentWorkspace?.name?.charAt(0)?.toUpperCase() || 'Z'}
        </button>
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-2.5 py-2 min-h-[42px] rounded-lg border border-[#E5E4DF] bg-[#FAFAF8] hover:border-[#0D1B3D]/25 transition-colors text-left group cursor-pointer active:scale-[0.98] touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D1B3D]/30"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <div className="min-w-0 flex-1 pr-2">
          <p className="text-xs font-semibold text-[#0D1B3D] truncate leading-tight">
            {currentWorkspace?.name || 'Mon Espace'}
          </p>
          <p className="text-[11px] text-slate-500 truncate">
            {currentWorkspace?.category || 'Espace principal'}
          </p>
        </div>
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 group-hover:text-[#0D1B3D] transition-transform duration-150 shrink-0 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1.5 z-50 bg-white rounded-xl border border-[#E5E4DF] shadow-lg p-1.5 space-y-1">
          <div className="px-2 py-1 text-[11px] font-medium text-slate-400">
            Espaces de travail
          </div>

          <div className="max-h-56 overflow-y-auto overscroll-contain space-y-0.5">
            {workspaces.map((ws) => {
              const isSelected = currentWorkspace?.id === ws.id;
              return (
                <button
                  type="button"
                  key={ws.id}
                  onClick={() => {
                    setCurrentWorkspace(ws);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-2 min-h-[38px] rounded-lg text-left transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-[#F4F3EF] text-[#0D1B3D] font-semibold'
                      : 'hover:bg-[#FAFAF8] text-slate-700 font-medium'
                  }`}
                >
                  <span className="text-xs truncate pr-2">{ws.name}</span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[10px] text-slate-400 font-medium">
                      {getRoleLabel(ws.role)}
                    </span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-[#0D1B3D]" />}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="pt-1 border-t border-[#E5E4DF]">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                window.location.href = '/app/onboarding';
              }}
              className="w-full flex items-center gap-2 px-2.5 py-2 min-h-[38px] rounded-lg text-xs font-medium text-[#0D1B3D] hover:bg-[#FAFAF8] transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nouvel espace</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkspaceSwitcher;
