"use client";

import React, { useState, useRef, useEffect } from "react";
import * as THREE from "three";
import gsap from "gsap";
import { 
  MessageSquare, 
  Building2, 
  ShieldCheck, 
  ChevronDown, 
  CheckCircle2, 
  Sparkles, 
  Send, 
  QrCode, 
  Lock,
  ArrowRight
} from "lucide-react";

interface DrawerItem {
  id: string;
  number: string;
  title: string;
  tagline: string;
  themeColor: string;
  accentBg: string;
  borderAccent: string;
  hexColor: number;
  icon: React.ReactNode;
  content: {
    badge: string;
    headline: string;
    description: string;
    visualPreview: React.ReactNode;
    keyPoints: string[];
    summaryMetric: string;
  };
}

export const InteractiveChannelDrawers = () => {
  // Start with the first drawer open (WhatsApp)
  const [openDrawer, setOpenDrawer] = useState<number>(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const drawersContainerRef = useRef<HTMLDivElement | null>(null);
  const particlesRef = useRef<THREE.Points | null>(null);

  const drawers: DrawerItem[] = [
    {
      id: "whatsapp",
      number: "01",
      title: "Canal WhatsApp Direct",
      tagline: "Vos clients écrivent depuis leur application habituelle sans rien installer",
      themeColor: "text-emerald-600",
      accentBg: "bg-emerald-50",
      borderAccent: "border-emerald-200",
      hexColor: 0x10b981,
      icon: <MessageSquare className="w-5 h-5 text-emerald-600" />,
      content: {
        badge: "Messagerie Instantanée",
        headline: "Toutes les demandes WhatsApp réunies dans 1 boîte commune",
        description: "Quand un client vous écrit sur WhatsApp, son message ne reste plus prisonnier sur le téléphone privé d'un seul employé. Toute votre équipe voit la demande et peut y répondre immédiatement.",
        keyPoints: [
          "Zéro application à télécharger pour le client : il reste dans son WhatsApp habituel.",
          "Vos agents répondent depuis leur ordinateur au bureau ou leur smartphone.",
          "Historique partagé : chaque collaborateur sait exactement ce qui a été convenu."
        ],
        summaryMetric: "Temps moyen de prise en charge < 3 minutes",
        visualPreview: (
          <div className="rounded-2xl bg-slate-900 text-white p-4.5 sm:p-5 shadow-lg border border-slate-800 space-y-3.5 text-xs">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-bold text-slate-200">WhatsApp Entreprise · Live</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">Dossier #SAV-420</span>
            </div>

            {/* Simulated WhatsApp Bubbles */}
            <div className="space-y-2.5 pt-1">
              <div className="bg-slate-800/90 text-slate-200 p-3 rounded-2xl rounded-tl-xs max-w-[88%] border border-slate-700/60">
                <p className="leading-relaxed">
                  « Bonjour, ma box 4G achetée hier à Pointe-Noire ne capte plus de réseau ce matin. »
                </p>
                <span className="text-[9px] text-slate-400 block mt-1">Client · 09:42</span>
              </div>

              <div className="bg-emerald-600 text-white p-3 rounded-2xl rounded-tr-xs max-w-[88%] ml-auto shadow-xs">
                <p className="leading-relaxed font-medium">
                  « Bonjour M. Mavoungou ! Votre dossier est ouvert. Notre équipe technique vérifie l&apos;activation de votre carte SIM en direct. »
                </p>
                <span className="text-[9px] text-emerald-200 block mt-1 text-right">Agent Zadesk · 09:44</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-emerald-400 font-semibold">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Dossier synchronisé avec le guichet
              </span>
              <span className="text-slate-400 text-[10px]">Statut : En cours</span>
            </div>
          </div>
        )
      }
    },
    {
      id: "guichet",
      number: "02",
      title: "Le Guichet & Comptoir d'Agence",
      tagline: "Le client se présente en agence ou boutique : son dossier est déjà là",
      themeColor: "text-sky-600",
      accentBg: "bg-sky-50",
      borderAccent: "border-sky-200",
      hexColor: 0x0284c7,
      icon: <Building2 className="w-5 h-5 text-sky-600" />,
      content: {
        badge: "Accueil Physique",
        headline: "La continuité immédiate du message jusqu'au comptoir",
        description: "En Afrique, les clients échangent souvent d'abord sur WhatsApp avant de passer en boutique ou au service après-vente. Avec Zadesk, l'agent d'accueil retrouve immédiatement l'historique sans faire tout répéter au client.",
        keyPoints: [
          "L'agent tape simplement le numéro de téléphone ou scanne le QR code du ticket.",
          "Les photos du problème et les promesses déjà faites s'affichent en 2 secondes.",
          "Zéro frustration : le client se sent reconnu et pris en charge avec professionnalisme."
        ],
        summaryMetric: "Dossier retrouvé en 2 secondes au comptoir",
        visualPreview: (
          <div className="rounded-2xl bg-slate-900 text-white p-4.5 sm:p-5 shadow-lg border border-slate-800 space-y-3.5 text-xs">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
                <span className="font-bold text-slate-200">Terminal Guichet · Agence</span>
              </div>
              <span className="text-[10px] text-sky-300 font-mono">Guichet n°02</span>
            </div>

            {/* Counter Screen Mockup */}
            <div className="space-y-3 bg-slate-800/80 p-3.5 rounded-xl border border-slate-700/80">
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="font-bold text-white text-xs">Mavoungou Jean-Luc</h5>
                  <p className="text-[11px] text-slate-400">+242 06 612 34 56 · Pointe-Noire</p>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-400/30 text-[10px] font-semibold">
                  Client reconnu
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                  Discussion WhatsApp associée
                </span>
                <p className="text-[11px] text-slate-300 leading-snug">
                  Signalement ce matin à 09h42 : routeur sans signal. Ticket #SAV-420 en cours de traitement.
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-sky-400 font-semibold">
              <span className="flex items-center gap-1.5">
                <QrCode className="w-3.5 h-3.5" />
                Bon d&apos;intervention édité
              </span>
              <span className="text-slate-400 text-[10px]">Immédiat</span>
            </div>
          </div>
        )
      }
    },
    {
      id: "memoire",
      number: "03",
      title: "La Mémoire d'Entreprise Sécurisée",
      tagline: "Vos contacts, engagements et historiques restent la propriété de l'entreprise",
      themeColor: "text-amber-600",
      accentBg: "bg-amber-50",
      borderAccent: "border-amber-200",
      hexColor: 0xf59e0b,
      icon: <ShieldCheck className="w-5 h-5 text-amber-600" />,
      content: {
        badge: "Patrimoine & Données",
        headline: "Ne perdez plus jamais l'historique d'un client au départ d'un employé",
        description: "Quand la relation client repose sur des téléphones personnels, le jour où un collaborateur part, votre carnet client et tous vos accords s'envolent avec lui. Zadesk centralise et sanctuarise toutes vos données.",
        keyPoints: [
          "Historique complet et ineffaçable pour chaque client et chaque dossier.",
          "Séparation étanche entre la vie privée de vos employés et les affaires de l'entreprise.",
          "Passation immédiate : un nouvel agent prend la suite sans rupture."
        ],
        summaryMetric: "100% de la mémoire client conservée",
        visualPreview: (
          <div className="rounded-2xl bg-slate-900 text-white p-4.5 sm:p-5 shadow-lg border border-slate-800 space-y-3.5 text-xs">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span className="font-bold text-slate-200">Espace Entreprise Protégé</span>
              </div>
              <span className="text-[10px] text-amber-300 font-mono">Sauvegarde Cloud</span>
            </div>

            {/* Security Vault Mockup */}
            <div className="space-y-2.5">
              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-between">
                <div>
                  <div className="font-bold text-white text-xs">Base Clients &amp; Réclamations</div>
                  <div className="text-[10px] text-slate-400">1 420 dossiers archivés et traçables</div>
                </div>
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
              </div>

              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-between">
                <div>
                  <div className="font-bold text-white text-xs">Départ ou changement d&apos;appareil</div>
                  <div className="text-[10px] text-slate-400">Zéro perte de contacts ou d&apos;engagements</div>
                </div>
                <span className="w-2 h-2 rounded-full bg-amber-400" />
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-amber-400 font-semibold">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Propriété exclusive de votre entreprise
              </span>
              <span className="text-slate-400 text-[10px]">Pérenne</span>
            </div>
          </div>
        )
      }
    }
  ];

  // =========================================================================
  // Three.js Background Ambient Light Particles (Seamlessly blending in page)
  // =========================================================================
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    let animId: number;
    let width = container.clientWidth;
    let height = container.clientHeight || 600;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.z = 15;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance"
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Particle field that shifts colors to match active drawer
    const count = 120;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 26;
      positions[i + 1] = (Math.random() - 0.5) * 18;
      positions[i + 2] = (Math.random() - 0.5) * 10;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    const activeHex = drawers[openDrawer]?.hexColor || 0x10b981;
    const mat = new THREE.PointsMaterial({
      size: 0.09,
      color: activeHex,
      transparent: true,
      opacity: 0.35
    });

    const particles = new THREE.Points(geo, mat);
    scene.add(particles);
    particlesRef.current = particles;

    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();
      particles.rotation.y = elapsed * 0.03;
      particles.rotation.x = Math.sin(elapsed * 0.04) * 0.1;
      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      width = container.clientWidth;
      height = container.clientHeight || 600;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animId);
      renderer.dispose();
      geo.dispose();
      mat.dispose();
    };
  }, []);

  // Update Three.js particle color smoothly on drawer switch
  useEffect(() => {
    if (particlesRef.current) {
      const mat = particlesRef.current.material as THREE.PointsMaterial;
      const targetColor = new THREE.Color(drawers[openDrawer].hexColor);
      gsap.to(mat.color, {
        r: targetColor.r,
        g: targetColor.g,
        b: targetColor.b,
        duration: 0.6,
        ease: "power2.out"
      });
    }
  }, [openDrawer]);

  // Drawer Toggle Handler with GSAP spring feel
  const handleDrawerToggle = (index: number) => {
    if (openDrawer === index) {
      // Keep it open or toggle
      return;
    }
    setOpenDrawer(index);
  };

  return (
    <div ref={containerRef} className="w-full relative select-none py-4">
      
      {/* Background Seamless Three.js Canvas (No box, no borders) */}
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 w-full h-full pointer-events-none -z-10 opacity-70"
      />

      {/* 3 Physical Drawers Stack */}
      <div ref={drawersContainerRef} className="max-w-5xl mx-auto space-y-4 px-4 sm:px-6">
        
        {drawers.map((d, index) => {
          const isOpen = openDrawer === index;

          return (
            <div
              key={d.id}
              className={`rounded-2xl sm:rounded-3xl transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                isOpen 
                  ? "bg-white border-2 border-slate-300/90 shadow-xl shadow-slate-200/70" 
                  : "bg-slate-50/70 hover:bg-white border border-slate-200/80 hover:border-slate-300/90 shadow-2xs hover:shadow-md"
              }`}
            >
              
              {/* Drawer Handle / Header Button */}
              <button
                type="button"
                onClick={() => handleDrawerToggle(index)}
                className="w-full text-left p-5 sm:p-7 flex items-center justify-between gap-4 cursor-pointer focus:outline-hidden"
                aria-expanded={isOpen}
              >
                <div className="flex items-center gap-4 sm:gap-6 min-w-0">
                  
                  {/* Physical Drawer Number & Icon Handle */}
                  <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center shrink-0 border transition-all duration-300 ${
                    isOpen 
                      ? `${d.accentBg} ${d.borderAccent} shadow-xs scale-105` 
                      : "bg-white border-slate-200/90 text-slate-500"
                  }`}>
                    {d.icon}
                  </div>

                  {/* Title & Tagline */}
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xs font-mono font-bold text-slate-400">
                        {d.number}
                      </span>
                      <h3 className="apple-display-title text-base sm:text-xl font-bold text-slate-950 truncate">
                        {d.title}
                      </h3>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-500 line-clamp-1 font-normal">
                      {d.tagline}
                    </p>
                  </div>

                </div>

                {/* Right Drawer Pull Indicator */}
                <div className="flex items-center gap-3 shrink-0">
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full hidden md:inline-block border transition-colors ${
                    isOpen
                      ? `${d.accentBg} ${d.themeColor} ${d.borderAccent}`
                      : "bg-white text-slate-400 border-slate-200"
                  }`}>
                    {isOpen ? "Tiroir Ouvert" : "Cliquer pour ouvrir"}
                  </span>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border transition-transform duration-300 ${
                    isOpen
                      ? "bg-slate-950 text-white border-slate-950 rotate-180"
                      : "bg-white text-slate-500 border-slate-200"
                  }`}>
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>

              </button>

              {/* Drawer Interior Body (Slides down smoothly) */}
              <div 
                className={`overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                  isOpen ? "max-h-[800px] opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                <div className="px-5 pb-6 sm:px-7 sm:pb-8 pt-2 border-t border-slate-100">
                  
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-3">
                    
                    {/* Left Column: Context & Key Bullet Points */}
                    <div className="lg:col-span-6 space-y-5">
                      
                      <div className="space-y-2">
                        <span className={`text-[11px] font-bold px-3 py-1 rounded-full border inline-block ${d.accentBg} ${d.themeColor} ${d.borderAccent}`}>
                          {d.content.badge}
                        </span>
                        <h4 className="apple-display-title text-lg sm:text-2xl font-bold text-slate-950 leading-snug">
                          {d.content.headline}
                        </h4>
                        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                          {d.content.description}
                        </p>
                      </div>

                      {/* 3 Physical Points */}
                      <div className="space-y-2.5 pt-1">
                        {d.content.keyPoints.map((point, pIdx) => (
                          <div key={pIdx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                            <CheckCircle2 className={`w-4 h-4 ${d.themeColor} shrink-0 mt-0.5`} />
                            <span>{point}</span>
                          </div>
                        ))}
                      </div>

                      {/* Highlight Metric Pill */}
                      <div className="pt-2">
                        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-100/80 border border-slate-200 text-xs font-semibold text-slate-800">
                          <Sparkles className={`w-3.5 h-3.5 ${d.themeColor}`} />
                          <span>{d.content.summaryMetric}</span>
                        </div>
                      </div>

                    </div>

                    {/* Right Column: Physical Interactive Preview Card */}
                    <div className="lg:col-span-6">
                      {d.content.visualPreview}
                    </div>

                  </div>

                </div>
              </div>

            </div>
          );
        })}

      </div>

    </div>
  );
};

