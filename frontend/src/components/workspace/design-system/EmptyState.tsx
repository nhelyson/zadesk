"use client";

import React from "react";
import { LucideIcon } from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  action,
  className,
}) => {
  return (
    <div
      className={cn(
        "relative rounded-2xl border border-dashed border-slate-300/80 bg-slate-50/50 p-8 sm:p-12 text-center flex flex-col items-center justify-center overflow-hidden",
        className
      )}
    >
      {/* Trame de fond subtile */}
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#0D1B3D_1px,transparent_1px)] [background-size:16px_16px]"
      />

      {Icon && (
        <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex items-center justify-center text-slate-500 mb-4 shrink-0">
          <Icon className="w-5 h-5" />
        </div>
      )}

      <h4 className="text-sm sm:text-base font-bold text-slate-800 tracking-tight mb-1.5">
        {title}
      </h4>
      <p className="text-xs sm:text-sm text-slate-500 max-w-md leading-relaxed mb-5">
        {description}
      </p>

      {action && <div className="mt-1">{action}</div>}
    </div>
  );
};
