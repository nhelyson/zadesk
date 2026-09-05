"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Phone, ArrowLeft, Send } from "lucide-react";

export default function ForgotPasswordPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
    }, 1000);
  };

  return (
    <Card glass className="p-8 shadow-xl border-slate-200/80">
      <div className="mb-6 space-y-2">
        <Badge variant="neutral">Récupération de Compte</Badge>
        <h1 className="text-2xl font-black text-navy-900 tracking-tight">
          Mot de Passe Oublié ?
        </h1>
        <p className="text-xs text-slate-600">
          Entrez votre numéro de téléphone congolais pour recevoir un code de réinitialisation sécurisé par SMS ou WhatsApp.
        </p>
      </div>

      {!isSubmitted ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Numéro de Téléphone"
            placeholder="+242 06 942 09 72"
            type="tel"
            required
            leftIcon={<Phone className="w-4 h-4" />}
            helperText="Numéro associé à votre compte agent Zadesk"
          />

          <Button
            type="submit"
            variant="gradient"
            className="w-full justify-center"
            size="lg"
            isLoading={isLoading}
            rightIcon={<Send className="w-4 h-4" />}
          >
            Envoyer le code de réinitialisation
          </Button>
        </form>
      ) : (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
          <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto font-bold">
            ✓
          </div>
          <h3 className="font-bold text-navy-900 text-sm">Code envoyé avec succès !</h3>
          <p className="text-xs text-slate-600">
            Un code à 6 chiffres a été envoyé par SMS/WhatsApp à votre numéro.
          </p>
        </div>
      )}

      <div className="mt-8 pt-6 border-t border-slate-100 text-center">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-navy-900"
        >
          <ArrowLeft className="w-4 h-4" /> Retour à la page de connexion
        </Link>
      </div>
    </Card>
  );
}
