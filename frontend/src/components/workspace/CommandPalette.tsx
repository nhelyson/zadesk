"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  LayoutDashboard,
  MessageSquare,
  Ticket,
  Users,
  UserCheck,
  Building2,
  Cpu,
  BookOpen,
  MessageCircle,
  BarChart3,
  Settings,
  PlusCircle,
  X,
  ArrowRight,
} from "lucide-react";
import { useWorkspace } from "./WorkspaceContext";

interface CommandItem {
  id: string;
  category: "Navigation" | "Actions Rapides" | "Support & IA";
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  path?: string;
  action?: () => void;
}

export const CommandPalette = () => {
  const { commandPaletteOpen, setCommandPaletteOpen } = useWorkspace();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (commandPaletteOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [commandPaletteOpen]);

  const items: CommandItem[] = [
    // Navigation
    {
      id: "nav-dash",
      category: "Navigation",
      title: "Vue d'ensemble / Dashboard",
      subtitle: "Métriques clés et file de priorité",
      icon: <LayoutDashboard className="w-4 h-4 text-emerald-600" />,
      path: "/workspace",
    },
    {
      id: "nav-conv",
      category: "Navigation",
      title: "Conversations SAV",
      subtitle: "Messagerie client WhatsApp et IA",
      icon: <MessageSquare className="w-4 h-4 text-sky-600" />,
      path: "/workspace/conversations",
    },
    {
      id: "nav-tck",
      category: "Navigation",
      title: "Dossiers & Tickets",
      subtitle: "Continuité de service et agences",
      icon: <Ticket className="w-4 h-4 text-indigo-600" />,
      path: "/workspace/tickets",
    },
    {
      id: "nav-cust",
      category: "Navigation",
      title: "Annuaire Clients",
      subtitle: "Fiches clients et historique unifié",
      icon: <Users className="w-4 h-4 text-slate-600" />,
      path: "/workspace/customers",
    },
    {
      id: "nav-agents",
      category: "Navigation",
      title: "Agents & Équipe",
      subtitle: "Disponibilité et compétences SAV",
      icon: <UserCheck className="w-4 h-4 text-emerald-600" />,
      path: "/app/agents",
    },
    {
      id: "nav-agencies",
      category: "Navigation",
      title: "Nos Établissements",
      subtitle: "Boutiques, agences physiques et comptoirs SAV",
      icon: <Building2 className="w-4 h-4 text-amber-600" />,
      path: "/app/agencies",
    },
    {
      id: "nav-ai",
      category: "Navigation",
      title: "Intelligence IA",
      subtitle: "Règles d'autonomie et d'escalade",
      icon: <Cpu className="w-4 h-4 text-purple-600" />,
      path: "/workspace/ai",
    },
    {
      id: "nav-kb",
      category: "Navigation",
      title: "Base de Connaissances",
      subtitle: "Articles FAQ, garanties et procédures RAG",
      icon: <BookOpen className="w-4 h-4 text-teal-600" />,
      path: "/workspace/knowledge",
    },
    {
      id: "nav-wa",
      category: "Navigation",
      title: "Canal WhatsApp",
      subtitle: "Connexion Zavu API et templates",
      icon: <MessageCircle className="w-4 h-4 text-emerald-500" />,
      path: "/workspace/whatsapp",
    },
    {
      id: "nav-stats",
      category: "Navigation",
      title: "Analyses & KPIs",
      subtitle: "Performances et motifs de réclamations",
      icon: <BarChart3 className="w-4 h-4 text-rose-600" />,
      path: "/workspace/analytics",
    },
    {
      id: "nav-settings",
      category: "Navigation",
      title: "Paramètres Workspace",
      subtitle: "Membres, permissions RBAC et profil",
      icon: <Settings className="w-4 h-4 text-slate-600" />,
      path: "/workspace/settings",
    },

    // Actions Rapides
    {
      id: "act-create-ws",
      category: "Actions Rapides",
      title: "Créer un nouvel Espace de travail",
      subtitle: "Configurer une nouvelle entreprise ou filiale",
      icon: <PlusCircle className="w-4 h-4 text-emerald-600" />,
      action: () => {
        setCommandPaletteOpen(false);
        router.push("/app/onboarding");
      },
    },
  ];

  const filteredItems = items.filter(
    (item) =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      (item.subtitle && item.subtitle.toLowerCase().includes(query.toLowerCase())) ||
      item.category.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (item: CommandItem) => {
    setCommandPaletteOpen(false);
    if (item.action) {
      item.action();
    } else if (item.path) {
      router.push(item.path);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % filteredItems.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % filteredItems.length);
    } else if (e.key === "Enter" && filteredItems[selectedIndex]) {
      e.preventDefault();
      handleSelect(filteredItems[selectedIndex]);
    }
  };

  if (!commandPaletteOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[10000] bg-navy-950/60 backdrop-blur-sm flex items-start justify-center px-3 sm:px-4 animate-in fade-in duration-150"
      style={{ paddingTop: 'max(2.5rem, calc(env(safe-area-inset-top, 0px) + 1rem))' }}
      onClick={() => setCommandPaletteOpen(false)}
    >
      <div
        className="bg-white w-full max-w-xl max-h-[85dvh] flex flex-col rounded-2xl border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search Header */}
        <div className="relative flex items-center px-4 border-b border-slate-200">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Rechercher une section, un client, un ticket... (Entrée pour valider)"
            className="w-full h-14 pl-3 pr-10 text-sm text-navy-900 placeholder:text-slate-400 bg-transparent focus:outline-none"
          />
          <button
            onClick={() => setCommandPaletteOpen(false)}
            className="p-1.5 text-slate-400 hover:text-navy-900 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto overscroll-contain p-2 space-y-1">
          {filteredItems.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              Aucun résultat pour &ldquo;{query}&rdquo;.
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-colors ${
                    isSelected
                      ? "bg-slate-100/90 text-navy-900"
                      : "hover:bg-slate-50 text-slate-700"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-2xs">
                      {item.icon}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold truncate">{item.title}</p>
                      {item.subtitle && (
                        <p className="text-[11px] text-slate-500 truncate">{item.subtitle}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] font-medium text-slate-400 px-1.5 py-0.5 rounded bg-slate-50 border border-slate-200">
                      {item.category}
                    </span>
                    {isSelected && <ArrowRight className="w-3.5 h-3.5 text-emerald-600" />}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer shortcuts hint */}
        <div className="px-4 py-2.5 bg-slate-50/80 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-2">
            <span>Naviguer : <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded font-mono text-[10px]">↑</kbd> <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded font-mono text-[10px]">↓</kbd></span>
            <span>Sélectionner : <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded font-mono text-[10px]">Entrée</kbd></span>
          </div>
          <div>
            <span>Fermer : <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded font-mono text-[10px]">Échap</kbd></span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;

