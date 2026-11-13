"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { Download, RefreshCw, X, WifiOff, Share, PlusSquare, Smartphone, Laptop, CheckCircle2, Sparkles, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

interface PWAContextType {
  isInstallable: boolean;
  isInstalled: boolean;
  isIOS: boolean;
  isOnline: boolean;
  updateAvailable: boolean;
  showIOSPrompt: boolean;
  setShowIOSPrompt: (show: boolean) => void;
  promptInstall: () => Promise<void>;
  applyUpdate: () => void;
}

const PWAContext = createContext<PWAContextType>({
  isInstallable: false,
  isInstalled: false,
  isIOS: false,
  isOnline: true,
  updateAvailable: false,
  showIOSPrompt: false,
  setShowIOSPrompt: () => {},
  promptInstall: async () => {},
  applyUpdate: () => {},
});

export const usePWA = () => useContext(PWAContext);

export const PWAProvider = ({ children }: { children: React.ReactNode }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [showIOSPrompt, setShowIOSPrompt] = useState(false);
  const [offlineToastVisible, setOfflineToastVisible] = useState(false);

  // 1. Initial State and Device Detection
  useEffect(() => {
    setIsOnline(navigator.onLine);

    // Detect if already installed or running in standalone mode
    const checkIsInstalled = () => {
      const isStandalone =
        window.matchMedia("(display-mode: standalone)").matches ||
        window.matchMedia("(display-mode: window-controls-overlay)").matches ||
        (window.navigator as any).standalone === true ||
        document.referrer.includes("android-app://") ||
        window.location.search.includes("source=pwa") ||
        localStorage.getItem("zadesk_pwa_installed") === "true";

      if (isStandalone) {
        setIsInstalled(true);
        setIsInstallable(false);
        setShowInstallBanner(false);
        setShowIOSPrompt(false);
        document.documentElement.classList.add("standalone-mode");
        localStorage.setItem("zadesk_pwa_installed", "true");
        return true;
      }
      return false;
    };

    const alreadyInstalled = checkIsInstalled();

    // Check installed apps via modern Chromium API if available
    if (!alreadyInstalled && "getInstalledRelatedApps" in navigator) {
      (navigator as any)
        .getInstalledRelatedApps()
        .then((relatedApps: any[]) => {
          if (Array.isArray(relatedApps) && relatedApps.length > 0) {
            setIsInstalled(true);
            setIsInstallable(false);
            setShowInstallBanner(false);
            setShowIOSPrompt(false);
            localStorage.setItem("zadesk_pwa_installed", "true");
          }
        })
        .catch(() => {
          // Ignore API permission or unsupported exceptions silently
        });
    }

    // Detect iOS device (iPhone, iPad, iPod or iPadOS MacIntel touch)
    const isIOSDevice =
      typeof navigator !== "undefined" &&
      (/iPad|iPhone|iPod/.test(navigator.userAgent) ||
        (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)) &&
      !(window as any).MSStream;

    setIsIOS(isIOSDevice);

    // On iOS, if not already installed, it's installable via Safari manual action
    if (isIOSDevice && !alreadyInstalled) {
      setIsInstallable(true);
    }

    // 2. Reliable Service Worker Registration
    if ("serviceWorker" in navigator && process.env.NODE_ENV !== "test") {
      const registerSW = () => {
        navigator.serviceWorker
          .register("/sw.js", { scope: "/" })
          .then((registration) => {
            // Check if there is already a waiting worker
            if (registration.waiting) {
              setWaitingWorker(registration.waiting);
              setUpdateAvailable(true);
            }

            // Listen for new worker installation
            registration.addEventListener("updatefound", () => {
              const newWorker = registration.installing;
              if (newWorker) {
                newWorker.addEventListener("statechange", () => {
                  if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                    setWaitingWorker(newWorker);
                    setUpdateAvailable(true);
                  }
                });
              }
            });
          })
          .catch((err) => {
            console.warn("[PWA] Service Worker registration failed:", err);
          });

        // Listen for controllerchange to reload immediately when user updates
        let refreshing = false;
        navigator.serviceWorker.addEventListener("controllerchange", () => {
          if (!refreshing) {
            refreshing = true;
            window.location.reload();
          }
        });
      };

      if (document.readyState === "complete") {
        registerSW();
      } else {
        window.addEventListener("load", registerSW);
      }
    }

    // 3. Chromium / Android Install Prompt Event listener
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();

      // If the app is already detected as installed, suppress prompt entirely
      if (
        localStorage.getItem("zadesk_pwa_installed") === "true" ||
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as any).standalone === true
      ) {
        setIsInstalled(true);
        setIsInstallable(false);
        setDeferredPrompt(null);
        return;
      }

      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);

      // Check if user previously dismissed install prompt recently
      const dismissedAt = localStorage.getItem("zadesk_pwa_dismissed");
      const isDismissedRecently =
        dismissedAt && Date.now() - parseInt(dismissedAt, 10) < 5 * 24 * 60 * 60 * 1000;

      if (!isDismissedRecently) {
        const timer = setTimeout(() => {
          setShowInstallBanner(true);
        }, 5000);
        return () => clearTimeout(timer);
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // 4. App Installed Event listener - browser confirmed installation
    const handleAppInstalled = () => {
      localStorage.setItem("zadesk_pwa_installed", "true");
      setIsInstalled(true);
      setIsInstallable(false);
      setShowInstallBanner(false);
      setShowIOSPrompt(false);
      setDeferredPrompt(null);
      console.log("[PWA] Zadesk installed and locked as primary app instance");
    };

    window.addEventListener("appinstalled", handleAppInstalled);

    // 5. Online/Offline events
    const handleOnline = () => {
      setIsOnline(true);
      setOfflineToastVisible(false);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setOfflineToastVisible(true);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Display banner after 6s on iOS if not dismissed recently and not installed
    if (isIOSDevice && !alreadyInstalled) {
      const dismissedAt = localStorage.getItem("zadesk_pwa_dismissed");
      const isDismissedRecently =
        dismissedAt && Date.now() - parseInt(dismissedAt, 10) < 5 * 24 * 60 * 60 * 1000;

      if (!isDismissedRecently) {
        const timer = setTimeout(() => {
          setShowInstallBanner(true);
        }, 6000);
        return () => clearTimeout(timer);
      }
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Action: Trigger Install Prompt
  const promptInstall = useCallback(async () => {
    if (isInstalled || localStorage.getItem("zadesk_pwa_installed") === "true") {
      return;
    }

    if (isIOS) {
      setShowIOSPrompt(true);
      setShowInstallBanner(false);
      return;
    }

    if (!deferredPrompt) {
      console.log("[PWA] deferredPrompt not ready or supported");
      return;
    }

    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === "accepted") {
        localStorage.setItem("zadesk_pwa_installed", "true");
        setIsInstalled(true);
        setIsInstallable(false);
      }
    } catch (err) {
      console.error("[PWA] Install prompt error:", err);
    } finally {
      setShowInstallBanner(false);
      setDeferredPrompt(null);
    }
  }, [deferredPrompt, isIOS, isInstalled]);

  // Action: Dismiss Install Banner
  const dismissInstallBanner = () => {
    setShowInstallBanner(false);
    localStorage.setItem("zadesk_pwa_dismissed", Date.now().toString());
  };

  // Action: Apply App Update
  const applyUpdate = () => {
    if (waitingWorker) {
      waitingWorker.postMessage({ type: "SKIP_WAITING" });
    }
  };

  return (
    <PWAContext.Provider
      value={{
        isInstallable,
        isInstalled,
        isIOS,
        isOnline,
        updateAvailable,
        showIOSPrompt,
        setShowIOSPrompt,
        promptInstall,
        applyUpdate,
      }}
    >
      {children}

      {/* 1. Update Notification Toast */}
      {updateAvailable && (
        <aside
          role="status"
          aria-live="polite"
          aria-label="Notification de mise à jour"
          className="fixed bottom-5 right-5 z-[9999] max-w-sm w-[calc(100vw-2.5rem)] bg-navy-950 text-white p-4 rounded-2xl shadow-2xl border border-slate-700/80 animate-in fade-in slide-in-from-bottom-5 duration-300"
        >
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
              <RefreshCw className="w-4 h-4 animate-spin" />
            </div>
            <div className="flex-1 min-w-0 space-y-1">
              <p className="text-xs font-bold text-white">Mise à jour prête</p>
              <p className="text-[11px] text-slate-300 leading-tight">
                Une nouvelle version optimisée de Zadesk est disponible.
              </p>
              <div className="pt-2">
                <Button
                  size="sm"
                  variant="gradient"
                  className="h-8 px-3 text-xs font-bold shadow-md shadow-emerald-500/20"
                  onClick={applyUpdate}
                >
                  Actualiser maintenant
                </Button>
              </div>
            </div>
          </div>
        </aside>
      )}

      {/* 2. Floating Recommendation Install Toast (Android / Desktop / iOS) */}
      {showInstallBanner && !isInstalled && isInstallable && (
        <aside
          role="dialog"
          aria-label="Proposition d'installation de l'application"
          className="fixed bottom-5 left-5 z-[9998] max-w-sm w-[calc(100vw-2.5rem)] bg-white text-navy-900 p-4 rounded-2xl shadow-2xl border border-slate-200/90 animate-in fade-in slide-in-from-bottom-5 duration-300"
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
              <Download className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-bold text-navy-900">Installer Zadesk</p>
                  <span className="px-1.5 py-0.2 text-[9px] font-bold bg-emerald-100 text-emerald-800 rounded-full">
                    Rapide & Léger
                  </span>
                </div>
                <button
                  onClick={dismissInstallBanner}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
                  aria-label="Fermer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-[11px] text-slate-600 leading-tight">
                {isIOS
                  ? "Ajoutez Zadesk sur votre écran d'accueil pour un accès instantané à votre SAV."
                  : "Installez l'application Zadesk sur votre appareil pour une expérience plein écran sans latence."}
              </p>
              <div className="pt-2 flex items-center gap-2">
                <Button
                  size="sm"
                  variant="gradient"
                  className="h-8 px-3 text-xs font-bold shadow-md shadow-emerald-500/20"
                  onClick={promptInstall}
                  leftIcon={isIOS ? <Share className="w-3.5 h-3.5" /> : <Download className="w-3.5 h-3.5" />}
                >
                  {isIOS ? "Comment installer" : "Installer"}
                </Button>
                <button
                  onClick={dismissInstallBanner}
                  className="text-xs text-slate-500 hover:text-slate-700 font-medium px-2 py-1"
                >
                  Plus tard
                </button>
              </div>
            </div>
          </div>
        </aside>
      )}

      {/* 3. Dedicated iOS Safari Installation Modal */}
      {showIOSPrompt && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="ios-install-title"
          className="fixed inset-0 z-[10001] bg-navy-950/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 animate-in fade-in duration-200"
        >
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-5 animate-in slide-in-from-bottom-6 duration-300">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-[#0D1B3D] text-white flex items-center justify-center shadow-md">
                  <Smartphone className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <h3 id="ios-install-title" className="text-base font-bold text-navy-900">
                    Installer Zadesk sur iOS
                  </h3>
                  <p className="text-xs text-slate-500">Ajouter à l&apos;écran d&apos;accueil en 3 étapes</p>
                </div>
              </div>
              <button
                onClick={() => setShowIOSPrompt(false)}
                className="p-1.5 text-slate-400 hover:text-navy-900 rounded-xl hover:bg-slate-100 transition-colors"
                aria-label="Fermer la fenêtre"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Steps Guide */}
            <div className="space-y-3 bg-slate-50/80 rounded-2xl p-4 border border-slate-200/80">
              {/* Step 1 */}
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-500 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  1
                </div>
                <div className="text-xs text-slate-700">
                  <span>Touchez le bouton </span>
                  <span className="inline-flex items-center gap-1 font-semibold text-navy-900 bg-white px-2 py-0.5 rounded border border-slate-200 shadow-2xs">
                    <Share className="w-3.5 h-3.5 text-blue-600 inline" /> Partager
                  </span>
                  <span> dans la barre inférieure de Safari.</span>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-500 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  2
                </div>
                <div className="text-xs text-slate-700">
                  <span>Faites défiler le menu et sélectionnez </span>
                  <span className="inline-flex items-center gap-1 font-semibold text-navy-900 bg-white px-2 py-0.5 rounded border border-slate-200 shadow-2xs">
                    <PlusSquare className="w-3.5 h-3.5 text-slate-800 inline" /> Sur l&apos;écran d&apos;accueil
                  </span>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-500 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  3
                </div>
                <div className="text-xs text-slate-700">
                  <span>Appuyez sur </span>
                  <span className="font-bold text-emerald-700">« Ajouter »</span>
                  <span> en haut à droite pour confirmer.</span>
                </div>
              </div>
            </div>

            {/* Benefits Banner */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-[11px]">
              <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Accès direct 1-clic, performances instantanées et mode hors-ligne.</span>
            </div>

            {/* Action button */}
            <Button
              variant="gradient"
              size="md"
              className="w-full justify-center font-bold"
              onClick={() => setShowIOSPrompt(false)}
            >
              J&apos;ai compris
            </Button>
          </div>
        </div>
      )}

      {/* 4. Offline Status Warning Banner */}
      {offlineToastVisible && !isOnline && (
        <div
          role="status"
          aria-live="polite"
          className="fixed top-0 left-0 right-0 z-[10000] bg-rose-600 text-white text-xs font-semibold py-2 px-4 text-center flex items-center justify-center gap-2 shadow-md animate-in slide-in-from-top duration-200"
        >
          <WifiOff className="w-4 h-4 shrink-0" />
          <span>Connexion réseau interrompue. Mode hors-ligne actif.</span>
        </div>
      )}
    </PWAContext.Provider>
  );
};
