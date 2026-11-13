"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import gsap from "gsap";
import { MessageSquare, QrCode, ShieldCheck, Sparkles, ArrowRight } from "lucide-react";

interface ChannelInfo {
  id: string;
  title: string;
  badge: string;
  subtitle: string;
  colorHex: number;
  textColor: string;
  bgBadge: string;
  description: string;
  stats: string;
  benefit: string;
}

const CHANNELS: ChannelInfo[] = [
  {
    id: "whatsapp",
    title: "Canal WhatsApp Direct",
    badge: "Digital & Mobile",
    subtitle: "Vos clients écrivent depuis leur application habituelle",
    colorHex: 0x10b981,
    textColor: "text-emerald-700",
    bgBadge: "bg-emerald-50 text-emerald-800 border-emerald-200",
    description: "Les messages, audios et photos arrivent instantanément dans la boîte commune Zadesk. Aucun formulaire lourd à remplir pour le client.",
    stats: "Temps moyen de prise en charge < 3 min",
    benefit: "Zéro barrière à l'entrée : le client reste sur son WhatsApp sans rien installer."
  },
  {
    id: "guichet",
    title: "Le Guichet & Comptoir",
    badge: "Terrain & Agences",
    subtitle: "Synchronisation physique immédiate au comptoir",
    colorHex: 0x0284c7,
    textColor: "text-sky-700",
    bgBadge: "bg-sky-50 text-sky-800 border-sky-200",
    description: "Le client se présente en agence ou en boutique : l'agent d'accueil tape son numéro et retrouve en 2 secondes la discussion en ligne et les pièces jointes.",
    stats: "Historique accessible en 1 clic au guichet",
    benefit: "Fini de faire répéter la même histoire au client entre WhatsApp et le comptoir."
  },
  {
    id: "memoire",
    title: "La Mémoire d'Entreprise",
    badge: "Sécurité & Pérennité",
    subtitle: "Vos données restent protégées chez vous",
    colorHex: 0xf59e0b,
    textColor: "text-amber-700",
    bgBadge: "bg-amber-50 text-amber-800 border-amber-200",
    description: "Même si un collaborateur change de téléphone, démissionne ou part en congé, toutes les réclamations et coordonnées restent intactes et sécurisées.",
    stats: "100% des discussions conservées",
    benefit: "L'entreprise ne perd plus jamais un contact ou un engagement client."
  }
];

