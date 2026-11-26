/**
 * ZALISK — ARCHITECTURAL WORKSPACE TOKENS
 * Fidèle à la landing page : Midnight Navy (#0D1B3D), Canvas Lin (#FAFAF8),
 * Blanc (#FFFFFF), Hairlines chauds (#E5E4DF) et Emerald (#22C55E) limité
 * strictement aux signaux de disponibilité, connexion et validation.
 */

export const zadeskTokens = {
  brand: {
    name: 'Zalisk',
  },
  colors: {
    canvas: '#FAFAF8',
    surface: '#FFFFFF',
    surfaceSubtle: '#F4F3EF',
    navy: '#0D1B3D',
    navyHover: '#152C61',
    hairline: '#E5E4DF',
    emerald: '#22C55E',
    emeraldText: '#15803D',
  },
  radii: {
    card: '0.75rem', // rounded-xl
    control: '0.5rem', // rounded-lg
    pill: '9999px',
  },
  shadows: {
    subtle: '0 1px 2px rgba(13, 27, 61, 0.04)',
    card: '0 4px 16px -4px rgba(13, 27, 61, 0.06)',
  },
} as const;

export const zaliskTokens = zadeskTokens;
export type ZadeskTokens = typeof zadeskTokens;
export type ZaliskTokens = typeof zadeskTokens;
