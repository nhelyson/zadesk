"use client";

import React, { useEffect, useRef, useState } from "react";

interface Iphone15ProProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Cadre vectoriel iPhone 15 Pro haute précision (proportions Apple 433:882)
 * avec écran réel 390x844 mis à l'échelle et Dynamic Island superposé.
 */
export const Iphone15Pro: React.FC<Iphone15ProProps> = ({
  children,
  className = "",
}) => {
  const screenSlotRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.635);

  useEffect(() => {
    const el = screenSlotRef.current;
    if (!el) return;

    const updateScale = () => {
      const width = el.clientWidth;
      if (width > 0) {
        setScale(width / 390);
      }
    };

    updateScale();
    const observer = new ResizeObserver(updateScale);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      className={`relative select-none aspect-[433/882] ${className}`}
    >
      {/* Écran réel 390x844 placé sous le masque vectoriel */}
      <div
        ref={screenSlotRef}
        className="absolute overflow-hidden bg-[#F5F5F7] z-10"
        style={{
          left: "5.8%",
          top: "2.55%",
          width: "88.4%",
          height: "94.9%",
          borderRadius: "12.5% / 5.9%",
        }}
      >
        <div
          className="w-[390px] h-[844px] origin-top-left overflow-hidden flex flex-col bg-[#F5F5F7]"
          style={{
            transform: `scale(${scale})`,
          }}
        >
          {children}
        </div>
      </div>

      {/* Châssis SVG Apple haute précision superposé (bords titane, bezel, Dynamic Island, boutons) */}
      <svg
        viewBox="0 0 433 882"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-20 w-full h-full pointer-events-none drop-shadow-[0_38px_75px_rgba(13,27,61,0.48)]"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="iphone15-titanium" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#64748B" />
            <stop offset="22%" stopColor="#CBD5E1" />
            <stop offset="50%" stopColor="#334155" />
            <stop offset="82%" stopColor="#94A3B8" />
            <stop offset="100%" stopColor="#1E293B" />
          </linearGradient>
          <linearGradient id="iphone15-glass-sheen" x1="0%" y1="0%" x2="100%" y2="85%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.16" />
            <stop offset="32%" stopColor="#FFFFFF" stopOpacity="0.03" />
            <stop offset="60%" stopColor="#FFFFFF" stopOpacity="0" />
          </linearGradient>
          {/* Masque qui découpe exactement l'écran interne */}
          <mask id="iphone15-screen-hole">
            <rect width="433" height="882" fill="white" />
            <rect x="26" y="24" width="381" height="834" rx="54" fill="black" />
          </mask>
        </defs>

        {/* Boutons physiques latéraux gauche (Action + Volume + / -) */}
        <rect x="7" y="168" width="4" height="30" rx="2" fill="#475569" />
        <rect x="7" y="222" width="4" height="62" rx="2" fill="#475569" />
        <rect x="7" y="300" width="4" height="62" rx="2" fill="#475569" />
        {/* Bouton latéral droit (Power) */}
        <rect x="422" y="252" width="4" height="94" rx="2" fill="#475569" />

        {/* Châssis extérieur titane brossé (masqué autour de l'écran) */}
        <rect
          x="10"
          y="8"
          width="413"
          height="866"
          rx="72"
          fill="url(#iphone15-titanium)"
          mask="url(#iphone15-screen-hole)"
        />

        {/* Cadre interne noir mat Apple */}
        <rect
          x="14"
          y="12"
          width="405"
          height="858"
          rx="68"
          fill="#0B0D12"
          mask="url(#iphone15-screen-hole)"
        />

        {/* Liseré intérieur subtil autour de l'écran */}
        <rect
          x="25.5"
          y="23.5"
          width="382"
          height="835"
          rx="54.5"
          stroke="#1E293B"
          strokeWidth="1.2"
        />

        {/* Dynamic Island réaliste (pilule + capteur optique) */}
        <rect x="154" y="36" width="125" height="35" rx="17.5" fill="#050608" />
        <circle cx="256" cy="53.5" r="7.5" fill="#0F172A" stroke="#1E293B" strokeWidth="1" />
        <circle cx="256" cy="53.5" r="3.2" fill="#1E3A8A" opacity="0.7" />
        <circle cx="254.8" cy="52.3" r="1.1" fill="#93C5FD" opacity="0.9" />

        {/* Reflet vitre diagonal discret */}
        <rect
          x="26"
          y="24"
          width="381"
          height="834"
          rx="54"
          fill="url(#iphone15-glass-sheen)"
        />
      </svg>
    </div>
  );
};
