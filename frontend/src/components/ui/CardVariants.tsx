'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowUpRight, TrendingUp, TrendingDown, Clock, ShieldCheck, CheckCircle2 } from 'lucide-react';

/* =========================================================================
   1. CARTE OPÉRATIONNELLE (Command & Action)
   ========================================================================= */
export interface OperationalCardProps {
  title: string;
  subtitle?: string;
  statusText: string;
  statusVariant?: 'success' | 'warning' | 'danger' | 'neutral';
  timeAgo?: string;
  quote?: string;
  actionLabel?: string;
  onAction?: () => void;
  actionHref?: string;
  className?: string;
}

export const OperationalCard: React.FC<OperationalCardProps> = ({
  title,
  subtitle,
  statusText,
  statusVariant = 'neutral',
  timeAgo,
  quote,
  actionLabel = 'Traiter',
  onAction,
  actionHref,
  className = '',
}) => {
  const variantStyles = {
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border-rose-200',
    neutral: 'bg-slate-100 text-slate-700 border-slate-200',
  }[statusVariant];

  return (
    <div
      className={`rounded-2xl p-5 bg-white border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-md transition-all flex flex-col justify-between space-y-4 ${className}`}
    >
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h4 className="text-sm font-bold text-slate-900 truncate">
              {title}
            </h4>
            {subtitle && (
              <p className="text-xs text-slate-500 mt-0.5 truncate">
                {subtitle}
              </p>
            )}
          </div>

          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border shrink-0 ${variantStyles}`}>
            {statusText}
          </span>
        </div>

        {quote && (
          <p className="text-xs text-slate-600 line-clamp-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100 leading-relaxed">
            « {quote} »
          </p>
        )}
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
        {timeAgo ? (
          <span className="text-slate-400 flex items-center gap-1 font-mono text-[11px]">
            <Clock className="w-3.5 h-3.5" />
            {timeAgo}
          </span>
        ) : <div />}

        {actionHref ? (
          <Link
            href={actionHref}
            className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs inline-flex items-center gap-1 transition-all active:scale-[0.98] shadow-2xs"
          >
            <span>{actionLabel}</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        ) : onAction ? (
          <button
            type="button"
            onClick={onAction}
            className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs inline-flex items-center gap-1 transition-all active:scale-[0.98] shadow-2xs cursor-pointer"
          >
            <span>{actionLabel}</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        ) : null}
      </div>
    </div>
  );
};

/* =========================================================================
   2. CARTE DE NAVIGATION (Discovery & Hub)
   ========================================================================= */
export interface NavigationCardProps {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  badge?: string;
  className?: string;
}

export const NavigationCard: React.FC<NavigationCardProps> = ({
  title,
  description,
  icon: Icon,
  href,
  badge,
  className = '',
}) => {
  return (
    <Link
      href={href}
      className={`group rounded-2xl p-5 bg-white border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between active:scale-[0.99] ${className}`}
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-800 border border-slate-100 flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-colors shadow-2xs">
            <Icon className="w-5 h-5 transition-transform group-hover:scale-105" />
          </div>

          <div className="flex items-center gap-2">
            {badge && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                {badge}
              </span>
            )}
            <div className="w-7 h-7 rounded-full text-slate-400 group-hover:text-slate-900 flex items-center justify-center transition-colors">
              <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
            {title}
          </h4>
          <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    </Link>
  );
};

/* =========================================================================
   3. CARTE FINANCIÈRE / FACTURATION
   ========================================================================= */
export interface FinancialCardProps {
  planName: string;
  priceFormatted: string;
  period: string;
  status: 'ACTIVE' | 'PENDING' | 'OVERDUE';
  nextBillingDate?: string;
  onViewInvoice?: () => void;
  className?: string;
}

export const FinancialCard: React.FC<FinancialCardProps> = ({
  planName,
  priceFormatted,
  period,
  status,
  nextBillingDate,
  onViewInvoice,
  className = '',
}) => {
  return (
    <div
      className={`rounded-2xl p-6 bg-white border border-slate-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-md transition-all flex flex-col justify-between space-y-5 ${className}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs font-semibold text-slate-400 block">
            Abonnement Zadesk
          </span>
          <h3 className="text-lg font-bold text-slate-900 mt-0.5">
            Forfait {planName}
          </h3>
        </div>

        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Actif
        </span>
      </div>

      <div className="py-2 border-y border-slate-100 flex items-baseline justify-between">
        <div>
          <span className="text-2xl font-black text-slate-900 font-mono">
            {priceFormatted}
          </span>
          <span className="text-xs text-slate-500 ml-1.5">{period}</span>
        </div>

        {nextBillingDate && (
          <span className="text-xs text-slate-500 text-right">
            Prochain renouvellement :<br />
            <strong className="text-slate-800">{nextBillingDate}</strong>
          </span>
        )}
      </div>

      <div className="flex items-center justify-between text-xs pt-1">
        <span className="text-slate-500 flex items-center gap-1">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          Paiement sécurisé SasPay
        </span>

        {onViewInvoice && (
          <button
            type="button"
            onClick={onViewInvoice}
            className="font-bold text-emerald-700 hover:text-emerald-800 transition-colors cursor-pointer"
          >
            Voir la dernière facture →
          </button>
        )}
      </div>
    </div>
  );
};

/* =========================================================================
   4. CARTE MÉTRIQUE / KPI (Quantro Style)
   ========================================================================= */
export interface MetricCardProps {
  label: string;
  value: string | number;
  changeText?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon?: React.ComponentType<{ className?: string }>;
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  changeText,
  trend = 'neutral',
  icon: Icon,
  className = '',
}) => {
  return (
    <div
      className={`rounded-2xl p-5 bg-white border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-md transition-all flex flex-col justify-between ${className}`}
    >
      <div className="flex items-center justify-between text-slate-500 mb-2">
        <span className="text-xs font-semibold text-slate-600 font-sans">
          {label}
        </span>
        {Icon && (
          <div className="w-8 h-8 rounded-lg bg-slate-50 text-slate-700 flex items-center justify-center">
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="text-2xl font-black font-sans text-slate-900 tabular-nums">
        {value}
      </div>

      {changeText && (
        <div className="flex items-center gap-1.5 mt-3 pt-2 border-t border-slate-100 text-xs">
          {trend === 'up' ? (
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
          ) : trend === 'down' ? (
            <TrendingDown className="w-3.5 h-3.5 text-rose-600" />
          ) : null}
          <span
            className={
              trend === 'up'
                ? 'text-emerald-700 font-semibold'
                : trend === 'down'
                ? 'text-rose-700 font-semibold'
                : 'text-slate-500'
            }
          >
            {changeText}
          </span>
        </div>
      )}
    </div>
  );
};
