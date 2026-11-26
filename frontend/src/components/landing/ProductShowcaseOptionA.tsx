"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUp,
  Building2,
  CheckCheck,
  CheckCircle2,
  FileText,
  Lock,
  Plus,
  User,
} from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Iphone15Pro } from "@/components/ui/Iphone15Pro";
import { CompanyPublicHeader } from "@/components/public/CompanyPublicHeader";

export const ProductShowcaseOptionA: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const pinStageRef = useRef<HTMLDivElement>(null);
  const bgTrackRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);
  const backdropCardRef = useRef<HTMLDivElement>(null);
  const leftCopyRef = useRef<HTMLDivElement>(null);
  const phoneWrapRef = useRef<HTMLDivElement>(null);
  const calloutTopRef = useRef<HTMLDivElement>(null);
  const calloutBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    gsap.registerPlugin(ScrollTrigger);

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion || !sectionRef.current) return;

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      // ================================================================
      // DESKTOP (>= 1024px) : PINNED ZOOM "COLLÉ CONTRE LA VITRE"
      // ================================================================
      mm.add("(min-width: 1024px)", () => {
        if (!pinStageRef.current || !phoneWrapRef.current) return;

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: pinStageRef.current,
            start: "top top",
            end: "+=880",
            pin: true,
            pinSpacing: true,
            scrub: 0.75,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });

        // 1. Téléphone 2D vectoriel fidèle : inclinaison diagonale élégante -> plein champ face à la vitre
        tl.fromTo(
          phoneWrapRef.current,
          {
            scale: 0.76,
            rotateZ: -10,
            y: 42,
          },
          {
            scale: 1.14,
            rotateZ: 0,
            y: -6,
            ease: "power2.out",
          },
          0
        );

        // 2. Arrière-plan typographique glissant hors champ
        if (bgTrackRef.current) {
          tl.fromTo(
            bgTrackRef.current,
            { x: 160, y: 0 },
            { x: -240, y: -36, ease: "none" },
            0
          );
        }

        // 3. Grand titre qui s'efface en arrière-plan
        if (headlineRef.current) {
          tl.fromTo(
            headlineRef.current,
            { y: 0, scale: 1, opacity: 1 },
            { y: -42, scale: 0.94, opacity: 0.25, ease: "none" },
            0
          );
        }

        // 4. Socle Midnight Navy + photo inédite qui reculent
        if (backdropCardRef.current) {
          tl.fromTo(
            backdropCardRef.current,
            { scale: 1, opacity: 1, y: 0 },
            { scale: 0.88, opacity: 0.32, y: 18, ease: "none" },
            0
          );
        }

        if (leftCopyRef.current) {
          tl.fromTo(
            leftCopyRef.current,
            { opacity: 1, x: 0 },
            { opacity: 0.15, x: -24, ease: "none" },
            0
          );
        }

        // 5. Deux callouts nets accompagnant l'approche vers l'avant
        if (calloutTopRef.current) {
          tl.fromTo(
            calloutTopRef.current,
            { opacity: 0.2, scale: 0.85, x: 24, y: 20 },
            { opacity: 1, scale: 1, x: -22, y: -12, ease: "power2.out" },
            0.15
          );
        }

        if (calloutBottomRef.current) {
          tl.fromTo(
            calloutBottomRef.current,
            { opacity: 0.2, scale: 0.85, x: -24, y: -10 },
            { opacity: 1, scale: 1, x: 22, y: 14, ease: "power2.out" },
            0.25
          );
        }
      });

      // ================================================================
      // MOBILE / TABLET (< 1024px) : ZOOM FLUIDE AU SCROLL SANS PIN
      // ================================================================
      mm.add("(max-width: 1023px)", () => {
        if (!phoneWrapRef.current) return;

        gsap.fromTo(
          phoneWrapRef.current,
          { scale: 0.9, rotateZ: -4, y: 24 },
          {
            scale: 1.04,
            rotateZ: 0,
            y: 0,
            ease: "none",
            scrollTrigger: {
              trigger: phoneWrapRef.current,
              start: "top 85%",
              end: "center 45%",
              scrub: 0.8,
            },
          }
        );

        if (bgTrackRef.current) {
          gsap.fromTo(
            bgTrackRef.current,
            { x: 60 },
            {
              x: -90,
              ease: "none",
              scrollTrigger: {
                trigger: sectionRef.current,
                start: "top bottom",
                end: "bottom top",
                scrub: 0.8,
              },
            }
          );
        }
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const previewBrandStyle = {
    "--company-primary": "#0D1B3D",
    "--company-contrast": "#FFFFFF",
    "--company-surface": "#FFFFFF",
    "--company-surface-border": "rgba(0,0,0,0.08)",
    "--company-text": "#1D1D1F",
  } as React.CSSProperties;

  return (
    <section
      ref={sectionRef}
      id="demo-option-a"
      data-nav-theme="light"
      aria-label="Aperçu du portail client Zalisk"
      className="relative w-full bg-white text-[#0D1B3D] border-t border-slate-200/70"
    >
      {/* Zone épinglée sur desktop */}
      <div
        ref={pinStageRef}
        className="relative w-full lg:h-screen lg:flex lg:flex-col lg:justify-center py-16 sm:py-20 lg:py-8 overflow-hidden"
      >
        {/* Layer 0 : Bandeau typographique d'arrière-plan */}
        <div
          ref={bgTrackRef}
          aria-hidden="true"
          className="pointer-events-none select-none absolute top-16 sm:top-20 left-0 whitespace-nowrap font-black uppercase tracking-[-0.04em] text-[15vw] sm:text-[10vw] leading-none text-slate-900/[0.04] will-change-transform z-0"
        >
          ZALISK • PORTAIL DIRECT • RÉPONSE ÉQUIPE
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
          {/* Layer 1 : Titre éditorial en retrait progressif */}
          <div
            ref={headlineRef}
            className="relative z-10 text-center select-none pb-6 sm:pb-8 lg:pb-2 will-change-transform"
          >
            <h2 className="text-[2.5rem] sm:text-6xl lg:text-[5.2rem] xl:text-[6rem] font-black tracking-[-0.045em] leading-[0.94] text-[#0D1B3D]">
              Votre client écrit.
              <span className="block text-slate-400 font-extrabold">
                Votre équipe répond.
              </span>
            </h2>
          </div>

          {/* Layer 2-4 : Scène arrondie + Châssis Apple vectoriel + 2 callouts */}
          <div className="relative z-20 lg:-mt-4">
            {/* Arrière-plan arrondi Midnight Navy + photo équipe inédite */}
            <div
              ref={backdropCardRef}
              className="absolute inset-0 rounded-[32px] sm:rounded-[44px] bg-[#0D1B3D] overflow-hidden shadow-[0_32px_70px_-24px_rgba(13,27,61,0.45)] will-change-transform"
            >
              <div className="hidden lg:block absolute inset-y-0 right-0 w-[44%] overflow-hidden">
                <img
                  src="/images/human-connection-team.jpg"
                  alt="Équipe collaborant autour des échanges clients sur Zalisk"
                  className="w-full h-full object-cover object-center opacity-80"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#0D1B3D] via-[#0D1B3D]/55 to-transparent" />
              </div>
            </div>

            {/* Grille contenu */}
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-4 items-center px-6 py-8 sm:px-10 sm:py-10 lg:px-12 lg:py-0 lg:min-h-[410px]">
              {/* Repère éditorial gauche */}
              <div
                ref={leftCopyRef}
                className="lg:col-span-4 flex flex-col justify-between lg:min-h-[300px] text-white order-2 lg:order-1 will-change-transform"
              >
                <div className="space-y-1.5">
                  <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-emerald-400 font-semibold block">
                    01 — Côté client
                  </span>
                  <p className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                    Zadesk
                  </p>
                </div>

                <p className="text-sm text-slate-300 leading-relaxed max-w-[260px] pt-4 lg:pt-0">
                  Un lien direct ouvert dans le navigateur. La demande arrive aussitôt dans la boîte partagée de votre entreprise.
                </p>
              </div>

              {/* ========================================================== */}
              {/* LAYER 3 : IPHONE 15 PRO VECTORIEL + ÉCRAN RÉEL 390x844     */}
              {/* ========================================================== */}
              <div className="lg:col-span-4 flex justify-center relative z-30 order-1 lg:order-2 lg:-my-20">
                <div className="relative">
                  {/* Callout 1 (haut gauche) */}
                  <div
                    ref={calloutTopRef}
                    className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-full bg-white text-[#0D1B3D] shadow-[0_18px_36px_-8px_rgba(13,27,61,0.4)] border border-slate-200 text-xs font-bold whitespace-nowrap absolute top-16 -left-24 lg:-left-32 z-40 will-change-transform"
                  >
                    <Lock className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                    <span>Sans inscription client</span>
                  </div>

                  {/* Conteneur animé GSAP */}
                  <div ref={phoneWrapRef} className="will-change-transform">
                    <Iphone15Pro className="w-[248px] sm:w-[276px]">
                      <div
                        style={previewBrandStyle}
                        className="w-full h-full flex flex-col bg-[#F5F5F7] text-[#1D1D1F] antialiased"
                      >
                        {/* Barre d'état iOS calibrée sous le Dynamic Island (76px top clearance) */}
                        <div className="bg-white/95 px-7 pt-4 pb-2.5 flex items-center justify-between text-[13px] font-semibold text-[#1D1D1F] shrink-0">
                          <span className="tracking-tight">09:41</span>
                          <div className="flex items-center gap-1.5" aria-hidden="true">
                            <span className="flex items-end gap-[2px] h-3">
                              <i className="w-[2.5px] h-1.5 bg-[#1D1D1F] rounded-[0.5px]" />
                              <i className="w-[2.5px] h-2 bg-[#1D1D1F] rounded-[0.5px]" />
                              <i className="w-[2.5px] h-2.5 bg-[#1D1D1F] rounded-[0.5px]" />
                              <i className="w-[2.5px] h-3 bg-[#1D1D1F] rounded-[0.5px]" />
                            </span>
                            <span className="w-6 h-3 rounded-[4px] border border-[#1D1D1F]/65 p-[1.5px] flex items-center">
                              <i className="w-full h-full bg-[#1D1D1F] rounded-[1.5px]" />
                            </span>
                          </div>
                        </div>

                        {/* Vrai composant CompanyPublicHeader en mode aperçu */}
                        <CompanyPublicHeader
                          name="Clinique Ste-Marie"
                          category="Santé & Consultations"
                          verified={true}
                          statusBadge={{
                            dotColor: "bg-emerald-500",
                            textColor: "text-emerald-700",
                            label: "Ouvert maintenant",
                          }}
                          isPreview={true}
                        />

                        {/* Fil de discussion fidèle à CompanyConversationalView */}
                        <div className="flex-1 overflow-hidden px-4 py-4 space-y-4">
                          {/* Message d'accueil conseiller */}
                          <div className="flex flex-col items-start">
                            <div className="flex items-center gap-1.5 mb-1 px-1 text-[11px] font-medium text-slate-600">
                              <span className="flex items-center gap-1 text-[#1D1D1F] font-semibold">
                                <Building2 className="w-3.5 h-3.5 text-slate-500" />
                                <span>Service Client • Clinique Ste-Marie</span>
                              </span>
                              <span className="text-black/20">•</span>
                              <span className="font-mono text-[11px] text-slate-500">10:12</span>
                            </div>
                            <div
                              className="max-w-[85%] px-4 py-3 text-sm leading-relaxed rounded-[20px] rounded-bl-[4px] border shadow-sm bg-white text-[#1D1D1F]"
                              style={{
                                borderColor: "rgba(0,0,0,0.08)",
                                borderLeftWidth: "3.5px",
                                borderLeftColor: "#0D1B3D",
                              }}
                            >
                              <p>
                                Bonjour ! Décrivez votre demande ou joignez un justificatif, un conseiller vous répond directement ici.
                              </p>
                            </div>
                          </div>

                          {/* Message client avec PDF */}
                          <div className="flex flex-col items-end">
                            <div className="flex items-center gap-1.5 mb-1 px-1 text-[11px] font-medium text-slate-600">
                              <span className="flex items-center gap-1 text-slate-600">
                                <User className="w-3 h-3 text-slate-500" />
                                <span>Vous</span>
                              </span>
                              <span className="text-black/20">•</span>
                              <span className="font-mono text-[11px] text-slate-500">10:14</span>
                            </div>
                            <div className="max-w-[84%] px-4 py-3 text-sm leading-relaxed rounded-[20px] rounded-br-[4px] shadow-sm bg-[#0D1B3D] text-white space-y-2.5">
                              <p>
                                Bonjour, j&apos;ai déposé mon dossier d&apos;analyse ce matin. À quelle heure puis-je passer ?
                              </p>
                              <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium border bg-white/15 border-white/25">
                                <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 bg-white/20">
                                  <FileText className="w-3.5 h-3.5" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="truncate font-semibold">Reçu_104.pdf</p>
                                  <p className="text-[11px] opacity-80">420 Ko</p>
                                </div>
                              </div>
                              <div className="flex items-center justify-end gap-1 text-[11px] opacity-80">
                                <CheckCheck className="w-3.5 h-3.5" />
                              </div>
                            </div>
                          </div>

                          {/* Réponse directe conseiller */}
                          <div className="flex flex-col items-start">
                            <div className="flex items-center gap-1.5 mb-1 px-1 text-[11px] font-medium text-slate-600">
                              <span className="flex items-center gap-1 text-[#1D1D1F] font-semibold">
                                <Building2 className="w-3.5 h-3.5 text-slate-500" />
                                <span>Nadège • Accueil</span>
                              </span>
                              <span className="text-black/20">•</span>
                              <span className="font-mono text-[11px] text-slate-500">10:16</span>
                            </div>
                            <div
                              className="max-w-[85%] px-4 py-3 text-sm leading-relaxed rounded-[20px] rounded-bl-[4px] border shadow-sm bg-white text-[#1D1D1F]"
                              style={{
                                borderColor: "rgba(0,0,0,0.08)",
                                borderLeftWidth: "3.5px",
                                borderLeftColor: "#0D1B3D",
                              }}
                            >
                              <p>
                                Bonjour ! Vos résultats sont prêts et disponibles dès 14h30 au guichet 2.
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Bandeau d'alerte hors-application + compositeur réel */}
                        <div className="bg-gradient-to-t from-[#F5F5F7] via-[#F5F5F7] to-transparent px-4 pt-2 pb-6 space-y-2.5 shrink-0">
                          <div className="rounded-2xl bg-white/95 border border-black/[0.08] px-3.5 py-2 shadow-sm text-xs flex items-center gap-2 text-emerald-800 font-medium">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span className="truncate">
                              Alertes activées : notification instantanée
                            </span>
                          </div>

                          <div className="rounded-[24px] bg-white border border-black/[0.08] px-3 py-2 flex items-center gap-2.5 shadow-sm">
                            <span className="w-8 h-8 rounded-full bg-black/[0.05] text-slate-600 flex items-center justify-center shrink-0">
                              <Plus className="w-4 h-4" />
                            </span>
                            <span className="flex-1 text-sm text-slate-400 truncate">
                              Écrivez votre message...
                            </span>
                            <span className="w-8 h-8 rounded-full bg-[#0D1B3D] text-white flex items-center justify-center shrink-0">
                              <ArrowUp className="w-4 h-4" />
                            </span>
                          </div>
                        </div>
                      </div>
                    </Iphone15Pro>
                  </div>

                  {/* Callout 2 (bas droite) */}
                  <div
                    ref={calloutBottomRef}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-white text-[#0D1B3D] shadow-[0_18px_36px_-8px_rgba(13,27,61,0.4)] border border-slate-200 text-xs font-bold whitespace-nowrap mx-auto mt-5 w-fit lg:w-auto lg:mt-0 lg:absolute lg:bottom-10 lg:-right-32 z-40 will-change-transform"
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0" />
                    <span>Suivi équipe en direct · Zéro numéro perso</span>
                  </div>
                </div>
              </div>

              {/* Colonne droite libre */}
              <div className="hidden lg:block lg:col-span-4 order-3" aria-hidden="true" />
            </div>
          </div>

          {/* Synthèse éditoriale basse */}
          <div className="mt-10 sm:mt-12 lg:mt-14 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-end">
            <div className="lg:col-span-6">
              <p className="text-lg sm:text-xl font-extrabold text-[#0D1B3D] tracking-tight leading-snug">
                Le client garde un fil clair dans son navigateur.
                <span className="block text-slate-500 font-semibold">
                  Votre équipe collabore dans Zalisk.
                </span>
              </p>
            </div>

            <div className="lg:col-span-6 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-md">
                Pièces jointes, responsable désigné, partage contrôlé et notes internes confidentielles restent synchronisés sur chaque dossier.
              </p>

              <Link
                href="/entreprises"
                className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[#0D1B3D] hover:text-emerald-800 transition-colors shrink-0 whitespace-nowrap"
              >
                <span>Voir un portail public</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
