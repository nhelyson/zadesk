import React from "react";
import Link from "next/link";
import { AlertCircle, CheckCircle2 } from "lucide-react";

interface AuthFeedbackProps {
  error?: string | null;
  success?: string | null;
  onClearError?: () => void;
  onClearSuccess?: () => void;
}

export const AuthFeedback: React.FC<AuthFeedbackProps> = ({
  error,
  success,
  onClearError,
  onClearSuccess,
}) => {
  if (!error && !success) return null;

  if (success) {
    return (
      <div className="mb-5 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200/90 text-emerald-900 text-xs font-semibold flex items-center justify-between gap-2.5 animate-fade-in">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{success}</span>
        </div>
        {onClearSuccess && (
          <button
            type="button"
            onClick={onClearSuccess}
            className="text-emerald-700 hover:text-emerald-900 font-bold ml-2 cursor-pointer"
          >
            ✕
          </button>
        )}
      </div>
    );
  }

  const isAlreadyRegistered = Boolean(
    error &&
      (error.toLowerCase().includes("déjà") ||
        error.toLowerCase().includes("existe") ||
        error.toLowerCase().includes("enregistrée"))
  );
  const isUnregistered = Boolean(
    error &&
      (error.toLowerCase().includes("aucun compte") ||
        error.toLowerCase().includes("non associé") ||
        error.toLowerCase().includes("première visite") ||
        error.toLowerCase().includes("créer"))
  );

  const targetLink = isAlreadyRegistered ? "/login" : isUnregistered ? "/register" : null;
  const targetLabel = isAlreadyRegistered
    ? "Me connecter à mon compte →"
    : isUnregistered
    ? "Créer mon compte Zadesk →"
    : null;

  return (
    <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200/90 text-rose-800 text-xs font-medium flex items-center justify-between gap-2.5 animate-fade-in">
      <div className="flex items-center gap-2 flex-wrap flex-1">
        <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
        <div className="flex items-center gap-1.5 flex-wrap">
          <span>{error}</span>
          {targetLink && targetLabel && (
            <Link
              href={targetLink}
              className="font-bold text-rose-900 underline hover:text-rose-950 whitespace-nowrap inline-flex items-center gap-1 transition-colors"
            >
              <span>{targetLabel}</span>
            </Link>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {onClearError && (
          <button
            type="button"
            onClick={onClearError}
            className="text-rose-600 hover:text-rose-800 font-bold ml-1 cursor-pointer p-1 rounded-md hover:bg-rose-100 transition-colors"
            aria-label="Fermer l'alerte"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
};
