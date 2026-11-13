'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  MapPin,
  Clock,
  Phone,
  MessageCircle,
  Building2,
  Store,
  Compass,
  Star,
  ShieldCheck,
  Check,
  Info,
} from 'lucide-react';
import { Establishment, EstablishmentType } from '@/types/workspace';

interface EstablishmentModalProps {
  establishments: Establishment[];
  selectedId: string | null;
  isOpen: boolean;
  onClose: () => void;
  companyName: string;
}

const TYPE_CONFIG: Record<
  EstablishmentType,
  { label: string; badgeClass: string; icon: React.FC<{ className?: string }> }
> = {
  HEADQUARTERS: {
    label: 'Siège social',
    badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    icon: Building2,
  },
  BRANCH: {
    label: 'Agence',
    badgeClass: 'bg-sky-50 text-sky-700 border-sky-200',
    icon: Building2,
  },
  STORE: {
    label: 'Boutique',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    icon: Store,
  },
  POINT_OF_SALE: {
    label: 'Point de vente',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
    icon: Store,
  },
  SERVICE_POINT: {
    label: 'Comptoir SAV',
    badgeClass: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    icon: Compass,
  },
  PICKUP_POINT: {
    label: 'Point relais',
    badgeClass: 'bg-purple-50 text-purple-700 border-purple-200',
    icon: MapPin,
  },
  TECH_CENTER: {
    label: 'Centre technique',
    badgeClass: 'bg-teal-50 text-teal-700 border-teal-200',
    icon: Building2,
  },
  OTHER: {
    label: 'Autre site',
    badgeClass: 'bg-slate-50 text-slate-700 border-slate-200',
    icon: Building2,
  },
};

