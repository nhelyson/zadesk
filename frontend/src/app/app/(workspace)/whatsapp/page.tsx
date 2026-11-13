'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  PhoneCall,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  ShieldCheck,
  Zap,
  ExternalLink,
  LogOut,
  RefreshCw,
  HelpCircle,
  PlusCircle,
  Layers,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useWorkspace } from '@/components/workspace/WorkspaceContext';
import { workspaceApi } from '@/lib/api';

declare global {
  interface Window {
    fbAsyncInit?: () => void;
    FB?: any;
  }
}

interface WhatsAppConnectionData {
  id: string;
  wabaId: string;
  phoneNumberId: string;
  displayPhoneNumber: string;
  verifiedName?: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export default function WhatsAppPage() {
  const { currentWorkspace } = useWorkspace();
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [metaAppId, setMetaAppId] = useState<string>('');
  const [metaConfigId, setMetaConfigId] = useState<string>('');
  const [connection, setConnection] = useState<WhatsAppConnectionData | null>(null);
  const [isDisconnectModalOpen, setIsDisconnectModalOpen] = useState(false);
  const [sdkReady, setSdkReady] = useState(false);

  // Temporary captured session data from Meta Embedded Signup message events
  const [sessionMetaInfo, setSessionMetaInfo] = useState<{
    wabaId?: string;
    phoneNumberId?: string;
  }>({});

  // 1. Fetch current WhatsApp connection status
  const fetchWhatsAppStatus = useCallback(async () => {
    if (!currentWorkspace?.id) return;
    try {
      setLoading(true);
      setError(null);
      const res = await workspaceApi.getWhatsAppConfig(currentWorkspace.id);
      if (res?.connection) {
        setConnection(res.connection);
      } else {
        setConnection(null);
      }
      if (res?.metaAppId) setMetaAppId(res.metaAppId);
      if (res?.metaConfigId) setMetaConfigId(res.metaConfigId);
    } catch (err: any) {
      console.error('Erreur chargement WhatsApp config:', err);
      setError(err.message || 'Impossible de vérifier le statut WhatsApp.');
    } finally {
      setLoading(false);
    }
  }, [currentWorkspace?.id]);

  useEffect(() => {
    fetchWhatsAppStatus();
  }, [fetchWhatsAppStatus]);

  // 2. Initialize Meta / Facebook SDK
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Listen to Meta Embedded Signup postMessage events
    const handleMetaMessage = (event: MessageEvent) => {
      // Validate origin from facebook / meta domains
      if (
        event.origin.includes('facebook.com') ||
        event.origin.includes('meta.com')
      ) {
        try {
          const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
          if (data.type === 'WA_EMBEDDED_SIGNUP') {
            if (data.event === 'FINISH' || data.event === 'SUCCESS') {
              const { phone_number_id, waba_id } = data.data || {};
              setSessionMetaInfo({
                phoneNumberId: phone_number_id,
                wabaId: waba_id,
              });
            } else if (data.event === 'CANCEL') {
              setActionLoading(false);
            } else if (data.event === 'ERROR') {
              setError(data.data?.error_message || 'Une erreur est survenue durant le parcours Meta.');
              setActionLoading(false);
            }
          }
        } catch (e) {
          // Non-JSON message, ignore safely
        }
      }
    };

    window.addEventListener('message', handleMetaMessage);

    // Initialize Facebook SDK if not already loaded
    if (!window.FB) {
      window.fbAsyncInit = function () {
        window.FB.init({
          appId: metaAppId || process.env.NEXT_PUBLIC_META_APP_ID || '',
          cookie: true,
          xfbml: true,
          version: 'v21.0',
        });
        setSdkReady(true);
      };

      const script = document.createElement('script');
      script.id = 'facebook-jssdk';
      script.src = 'https://connect.facebook.net/fr_FR/sdk.js';
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
    } else {
      setSdkReady(true);
    }

    return () => {
      window.removeEventListener('message', handleMetaMessage);
    };
  }, [metaAppId]);

  // 3. Launch Meta Embedded Signup Flow
  const launchMetaEmbeddedSignup = (mode: 'connect_existing' | 'create_new') => {
    if (!currentWorkspace?.id) {
      setError("Veuillez sélectionner une organisation valide.");
      return;
    }

    const appId = metaAppId || process.env.NEXT_PUBLIC_META_APP_ID;
    const configId = metaConfigId || process.env.NEXT_PUBLIC_META_CONFIG_ID;

    if (!appId || !configId) {
      setError(
        "Configuration Meta manquante (META_APP_ID ou META_CONFIG_ID non configuré dans les variables d'environnement)."
      );
      return;
    }

    setError(null);
    setSuccessMessage(null);
    setActionLoading(true);

    if (window.FB) {
      window.FB.login(
        async function (response: any) {
          if (response.authResponse && response.authResponse.code) {
            const code = response.authResponse.code;
            try {
              const res = await workspaceApi.connectWhatsApp(currentWorkspace.id, {
                code,
                wabaId: sessionMetaInfo.wabaId,
                phoneNumberId: sessionMetaInfo.phoneNumberId,
              });

              if (res.connection) {
                setConnection(res.connection);
                setSuccessMessage("Compte WhatsApp Business associé avec succès !");
              }
              await fetchWhatsAppStatus();
            } catch (err: any) {
              console.error("Erreur association WhatsApp:", err);
              setError(
                err.message ||
                  "Une erreur est survenue lors de l'enregistrement de la connexion WhatsApp."
              );
            } finally {
              setActionLoading(false);
            }
          } else {
            setActionLoading(false);
            if (response.status === 'unknown') {
              // User closed popup without authorizing
              return;
            }
            setError("Le parcours Meta n'a pas été finalisé ou a été annulé.");
          }
        },
        {
          config_id: configId,
          response_type: 'code',
          override_default_response_type: true,
          extras: {
            feature: 'whatsapp_embedded_signup',
            sessionInfoVersion: '2',
            setup: {
              flow: mode === 'create_new' ? 'creation' : 'association',
            },
          },
        }
      );
    } else {
      setActionLoading(false);
      setError("Le SDK Meta n'est pas encore prêt. Veuillez rafraîchir la page.");
    }
  };

  // 4. Handle Disconnect
  const handleDisconnect = async () => {
    if (!currentWorkspace?.id) return;
    try {
      setActionLoading(true);
      setError(null);
      await workspaceApi.disconnectWhatsApp(currentWorkspace.id);
      setConnection(null);
      setIsDisconnectModalOpen(false);
      setSuccessMessage("Le compte WhatsApp Business a été déconnecté avec succès.");
      await fetchWhatsAppStatus();
    } catch (err: any) {
      setError(err.message || "Impossible de déconnecter le compte WhatsApp.");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <PhoneCall className="w-5 h-5 text-emerald-600" />
            Canal WhatsApp Business
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Connectez votre compte officiel WhatsApp Business pour automatiser et piloter votre relation client.
          </p>
        </div>

        {connection && (
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Connecté & Actif</span>
          </div>
        )}
      </div>

      {/* Notifications / Alerts */}
      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{successMessage}</span>
          </div>
          <button
            onClick={() => setSuccessMessage(null)}
            className="text-emerald-700 hover:text-emerald-900 font-bold ml-4 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-rose-700 hover:text-rose-900 font-bold ml-4 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Configuration Status Notice if Meta credentials not configured */}
      {!metaAppId && !process.env.NEXT_PUBLIC_META_APP_ID && !loading && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1">
          <div className="flex items-center gap-2 font-bold text-amber-800">
            <HelpCircle className="w-4 h-4" />
            <span>Configuration Meta Requise</span>
          </div>
          <p className="text-amber-700 text-[11px]">
            L'application Meta de Zadesk n'a pas encore été configurée dans l'environnement serveur (`META_APP_ID` et `META_CONFIG_ID`).
            Configurez ces variables dans votre fichier `.env` pour lancer l'Embedded Signup officiel.
          </p>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading ? (
        <div className="p-8 rounded-3xl bg-white border border-slate-200/90 shadow-sm flex items-center justify-center py-16">
          <div className="flex flex-col items-center gap-3 text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin text-emerald-600" />
            <span className="text-xs font-medium">Vérification de la connexion WhatsApp...</span>
          </div>
        </div>
      ) : connection ? (
        /* ========================================================================= */
        /* ÉTAT 1 : CONNECTÉ                                                         */
        /* ========================================================================= */
        <div className="space-y-6">
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-slate-100">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 shadow-xs">
                  <Smartphone className="w-7 h-7" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <h2 className="text-base font-bold text-slate-900">
                      {connection.verifiedName || currentWorkspace?.name || 'WhatsApp Business'}
                    </h2>
                  </div>
                  <p className="text-sm font-semibold text-slate-700 mt-0.5 font-mono">
                    {connection.displayPhoneNumber}
                  </p>
                  <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                    Connecté le{' '}
                    {new Date(connection.createdAt).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 self-start sm:self-auto">
                <a
                  href="https://business.facebook.com/wa/manage/phone-numbers/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200 transition-all flex items-center gap-1.5 shadow-2xs"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                  <span>Gérer sur Meta</span>
                </a>

                <button
                  type="button"
                  onClick={() => setIsDisconnectModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold border border-rose-200 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-500" />
                  <span>Déconnecter</span>
                </button>
              </div>
            </div>

            {/* Connection Information Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Canal Actif
                </p>
                <p className="text-xs font-bold text-slate-800 mt-1">WhatsApp Cloud API</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Infrastructure officielle Meta</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Organisation Associée
                </p>
                <p className="text-xs font-bold text-slate-800 mt-1">
                  {currentWorkspace?.name || 'Organisation'}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">Espace sécurisé multi-tenant</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  État de la synchronisation
                </p>
                <p className="text-xs font-bold text-emerald-600 mt-1 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Opérationnel
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">Prêt pour les interactions</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ========================================================================= */
        /* ÉTAT 2 : INITIAL / NON CONNECTÉ                                           */
        /* ========================================================================= */
        <div className="space-y-6">
          {/* Main Hero Card */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-6">
            <div className="max-w-2xl space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200/70">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Intégration Officielle Meta</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Connectez le WhatsApp Business de votre entreprise à Zadesk
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Associez votre compte WhatsApp en quelques secondes. Choisissez l&apos;option qui correspond à votre situation :
              </p>
            </div>

            {/* Two Action Choice Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
              {/* Option 1: Connect Existing */}
              <div className="p-6 rounded-3xl bg-slate-50/70 border border-slate-200/80 hover:border-emerald-300 hover:bg-emerald-50/30 transition-all flex flex-col justify-between space-y-5">
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 text-emerald-600 flex items-center justify-center shadow-xs">
                    <Layers className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Connecter un compte existant
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      Votre entreprise dispose déjà d&apos;un compte WhatsApp Business ou d&apos;un numéro professionnel configuré chez Meta.
                    </p>
                  </div>
                </div>

                <Button
                  onClick={() => launchMetaEmbeddedSignup('connect_existing')}
                  disabled={actionLoading}
                  variant="primary"
                  className="w-full justify-center !py-2.5 text-xs font-bold shadow-xs cursor-pointer"
                  leftIcon={actionLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : undefined}
                >
                  {actionLoading ? 'Connexion en cours...' : 'Connecter un compte existant'}
                </Button>
              </div>

              {/* Option 2: Create / Setup New */}
              <div className="p-6 rounded-3xl bg-emerald-50/40 border border-emerald-200/90 hover:border-emerald-400 hover:bg-emerald-50/60 transition-all flex flex-col justify-between space-y-5">
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-white border border-emerald-200 text-emerald-600 flex items-center justify-center shadow-xs">
                    <PlusCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Créer mon WhatsApp Business
                    </h3>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      Vous n&apos;avez pas encore de WhatsApp Business ? Laissez Meta vous guider pour créer et valider votre compte en 2 minutes.
                    </p>
                  </div>
                </div>

                <Button
                  onClick={() => launchMetaEmbeddedSignup('create_new')}
                  disabled={actionLoading}
                  variant="gradient"
                  className="w-full justify-center !py-2.5 text-xs font-bold shadow-md shadow-emerald-600/10 cursor-pointer"
                  leftIcon={actionLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : undefined}
                >
                  {actionLoading ? 'Initialisation...' : 'Créer mon WhatsApp Business'}
                </Button>
              </div>
            </div>

            {/* Zero Technical Hassle Reassurance */}
            <div className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px] text-slate-500">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Aucune clé API ni token à saisir</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Synchronisation 100% automatique</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Environnement officiel Cloud API</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Disconnection Confirmation Modal */}
      {isDisconnectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 max-w-md w-full shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100">
              <LogOut className="w-6 h-6" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-base font-bold text-slate-900">
                Déconnecter WhatsApp Business ?
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Cette action supprime uniquement l&apos;association entre ce numéro et votre espace Zadesk.
                Votre compte WhatsApp Business et vos données chez Meta restent inchangés.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setIsDisconnectModalOpen(false)}
                disabled={actionLoading}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleDisconnect}
                disabled={actionLoading}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-sm shadow-rose-600/20"
              >
                {actionLoading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Déconnexion...</span>
                  </>
                ) : (
                  <span>Confirmer la déconnexion</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
