import React, { useState } from "react";
import Link from "next/link";
import { Lock, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface PasswordFieldProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  forgotPasswordHref?: string;
  error?: string;
}

export const PasswordField = React.forwardRef<
  HTMLInputElement,
  PasswordFieldProps
>(({ className, label = "Mot de passe", forgotPasswordHref, error, id, ...props }, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  const inputId = id || "auth-password-input";

  return (
    <div className="w-full space-y-1.5 text-left">
      <div className="flex items-center justify-between">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold text-slate-700 select-none tracking-tight"
          >
            {label}
          </label>
        )}
        {forgotPasswordHref && (
          <Link
            href={forgotPasswordHref}
            tabIndex={-1}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 transition-colors hover:underline"
          >
            Mot de passe oublié ?
          </Link>
        )}
      </div>

      <div className="relative rounded-xl">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
          <Lock className="w-4 h-4" />
        </div>

        <input
          id={inputId}
          ref={ref}
          type={showPassword ? "text" : "password"}
          placeholder="••••••••••••"
          className={cn(
            "w-full h-11 rounded-xl border bg-white px-3.5 pl-10 pr-10 text-sm text-slate-900 placeholder:text-slate-400",
            "transition-all duration-150 ease-out",
            "hover:border-slate-300",
            "focus:outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/15 focus:bg-white",
            error
              ? "border-rose-300 text-rose-950 focus:border-rose-500 focus:ring-rose-500/15"
              : "border-slate-200",
            className
          )}
          {...props}
        />

        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-700 focus:outline-none cursor-pointer transition-colors"
          aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
          tabIndex={-1}
        >
          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>

      {error && (
        <p className="text-xs text-rose-600 font-medium flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1 duration-150">
          <span>{error}</span>
        </p>
      )}
    </div>
  );
});

PasswordField.displayName = "PasswordField";
