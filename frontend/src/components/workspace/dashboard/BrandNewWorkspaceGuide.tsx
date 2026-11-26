'use client';

import React from 'react';
import Link from 'next/link';
import { ExternalLink, ArrowRight, BookOpen } from 'lucide-react';

interface BrandNewWorkspaceGuideProps {
  workspaceSlug?: string;
}

export function BrandNewWorkspaceGuide({ workspaceSlug }: BrandNewWorkspaceGuideProps) {
  return (
    <section className="rounded-xl bg-white p-5 sm:p-6 border border-[#E5E4DF] space-y-4">
      <div>
        <h2 className="text-base font-bold text-[#0D1B3D]">
          Démarrer votre espace Zalisk
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Trois actions simples pour ouvrir votre accueil client.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {workspaceSlug && (
          <Link
            href={`/entreprises/${workspaceSlug}`}
            target="_blank"
            className="p-3.5 rounded-lg bg-[#FAFAF8] hover:bg-[#F4F3EF] border border-[#E5E4DF] text-left transition-colors block"
          >
            <div className="flex items-center justify-between text-[#0D1B3D] font-semibold text-xs">
              <span>01 · Guichet public</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </div>
            <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">
              Partagez ce lien à vos clients pour recevoir leurs messages.
            </p>
          </Link>
        )}

        <Link
          href="/app/agents"
          className="p-3.5 rounded-lg bg-[#FAFAF8] hover:bg-[#F4F3EF] border border-[#E5E4DF] text-left transition-colors block"
        >
          <div className="flex items-center justify-between text-[#0D1B3D] font-semibold text-xs">
            <span>02 · Inviter l&apos;équipe</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">
            Ajoutez vos conseillers SAV pour répartir les demandes.
          </p>
        </Link>

        <Link
          href="/app/knowledge"
          className="p-3.5 rounded-lg bg-[#FAFAF8] hover:bg-[#F4F3EF] border border-[#E5E4DF] text-left transition-colors block"
        >
          <div className="flex items-center justify-between text-[#0D1B3D] font-semibold text-xs">
            <span>03 · Base FAQ</span>
            <BookOpen className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">
            Consignez vos conditions de retour, garanties et procédures.
          </p>
        </Link>
      </div>
    </section>
  );
}
