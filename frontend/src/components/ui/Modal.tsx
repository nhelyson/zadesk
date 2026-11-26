'use client';

import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, AlertTriangle, CheckCircle2, Info } from 'lucide-react';

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  size?: ModalSize;
  children: React.ReactNode;
  footer?: React.ReactNode;
  preventOutsideClose?: boolean;
  showCloseButton?: boolean;
  className?: string;
}

const sizeClasses: Record<ModalSize, string> = {
  sm: 'sm:max-w-md',
  md: 'sm:max-w-lg',
  lg: 'sm:max-w-2xl',
  xl: 'sm:max-w-4xl',
};

/**
 * Zadesk Modal & Sheet Component
 * Implements Apple Design & Mobile Native guidelines:
 * - Desktop: Centered, floating modal with subtle spring entrance and diffused shadow
 * - Mobile: Automatic responsive bottom sheet with touch-friendly dimensions
 * - Keyboard: ESC key to dismiss, focus retention
 */
export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  size = 'md',
  children,
  footer,
  preventOutsideClose = false,
  showCloseButton = true,
  className = '',
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 md:p-6 overflow-x-hidden overflow-y-auto">
          {/* Backdrop with subtle blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            onClick={() => !preventOutsideClose && onClose()}
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-0"
            aria-hidden="true"
          />

          {/* Modal Container / Mobile Bottom Sheet */}
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{
              type: 'spring',
              damping: 25,
              stiffness: 300,
              mass: 0.8,
            }}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? 'modal-title' : undefined}
            className={`relative z-10 w-full bg-white rounded-t-3xl sm:rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.12)] border border-slate-200/90 flex flex-col max-h-[92dvh] sm:max-h-[85vh] overflow-hidden ${sizeClasses[size]} ${className}`}
          >
            {/* Mobile Sheet Drag Handle Indicator */}
            <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto mt-2.5 sm:hidden shrink-0" />

            {/* Header */}
            {(title || showCloseButton) && (
              <div className="px-6 py-4.5 border-b border-slate-100 flex items-start justify-between gap-4 shrink-0 bg-white">
                <div className="min-w-0">
                  {title && (
                    <h2 id="modal-title" className="text-lg font-bold text-slate-900 tracking-tight font-sans">
                      {title}
                    </h2>
                  )}
                  {subtitle && (
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                      {subtitle}
                    </p>
                  )}
                </div>

                {showCloseButton && (
                  <button
                    type="button"
                    onClick={onClose}
                    className="p-1.5 -mr-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer active:scale-95"
                    aria-label="Fermer la boîte de dialogue"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            )}

            {/* Body (Smooth internal scroll) */}
            <div className="px-6 py-5 overflow-y-auto flex-1 overscroll-contain">
              {children}
            </div>

            {/* Footer */}
            {footer && (
              <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50/70 flex flex-wrap items-center justify-end gap-2.5 shrink-0">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'info' | 'success';
  loading?: boolean;
}

/**
 * Pre-composed Confirmation Modal
 */
export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirmer',
  cancelLabel = 'Annuler',
  variant = 'danger',
  loading = false,
}) => {
  const iconConfig = {
    danger: {
      bg: 'bg-rose-50 text-rose-600 border-rose-200',
      btn: 'bg-rose-600 hover:bg-rose-700 text-white',
      icon: AlertTriangle,
    },
    warning: {
      bg: 'bg-amber-50 text-amber-600 border-amber-200',
      btn: 'bg-amber-600 hover:bg-amber-700 text-white',
      icon: AlertTriangle,
    },
    info: {
      bg: 'bg-blue-50 text-blue-600 border-blue-200',
      btn: 'bg-slate-900 hover:bg-slate-800 text-white',
      icon: Info,
    },
    success: {
      bg: 'bg-emerald-50 text-emerald-600 border-emerald-200',
      btn: 'bg-emerald-600 hover:bg-emerald-700 text-white',
      icon: CheckCircle2,
    },
  }[variant];

  const Icon = iconConfig.icon;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      showCloseButton={false}
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200/70 rounded-xl transition-colors active:scale-95 disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`px-4 py-2 text-xs font-bold rounded-xl shadow-xs transition-all active:scale-95 disabled:opacity-50 flex items-center gap-1.5 ${iconConfig.btn}`}
          >
            {loading ? 'Traitement en cours...' : confirmLabel}
          </button>
        </>
      }
    >
      <div className="flex items-start gap-4">
        <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${iconConfig.bg}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="space-y-1.5 min-w-0">
          <h3 className="text-base font-bold text-slate-900 font-sans">
            {title}
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            {message}
          </p>
        </div>
      </div>
    </Modal>
  );
};