export const ZadeskSpatialPrism = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [activeChannelIdx, setActiveChannelIdx] = useState(0);

  // References to keep Three objects accessible to GSAP
  const sceneRef = useRef<THREE.Scene | null>(null);
  const prismGroupRef = useRef<THREE.Group | null>(null);
  const satellitesRef = useRef<THREE.Mesh[]>([]);
  const energyBeamsRef = useRef<THREE.Line[]>([]);
  const isVisibleRef = useRef<boolean>(true);

  const activeChannel = CHANNELS[activeChannelIdx];

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    let animationFrameId: number;
    let width = container.clientWidth;
    let height = container.clientHeight || 520;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(0, 0.8, 11);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance"
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;

    // 2. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x10b981, 3.2);
    dirLight1.position.set(8, 10, 8);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x38bdf8, 2.5);
    dirLight2.position.set(-8, -6, 6);
    scene.add(dirLight2);

    const coreLight = new THREE.PointLight(0x10b981, 4.0, 15);
    coreLight.position.set(0, 0, 0);
    scene.add(coreLight);

    // 3. Central Prism Group
    const prismGroup = new THREE.Group();
    prismGroupRef.current = prismGroup;
    scene.add(prismGroup);

    // 3.1 Outer Glass Faceted Prism (Octahedron with Glass Physical Material)
    const glassGeo = new THREE.OctahedronGeometry(2.35, 0);
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      metalness: 0.05,
      roughness: 0.12,
      transmission: 0.94,
      thickness: 1.8,
      ior: 1.55,
      specularIntensity: 1.0,
      specularColor: 0xffffff,
      transparent: true,
      opacity: 0.95
    });
    const glassMesh = new THREE.Mesh(glassGeo, glassMat);
    prismGroup.add(glassMesh);

    // 3.2 Outer Wireframe Accent
    const wireGeo = new THREE.OctahedronGeometry(2.38, 0);
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      wireframe: true,
      transparent: true,
      opacity: 0.35
    });
    const wireMesh = new THREE.Mesh(wireGeo, wireMat);
    prismGroup.add(wireMesh);

    // 3.3 Glowing Inner Core
    const coreGeo = new THREE.IcosahedronGeometry(1.05, 1);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      emissive: 0x059669,
      emissiveIntensity: 0.9,
      roughness: 0.3,
      metalness: 0.2,
      wireframe: true
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    prismGroup.add(coreMesh);

    // 3.4 Orbital Thin Rings
    const ringGeo1 = new THREE.TorusGeometry(3.6, 0.018, 16, 120);
    const ringMat1 = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      transparent: true,
      opacity: 0.3
    });
    const ring1 = new THREE.Mesh(ringGeo1, ringMat1);
    ring1.rotation.x = Math.PI / 2.5;
    prismGroup.add(ring1);

    const ringGeo2 = new THREE.TorusGeometry(4.2, 0.015, 16, 120);
    const ringMat2 = new THREE.MeshBasicMaterial({
      color: 0x0284c7,
      transparent: true,
      opacity: 0.25
    });
    const ring2 = new THREE.Mesh(ringGeo2, ringMat2);
    ring2.rotation.y = Math.PI / 3;
    prismGroup.add(ring2);

    // 4. Orbital Satellites
    const orbitRadius = 4.6;
    const satellites: THREE.Mesh[] = [];
    const energyBeams: THREE.Line[] = [];

    CHANNELS.forEach((channel, idx) => {
      const angle = (idx / CHANNELS.length) * Math.PI * 2;
      const x = Math.cos(angle) * orbitRadius;
      const y = Math.sin(angle) * 1.5;
      const z = Math.sin(angle) * orbitRadius;

      // Satellite Sphere
      const satGeo = new THREE.SphereGeometry(0.38, 32, 32);
      const satMat = new THREE.MeshStandardMaterial({
        color: channel.colorHex,
        emissive: channel.colorHex,
        emissiveIntensity: 0.8,
        roughness: 0.2,
        metalness: 0.3
      });
      const satMesh = new THREE.Mesh(satGeo, satMat);
      satMesh.position.set(x, y, z);
      scene.add(satMesh);
      satellites.push(satMesh);

      // Outer Halo Ring
      const haloGeo = new THREE.RingGeometry(0.48, 0.58, 32);
      const haloMat = new THREE.MeshBasicMaterial({
        color: channel.colorHex,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.6
      });
      const haloMesh = new THREE.Mesh(haloGeo, haloMat);
      satMesh.add(haloMesh);

      // Connecting Energy Beam to Center Prism
      const beamPoints = [
        new THREE.Vector3(x, y, z),
        new THREE.Vector3(0, 0, 0)
      ];
      const beamGeo = new THREE.BufferGeometry().setFromPoints(beamPoints);
      const beamMat = new THREE.LineBasicMaterial({
        color: channel.colorHex,
        transparent: true,
        opacity: idx === 0 ? 0.8 : 0.2
      });
      const beam = new THREE.Line(beamGeo, beamMat);
      scene.add(beam);
      energyBeams.push(beam);
    });

    satellitesRef.current = satellites;
    energyBeamsRef.current = energyBeams;

    // 5. Ambient Micro-Dust Particles
    const particlesCount = 140;
    const posArray = new Float32Array(particlesCount * 3);
    for (let i = 0; i < particlesCount * 3; i += 3) {
      posArray[i] = (Math.random() - 0.5) * 14;
      posArray[i + 1] = (Math.random() - 0.5) * 10;
      posArray[i + 2] = (Math.random() - 0.5) * 12;
    }
    const particlesGeo = new THREE.BufferGeometry();
    particlesGeo.setAttribute("position", new THREE.BufferAttribute(posArray, 3));
    const particlesMat = new THREE.PointsMaterial({
      size: 0.055,
      color: 0x10b981,
      transparent: true,
      opacity: 0.45
    });
    const particlesMesh = new THREE.Points(particlesGeo, particlesMat);
    scene.add(particlesMesh);

    // 6. GSAP Smooth Pointer Interaction
    let mouseX = 0;
    let mouseY = 0;
    let targetRotX = 0;
    let targetRotY = 0;

    const handlePointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      mouseX = x * 0.45;
      mouseY = y * 0.35;
    };

    container.addEventListener("pointermove", handlePointerMove, { passive: true });

    // 7. Visibility Observer to preserve 60FPS
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isVisibleRef.current = entry.isIntersecting;
        });
      },
      { threshold: 0.1 }
    );
    observer.observe(container);

    // 8. Render Animation Loop
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      if (!isVisibleRef.current) return;

      const elapsedTime = clock.getElapsedTime();

      // Idle Rotation + Pointer smoothing with GSAP lerp
      targetRotX = mouseY + Math.sin(elapsedTime * 0.4) * 0.08;
      targetRotY = mouseX + elapsedTime * 0.18;

      prismGroup.rotation.x += (targetRotX - prismGroup.rotation.x) * 0.05;
      prismGroup.rotation.y += (targetRotY - prismGroup.rotation.y) * 0.05;

      // Soft vertical breathing float
      prismGroup.position.y = Math.sin(elapsedTime * 0.8) * 0.18;

      // Rotate inner core opposite direction
      coreMesh.rotation.y = -elapsedTime * 0.5;
      coreMesh.rotation.z = elapsedTime * 0.3;

      // Orbital Satellites gentle revolution
      satellites.forEach((sat, i) => {
        const baseAngle = (i / CHANNELS.length) * Math.PI * 2;
        const currentAngle = baseAngle + elapsedTime * 0.22;
        sat.position.x = Math.cos(currentAngle) * orbitRadius;
        sat.position.z = Math.sin(currentAngle) * orbitRadius;
        sat.position.y = Math.sin(currentAngle * 2 + elapsedTime) * 0.4;

        // Update energy beam points
        const beam = energyBeams[i];
        if (beam) {
          const positions = beam.geometry.attributes.position.array as Float32Array;
          positions[0] = sat.position.x;
          positions[1] = sat.position.y;
          positions[2] = sat.position.z;
          positions[3] = prismGroup.position.x;
          positions[4] = prismGroup.position.y;
          positions[5] = prismGroup.position.z;
          beam.geometry.attributes.position.needsUpdate = true;
        }
      });

      // Slowly rotate ambient particles
      particlesMesh.rotation.y = elapsedTime * 0.02;

      renderer.render(scene, camera);
    };

    animate();

    // 9. Resize Handling
    const handleResize = () => {
      if (!container) return;
      width = container.clientWidth;
      height = container.clientHeight || 520;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      container.removeEventListener("pointermove", handlePointerMove);
      observer.disconnect();
      cancelAnimationFrame(animationFrameId);

      // Dispose Three resources
      renderer.dispose();
      glassGeo.dispose();
      glassMat.dispose();
      wireGeo.dispose();
      wireMat.dispose();
      coreGeo.dispose();
      coreMat.dispose();
      ringGeo1.dispose();
      ringMat1.dispose();
      ringGeo2.dispose();
      ringMat2.dispose();
      particlesGeo.dispose();
      particlesMat.dispose();
    };
  }, []);

  // Handler when a channel tab is clicked
  const handleSelectChannel = (index: number) => {
    setActiveChannelIdx(index);
    const targetChannel = CHANNELS[index];

    // GSAP Cinematic Focus Animation on Three.js objects
    if (prismGroupRef.current && satellitesRef.current[index]) {
      // 1. Flash Prism Scale with bouncy spring
      gsap.fromTo(
        prismGroupRef.current.scale,
        { x: 1.15, y: 1.15, z: 1.15 },
        { x: 1, y: 1, z: 1, duration: 0.8, ease: "elastic.out(1, 0.4)" }
      );

      // 2. Highlight active beam opacity and reset others
      energyBeamsRef.current.forEach((beam, idx) => {
        const mat = beam.material as THREE.LineBasicMaterial;
        gsap.to(mat, {
          opacity: idx === index ? 0.95 : 0.15,
          duration: 0.5,
          ease: "power2.out"
        });
      });

      // 3. Scale active satellite
      satellitesRef.current.forEach((sat, idx) => {
        gsap.to(sat.scale, {
          x: idx === index ? 1.4 : 1.0,
          y: idx === index ? 1.4 : 1.0,
          z: idx === index ? 1.4 : 1.0,
          duration: 0.5,
          ease: "back.out(2)"
        });
      });
    }
  };

  return (
    <div className="w-full relative select-none">
      
      {/* Interactive Channel Selector Header Tabs */}
      <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap mb-6 px-4">
        {CHANNELS.map((c, idx) => {
          const isActive = idx === activeChannelIdx;
          return (
            <button
              key={c.id}
              onClick={() => handleSelectChannel(idx)}
              className={`px-4 sm:px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all duration-300 flex items-center gap-2 cursor-pointer shadow-xs ${
                isActive
                  ? "bg-slate-950 text-white shadow-lg shadow-slate-950/20 scale-105"
                  : "bg-white text-slate-700 border border-slate-200/90 hover:bg-slate-50 hover:border-slate-300"
              }`}
            >
              <span 
                className="w-2 h-2 rounded-full" 
                style={{ backgroundColor: isActive ? "#10b981" : "#94a3b8" }} 
              />
              <span>{c.title}</span>
            </button>
          );
        })}
      </div>

      {/* Main 2-Column Showcase: Interactive Three.js 3D Viewport (Left/Center) + Dynamic Value Card (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Three.js 3D WebGL Canvas Container */}
        <div 
          ref={containerRef}
          className="lg:col-span-7 h-[420px] sm:h-[500px] lg:h-[540px] relative rounded-3xl bg-gradient-to-b from-slate-50/90 via-white to-slate-50/60 border border-slate-200/80 shadow-2xl shadow-slate-200/60 overflow-hidden flex items-center justify-center cursor-grab active:cursor-grabbing"
        >
          {/* Subtle luminous background ambient glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] h-[340px] bg-emerald-500/15 blur-[120px] rounded-full pointer-events-none" />
          
          <canvas ref={canvasRef} className="w-full h-full block" />

          {/* Floating HUD Instruction Pill */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3.5 py-1.5 rounded-full bg-white/80 backdrop-blur-md border border-slate-200/80 text-[11px] font-medium text-slate-600 shadow-xs flex items-center gap-2 pointer-events-none">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Bougez le curseur pour explorer le prisme · Cliquez un canal</span>
          </div>

          {/* Live Badge Top-Left */}
          <div className="absolute top-4 left-4 px-3 py-1.5 rounded-xl bg-white/85 backdrop-blur-md border border-slate-200 text-xs font-semibold text-slate-800 shadow-2xs flex items-center gap-2 pointer-events-none">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Moteur 3D Zadesk · WebGL &amp; GSAP</span>
          </div>
        </div>

        {/* Dynamic Detail Card Connected to Active Satellite */}
        <div className="lg:col-span-5 space-y-6">
          
          <div className="p-8 sm:p-9 rounded-3xl bg-white border border-slate-200/90 shadow-xl shadow-slate-200/50 space-y-6 transition-all duration-300">
            
            <div className="flex items-center justify-between">
              <span className={`text-xs font-bold px-3 py-1 rounded-full border ${activeChannel.bgBadge}`}>
                {activeChannel.badge}
              </span>
              <span className="text-xs font-mono font-semibold text-slate-400">
                Canal #0{activeChannelIdx + 1}
              </span>
            </div>

            <div className="space-y-2">
              <h3 className="apple-display-title text-2xl sm:text-3xl font-bold text-slate-950 leading-tight">
                {activeChannel.title}
              </h3>
              <p className="text-sm font-medium text-slate-500">
                {activeChannel.subtitle}
              </p>
            </div>

            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              {activeChannel.description}
            </p>

            {/* Performance Stat Pill */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Impact Opérationnel
              </span>
              <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{activeChannel.stats}</span>
              </div>
            </div>

            {/* Core Benefit */}
            <div className="pt-4 border-t border-slate-100 flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 font-medium">
              <ArrowRight className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{activeChannel.benefit}</span>
            </div>

          </div>

          {/* Bottom 3 Quick Metrics */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3.5 rounded-2xl bg-white border border-slate-200/70 shadow-2xs">
              <div className="text-base sm:text-lg font-extrabold text-slate-950">100%</div>
              <div className="text-[10px] sm:text-[11px] text-slate-500 font-medium">Centralisé</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-white border border-slate-200/70 shadow-2xs">
              <div className="text-base sm:text-lg font-extrabold text-slate-950">0</div>
              <div className="text-[10px] sm:text-[11px] text-slate-500 font-medium">Message perdu</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-white border border-slate-200/70 shadow-2xs">
              <div className="text-base sm:text-lg font-extrabold text-slate-950">60 FPS</div>
              <div className="text-[10px] sm:text-[11px] text-slate-500 font-medium">Fluide &amp; Léger</div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

