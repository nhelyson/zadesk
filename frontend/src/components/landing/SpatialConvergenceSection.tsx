"use client";

import React from "react";
import { HumanStoriesTriptych } from "./HumanStoriesTriptych";
import { RevealOnScroll } from "./motion/RevealOnScroll";

export const SpatialConvergenceSection = () => {
  return (
    <section data-nav-theme="light" className="py-12 sm:py-20 bg-white border-b border-slate-200/80 text-slate-900 relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Asymmetrical Editorial Section: Title is built directly into the left column of HumanStoriesTriptych */}
        <RevealOnScroll direction="up">
          <HumanStoriesTriptych />
        </RevealOnScroll>

      </div>
    </section>
  );
};
