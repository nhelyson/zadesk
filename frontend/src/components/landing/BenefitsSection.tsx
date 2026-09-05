import React from "react";
import { FolderCheck, Zap, Eye, RefreshCw, HeartHandshake } from "lucide-react";
import { SpotlightCard } from "./motion/SpotlightCard";

export const BenefitsSection = () => {
  const benefits = [
    {
      title: "Organisation",
      desc: "Chaque demande a sa place, son statut et son responsable désigné. Finie la confusion.",
      icon: <FolderCheck className="w-6 h-6 text-emerald-500" />,
    },
    {
      title: "Rapidité",
      desc: "Vos agents disposent immédiatement de l'historique et des suggestions pour répondre en quelques secondes.",
      icon: <Zap className="w-6 h-6 text-sky-500" />,
    },
    {
      title: "Visibilité",
      desc: "Les responsables savent exactement ce qui se passe dans le SAV, les points de blocage et les délais.",
      icon: <Eye className="w-6 h-6 text-amber-500" />,
    },
    {
      title: "Continuité",
      desc: "L'historique client ne dépend plus du téléphone d'un employé. La mémoire reste dans l'entreprise.",
      icon: <RefreshCw className="w-6 h-6 text-indigo-500" />,
    },
    {
      title: "Satisfaction",
      desc: "Des réponses rapides, professionnelles et fiables qui transforment vos acheteurs en clients fidèles.",
      icon: <HeartHandshake className="w-6 h-6 text-purple-500" />,
    },
  ];

  return (
    <section className="py-20 md:py-28 bg-white relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-200">
            RÉSULTATS CONCRETS
          </span>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-navy-900 leading-tight">
            Avec Zadesk, votre entreprise gagne en :
          </h2>
          <p className="text-base sm:text-lg text-slate-600">
            Des bénéfices opérationnels immédiats dès la première semaine d&apos;utilisation.
          </p>
        </div>

        {/* 5 Benefits Grid with Spotlight */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {benefits.map((b, idx) => (
            <SpotlightCard
              key={idx}
              className="p-6 flex flex-col justify-between space-y-4 group"
            >
              <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                {b.icon}
              </div>
              <div>
                <h3 className="text-lg font-black text-navy-900 mb-1">
                  {b.title}
                </h3>
                <p className="text-slate-600 text-xs leading-relaxed">
                  {b.desc}
                </p>
              </div>
            </SpotlightCard>
          ))}
        </div>

      </div>
    </section>
  );
};