"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ArrowRight, ArrowLeft } from "lucide-react";
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

  // Snappy GSAP Timeline exclusively for Desktop (respecting prefers-reduced-motion)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const isDesktop = window.innerWidth >= 1024;
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!isDesktop || prefersReduced) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power2.out" } });
      
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
      {/* 1. VUE MOBILE NATIVE : EXACT DESIGN SYSTÈME REGISTER         */}
      {/* ============================================================ */}
      <div className="w-full min-h-[100dvh] flex flex-col lg:hidden bg-white">
        
        {/* Bandeau haut — Identité Architecturale Zadesk (Hauteur affirmée ~340px) */}
        <div className="relative w-full min-h-[340px] pt-[max(1.25rem,env(safe-area-inset-top))] pb-12 px-6 bg-gradient-to-b from-[#060B18] via-[#0D1B3D] to-[#152C61] overflow-hidden flex flex-col justify-between">

          {/* Ondes douces & subtiles lueurs émeraude de marque */}
          <div className="absolute -top-12 -right-8 w-60 h-60 rounded-full bg-emerald-500/15 blur-2xl pointer-events-none" />
          <div className="absolute bottom-4 -left-10 w-48 h-48 rounded-full bg-emerald-400/10 blur-xl pointer-events-none" />

          {/* Bouton bascule — coin supérieur droit */}
          <div className="relative z-10 flex items-center justify-end">
            <Link
              href="/register"
              className="text-xs font-semibold text-white/90 hover:text-white bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/20 active:scale-95 transition-all select-none shadow-xs"
            >
              Créer un compte
            </Link>
          </div>

          {/* Logo Zadesk centré en majesté — statutaire et universel */}
          <div className="relative z-10 flex flex-col items-center justify-center py-4">
            <Link href="/" className="inline-flex items-center active:scale-95 transition-transform">
              <Logo size="lg" isDark={true} />
            </Link>
          </div>

          {/* Titre & sous-titre */}
          <div className="relative z-10 text-center space-y-1.5 pb-2">
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight uppercase">
              Bon retour
            </h1>
            <p className="text-xs text-slate-300 font-normal">
              Accédez à vos échanges clients et à votre équipe
            </p>
          </div>
        </div>

        {/* Feuille blanche ergonomique Android/iOS : calée naturellement sans vide */}
        <div className="-mt-5 relative z-20 flex-1 bg-white rounded-t-3xl shadow-xl px-6 pt-3 pb-[max(2rem,env(safe-area-inset-bottom))] flex flex-col justify-start">
          {/* Poignée tactile native (Sheet Handle) */}
          <div className="w-10 h-1 rounded-full bg-slate-300/80 mx-auto mb-5 shrink-0" />
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
            <div className="space-y-5">
              
              {/* Rappel éditorial de la formule choisie */}
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

              {/* Bouton Google Pill au sommet de la carte */}
              <div className="w-full">
                <GoogleAuthButton
                  mode="login"
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                />
              </div>

              {/* Séparateur fin */}
              <div className="relative py-1 text-center">
                <div className="h-px bg-slate-200 w-full" />
                <span className="relative -top-2.5 bg-white px-3 text-[11px] font-medium text-slate-400">
                  ou avec votre adresse e-mail
                </span>
              </div>

              {/* Alertes d'erreur */}
              <AuthFeedback
                error={error}
                success={successMsg}
                onClearError={() => setError(null)}
                onClearSuccess={() => setSuccessMsg(null)}
              />

              {/* Formulaire mobile aux inputs doux */}
              <form onSubmit={handleSubmit} className="space-y-3.5">
                
                {/* Email */}
                <input
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="nom@votre-entreprise.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full h-12 rounded-2xl bg-slate-50 border border-slate-200/80 px-4 text-base text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-[#0D1B3D] focus:ring-2 focus:ring-[#0D1B3D]/10 transition-all"
                />

                {/* Mot de passe avec œil */}
                <div className="relative">
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Mot de passe"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full h-12 rounded-2xl bg-slate-50 border border-slate-200/80 pl-4 pr-12 text-base text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-[#0D1B3D] focus:ring-2 focus:ring-[#0D1B3D]/10 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-0 w-12 h-12 flex items-center justify-center text-slate-400 hover:text-slate-700"
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
                      className="rounded border-slate-300 cursor-pointer w-3.5 h-3.5 accent-emerald-500"
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

                {/* Bouton dominant pilule Zadesk Bleu Nuit */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 rounded-full bg-[#0D1B3D] hover:bg-[#152C61] active:scale-[0.985] text-white font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50 select-none"
                >
                  {isLoading ? <span>Connexion en cours...</span> : <span>Se connecter</span>}
                </button>
              </form>

              {/* Liens bas de page */}
              <div className="pt-2 text-center space-y-2">
                <p className="text-[11px] text-slate-400">
                  En continuant, vous reconnaissez la Politique de confidentialité et les Conditions de Zadesk.
                </p>
                <p className="text-xs text-slate-600 font-medium pt-1">
                  Vous n&apos;avez pas encore de compte ?{" "}
                  <Link 
                    href={selectedPlan ? `/register?plan=${selectedPlan}` : "/register"} 
                    className="font-bold text-[#0D1B3D] underline"
                  >
                    Créer un compte
                  </Link>
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

