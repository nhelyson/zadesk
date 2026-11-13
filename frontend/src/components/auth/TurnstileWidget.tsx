"use client";

import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from "react";
import { fetchTurnstileSiteKey } from "@/lib/auth";
import { ShieldAlert, RefreshCw, CheckCircle, ShieldCheck } from "lucide-react";

export interface TurnstileWidgetRef {
  reset: () => void;
  getResponse: () => string | null;
}

interface TurnstileWidgetProps {
  siteKey?: string;
  onSuccess: (token: string) => void;
  onError?: (error?: string) => void;
  onExpire?: () => void;
  className?: string;
  theme?: "light" | "dark" | "auto";
  size?: "normal" | "compact" | "flexible";
}

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: string | HTMLElement,
        options: {
          sitekey: string;
          callback?: (token: string) => void;
          "error-callback"?: (error?: any) => void;
          "expired-callback"?: () => void;
          theme?: "light" | "dark" | "auto";
          size?: "normal" | "compact" | "flexible";
          "refresh-expired"?: "auto" | "manual" | "never";
          retry?: "auto" | "never";
        }
      ) => string;
      reset: (widgetId?: string) => void;
      remove: (widgetId?: string) => void;
      getResponse: (widgetId?: string) => string;
    };
    onTurnstileLoaded?: () => void;
  }
}

