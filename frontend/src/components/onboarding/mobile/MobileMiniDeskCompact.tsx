"use client";

import React from "react";
import { Building2, MapPin } from "lucide-react";

export interface MobileMiniDeskCompactProps {
  companyName: string;
  slug: string;
  sector?: string;
  city?: string;
  country?: string;
}

export const MobileMiniDeskCompact: React.FC<MobileMiniDeskCompactProps> = ({
  companyName,
  slug,
  sector,
  city,
  country,
}) => {
  const displayName = companyName?.trim() || "Votre entreprise";
  const displaySlug = slug?.trim() || "votre-espace";
  const initial = displayName.charAt(0).toUpperCase() || "Z";

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-2.5 shadow-2xs transition-all flex items-center justify-between gap-3">
      {/* Avatar initial + Name & slug */}
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        <div className="w-8 h-8 rounded-xl bg-[#0D1B3D] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
          {initial}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-[#0D1B3D] truncate">
              {displayName}
            </span>
            {sector && (
              <span className="text-[10px] text-slate-400 font-medium truncate hidden xs:inline">
                • {sector}
              </span>
            )}
          </div>
          <p className="text-[10.5px] font-mono text-slate-400 truncate">
            zadesk.com/entreprises/<span className="text-slate-600 font-medium">{displaySlug}</span>
          </p>
        </div>
      </div>

      {/* Location tag if provided */}
      {city && (
        <div className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-50 border border-slate-200/80 text-[10.5px] text-slate-600 shrink-0 font-medium">
          <MapPin className="w-3 h-3 text-emerald-600" />
          <span className="truncate max-w-[85px]">{city}</span>
        </div>
      )}
    </div>
  );
};
