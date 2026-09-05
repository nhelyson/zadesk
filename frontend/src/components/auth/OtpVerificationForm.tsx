"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/Button";
import { 
  Mail, 
  ArrowLeft, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck,
  Lock
} from "lucide-react";
import { verifyOtpApi, resendOtpApi, UserProfile } from "@/lib/auth";

interface OtpVerificationFormProps {
  email: string;
  tempToken: string;
  purpose: "REGISTRATION" | "LOGIN" | "EMAIL_VERIFICATION" | "PASSWORD_RESET";
  onSuccess: (user: UserProfile) => void;
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
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(60);

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
    // If value contains non-numeric characters, ignore
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

    // Focus on the next empty or the last digit
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
        onSuccess(res.user);
      }
    } catch (err: any) {
      setError(
        err.message ||
          "Code incorrect ou expiré. Veuillez vérifier votre saisie ou demander un nouveau code."
      );
      // Clear digits for easy re-entry
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

    setIsResending(true);
    setError(null);
    setInfoMsg(null);

    try {
      const res = await resendOtpApi({
        tempToken: currentToken,
        purpose,
      });

      if (res.tempToken) {
        setCurrentToken(res.tempToken);
      }

      setInfoMsg("Un nouveau code a été envoyé à votre adresse email.");
      setCooldown(60);
      setDigits(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } catch (err: any) {
      setError(err.message || "Erreur lors du renvoi du code. Veuillez réessayer.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="text-left space-y-1.5">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold mb-2">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Vérification de sécurité Zadesk</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
          Vérifiez votre adresse email
        </h1>
        <p className="text-sm text-slate-600 leading-relaxed">
          Nous avons envoyé un code de confirmation à 6 chiffres à{" "}
          <strong className="text-slate-900 font-semibold">{email}</strong>.
        </p>
      </div>

      {/* Instant Feedback Alerts */}
      {infoMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{infoMsg}</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2.5 animate-in fade-in duration-200">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
          <span>{error}</span>
        </div>
      )}

      {/* Form with 6 Digit Boxes */}
      <form onSubmit={handleManualSubmit} className="space-y-6">
        
        <div className="flex items-center justify-between gap-2 sm:gap-3">
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
              className="w-12 h-14 sm:w-13 sm:h-15 text-center text-xl sm:text-2xl font-black text-navy-900 bg-white border border-slate-200 rounded-2xl transition-all duration-150 ease-out hover:border-slate-300 focus:outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/15 focus:bg-white shadow-xs select-none"
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
          className="w-full justify-center font-bold shadow-md shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all h-12"
          isLoading={isLoading}
          disabled={digits.some((d) => d === "")}
        >
          Vérifier le code
        </Button>
      </form>

      {/* Secondary Actions: Resend & Change Email */}
      <div className="space-y-4 pt-2 border-t border-slate-100 text-center">
        
        {/* Resend Action */}
        <div className="text-xs text-slate-600">
          <span>Vous n&apos;avez pas reçu le code ? </span>
          {cooldown > 0 ? (
            <span className="text-slate-400 font-semibold">
              Renvoyer dans {cooldown}s
            </span>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              disabled={isResending}
              className="font-bold text-emerald-700 hover:text-emerald-800 underline transition-colors cursor-pointer"
            >
              {isResending ? "Envoi en cours..." : "Renvoyer le code"}
            </button>
          )}
        </div>

        {/* Return to previous screen */}
        <div>
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-navy-900 font-semibold transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Modifier l&apos;adresse email</span>
          </button>
        </div>

      </div>

    </div>
  );
};
