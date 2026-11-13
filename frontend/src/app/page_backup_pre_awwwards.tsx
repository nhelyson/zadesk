import React from "react";
import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { TrustBand } from "@/components/landing/TrustBand";
import { BusinessPainRuptureSection } from "@/components/landing/BusinessPainRuptureSection";
import { ConversationNotTicketSection } from "@/components/landing/ConversationNotTicketSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { WhyZadeskSection } from "@/components/landing/WhyZadeskSection";
import { AudienceSection } from "@/components/landing/AudienceSection";
import { CreateSAVPreviewSection } from "@/components/landing/CreateSAVPreviewSection";
import { AfricanSectorsSection } from "@/components/landing/AfricanSectorsSection";
import { PricingSection } from "@/components/landing/PricingSection";
import { FAQSection } from "@/components/landing/FAQSection";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { Footer } from "@/components/landing/Footer";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Zadesk — Votre SAV, plus simple, plus humain",
  description: "Offrez à vos clients un service après-vente disponible, réactif et personnalisé. Zadesk vous permet de répondre à leurs demandes, de les accompagner au quotidien et d'assurer un suivi attentif jusqu'à la résolution de chaque problème.",
};


export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-white selection:bg-emerald-500 selection:text-white">
      <Navbar />
      <main className="flex-1">
        {/* 1. Hero: Dark Obsidian & Photo of Amazed Customer + Floating WhatsApp Bubbles */}
        <Hero />

        {/* 2. Trust Band: Bright White High-Contrast Metrics */}
        <TrustBand />

        {/* 3. Color Rupture 1: Deep Crimson Pain Section (The real cost of WhatsApp chaos) */}
        <BusinessPainRuptureSection />

        {/* 4. Core Philosophy: Pure Crisp White (Conversation != Ticket) */}
        <ConversationNotTicketSection />

        {/* 5. Color Rupture 2: Deep Midnight Indigo (7-Step Storytelling Scroll) */}
        <HowItWorksSection />

        {/* 6. Why Zadesk: Crisp Light Value Pillars (Selling Business Results) */}
        <WhyZadeskSection />

        {/* 7. Audience Paths: Dual Audience Choice */}
        <AudienceSection />

        {/* 8. Setup Simulator: 7 Simple Steps */}
        <CreateSAVPreviewSection />

        {/* 9. Local Sector Cards: Commerce, Santé, Éducation, Distribution */}
        <AfricanSectorsSection />

        {/* 10. Pricing & FAQ */}
        <PricingSection />
        <FAQSection />

        {/* 11. Final High-Voltage CTA Banner */}
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}