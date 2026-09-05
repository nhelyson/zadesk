"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Mail, Lock, User, ArrowRight, Eye, EyeOff, AlertCircle, CheckCircle2 } from "lucide-react";
import { registerApi, UserProfile } from "@/lib/auth";
import { GoogleAuthButton } from "@/components/auth/GoogleAuthButton";
import { OtpVerificationForm } from "@/components/auth/OtpVerificationForm";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    acceptTerms: true,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // 2-Step OTP Challenge State
  const [otpChallenge, setOtpChallenge] = useState<{
    tempToken: string;
    email: string;
    purpose: "REGISTRATION";
  } | null>(null);

  const handleGoogleSuccess = (user: UserProfile) => {
    setError(null);
    setSuccessMsg(`Compte configuré avec succès ! Bienvenue ${user.firstName || ""}.`);
    setTimeout(() => {
      router.push("/app/onboarding");
    }, 700);
  };

  const handleGoogleError = (errMsg: string) => {
    setError(errMsg);
  };

  const handleOtpSuccess = (user: UserProfile) => {
    setError(null);
    setSuccessMsg(`Compte validé avec succès ! Bienvenue ${user.firstName || ""}.`);
    setTimeout(() => {
      router.push("/app/onboarding");
    }, 700);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setError("Veuillez renseigner votre prénom et votre nom.");
      return;
    }

    if (!formData.email.trim()) {
      setError("Veuillez renseigner une adresse email valide.");
      return;
    }

    if (formData.password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }

    if (!formData.acceptTerms) {
      setError("Veuillez accepter les Conditions Générales pour continuer.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await registerApi({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        password: formData.password,
      });

      // If OTP verification is required (Standard 2FA on signup)
      if (res.requiresOtp && res.tempToken) {
        setOtpChallenge({
          tempToken: res.tempToken,
          email: res.email || formData.email.trim(),
          purpose: "REGISTRATION",
        });
      } else if (res.user) {
        setSuccessMsg(`Compte créé avec succès ! Bienvenue ${res.user.firstName || ""}.`);
        setTimeout(() => {
          router.push("/");
        }, 700);
      }
    } catch (err: any) {
      setError(
        err.message ||
          "Erreur lors de la création du compte. Cette adresse email est peut-être déjà utilisée."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card
      glass
      className="p-7 sm:p-9 shadow-xl shadow-slate-200/50 border border-slate-200/90 rounded-3xl bg-white/98 backdrop-blur-xl"
    >
      {/* If OTP challenge is active, show the 6-digit verification interface */}
      {otpChallenge ? (
        <OtpVerificationForm
          email={otpChallenge.email}
          tempToken={otpChallenge.tempToken}
          purpose={otpChallenge.purpose}
          onSuccess={handleOtpSuccess}
          onBack={() => setOtpChallenge(null)}
        />
      ) : (
        <>
          {/* Header (Linear / Vercel style clarity) */}
          <div className="mb-6 space-y-1 text-left">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
              Créez votre espace Zadesk.
            </h1>
            <p className="text-sm text-slate-600 font-normal">
              Commencez à construire votre SAV.
            </p>
          </div>

          {/* Instant Feedback Alerts */}
          {successMsg && (
            <div className="mb-5 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in duration-200">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {error && (
            <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2.5 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          {/* 1. Primary Low-Friction Method: Google OAuth */}
          <div className="space-y-4">
            <GoogleAuthButton
              mode="register"
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
            />

            {/* Crisp, Minimal Separator */}
            <div className="relative my-5 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200/80" />
              </div>
              <span className="relative bg-white px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider select-none">
                ou avec votre email
              </span>
            </div>

            {/* 2. Streamlined Registration Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* First & Last Name (2 columns) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Prénom"
                  placeholder="Japhet"
                  name="firstName"
                  autoComplete="given-name"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  leftIcon={<User className="w-4 h-4" />}
                />
                <Input
                  label="Nom"
                  placeholder="Itoua"
                  name="lastName"
                  autoComplete="family-name"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Email */}
              <Input
                label="Adresse email"
                placeholder="nom@votre-entreprise.com"
                type="email"
                name="email"
                autoComplete="email"
                value={formData.email}
                onChange={handleChange}
                required
                leftIcon={<Mail className="w-4 h-4" />}
              />

              {/* Password with inline toggle */}
              <div className="space-y-1.5 text-left">
                <label
                  htmlFor="register-password"
                  className="block text-xs font-semibold text-slate-700 select-none tracking-tight"
                >
                  Mot de passe
                </label>

                <div className="relative rounded-xl">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>

                  <input
                    id="register-password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    autoComplete="new-password"
                    placeholder="Min. 8 caractères"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="w-full h-11 rounded-xl border border-slate-200 bg-white px-3.5 pl-10 pr-10 text-sm text-slate-900 placeholder:text-slate-400 transition-all duration-150 ease-out hover:border-slate-300 focus:outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/15 focus:bg-white"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-700 focus:outline-none cursor-pointer transition-colors"
                    aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Terms Checkbox */}
              <div className="pt-0.5">
                <label className="flex items-start gap-2 text-xs text-slate-600 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formData.acceptTerms}
                    onChange={(e) => setFormData({ ...formData, acceptTerms: e.target.checked })}
                    required
                    className="mt-0.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer w-3.5 h-3.5"
                  />
                  <span className="leading-snug">
                    J&apos;accepte les{" "}
                    <Link href="#" className="font-semibold text-emerald-700 hover:underline">
                      Conditions Générales
                    </Link>{" "}
                    et la{" "}
                    <Link href="#" className="font-semibold text-emerald-700 hover:underline">
                      Politique de Confidentialité
                    </Link>
                    .
                  </span>
                </label>
              </div>

              {/* Primary Action Button */}
              <Button
                type="submit"
                variant="gradient"
                size="lg"
                className="w-full justify-center mt-2 font-bold shadow-md shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all"
                isLoading={isLoading}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Continuer
              </Button>
            </form>
          </div>

          {/* Secondary Switcher Link */}
          <div className="mt-7 pt-5 border-t border-slate-100 text-center text-xs text-slate-600">
            Vous avez déjà un compte ?{" "}
            <Link
              href="/login"
              className="font-bold text-emerald-700 hover:text-emerald-800 underline transition-colors"
            >
              Se connecter
            </Link>
          </div>
        </>
      )}
    </Card>
  );
}