import React from "react";
import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { 
  MessageSquare, 
  Bot, 
  UserCheck, 
  CheckCircle2, 
  Clock,
  ArrowRight,
  ShieldCheck,
  Zap,
  Smartphone
} from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-[#F8FAFC] font-sans selection:bg-emerald-500 selection:text-white">
      
      {/* Left Form Column (Responsive & Focused) */}
      <div className="lg:col-span-6 xl:col-span-5 flex flex-col justify-between p-6 sm:p-10 lg:p-12 xl:p-16 min-h-screen">
        {/* Top Bar with Brand Logo */}
        <div className="flex items-center justify-between">
          <Link href="/" className="group inline-flex items-center">
            <Logo size="md" />
          </Link>
          <Link
            href="/"
            className="text-xs font-semibold text-slate-500 hover:text-navy-900 transition-colors flex items-center gap-1"
          >
            <span>Retour au site</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Center Form Area */}
        <div className="my-auto py-8 max-w-md w-full mx-auto">
          {children}
        </div>

        {/* Footer info */}
        <div className="text-xs text-slate-400 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-2 pt-4 border-t border-slate-200/60">
          <span>© {new Date().getFullYear()} Zadesk. Tous droits réservés.</span>
          <span className="text-slate-400">Plateforme SAV Entreprise</span>
        </div>
      </div>

      {/* Right Brand Showcase Column (Desktop Only — Rich Background Image & Zadesk Charter) */}
      <div className="hidden lg:col-span-6 xl:col-span-7 lg:flex flex-col justify-between p-12 xl:p-16 text-white relative overflow-hidden bg-[#070D1D]">
        
        {/* Background Workspace Photography with Dark Zadesk Gradient Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-luminosity pointer-events-none scale-105"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1556742049-0a67c5574f73?w=1400&auto=format&fit=crop&q=80')`,
          }}
        />

        {/* Deep Zadesk Atmospheric Tint & Radial Emerald Glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#070D1D]/95 via-[#0A1633]/90 to-[#070D1D]/98 pointer-events-none" />
        <div className="absolute top-1/4 right-10 w-[500px] h-[500px] bg-emerald-500/12 blur-[160px] rounded-full pointer-events-none" />
        <div className="absolute bottom-10 left-10 w-[450px] h-[450px] bg-teal-500/10 blur-[150px] rounded-full pointer-events-none" />

        {/* Subtle Grid Texture */}
        <div 
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.2) 1px, transparent 1px)`,
            backgroundSize: "32px 32px",
          }}
        />

        {/* Top Security Indicator */}
        <div className="z-10 flex items-center justify-end">
          <div className="flex items-center gap-1.5 text-xs text-slate-300/80 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full backdrop-blur-md">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Chiffrement bout-en-bout &amp; WhatsApp Officiel</span>
          </div>
        </div>

        {/* Main Value Proposition & Live Real-Time Pipeline Card */}
        <div className="space-y-8 max-w-xl z-10 my-auto py-8">
          
          <div className="space-y-4">
            <h2 className="text-3xl xl:text-4xl font-black text-white tracking-tight leading-[1.18]">
              Vos échanges WhatsApp transformés en{" "}
              <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                résolutions instantanées
              </span>
              .
            </h2>
            <p className="text-slate-300 text-sm xl:text-base font-normal leading-relaxed">
              Zadesk centralise toutes vos conversations clients, répond immédiatement aux questions courantes grâce à l&apos;IA et transmet les dossiers complexes à vos agents en 30 secondes.
            </p>
          </div>

          {/* SaaS Pipeline Flow Visual Card (Conversation -> IA -> Agent -> Résolution) */}
          <div className="rounded-2xl p-6 border border-white/10 bg-slate-900/60 backdrop-blur-2xl shadow-2xl shadow-black/40 space-y-5">
            
            <div className="flex items-center justify-between text-xs pb-3.5 border-b border-white/10">
              <span className="font-bold text-slate-200 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                Pipeline SAV en temps réel
              </span>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                100% synchronisé
              </span>
            </div>

            {/* 4 Pipeline Steps */}
            <div className="grid grid-cols-4 gap-2.5 text-center text-[11px]">
              
              <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1.5 transition-all hover:bg-white/10">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center mx-auto">
                  <Smartphone className="w-4 h-4" />
                </div>
                <p className="font-bold text-slate-200">1. Client</p>
                <p className="text-[10px] text-slate-400 truncate">WhatsApp Direct</p>
              </div>

              <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 space-y-1.5 shadow-lg shadow-emerald-950/40">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/30 text-emerald-300 flex items-center justify-center mx-auto">
                  <Bot className="w-4 h-4" />
                </div>
                <p className="font-bold text-emerald-300">2. IA SAV</p>
                <p className="text-[10px] text-emerald-400/90 truncate">Réponse en 30s</p>
              </div>

              <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1.5 transition-all hover:bg-white/10">
                <div className="w-8 h-8 rounded-lg bg-teal-500/15 text-teal-400 flex items-center justify-center mx-auto">
                  <UserCheck className="w-4 h-4" />
                </div>
                <p className="font-bold text-slate-200">3. Conseiller</p>
                <p className="text-[10px] text-slate-400 truncate">Historique prêt</p>
              </div>

              <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1.5 transition-all hover:bg-white/10">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <p className="font-bold text-slate-200">4. Résolu</p>
                <p className="text-[10px] text-slate-400 truncate">Client satisfait</p>
              </div>
            </div>

            {/* Live Metrics Row */}
            <div className="pt-2 flex items-center justify-between text-xs text-slate-300 border-t border-white/5">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                <span>Temps de réponse moyen : <strong className="text-white">30s chrono</strong></span>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                <Zap className="w-3.5 h-3.5" />
                <span>Zéro message perdu</span>
              </div>
            </div>

          </div>

        </div>

        {/* Bottom Guarantee Info */}
        <div className="text-xs text-slate-400 z-10 flex items-center justify-between border-t border-white/10 pt-4">
          <span>Conçu pour les entreprises d&apos;Afrique centrale</span>
          <span className="text-emerald-400 font-semibold">14 jours d&apos;essai gratuit</span>
        </div>

      </div>

    </div>
  );
}