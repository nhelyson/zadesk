import React from "react";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { fetchCompanyBySlug } from "@/lib/publicApi";
import { CompanyConversationalView } from "@/components/public/CompanyConversationalView";
import { resolveCompanyBrandPalette, getBrandCssVariables } from "@/lib/brandTheme";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const company = await fetchCompanyBySlug(slug);

  if (!company) {
    return {
      title: "Entreprise introuvable — Zadesk",
    };
  }

  return {
    title: `SAV Officiel ${company.name} — Assistance Conversationnelle & Support`,
    description: `Posez directement votre question au service après-vente officiel de ${company.name}. Assistance interactive en ligne, coordonnées certifiées et prise en charge rapide sans inscription.`,
    openGraph: {
      title: `SAV Officiel ${company.name} — Assistance Conversationnelle Zadesk`,
      description:
        company.description ||
        `Contactez directement le service après-vente de ${company.name} sur Zadesk.`,
      images: company.logoUrl ? [company.logoUrl] : company.coverUrl ? [company.coverUrl] : [],
    },
  };
}

export default async function CompanyProfilePage({ params }: PageProps) {
  const { slug } = await params;
  const company = await fetchCompanyBySlug(slug);

  if (!company) {
    notFound();
  }

  // Resolve adaptive brand palette (e.g. custom palette, Airtel Red, MTN Gold, EU Blue, etc.)
  const brandPalette = resolveCompanyBrandPalette({
    slug: company.slug,
    name: company.name,
    category: company.category,
    brandPalette: (company as any).brandPalette,
    brandColor: (company as any).brandColor,
  });

  const brandStyles = getBrandCssVariables(brandPalette);

  return (
    <div
      style={brandStyles}
      className="h-screen max-h-screen flex flex-col bg-[#F5F5F7] text-[#1D1D1F] overflow-hidden antialiased"
    >
      {/* 1. Main Full-Screen Conversational Experience (with integrated SAV header) */}
      <CompanyConversationalView company={company} />
    </div>
  );
}
