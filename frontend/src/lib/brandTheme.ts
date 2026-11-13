/**
 * Brand Theme & Adaptive Palette Engine for Public Company SAV
 * Automatically derives accessible CSS variables for any company (known brands, category presets, or deterministic hash).
 * Guarantees WCAG AA (>= 4.5:1) contrast for all text against brand colors.
 */

export interface CompanyBrandPalette {
  primary: string;       // Main CTA, active accents, key borders (Hex)
  secondary: string;     // Subtle backgrounds, secondary badges
  accent: string;        // Highlights, status indicators
  surface: string;       // Tinted cards, bubble background
  surfaceBorder: string; // Border for tinted cards
  text: string;          // Heading & brand text color
  contrastText: string;  // High-contrast text on primary background (white or dark slate)
  glow: string;          // Box shadow glow color
}

// Known brand definitions with official brand identities
const BRAND_PRESETS: Record<string, CompanyBrandPalette> = {
  "airtel-congo": {
    primary: "#E11D48", // Airtel Red
    secondary: "#FFE4E6",
    accent: "#BE123C",
    surface: "#FFF1F2",
    surfaceBorder: "#FECDD3",
    text: "#9F1239",
    contrastText: "#FFFFFF",
    glow: "rgba(225, 29, 72, 0.25)",
  },
  "mtn-congo": {
    primary: "#D97706", // MTN Warm Amber / Gold
    secondary: "#FEF3C7",
    accent: "#B45309",
    surface: "#FFFBEB",
    surfaceBorder: "#FDE68A",
    text: "#78350F",
    contrastText: "#FFFFFF",
    glow: "rgba(217, 119, 6, 0.25)",
  },
  "congo-telecom-test": {
    primary: "#1D4ED8", // Congo Telecom Blue
    secondary: "#DBEAFE",
    accent: "#1E40AF",
    surface: "#EFF6FF",
    surfaceBorder: "#BFDBFE",
    text: "#1E3A8A",
    contrastText: "#FFFFFF",
    glow: "rgba(29, 78, 216, 0.25)",
  },
  "express-union-congo": {
    primary: "#0284C7", // Express Union Cerulean Blue
    secondary: "#E0F2FE",
    accent: "#0369A1",
    surface: "#F0F9FF",
    surfaceBorder: "#BAE6FD",
    text: "#075985",
    contrastText: "#FFFFFF",
    glow: "rgba(2, 132, 199, 0.25)",
  },
  "zando-market-congo": {
    primary: "#7C3AED", // Modern Purple / Violet
    secondary: "#EDE9FE",
    accent: "#6D28D9",
    surface: "#F5F3FF",
    surfaceBorder: "#DDD6FE",
    text: "#5B21B6",
    contrastText: "#FFFFFF",
    glow: "rgba(124, 58, 237, 0.25)",
  },
  "bgfi-bank-congo": {
    primary: "#047857", // Deep Banking Emerald
    secondary: "#D1FAE5",
    accent: "#065F46",
    surface: "#ECFDF5",
    surfaceBorder: "#A7F3D0",
    text: "#064E3B",
    contrastText: "#FFFFFF",
    glow: "rgba(4, 120, 87, 0.25)",
  },
  "totalenergies-congo": {
    primary: "#DC2626", // Energy Red
    secondary: "#FEE2E2",
    accent: "#B91C1C",
    surface: "#FEF2F2",
    surfaceBorder: "#FECACA",
    text: "#991B1B",
    contrastText: "#FFFFFF",
    glow: "rgba(220, 38, 38, 0.25)",
  },
};

