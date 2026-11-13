"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  ShoppingBag,
  Stethoscope,
  GraduationCap,
  Truck,
  Briefcase,
  Package,
  Globe2,
  ChevronRight,
  MapPin,
  ArrowRight
} from "lucide-react";
import { RevealOnScroll } from "./motion/RevealOnScroll";
import { ZadeskPulseGlobe, SectorData } from "./ZadeskPulseGlobe";

export const AfricanSectorsSection: React.FC = () => {
  const [activeSector, setActiveSector] = useState(0);
  const sectorRefs = useRef<(HTMLDivElement | null)[]>([]);

  const sectors: SectorData[] = [
    {
      title: "Commerce & Distribution",
      desc: "Suivi des commandes, gestion des retours d'articles et réclamations de livraison multi-boutiques.",
      icon: "shopping-bag",
      badge: "Boutiques & Points de Vente",
      metrics: "Brazzaville • Pointe-Noire • Kinshasa • Douala",
      targetLat: -2.5,
      targetLng: 15.0,
      locations: [
        { id: "bz-1", name: "Brazzaville", lat: -4.26, lng: 15.28, color: "#10B981" },
        { id: "pn-1", name: "Pointe-Noire", lat: -4.79, lng: 11.86, color: "#10B981" },
        { id: "kin-1", name: "Kinshasa", lat: -4.44, lng: 15.26, color: "#06B6D4" },
        { id: "dla-1", name: "Douala", lat: 4.05, lng: 9.76, color: "#10B981" },
      ],
      arcs: [
        {
          from: { lat: -4.79, lng: 11.86, name: "Pointe-Noire" },
          to: { lat: -4.26, lng: 15.28, name: "Brazzaville" },
          color: "#10B981",
        },
        {
          from: { lat: 4.05, lng: 9.76, name: "Douala" },
          to: { lat: -4.26, lng: 15.28, name: "Brazzaville" },
          color: "#06B6D4",
        },
      ],
    },
    {
      title: "Santé & Cliniques",
      desc: "Prise de rendez-vous, suivi patient confidentiel et renseignements administratifs sécurisés.",
      icon: "stethoscope",
      badge: "Télémédecine & Centres Médicaux",
      metrics: "Douala • Yaoundé • Abidjan • Brazzaville",
      targetLat: 4.5,
      targetLng: 9.5,
      locations: [
        { id: "dla-sante", name: "Douala", lat: 4.05, lng: 9.76, color: "#06B6D4" },
        { id: "yde-sante", name: "Yaoundé", lat: 3.84, lng: 11.5, color: "#06B6D4" },
        { id: "abj-sante", name: "Abidjan", lat: 5.36, lng: -4.0, color: "#10B981" },
        { id: "bz-sante", name: "Brazzaville", lat: -4.26, lng: 15.28, color: "#06B6D4" },
      ],
      arcs: [
        {
          from: { lat: 4.05, lng: 9.76, name: "Douala" },
          to: { lat: 3.84, lng: 11.5, name: "Yaoundé" },
          color: "#06B6D4",
        },
        {
          from: { lat: 5.36, lng: -4.0, name: "Abidjan" },
          to: { lat: -4.26, lng: 15.28, name: "Brazzaville" },
          color: "#10B981",
        },
      ],
    },
    {
      title: "Éducation & Écoles",
      desc: "Orientation des étudiants, relations avec les parents et inscriptions dématérialisées.",
      icon: "graduation-cap",
      badge: "Campus & Relations Familles",
      metrics: "Brazzaville • Kinshasa • Abidjan • Dakar",
      targetLat: 11.0,
      targetLng: -8.0,
      locations: [
        { id: "bz-edu", name: "Brazzaville", lat: -4.26, lng: 15.28, color: "#10B981" },
        { id: "kin-edu", name: "Kinshasa", lat: -4.44, lng: 15.26, color: "#F59E0B" },
        { id: "abj-edu", name: "Abidjan", lat: 5.36, lng: -4.0, color: "#F59E0B" },
        { id: "dkr-edu", name: "Dakar", lat: 14.71, lng: -17.46, color: "#F59E0B" },
      ],
      arcs: [
        {
          from: { lat: 14.71, lng: -17.46, name: "Dakar" },
          to: { lat: 5.36, lng: -4.0, name: "Abidjan" },
          color: "#F59E0B",
        },
        {
          from: { lat: 5.36, lng: -4.0, name: "Abidjan" },
          to: { lat: -4.26, lng: 15.28, name: "Brazzaville" },
          color: "#10B981",
        },
      ],
    },
    {
      title: "Logistique & Livraison",
      desc: "Mises à jour des courses, localisation des colis et notification temps réel du fret.",
      icon: "truck",
      badge: "Traçabilité & Flottes Temps Réel",
      metrics: "Pointe-Noire • Brazzaville • Kinshasa • N'Djamena",
      targetLat: 5.0,
      targetLng: 14.5,
      locations: [
        { id: "pn-port", name: "Pointe-Noire", lat: -4.79, lng: 11.86, color: "#6366F1" },
        { id: "bz-hub", name: "Brazzaville", lat: -4.26, lng: 15.28, color: "#6366F1" },
        { id: "kin-depot", name: "Kinshasa", lat: -4.44, lng: 15.26, color: "#10B981" },
        { id: "ndj-transit", name: "N'Djamena", lat: 12.13, lng: 15.05, color: "#6366F1" },
      ],
      arcs: [
        {
          from: { lat: -4.79, lng: 11.86, name: "Pointe-Noire" },
          to: { lat: -4.26, lng: 15.28, name: "Brazzaville" },
          color: "#6366F1",
        },
        {
          from: { lat: -4.26, lng: 15.28, name: "Brazzaville" },
          to: { lat: 12.13, lng: 15.05, name: "N'Djamena" },
          color: "#6366F1",
        },
        {
          from: { lat: -4.26, lng: 15.28, name: "Brazzaville" },
          to: { lat: -4.44, lng: 15.26, name: "Kinshasa" },
          color: "#10B981",
        },
      ],
    },
    {
      title: "Services & Conseils",
      desc: "Gestion rigoureuse des dossiers clients, relances automatiques et mémoire d'entreprise.",
      icon: "briefcase",
      badge: "Cabinets, Experts & PME",
      metrics: "Abidjan • Douala • Brazzaville • Paris",
      targetLat: 28.0,
      targetLng: 8.0,
      locations: [
        { id: "abj-plat", name: "Abidjan", lat: 5.36, lng: -4.0, color: "#0D9488" },
        { id: "dla-bonanjo", name: "Douala", lat: 4.05, lng: 9.76, color: "#0D9488" },
        { id: "bz-centre", name: "Brazzaville", lat: -4.26, lng: 15.28, color: "#10B981" },
        { id: "par-hub", name: "Paris", lat: 48.85, lng: 2.35, color: "#0D9488" },
      ],
      arcs: [
        {
          from: { lat: 48.85, lng: 2.35, name: "Paris" },
          to: { lat: 5.36, lng: -4.0, name: "Abidjan" },
          color: "#0D9488",
        },
        {
          from: { lat: 4.05, lng: 9.76, name: "Douala" },
          to: { lat: -4.26, lng: 15.28, name: "Brazzaville" },
          color: "#10B981",
        },
      ],
    },
    {
      title: "Import & Grossistes",
      desc: "Demandes de devis volumineux, disponibilité des stocks et gestion des comptes pros.",
      icon: "package",
      badge: "Corridors Mondiaux & Conteneurs",
      metrics: "Guangzhou • Dubaï • Pointe-Noire • Douala • Paris",
      targetLat: 18.0,
      targetLng: 55.0,
      locations: [
        { id: "can-port", name: "Guangzhou", lat: 23.12, lng: 113.26, color: "#A855F7" },
        { id: "dxb-free", name: "Dubaï", lat: 25.2, lng: 55.27, color: "#A855F7" },
        { id: "pn-maritime", name: "Pointe-Noire", lat: -4.79, lng: 11.86, color: "#10B981" },
        { id: "dla-port", name: "Douala", lat: 4.05, lng: 9.76, color: "#A855F7" },
        { id: "par-port", name: "Paris", lat: 48.85, lng: 2.35, color: "#A855F7" },
      ],
      arcs: [
        {
          from: { lat: 23.12, lng: 113.26, name: "Guangzhou" },
          to: { lat: -4.79, lng: 11.86, name: "Pointe-Noire" },
          color: "#A855F7",
        },
        {
          from: { lat: 25.2, lng: 55.27, name: "Dubaï" },
          to: { lat: 4.05, lng: 9.76, name: "Douala" },
          color: "#10B981",
        },
        {
          from: { lat: 48.85, lng: 2.35, name: "Paris" },
          to: { lat: -4.79, lng: 11.86, name: "Pointe-Noire" },
          color: "#A855F7",
        },
      ],
    },
  ];

  // Scrollytelling Intersection Observer:
  // Detects which sector card crosses the viewport center and rotates the globe in real time
  useEffect(() => {
    const cards = sectorRefs.current;
    if (!cards || cards.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Number(entry.target.getAttribute("data-sector-index"));
            if (!isNaN(index)) {
              setActiveSector(index);
            }
          }
        });
      },
      {
        root: null,
        // Active focal trigger band across the vertical middle of the screen
        rootMargin: "-35% 0px -35% 0px",
        threshold: 0.1,
      }
    );

    cards.forEach((card) => {
      if (card) observer.observe(card);
    });

    return () => observer.disconnect();
  }, []);

  const getSectorIcon = (iconName: string, active: boolean) => {
    const className = `w-5 h-5 transition-transform duration-300 ${active ? "scale-110" : ""}`;
    switch (iconName) {
      case "shopping-bag":
        return <ShoppingBag className={`${className} text-emerald-600`} />;
      case "stethoscope":
        return <Stethoscope className={`${className} text-cyan-600`} />;
      case "graduation-cap":
        return <GraduationCap className={`${className} text-amber-600`} />;
      case "truck":
        return <Truck className={`${className} text-indigo-600`} />;
      case "briefcase":
        return <Briefcase className={`${className} text-teal-600`} />;
      case "package":
        return <Package className={`${className} text-purple-600`} />;
      default:
        return <Globe2 className={`${className} text-emerald-600`} />;
    }
  };

  return (
    <section data-nav-theme="light" className="py-20 md:py-28 bg-gradient-to-b from-white via-slate-50/70 to-white relative">
      {/* Ambient background soft light spot */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[550px] bg-radial from-emerald-500/[0.04] via-cyan-500/[0.03] to-transparent blur-3xl pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <RevealOnScroll direction="up">
          <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-20 space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200/80 shadow-2xs">
              <Globe2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Maillage Local & Corridors Commerciaux</span>
            </div>
            <h2 className="apple-display-title text-3xl sm:text-5xl font-black text-slate-900 leading-[1.12] tracking-tight">
              Pensé pour les réalités des entreprises locales.
            </h2>
            <p className="apple-body-relaxed text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
              Quel que soit votre secteur, Zadesk apporte l&apos;organisation nécessaire pour satisfaire vos clients au quotidien.
            </p>
          </div>
        </RevealOnScroll>

        {/* 3D Scrollytelling Stage:
            Sur Desktop : Le Globe est 'sticky' à droite (7 cols), les cartes défilent à gauche (5 cols).
            Sur Mobile : Le Globe est 'sticky' en haut, les cartes défilent en dessous. */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-start relative">
          
          {/* Colonne Gauche : Les Cartes des 6 Secteurs qui défilent au scroll */}
          <div className="order-2 lg:order-1 lg:col-span-5 space-y-8 sm:space-y-14 py-4 lg:py-12">
            {sectors.map((s, idx) => {
              const isActive = activeSector === idx;
              return (
                <div
                  key={idx}
                  ref={(el) => {
                    sectorRefs.current[idx] = el;
                  }}
                  data-sector-index={idx}
                  onClick={() => setActiveSector(idx)}
                  className={`p-5 sm:p-6 rounded-3xl border transition-all duration-300 cursor-pointer scroll-mt-28 ${
                    isActive
                      ? "bg-white border-emerald-500 shadow-xl shadow-slate-200/80 ring-2 ring-emerald-500/15 scale-[1.01]"
                      : "bg-white/60 hover:bg-white border-slate-200/80 hover:border-slate-300 shadow-2xs opacity-65 hover:opacity-100"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border transition-all duration-300 ${
                        isActive
                          ? "bg-emerald-50 border-emerald-200 shadow-xs scale-105"
                          : "bg-slate-100/70 border-slate-200/60"
                      }`}
                    >
                      {getSectorIcon(s.icon, isActive)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-bold text-emerald-700 tracking-wider uppercase">
                          Secteur 0{idx + 1}
                        </span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-semibold transition-colors ${
                            isActive
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {s.badge}
                        </span>
                      </div>

                      <h3
                        className={`text-base sm:text-lg font-bold tracking-tight mt-1 transition-colors ${
                          isActive ? "text-slate-950" : "text-slate-800"
                        }`}
                      >
                        {s.title}
                      </h3>

                      <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                        {s.desc}
                      </p>

                      {/* Hubs et Corridors reliés */}
                      <div
                        className={`mt-3.5 pt-3 border-t flex items-center gap-2 text-xs font-medium transition-all duration-300 ${
                          isActive
                            ? "border-emerald-100 text-emerald-800 font-semibold"
                            : "border-slate-100 text-slate-500"
                        }`}
                      >
                        <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="truncate">{s.metrics}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Colonne Droite : Le Globe 3D (Sticky sur desktop, fluide sur mobile) */}
          <div className="order-1 lg:order-2 lg:col-span-7 relative lg:sticky lg:top-24 z-20 h-[340px] sm:h-[480px] lg:h-[620px] flex items-center justify-center w-full min-w-0 bg-transparent py-2">
            <ZadeskPulseGlobe
              activeSectorIndex={activeSector}
              sectorsData={sectors}
              onSelectSector={(idx) => setActiveSector(idx)}
            />
          </div>

        </div>
      </div>
    </section>
  );
};

export default AfricanSectorsSection;