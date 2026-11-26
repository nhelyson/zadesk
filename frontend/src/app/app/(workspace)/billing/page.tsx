'use client';

import React, { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import gsap from 'gsap';
import {
  Check,
  ShieldCheck,
  ArrowRight,
  Clock,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  RefreshCcw,
  ChevronRight,
  Receipt,
  Users,
  Building2,
  HardDrive,
  MessageSquare,
  X,
} from 'lucide-react';
import { useWorkspace } from '@/components/workspace/WorkspaceContext';
import { apiRequest, commercialApi } from '@/lib/api';
import { WorkspaceUsageSummary, QuotaMetric } from '@/types/workspace';

interface PlanDetail {
  id: string;
  name: string;
  priceXaf: number;
  priceFormatted: string;
  period: string;
  tagline: string;
  isPopular?: boolean;
  quotas: {
    agents: string;
    establishments: string;
    storage: string;
    whatsapp: string;
  };
  features: string[];
}

const OFFICIAL_PLANS_UI: PlanDetail[] = [
  {
    id: 'DECOUVERTE',
    name: 'Découverte',
    priceXaf: 0,
    priceFormatted: '0 FCFA',
    period: '/ mois',
    tagline: 'Pour lancer sa relation client sans engagement.',
    quotas: {
      agents: '1 conseiller',
      establishments: '1 établissement',
      storage: '500 Mo',
      whatsapp: 'Web direct',
    },
    features: [
      '1 collaborateur inclus (propriétaire)',
      '1 établissement principal',
      'Boîte de réception partagée & historique',
      'Messagerie web Zalisk directe',
      'Assistance standard par e-mail',
    ],
  },
  {
    id: 'STARTER',
    name: 'Starter',
    priceXaf: 10000,
    priceFormatted: '10 000 FCFA',
    period: '/ mois',
    tagline: 'Pour les PME souhaitant structurer leur support.',
    isPopular: true,
    quotas: {
      agents: '2 conseillers',
      establishments: '1 établissement',
      storage: '2 Go',
      whatsapp: 'Inclus',
    },
    features: [
      'Jusqu’à 2 conseillers dédiés',
      '1 établissement principal',
      'Messagerie web Zalisk haute réactivité',
      'Routage des demandes par compétences',
      '100 résolutions automatiques par IA / mois (En préparation)',
      'Assistance standard par e-mail',
    ],
  },
  {
    id: 'PRO',
    name: 'Pro',
    priceXaf: 45000,
    priceFormatted: '45 000 FCFA',
    period: '/ mois',
    tagline: 'Multi-boutique et routage avancé pour équipes actives.',
    quotas: {
      agents: '5 conseillers',
      establishments: '3 agences',
      storage: '10 Go',
      whatsapp: 'Illimité',
    },
    features: [
      'Jusqu’à 5 conseillers avec rôles spécialisés',
      'Jusqu’à 3 agences physiques',
      'Messagerie haute disponibilité',
      'Routage intelligent et prioritaire',
      'Mesure d’activité en temps réel',
      'Assistance prioritaire dédiée',
    ],
  },
  {
    id: 'ENTREPRISE',
    name: 'Entreprise',
    priceXaf: 150000,
    priceFormatted: '150 000 FCFA',
    period: '/ mois',
    tagline: 'Déploiement grande échelle et gouvernance multi-sites.',
    quotas: {
      agents: 'Illimité',
      establishments: 'Illimité',
      storage: '50 Go',
      whatsapp: 'Haute capacité',
    },
    features: [
      'Conseillers et agences sans limite logicielle',
      'Espaces multi-établissements & agences régionales',
      'Rôles et permissions d’équipe sur-mesure',
      'Gestionnaire de compte Zalisk dédié',
      'SLA contractuel 99.9%',
      'Formation complète des équipes sur site',
    ],
  },
];

function formatStorageValue(mb: number): string {
  if (mb >= 1024) {
    return `${(mb / 1024).toFixed(mb % 1024 === 0 ? 0 : 2)} Go`;
  }
  return `${mb.toLocaleString('fr-FR', { maximumFractionDigits: 1 })} Mo`;
}

function getMetricAccent(status: QuotaMetric['status']) {
  if (status === 'REACHED') {
    return {
      barClass: 'bg-rose-600',
      strokeHex: '#E11D48',
      pillClass: 'bg-rose-50 text-rose-700 border-rose-200',
      label: 'Quota atteint',
    };
  }
  if (status === 'WARNING') {
    return {
      barClass: 'bg-amber-500',
      strokeHex: '#D97706',
      pillClass: 'bg-amber-50 text-amber-800 border-amber-200',
      label: 'Presque plein',
    };
  }
  return {
    barClass: 'bg-[#0D1B3D]',
    strokeHex: '#0D1B3D',
    pillClass: 'bg-[#F4F3EF] text-[#0D1B3D] border-[#E5E4DF]',
    label: 'Disponible',
  };
}

function BillingContent() {
  const { currentWorkspace, userRole, workspaceUsage, refreshWorkspaceUsage } = useWorkspace();
  const searchParams = useSearchParams();
  const router = useRouter();

  const sessionIdParam = searchParams.get('session_id');
  const paymentStatusParam = searchParams.get('payment_status');
  const targetPlanParam = searchParams.get('plan');

  const [loading, setLoading] = useState(true);
  const [activePlanId, setActivePlanId] = useState<string>('DECOUVERTE');
  const [subscriptionData, setSubscriptionData] = useState<any>(null);
  const [usageData, setUsageData] = useState<WorkspaceUsageSummary | null>(workspaceUsage);
  const [historyReceipts, setHistoryReceipts] = useState<any[]>([]);
  const [pendingIntent, setPendingIntent] = useState<any>(null);
  const [dismissRecoveryNotice, setDismissRecoveryNotice] = useState(false);

  // Checkout modal & payment state
  const [selectedPlan, setSelectedPlan] = useState<PlanDetail | null>(null);
  const [initiatingPayment, setInitiatingPayment] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Return URL Verification State
  const [verificationStatus, setVerificationStatus] = useState<
    'idle' | 'verifying' | 'confirmed' | 'pending' | 'failed'
  >('idle');
  const [verificationDetails, setVerificationDetails] = useState<string | null>(null);

  // GSAP refs
  const cockpitRef = useRef<HTMLDivElement | null>(null);
  const ringCircleRef = useRef<SVGCircleElement | null>(null);

  const fetchBillingData = useCallback(async () => {
    if (!currentWorkspace?.id) return;
    try {
      setLoading(true);
      const res = await commercialApi.getHistory(currentWorkspace.id);
      setSubscriptionData(res.subscription);
      if (res.subscription?.plan) {
        setActivePlanId(String(res.subscription.plan).toUpperCase());
      } else if (res.usage?.plan?.id) {
        setActivePlanId(String(res.usage.plan.id).toUpperCase());
      }
      if (res.usage) {
        setUsageData(res.usage);
      }
      setHistoryReceipts(res.receipts || []);

      const activePending = (res.intents || []).find(
        (i: any) => i.status === 'PENDING' && i.targetPlan !== 'DECOUVERTE'
      );
      setPendingIntent(activePending || null);
      refreshWorkspaceUsage().catch(() => {});
    } catch (err: any) {
      console.error('Erreur chargement facturation:', err);
    } finally {
      setLoading(false);
    }
  }, [currentWorkspace?.id, refreshWorkspaceUsage]);

  useEffect(() => {
    fetchBillingData();
  }, [fetchBillingData]);

  useEffect(() => {
    if (workspaceUsage && !usageData) {
      setUsageData(workspaceUsage);
    }
  }, [workspaceUsage, usageData]);

  // Close checkout modal on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedPlan && !initiatingPayment) {
        setSelectedPlan(null);
        setErrorMsg(null);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedPlan, initiatingPayment]);

  // Handle return from SasPay checkout redirect
  useEffect(() => {
    if (!sessionIdParam || !currentWorkspace?.id) return;

    let isSubscribed = true;

    async function checkSessionStatus() {
      setVerificationStatus('verifying');
      setVerificationDetails('Interrogation sécurisée de SasPay en cours...');

      try {
        const res = await apiRequest(
          `/commercial/upgrade/verify-session?workspaceId=${currentWorkspace?.id}&sessionId=${encodeURIComponent(
            sessionIdParam!
          )}`
        );

        if (!isSubscribed) return;

        const payload = res.data || res;
        if (res.success && payload?.status === 'PAID') {
          setVerificationStatus('confirmed');
          setVerificationDetails(
            `Paiement validé avec succès ! Votre formule ${payload.plan} est immédiatement active.`
          );
          setActivePlanId(String(payload.plan).toUpperCase());
          fetchBillingData();
        } else if (res.success && payload?.status === 'PENDING') {
          setVerificationStatus('pending');
          setVerificationDetails(
            payload.message ||
              'Paiement en cours de validation par l’opérateur Mobile Money. Veuillez confirmer sur votre mobile.'
          );
        } else {
          setVerificationStatus('failed');
          setVerificationDetails(
            payload?.message ||
              'Le paiement a été interrompu ou n’a pas pu être confirmé. Aucun débit n’a été appliqué.'
          );
        }
      } catch (err: any) {
        if (!isSubscribed) return;
        setVerificationStatus('failed');
        setVerificationDetails(
          err.message || 'Erreur lors de la vérification du statut auprès du serveur.'
        );
      }
    }

    checkSessionStatus();

    return () => {
      isSubscribed = false;
    };
  }, [sessionIdParam, currentWorkspace?.id, fetchBillingData]);

  // GSAP Quota Ring & Progress Bars choreography
  useEffect(() => {
    if (loading || !usageData || typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.gsap-billing-fade',
        { y: 14, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.42,
          stagger: 0.05,
          ease: 'power3.out',
          clearProps: 'transform,opacity',
        }
      );

      if (ringCircleRef.current) {
        const radius = 52;
        const circumference = 2 * Math.PI * radius;
        const targetRatio = Math.min(100, Math.max(0, usageData.peakPercentage || 0)) / 100;
        const targetOffset = circumference * (1 - targetRatio);

        gsap.fromTo(
          ringCircleRef.current,
          { strokeDashoffset: circumference },
          {
            strokeDashoffset: targetOffset,
            duration: 0.9,
            ease: 'power3.out',
          }
        );
      }

      const bars = cockpitRef.current?.querySelectorAll<HTMLElement>('[data-target-width]');
      if (bars && bars.length > 0) {
        bars.forEach((bar) => {
          const target = bar.dataset.targetWidth || '0%';
          gsap.fromTo(
            bar,
            { width: '0%' },
            {
              width: target,
              duration: 0.75,
              ease: 'power3.out',
              delay: 0.1,
            }
          );
        });
      }
    }, cockpitRef);

    return () => ctx.revert();
  }, [loading, usageData]);

  // Trigger SasPay Checkout Session
  const handleStartCheckout = async (plan: PlanDetail) => {
    if (!currentWorkspace?.id) return;
    setErrorMsg(null);
    setInitiatingPayment(true);

    try {
      const returnUrl = `${window.location.origin}/app/billing?session_id={CHECKOUT_SESSION_ID}`;
      const res = await apiRequest('/commercial/upgrade/checkout-session', {
        method: 'POST',
        body: JSON.stringify({
          workspaceId: currentWorkspace.id,
          targetPlanId: plan.id,
          returnUrl,
        }),
      });

      const checkoutUrl = res.data?.checkoutUrl || (res as any).checkoutUrl;

      if (res.success && checkoutUrl) {
        window.location.href = checkoutUrl;
      } else {
        throw new Error(res.message || 'Impossible d’initialiser la session de paiement.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Erreur lors de la création de la session SasPay.');
      setInitiatingPayment(false);
    }
  };

  const isOwnerOrAdmin = userRole === 'OWNER' || userRole === 'ADMIN';

  const rawTargetPlanId = targetPlanParam || pendingIntent?.targetPlan || 'STARTER';
  const uncompletedPlan =
    OFFICIAL_PLANS_UI.find((p) => p.id.toUpperCase() === rawTargetPlanId.toUpperCase()) ||
    OFFICIAL_PLANS_UI[1];

  const showRecoveryCard =
    !dismissRecoveryNotice &&
    (verificationStatus === 'failed' ||
      paymentStatusParam === 'uncompleted' ||
      (Boolean(pendingIntent) && activePlanId === 'DECOUVERTE'));

  const currentPlanInfo =
    OFFICIAL_PLANS_UI.find((p) => p.id === activePlanId) || OFFICIAL_PLANS_UI[0];

  const nextRecommendedPlan = usageData?.plan?.nextRecommendedPlanId
    ? OFFICIAL_PLANS_UI.find((p) => p.id === usageData.plan.nextRecommendedPlanId) || null
    : null;

  const ringRadius = 52;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const peakPct = usageData?.peakPercentage ?? 0;
  const peakStrokeColor =
    usageData?.globalSeverity === 'REACHED'
      ? '#E11D48'
      : usageData?.globalSeverity === 'WARNING'
      ? '#D97706'
      : '#0D1B3D';

  const storageMetric = usageData?.metrics?.storage;
  const agentsMetric = usageData?.metrics?.agents;
  const establishmentsMetric = usageData?.metrics?.establishments;

  const attachmentStoragePct =
    storageMetric && storageMetric.limit
      ? Math.min(
          100,
          Math.round(((storageMetric.breakdown?.attachmentMb || 0) / storageMetric.limit) * 1000) /
            10
        )
      : 0;
  const mediaStoragePct =
    storageMetric && storageMetric.limit
      ? Math.min(
          Math.max(0, 100 - attachmentStoragePct),
          Math.round(((storageMetric.breakdown?.mediaMb || 0) / storageMetric.limit) * 1000) / 10
        )
      : 0;

  return (
    <div ref={cockpitRef} className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Top Context Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-xs text-slate-500">
          Devise : <strong className="text-[#0D1B3D] font-mono">FCFA (XAF)</strong> · Suivi en
          direct des quotas de votre espace
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchBillingData}
            disabled={loading}
            className="h-8 px-3 rounded-full bg-white hover:bg-[#F4F3EF] border border-[#E5E4DF] text-xs font-medium text-[#0D1B3D] inline-flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCcw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
            <span>Actualiser</span>
          </button>
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 bg-white px-3 h-8 rounded-full border border-[#E5E4DF]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
            Paiements SasPay actifs
          </span>
        </div>
      </div>

      {/* Recovery Card if SasPay payment interrupted */}
      {showRecoveryCard && uncompletedPlan && (
        <div className="bg-white rounded-[24px] border border-[#E5E4DF] p-6 sm:p-7 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-5 border-b border-[#E5E4DF]">
            <div className="space-y-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
                Règlement en attente
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-[#0D1B3D] tracking-tight">
                Paiement non finalisé pour la formule {uncompletedPlan.name}
              </h2>
              <p className="text-xs text-slate-500 leading-relaxed max-w-2xl">
                La transaction de{' '}
                <strong className="font-mono text-[#0D1B3D]">
                  {uncompletedPlan.priceFormatted}
                </strong>{' '}
                n&apos;a pas abouti. Aucun montant n&apos;a été débité et votre espace reste
                accessible en formule Découverte.
              </p>
            </div>

            <span className="px-3 py-1 rounded-full bg-[#F4F3EF] border border-[#E5E4DF] text-[#0D1B3D] text-xs font-mono font-semibold self-start shrink-0">
              0 FCFA prélevé
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => handleStartCheckout(uncompletedPlan)}
              disabled={initiatingPayment}
              className="inline-flex items-center justify-center gap-2 px-5 h-10 rounded-full bg-[#0D1B3D] text-white font-semibold text-xs hover:bg-[#152C61] active:scale-95 transition-all cursor-pointer disabled:opacity-50"
            >
              <span>
                {initiatingPayment
                  ? 'Initialisation SasPay...'
                  : `Réessayer le règlement SasPay (${uncompletedPlan.priceFormatted})`}
              </span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => router.push('/app')}
                className="px-4 h-10 rounded-full bg-[#FAFAF8] hover:bg-[#F4F3EF] border border-[#E5E4DF] text-[#0D1B3D] font-medium text-xs cursor-pointer"
              >
                Tableau de bord
              </button>
              <button
                type="button"
                onClick={() => setDismissRecoveryNotice(true)}
                className="text-xs text-slate-400 hover:text-slate-700 px-2 py-1 cursor-pointer"
              >
                Masquer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SasPay Verification Banner */}
      {verificationStatus !== 'idle' && verificationStatus !== 'failed' && (
        <div
          className={`p-4 rounded-2xl border flex items-start gap-3 ${
            verificationStatus === 'confirmed'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
              : verificationStatus === 'pending'
              ? 'bg-amber-50 border-amber-200 text-amber-950'
              : 'bg-white border-[#E5E4DF] text-[#0D1B3D]'
          }`}
        >
          {verificationStatus === 'confirmed' && (
            <CheckCircle2 className="w-5 h-5 text-[#22C55E] shrink-0 mt-0.5" />
          )}
          {verificationStatus === 'pending' && (
            <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5 animate-spin" />
          )}
          {verificationStatus === 'verifying' && (
            <RefreshCcw className="w-5 h-5 text-[#0D1B3D] shrink-0 mt-0.5 animate-spin" />
          )}
          <div className="flex-1 text-xs">
            <p className="font-semibold">
              {verificationStatus === 'confirmed' && 'Paiement confirmé'}
              {verificationStatus === 'pending' && 'Validation en attente'}
              {verificationStatus === 'verifying' && 'Vérification du statut SasPay'}
            </p>
            <p className="mt-0.5 opacity-90">{verificationDetails}</p>
          </div>
          <button
            type="button"
            onClick={() => {
              setVerificationStatus('idle');
              router.replace('/app/billing');
            }}
            className="text-xs font-medium underline opacity-80 hover:opacity-100 cursor-pointer"
          >
            Fermer
          </button>
        </div>
      )}

      {/* PROACTIVE QUOTA WARNING CALLOUT (Google-style banner when >= 80% or 100%) */}
      {!loading && usageData && usageData.alerts.length > 0 && (
        <div
          className={`gsap-billing-fade rounded-2xl border p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 ${
            usageData.globalSeverity === 'REACHED'
              ? 'bg-rose-50/85 border-rose-200 text-rose-950'
              : 'bg-amber-50/85 border-amber-200 text-amber-950'
          }`}
        >
          <div className="flex items-start gap-3">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                usageData.globalSeverity === 'REACHED'
                  ? 'bg-rose-100 text-rose-700'
                  : 'bg-amber-100 text-amber-700'
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div className="space-y-1 text-xs">
              <p className="font-bold text-sm">
                {usageData.globalSeverity === 'REACHED'
                  ? `Limite atteinte sur votre forfait ${usageData.plan.name}`
                  : `Vous approchez des limites de votre forfait ${usageData.plan.name}`}
              </p>
              <ul className="space-y-0.5 opacity-90">
                {usageData.alerts.map((al) => (
                  <li key={al.key}>
                    • <strong>{al.title}</strong> — {al.message}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {isOwnerOrAdmin && nextRecommendedPlan && (
            <button
              type="button"
              onClick={() => setSelectedPlan(nextRecommendedPlan)}
              className="px-4 h-9 rounded-full bg-[#0D1B3D] hover:bg-[#152C61] text-white text-xs font-semibold inline-flex items-center gap-1.5 shrink-0 transition-all active:scale-95 cursor-pointer self-start md:self-center"
            >
              <span>Passer à {nextRecommendedPlan.name}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* GOOGLE-STYLE LIVE QUOTA COCKPIT */}
      <div className="gsap-billing-fade bg-white rounded-[26px] border border-[#E5E4DF] shadow-[0_12px_34px_rgba(13,27,61,0.04)] overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12">
          {/* Left: SVG Ring Gauge + Active Plan Summary */}
          <div className="lg:col-span-4 p-6 sm:p-7 bg-[#FAFAF8] border-b lg:border-b-0 lg:border-r border-[#E5E4DF] flex flex-col justify-between gap-6">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white border border-[#E5E4DF] text-[11px] font-semibold text-[#0D1B3D]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
                Formule active
              </div>
              <h2 className="text-xl font-bold text-[#0D1B3D] tracking-tight pt-1">
                {currentPlanInfo.name}
              </h2>
              <p className="text-xs text-slate-500">
                <strong className="font-mono text-[#0D1B3D]">
                  {currentPlanInfo.priceFormatted}
                </strong>{' '}
                {currentPlanInfo.priceXaf === 0 ? 'permanent' : currentPlanInfo.period}
              </p>
              {subscriptionData?.currentPeriodEnd && currentPlanInfo.priceXaf > 0 && (
                <p className="text-[11px] text-slate-400 pt-0.5">
                  Prochaine échéance :{' '}
                  {new Date(subscriptionData.currentPeriodEnd).toLocaleDateString('fr-FR', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}
                </p>
              )}
            </div>

            {/* Animated SVG Ring */}
            <div className="flex items-center gap-5 py-1">
              <div className="relative w-[124px] h-[124px] shrink-0">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 124 124">
                  <circle
                    cx="62"
                    cy="62"
                    r={ringRadius}
                    fill="none"
                    stroke="#E5E4DF"
                    strokeWidth="10"
                  />
                  <circle
                    ref={ringCircleRef}
                    cx="62"
                    cy="62"
                    r={ringRadius}
                    fill="none"
                    stroke={peakStrokeColor}
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={ringCircumference}
                    strokeDashoffset={
                      ringCircumference * (1 - Math.min(100, Math.max(0, peakPct)) / 100)
                    }
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-xl font-bold text-[#0D1B3D] tabular-nums">
                    {loading ? '—' : `${Math.round(peakPct)}%`}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">Pic quota</span>
                </div>
              </div>

              <div className="space-y-1.5 text-xs">
                <p className="font-semibold text-[#0D1B3D]">
                  {usageData?.globalSeverity === 'REACHED'
                    ? 'Capacité atteinte'
                    : usageData?.globalSeverity === 'WARNING'
                    ? 'Seuil d’alerte atteint'
                    : 'Consommation saine'}
                </p>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  {usageData?.alerts && usageData.alerts.length > 0
                    ? `${usageData.alerts.length} ressource${
                        usageData.alerts.length > 1 ? 's' : ''
                      } nécessite${usageData.alerts.length > 1 ? 'nt' : ''} votre attention.`
                    : 'Vos quotas disponibles couvrent votre activité actuelle.'}
                </p>
              </div>
            </div>

            {isOwnerOrAdmin && nextRecommendedPlan && (
              <button
                type="button"
                onClick={() => setSelectedPlan(nextRecommendedPlan)}
                className="w-full h-9 rounded-full bg-[#0D1B3D] hover:bg-[#152C61] text-white text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
              >
                <span>Évoluer vers {nextRecommendedPlan.name}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Right: Live Graphical Meters */}
          <div className="lg:col-span-8 p-6 sm:p-7 flex flex-col justify-between gap-6">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-[#0D1B3D]">
                  Consommation en direct des quotas
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Alerte automatique à partir de 80 % et blocage/avertissement à 100 %.
                </p>
              </div>
              {usageData?.computedAt && (
                <span className="hidden sm:inline text-[11px] text-slate-400 tabular-nums">
                  Mesuré à{' '}
                  {new Date(usageData.computedAt).toLocaleTimeString('fr-FR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              )}
            </div>

            <div className="space-y-5">
              {/* 1. Collaborateurs */}
              {agentsMetric && (() => {
                const accent = getMetricAccent(agentsMetric.status);
                const widthPct = agentsMetric.unlimited ? '12%' : `${agentsMetric.percentage}%`;
                return (
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-[#F4F3EF] flex items-center justify-center text-[#0D1B3D]">
                          <Users className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <span className="font-semibold text-[#0D1B3D]">Collaborateurs</span>
                          <span className="text-[11px] text-slate-500 block">
                            {agentsMetric.breakdown?.activeMembers || 0} actif
                            {(agentsMetric.breakdown?.activeMembers || 0) > 1 ? 's' : ''}
                            {(agentsMetric.breakdown?.pendingInvitations || 0) > 0
                              ? ` · ${agentsMetric.breakdown?.pendingInvitations} invitation(s) en attente`
                              : ''}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-[#0D1B3D] tabular-nums">
                          {agentsMetric.unlimited
                            ? `${agentsMetric.used} utilisé(s) · Illimité`
                            : `${agentsMetric.used} / ${agentsMetric.limit}`}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${accent.pillClass}`}
                        >
                          {agentsMetric.unlimited
                            ? 'Illimité'
                            : `${Math.round(agentsMetric.percentage)}% · ${accent.label}`}
                        </span>
                      </div>
                    </div>

                    <div className="h-2.5 w-full rounded-full bg-[#F4F3EF] overflow-hidden">
                      <div
                        data-target-width={widthPct}
                        style={{ width: widthPct }}
                        className={`h-full rounded-full ${accent.barClass}`}
                      />
                    </div>
                  </div>
                );
              })()}

              {/* 2. Établissements & Agences */}
              {establishmentsMetric && (() => {
                const accent = getMetricAccent(establishmentsMetric.status);
                const widthPct = establishmentsMetric.unlimited
                  ? '12%'
                  : `${establishmentsMetric.percentage}%`;
                return (
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-[#F4F3EF] flex items-center justify-center text-[#0D1B3D]">
                          <Building2 className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <span className="font-semibold text-[#0D1B3D]">
                            Établissements & Agences
                          </span>
                          <span className="text-[11px] text-slate-500 block">
                            {establishmentsMetric.breakdown?.publicCount || 0} visible
                            {(establishmentsMetric.breakdown?.publicCount || 0) > 1 ? 's' : ''} sur
                            la page SAV
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-[#0D1B3D] tabular-nums">
                          {establishmentsMetric.unlimited
                            ? `${establishmentsMetric.used} utilisé(s) · Illimité`
                            : `${establishmentsMetric.used} / ${establishmentsMetric.limit}`}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${accent.pillClass}`}
                        >
                          {establishmentsMetric.unlimited
                            ? 'Illimité'
                            : `${Math.round(establishmentsMetric.percentage)}% · ${accent.label}`}
                        </span>
                      </div>
                    </div>

                    <div className="h-2.5 w-full rounded-full bg-[#F4F3EF] overflow-hidden">
                      <div
                        data-target-width={widthPct}
                        style={{ width: widthPct }}
                        className={`h-full rounded-full ${accent.barClass}`}
                      />
                    </div>
                  </div>
                );
              })()}

              {/* 3. Stockage fichiers & médias (Google Drive segmented style) */}
              {storageMetric && (() => {
                const accent = getMetricAccent(storageMetric.status);
                const attachColor =
                  storageMetric.status === 'REACHED'
                    ? 'bg-rose-600'
                    : storageMetric.status === 'WARNING'
                    ? 'bg-amber-500'
                    : 'bg-[#0D1B3D]';
                const mediaColor =
                  storageMetric.status === 'REACHED'
                    ? 'bg-rose-400'
                    : storageMetric.status === 'WARNING'
                    ? 'bg-amber-300'
                    : 'bg-slate-400';

                return (
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-[#F4F3EF] flex items-center justify-center text-[#0D1B3D]">
                          <HardDrive className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <span className="font-semibold text-[#0D1B3D]">
                            Espace de stockage (fichiers & médias)
                          </span>
                          <span className="text-[11px] text-slate-500 block">
                            {storageMetric.breakdown?.attachmentFilesCount || 0} pièce(s) jointe(s)
                            SAV ({formatStorageValue(storageMetric.breakdown?.attachmentMb || 0)}) ·{' '}
                            Façades & marque ({formatStorageValue(storageMetric.breakdown?.mediaMb || 0)})
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-[#0D1B3D] tabular-nums">
                          {formatStorageValue(storageMetric.used)} /{' '}
                          {storageMetric.breakdown?.limitLabel ||
                            formatStorageValue(storageMetric.limit || 500)}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${accent.pillClass}`}
                        >
                          {storageMetric.percentage}% · {accent.label}
                        </span>
                      </div>
                    </div>

                    {/* Segmented stacked Google-style bar */}
                    <div className="h-3 w-full rounded-full bg-[#F4F3EF] overflow-hidden flex gap-0.5">
                      {attachmentStoragePct > 0 && (
                        <div
                          data-target-width={`${Math.max(attachmentStoragePct, 1)}%`}
                          style={{ width: `${Math.max(attachmentStoragePct, 1)}%` }}
                          className={`h-full ${attachColor}`}
                          title={`Pièces jointes SAV : ${formatStorageValue(
                            storageMetric.breakdown?.attachmentMb || 0
                          )}`}
                        />
                      )}
                      {mediaStoragePct > 0 && (
                        <div
                          data-target-width={`${Math.max(mediaStoragePct, 1)}%`}
                          style={{ width: `${Math.max(mediaStoragePct, 1)}%` }}
                          className={`h-full ${mediaColor}`}
                          title={`Photos agences & marque : ${formatStorageValue(
                            storageMetric.breakdown?.mediaMb || 0
                          )}`}
                        />
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-500 pt-0.5">
                      <span className="inline-flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${attachColor}`} />
                        Pièces jointes conversations
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${mediaColor}`} />
                        Photos agences & marque
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#E5E4DF]" />
                        Disponible ({formatStorageValue(storageMetric.remaining || 0)})
                      </span>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Real Monthly Activity Footer Strip */}
            {usageData?.monthlyActivity && (
              <div className="pt-4 border-t border-[#E5E4DF] flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
                <span className="inline-flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                  Activité du mois en cours :
                </span>
                <div className="flex flex-wrap items-center gap-4 tabular-nums">
                  <span>
                    <strong className="text-[#0D1B3D]">
                      {usageData.monthlyActivity.conversationsCount}
                    </strong>{' '}
                    conversation{usageData.monthlyActivity.conversationsCount > 1 ? 's' : ''}
                  </span>
                  <span>
                    <strong className="text-[#0D1B3D]">
                      {usageData.monthlyActivity.ticketsCount}
                    </strong>{' '}
                    ticket{usageData.monthlyActivity.ticketsCount > 1 ? 's' : ''}
                  </span>
                  <span>
                    <strong className="text-[#0D1B3D]">
                      {usageData.monthlyActivity.messagesCount}
                    </strong>{' '}
                    message{usageData.monthlyActivity.messagesCount > 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Official Plans Grid */}
      <div className="gsap-billing-fade space-y-4 pt-2">
        <div>
          <h2 className="text-base font-bold text-[#0D1B3D]">Changer de formule d’abonnement</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Activation immédiate dès confirmation du paiement Mobile Money ou Carte via SasPay.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {OFFICIAL_PLANS_UI.map((plan) => {
            const isCurrent = plan.id === activePlanId;
            return (
              <div
                key={plan.id}
                className={`relative rounded-2xl p-5 flex flex-col justify-between transition-all bg-white border ${
                  isCurrent
                    ? 'border-[#0D1B3D] ring-1 ring-[#0D1B3D]'
                    : 'border-[#E5E4DF] hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-bold text-[#0D1B3D]">{plan.name}</h3>
                    {isCurrent ? (
                      <span className="px-2 py-0.5 rounded-full bg-[#0D1B3D] text-white text-[10px] font-semibold">
                        Actuel
                      </span>
                    ) : plan.isPopular ? (
                      <span className="px-2 py-0.5 rounded-full bg-[#F4F3EF] border border-[#E5E4DF] text-[#0D1B3D] text-[10px] font-semibold">
                        Populaire
                      </span>
                    ) : null}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 min-h-[32px]">{plan.tagline}</p>

                  <div className="mt-4 pb-4 border-b border-[#E5E4DF]">
                    <div className="flex items-baseline gap-1">
                      <span className="text-xl font-bold text-[#0D1B3D] tabular-nums">
                        {plan.priceFormatted}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {plan.priceXaf === 0 ? 'permanent' : plan.period}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1.5">
                      {plan.quotas.agents} · {plan.quotas.establishments} · {plan.quotas.storage}
                    </p>
                  </div>

                  <ul className="mt-4 space-y-2 text-xs text-slate-600">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-[#0D1B3D] shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6 pt-4 border-t border-[#E5E4DF]">
                  {isCurrent ? (
                    <button
                      type="button"
                      disabled
                      className="w-full h-9 rounded-full bg-[#F4F3EF] text-slate-400 text-xs font-semibold cursor-not-allowed"
                    >
                      Formule en cours
                    </button>
                  ) : plan.priceXaf === 0 ? (
                    <button
                      type="button"
                      disabled
                      className="w-full h-9 rounded-full bg-[#FAFAF8] text-slate-400 border border-[#E5E4DF] text-xs font-medium cursor-not-allowed"
                    >
                      Gratuit par défaut
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setSelectedPlan(plan)}
                      disabled={!isOwnerOrAdmin}
                      className="w-full h-9 rounded-full bg-[#0D1B3D] hover:bg-[#152C61] text-white text-xs font-semibold transition-all active:scale-95 flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <span>Passer à {plan.name}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Payment Initiation Modal (SasPay untouched) */}
      {selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-[22px] max-w-md w-full p-6 shadow-2xl border border-[#E5E4DF] space-y-5">
            <div className="flex items-center justify-between border-b border-[#E5E4DF] pb-3.5">
              <div>
                <h3 className="text-sm font-bold text-[#0D1B3D]">Confirmation de commande</h3>
                <p className="text-xs text-slate-500">Paiement sécurisé via SasPay</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedPlan(null);
                  setErrorMsg(null);
                }}
                disabled={initiatingPayment}
                className="p-1.5 rounded-full text-slate-400 hover:text-[#0D1B3D] hover:bg-[#F4F3EF] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-[#FAFAF8] rounded-xl p-4 border border-[#E5E4DF] space-y-2.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Formule sélectionnée :</span>
                <span className="font-bold text-[#0D1B3D]">{selectedPlan.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Période :</span>
                <span className="font-medium text-[#0D1B3D]">1 mois</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Quotas inclus :</span>
                <span className="font-medium text-[#0D1B3D]">
                  {selectedPlan.quotas.agents} · {selectedPlan.quotas.storage}
                </span>
              </div>
              <div className="pt-2.5 border-t border-[#E5E4DF] flex justify-between items-center text-sm">
                <span className="font-bold text-[#0D1B3D]">Total à payer :</span>
                <span className="font-bold text-[#0D1B3D] font-mono">
                  {selectedPlan.priceFormatted}
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="text-xs font-medium text-slate-600">Moyens acceptés :</div>
              <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-[#0D1B3D]">
                <span className="px-2.5 py-1 bg-[#FAFAF8] rounded-full border border-[#E5E4DF]">
                  Airtel Money Congo
                </span>
                <span className="px-2.5 py-1 bg-[#FAFAF8] rounded-full border border-[#E5E4DF]">
                  MTN Mobile Money
                </span>
                <span className="px-2.5 py-1 bg-[#FAFAF8] rounded-full border border-[#E5E4DF]">
                  Carte Bancaire
                </span>
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="flex items-center gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => {
                  setSelectedPlan(null);
                  setErrorMsg(null);
                }}
                disabled={initiatingPayment}
                className="flex-1 h-9 rounded-full border border-[#E5E4DF] bg-white hover:bg-[#F4F3EF] text-slate-700 text-xs font-medium cursor-pointer disabled:opacity-50"
              >
                Annuler
              </button>

              <button
                type="button"
                onClick={() => handleStartCheckout(selectedPlan)}
                disabled={initiatingPayment}
                className="flex-1 h-9 rounded-full bg-[#0D1B3D] hover:bg-[#152C61] text-white text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {initiatingPayment ? (
                  <>
                    <RefreshCcw className="w-3.5 h-3.5 animate-spin" />
                    <span>Connexion SasPay...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Payer avec SasPay</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment History & Receipts */}
      <div className="gsap-billing-fade space-y-3 pt-2">
        <div>
          <h2 className="text-base font-bold text-[#0D1B3D]">
            Historique des reçus et transactions
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Traçabilité des paiements confirmés via SasPay.
          </p>
        </div>

        {historyReceipts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#E5E4DF] p-8 text-center text-slate-500 text-xs">
            <Receipt className="w-7 h-7 mx-auto text-slate-400 mb-2" />
            Aucun reçu de paiement enregistré pour le moment.
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-[#E5E4DF] overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#FAFAF8] border-b border-[#E5E4DF] text-slate-500 font-medium">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Référence SasPay</th>
                  <th className="py-3 px-4">Montant</th>
                  <th className="py-3 px-4">Moyen</th>
                  <th className="py-3 px-4">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E4DF] text-slate-700">
                {historyReceipts.map((rcpt) => (
                  <tr key={rcpt.id} className="hover:bg-[#FAFAF8]">
                    <td className="py-3 px-4 font-medium text-[#0D1B3D]">
                      {new Date(rcpt.paidAt).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-600">
                      {rcpt.providerTransactionId}
                    </td>
                    <td className="py-3 px-4 font-semibold text-[#0D1B3D] tabular-nums">
                      {rcpt.amountXaf ? `${rcpt.amountXaf.toLocaleString('fr-FR')} FCFA` : '—'}
                    </td>
                    <td className="py-3 px-4">{rcpt.paymentMethod || 'Mobile Money'}</td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#F4F3EF] text-[#0D1B3D] border border-[#E5E4DF]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
                        Validé
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default function BillingPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-xs text-slate-500">
          Chargement de votre facturation…
        </div>
      }
    >
      <BillingContent />
    </Suspense>
  );
}
