"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { WifiOff, RefreshCw, ArrowLeft, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";

export default function OfflinePage() {
  const [isChecking, setIsChecking] = useState(false);
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      window.location.href = "/";
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const handleRetry = () => {
    setIsChecking(true);
    setTimeout(() => {
      if (navigator.onLine) {
        window.location.href = "/";
      } else {
        setIsChecking(false);
      }
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-between p-6 sm:p-10">
      
      {/* Top Header */}
      <div className="w-full max-w-md flex justify-between items-center">
        <Link href="/" className="flex items-center">
          <Logo size="md" />
        </Link>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
          <WifiOff className="w-3.5 h-3.5" />
          Hors-ligne
        </span>
      </div>

      {/* Main Offline Card */}
      <div className="w-full max-w-md text-center bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-xl shadow-slate-900/5 space-y-6 my-auto">
        
        <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto shadow-inner">
          <WifiOff className="w-8 h-8 animate-pulse" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-black text-navy-900 tracking-tight">
            Connexion interrompue
          </h1>
          <p className="text-slate-600 text-sm leading-relaxed">
            Vous êtes actuellement en mode hors-ligne. Les fonctionnalités en direct de Zadesk (WhatsApp, IA et tickets) nécessitent une connexion Internet active.
          </p>
        </div>

        <div className="pt-2 space-y-3">
          <Button
            variant="gradient"
            size="lg"
            className="w-full justify-center font-bold"
            onClick={handleRetry}
            isLoading={isChecking}
            leftIcon={<RefreshCw className={`w-4 h-4 ${isChecking ? "animate-spin" : ""}`} />}
          >
            Réessayer la connexion
          </Button>

          <Link href="/" className="block">
            <Button
              variant="ghost"
              size="md"
              className="w-full justify-center text-slate-600 hover:text-navy-900"
              leftIcon={<ArrowLeft className="w-4 h-4" />}
            >
              Retour à l&apos;accueil
            </Button>
          </Link>
        </div>

        <div className="pt-4 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-center gap-1.5">
          <ShieldAlert className="w-3.5 h-3.5 text-slate-400" />
          <span>Vos données locales sont sécurisées.</span>
        </div>

      </div>

      {/* Footer */}
      <div className="text-xs text-slate-500 text-center">
        © {new Date().getFullYear()} Zadesk. Tous droits réservés.
      </div>

    </div>
  );
}