export const EstablishmentModal: React.FC<EstablishmentModalProps> = ({
  establishments,
  selectedId,
  isOpen,
  onClose,
  companyName,
}) => {
  const [activeId, setActiveId] = useState<string | null>(selectedId);

  useEffect(() => {
    if (selectedId) {
      setActiveId(selectedId);
    } else if (establishments.length > 0) {
      setActiveId(establishments[0].id);
    }
  }, [selectedId, establishments]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const currentEst =
    establishments.find((est) => est.id === activeId) || establishments[0] || null;

  if (!currentEst) return null;

  const typeCfg = TYPE_CONFIG[currentEst.type] || TYPE_CONFIG.OTHER;
  const TypeIcon = typeCfg.icon;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-md animate-fade-in overflow-y-auto"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-black/[0.08] overflow-hidden my-auto flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-black/[0.06] bg-[#FAFAFA] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0 border border-sky-100">
              <TypeIcon className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-[#1D1D1F] truncate">
                {currentEst.name}
              </h3>
              <p className="text-[11px] text-[#86868B] truncate">
                Établissement officiel de {companyName}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-black/[0.06] text-[#86868B] hover:text-[#1D1D1F] transition-colors cursor-pointer"
            title="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Multi-establishments selector (if company has more than 1) */}
        {establishments.length > 1 && (
          <div className="px-5 py-2.5 bg-slate-50 border-b border-black/[0.04] flex items-center gap-2 overflow-x-auto scrollbar-none">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
              Implantations ({establishments.length}) :
            </span>
            <div className="flex items-center gap-1.5">
              {establishments.map((est) => {
                const isSelected = est.id === currentEst.id;
                return (
                  <button
                    key={est.id}
                    type="button"
                    onClick={() => setActiveId(est.id)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-100'
                    }`}
                  >
                    {est.isMain && <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />}
                    <span>{est.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Scrollable Body */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          {/* Storefront Image */}
          {currentEst.imageUrl && (
            <div className="relative w-full max-h-72 rounded-2xl overflow-hidden bg-slate-100 border border-black/[0.06] shadow-sm">
              <img
                src={currentEst.imageUrl}
                alt={currentEst.name}
                className="w-full h-full max-h-72 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />
              <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 flex-wrap pointer-events-none">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md bg-white/95 shadow-xs border ${typeCfg.badgeClass}`}
                >
                  <TypeIcon className="w-3.5 h-3.5 inline mr-1" />
                  {typeCfg.label}
                </span>

                {currentEst.isMain && (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500 text-white backdrop-blur-md shadow-xs flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-white text-white" />
                    <span>Siège Principal</span>
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Type & Main badges (if no image) */}
          {!currentEst.imageUrl && (
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${typeCfg.badgeClass}`}
              >
                <TypeIcon className="w-3.5 h-3.5" />
                <span>{typeCfg.label}</span>
              </span>

              {currentEst.isMain && (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  <span>Siège Principal</span>
                </span>
              )}
            </div>
          )}

          {/* Direct Action Contacts */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {currentEst.phone && (
              <a
                href={`tel:${currentEst.phone}`}
                className="p-3.5 rounded-2xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 flex items-center justify-between text-emerald-900 transition-colors group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                      Appel direct
                    </p>
                    <p className="font-mono text-xs font-bold">{currentEst.phone}</p>
                  </div>
                </div>
                <span className="text-xs font-semibold text-emerald-700 group-hover:translate-x-0.5 transition-transform">
                  Appeler →
                </span>
              </a>
            )}

            {currentEst.whatsapp && (
              <a
                href={`https://wa.me/${currentEst.whatsapp.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3.5 rounded-2xl bg-[#E7F8ED] hover:bg-[#D5F3DF] border border-emerald-300 flex items-center justify-between text-emerald-950 transition-colors group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#25D366] text-white flex items-center justify-center shrink-0 shadow-xs">
                    <MessageCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                      WhatsApp Agence
                    </p>
                    <p className="font-mono text-xs font-bold">{currentEst.whatsapp}</p>
                  </div>
                </div>
                <span className="text-xs font-semibold text-emerald-800 group-hover:translate-x-0.5 transition-transform">
                  Discuter →
                </span>
              </a>
            )}
          </div>

          {/* Physical Address */}
          <div className="p-4 rounded-2xl bg-[#FAFAFA] border border-black/[0.06] space-y-1.5">
            <div className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-xs text-[#1D1D1F]">Adresse physique</p>
                <p className="text-xs text-[#86868B] mt-0.5 leading-relaxed font-medium">
                  {currentEst.address}
                </p>
                {currentEst.addressDetails && currentEst.addressDetails !== currentEst.address && (
                  <p className="text-[11px] text-slate-500 italic mt-0.5">
                    {currentEst.addressDetails}
                  </p>
                )}
                <p className="text-[11px] text-slate-500 mt-0.5 font-semibold">
                  {[currentEst.city, currentEst.country].filter(Boolean).join(', ')}
                </p>
              </div>
            </div>
          </div>

          {/* Opening Hours */}
          {currentEst.openingHours && (
            <div className="p-4 rounded-2xl bg-[#FAFAFA] border border-black/[0.06] space-y-1.5">
              <div className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-xs text-[#1D1D1F]">Horaires d’accueil au public</p>
                  <p className="text-xs text-[#86868B] mt-0.5 font-medium leading-relaxed">
                    {currentEst.openingHours}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Services Available on site */}
          {currentEst.services && currentEst.services.length > 0 && (
            <div className="space-y-2">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">
                Services proposés sur place
              </p>
              <div className="flex flex-wrap gap-2">
                {currentEst.services.map((srv, idx) => (
                  <div
                    key={idx}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200/60 text-slate-700 text-xs font-semibold flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{srv}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Additional Photos / Gallery */}
          {Array.isArray(currentEst.galleryImages) && currentEst.galleryImages.length > 0 && (
            <div className="space-y-2">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">
                Galerie de l&apos;établissement ({currentEst.galleryImages.length})
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {currentEst.galleryImages.map((imgUrl, idx) => (
                  <div
                    key={idx}
                    className="relative aspect-video rounded-xl overflow-hidden bg-slate-100 border border-black/[0.06] shadow-xs group"
                  >
                    <img
                      src={imgUrl}
                      alt={`${currentEst.name} - photo ${idx + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Practical Info / Repères */}
          {currentEst.practicalInfo && (
            <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/70 flex items-start gap-2 text-xs text-amber-900 leading-relaxed">
              <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>{currentEst.practicalInfo}</span>
            </div>
          )}

          {/* Zadesk Guarantee */}
          <div className="pt-2">
            <div className="p-3.5 rounded-2xl bg-[#FAFAFA] border border-black/[0.06] flex items-center gap-2.5 text-[11px] text-[#86868B]">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                Implantation physique certifiée et rattachée au service client officiel de {companyName}.
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-black/[0.06] bg-[#FAFAFA] flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all cursor-pointer active:scale-95 shadow-sm"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
