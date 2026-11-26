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
  CreditCard,
  PlusCircle,
  ShieldCheck,
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
  const { commandPaletteOpen, setCommandPaletteOpen, userRole } = useWorkspace();
  const isAgent = userRole === "AGENT";
  const canManageBilling = !isAgent && (userRole === "OWNER" || userRole === "ADMIN");
  const canManageChannels = !isAgent && (userRole === "OWNER" || userRole === "ADMIN");
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
    // Navigation commune / adaptée au rôle
    {
      id: "nav-dash",
      category: "Navigation",
      title: "Vue d'ensemble",
      subtitle: "Métriques clés et demandes en cours",
      icon: <LayoutDashboard className="w-4 h-4 text-emerald-600" />,
      path: "/app",
    },
    {
      id: "nav-conv",
      category: "Navigation",
      title: isAgent ? "Mes conversations" : "Conversations",
      subtitle: isAgent ? "Échanges SAV qui vous sont confiés" : "Demandes issues de votre page publique",
      icon: <MessageSquare className="w-4 h-4 text-sky-600" />,
      path: "/app/conversations",
    },
    {
      id: "nav-tck",
      category: "Navigation",
      title: isAgent ? "Dossiers assignés" : "Demandes clients",
      subtitle: "Continuité de service et suivi SAV",
      icon: <Ticket className="w-4 h-4 text-indigo-600" />,
      path: "/app/tickets",
    },
    {
      id: "nav-cust",
      category: "Navigation",
      title: "Clients",
      subtitle: "Fiches clients et historique unifié",
      icon: <Users className="w-4 h-4 text-slate-600" />,
      path: "/app/customers",
    },
    ...(isAgent
      ? [
          {
            id: "nav-agent-profile",
            category: "Navigation" as const,
            title: "Mon profil Agent",
            subtitle: "Disponibilité, présence et notifications",
            icon: <ShieldCheck className="w-4 h-4 text-[#0D1B3D]" />,
            path: "/app/agent/profile",
          },
        ]
      : [
          {
            id: "nav-agents",
            category: "Navigation" as const,
            title: "Équipe & accès",
            subtitle: "Présence, disponibilité et compétences SAV",
            icon: <UserCheck className="w-4 h-4 text-emerald-600" />,
            path: "/app/agents",
          },
          {
            id: "nav-agencies",
            category: "Navigation" as const,
            title: "Nos agences",
            subtitle: "Boutiques, agences physiques et comptoirs SAV",
            icon: <Building2 className="w-4 h-4 text-amber-600" />,
            path: "/app/agencies",
          },
          {
            id: "nav-kb",
            category: "Navigation" as const,
            title: "Base de connaissances",
            subtitle: "Articles FAQ, garanties et procédures",
            icon: <BookOpen className="w-4 h-4 text-teal-600" />,
            path: "/app/knowledge",
          },
          {
            id: "nav-ai",
            category: "Navigation" as const,
            title: "Automatisation",
            subtitle: "Règles d'autonomie et d'escalade",
            icon: <Cpu className="w-4 h-4 text-purple-600" />,
            path: "/app/ai",
          },
          {
            id: "nav-stats",
            category: "Navigation" as const,
            title: "Statistiques",
            subtitle: "Performances et motifs de réclamations",
            icon: <BarChart3 className="w-4 h-4 text-rose-600" />,
            path: "/app/analytics",
          },
          {
            id: "nav-settings",
            category: "Navigation" as const,
            title: "Paramètres",
            subtitle: "Coordonnées, horaires et profil",
            icon: <Settings className="w-4 h-4 text-slate-600" />,
            path: "/app/settings",
          },
        ]),
    ...(canManageChannels
      ? [
          {
            id: "nav-wa",
            category: "Navigation" as const,
            title: "Canal WhatsApp",
            subtitle: "Paramètres de synchronisation Meta",
            icon: <MessageCircle className="w-4 h-4 text-emerald-500" />,
            path: "/app/whatsapp",
          },
        ]
      : []),
    ...(canManageBilling
      ? [
          {
            id: "nav-billing",
            category: "Navigation" as const,
            title: "Abonnement & Facturation",
            subtitle: "Forfaits, quotas et renouvellement SasPay",
            icon: <CreditCard className="w-4 h-4 text-indigo-600" />,
            path: "/app/billing",
          },
        ]
      : []),

    // Actions Rapides
    ...(!isAgent
      ? [
          {
            id: "act-create-ws",
            category: "Actions Rapides" as const,
            title: "Créer un nouvel Espace de travail",
            subtitle: "Configurer une nouvelle entreprise ou filiale",
            icon: <PlusCircle className="w-4 h-4 text-emerald-600" />,
            action: () => {
              setCommandPaletteOpen(false);
              router.push("/app/onboarding");
            },
          },
        ]
      : []),
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
    if (filteredItems.length === 0) return;
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
      className="fixed inset-0 z-[10000] bg-[#0D1B3D]/45 backdrop-blur-sm flex items-start justify-center px-3 sm:px-4"
      style={{ paddingTop: 'max(2.5rem, calc(env(safe-area-inset-top, 0px) + 1rem))' }}
      onClick={() => setCommandPaletteOpen(false)}
    >
      <div
        className="bg-white w-full max-w-xl max-h-[85dvh] flex flex-col rounded-2xl border border-slate-200 shadow-2xl overflow-hidden"
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
                    <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-sm">
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

