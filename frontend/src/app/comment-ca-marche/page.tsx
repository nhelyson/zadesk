import React from "react";
import Link from "next/link";
import { TopInfoBar } from "@/components/public/TopInfoBar";
import { PublicNavbar } from "@/components/public/PublicNavbar";
import { PublicFooter } from "@/components/public/PublicFooter";
import {
  Search,
  Building2,
  MessageSquare,
  ShieldCheck,
  Zap,
  Phone,
  CheckCircle,
  ArrowRight,
  HelpCircle,
  Clock,
} from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Comment ça marche — Zadesk Grand Public",
  description: "Découvrez comment Zadesk simplifie la recherche et la prise de contact avec les services après-vente des entreprises au Congo.",
};

export default function HowItWorksPage() {
  const steps = [
    {
      num: "01",
      title: "Recherchez l'entreprise de votre choix",
      desc: "Saisissez simplement le nom commercial, la marque ou le secteur d'activité (télécoms, banque, électricité, abonnement...) dans la barre de recherche intelligente Zadesk.",
      badge: "Recherche en direct",
      icon: <Search className="w-6 h-6 text-emerald-600" />,
    },
    {
      num: "02",
      title: "Consultez les informations certifiées",
      desc: "Accédez à la fiche publique de l'entreprise : découvrez ses horaires de service client, son adresse physique, ses motifs d'assistance fréquents et son statut de vérification.",
      badge: "Données officielles",
      icon: <Building2 className="w-6 h-6 text-blue-600" />,
    },
    {
      num: "03",
      title: "Choisissez votre canal de contact favori",
      desc: "Cliquez sur WhatsApp pour lancer directement une discussion pré-remplie, appelez le numéro vert ou envoyez un email formel. Vous conversez directement avec le SAV de l'entreprise.",
      badge: "WhatsApp, Appel, Email",
      icon: <MessageSquare className="w-6 h-6 text-indigo-600" />,
    },
  ];

  const advantages = [
    {
      icon: <ShieldCheck className="w-5 h-5 text-emerald-600" />,
      title: "Aucune inscription requise",
      desc: "Pas de mot de passe, pas d'email, pas de formulaire. Le service est 100% libre et gratuit pour tous les particuliers.",
    },
    {
      icon: <CheckCircle className="w-5 h-5 text-emerald-600" />,
      title: "Numéros certifiés officiels",
      desc: "Évitez les arnaques et faux numéros. Zadesk vérifie les coordonnées directement auprès des entreprises partenaires.",
    },
    {
      icon: <Zap className="w-5 h-5 text-emerald-600" />,
      title: "Gain de temps immédiat",
      desc: "Finies les recherches interminables sur les réseaux sociaux. Tous les SAV du Congo sont regroupés sur un seul portail.",
    },
    {
      icon: <Clock className="w-5 h-5 text-emerald-600" />,
      title: "Horaires et disponibilités en direct",
      desc: "Sachez immédiatement si le service client est ouvert avant d'appeler ou de vous déplacer.",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <TopInfoBar />
      <PublicNavbar />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold text-emerald-800 bg-emerald-100/80 px-3.5 py-1.5 rounded-full uppercase tracking-wider">
            Guide d&apos;utilisation
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight mt-4 mb-4">
            Comment fonctionne Zadesk ?
          </h1>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
            Zadesk est la passerelle nationale qui vous connecte en 1 clic au service après-vente officiel des entreprises en République du Congo.
          </p>
        </div>

        {/* 3 Steps */}
        <div className="space-y-6 sm:space-y-8 mb-16">
          {steps.map((step) => (
            <div
              key={step.num}
              className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center gap-6 shadow-sm hover:border-emerald-300 transition-all"
            >
              <div className="flex items-center gap-4 flex-shrink-0">
                <span className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-xl sm:text-2xl font-black text-emerald-700">
                  {step.num}
                </span>
                <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center">
                  {step.icon}
                </div>
              </div>

              <div className="flex-1">
                <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                  {step.badge}
                </span>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 mt-0.5 mb-1.5">
                  {step.title}
                </h2>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Value Pillars */}
        <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-10 mb-16 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-900 text-center mb-8">
            Pourquoi utiliser Zadesk pour joindre un SAV ?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {advantages.map((adv, i) => (
              <div key={i} className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="p-2 bg-white rounded-xl shadow-2xs border border-slate-200 flex-shrink-0">
                  {adv.icon}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm mb-1">{adv.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{adv.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA to Search */}
        <div className="bg-[#0D1B3D] text-white rounded-3xl p-8 sm:p-10 text-center shadow-lg">
          <h2 className="text-2xl sm:text-3xl font-black mb-3">
            Prêt à trouver votre service client ?
          </h2>
          <p className="text-sm text-slate-300 max-w-xl mx-auto mb-6">
            Recherchez votre opérateur, banque, distributeur ou service public parmi les entreprises référencées au Congo.
          </p>
          <Link
            href="/entreprises"
            className="inline-flex items-center gap-2 px-6 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-sm rounded-xl transition-all shadow-md"
          >
            <Search className="w-4 h-4" />
            <span>Explorer l&apos;annuaire des entreprises</span>
          </Link>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
