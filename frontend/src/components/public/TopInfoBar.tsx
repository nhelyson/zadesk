"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, ChevronRight } from "lucide-react";
import Link from "next/link";

const ANNOUNCEMENTS = [
  { text: "🇨🇬 Le SAV des entreprises congolaises au même endroit", link: "/entreprises" },
  { text: "🔎 Trouvez rapidement le service après-vente d'une entreprise", link: "/comment-ca-marche" },
  { text: "💬 Retrouvez les différents canaux officiels (WhatsApp, Téléphone, Email)", link: "/entreprises" },
  { text: "⚡ Accédez instantanément au SAV dont vous avez besoin sans inscription", link: "/aide" },
];

export function TopInfoBar() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % ANNOUNCEMENTS.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const current = ANNOUNCEMENTS[currentIndex];

  return (
    <div className="bg-[#0D1B3D] text-white/90 text-xs font-medium py-2 px-4 border-b border-white/10 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2 overflow-hidden">
          <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
          <Link
            href={current.link}
            className="flex items-center gap-1.5 hover:text-emerald-300 transition-colors truncate"
          >
            <span>{current.text}</span>
            <ChevronRight className="w-3.5 h-3.5 opacity-60 flex-shrink-0" />
          </Link>
        </div>
        <div className="hidden md:flex items-center gap-4 text-slate-300 flex-shrink-0">
          <Link href="/entreprises" className="hover:text-white transition-colors">
            Annuaire public
          </Link>
          <span className="text-white/20">•</span>
          <Link href="/comment-ca-marche" className="hover:text-white transition-colors">
            Comment ça marche
          </Link>
          <span className="text-white/20">•</span>
          <Link href="/app" className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors">
            Accès Professionnel
          </Link>
        </div>
      </div>
    </div>
  );
}
