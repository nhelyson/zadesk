'use client';

import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}

interface MonolithMetricProps {
  label: string;
  value: string | number;
  subtext?: React.ReactNode;
  icon?: React.ReactNode;
  tone?: 'white' | 'navy-mist' | 'stone' | 'champagne' | 'forest';
  trend?: {
    value: string;
    isPositive?: boolean;
    isNeutral?: boolean;
  };
  highlight?: boolean;
  className?: string;
}

export const MonolithMetric: React.FC<MonolithMetricProps> = ({
  label,
  value,
  subtext,
  icon,
  tone = 'white',
  trend,
  highlight = false,
  className,
}) => {
  const toneClasses: Record<NonNullable<MonolithMetricProps['tone']>, string> = {
    white: highlight ? 'bg-white border-[#0D1B3D]/25' : 'bg-white border-[#E5E4DF]',
    'navy-mist': 'bg-[#C8D9F0] border-[#9BB8DB] shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]',
    stone:       'bg-[#D4CEBC] border-[#AFA88F] shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]',
    champagne:   'bg-[#F5D9A0] border-[#DEB96A] shadow-[inset_0_1px_0_rgba(255,255,255,0.55)]',
    forest:      'bg-[#B8DFCA] border-[#86C4A5] shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]',
  };

  const isTinted = tone !== 'white';

  const iconAccentClasses: Record<NonNullable<MonolithMetricProps['tone']>, string> = {
    white:        'bg-slate-100 border border-slate-200 text-slate-500',
    'navy-mist':  'bg-[#1E3A6E] border border-[#0D1B3D]/20 text-white',
    stone:        'bg-[#6B6349] border border-[#AFA88F]/60 text-white',
    champagne:    'bg-[#92600A] border border-[#DEB96A]/60 text-white',
    forest:       'bg-[#1A6644] border border-[#86C4A5]/60 text-white',
  };

  return (
    <div
      className={cn(
        'flex flex-col justify-between p-4 sm:p-5 rounded-xl border transition-colors duration-150',
        toneClasses[tone],
        className
      )}
    >
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          {icon && (
            <span
              className={cn(
                'w-7 h-7 rounded-lg flex items-center justify-center shrink-0',
                iconAccentClasses[tone]
              )}
            >
              {icon}
            </span>
          )}
          <span
            className={cn(
              'text-xs font-medium truncate',
              isTinted ? 'text-[#0D1B3D]/80' : 'text-slate-500'
            )}
          >
            {label}
          </span>
        </div>
        {trend && (
          <span
            className={cn(
              'text-[11px] font-medium px-2 py-0.5 rounded-md shrink-0',
              isTinted
                ? trend.isPositive
                  ? 'bg-white/75 text-[#15803D]'
                  : !trend.isNeutral
                  ? 'bg-white/80 text-amber-900'
                  : 'bg-white/75 text-[#0D1B3D]/75'
                : trend.isNeutral
                ? 'bg-[#F4F3EF] text-slate-600'
                : trend.isPositive
                ? 'bg-[#F4F3EF] text-[#15803D]'
                : 'bg-amber-50 text-amber-800 border border-amber-200/70'
            )}
          >
            {trend.value}
          </span>
        )}
      </div>

      <div className="flex items-baseline justify-between gap-2 flex-wrap">
        <span className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0D1B3D] tabular-nums leading-none">
          {value}
        </span>
        {subtext && (
          <span
            className={cn(
              'text-[11px] font-medium truncate',
              isTinted ? 'text-[#0D1B3D]/60' : 'text-slate-400'
            )}
          >
            {subtext}
          </span>
        )}
      </div>
    </div>
  );
};