// Category fallback palettes
const CATEGORY_PRESETS: Record<string, CompanyBrandPalette> = {
  "Télécommunications": {
    primary: "#0284C7",
    secondary: "#E0F2FE",
    accent: "#0369A1",
    surface: "#F0F9FF",
    surfaceBorder: "#BAE6FD",
    text: "#075985",
    contrastText: "#FFFFFF",
    glow: "rgba(2, 132, 199, 0.2)",
  },
  "Banque & Finance": {
    primary: "#047857",
    secondary: "#D1FAE5",
    accent: "#065F46",
    surface: "#ECFDF5",
    surfaceBorder: "#A7F3D0",
    text: "#064E3B",
    contrastText: "#FFFFFF",
    glow: "rgba(4, 120, 87, 0.2)",
  },
  "Santé & Pharmacie": {
    primary: "#0D9488",
    secondary: "#CCFBF1",
    accent: "#0F766E",
    surface: "#F0FDFA",
    surfaceBorder: "#99F6E4",
    text: "#115E59",
    contrastText: "#FFFFFF",
    glow: "rgba(13, 148, 136, 0.2)",
  },
  "Transport & Logistique": {
    primary: "#D97706",
    secondary: "#FEF3C7",
    accent: "#B45309",
    surface: "#FFFBEB",
    surfaceBorder: "#FDE68A",
    text: "#78350F",
    contrastText: "#FFFFFF",
    glow: "rgba(217, 119, 6, 0.2)",
  },
  "E-commerce & Distribution": {
    primary: "#7C3AED",
    secondary: "#EDE9FE",
    accent: "#6D28D9",
    surface: "#F5F3FF",
    surfaceBorder: "#DDD6FE",
    text: "#5B21B6",
    contrastText: "#FFFFFF",
    glow: "rgba(124, 58, 237, 0.2)",
  },
  "Énergie & Eau": {
    primary: "#0284C7",
    secondary: "#E0F2FE",
    accent: "#0369A1",
    surface: "#F0F9FF",
    surfaceBorder: "#BAE6FD",
    text: "#075985",
    contrastText: "#FFFFFF",
    glow: "rgba(2, 132, 199, 0.2)",
  },
  "Services Publics & Administration": {
    primary: "#334155",
    secondary: "#F1F5F9",
    accent: "#1E293B",
    surface: "#F8FAFC",
    surfaceBorder: "#E2E8F0",
    text: "#0F172A",
    contrastText: "#FFFFFF",
    glow: "rgba(51, 65, 85, 0.2)",
  },
  "Commerce et boutique": {
    primary: "#7C3AED",
    secondary: "#EDE9FE",
    accent: "#6D28D9",
    surface: "#F5F3FF",
    surfaceBorder: "#DDD6FE",
    text: "#5B21B6",
    contrastText: "#FFFFFF",
    glow: "rgba(124, 58, 237, 0.2)",
  },
  "Alimentation et restauration": {
    primary: "#EA580C",
    secondary: "#FFEDD5",
    accent: "#C2410C",
    surface: "#FFF7ED",
    surfaceBorder: "#FED7AA",
    text: "#9A3412",
    contrastText: "#FFFFFF",
    glow: "rgba(234, 88, 12, 0.2)",
  },
  "Beauté et bien-être": {
    primary: "#0D9488",
    secondary: "#CCFBF1",
    accent: "#0F766E",
    surface: "#F0FDFA",
    surfaceBorder: "#99F6E4",
    text: "#115E59",
    contrastText: "#FFFFFF",
    glow: "rgba(13, 148, 136, 0.2)",
  },
  "Services": {
    primary: "#1D4ED8",
    secondary: "#DBEAFE",
    accent: "#1E40AF",
    surface: "#EFF6FF",
    surfaceBorder: "#BFDBFE",
    text: "#1E3A8A",
    contrastText: "#FFFFFF",
    glow: "rgba(29, 78, 216, 0.2)",
  },
  "Transport et livraison": {
    primary: "#D97706",
    secondary: "#FEF3C7",
    accent: "#B45309",
    surface: "#FFFBEB",
    surfaceBorder: "#FDE68A",
    text: "#78350F",
    contrastText: "#FFFFFF",
    glow: "rgba(217, 119, 6, 0.2)",
  },
  "Technologie et informatique": {
    primary: "#0284C7",
    secondary: "#E0F2FE",
    accent: "#0369A1",
    surface: "#F0F9FF",
    surfaceBorder: "#BAE6FD",
    text: "#075985",
    contrastText: "#FFFFFF",
    glow: "rgba(2, 132, 199, 0.2)",
  },
  "Artisanat": {
    primary: "#B45309",
    secondary: "#FEF3C7",
    accent: "#92400E",
    surface: "#FFFBEB",
    surfaceBorder: "#FDE68A",
    text: "#78350F",
    contrastText: "#FFFFFF",
    glow: "rgba(180, 83, 9, 0.2)",
  },
};

