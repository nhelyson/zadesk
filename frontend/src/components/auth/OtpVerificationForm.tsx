"use client";

import React, { useState, useEffect, useRef } from "react";
import { ArrowLeft, Mail, Loader2, CheckCircle2 } from "lucide-react";
import { verifyOtpApi, resendOtpApi, UserProfile, AuthResponse } from "@/lib/auth";
import { AuthFeedback } from "./AuthFeedback";
import { TurnstileWidget, TurnstileWidgetRef } from "./TurnstileWidget";

interface OtpVerificationFormProps {
  email: string;
  tempToken: string;
  purpose: "REGISTRATION" | "LOGIN" | "EMAIL_VERIFICATION" | "PASSWORD_RESET";
  onSuccess: (user: UserProfile, result?: AuthResponse) => void;
  onBack: () => void;
}

export const OtpVerificationForm: React.FC<OtpVerificationFormProps> = ({
  email,
  tempToken,
  purpose,
  onSuccess,
  onBack,
}) => {
  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [currentToken, setCurrentToken] = useState(tempToken);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileRef = useRef<TurnstileWidgetRef>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(60);

  const isLocalhost =
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1" ||
      window.location.hostname === "0.0.0.0");
  const isDev = process.env.NODE_ENV === "development" || isLocalhost;

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Auto focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  // Cooldown countdown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const interval = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldown]);

  // Handle single digit change
  const handleDigitChange = (index: number, value: string) => {
    const cleanVal = value.replace(/\D/g, "");

    // Handle paste of multiple digits
    if (cleanVal.length > 1) {
      handlePaste(cleanVal);
      return;
    }

    const newDigits = [...digits];
    newDigits[index] = cleanVal;
    setDigits(newDigits);
    setError(null);

    // Auto focus next input
    if (cleanVal && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto submit when all 6 digits are entered
    if (newDigits.every((d) => d !== "") && cleanVal) {
      const fullOtp = newDigits.join("");
      triggerVerify(fullOtp);
    }
  };

  // Handle backspace navigation
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle full code paste
  const handlePaste = (pastedText: string) => {
    const raw = pastedText.replace(/\D/g, "").slice(0, 6);
    if (!raw) return;

    const newDigits = [...digits];
    for (let i = 0; i < raw.length; i++) {
      newDigits[i] = raw[i];
    }
    setDigits(newDigits);
    setError(null);

    const nextIdx = Math.min(raw.length, 5);
    inputRefs.current[nextIdx]?.focus();

    if (raw.length === 6) {
      triggerVerify(raw);
    }
  };

  // Verify OTP Action
  const triggerVerify = async (otpCode: string) => {
    if (otpCode.length !== 6) {
      setError("Veuillez saisir les 6 chiffres du code.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setInfoMsg(null);

    try {
      const res = await verifyOtpApi({
        tempToken: currentToken,
        otp: otpCode,
        purpose,
      });

      if (res.user) {
        onSuccess(res.user, res);
      }
    } catch (err: any) {
      setError(
        err.message ||
          "Code incorrect ou expiré. Veuillez vérifier votre saisie ou demander un nouveau code."
      );
      setDigits(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fullOtp = digits.join("");
    triggerVerify(fullOtp);
  };

  // Resend OTP Action
  const handleResend = async () => {
    if (cooldown > 0 || isResending) return;

    const finalToken = turnstileToken || (isDev ? "dev-bypass-token" : "");

    if (!finalToken) {
      setError("Veuillez valider le test de sécurité Cloudflare Turnstile pour renvoyer le code.");
      return;
    }

    setIsResending(true);
    setError(null);
    setInfoMsg(null);

    try {
      const res = await resendOtpApi({
        tempToken: currentToken,
        purpose,
        turnstileToken: finalToken,
      });

      if (res.tempToken) {
        setCurrentToken(res.tempToken);
      }

      setInfoMsg("Un nouveau code a été envoyé à votre adresse email.");
      setCooldown(60);
      setTurnstileToken(null);
      turnstileRef.current?.reset();
      setDigits(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } catch (err: any) {
      setError(err.message || "Erreur lors du renvoi du code. Veuillez réessayer.");
      setTurnstileToken(null);
      turnstileRef.current?.reset();
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex justify-center mb-1">
          <div className="w-11 h-11 rounded-2xl bg-[#0D1B3D] text-white flex items-center justify-center shadow-xs">
            <Mail className="w-5 h-5 text-emerald-400" />
          </div>
        </div>

        <h1 className="text-xl sm:text-2xl font-black text-[#0D1B3D] tracking-tight leading-tight uppercase">
          Code de confirmation
        </h1>

        <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
          Saisissez le code à 6 chiffres transmis à l&apos;adresse :
        </p>

        {/* Email Pill Badge */}
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200/80 text-xs font-semibold text-[#0D1B3D] max-w-full truncate">
            <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{email}</span>
          </div>
        </div>
      </div>

      {/* Feedback Alerts */}
      <AuthFeedback
        error={error}
        success={infoMsg}
        onClearError={() => setError(null)}
        onClearSuccess={() => setInfoMsg(null)}
      />

      {/* Form with 6 Digit Boxes Split 3 + 3 */}
      <form onSubmit={handleManualSubmit} className="space-y-6">
        <div className="flex items-center justify-center gap-1.5 sm:gap-2">
          {/* Premier groupe de 3 chiffres */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {digits.slice(0, 3).map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => {
                  inputRefs.current[idx] = el;
                }}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                value={digit}
                onChange={(e) => handleDigitChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                onPaste={(e) => {
                  e.preventDefault();
                  handlePaste(e.clipboardData.getData("text"));
                }}
                className={`w-11 h-14 sm:w-12 sm:h-16 text-center text-2xl font-mono font-black rounded-2xl border transition-all duration-150 select-none shadow-2xs ${
                  digit
                    ? "bg-[#FAFAF8] border-[#0D1B3D] text-[#0D1B3D] shadow-xs"
                    : "bg-white border-slate-200 text-slate-900 focus:border-[#0D1B3D] focus:ring-4 focus:ring-[#0D1B3D]/10"
                }`}
                autoComplete="one-time-code"
                aria-label={`Chiffre ${idx + 1}`}
              />
            ))}
          </div>

          {/* Séparateur central élégant */}
          <div className="w-2.5 h-0.5 bg-slate-300 rounded-full mx-0.5 sm:mx-1 shrink-0" aria-hidden="true" />

          {/* Second groupe de 3 chiffres */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {digits.slice(3, 6).map((digit, i) => {
              const idx = i + 3;
              return (
                <input
                  key={idx}
                  ref={(el) => {
                    inputRefs.current[idx] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleDigitChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  onPaste={(e) => {
                    e.preventDefault();
                    handlePaste(e.clipboardData.getData("text"));
                  }}
                  className={`w-11 h-14 sm:w-12 sm:h-16 text-center text-2xl font-mono font-black rounded-2xl border transition-all duration-150 select-none shadow-2xs ${
                    digit
                      ? "bg-[#FAFAF8] border-[#0D1B3D] text-[#0D1B3D] shadow-xs"
                      : "bg-white border-slate-200 text-slate-900 focus:border-[#0D1B3D] focus:ring-4 focus:ring-[#0D1B3D]/10"
                  }`}
                  autoComplete="one-time-code"
                  aria-label={`Chiffre ${idx + 1}`}
                />
              );
            })}
          </div>
        </div>

        {/* Primary Verification Button */}
        <button
          type="submit"
          disabled={digits.some((d) => d === "") || isLoading}
          className={`w-full h-12 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs select-none touch-manipulation ${
            digits.every((d) => d !== "") && !isLoading
              ? "bg-[#0D1B3D] text-white hover:bg-slate-800 active:scale-[0.98] shadow-slate-900/10"
              : "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
          }`}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Vérification en cours...</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Vérifier le code</span>
            </>
          )}
        </button>
      </form>

      {/* Secondary Actions: Resend & Change Email */}
      <div className="space-y-3 pt-2 border-t border-slate-100 text-center">
        {/* Resend Action */}
        <div className="text-xs text-slate-600 space-y-2">
          <div>
            <span>Vous n&apos;avez pas reçu le code ? </span>
            {cooldown > 0 && (
              <span className="text-slate-500 font-semibold font-mono">
                Renvoyer dans {cooldown}s
              </span>
            )}
          </div>

          {cooldown <= 0 && (
            <div className="flex flex-col items-center">
              <TurnstileWidget
                ref={turnstileRef}
                size="compact"
                onSuccess={(token) => {
                  setError(null);
                  setTurnstileToken(token);
                }}
                onError={(err) => {
                  setTurnstileToken(null);
                  setError(err || "Échec de validation de sécurité Turnstile.");
                }}
                onExpire={() => {
                  setTurnstileToken(null);
                }}
              />
              <button
                type="button"
                onClick={handleResend}
                disabled={isResending || (!turnstileToken && !isDev)}
                className="mt-1 font-bold text-[#0D1B3D] hover:underline transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isResending ? "Envoi en cours..." : "Renvoyer un nouveau code"}
              </button>
            </div>
          )}
        </div>

        {/* Return to previous screen */}
        <div>
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 font-semibold transition-colors cursor-pointer py-1 active:scale-95"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Modifier l&apos;adresse email</span>
          </button>
        </div>
      </div>
    </div>
  );
};


