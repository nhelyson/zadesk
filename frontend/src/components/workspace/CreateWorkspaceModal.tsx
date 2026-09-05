"use client";

import React, { useState } from "react";
import { X, Building2, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useWorkspace } from "./WorkspaceContext";

export const CreateWorkspaceModal = () => {
  const { createModalOpen, setCreateModalOpen, createWorkspace } = useWorkspace();
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!createModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Le nom de l'entreprise est obligatoire.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await createWorkspace(name.trim());
      setCreateModalOpen(false);
      setName("");
    } catch (err: any) {
      setError(err.message || "Impossible de créer l'espace.");
    } finally {
      setIsLoading(false);
    }
  };

  const previewSlug = name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 50);

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[10001] bg-navy-950/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
    >
      <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-5 animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#0D1B3D] text-white flex items-center justify-center shadow-sm">
              <Building2 className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-navy-900">
                Créer un Espace de travail
              </h3>
              <p className="text-xs text-slate-500">Ajouter une nouvelle entreprise ou filiale SAV</p>
            </div>
          </div>
          <button
            onClick={() => setCreateModalOpen(false)}
            className="p-1.5 text-slate-400 hover:text-navy-900 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nom de l'entreprise ou du service"
            placeholder="Ex: TotalEnergies Congo, Pharmacie de la Paix"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (error) setError(null);
            }}
            error={error || undefined}
            autoFocus
          />

          {name && (
            <div className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
              <span>Identifiant URL : </span>
              <code className="text-emerald-700 font-mono font-semibold">
                app.zadesk.com/{previewSlug || "nom-espace"}
              </code>
            </div>
          )}

          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-[11px]">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Vous serez automatiquement configuré comme <strong>Propriétaire (OWNER)</strong> avec tous les accès.</span>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2.5">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setCreateModalOpen(false)}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              variant="gradient"
              size="sm"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            >
              Créer l&apos;espace
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateWorkspaceModal;

