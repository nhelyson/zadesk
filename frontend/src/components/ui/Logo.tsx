import React from "react";
import Link from "next/link";

interface LogoProps {
  className?: string;
  isDark?: boolean;
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  className = "",
  isDark = false,
  size = "md",
  showText = true,
}) => {
  const iconSizes = {
    sm: "w-7 h-7",
    md: "w-9 h-9",
    lg: "w-11 h-11",
  };

  const textSizes = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
  };

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* SVG Icon */}
      <svg
        className={`${iconSizes[size]} shrink-0 transition-transform duration-200 group-hover:scale-105`}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Outer Circular Arc with opening at top-right */}
        <path
          d="M 68 18 A 38 38 0 1 0 85 45"
          stroke={isDark ? "#FFFFFF" : "#0D1B3D"}
          strokeWidth="6"
          strokeLinecap="round"
        />

        {/* AI Sparkle Star (Emerald Green #22C55E) */}
        <path
          d="M 80 12 Q 80 20 88 20 Q 80 20 80 28 Q 80 20 72 20 Q 80 20 80 12 Z"
          fill="#22C55E"
        />

        {/* Navy/White Upper Z Stroke */}
        <path
          d="M 32 38 L 68 38 L 48 64"
          stroke={isDark ? "#FFFFFF" : "#0D1B3D"}
          strokeWidth="7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Emerald Green Lower Diagonal Accent Stroke */}
        <path
          d="M 28 68 L 72 68"
          stroke="#22C55E"
          strokeWidth="7"
          strokeLinecap="round"
        />
        <path
          d="M 28 68 L 42 50"
          stroke="#22C55E"
          strokeWidth="7"
          strokeLinecap="round"
        />
      </svg>

      {/* Clean Zadesk Wordmark (NO TAGLINE) */}
      {showText && (
        <span
          className={`font-black tracking-tight ${textSizes[size]} ${
            isDark ? "text-white" : "text-navy-900"
          }`}
        >
          Zadesk
        </span>
      )}
    </div>
  );
};

export default Logo;