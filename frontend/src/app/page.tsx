import React from "react";
import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { HumanConnectionSection } from "@/components/landing/HumanConnectionSection";
import { ConversationNotTicketSection } from "@/components/landing/ConversationNotTicketSection";
import { AfricanSectorsSection } from "@/components/landing/AfricanSectorsSection";
import { CustomerExperienceSection } from "@/components/landing/CustomerExperienceSection";
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
        {/* 1. Hero: Pure Light Luxe */}
        <Hero />

        {/* 2. The Human Connection: Editorial Visual Experience */}
        <HumanConnectionSection />

        {/* 3. Core Philosophy: Pure Crisp White (Conversation != Ticket) */}
        <ConversationNotTicketSection />

        {/* 4. Local Sectors & Corridors: Tactile 3D Globe & Regional Hubs */}
        <AfricanSectorsSection />

        {/* 4.5. L'expérience côté client : Le parcours en trois temps */}
        <CustomerExperienceSection />

        {/* 5. Pricing & FAQ */}
        <PricingSection />
        <FAQSection />

        {/* 6. Final High-Voltage CTA Banner */}
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}