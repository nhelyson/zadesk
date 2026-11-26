"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ArrowRight, ArrowLeft, Mail, Lock } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { loginApi, UserProfile, AuthResponse } from "@/lib/auth";
import { GoogleAuthButton } from "@/components/auth/GoogleAuthButton";
import { OtpVerificationForm } from "@/components/auth/OtpVerificationForm";
import { AuthFeedback } from "@/components/auth/AuthFeedback";
import { TurnstileWidget, TurnstileWidgetRef } from "@/components/auth/TurnstileWidget";
import gsap from "gsap";

export default function LoginPage() {
  const router = useRouter();
  const pageRef = useRef<HTMLDivElement>(null);
  
  // Desktop animation refs
  const desktopHeaderRef = useRef<HTMLElement>(null);
  const desktopTitleRef = useRef<HTMLHeadingElement>(null);
  const desktopManifestoRef = useRef<HTMLDivElement>(null);
  const desktopFormRef = useRef<HTMLDivElement>(null);

  // Mobile animation refs
  const mobileHeaderRef = useRef<HTMLDivElement>(null);
  const mobileCardRef = useRef<HTMLDivElement>(null);

  const turnstileRefMobile = useRef<TurnstileWidgetRef>(null);
  const turnstileRefDesktop = useRef<TurnstileWidgetRef>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  
  const [requiresCaptcha, setRequiresCaptcha] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // 2-Step OTP Challenge State
  const [otpChallenge, setOtpChallenge] = useState<{
    tempToken: string;
    email: string;
    purpose: "LOGIN";
  } | null>(null);

  // Selected commercial plan from URL or storage
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  // Pre-fill email and selectedPlan from query params
  useEffect(() => {
    if (typeof window !== "undefined") {
      const p = new URLSearchParams(window.location.search);
      const emailParam = p.get("email");
      if (emailParam) setEmail(emailParam);
      const rawPlan = p.get("plan") || sessionStorage.getItem("zadesk_selected_plan");
      if (rawPlan) {
        const norm = rawPlan.toLowerCase().trim();
        if (["decouverte", "starter", "pro", "entreprise"].includes(norm)) {
          setSelectedPlan(norm);
          sessionStorage.setItem("zadesk_selected_plan", norm);
        }
      }
    }
  }, []);

  // Snappy GSAP Timeline for Desktop and Mobile (respecting prefers-reduced-motion)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const isDesktop = window.innerWidth >= 1024;
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power2.out" } });

      if (isDesktop) {
        if (desktopHeaderRef.current) {
          tl.fromTo(desktopHeaderRef.current, { opacity: 0 }, { opacity: 1, duration: 0.35 });
        }
        if (desktopTitleRef.current) {
          tl.fromTo(
            desktopTitleRef.current,
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.45 },
            "-=0.2"
          );
        }
        if (desktopManifestoRef.current) {
          tl.fromTo(
            desktopManifestoRef.current,
            { opacity: 0, y: 14 },
            { opacity: 1, y: 0, duration: 0.35 },
            "-=0.25"
          );
        }
        if (desktopFormRef.current) {
          tl.fromTo(
            desktopFormRef.current,
            { opacity: 0, y: 16 },
            { opacity: 1, y: 0, duration: 0.4 },
            "-=0.25"
          );
        }
      } else {
        // Mobile Animation: Snappy, smooth, subtle native feel
        if (mobileHeaderRef.current) {
          tl.fromTo(
            mobileHeaderRef.current,
            { opacity: 0, y: -8 },
            { opacity: 1, y: 0, duration: 0.35 }
          );
        }
        if (mobileCardRef.current) {
          tl.fromTo(
            mobileCardRef.current,
            { opacity: 0, y: 24 },
            { opacity: 1, y: 0, duration: 0.4 },
            "-=0.15"
          );
        }
      }
    }, pageRef);

    return () => ctx.revert();
  }, []);

  const getDestination = (defaultRoute: string) => {
    if (typeof window !== "undefined") {
      const p = new URLSearchParams(window.location.search);
      const inviteToken = p.get("inviteToken");
      if (inviteToken) return `/invite/${inviteToken}`;
      const redirect = p.get("redirect");
      if (redirect) return redirect;
      if (defaultRoute === "/app/onboarding" && selectedPlan) {
        return `/app/onboarding?plan=${selectedPlan}`;
      }
    }
    return defaultRoute;
  };

  const handleGoogleSuccess = (user: UserProfile, result?: AuthResponse) => {
    setError(null);
    const hasWorkspace = Boolean(
      result?.hasWorkspace ?? (user.memberships && user.memberships.length > 0)
    );
    const targetRoute = getDestination(
      result?.redirectTo || (hasWorkspace ? "/app" : "/app/onboarding")
    );
    setSuccessMsg(`Connexion réussie. Bienvenue ${user.firstName || ""}.`);
    setTimeout(() => {
      router.push(targetRoute);
    }, 450);
  };

  const handleGoogleError = (errMsg: string) => {
    setError(errMsg);
    setSuccessMsg(null);
    setIsLoading(false);
  };

  const handleOtpSuccess = (user: UserProfile, result?: AuthResponse) => {
    setError(null);
    const hasWorkspace = Boolean(
      result?.hasWorkspace ?? (user.memberships && user.memberships.length > 0)
    );
    const targetRoute = getDestination(
      result?.redirectTo || (hasWorkspace ? "/app" : "/app/onboarding")
    );
    setSuccessMsg(`Authentification validée. Bienvenue ${user.firstName || ""}.`);
    setTimeout(() => {
      router.push(targetRoute);
    }, 450);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!email.trim() || !password) {
      setError("Veuillez renseigner votre adresse email et votre mot de passe.");
      return;
    }

    if (requiresCaptcha && !turnstileToken) {
      setError("Veuillez valider le test de sécurité Cloudflare Turnstile pour continuer.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await loginApi({
        email: email.trim(),
        password,
        turnstileToken: turnstileToken || undefined,
      });

      // If OTP verification is required (2FA)
      if (res.requiresOtp && res.tempToken) {
        setOtpChallenge({
          tempToken: res.tempToken,
          email: res.email || email.trim(),
          purpose: "LOGIN",
        });
      } else if (res.user) {
        const hasWorkspace = Boolean(
          res.hasWorkspace ?? (res.user.memberships && res.user.memberships.length > 0)
        );
        const targetRoute = getDestination(
          res.redirectTo || (hasWorkspace ? "/app" : "/app/onboarding")
        );
        setSuccessMsg(`Connexion réussie. Bienvenue ${res.user.firstName || ""}.`);
        setTimeout(() => {
          router.push(targetRoute);
        }, 450);
      }
    } catch (err: any) {
      if (err.requiresCaptcha) {
        setRequiresCaptcha(true);
      }
      setError(
        err.message ||
          "Identifiants incorrects. Veuillez vérifier votre adresse email et votre mot de passe."
      );
      if (requiresCaptcha) {
        setTurnstileToken(null);
        turnstileRefMobile.current?.reset();
        turnstileRefDesktop.current?.reset();
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      ref={pageRef}
      className="min-h-[100dvh] bg-white text-slate-900 font-sans selection:bg-emerald-500 selection:text-white flex flex-col justify-between overflow-x-hidden"
    >
      {/* ============================================================ */}
      {/* 1. VUE MOBILE NATIVE : ÉCRIN STATUTAIRE & FORMULAIRE ÉPURÉ   */}
      {/* ============================================================ */}
      <div className="w-full min-h-[100dvh] flex flex-col lg:hidden bg-white">
        
        {/* Bandeau haut — Identité Architecturale Zadesk (Écrin de marque majestueux & formes asymétriques) */}
        <div 
          ref={mobileHeaderRef}
          className="relative w-full h-[36dvh] min-h-[270px] max-h-[320px] pt-[max(2rem,env(safe-area-inset-top))] pb-8 px-6 bg-gradient-to-b from-[#050A17] via-[#0D1B3D] to-[#12234D] overflow-hidden flex items-center justify-center shrink-0"
        >
          {/* Formes asymétriques architecturales & lueurs de profondeur */}
          <div className="absolute -top-10 -right-12 w-72 h-72 rounded-3xl bg-gradient-to-br from-emerald-500/20 via-cyan-500/10 to-transparent border border-white/10 -rotate-12 pointer-events-none" />
          <div className="absolute -bottom-16 -left-12 w-64 h-64 rounded-full border border-emerald-400/25 bg-emerald-500/10 blur-[1px] pointer-events-none" />
          <div className="absolute top-10 left-6 w-24 h-24 rounded-2xl bg-cyan-400/15 blur-xl -rotate-45 pointer-events-none" />
          <div className="absolute top-0 right-1/3 w-px h-full bg-gradient-to-b from-transparent via-emerald-400/20 to-transparent rotate-[30deg] pointer-events-none" />

          {/* Logo Zadesk centré en majesté unique — sobre, statutaire et épuré */}
          <div className="relative z-10 flex flex-col items-center justify-center">
            <Link href="/" className="inline-flex items-center active:scale-95 transition-transform">
              <Logo size="lg" isDark={true} />
            </Link>
          </div>
        </div>

        {/* Feuille blanche ergonomique : flux vertical compact sans grand vide */}
        <div 
          ref={mobileCardRef}
          className="-mt-6 relative z-20 flex-1 bg-white rounded-t-[36px] shadow-2xl px-6 pt-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] flex flex-col justify-start"
        >
          {otpChallenge ? (
            <div className="space-y-6">
              <button
                type="button"
                onClick={() => setOtpChallenge(null)}
                className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-[#0D1B3D]"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Modifier les identifiants</span>
              </button>
              <OtpVerificationForm
                email={otpChallenge.email}
                tempToken={otpChallenge.tempToken}
                purpose={otpChallenge.purpose}
                onSuccess={handleOtpSuccess}
                onBack={() => setOtpChallenge(null)}
              />
            </div>
          ) : (
            <div className="space-y-3.5 w-full flex flex-col">
              
              {/* Titre sobre & élégant ancrant le formulaire */}
              <div className="text-left space-y-0.5 pb-0.5">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                  Connexion
                </h1>
                <p className="text-xs text-slate-500">
                  Accédez à votre espace entreprise et à vos équipes
                </p>
              </div>

              {/* Rappel éditorial de la formule choisie */}
              {selectedPlan && (
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/90 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                    <span className="font-semibold text-[#0D1B3D]">
                      Formule {selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1)}
                      {selectedPlan === "starter" && " • 10 000 FCFA/mois"}
                      {selectedPlan === "pro" && " • 45 000 FCFA/mois"}
                      {selectedPlan === "entreprise" && " • 150 000 FCFA/mois"}
                      {selectedPlan === "decouverte" && " • 0 FCFA permanent"}
                    </span>
                  </div>
                  <Link href="/tarifs" className="text-emerald-700 hover:text-emerald-800 font-semibold underline text-[11px] shrink-0">
                    Changer
                  </Link>
                </div>
              )}

              {/* Alertes d'erreur */}
              <AuthFeedback
                error={error}
                success={successMsg}
                onClearError={() => setError(null)}
                onClearSuccess={() => setSuccessMsg(null)}
              />

              {/* Formulaire mobile précis style shadcn/ui */}
              <form onSubmit={handleSubmit} className="space-y-3">
                
                {/* Email avec icône dynamique */}
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#0D1B3D] transition-colors">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="nom@votre-entreprise.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full h-12 rounded-2xl bg-slate-50 border border-slate-200/90 pl-10 pr-4 text-base text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-[#0D1B3D] focus:ring-2 focus:ring-[#0D1B3D]/10 transition-all"
                  />
                </div>

                {/* Mot de passe avec œil et icône Lock */}
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#0D1B3D] transition-colors">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Mot de passe"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full h-12 rounded-2xl bg-slate-50 border border-slate-200/90 pl-10 pr-11 text-base text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-[#0D1B3D] focus:ring-2 focus:ring-[#0D1B3D]/10 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-0 w-11 h-12 flex items-center justify-center text-slate-400 hover:text-slate-700 active:scale-90 transition-transform"
                    aria-label={showPassword ? "Masquer" : "Afficher"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Remember Me & Mot de passe oublié */}
                <div className="flex items-center justify-between pt-0.5 text-xs">
                  <label className="flex items-center gap-2 text-slate-600 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      id="login-remember-me-mobile"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 text-[#0D1B3D] accent-[#0D1B3D] cursor-pointer"
                    />
                    <span>Se souvenir de moi</span>
                  </label>

                  <Link
                    href="/forgot-password"
                    className="font-medium text-slate-600 hover:text-[#0D1B3D] underline"
                  >
                    Mot de passe oublié ?
                  </Link>
                </div>

                {/* Turnstile Captcha if required */}
                {requiresCaptcha && (
                  <div className="pt-1 pb-1">
                    <TurnstileWidget
                      ref={turnstileRefMobile}
                      onSuccess={(token) => {
                        setError(null);
                        setTurnstileToken(token);
                      }}
                      onError={(err) => {
                        setTurnstileToken(null);
                        setError(err || "Échec de validation de sécurité Cloudflare Turnstile.");
                      }}
                      onExpire={() => {
                        setTurnstileToken(null);
                      }}
                    />
                  </div>
                )}

                {/* Bouton principal tactile Zadesk Bleu Nuit */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 rounded-full bg-[#0D1B3D] hover:bg-[#152C61] active:scale-[0.985] text-white font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50 select-none group"
                >
                  {isLoading ? (
                    <span>Connexion en cours...</span>
                  ) : (
                    <>
                      <span>Se connecter</span>
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                    </>
                  )}
                </button>
              </form>

              {/* Séparateur minimal et aéré */}
              <div className="relative py-0.5 flex items-center justify-center">
                <div className="h-px bg-slate-200/90 w-full" />
                <span className="absolute bg-white px-3 text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                  ou
                </span>
              </div>

              {/* Bouton Google en format Pill doux (Inspiration Réf. 1) */}
              <div className="w-full flex justify-center">
                <GoogleAuthButton
                  mode="login"
                  shape="pill"
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                />
              </div>

              {/* Liens bas de page groupés naturellement */}
              <div className="pt-2 pb-1 text-center space-y-1">
                <p className="text-xs text-slate-600 font-medium">
                  Vous n&apos;avez pas encore de compte ?{" "}
                  <Link 
                    href={selectedPlan ? `/register?plan=${selectedPlan}` : "/register"} 
                    className="font-bold text-[#0D1B3D] underline"
                  >
                    Créer un compte
                  </Link>
                </p>
                <p className="text-[10px] text-slate-400">
                  En continuant, vous reconnaissez les Conditions de Zadesk.
                </p>
              </div>

            </div>
          )}
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. VUE DESKTOP GRAND ÉCRAN : DIPTYQUE ARCHITECTURAL ASYMÉTRIQUE 7/5 */}
      {/* ============================================================ */}
      <div className="hidden lg:flex flex-col min-h-screen w-full bg-[#FBFBFA]">
        
        {/* Navbar supérieure épurée Zadesk */}
        <header
          ref={desktopHeaderRef}
          className="w-full max-w-7xl mx-auto px-8 xl:px-12 pt-7 pb-4 flex items-center justify-between border-b border-slate-200/60"
        >
          <Link
            href="/"
            className="inline-flex items-center gap-2.5 group transition-transform duration-150 active:scale-[0.98]"
          >
            <Logo size="md" />
          </Link>

          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500 font-normal">
              Vous n&apos;avez pas encore de compte ?
            </span>
            <Link
              href={selectedPlan ? `/register?plan=${selectedPlan}` : "/register"}
              className="font-semibold text-xs text-[#0D1B3D] hover:text-emerald-700 px-4 py-2 rounded-full border border-slate-200/90 hover:border-slate-300 bg-white transition-all active:scale-[0.98] shadow-2xs select-none"
            >
              Créer un compte
            </Link>
          </div>
        </header>

        {/* Corps principal : Diptyque Asymétrique 7 cols (éditorial) / 5 cols (formulaire) */}
        <main className="flex-1 w-full max-w-7xl mx-auto px-8 xl:px-12 py-10 xl:py-16 flex items-center">
          <div className="w-full grid grid-cols-12 gap-12 xl:gap-20 items-center">
            
            {/* -------------------------------------------------------- */}
            {/* ZONE ÉDITORIALE GAUCHE (7 colonnes)                     */}
            {/* -------------------------------------------------------- */}
            <div className="col-span-7 space-y-8 pr-4">
              
              {/* Repère architectural sobre */}
              <div className="flex items-center gap-3">
                <span className="w-6 h-[1.5px] bg-[#0D1B3D]" />
                <span className="font-mono text-xs uppercase tracking-[0.2em] text-slate-500 font-semibold">
                  01 / ESPACE DE TRAVAIL
                </span>
              </div>

              {/* Titre Monumental en 3 lignes avec contrastes de graisses */}
              <h1
                ref={desktopTitleRef}
                className="text-5xl xl:text-6xl 2xl:text-7xl font-black text-[#0D1B3D] tracking-[-0.04em] leading-[0.98] uppercase select-none"
              >
                <span className="block font-black text-[#0D1B3D]">Retrouvez.</span>
                <span className="block font-black text-[#0D1B3D]">Vos équipes.</span>
                <span className="block font-normal text-slate-400">Vos conversations.</span>
              </h1>

              {/* Manifeste court & Mention de continuité */}
              <div ref={desktopManifestoRef} className="space-y-6 max-w-lg">
                <p className="text-base xl:text-lg text-slate-600 font-normal leading-relaxed">
                  Accédez à vos échanges clients, reprenez le fil de chaque relation et collaborez avec clarté.
                </p>

                <div className="pt-2 border-t border-slate-200/80">
                  <p className="font-mono text-xs text-slate-500 leading-relaxed">
                    Espace d&apos;équipe Zadesk • Connexion protégée pour vos collaborateurs
                  </p>
                </div>
              </div>

            </div>

            {/* -------------------------------------------------------- */}
            {/* POSTE DE SAISIE DROITE (5 colonnes)                     */}
            {/* -------------------------------------------------------- */}
            <div className="col-span-5">
              <div
                ref={desktopFormRef}
                className="w-full max-w-[460px] ml-auto bg-white rounded-3xl border border-slate-200/90 p-7 xl:p-9 shadow-sm space-y-5"
              >
                {otpChallenge ? (
                  <div className="space-y-6">
                    <button
                      type="button"
                      onClick={() => setOtpChallenge(null)}
                      className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-[#0D1B3D] transition-colors cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Modifier les identifiants</span>
                    </button>

                    <OtpVerificationForm
                      email={otpChallenge.email}
                      tempToken={otpChallenge.tempToken}
                      purpose={otpChallenge.purpose}
                      onSuccess={handleOtpSuccess}
                      onBack={() => setOtpChallenge(null)}
                    />
                  </div>
                ) : (
                  <div className="space-y-4">
                    
                    {/* Rappel éditorial de la formule choisie (Desktop) */}
                    {selectedPlan && (
                      <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/90 flex items-center justify-between text-xs animate-in fade-in duration-200">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                          <span className="font-semibold text-[#0D1B3D]">
                            Formule {selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1)}
                            {selectedPlan === "starter" && " • 10 000 FCFA/mois"}
                            {selectedPlan === "pro" && " • 45 000 FCFA/mois"}
                            {selectedPlan === "entreprise" && " • 150 000 FCFA/mois"}
                            {selectedPlan === "decouverte" && " • 0 FCFA permanent"}
                          </span>
                        </div>
                        <Link href="/tarifs" className="text-emerald-700 hover:text-emerald-800 font-semibold underline text-[11px] shrink-0">
                          Changer
                        </Link>
                      </div>
                    )}

                    {/* 1. Bouton officiel Google OAuth */}
                    <div className="w-full">
                      <GoogleAuthButton
                        mode="login"
                        onSuccess={handleGoogleSuccess}
                        onError={handleGoogleError}
                      />
                    </div>

                    {/* Séparateur graphique fin */}
                    <div className="relative py-1">
                      <div className="h-px bg-slate-200 w-full" />
                      <span className="absolute left-1/2 -translate-x-1/2 -top-2 bg-white px-3 font-mono text-[10px] text-slate-400 uppercase tracking-widest">
                        ou avec votre adresse e-mail
                      </span>
                    </div>

                    {/* Alertes d'erreur et retours */}
                    <AuthFeedback
                      error={error}
                      success={successMsg}
                      onClearError={() => setError(null)}
                      onClearSuccess={() => setSuccessMsg(null)}
                    />

                    {/* Formulaire de saisie haute rigueur */}
                    <form onSubmit={handleSubmit} className="space-y-3.5">
                      
                      {/* Adresse Email professionnelle */}
                      <div className="space-y-1 text-left">
                        <label
                          htmlFor="login-email-desktop"
                          className="block text-xs font-semibold text-slate-700 select-none tracking-tight"
                        >
                          Adresse e-mail
                        </label>
                        <input
                          id="login-email-desktop"
                          name="email"
                          type="email"
                          autoComplete="email"
                          placeholder="nom@votre-entreprise.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          className="w-full h-11 rounded-xl border border-slate-200 bg-white px-3.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0D1B3D] focus:ring-2 focus:ring-[#0D1B3D]/10 hover:border-slate-300 transition-all duration-150"
                        />
                      </div>

                      {/* Mot de passe avec lien récupération */}
                      <div className="space-y-1 text-left">
                        <div className="flex items-center justify-between">
                          <label
                            htmlFor="login-password-desktop"
                            className="block text-xs font-semibold text-slate-700 select-none tracking-tight"
                          >
                            Mot de passe
                          </label>
                          <Link
                            href="/forgot-password"
                            className="text-[11px] font-medium text-slate-500 hover:text-[#0D1B3D] transition-colors hover:underline"
                          >
                            Mot de passe oublié ?
                          </Link>
                        </div>

                        <div className="relative rounded-xl">
                          <input
                            id="login-password-desktop"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            autoComplete="current-password"
                            placeholder="••••••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full h-11 rounded-xl border border-slate-200 bg-white pl-3.5 pr-10 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0D1B3D] focus:ring-2 focus:ring-[#0D1B3D]/10 hover:border-slate-300 transition-all duration-150"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword((prev) => !prev)}
                            className="absolute inset-y-0 right-0 w-10 h-11 flex items-center justify-center text-slate-400 hover:text-slate-700 focus:outline-none cursor-pointer transition-colors"
                            aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                            tabIndex={-1}
                          >
                            {showPassword ? (
                              <EyeOff className="w-3.5 h-3.5" />
                            ) : (
                              <Eye className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Se souvenir de moi */}
                      <div className="pt-0.5">
                        <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                            className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer w-3.5 h-3.5"
                          />
                          <span>Se souvenir de moi</span>
                        </label>
                      </div>

                      {/* Cloudflare Turnstile if required */}
                      {requiresCaptcha && (
                        <div className="pt-1 pb-1">
                          <TurnstileWidget
                            ref={turnstileRefDesktop}
                            onSuccess={(token) => {
                              setError(null);
                              setTurnstileToken(token);
                            }}
                            onError={(err) => {
                              setTurnstileToken(null);
                              setError(err || "Échec de validation de sécurité Cloudflare Turnstile.");
                            }}
                            onExpire={() => {
                              setTurnstileToken(null);
                            }}
                          />
                        </div>
                      )}

                      {/* Bouton d'action principal Bleu Nuit dominant */}
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full h-11 bg-[#0D1B3D] hover:bg-[#152C61] active:scale-[0.985] text-white font-semibold rounded-xl text-xs sm:text-sm transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed select-none"
                      >
                        {isLoading ? (
                          <>
                            <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>Connexion en cours...</span>
                          </>
                        ) : (
                          <>
                            <span>Se connecter à mon espace</span>
                            <ArrowRight className="w-3.5 h-3.5 opacity-80" />
                          </>
                        )}
                      </button>
                    </form>

                  </div>
                )}
              </div>
            </div>

          </div>
        </main>

        {/* Footer sobre Zadesk */}
        <footer className="w-full max-w-7xl mx-auto px-8 xl:px-12 py-5 text-xs text-slate-400 flex items-center justify-between border-t border-slate-200/60">
          <div className="flex items-center gap-2">
            <span>© {new Date().getFullYear()} Zadesk</span>
            <span>•</span>
            <Link href="#" className="hover:text-slate-700 transition-colors underline-offset-2 hover:underline">
              Conditions d&apos;utilisation
            </Link>
            <span>•</span>
            <Link href="#" className="hover:text-slate-700 transition-colors underline-offset-2 hover:underline">
              Confidentialité
            </Link>
          </div>
          <div className="text-[11px] text-slate-400 font-mono">
            Zadesk · Plateforme Relation Client
          </div>
        </footer>

      </div>
    </div>
  );
}

