import React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Metadata } from "next";
import { fetchCompanyBySlug } from "@/lib/publicApi";
import { TopInfoBar } from "@/components/public/TopInfoBar";
import { PublicNavbar } from "@/components/public/PublicNavbar";
import { PublicFooter } from "@/components/public/PublicFooter";
import {
  CheckCircle,
  MessageSquare,
  Phone,
  Mail,
  Globe,
  MapPin,
  Clock,
  ChevronRight,
  ShieldCheck,
  Building,
  HelpCircle,
  ExternalLink,
  ArrowRight,
  Share2,
} from "lucide-react";

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
    title: `SAV ${company.name} Congo — Contact WhatsApp, Téléphone & Assistance`,
    description: `Consultez les moyens officiels et vérifiés pour contacter le service après-vente de ${company.name} en République du Congo (WhatsApp, téléphone, email).`,
    openGraph: {
      title: `SAV ${company.name} Congo — Zadesk`,
      description: company.description || `Trouvez rapidement le SAV de ${company.name} au Congo.`,
      images: company.coverUrl ? [company.coverUrl] : [],
    },
  };
}

export default async function CompanyProfilePage({ params }: PageProps) {
  const { slug } = await params;
  const company = await fetchCompanyBySlug(slug);

  if (!company) {
    notFound();
  }

  // Format clean phone for WhatsApp
  const cleanWhatsAppNumber = company.supportWhatsApp?.replace(/[^0-9]/g, "") || "";
  const defaultWhatsAppMessage = encodeURIComponent(
    `Bonjour SAV ${company.name}, je vous contacte via le portail Zadesk pour une demande d'assistance.`
  );
  const whatsAppUrl = cleanWhatsAppNumber
    ? `https://wa.me/${cleanWhatsAppNumber}?text=${defaultWhatsAppMessage}`
    : null;

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <TopInfoBar />
      <PublicNavbar />

      <main className="flex-1 pb-16">
        {/* Top Cover Banner */}
        <div className="relative h-48 sm:h-64 md:h-72 w-full bg-slate-900 overflow-hidden">
          {company.coverUrl ? (
            <img
              src={company.coverUrl}
              alt={company.name}
              className="w-full h-full object-cover opacity-60"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-[#0D1B3D] to-slate-800" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

          {/* Breadcrumb over banner */}
          <div className="absolute top-4 left-0 right-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex items-center gap-1.5 text-xs text-white/80 font-medium">
              <Link href="/" className="hover:text-white transition-colors">
                Accueil
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-white/40" />
              <Link href="/entreprises" className="hover:text-white transition-colors">
                Entreprises
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-white/40" />
              <span className="text-white truncate">{company.name}</span>
            </nav>
          </div>
        </div>

        {/* Profile Container */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 sm:-mt-24 relative z-10">
          {/* Header Card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm mb-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                {/* Logo */}
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white border-2 border-slate-100 shadow-md flex items-center justify-center font-black text-2xl text-slate-800 overflow-hidden flex-shrink-0">
                  {company.logoUrl ? (
                    <img
                      src={company.logoUrl}
                      alt={company.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    company.name.charAt(0)
                  )}
                </div>

                {/* Name & Badges */}
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                      {company.name}
                    </h1>
                    {company.verified && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-500 fill-emerald-100" />
                        <span>SAV Vérifié</span>
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-slate-600">
                    <span className="font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
                      {company.category || "Entreprise"}
                    </span>
                    {company.city && (
                      <span className="flex items-center gap-1 text-slate-500">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{company.city}, {company.country || "Congo"}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Status Badge */}
              <div className="flex items-center gap-2 self-stretch sm:self-auto justify-between sm:justify-start pt-4 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Canaux SAV Actifs</span>
                </span>
              </div>
            </div>
          </div>

          {/* Main Grid: Contact Channels (Left/Top) + Information & About (Right/Bottom) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Col (2/3): Contact Channels & Help Topics */}
            <div className="lg:col-span-2 space-y-8">
              {/* PRIMARY CONTACT SECTION */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                      <span>Contacter le Service Client & SAV</span>
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                      Choisissez un canal de communication officiel pour échanger directement avec l&apos;entreprise.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* WHATSAPP: FEATURED CHANNEL */}
                  {whatsAppUrl ? (
                    <div className="bg-gradient-to-r from-emerald-50 to-emerald-100/50 rounded-2xl border-2 border-emerald-500/40 p-5 sm:p-6 transition-all hover:border-emerald-500 hover:shadow-md">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                            <MessageSquare className="w-6 h-6" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-bold text-slate-900 text-base sm:text-lg">
                                WhatsApp Officiel
                              </h3>
                              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-200/80 px-2 py-0.5 rounded-full">
                                Recommandé
                              </span>
                            </div>
                            <p className="text-xs sm:text-sm text-slate-600 mt-1">
                              Échangez instantanément par messagerie avec l&apos;assistance {company.name}.
                            </p>
                            <p className="text-xs font-mono font-semibold text-emerald-800 mt-2">
                              {company.supportWhatsApp}
                            </p>
                          </div>
                        </div>

                        <a
                          href={whatsAppUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg transition-all flex-shrink-0"
                        >
                          <MessageSquare className="w-4 h-4" />
                          <span>Discuter sur WhatsApp</span>
                        </a>
                      </div>
                    </div>
                  ) : null}

                  {/* PHONE CHANNEL */}
                  {company.supportPhone && (
                    <div className="bg-slate-50 hover:bg-slate-100/80 rounded-2xl border border-slate-200 p-5 sm:p-6 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                          <Phone className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900 text-base">
                            Assistance Téléphonique
                          </h3>
                          <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                            Appel direct vers le centre d&apos;appels du service client.
                          </p>
                          <p className="text-xs font-mono font-semibold text-slate-800 mt-2">
                            {company.supportPhone}
                          </p>
                        </div>
                      </div>

                      <a
                        href={`tel:${company.supportPhone.replace(/\s+/g, "")}`}
                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white hover:bg-slate-200 border border-slate-300 text-slate-800 font-semibold text-sm rounded-xl transition-all shadow-2xs flex-shrink-0"
                      >
                        <Phone className="w-4 h-4 text-blue-600" />
                        <span>Appeler le SAV</span>
                      </a>
                    </div>
                  )}

                  {/* EMAIL CHANNEL */}
                  {company.supportEmail && (
                    <div className="bg-slate-50 hover:bg-slate-100/80 rounded-2xl border border-slate-200 p-5 sm:p-6 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                          <Mail className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900 text-base">
                            Support par Email
                          </h3>
                          <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                            Pour vos réclamations formelles, dossiers et pièces justificatives.
                          </p>
                          <p className="text-xs font-mono font-semibold text-slate-800 mt-2 truncate max-w-xs">
                            {company.supportEmail}
                          </p>
                        </div>
                      </div>

                      <a
                        href={`mailto:${company.supportEmail}?subject=${encodeURIComponent("Demande de support - " + company.name)}`}
                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white hover:bg-slate-200 border border-slate-300 text-slate-800 font-semibold text-sm rounded-xl transition-all shadow-2xs flex-shrink-0"
                      >
                        <Mail className="w-4 h-4 text-indigo-600" />
                        <span>Envoyer un email</span>
                      </a>
                    </div>
                  )}

                  {/* WEBSITE CHANNEL */}
                  {company.website && (
                    <div className="bg-slate-50 hover:bg-slate-100/80 rounded-2xl border border-slate-200 p-5 sm:p-6 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-slate-700 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                          <Globe className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900 text-base">
                            Site Web Officiel
                          </h3>
                          <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                            Portail en ligne, espace client web et documentation.
                          </p>
                          <p className="text-xs font-mono text-slate-500 mt-2 truncate max-w-xs">
                            {company.website}
                          </p>
                        </div>
                      </div>

                      <a
                        href={company.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white hover:bg-slate-200 border border-slate-300 text-slate-800 font-semibold text-sm rounded-xl transition-all shadow-2xs flex-shrink-0"
                      >
                        <ExternalLink className="w-4 h-4 text-slate-600" />
                        <span>Visiter le site</span>
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* SUPPORT TOPICS / REASONS */}
              {Array.isArray(company.supportCategories) && company.supportCategories.length > 0 && (
                <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <HelpCircle className="w-5 h-5 text-emerald-600" />
                    <h2 className="text-lg font-bold text-slate-900">
                      Motifs fréquents d&apos;assistance
                    </h2>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 mb-6">
                    Cliquez sur un motif pour préparer votre message WhatsApp d&apos;assistance :
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {company.supportCategories.map((topic, i) => {
                      const topicWhatsAppUrl = cleanWhatsAppNumber
                        ? `https://wa.me/${cleanWhatsAppNumber}?text=${encodeURIComponent(
                            `Bonjour SAV ${company.name}, je vous contacte concernant : "${topic}".`
                          )}`
                        : null;

                      return topicWhatsAppUrl ? (
                        <a
                          key={i}
                          href={topicWhatsAppUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-3.5 bg-slate-50 hover:bg-emerald-50/70 border border-slate-200 hover:border-emerald-300 rounded-xl transition-all group flex items-center justify-between"
                        >
                          <span className="text-xs font-medium text-slate-800 group-hover:text-emerald-900">
                            {topic}
                          </span>
                          <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                        </a>
                      ) : (
                        <div
                          key={i}
                          className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800"
                        >
                          {topic}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Right Col (1/3): Practical Information & Trust Shield */}
            <div className="space-y-6">
              {/* About Card */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
                <h2 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <Building className="w-4 h-4 text-emerald-600" />
                  <span>À propos</span>
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {company.description || "Entreprise et service client opérant en République du Congo."}
                </p>
              </div>

              {/* Practical Details */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
                <h2 className="text-base font-bold text-slate-900 mb-2">
                  Informations pratiques
                </h2>

                {company.openingHours && (
                  <div className="flex items-start gap-3 text-xs sm:text-sm">
                    <Clock className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-slate-800">Horaires d&apos;ouverture</p>
                      <p className="text-slate-600 text-xs mt-0.5 leading-relaxed">
                        {company.openingHours}
                      </p>
                    </div>
                  </div>
                )}

                {company.address && (
                  <div className="flex items-start gap-3 text-xs sm:text-sm pt-3 border-t border-slate-100">
                    <MapPin className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-slate-800">Siège / Adresse</p>
                      <p className="text-slate-600 text-xs mt-0.5 leading-relaxed">
                        {company.address}
                        {company.city && `, ${company.city}`}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Security & Official Guarantee Notice */}
              <div className="bg-emerald-50/70 rounded-3xl border border-emerald-200 p-6">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-emerald-950 text-xs sm:text-sm">
                      Garantie Zadesk
                    </h3>
                    <p className="text-xs text-emerald-800 mt-1 leading-relaxed">
                      Ces informations sont certifiées conformes aux canaux d&apos;assistance officiels de {company.name}. Vous conversez directement avec l&apos;entreprise sur le canal choisi.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
