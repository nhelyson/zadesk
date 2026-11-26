'use client';

import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}

interface StatusPillProps {
  status:
    | 'ONLINE'
    | 'BUSY'
    | 'AWAY'
    | 'OFFLINE'
    | 'ASSIGNED'
    | 'RESOLVED'
    | 'OPEN'
    | 'URGENT'
    | 'WAITING_CUSTOMER'
    | 'WAITING_AGENT'
    | 'CLOSED'
    | 'IN_PROGRESS'
    | 'IN_AGENCY'
    | (string & {});
  label?: string;
  pulse?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

export const StatusPill: React.FC<StatusPillProps> = ({
  status,
  label,
  size = 'md',
  className,
}) => {
  const config = {
    ONLINE: {
      bg: 'bg-white text-[#0D1B3D] border-[#E5E4DF]',
      dot: 'bg-[#22C55E]',
      defaultLabel: 'En ligne',
    },
    BUSY: {
      bg: 'bg-[#F4F3EF] text-slate-700 border-[#E5E4DF]',
      dot: 'bg-amber-500',
      defaultLabel: 'Occupé',
    },
    AWAY: {
      bg: 'bg-[#F4F3EF] text-slate-600 border-[#E5E4DF]',
      dot: 'bg-slate-400',
      defaultLabel: 'Absent',
    },
    OFFLINE: {
      bg: 'bg-[#F4F3EF] text-slate-500 border-[#E5E4DF]',
      dot: 'bg-slate-300',
      defaultLabel: 'Hors ligne',
    },
    ASSIGNED: {
      bg: 'bg-[#F4F3EF] text-[#0D1B3D] border-[#E5E4DF]',
      dot: 'bg-[#0D1B3D]',
      defaultLabel: 'Assigné',
    },
    RESOLVED: {
      bg: 'bg-white text-[#15803D] border-[#E5E4DF]',
      dot: 'bg-[#22C55E]',
      defaultLabel: 'Résolu',
    },
    CLOSED: {
      bg: 'bg-[#F4F3EF] text-slate-500 border-[#E5E4DF]',
      dot: 'bg-slate-400',
      defaultLabel: 'Clôturé',
    },
    WAITING_CUSTOMER: {
      bg: 'bg-amber-50/70 text-amber-900 border-amber-200/80',
      dot: 'bg-amber-500',
      defaultLabel: 'Attente client',
    },
    WAITING_AGENT: {
      bg: 'bg-amber-50/70 text-amber-900 border-amber-200/80',
      dot: 'bg-amber-500',
      defaultLabel: 'À assigner',
    },
    IN_PROGRESS: {
      bg: 'bg-white text-[#0D1B3D] border-[#E5E4DF]',
      dot: 'bg-[#22C55E]',
      defaultLabel: 'En cours',
    },
    OPEN: {
      bg: 'bg-white text-[#0D1B3D] border-[#E5E4DF]',
      dot: 'bg-[#0D1B3D]',
      defaultLabel: 'Ouvert',
    },
    URGENT: {
      bg: 'bg-rose-50/80 text-rose-800 border-rose-200',
      dot: 'bg-rose-600',
      defaultLabel: 'Urgent',
    },
  }[status as string] || {
    bg: 'bg-white text-slate-700 border-[#E5E4DF]',
    dot: 'bg-slate-400',
    defaultLabel: status,
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-medium border shrink-0',
        size === 'sm' ? 'px-2 py-0.5 rounded-md text-[11px]' : 'px-2.5 py-1 rounded-md text-xs',
        config.bg,
        className
      )}
    >
      <span className={cn('inline-block rounded-full h-1.5 w-1.5 shrink-0', config.dot)} />
      <span>{label || config.defaultLabel}</span>
    </span>
  );
};
