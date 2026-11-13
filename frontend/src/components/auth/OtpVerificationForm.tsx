"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/Button";
import { ArrowLeft, ShieldCheck } from "lucide-react";
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
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-1.5">
        <div className="flex justify-center mb-1">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-[11px] font-bold">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Vérification de sécurité</span>
          </span>
        </div>
        <h1 className="text-2xl sm:text-[26px] font-bold text-slate-900 tracking-tight leading-tight">
          Vérifiez votre email
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-xs mx-auto">
          Nous avons envoyé un code de confirmation à 6 chiffres à{" "}
          <strong className="text-slate-800 font-semibold">{email}</strong>.
        </p>
      </div>

      {/* Feedback Alerts */}
      <AuthFeedback
        error={error}
        success={infoMsg}
        onClearError={() => setError(null)}
        onClearSuccess={() => setInfoMsg(null)}
      />

      {/* Form with 6 Digit Boxes */}
      <form onSubmit={handleManualSubmit} className="space-y-6">
        <div className="flex items-center justify-center gap-2 sm:gap-2.5">
          {digits.map((digit, idx) => (
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
              className="w-11 h-13 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-bold text-slate-900 bg-white border border-slate-200 rounded-2xl transition-all duration-150 ease-out hover:border-slate-300 focus:outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/15 focus:bg-white shadow-xs select-none font-mono"
              autoComplete="one-time-code"
              aria-label={`Chiffre ${idx + 1}`}
            />
          ))}
        </div>

        {/* Primary Verification Button */}
        <Button
          type="submit"
          variant="gradient"
          size="lg"
          className="w-full justify-center font-bold shadow-md shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all cursor-pointer"
          isLoading={isLoading}
          disabled={digits.some((d) => d === "")}
        >
          Vérifier le code
        </Button>
      </form>

      {/* Secondary Actions: Resend & Change Email */}
      <div className="space-y-3 pt-2 border-t border-slate-100 text-center">
        {/* Resend Action */}
        <div className="text-xs text-slate-600 space-y-2">
          <div>
            <span>Vous n&apos;avez pas reçu le code ? </span>
            {cooldown > 0 && (
              <span className="text-slate-400 font-semibold">
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
                className="mt-1 font-bold text-emerald-700 hover:text-emerald-800 underline transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isResending ? "Envoi en cours..." : "Renvoyer le code"}
              </button>
            </div>
          )}
        </div>

        {/* Return to previous screen */}
        <div>
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 font-semibold transition-colors cursor-pointer py-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Modifier l&apos;adresse email</span>
          </button>
        </div>
      </div>
    </div>
  );
};


