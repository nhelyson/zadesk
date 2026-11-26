"use client";

import React from "react";
import { motion, HTMLMotionProps } from "motion/react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}

interface PressableProps extends HTMLMotionProps<"button"> {
  variant?: "primary" | "secondary" | "ghost" | "dark" | "outline";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

export const Pressable = React.forwardRef<HTMLButtonElement, PressableProps>(
  (
    {
      className,
      variant = "secondary",
      size = "md",
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <motion.button
        ref={ref}
        disabled={disabled}
        whileTap={disabled ? undefined : { scale: 0.98 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        style={{
          WebkitTapHighlightColor: "transparent",
          touchAction: "manipulation",
          userSelect: "none",
        }}
        className={cn(
          "inline-flex items-center justify-center font-semibold rounded-xl transition-colors duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 focus-visible:ring-offset-1",
          // Sizes
          size === "sm" && "text-xs px-3 py-1.5 min-h-[36px] gap-1.5",
          size === "md" && "text-xs sm:text-sm px-4 py-2 min-h-[40px] gap-2",
          size === "lg" && "text-sm sm:text-base px-5 py-2.5 min-h-[44px] gap-2.5",

          // Variants
          variant === "primary" &&
            "bg-emerald-600 text-white shadow-sm hover:bg-emerald-500 border border-emerald-700/50",
          variant === "secondary" &&
            "bg-white text-slate-800 border border-slate-200/90 shadow-sm hover:bg-slate-50",
          variant === "ghost" &&
            "bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900",
          variant === "dark" &&
            "bg-[#0D1B3D] text-white shadow-sm hover:bg-[#152C61] border border-slate-800",
          variant === "outline" &&
            "bg-transparent text-slate-700 border border-slate-200 hover:bg-slate-50",

          className
        )}
        {...props}
      >
        {children}
      </motion.button>
    );
  }
);

Pressable.displayName = "Pressable";
