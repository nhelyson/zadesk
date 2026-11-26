"use client";

import React from "react";
import { Globe2, MapPin, MessageSquare } from "lucide-react";

export interface MobileStep2LocationProps {
  country: string;
  city: string;
  supportWhatsApp: string;
  onUpdateField: (field: "country" | "city" | "supportWhatsApp", value: string) => void;
}

const CEMAC_COUNTRIES = [
  { value: "Congo", label: "Congo (Brazzaville)", flag: "🇨🇬", dial: "+242" },
  { value: "Cameroun", label: "Cameroun", flag: "🇨🇲", dial: "+237" },
  { value: "Gabon", label: "Gabon", flag: "🇬🇦", dial: "+241" },
  { value: "Tchad", label: "Tchad", flag: "🇹🇩", dial: "+235" },
  { value: "Centrafrique", label: "Centrafrique", flag: "🇨🇫", dial: "+236" },
  { value: "Guinée Équatoriale", label: "Guinée Équatoriale", flag: "🇬🇶", dial: "+240" },
  { value: "RDC", label: "RDC (Kinshasa)", flag: "🇨🇩", dial: "+243" },
];

const CITIES_BY_COUNTRY: Record<string, string[]> = {
  Congo: ["Brazzaville", "Pointe-Noire", "Dolisie"],
  Cameroun: ["Douala", "Yaoundé", "Bafoussam"],
  Gabon: ["Libreville", "Port-Gentil", "Franceville"],
  Tchad: ["N'Djamena", "Moundou"],
  Centrafrique: ["Bangui"],
  "Guinée Équatoriale": ["Malabo", "Bata"],
  RDC: ["Kinshasa", "Lubumbashi", "Goma"],
};

export const MobileStep2Location: React.FC<MobileStep2LocationProps> = ({
  country,
  city,
  supportWhatsApp,
  onUpdateField,
}) => {
  const currentCities = CITIES_BY_COUNTRY[country] || [];
  const selectedCountryInfo =
    CEMAC_COUNTRIES.find((c) => c.value === country) || CEMAC_COUNTRIES[0];

  const handleCountryChange = (newCountry: string) => {
    onUpdateField("country", newCountry);
    const availableCities = CITIES_BY_COUNTRY[newCountry];
    if (availableCities && availableCities.length > 0) {
      onUpdateField("city", availableCities[0]);
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Title & subtitle */}
      <div className="space-y-1 text-left">
        <h1 className="text-xl font-extrabold text-[#0D1B3D] tracking-tight">
          Implantation & Contact direct
        </h1>
        <p className="text-xs text-slate-500 leading-relaxed">
          Indiquez le lieu principal de votre activité et le canal de contact pour joindre votre équipe.
        </p>
      </div>

      {/* Select: Pays d'implantation */}
      <div className="space-y-1.5">
        <label
          htmlFor="mobile-country-select"
          className="text-xs font-bold text-slate-900 flex items-center gap-1.5"
        >
          <Globe2 className="w-3.5 h-3.5 text-slate-500" />
          <span>Pays d&apos;implantation</span>
          <span className="text-rose-500">*</span>
        </label>

        <div className="relative">
          <select
            id="mobile-country-select"
            value={country}
            onChange={(e) => handleCountryChange(e.target.value)}
            className="w-full h-12 px-3.5 rounded-2xl bg-white border border-slate-300 text-base text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0D1B3D]/15 focus:border-[#0D1B3D] transition-all shadow-2xs appearance-none pr-10 font-medium"
          >
            {CEMAC_COUNTRIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.flag} {c.label} ({c.dial})
              </option>
            ))}
          </select>
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
            ▾
          </div>
        </div>
      </div>

      {/* Input: Ville principale */}
      <div className="space-y-1.5">
        <label
          htmlFor="mobile-city-input"
          className="text-xs font-bold text-slate-900 flex items-center gap-1.5"
        >
          <MapPin className="w-3.5 h-3.5 text-slate-500" />
          <span>Ville principale</span>
          <span className="text-rose-500">*</span>
        </label>

        <input
          id="mobile-city-input"
          type="text"
          value={city}
          onChange={(e) => onUpdateField("city", e.target.value)}
          placeholder="Ex : Brazzaville, Douala, Kinshasa..."
          autoCapitalize="words"
          className="w-full h-12 px-3.5 rounded-2xl bg-white border border-slate-300 text-base text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0D1B3D]/15 focus:border-[#0D1B3D] transition-all shadow-2xs"
        />

        {/* Quick city selection pills */}
        {currentCities.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto py-1 [scrollbar-width:none]">
            <span className="text-[10px] text-slate-400 shrink-0 font-medium">Suggestions :</span>
            {currentCities.map((cityName) => {
              const isSelected = city.toLowerCase() === cityName.toLowerCase();
              return (
                <button
                  key={cityName}
                  type="button"
                  onClick={() => onUpdateField("city", cityName)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-medium shrink-0 transition-all touch-manipulation active:scale-95 ${
                    isSelected
                      ? "bg-[#0D1B3D] text-white"
                      : "bg-white border border-slate-200 text-slate-700 hover:border-slate-300 shadow-2xs"
                  }`}
                >
                  {cityName}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Input: Numéro WhatsApp professionnel */}
      <div className="space-y-1.5 pt-1">
        <label
          htmlFor="mobile-whatsapp-input"
          className="text-xs font-bold text-slate-900 flex items-center justify-between"
        >
          <div className="flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
            <span>WhatsApp professionnel</span>
          </div>
          <span className="text-[10.5px] font-normal text-slate-400">Optionnel</span>
        </label>

        <div className="flex items-center gap-2">
          <div className="h-12 px-3 rounded-2xl bg-slate-100 border border-slate-300/80 flex items-center gap-1.5 text-xs font-mono font-bold text-slate-700 shrink-0 select-none">
            <span>{selectedCountryInfo.flag}</span>
            <span>{selectedCountryInfo.dial}</span>
          </div>

          <input
            id="mobile-whatsapp-input"
            type="tel"
            inputMode="tel"
            value={supportWhatsApp}
            onChange={(e) => onUpdateField("supportWhatsApp", e.target.value)}
            placeholder="Ex : 06 123 45 67"
            className="flex-1 h-12 px-3.5 rounded-2xl bg-white border border-slate-300 text-base text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0D1B3D]/15 focus:border-[#0D1B3D] transition-all shadow-2xs font-mono"
          />
        </div>

        <p className="text-[11px] text-slate-400 leading-snug">
          Permet d&apos;afficher un bouton de contact WhatsApp direct sur votre guichet officiel.
        </p>
      </div>
    </div>
  );
};
