"use client";

import React, { useState, useRef, useEffect } from "react";
import { Check, ChevronDown, Plus, Building2, ShieldCheck, Sparkles } from "lucide-react";
import { useWorkspace } from "./WorkspaceContext";
import { Workspace, Role } from "@/types/workspace";

interface WorkspaceSwitcherProps {
  collapsed?: boolean;
}

export const WorkspaceSwitcher: React.FC<WorkspaceSwitcherProps> = ({ collapsed = false }) => {
  const { workspaces, currentWorkspace, setCurrentWorkspace, setCreateModalOpen } = useWorkspace();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getRoleBadge = (role: Role) => {
    switch (role) {
      case "OWNER":
        return <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">Propriétaire</span>;
      case "ADMIN":
        return <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-sky-500/10 text-sky-600 border border-sky-500/20">Admin</span>;
      case "MANAGER":
        return <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-indigo-500/10 text-indigo-600 border border-indigo-500/20">Manager</span>;
      default:
        return <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-slate-100 text-slate-600 border border-slate-200">Agent</span>;
    }
  };

  if (collapsed) {
    return (
      <div className="relative flex justify-center" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold flex items-center justify-center transition-colors border border-slate-700/60"
          title={currentWorkspace?.name || 'Changer de workspace'}
        >
          {currentWorkspace?.name?.charAt(0)?.toUpperCase() || 'W'}
        </button>

        {isOpen && (
          <div className="absolute left-12 top-0 w-64 rounded-2xl bg-white border border-slate-200 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-3 py-2 border-b border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Espaces de travail</span>
            </div>
            <div className="py-1 max-h-60 overflow-y-auto space-y-1">
              {workspaces.map((ws) => (
                <button
                  key={ws.id}
                  onClick={() => {
                    setCurrentWorkspace(ws);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs transition-colors ${
                    ws.id === currentWorkspace?.id ? 'bg-emerald-50 text-emerald-950 font-bold' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="truncate">{ws.name}</span>
                  {ws.id === currentWorkspace?.id && <Check className="w-4 h-4 text-emerald-600 shrink-0" />}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Switcher Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-2 rounded-xl border border-slate-200/80 bg-slate-50/70 hover:bg-slate-100/80 hover:border-slate-300 transition-all text-left group"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-[#0D1B3D] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
            {currentWorkspace?.name ? currentWorkspace.name.charAt(0).toUpperCase() : "Z"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-navy-900 truncate leading-tight">
              {currentWorkspace?.name || "Mon Espace"}
            </p>
            <p className="text-[10px] text-slate-500 truncate font-medium">
              Plan Entreprise SAV
            </p>
          </div>
        </div>
        <ChevronDown className={`w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-transform duration-200 shrink-0 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-900/10 p-2 space-y-1 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Espaces de travail
          </div>

          <div className="max-h-56 overflow-y-auto space-y-1">
            {workspaces.map((ws) => {
              const isSelected = currentWorkspace?.id === ws.id;
              return (
                <button
                  key={ws.id}
                  onClick={() => {
                    setCurrentWorkspace(ws);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-left transition-colors ${
                    isSelected
                      ? "bg-emerald-50/80 text-emerald-950 font-semibold"
                      : "hover:bg-slate-50 text-slate-700 font-medium"
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold shrink-0 ${
                      isSelected ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-700"
                    }`}>
                      {ws.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs truncate">{ws.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {getRoleBadge(ws.role)}
                    {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="pt-2 border-t border-slate-100">
            <button
              onClick={() => {
                setIsOpen(false);
                setCreateModalOpen(true);
              }}
              className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs font-bold text-emerald-700 hover:bg-emerald-50 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Créer un nouvel espace</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkspaceSwitcher;

