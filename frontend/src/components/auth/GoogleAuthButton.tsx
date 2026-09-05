"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { fetchGoogleClientId, googleAuthApi, UserProfile } from "@/lib/auth";
import { AlertCircle, Loader2 } from "lucide-react";

interface GoogleAuthButtonProps {
  mode?: "login" | "register";
  onSuccess?: (user: UserProfile) => void;
  onError?: (error: string) => void;
  className?: string;
}

declare global {
  interface Window {
    google?: any;
    __zadeskGoogleInitialized?: boolean;
  }
}

export const GoogleAuthButton: React.FC<GoogleAuthButtonProps> = ({
  mode = "login",
  onSuccess,
  onError,
  className = "",
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [clientId, setClientId] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSdkReady, setIsSdkReady] = useState<boolean>(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleCredentialResponse = useCallback(
    async (response: any) => {
      if (!response || !response.credential) {
        const msg = "Aucun jeton d'authentification reçu de Google.";
        setLocalError(msg);
        onError?.(msg);
        setIsLoading(false);
        return;
      }

      setLocalError(null);
      setIsLoading(true);

      try {
        const result = await googleAuthApi(response.credential);
        if (result.success && result.user) {
          onSuccess?.(result.user);
        } else {
          throw new Error(result.message || "Échec de l'authentification Google.");
        }
      } catch (err: any) {
        const errMsg = err.message || "Erreur lors de la communication avec le serveur Zadesk.";
        setLocalError(errMsg);
        onError?.(errMsg);
      } finally {
        setIsLoading(false);
      }
    },
    [onSuccess, onError]
  );

  // 1. Fetch Client ID and Load Google Identity Services SDK
  useEffect(() => {
    let isMounted = true;

    async function loadSdk() {
      try {
        const id = await fetchGoogleClientId();
        if (!isMounted) return;

        if (!id) {
          setLocalError("Client ID Google non configuré.");
          return;
        }

        setClientId(id);

        const initGsi = () => {
          if (!window.google?.accounts?.id) return;

          window.google.accounts.id.initialize({
            client_id: id,
            callback: (res: any) => handleCredentialResponse(res),
            auto_select: false,
            cancel_on_tap_outside: true,
            itp_support: true,
          });

          if (isMounted) {
            setIsSdkReady(true);
          }
        };

        if (window.google?.accounts?.id) {
          initGsi();
        } else if (!document.getElementById("google-gsi-client")) {
          const script = document.createElement("script");
          script.id = "google-gsi-client";
          script.src = "https://accounts.google.com/gsi/client";
          script.async = true;
          script.defer = true;
          script.onload = () => {
            initGsi();
          };
          script.onerror = () => {
            if (isMounted) {
              setLocalError("Impossible de charger les services Google.");
            }
          };
          document.body.appendChild(script);
        } else {
          // Script tag exists, wait for it
          const checkInterval = setInterval(() => {
            if (window.google?.accounts?.id) {
              clearInterval(checkInterval);
              initGsi();
            }
          }, 100);
          setTimeout(() => clearInterval(checkInterval), 5000);
        }
      } catch (e: any) {
        if (isMounted) {
          setLocalError("Erreur lors de l'initialisation de Google.");
        }
      }
    }

    loadSdk();

    return () => {
      isMounted = false;
    };
  }, [handleCredentialResponse]);

  // 2. Render Google Button into the DOM container when SDK & Client ID are ready
  useEffect(() => {
    if (!isSdkReady || !clientId || !containerRef.current || !window.google?.accounts?.id) {
      return;
    }

    try {
      // Clear previous buttons if re-rendering
      containerRef.current.innerHTML = "";

      const parentWidth = containerRef.current.parentElement?.clientWidth || 380;
      const computedWidth = Math.min(Math.max(parentWidth, 240), 400);

      window.google.accounts.id.renderButton(containerRef.current, {
        type: "standard",
        theme: "outline",
        size: "large",
        text: mode === "register" ? "signup_with" : "continue_with",
        shape: "rectangular",
        logo_alignment: "left",
        width: computedWidth,
        locale: "fr",
      });

      // Optional One Tap prompt
      window.google.accounts.id.prompt();
    } catch (e) {
      console.error("Google button render error:", e);
    }
  }, [isSdkReady, clientId, mode]);

  return (
    <div className={`w-full flex flex-col items-center justify-center ${className}`}>
      {localError && (
        <div className="w-full mb-3 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
          <span>{localError}</span>
        </div>
      )}

      {isLoading ? (
        <div className="w-full py-3 px-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center gap-2.5 text-slate-700 text-xs font-semibold shadow-xs">
          <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
          <span>Authentification Google en cours...</span>
        </div>
      ) : (
        <div className="w-full flex items-center justify-center min-h-[44px]">
          {/* Target container for Google Identity Services official iframe button */}
          <div ref={containerRef} className="w-full flex justify-center" />

          {/* Skeleton placeholder while SDK or Client ID is loading */}
          {!isSdkReady && !localError && (
            <div className="w-full py-2.5 px-4 rounded-xl border border-slate-200 bg-white flex items-center justify-center gap-3 text-slate-600 text-xs font-semibold shadow-xs animate-pulse">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{mode === "register" ? "S'inscrire avec Google" : "Continuer avec Google"}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
