import React from "react";
import { Search, Building, MessageSquare, ArrowRight, ShieldCheck } from "lucide-react";

export function HowItWorksPublic() {
  const steps = [
    {
      number: "01",
      title: "Recherchez",
      description: "Tapez le nom de l'entreprise, de la marque ou du service dont vous cherchez l'assistance.",
      icon: <Search className="w-6 h-6 text-emerald-600" />,
      tag: "Recherche instantanée",
    },
    {
      number: "02",
      title: "Consultez",
      description: "Accédez à sa fiche publique vérifiée, ses horaires d'ouverture et ses informations pratiques.",
      icon: <Building className="w-6 h-6 text-blue-600" />,
      tag: "Données certifiées",
    },
    {
      number: "03",
      title: "Contactez",
      description: "Choisissez votre canal de prédilection (WhatsApp officiel, appel direct, email) et échangez directement avec le SAV.",
      icon: <MessageSquare className="w-6 h-6 text-indigo-600" />,
      tag: "Liaison directe",
    },
  ];

  return (
    <section className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-100/70 px-3 py-1 rounded-full uppercase tracking-wider mb-3">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Simple, Gratuit & Sans Inscription</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Comment fonctionne Zadesk ?
        </h2>
        <p className="text-sm sm:text-base text-slate-600 mt-3 leading-relaxed">
          Zadesk est le point d&apos;accès central qui vous met en relation directe avec le service client officiel des entreprises.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 relative">
        {steps.map((step, idx) => (
          <div
            key={step.number}
            className="relative bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 flex flex-col justify-between shadow-sm hover:border-emerald-300 hover:shadow-md transition-all group"
          >
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 group-hover:bg-emerald-50 flex items-center justify-center transition-colors">
                  {step.icon}
                </div>
                <span className="text-2xl font-black text-slate-200 group-hover:text-emerald-300 transition-colors">
                  {step.number}
                </span>
              </div>

              <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">
                {step.tag}
              </span>
              <h3 className="text-xl font-bold text-slate-900 mt-1 mb-2">
                {step.title}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {step.description}
              </p>
            </div>

            {idx < 2 && (
              <div className="hidden md:block absolute -right-4 top-1/2 -translate-y-1/2 z-10 text-slate-300">
                <ArrowRight className="w-6 h-6" />
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