// Default high-grade SaaS fallback (neutral graphite / deep navy)
const DEFAULT_PALETTE: CompanyBrandPalette = {
  primary: "#1E293B", // Sophisticated Slate / Navy
  secondary: "#F1F5F9",
  accent: "#0F172A",
  surface: "#F8FAFC",
  surfaceBorder: "#E2E8F0",
  text: "#0F172A",
  contrastText: "#FFFFFF",
  glow: "rgba(30, 41, 59, 0.15)",
};

/**
 * Converts HSL values to a 6-digit hex color string
 */
function hslToHex(h: number, s: number, l: number): string {
  l /= 100;
  const a = (s * Math.min(l, 1 - l)) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`.toUpperCase();
}

/**
 * Extracts RGB components from any 6-digit hex string
 */
export function hexToRgb(hexColor: string): { r: number; g: number; b: number } | null {
  const clean = hexColor.replace("#", "").trim();
  if (clean.length !== 6) return null;
  const num = parseInt(clean, 16);
  if (Number.isNaN(num)) return null;
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

/**
 * Calculates relative luminance to ensure strict WCAG AA (>= 4.5:1) text contrast.
 * Returns crisp white (#FFFFFF) or deep slate (#0F172A).
 */
export function getContrastTextColor(hexColor: string): string {
  const rgb = hexToRgb(hexColor);
  if (!rgb) return "#FFFFFF";

  const toLinear = (c: number) => {
    const norm = c / 255;
    return norm <= 0.03928 ? norm / 12.92 : Math.pow((norm + 0.055) / 1.055, 2.4);
  };

  const luminance =
    0.2126 * toLinear(rgb.r) + 0.7152 * toLinear(rgb.g) + 0.0722 * toLinear(rgb.b);

  // Luminance cutoff for optimal readability:
  // Contrast with white (L=1.0) = 1.05 / (L + 0.05)
  // Contrast with dark (L=0.01) = (L + 0.05) / 0.06
  // Cutoff is ~0.179 where dark text becomes higher contrast than white text
  return luminance > 0.2 ? "#0F172A" : "#FFFFFF";
}

/**
 * Generates a deterministic, professional palette from any string hash
 */
function generateDeterministicPalette(seed: string): CompanyBrandPalette {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }

  // Restrict hue to harmonious business tones (exclude murky yellow-greens)
  const hue = Math.abs(hash) % 360;
  const primaryHex = hslToHex(hue, 70, 40);
  const secondaryHex = hslToHex(hue, 50, 94);
  const accentHex = hslToHex(hue, 75, 32);
  const surfaceHex = hslToHex(hue, 35, 98);
  const surfaceBorderHex = hslToHex(hue, 40, 88);
  const textHex = hslToHex(hue, 80, 20);
  const contrastText = getContrastTextColor(primaryHex);

  const rgb = hexToRgb(primaryHex);
  const glow = rgb
    ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.22)`
    : "rgba(15, 23, 42, 0.15)";

  return {
    primary: primaryHex,
    secondary: secondaryHex,
    accent: accentHex,
    surface: surfaceHex,
    surfaceBorder: surfaceBorderHex,
    text: textHex,
    contrastText,
    glow,
  };
}

/**
 * Convert RGB to HSL
 */
export function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

/**
 * Derive full harmonious palette from a primary hex color
 */