export const TurnstileWidget = forwardRef<TurnstileWidgetRef, TurnstileWidgetProps>(
  (
    {
      siteKey: propSiteKey,
      onSuccess,
      onError,
      onExpire,
      className = "",
      theme = "light",
      size = "normal",
    },
    ref
  ) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const widgetIdRef = useRef<string | null>(null);
    const [resolvedSiteKey, setResolvedSiteKey] = useState<string>(propSiteKey || "");
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [isDevBypassed, setIsDevBypassed] = useState<boolean>(false);

    const isLocalhost =
      typeof window !== "undefined" &&
      (window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1" ||
        window.location.hostname === "0.0.0.0");
    const isDev = process.env.NODE_ENV === "development" || isLocalhost;

    const onSuccessRef = useRef(onSuccess);
    const onErrorRef = useRef(onError);
    const onExpireRef = useRef(onExpire);

    useEffect(() => {
      onSuccessRef.current = onSuccess;
      onErrorRef.current = onError;
      onExpireRef.current = onExpire;
    });

    // Expose reset and getResponse methods to parent
    useImperativeHandle(ref, () => ({
      reset: () => {
        setIsDevBypassed(false);
        if (window.turnstile && widgetIdRef.current) {
          try {
            window.turnstile.reset(widgetIdRef.current);
          } catch (e) {
            // ignore
          }
        }
      },
      getResponse: () => {
        if (isDevBypassed) return "dev-bypass-token";
        if (window.turnstile && widgetIdRef.current) {
          try {
            return window.turnstile.getResponse(widgetIdRef.current);
          } catch (e) {
            return null;
          }
        }
        return null;
      },
    }));

    // Step 1: Resolve site key if not passed directly in props
    useEffect(() => {
      let isMounted = true;
      if (propSiteKey) {
        setResolvedSiteKey(propSiteKey);
        if (isDev && propSiteKey.startsWith("1x00000000")) {
          setIsDevBypassed(true);
          setIsLoading(false);
          onSuccessRef.current("dev-bypass-token");
        }
      } else {
        fetchTurnstileSiteKey().then((key) => {
          if (isMounted) {
            if (key) {
              setResolvedSiteKey(key);
              if (isDev && key.startsWith("1x00000000")) {
                setIsDevBypassed(true);
                setIsLoading(false);
                onSuccessRef.current("dev-bypass-token");
              }
            } else if (isDev) {
              // In dev mode, auto-bypass when key is absent
              setResolvedSiteKey("1x00000000000000000000AA");
              setIsDevBypassed(true);
              setIsLoading(false);
              onSuccessRef.current("dev-bypass-token");
            } else {
              setErrorMsg("Configuration de sécurité manquante.");
              setIsLoading(false);
            }
          }
        });
      }
      return () => {
        isMounted = false;
      };
    }, [propSiteKey, isDev]);

    // Step 2: Load Cloudflare Turnstile script
    useEffect(() => {
      if (!resolvedSiteKey || isDevBypassed) return;

      const scriptId = "cf-turnstile-script";
      let script = document.getElementById(scriptId) as HTMLScriptElement | null;

      const renderWidget = () => {
        if (!containerRef.current || !window.turnstile) return;

        // Clean up previous widget if exists
        if (widgetIdRef.current) {
          try {
            window.turnstile.remove(widgetIdRef.current);
          } catch (e) {
            // ignore
          }
          widgetIdRef.current = null;
        }

        try {
          const id = window.turnstile.render(containerRef.current, {
            sitekey: resolvedSiteKey,
            theme,
            size,
            retry: "never",
            "refresh-expired": "auto",
            callback: (token: string) => {
              setErrorMsg(null);
              setIsLoading(false);
              onSuccessRef.current(token);
            },
            "error-callback": (err: any) => {
              setIsLoading(false);
              // In dev / localhost: auto-bypass instead of blocking registration
              if (isDev) {
                setErrorMsg(null);
                setIsDevBypassed(true);
                onSuccessRef.current("dev-bypass-token");
                return;
              }

              let msg = "Échec du test de sécurité Cloudflare. Veuillez réessayer.";
              if (err === "300010" || String(err).includes("300010")) {
                msg = "Domaine non autorisé (300010). Veuillez autoriser 'localhost' dans le tableau de bord Cloudflare Turnstile.";
              } else if (err === "600010" || String(err).includes("600010")) {
                msg = "Délai de validation expiré. Veuillez cliquer sur Réessayer.";
              }
              setErrorMsg(msg);
              if (onErrorRef.current) onErrorRef.current(msg);
            },
            "expired-callback": () => {
              setIsLoading(false);
              if (onExpireRef.current) onExpireRef.current();
            },
          });

          widgetIdRef.current = id;
          setIsLoading(false);
        } catch (err: any) {
          setIsLoading(false);
          if (isDev) {
            setIsDevBypassed(true);
            onSuccessRef.current("dev-bypass-token");
            return;
          }
          setErrorMsg("Impossible d'initialiser le composant de sécurité.");
          if (onErrorRef.current) onErrorRef.current(err?.message);
        }
      };

      if (!script) {
        script = document.createElement("script");
        script.id = scriptId;
        script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
        script.async = true;
        script.defer = true;
        script.onload = () => {
          renderWidget();
        };
        script.onerror = () => {
          setIsLoading(false);
          if (isDev) {
            setIsDevBypassed(true);
            onSuccessRef.current("dev-bypass-token");
            return;
          }
          const msg = "Impossible de charger le service de sécurité Cloudflare Turnstile.";
          setErrorMsg(msg);
          if (onErrorRef.current) onErrorRef.current(msg);
        };
        document.head.appendChild(script);
      } else if (window.turnstile) {
        renderWidget();
      } else {
        script.addEventListener("load", renderWidget);
      }

      return () => {
        if (widgetIdRef.current && window.turnstile) {
          try {
            window.turnstile.remove(widgetIdRef.current);
          } catch (e) {
            // ignore
          }
          widgetIdRef.current = null;
        }
      };
    }, [resolvedSiteKey, theme, size, isDev, isDevBypassed]);

    const handleRetry = () => {
      setErrorMsg(null);
      setIsLoading(true);
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.reset(widgetIdRef.current);
        } catch (e) {
          // ignore
        }
      }
    };

    const handleManualDevBypass = () => {
      setIsDevBypassed(true);
      setErrorMsg(null);
      setIsLoading(false);
      onSuccessRef.current("dev-bypass-token");
    };

    return (
      <div className={`flex flex-col items-center justify-center my-3 w-full ${className}`}>
        {isDevBypassed ? (
          <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-lg w-full max-w-sm justify-center select-none animate-fadeIn">
            <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
            <span className="font-medium">Mode Dev : Sécurité validée (localhost)</span>
          </div>
        ) : (
          <>
            <div
              ref={containerRef}
              className="min-h-[65px] min-w-[300px] flex items-center justify-center"
            />

            {isDev && (
              <button
                type="button"
                onClick={handleManualDevBypass}
                className="mt-1.5 text-[11px] text-slate-500 hover:text-emerald-700 hover:underline flex items-center gap-1 cursor-pointer transition-colors"
                title="Valider automatiquement en mode développement"
              >
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                <span>Valider le CAPTCHA (Mode Dev)</span>
              </button>
            )}
          </>
        )}

        {errorMsg && (
          <div className="mt-2 flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-200 px-3 py-1.5 rounded-lg w-full max-w-sm">
            <ShieldAlert className="h-4 w-4 shrink-0 text-red-500" />
            <span className="flex-1">{errorMsg}</span>
            {isDev ? (
              <button
                type="button"
                onClick={handleManualDevBypass}
                className="ml-auto inline-flex items-center gap-1 font-semibold text-emerald-700 hover:underline"
              >
                Contourner (Dev)
              </button>
            ) : (
              <button
                type="button"
                onClick={handleRetry}
                className="ml-auto inline-flex items-center gap-1 font-medium text-red-700 hover:text-red-900 underline"
              >
                <RefreshCw className="h-3 w-3" />
                Réessayer
              </button>
            )}
          </div>
        )}
      </div>
    );
  }
);

TurnstileWidget.displayName = "TurnstileWidget";
