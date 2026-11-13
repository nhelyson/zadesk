import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Configuration & Déploiement de votre SAV — Zadesk",
  description:
    "Parcours officiel de création, organisation et personnalisation du service après-vente Zadesk pour entreprises.",
};

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#F7F8FA] text-[#172033] flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {children}
    </div>
  );
}