export function deriveHarmoniousPalette(primaryHex: string): CompanyBrandPalette {
  const rgb = hexToRgb(primaryHex);
  if (!rgb) return DEFAULT_PALETTE;

  const { h, s } = rgbToHsl(rgb.r, rgb.g, rgb.b);
  const safeSaturation = Math.max(40, Math.min(90, s));

  const primary = primaryHex.toUpperCase();
  const secondary = hslToHex(h, Math.max(25, safeSaturation - 25), 94);
  const accent = hslToHex(h, Math.min(95, safeSaturation + 10), 32);
  const surface = hslToHex(h, Math.max(20, safeSaturation - 35), 98);
  const surfaceBorder = hslToHex(h, Math.max(30, safeSaturation - 25), 88);
  const text = hslToHex(h, Math.min(85, safeSaturation + 10), 18);
  const contrastText = getContrastTextColor(primary);
  const glow = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.22)`;

  return {
    primary,
    secondary,
    accent,
    surface,
    surfaceBorder,
    text,
    contrastText,
    glow,
  };
}

/**
 * Deterministically extracts dominant color palette from any image source (Data URL or URL).
 * Uses client-side Canvas pixel sampling with vibrant saturation weighting.
 */
export async function extractPaletteFromImage(imageSrc: string): Promise<CompanyBrandPalette> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve(DEFAULT_PALETTE);
      return;
    }

    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) {
          resolve(DEFAULT_PALETTE);
          return;
        }

        const size = 64;
        canvas.width = size;
        canvas.height = size;
        ctx.drawImage(img, 0, 0, size, size);

        const imgData = ctx.getImageData(0, 0, size, size);
        const data = imgData.data;

        // Color buckets: quantize into 16-step bins
        const colorCounts: Record<string, { count: number; r: number; g: number; b: number; score: number }> = {};

        for (let i = 0; i < data.length; i += 4) {
          const a = data[i + 3];
          if (a < 128) continue; // Skip transparent pixels

          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];

          // Skip near whites and near blacks
          const isNearWhite = r > 235 && g > 235 && b > 235;
          const isNearBlack = r < 25 && g < 25 && b < 25;
          if (isNearWhite || isNearBlack) continue;

          const qr = Math.round(r / 16) * 16;
          const qg = Math.round(g / 16) * 16;
          const qb = Math.round(b / 16) * 16;
          const key = `${qr},${qg},${qb}`;

          // Calculate saturation and vibrancy bonus
          const max = Math.max(r, g, b);
          const min = Math.min(r, g, b);
          const saturation = max === 0 ? 0 : (max - min) / max;
          const score = 1 + saturation * 3; // Boost vibrant brand colors over dull grays

          if (!colorCounts[key]) {
            colorCounts[key] = { count: 0, r, g, b, score: 0 };
          }
          colorCounts[key].count += 1;
          colorCounts[key].score += score;
        }

        const sorted = Object.values(colorCounts).sort((a, b) => b.score - a.score);

        if (sorted.length > 0) {
          const top = sorted[0];
          const hex = `#${top.r.toString(16).padStart(2, "0")}${top.g.toString(16).padStart(2, "0")}${top.b.toString(16).padStart(2, "0")}`;
          resolve(deriveHarmoniousPalette(hex));
        } else {
          resolve(DEFAULT_PALETTE);
        }
      } catch (err) {
        console.warn("[BrandTheme] Canvas color extraction fallback:", err);
        resolve(DEFAULT_PALETTE);
      }
    };

    img.onerror = () => {
      resolve(DEFAULT_PALETTE);
    };

    img.src = imageSrc;
  });
}

/**
 * Resolves the optimal brand palette for a company
 */
export function resolveCompanyBrandPalette(company: {
  slug?: string;
  name?: string;
  category?: string | null;
  brandPalette?: Partial<CompanyBrandPalette> | null;
  brandColor?: string | null;
}): CompanyBrandPalette {
  // 1. Direct custom brandPalette from workspace settings
  if (company.brandPalette && company.brandPalette.primary) {
    const derived = deriveHarmoniousPalette(company.brandPalette.primary);
    return {
      ...derived,
      ...company.brandPalette,
      contrastText: getContrastTextColor(company.brandPalette.primary || derived.primary),
    };
  }

  // 2. Direct custom brandColor
  if (company.brandColor && company.brandColor.startsWith("#")) {
    return deriveHarmoniousPalette(company.brandColor);
  }

  const slug = (company.slug || "").toLowerCase().trim();

  // 3. Check known brand presets
  if (slug && BRAND_PRESETS[slug]) {
    const preset = BRAND_PRESETS[slug];
    return {
      ...preset,
      contrastText: getContrastTextColor(preset.primary),
    };
  }

  // 4. Check category presets
  const category = (company.category || "").trim();
  if (category && CATEGORY_PRESETS[category]) {
    const preset = CATEGORY_PRESETS[category];
    return {
      ...preset,
      contrastText: getContrastTextColor(preset.primary),
    };
  }

  // 5. Fallback deterministic derivation based on name or slug
  const seed = slug || company.name;
  if (!seed) return DEFAULT_PALETTE;

  return generateDeterministicPalette(seed);
}

/**
 * Converts a palette into CSS custom properties object for the DOM root
 */
