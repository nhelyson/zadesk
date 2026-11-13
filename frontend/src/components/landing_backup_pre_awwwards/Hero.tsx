"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { 
  ArrowRight, 
  CheckCircle2, 
  Play, 
  Star, 
  Building, 
  QrCode, 
  Smartphone, 
  Clock,
  Sparkles
} from "lucide-react";

export const Hero = () => {
  const [scrollY, setScrollY] = useState(0);
  const [step, setStep] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setStep((prev) => (prev + 1) % 4);
    }, 3600);
    return () => clearInterval(timer);
  }, []);

  const rotateX = Math.max(0, 6 - scrollY * 0.02);
  const scale = Math.min(1.02, 0.98 + scrollY * 0.0002);

  return (
    <section data-nav-theme="light" className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-50 text-slate-900 selection:bg-emerald-500 selection:text-white">
      
      {/* Subtle Ambient Background Glow (Soft Emerald & Sunlight) */}
      <div 
        className={`absolute top-10 left-1/3 w-[600px] h-[400px] bg-emerald-500/10 blur-[150px] rounded-full pointer-events-none -z-10 transition-opacity duration-1000 ${
          mounted ? "opacity-100" : "opacity-0"
        }`} 
      />
      <div 
        className={`absolute top-40 right-10 w-[500px] h-[350px] bg-teal-500/10 blur-[140px] rounded-full pointer-events-none -z-10 transition-opacity duration-1000 delay-200 ${
          mounted ? "opacity-100" : "opacity-0"
        }`} 
      />

      {/* Ambient background soft light */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Top 2-Column Grid: Copy (Left) + Visual Showcase (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-16 sm:mb-20">
          
          {/* Left Column: Spacious & Focused Copy (Linear / Vercel style airy staggered hierarchy) */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-8 text-left">
            
            {/* 1. Main Headline (True Focal Point — Direct, Bold & Elegant) */}
            <h1 
              className={`text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black tracking-tight text-slate-950 leading-[1.1] transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] delay-100 ${
                mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
            >
              Votre SAV
              <br />
              <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-navy-900 bg-clip-text text-transparent">
                Plus simple, plus humain
              </span>
            </h1>

            {/* 2. Focused & Crisp Value Proposition Description */}
            <p 
              className={`text-base sm:text-xl text-slate-600 font-normal leading-relaxed max-w-xl transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] delay-200 ${
                mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
            >
              Offrez à vos clients un service après-vente disponible, réactif et personnalisé. Zadesk vous permet de répondre à leurs demandes, de les accompagner au quotidien et d&apos;assurer un suivi attentif jusqu&apos;à la résolution de chaque problème.
            </p>

            {/* 3. High-Contrast Action CTAs with Breathing Room & Micro-interactions */}
            <div 
              className={`space-y-4 pt-2 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] delay-300 ${
                mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
            >
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <Link href="/register">
                  <Button
                    size="xl"
                    variant="gradient"
                    className="w-full sm:w-auto text-base font-bold shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200 justify-center group"
                    rightIcon={<ArrowRight className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-1" />}
                  >
                    Créer mon SAV — 14 jours gratuits
                  </Button>
                </Link>
                <Link href="#comment-ca-marche">
                  <Button
                    size="xl"
                    variant="outline"
                    className="w-full sm:w-auto text-base border-slate-300 font-bold text-slate-800 bg-white hover:bg-slate-50 hover:border-slate-400 shadow-xs hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200 justify-center group"
                    leftIcon={<Play className="w-4 h-4 text-emerald-600 fill-emerald-600 transition-transform duration-200 group-hover:scale-110" />}
                  >
                    Voir la démo en direct
                  </Button>
                </Link>
              </div>

              {/* Guarantees */}
              <div 
                className={`flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-500 font-semibold pt-1 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] delay-450 ${
                  mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  Messagerie accessible sans compte obligatoire pour vos clients
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  Installation en 2 minutes chrono
                </span>
              </div>
            </div>

          </div>

          {/* Right Column: Photo of Surprised Customer looking at Phone + Floating SAV Bubbles */}
          <div 
            className={`lg:col-span-5 relative transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] delay-200 ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}
          >
            
            {/* Crisp Frame with Soft Shadow */}
            <div className="relative mx-auto max-w-md rounded-3xl overflow-hidden border border-slate-200 shadow-2xl shadow-slate-200/80 bg-white group hover:shadow-3xl hover:-translate-y-1 transition-all duration-500 ease-out">
              
              {/* Authentic Photo */}
              <img
                src="https://images.unsplash.com/photo-1589156280159-27698a70f29e?w=800&auto=format&fit=crop&q=80"
                alt="Cliente satisfaite et étonnée de la rapidité du SAV Zadesk"
                className="w-full h-[460px] object-cover object-top group-hover:scale-105 transition-transform duration-700 ease-out"
              />

              {/* Bottom Quote Bar with Crisp Contrast */}
              <div className="absolute bottom-4 left-4 right-4 p-4 rounded-2xl bg-white/95 backdrop-blur-xl border border-slate-200/90 shadow-xl text-left space-y-1 transition-all duration-300 group-hover:bg-white">
                <div className="flex items-center justify-between">
                  <div className="flex text-amber-400">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                  </div>
                  <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    30s chrono
                  </span>
                </div>
                <p className="text-xs font-bold text-slate-900">
                  « J&apos;ai contacté le SAV en ligne, l&apos;IA et l&apos;agent ont résolu mon problème sans attente ! »
                </p>
                <p className="text-[11px] text-slate-500">Mamadou K. • Brazzaville</p>
              </div>

            </div>

            {/* Floating Live SAV Message Bubble Top-Left */}
            <div className="absolute -top-6 -left-6 z-20 p-3.5 rounded-2xl bg-white text-slate-900 shadow-2xl border border-slate-200 animate-float-gentle hover:scale-105 transition-transform duration-300 max-w-[240px] text-left hidden sm:block cursor-default">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping-subtle" />
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">SAV Connecté</span>
              </div>
              <p className="text-xs font-bold text-slate-950 leading-snug">
                « Bonjour ! Votre demande #Z-420 a été traitée avec succès. »
              </p>
              <span className="text-[9px] text-emerald-700 font-bold block mt-1">✓ Résolu instantanément</span>
            </div>

            {/* Floating Live Speed Badge Bottom-Right */}
            <div className="absolute -bottom-6 -right-4 z-20 p-3.5 rounded-2xl bg-slate-900 text-white shadow-2xl border border-slate-800 animate-float-reverse hover:scale-105 transition-transform duration-300 max-w-[220px] text-left hidden sm:block cursor-default">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-black text-white">Temps d&apos;attente : 0s</span>
              </div>
              <p className="text-[11px] text-slate-300">
                100% de vos clients pris en charge immédiatement.
              </p>
            </div>

          </div>

        </div>

        {/* Live Interactive Product Mockup Container (High-Contrast 3D View with Scroll Parallax) */}
        <div className="relative mt-8 perspective-1200">
          
          <div 
            className="transition-transform duration-300 ease-out transform-gpu-3d"
            style={{
              transform: `rotateX(${rotateX}deg) scale(${scale})`,
              boxShadow: "0 30px 80px -15px rgba(13, 27, 61, 0.2)",
            }}
          >
            <div className="w-full max-w-6xl mx-auto rounded-3xl bg-slate-900/95 p-4 sm:p-6 border border-slate-700/80 text-slate-100 font-sans backdrop-blur-2xl relative overflow-hidden shadow-2xl">
              
              {/* Header Bar */}
              <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-800 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500" />
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="ml-2 text-slate-400 font-medium hidden sm:inline">
                    Zadesk Workspace • Démonstration Live Client ➔ IA ➔ Agent ➔ Agence
                  </span>
                </div>

                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/90 text-[11px] border border-slate-700">
                  <span className="text-slate-400">Phase en direct :</span>
                  <span className="font-bold text-emerald-400 transition-colors duration-300">
                    {step === 0 && "1. Demande SAV reçue"}
                    {step === 1 && "2. IA SAV : Réponse intelligente"}
                    {step === 2 && "3. Transfert vers le bon conseiller"}
                    {step === 3 && "4. Continuité jusqu'à l'agence physique"}
                  </span>
                </div>
              </div>

              {/* 3-Column Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 text-xs">
                
                {/* Left: Client Inbound */}
                <div className="lg:col-span-4 bg-slate-950/70 rounded-2xl p-3.5 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between font-bold text-slate-300">
                    <span className="flex items-center gap-2">
                      <Smartphone className="w-4 h-4 text-emerald-400" />
                      Messagerie Client Direct
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px]">
                      En direct
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900 border border-emerald-500/80 shadow-md space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-100 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        Client en ligne #4829
                      </span>
                      <span className="text-[10px] text-slate-400">15:02</span>
                    </div>
                    <p className="text-[11px] text-slate-200">
                      « Bonjour, mon routeur Wifi ne s&apos;allume plus après la pluie. »
                    </p>
                    <div className="flex items-center gap-1.5 pt-1">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300 border border-slate-700">
                        SAV Technique
                      </span>
                      {step >= 2 && (
                        <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-[10px] font-semibold animate-in fade-in duration-300">
                          Japhet I.
                        </span>
                      )}
                      {step >= 3 && (
                        <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold animate-in fade-in duration-300">
                          ZDK-48291
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800/60 opacity-60">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-slate-300">Client Web #5108</span>
                      <span className="text-[10px] text-slate-500">14:50</span>
                    </div>
                    <p className="text-[11px] text-slate-400 truncate">Demande de renouvellement contrat</p>
                    <span className="text-[9px] text-emerald-400 font-bold block mt-1">✓ Résolu par l&apos;IA</span>
                  </div>
                </div>

                {/* Center: Live Conversation Thread */}
                <div className="lg:col-span-5 bg-slate-950/90 rounded-2xl p-4 border border-slate-800 flex flex-col justify-between min-h-[380px]">
                  
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div>
                      <h4 className="font-bold text-slate-100 text-sm">Échange SAV en Direct</h4>
                      <p className="text-[11px] text-slate-400">Mamadou Kouka • Dossier #4829</p>
                    </div>
                    <div className="text-[10px] px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-800 text-slate-300">
                      {step === 0 && "1. Demande reçue"}
                      {step === 1 && "2. IA active"}
                      {step === 2 && "3. Agent en ligne"}
                      {step === 3 && "4. Dossier Agence"}
                    </div>
                  </div>

                  <div className="space-y-3 my-4 overflow-y-auto max-h-[220px]">
                    <div className="flex flex-col items-start">
                      <div className="bg-slate-900 p-3 rounded-2xl rounded-tl-sm border border-slate-800 max-w-[85%]">
                        <p className="text-[11px] text-slate-200">
                          Bonjour, mon routeur Wifi acheté il y a 2 semaines ne s&apos;allume plus après l&apos;orage.
                        </p>
                        <span className="text-[9px] text-slate-500 mt-1 block">15:02</span>
                      </div>
                    </div>

                    {step >= 1 && (
                      <div className="flex flex-col items-end animate-in fade-in duration-300">
                        <div className="bg-emerald-950/70 text-emerald-200 p-3 rounded-2xl rounded-tr-sm max-w-[85%] border border-emerald-500/40 shadow-sm shadow-emerald-500/10">
                          <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1 mb-1">
                            <Sparkles className="w-3 h-3" /> IA SAV Zadesk
                          </span>
                          <p className="text-[11px]">
                            Bonjour ! Avez-vous essayé d&apos;appuyer 10 secondes sur le bouton Reset à l&apos;arrière avec le chargeur d&apos;origine ?
                          </p>
                        </div>
                      </div>
                    )}

                    {step >= 2 && (
                      <>
                        <div className="flex flex-col items-start animate-in fade-in duration-300">
                          <div className="bg-slate-900 p-2.5 rounded-2xl rounded-tl-sm border border-slate-800 max-w-[85%]">
                            <p className="text-[11px] text-slate-200">
                              Oui, j&apos;ai testé, aucun voyant ne s&apos;allume.
                            </p>
                          </div>
                        </div>

                        <div className="bg-indigo-950/40 border border-indigo-500/30 p-2.5 rounded-xl text-[10px] text-indigo-200 flex items-center justify-between animate-in fade-in duration-300">
                          <span>🔄 Transfert vers Japhet I. (Technique SAV)</span>
                          <span className="font-bold text-emerald-400">Historique complet transmis ✓</span>
                        </div>
                      </>
                    )}

                    {step >= 3 && (
                      <div className="bg-amber-950/60 border border-amber-500/40 p-3 rounded-2xl text-amber-200 space-y-1.5 animate-in fade-in duration-300">
                        <div className="flex items-center justify-between text-[11px] font-bold text-amber-400">
                          <span className="flex items-center gap-1.5">
                            <Building className="w-3.5 h-3.5" />
                            Dossier Agence créé
                          </span>
                          <span>Réf: ZDK-48291</span>
                        </div>
                        <p className="text-[11px] text-amber-100">
                          « Rendez-vous à l&apos;agence Centre-Ville avec votre QR Code. Votre échange standard de routeur est déjà validé. »
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                    <span>Le canal change, le contexte reste intact.</span>
                    <span className="text-emerald-400 font-bold">100% synchronisé</span>
                  </div>

                </div>

                {/* Right: Agency View */}
                <div className="lg:col-span-3 bg-slate-950/70 rounded-2xl p-3.5 border border-slate-800 space-y-3">
                  <div className="font-bold text-slate-300 flex items-center gap-2">
                    <Building className="w-4 h-4 text-amber-400" />
                    Vue Guichet Agence
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center space-y-2">
                    <div className="w-14 h-14 rounded-xl bg-white p-1 mx-auto flex items-center justify-center">
                      <QrCode className="w-12 h-12 text-slate-950" />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Référence Dossier</span>
                      <p className="font-mono font-black text-amber-400 text-sm">ZDK-48291</p>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-[10px] space-y-1">
                    <div className="flex justify-between text-slate-400">
                      <span>Client :</span>
                      <span className="text-slate-200 font-semibold">Mamadou K.</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Produit :</span>
                      <span className="text-slate-200 font-semibold">Routeur 4G Pro</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Diagnostic :</span>
                      <span className="text-emerald-400 font-semibold">Alimentation HS</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Action :</span>
                      <span className="text-amber-300 font-semibold">Échange standard</span>
                    </div>
                  </div>

                  <p className="text-[9px] text-slate-500 text-center">
                    Le guichetier scanne le QR code et traite le client en 1 minute.
                  </p>
                </div>

              </div>

            </div>
          </div>
        </div>

      </div>
    </section>
  );
};