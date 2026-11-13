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
        { id: "kin-edu", name: "Kinshasa", lat: -4.44, lng: 15.26, color: "#06B6D4" },
        { id: "abj-edu", name: "Abidjan", lat: 5.36, lng: -4.0, color: "#10B981" },
        { id: "dkr-edu", name: "Dakar", lat: 14.71, lng: -17.46, color: "#06B6D4" },
      ],
      arcs: [
        {
          from: { lat: 14.71, lng: -17.46, name: "Dakar" },
          to: { lat: 5.36, lng: -4.0, name: "Abidjan" },
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
  // Detects which sector item crosses viewport center and rotates the globe in real time
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
        rootMargin: "-35% 0px -35% 0px",
        threshold: 0.1,
      }
    );

    cards.forEach((card) => {
      if (card) observer.observe(card);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <section id="secteurs" data-nav-theme="light" className="scroll-mt-16 py-20 md:py-28 bg-white relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header — Pure Editorial Typography without Artificial Badges */}
        <RevealOnScroll direction="up">
          <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-20 space-y-4">
            <h2 className="apple-display-title text-3xl sm:text-5xl font-black text-slate-900 leading-[1.12] tracking-tight">
              Pensé pour les réalités des entreprises locales.
            </h2>
            <p className="apple-body-relaxed text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
              Quel que soit votre secteur, Zadesk apporte l&apos;organisation nécessaire pour satisfaire vos clients au quotidien.
            </p>
          </div>
        </RevealOnScroll>

        {/* 3D Scrollytelling Stage:
            Desktop: The 3D Globe is sticky on the right (7 cols), editorial chapters scroll on the left (5 cols).
            Mobile: Globe is sticky top, chapters scroll beneath. */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-start relative">
          
          {/* Left Column : Editorial Sectors Chapters */}
          <div className="order-2 lg:order-1 lg:col-span-5 space-y-6 sm:space-y-8 py-4 lg:py-8">
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
                  className={`group relative p-6 sm:p-7 rounded-2xl border transition-all duration-300 cursor-pointer scroll-mt-28 ${
                    isActive
                      ? "bg-slate-50/80 border-slate-300/90 shadow-sm"
                      : "bg-transparent border-transparent hover:border-slate-200/60 opacity-60 hover:opacity-100"
                  }`}
                >
                  {/* Active Emerald Left Accent Line */}
                  <div
                    className={`absolute left-0 top-6 bottom-6 w-1 rounded-r-full transition-all duration-300 ${
                      isActive ? "bg-emerald-500 opacity-100" : "bg-transparent opacity-0"
                    }`}
                  />

                  <div className="space-y-3">
                    {/* Chapter Number & Sub-Category */}
                    <div className="flex items-center justify-between gap-3">
                      <span
                        className={`text-2xl sm:text-3xl font-light font-mono transition-colors duration-300 ${
                          isActive ? "text-emerald-600 font-normal" : "text-slate-300"
                        }`}
                      >
                        0{idx + 1}
                      </span>
                      <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                        {s.badge}
                      </span>
                    </div>

                    {/* Sector Title */}
                    <h3
                      className={`text-lg sm:text-xl font-bold tracking-tight transition-colors duration-200 ${
                        isActive ? "text-slate-950" : "text-slate-800"
                      }`}
                    >
                      {s.title}
                    </h3>

                    {/* Description */}
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {s.desc}
                    </p>

                    {/* Associated Hubs & Corridors */}
                    <div className="pt-2 flex items-center gap-2 text-xs font-medium text-slate-500">
                      <span
                        className={`w-1.5 h-1.5 rounded-full shrink-0 transition-colors ${
                          isActive ? "bg-emerald-500" : "bg-slate-300"
                        }`}
                      />
                      <span className="truncate tracking-wide">{s.metrics}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column : 3D Planetary Globe (Sticky on desktop) */}
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
