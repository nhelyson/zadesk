"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Mail, ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import { AuthHeader } from "@/components/auth/AuthHeader";
import { AuthFeedback } from "@/components/auth/AuthFeedback";
import { TurnstileWidget, TurnstileWidgetRef } from "@/components/auth/TurnstileWidget";
import { apiRequest } from "@/lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileRef = useRef<TurnstileWidgetRef>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError("Veuillez renseigner votre adresse email.");
      return;
    }

    if (!turnstileToken) {
      setError("Veuillez valider le test de sécurité Cloudflare Turnstile pour continuer.");
      return;
    }

    setIsLoading(true);

    try {
      // Trigger backend OTP/password reset request
      await apiRequest("/auth/otp/send", {
        method: "POST",
        body: JSON.stringify({
          email: email.trim(),
          purpose: "PASSWORD_RESET",
          turnstileToken,
        }),
      }).catch(() => {
        // Safe fallback even if account not found (security anti-enumeration)
      });

      setIsSubmitted(true);
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue lors de l'envoi de la demande.");
      setTurnstileToken(null);
      turnstileRef.current?.reset();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card
      className="p-7 sm:p-9 shadow-xl shadow-stone-200/50 border border-stone-200/80 rounded-3xl bg-white transition-all"
    >
      <AuthHeader
        title="Mot de passe oublié ?"
        description="Entrez votre adresse email pour recevoir les instructions de réinitialisation."
        align="center"
      />

      <AuthFeedback error={error} onClearError={() => setError(null)} />

      {!isSubmitted ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Adresse email"
            placeholder="nom@votre-entreprise.com"
            type="email"
            name="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            leftIcon={<Mail className="w-4 h-4" />}
          />

          <TurnstileWidget
            ref={turnstileRef}
            size="compact"
            onSuccess={(token) => {
              setError(null);
              setTurnstileToken(token);
            }}
            onError={(err) => {
              setTurnstileToken(null);
              setError(err || "Échec de validation de sécurité Turnstile.");
            }}
            onExpire={() => {
              setTurnstileToken(null);
            }}
          />

          <Button
            type="submit"
            variant="gradient"
            size="lg"
            className="w-full justify-center mt-2 font-bold shadow-md shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all cursor-pointer"
            isLoading={isLoading}
            disabled={!turnstileToken}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Envoyer les instructions
          </Button>
        </form>
      ) : (
        <div className="p-5 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 text-center space-y-3 animate-fade-in">
          <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto font-bold shadow-xs">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <h2 className="font-bold text-slate-900 text-sm">Instructions envoyées !</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            Si un compte est associé à <strong className="text-slate-900">{email}</strong>, un lien et un code de réinitialisation vous ont été envoyés par email.
          </p>
        </div>
      )}

      <div className="mt-6 pt-5 border-t border-slate-100 text-center">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Retour à la page de connexion</span>
        </Link>
      </div>
    </Card>
  );
}

