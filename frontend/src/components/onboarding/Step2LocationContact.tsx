"use client";

import React from "react";
import {
  MapPin,
  MessageSquare,
  Lock,
  ArrowRight,
  ArrowLeft,
  Globe2,
} from "lucide-react";

export interface Step2LocationContactProps {
  country: string;
  city: string;
  supportWhatsApp: string;
  onUpdateField: (field: "country" | "city" | "supportWhatsApp", value: string) => void;
  onNext: () => void;
  onBack: () => void;
}

// 6 États membres officiels de la CEMAC
const CEMAC_COUNTRIES = [
  { value: "Congo", label: "Congo (Brazzaville)", flag: "🇨🇬", dial: "+242" },
  { value: "Cameroun", label: "Cameroun", flag: "🇨🇲", dial: "+237" },
  { value: "Gabon", label: "Gabon", flag: "🇬🇦", dial: "+241" },
  { value: "Tchad", label: "Tchad", flag: "🇹🇩", dial: "+235" },
  { value: "Centrafrique", label: "Centrafrique", flag: "🇨🇫", dial: "+236" },
  { value: "Guinée Équatoriale", label: "Guinée Équatoriale", flag: "🇬🇶", dial: "+240" },
];

// Autres pays d'Afrique centrale pris en charge par Zadesk
const OTHER_SUPPORTED_COUNTRIES = [
  { value: "RDC", label: "RDC (Kinshasa)", flag: "🇨🇩", dial: "+243" },
];

const ALL_COUNTRIES = [...CEMAC_COUNTRIES, ...OTHER_SUPPORTED_COUNTRIES];

const CITIES_BY_COUNTRY: Record<string, string[]> = {
  Congo: ["Brazzaville", "Pointe-Noire", "Dolisie"],
  Cameroun: ["Douala", "Yaoundé", "Bafoussam"],
  Gabon: ["Libreville", "Port-Gentil", "Franceville"],
  Tchad: ["N'Djamena", "Moundou"],
  Centrafrique: ["Bangui"],
  "Guinée Équatoriale": ["Malabo", "Bata"],
  RDC: ["Kinshasa", "Lubumbashi", "Goma"],
};

export const Step2LocationContact: React.FC<Step2LocationContactProps> = ({
  country,
  city,
  supportWhatsApp,
  onUpdateField,
  onNext,
  onBack,
}) => {
  const isCityValid = city.trim().length >= 2;
  const canContinue = Boolean(country) && isCityValid;

  const currentCities = CITIES_BY_COUNTRY[country] || [];

  const handleCountryChange = (newCountry: string) => {
    onUpdateField("country", newCountry);
    const availableCities = CITIES_BY_COUNTRY[newCountry];
    if (availableCities && availableCities.length > 0) {
      onUpdateField("city", availableCities[0]);
    }
  };

  const selectedCountryInfo = ALL_COUNTRIES.find((c) => c.value === country) || CEMAC_COUNTRIES[0];

  return (
    <div className="space-y-6">
      {/* 1. Header de l'étape */}
      <div className="space-y-1.5 text-left">
        <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          <span>02</span>
          <span>•</span>
          <span>Implantation & Contact</span>
        </div>
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-[#0D1B3D] tracking-tight">
          Où vos clients vous trouvent-ils ?
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-xl">
          Renseignez la localisation principale de votre activité et un canal direct optionnel.
        </p>
      </div>

      {/* 2. Champs : Pays & Ville */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Pays */}
        <div className="space-y-2">
          <label
            htmlFor="country-select"
            className="text-xs font-bold text-slate-900 flex items-center gap-1.5"
          >
            <Globe2 className="w-3.5 h-3.5 text-slate-500" />
            <span>Pays</span>
            <span className="text-rose-500">*</span>
          </label>

          <select
            id="country-select"
            value={country}
            onChange={(e) => handleCountryChange(e.target.value)}
            className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-base sm:text-sm text-slate-900 focus:outline-none focus:border-[#0D1B3D] focus:ring-4 focus:ring-[#0D1B3D]/10 bg-white cursor-pointer transition-all shadow-2xs"
          >
            <optgroup label="États membres de la CEMAC">
              {CEMAC_COUNTRIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.flag} {c.label} ({c.dial})
                </option>
              ))}
            </optgroup>
            <optgroup label="Autre pays pris en charge">
              {OTHER_SUPPORTED_COUNTRIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.flag} {c.label} ({c.dial})
                </option>
              ))}
            </optgroup>
          </select>
        </div>

        {/* Ville */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label
              htmlFor="city-input"
              className="text-xs font-bold text-slate-900 flex items-center gap-1.5"
            >
              <MapPin className="w-3.5 h-3.5 text-slate-500" />
              <span>Ville</span>
              <span className="text-rose-500">*</span>
            </label>

            {/* Suggestions de villes discrètes */}
            {currentCities.length > 0 && (
              <div className="flex items-center gap-1">
                {currentCities.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => onUpdateField("city", c)}
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
                      city.toLowerCase() === c.toLowerCase()
                        ? "bg-[#0D1B3D] text-white"
                        : "text-slate-500 hover:text-slate-800 bg-slate-100"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            )}
          </div>

          <input
            id="city-input"
            type="text"
            required
            value={city}
            onChange={(e) => onUpdateField("city", e.target.value)}
            placeholder="Ex : Brazzaville, Pointe-Noire..."
            className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-base sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0D1B3D] focus:ring-4 focus:ring-[#0D1B3D]/10 bg-white transition-all shadow-2xs"
          />
        </div>
      </div>

      {/* 3. Champ : WhatsApp Professionnel (Optionnel) */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between">
          <label
            htmlFor="whatsapp-input"
            className="text-xs font-bold text-slate-900 flex items-center gap-1.5"
          >
            <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
            <span>Numéro WhatsApp professionnel</span>
          </label>
          <span className="text-[11px] font-medium text-slate-400">
            Facultatif
          </span>
        </div>

        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <span className="text-xs font-semibold text-slate-400 font-mono">
              {selectedCountryInfo.dial}
            </span>
          </div>
          <input
            id="whatsapp-input"
            type="tel"
            value={supportWhatsApp}
            onChange={(e) => onUpdateField("supportWhatsApp", e.target.value)}
            placeholder="06 123 45 67"
            className="w-full pl-16 pr-4 py-3 rounded-2xl border border-slate-200 text-base sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0D1B3D] focus:ring-4 focus:ring-[#0D1B3D]/10 bg-white transition-all shadow-2xs font-mono"
          />
        </div>

        {/* Note de réassurance sobre et transparente */}
        <p className="text-[11px] text-slate-400 flex items-center gap-1.5 pt-0.5">
          <Lock className="w-3 h-3 text-slate-400 shrink-0" />
          <span>
            Votre ligne personnelle reste masquée. Les clients passent par le guichet de relation client.
          </span>
        </p>
      </div>

      {/* 4. Navigation Desktop */}
      <div className="pt-4 hidden sm:flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Retour</span>
        </button>

        <button
          type="button"
          onClick={onNext}
          disabled={!canContinue}
          className={`inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all shadow-sm ${
            canContinue
              ? "bg-[#0D1B3D] text-white hover:bg-slate-800 shadow-slate-900/10 cursor-pointer"
              : "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
          }`}
        >
          <span>Aperçu & Validation</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
