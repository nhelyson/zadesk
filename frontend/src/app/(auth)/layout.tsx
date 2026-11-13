import React from "react";
import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { ArrowLeft, Lock, Star, Sparkles, CheckCircle2 } from "lucide-react";

import { AuthHeroBanner } from "@/components/auth/AuthHeroBanner";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-emerald-500 selection:text-white flex flex-col justify-between">
      {/* Top Navbar */}
      <header className="w-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 pt-6 pb-2 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 group transition-transform duration-150 hover:scale-[1.01]"
        >
          <Logo size="md" />
        </Link>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-navy-900 px-3.5 py-1.5 rounded-full hover:bg-slate-200/70 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Retour au site</span>
        </Link>
      </header>

      {/* Main 2-Column Grid (Desktop) / 1-Column (Mobile) */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 py-6 lg:py-10 flex items-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
          {/* Left Column: Form & Clean Tagline Header */}
          <div className="lg:col-span-6 xl:col-span-6 flex flex-col justify-center max-w-lg mx-auto lg:mx-0 w-full animate-fade-in">
            {children}
          </div>

          {/* Right Column: Hero Image with Floating Animated WhatsApp Bubbles (Dynamic by route) */}
          <div className="hidden lg:block lg:col-span-6 xl:col-span-6">
            <AuthHeroBanner />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 py-5 text-[12px] text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-200/80">
        <div className="flex items-center gap-2">
          <span>© {new Date().getFullYear()} Zadesk</span>
          <span>•</span>
          <Link href="#" className="hover:text-slate-700 transition-colors underline-offset-2 hover:underline">
            Conditions d&apos;utilisation
          </Link>
          <span>•</span>
          <Link href="#" className="hover:text-slate-700 transition-colors underline-offset-2 hover:underline">
            Politique de confidentialité
          </Link>
        </div>
        <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
          <Lock className="w-3 h-3 text-emerald-600" />
          <span>Connexion sécurisée SSL 256-bit</span>
        </div>
      </footer>
    </div>
  );
}