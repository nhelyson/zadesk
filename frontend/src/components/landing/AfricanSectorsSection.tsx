"use client";

import React from "react";
import { ShoppingBag, Stethoscope, GraduationCap, Truck, Briefcase, Package } from "lucide-react";
import { RevealOnScroll } from "./motion/RevealOnScroll";
import { TiltCard } from "./motion/TiltCard";

export const AfricanSectorsSection = () => {
  const sectors = [
    {
      title: "Commerce & Distribution",
      desc: "Suivi des commandes, gestion des retours d'articles et réclamations de livraison.",
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=500&auto=format&fit=crop&q=80",
      icon: <ShoppingBag className="w-5 h-5 text-emerald-600" />,
    },
    {
      title: "Santé & Cliniques",
      desc: "Prise de rendez-vous, suivi patient confidentiel et renseignements administratifs.",
      image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=500&auto=format&fit=crop&q=80",
      icon: <Stethoscope className="w-5 h-5 text-sky-600" />,
    },
    {
      title: "Éducation & Écoles",
      desc: "Orientation des étudiants, relations avec les parents et inscriptions simplifiées.",
      image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=500&auto=format&fit=crop&q=80",
      icon: <GraduationCap className="w-5 h-5 text-amber-600" />,
    },
    {
      title: "Logistique & Livraison",
      desc: "Mises à jour des courses, localisation des colis et notification en temps réel.",
      image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=500&auto=format&fit=crop&q=80",
      icon: <Truck className="w-5 h-5 text-indigo-600" />,
    },
    {
      title: "Services & Conseils",
      desc: "Gestion rigoureuse des dossiers clients, relances et mémoire d'entreprise.",
      image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=500&auto=format&fit=crop&q=80",
      icon: <Briefcase className="w-5 h-5 text-teal-600" />,
    },
    {
      title: "Import & Grossistes",
      desc: "Demandes de devis volumineux, disponibilité des stocks et comptes professionnels.",
      image: "https://images.unsplash.com/photo-1580674684081-7617fbf3d745?w=500&auto=format&fit=crop&q=80",
      icon: <Package className="w-5 h-5 text-purple-600" />,
    },
  ];

  return (
    <section data-nav-theme="light" className="py-20 md:py-28 bg-white relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <RevealOnScroll direction="up">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-200">
              SECTEURS D&apos;ACTIVITÉ
            </span>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-navy-900 leading-tight">
              Pensé pour les réalités des entreprises locales.
            </h2>
            <p className="text-base sm:text-lg text-slate-600">
              Quel que soit votre secteur, Zadesk apporte l&apos;organisation nécessaire pour satisfaire vos clients au quotidien.
            </p>
          </div>
        </RevealOnScroll>

        {/* 6 Sector Photo Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sectors.map((s, idx) => (
            <RevealOnScroll key={idx} delay={idx * 100} direction="up">
              <TiltCard>
                <div className="rounded-3xl overflow-hidden bg-white border border-slate-200 shadow-md hover:shadow-2xl transition-all duration-300 group flex flex-col h-full">
                  <div className="relative h-48 w-full overflow-hidden">
                    <img
                      src={s.image}
                      alt={s.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 right-3 p-2 rounded-xl bg-white/95 backdrop-blur-md shadow-sm border border-slate-200">
                      {s.icon}
                    </div>
                  </div>
                  <div className="p-6 space-y-2 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-base font-bold text-navy-900">
                        {s.title}
                      </h3>
                      <p className="text-slate-600 text-xs mt-1 leading-relaxed">
                        {s.desc}
                      </p>
                    </div>
                  </div>
                </div>
              </TiltCard>
            </RevealOnScroll>
          ))}
        </div>

      </div>
    </section>
  );
};