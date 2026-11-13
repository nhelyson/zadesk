import React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "navy" | "gradient";
  size?: "sm" | "md" | "lg" | "xl";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className,
  variant = "primary",
  size = "md",
  isLoading = false,
  leftIcon,
  rightIcon,
  disabled,
  ...props
}) => {
  const baseStyles =
    "relative inline-flex items-center justify-center font-bold transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] rounded-2xl focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.975] cursor-pointer select-none";

  const sizeStyles = {
    sm: "text-xs px-3.5 py-1.5 h-8 gap-1.5 rounded-xl",
    md: "text-sm px-4 py-2.5 h-10 gap-2 rounded-xl",
    lg: "text-sm sm:text-base px-5 py-3 h-11 sm:h-12 gap-2 rounded-2xl shadow-sm",
    xl: "text-base px-6 py-3.5 h-13 gap-2.5 rounded-2xl shadow-md",
  };

  const variantStyles = {
    primary:
      "bg-emerald-600 hover:bg-emerald-500 text-white focus:ring-emerald-500 shadow-emerald-500/20 hover:shadow-emerald-500/30 shadow-md border-t border-white/20",
    secondary:
      "bg-navy-900 hover:bg-navy-800 text-white focus:ring-navy-900 shadow-navy-900/10 border-t border-white/10",
    navy: "bg-[#0D1B3D] hover:bg-[#152C61] text-white focus:ring-[#0D1B3D] border-t border-white/10",
    gradient:
      "bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white shadow-emerald-500/25 hover:shadow-emerald-500/40 shadow-md border-t border-white/25",
    outline:
      "border border-slate-200/90 hover:border-slate-300 text-slate-800 bg-white/90 backdrop-blur-md hover:bg-white focus:ring-slate-300 shadow-xs",
    ghost: "text-slate-700 hover:bg-slate-100/80 hover:text-navy-900 focus:ring-slate-200",
  };

  return (
    <button
      className={cn(baseStyles, sizeStyles[size], variantStyles[variant], className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin shrink-0 mr-2" />
          <span>{children}</span>
        </>
      ) : (
        <>
          {leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>}
          <span>{children}</span>
          {rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}
        </>
      )}
    </button>
  );
};