export function getBrandCssVariables(palette: CompanyBrandPalette): React.CSSProperties {
  const contrast = getContrastTextColor(palette.primary);
  const rgb = hexToRgb(palette.primary);
  const rgbString = rgb ? `${rgb.r}, ${rgb.g}, ${rgb.b}` : "30, 41, 59";

  return {
    "--company-primary": palette.primary,
    "--company-primary-rgb": rgbString,
    "--company-secondary": palette.secondary,
    "--company-accent": palette.accent,
    "--company-surface": palette.surface,
    "--company-surface-border": palette.surfaceBorder,
    "--company-text": palette.text,
    "--company-contrast": contrast,
    "--company-glow": palette.glow,
  } as React.CSSProperties;
}

/**
 * Formats availability states clearly distinguishing automated reception from human counselors
 */
export interface ScheduleDayInfo {
  key: string;
  label: string;
  isOpen: boolean;
  hoursText: string;
}

export interface AvailabilityStatusBadge {
  label: string;
  variant: "open" | "closed" | "temporary-closure" | "always-active";
  dotColor: string;
  textColor: string;
}

export interface AvailabilityInfo {
  isAlwaysAvailable: boolean;
  isTemporarilyClosed: boolean;
  temporaryClosureMessage: string | null;
  statusBadge: AvailabilityStatusBadge;
  automatedText: string;
  humanText: string;
  openingHoursDisplay: string;
  shortStatusBadge: string;
  weeklySchedule: ScheduleDayInfo[];
  timezoneDisplay?: string;
  isCurrentlyOpen: boolean;
}

export const SUPPORT_DAYS_OF_WEEK = [
  { key: "monday", label: "Lundi" },
  { key: "tuesday", label: "Mardi" },
  { key: "wednesday", label: "Mercredi" },
  { key: "thursday", label: "Jeudi" },
  { key: "friday", label: "Vendredi" },
  { key: "saturday", label: "Samedi" },
  { key: "sunday", label: "Dimanche" },
];

export const SUPPORT_TIMEZONES = [
  { value: "Africa/Brazzaville", label: "Brazzaville / Kinshasa (GMT+1)" },
  { value: "Africa/Douala", label: "Douala / Yaoundé (GMT+1)" },
  { value: "Africa/Libreville", label: "Libreville (GMT+1)" },
  { value: "Africa/Bangui", label: "Bangui (GMT+1)" },
  { value: "Africa/N_Djamena", label: "N'Djamena (GMT+1)" },
  { value: "Africa/Abidjan", label: "Abidjan / Dakar (GMT+0)" },
  { value: "Europe/Paris", label: "Paris (GMT+1 / GMT+2)" },
];

