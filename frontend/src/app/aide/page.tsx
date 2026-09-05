import React from "react";
import Link from "next/link";
import { TopInfoBar } from "@/components/public/TopInfoBar";
import { PublicNavbar } from "@/components/public/PublicNavbar";
import { PublicFooter } from "@/components/public/PublicFooter";
import {
  HelpCircle,
  Building2,
  ShieldCheck,
  Search,
  MessageSquare,
  CheckCircle,
  ChevronDown,
} from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Centre d'aide & FAQ — Zadesk",
  description: "Foire aux questions et aide pour les utilisateurs particuliers recherchant le SAV d'une entreprise au Congo.",
};

export default function HelpPage() {
  const faqs = [
    {
      q: "Est-ce que l'utilisation de Zadesk est payante pour les particuliers ?",
      a: "Non, absolument pas. Zadesk est un service 100% gratuit pour tous les particuliers. Aucune carte bancaire, aucun paiement et aucune inscription ne vous sera jamais demandé pour accéder aux coordonnées et canaux SAV.",
    },
    {
      q: "Dois-je créer un compte pour contacter le SAV d'une entreprise ?",
      a: "Non. Le grand public n'a pas besoin de compte. Vous arrivez sur Zadesk, vous recherchez votre entreprise et vous cliquez directement sur le canal de contact de votre choix (WhatsApp, appel ou email).",
    },
    {
      q: "Est-ce que je discute avec Zadesk ou avec l'entreprise ?",
      a: "Vous discutez directement avec l'entreprise. Zadesk est un répertoire officiel intelligent. Dès que vous cliquez sur WhatsApp, votre application WhatsApp s'ouvre directement avec le service client officiel de l'entreprise sélectionnée.",
    },
    {
      q: "Comment garantissez-vous l'authenticité des numéros et canaux SAV ?",
      a: "Toutes les entreprises portant le badge vert 'SAV Vérifié' ont fait l'objet d'un contrôle direct de leurs canaux officiels. Nous mettons à jour régulièrement les fiches pour vous protéger contre les faux numéros et les tentatives d'escroquerie.",
    },
    {
      q: "Mes données personnelles sont-elles collectées lors de mes recherches ?",
      a: "Non. Vos recherches sur l'espace grand public sont anonymes. Zadesk ne stocke pas vos numéros personnels et ne transmet aucune donnée publicitaire à des tiers.",
    },
    {
      q: "Je suis une entreprise, comment puis-je référencer ou gérer mon SAV ?",
      a: "Si vous représentez une entreprise et souhaitez configurer votre fiche publique, activer l'assistance intelligente Zadesk ou intégrer vos agents sur WhatsApp, rendez-vous dans l'Espace Entreprise en cliquant sur le bouton en haut à droite.",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <TopInfoBar />
      <PublicNavbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-100/80 px-3.5 py-1.5 rounded-full uppercase tracking-wider mb-3">
            <HelpCircle className="w-4 h-4 text-emerald-600" />
            <span>Support Grand Public</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Centre d&apos;aide & Questions Fréquentes
          </h1>
          <p className="text-sm sm:text-base text-slate-600 mt-2 leading-relaxed">
            Trouvez des réponses claires sur le fonctionnement du portail Zadesk et la mise en relation avec les services après-vente.
          </p>
        </div>

        {/* FAQs list */}
        <div className="space-y-4 mb-16">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:border-emerald-200 transition-all"
            >
              <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-2 flex items-start gap-3">
                <span className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                  ?
                </span>
                <span>{faq.q}</span>
              </h2>
              <p className="text-sm text-slate-600 pl-9 leading-relaxed">
                {faq.a}
              </p>
            </div>
          ))}
        </div>

        {/* Box: Enterprise redirect */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center flex-shrink-0">
              <Building2 className="w-6 h-6 text-slate-700" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Vous êtes un professionnel ou une marque ?
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Créez votre espace SAV d&apos;entreprise, gérez vos tickets et connectez votre passerelle WhatsApp.
              </p>
            </div>
          </div>

          <Link
            href="/app"
            className="px-5 py-2.5 bg-[#0D1B3D] hover:bg-[#152a5c] text-white font-semibold text-xs rounded-xl transition-all shadow-sm flex-shrink-0"
          >
            Accès Espace Entreprise
          </Link>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
