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

export default function WorkspaceWhatsAppPage() {
  const { currentWorkspace } = useWorkspace();
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [metaAppId, setMetaAppId] = useState<string>('');
  const [metaConfigId, setMetaConfigId] = useState<string>('');
  const [connection, setConnection] = useState<WhatsAppConnectionData | null>(null);
  const [isDisconnectModalOpen, setIsDisconnectModalOpen] = useState(false);

  // Temporary captured session data from Meta Embedded Signup message events
  const [sessionMetaInfo, setSessionMetaInfo] = useState<{
    wabaId?: string;
    phoneNumberId?: string;
  }>({});

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

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleMetaMessage = (event: MessageEvent) => {
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
          // ignore
        }
      }
    };

    window.addEventListener('message', handleMetaMessage);

    if (!window.FB) {
      window.fbAsyncInit = function () {
        window.FB.init({
          appId: metaAppId || process.env.NEXT_PUBLIC_META_APP_ID || '',
          cookie: true,
          xfbml: true,
          version: 'v21.0',
        });
      };

      const script = document.createElement('script');
      script.id = 'facebook-jssdk';
      script.src = 'https://connect.facebook.net/fr_FR/sdk.js';
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
    }

    return () => {
      window.removeEventListener('message', handleMetaMessage);
    };
  }, [metaAppId]);

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
            if (response.status === 'unknown') return;
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <PhoneCall className="w-5 h-5 text-emerald-400" />
            Canal WhatsApp Business
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Connectez votre compte officiel WhatsApp Business pour automatiser et piloter votre relation client.
          </p>
        </div>

        {connection && (
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Connecté & Actif</span>
          </div>
        )}
      </div>

      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-semibold">{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage(null)} className="text-emerald-400 font-bold ml-4">✕</button>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-rose-400 font-bold ml-4">✕</button>
        </div>
      )}

      {loading ? (
        <div className="p-8 rounded-3xl bg-[#0D1B3D] border border-slate-800 shadow-xl flex items-center justify-center py-16">
          <div className="flex flex-col items-center gap-3 text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin text-emerald-400" />
            <span className="text-xs font-medium">Vérification de la connexion WhatsApp...</span>
          </div>
        </div>
      ) : connection ? (
        <div className="space-y-6">
          <div className="p-6 sm:p-8 rounded-3xl bg-[#0D1B3D] border border-slate-800 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-slate-800">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <Smartphone className="w-7 h-7" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                    <h2 className="text-base font-bold text-white">
                      {connection.verifiedName || currentWorkspace?.name || 'WhatsApp Business'}
                    </h2>
                  </div>
                  <p className="text-sm font-semibold text-slate-300 mt-0.5 font-mono">
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

              <div className="flex items-center gap-2.5">
                <a
                  href="https://business.facebook.com/wa/manage/phone-numbers/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-all flex items-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                  <span>Gérer sur Meta</span>
                </a>

                <button
                  type="button"
                  onClick={() => setIsDisconnectModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-bold border border-rose-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-400" />
                  <span>Déconnecter</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Canal Actif</p>
                <p className="text-xs font-bold text-white mt-1">WhatsApp Cloud API</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Infrastructure officielle Meta</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Organisation Associée</p>
                <p className="text-xs font-bold text-white mt-1">{currentWorkspace?.name || 'Organisation'}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Espace multi-tenant sécurisé</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">État Synchronisation</p>
                <p className="text-xs font-bold text-emerald-400 mt-1 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Opérationnel
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">Prêt pour les interactions</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="p-6 sm:p-8 rounded-3xl bg-[#0D1B3D] border border-slate-800 shadow-xl space-y-6">
            <div className="max-w-2xl space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>Intégration Officielle Meta</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Connectez le WhatsApp Business de votre entreprise à Zadesk
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Associez votre compte WhatsApp en quelques secondes. Choisissez l&apos;option qui correspond à votre situation :
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
              <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-emerald-500/40 transition-all flex flex-col justify-between space-y-5">
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 text-emerald-400 flex items-center justify-center shadow-xs">
                    <Layers className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Connecter un compte existant</h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      Votre entreprise dispose déjà d&apos;un compte WhatsApp Business ou d&apos;un numéro professionnel configuré chez Meta.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => launchMetaEmbeddedSignup('connect_existing')}
                  disabled={actionLoading}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold border border-slate-700 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  {actionLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : null}
                  <span>{actionLoading ? 'Connexion en cours...' : 'Connecter un compte existant'}</span>
                </button>
              </div>

              <div className="p-6 rounded-3xl bg-emerald-950/20 border border-emerald-500/30 hover:border-emerald-400 transition-all flex flex-col justify-between space-y-5">
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shadow-xs">
                    <PlusCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Créer mon WhatsApp Business</h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      Vous n&apos;avez pas encore de WhatsApp Business ? Laissez Meta vous guider pour créer et valider votre compte en 2 minutes.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => launchMetaEmbeddedSignup('create_new')}
                  disabled={actionLoading}
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
                >
                  {actionLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : null}
                  <span>{actionLoading ? 'Initialisation...' : 'Créer mon WhatsApp Business'}</span>
                </button>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px] text-slate-400">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Aucune clé API ni token à saisir</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Synchronisation 100% automatique</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Environnement officiel Cloud API</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {isDisconnectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-[#0D1B3D] rounded-3xl border border-slate-800 p-6 sm:p-7 max-w-md w-full shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center border border-rose-500/20">
              <LogOut className="w-6 h-6" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-base font-bold text-white">
                Déconnecter WhatsApp Business ?
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Cette action supprime uniquement l&apos;association entre ce numéro et votre espace Zadesk.
                Votre compte WhatsApp Business et vos données chez Meta restent inchangés.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setIsDisconnectModalOpen(false)}
                disabled={actionLoading}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleDisconnect}
                disabled={actionLoading}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
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
