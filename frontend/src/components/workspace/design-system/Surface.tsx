'use client';

import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}

interface SurfaceProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'canvas' | 'panel' | 'glass' | 'dark' | 'sunken';
  elevation?: 'none' | 'low' | 'mid' | 'high';
  glow?: 'none' | 'emerald' | 'navy';
  borderLight?: boolean;
}

export const Surface = React.forwardRef<HTMLDivElement, SurfaceProps>(
  (
    {
      className,
      variant = 'panel',
      elevation = 'none',
      glow = 'none',
      borderLight = false,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          'relative transition-colors duration-150',
          variant === 'canvas' && 'bg-[#FAFAF8] text-[#0D1B3D]',
          variant === 'panel' && 'bg-white text-[#0D1B3D] border border-[#E5E4DF]',
          variant === 'glass' && 'bg-white/90 backdrop-blur-xl text-[#0D1B3D] border border-[#E5E4DF]',
          variant === 'dark' && 'bg-[#0D1B3D] text-white border border-[#152C61]',
          variant === 'sunken' && 'bg-[#F4F3EF] border border-[#E5E4DF] text-[#0D1B3D]',
          elevation === 'low' && 'shadow-[0_1px_2px_rgba(13,27,61,0.04)]',
          elevation === 'mid' && 'shadow-[0_4px_16px_-4px_rgba(13,27,61,0.06)]',
          elevation === 'high' && 'shadow-[0_12px_32px_-8px_rgba(13,27,61,0.1)]',
          borderLight && variant === 'dark' && 'shadow-[inset_0_1px_0_rgba(255,255,255,0.14)]',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Surface.displayName = 'Surface';
