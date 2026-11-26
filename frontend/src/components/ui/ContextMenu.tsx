'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MoreVertical, ChevronRight } from 'lucide-react';

export interface MenuItem {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  shortcut?: string;
  variant?: 'default' | 'danger' | 'success';
  disabled?: boolean;
  dividerBefore?: boolean;
  onClick: () => void;
}

export interface ContextMenuProps {
  items: MenuItem[];
  trigger?: React.ReactNode;
  align?: 'left' | 'right';
  className?: string;
}

/**
 * Zadesk Context Menu & Dropdown Popover
 * Lightweight, accessible, keyboard-friendly context menu with spring animations
 */
export const ContextMenu: React.FC<ContextMenuProps> = ({
  items,
  trigger,
  align = 'right',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div ref={containerRef} className={`relative inline-block text-left ${className}`}>
      {/* Trigger Button */}
      <div onClick={() => setIsOpen((prev) => !prev)}>
        {trigger ? (
          trigger
        ) : (
          <button
            type="button"
            className="w-8 h-8 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 flex items-center justify-center transition-colors active:scale-95"
            aria-expanded={isOpen}
            aria-label="Actions rapides"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Floating Menu Popover */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{
              type: 'spring',
              damping: 24,
              stiffness: 350,
            }}
            className={`absolute z-40 mt-1.5 w-56 rounded-xl bg-white border border-slate-200/90 shadow-[0_10px_30px_-5px_rgba(0,0,0,0.1)] p-1.5 focus:outline-none ${
              align === 'right' ? 'right-0' : 'left-0'
            }`}
            role="menu"
            aria-orientation="vertical"
          >
            {items.map((item) => {
              const Icon = item.icon;
              const isDanger = item.variant === 'danger';
              const isSuccess = item.variant === 'success';

              return (
                <React.Fragment key={item.id}>
                  {item.dividerBefore && (
                    <div className="my-1 border-t border-slate-100" />
                  )}

                  <button
                    type="button"
                    role="menuitem"
                    disabled={item.disabled}
                    onClick={() => {
                      if (item.disabled) return;
                      item.onClick();
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors text-left active:scale-[0.99] cursor-pointer ${
                      item.disabled
                        ? 'opacity-40 cursor-not-allowed text-slate-400'
                        : isDanger
                        ? 'text-rose-600 hover:bg-rose-50'
                        : isSuccess
                        ? 'text-emerald-700 hover:bg-emerald-50'
                        : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100/80'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {Icon && (
                        <Icon
                          className={`w-3.5 h-3.5 shrink-0 ${
                            isDanger
                              ? 'text-rose-500'
                              : isSuccess
                              ? 'text-emerald-600'
                              : 'text-slate-400'
                          }`}
                        />
                      )}
                      <span className="truncate">{item.label}</span>
                    </div>

                    {item.shortcut && (
                      <kbd className="ml-2 px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-[10px] font-mono text-slate-400 shrink-0">
                        {item.shortcut}
                      </kbd>
                    )}
                  </button>
                </React.Fragment>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