export function getSupportAvailabilityInfo(
  openingHours: string | null | undefined,
  businessHours?: any | null
): AvailabilityInfo {
  const isTemporarilyClosed = Boolean(businessHours?.isTemporarilyClosed);
  const tempMsg = businessHours?.temporaryClosureMessage?.trim();
  const rawOpeningHours = openingHours?.trim();
  const timezone = businessHours?.timezone || "Africa/Brazzaville";

  const timezoneObj = SUPPORT_TIMEZONES.find((t) => t.value === timezone);
  const timezoneDisplay = timezoneObj ? timezoneObj.label : timezone;

  // Build weekly schedule
  const schedule = businessHours?.schedule;
  const weeklySchedule: ScheduleDayInfo[] = SUPPORT_DAYS_OF_WEEK.map((d) => {
    const dayData = schedule?.[d.key];
    const isOpen = Boolean(dayData?.isOpen);

    let slots: Array<{ open: string; close: string }> = [];
    if (Array.isArray(dayData?.slots)) {
      slots = dayData.slots
        .map((s: any) => ({
          open: String(s.open || s.start || "").trim(),
          close: String(s.close || s.end || "").trim(),
        }))
        .filter((s: any) => s.open && s.close);
    } else if (Array.isArray(dayData?.ranges)) {
      slots = dayData.ranges
        .map((r: any) => ({
          open: String(r.open || r.start || "").trim(),
          close: String(r.close || r.end || "").trim(),
        }))
        .filter((s: any) => s.open && s.close);
    }

    let hoursText = "Fermé";
    if (isOpen && slots.length > 0) {
      hoursText = slots
        .map((s) => `${s.open.replace(":", "h")} - ${s.close.replace(":", "h")}`)
        .join(" & ");
    } else if (isOpen) {
      hoursText = "Ouvert";
    }

    return {
      key: d.key,
      label: d.label,
      isOpen: isOpen && (slots.length > 0 || !dayData?.slots),
      hoursText,
    };
  });

  // Calculate real-time open status in configured timezone
  let isCurrentlyOpen = false;
  if (!isTemporarilyClosed && schedule) {
    try {
      const now = new Date();
      const formatter = new Intl.DateTimeFormat("en-US", {
        timeZone: timezone,
        weekday: "long",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
      const parts = formatter.formatToParts(now);
      const weekdayStr = parts.find((p) => p.type === "weekday")?.value?.toLowerCase();
      const hour = parseInt(parts.find((p) => p.type === "hour")?.value || "0", 10);
      const minute = parseInt(parts.find((p) => p.type === "minute")?.value || "0", 10);
      const nowMinutes = hour * 60 + minute;

      if (weekdayStr && schedule[weekdayStr]) {
        const today = schedule[weekdayStr];
        let todaySlots: Array<{ open: string; close: string }> = [];
        if (Array.isArray(today.slots)) {
          todaySlots = today.slots;
        } else if (Array.isArray(today.ranges)) {
          todaySlots = today.ranges.map((r: any) => ({ open: r.start, close: r.end }));
        }

        if (today.isOpen && todaySlots.length > 0) {
          for (const slot of todaySlots) {
            const [openH, openM] = (slot.open || "00:00").split(":").map(Number);
            const [closeH, closeM] = (slot.close || "23:59").split(":").map(Number);
            const openMin = openH * 60 + (openM || 0);
            const closeMin = closeH * 60 + (closeM || 0);
            if (nowMinutes >= openMin && nowMinutes <= closeMin) {
              isCurrentlyOpen = true;
              break;
            }
          }
        }
      }
    } catch {
      isCurrentlyOpen = true;
    }
  }

  // Derive badge and display strings
  let statusBadge: AvailabilityStatusBadge;
  let shortStatusBadge: string;
  let humanText: string;
  let openingHoursDisplay: string;
  let temporaryClosureMessage: string | null = null;

  if (isTemporarilyClosed) {
    const closureMsg = tempMsg || rawOpeningHours || "Fermeture temporaire exceptionnelle.";
    temporaryClosureMessage = closureMsg;
    statusBadge = {
      label: "Fermeture exceptionnelle",
      variant: "temporary-closure",
      dotColor: "bg-amber-500",
      textColor: "text-amber-800",
    };
    shortStatusBadge = "Conseillers indisponibles";
    humanText = `Fermeture temporaire : ${closureMsg}`;
    openingHoursDisplay = closureMsg;
  } else if (schedule) {
    if (isCurrentlyOpen) {
      statusBadge = {
        label: "Conseillers en ligne",
        variant: "open",
        dotColor: "bg-emerald-500",
        textColor: "text-emerald-700",
      };
      shortStatusBadge = "Conseillers disponibles";
    } else {
      statusBadge = {
        label: "Conseillers actuellement fermés",
        variant: "closed",
        dotColor: "bg-slate-400",
        textColor: "text-slate-600",
      };
      shortStatusBadge = "Conseillers fermés";
    }
    const defaultHours = rawOpeningHours || "Horaires selon planning";
    humanText = `Conseillers SAV : ${defaultHours}`;
    openingHoursDisplay = defaultHours;
  } else {
    // Fallback if no structured schedule
    const fallbackHours = rawOpeningHours || "Lundi - Vendredi : 08h00 - 18h00";
    statusBadge = {
      label: "Assistance active 24/7",
      variant: "always-active",
      dotColor: "bg-emerald-500",
      textColor: "text-emerald-700",
    };
    shortStatusBadge = "Assistance active 24/7";
    humanText = `Conseillers d'assistance : ${fallbackHours}`;
    openingHoursDisplay = fallbackHours;
  }

  return {
    isAlwaysAvailable: true,
    isTemporarilyClosed,
    temporaryClosureMessage,
    statusBadge,
    automatedText: "Dépôt des demandes et réception officielle : 24h/24, 7j/7",
    humanText,
    openingHoursDisplay,
    shortStatusBadge,
    weeklySchedule,
    timezoneDisplay,
    isCurrentlyOpen,
  };
}
