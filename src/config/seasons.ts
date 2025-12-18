/**
 * Seasonal Atmosphere System (花鳥風月 - Kacho-Fugetsu)
 * Combined with Time-of-Day System (移ろい - Utsuroi)
 */

import { getCurrentTimeTheme, type TimeOfDay, type TimeTheme } from './timeOfDay';

export type Season = 'spring' | 'summer' | 'autumn' | 'winter';

export interface SeasonalTheme {
  season: Season;
  name: {
    ja: string;
    en: string;
  };
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    glow: string;
    background: string;
    text: string;
  };
  atmosphere: {
    particle: string; // emoji or symbol for particles
    particleColor: string;
    gradient: string;
  };
  haiku: string; // Short seasonal impression in Japanese
}

export interface CombinedTheme extends SeasonalTheme {
  timeOfDay: TimeOfDay;
  timeName: { ja: string; en: string };
  timeTheme: TimeTheme;
  adjustedColors: {
    background: string;
    primary: string;
    glow: string;
  };
}

export const SEASONAL_THEMES: Record<Season, SeasonalTheme> = {
  spring: {
    season: 'spring',
    name: { ja: '春', en: 'Spring' },
    colors: {
      primary: '#fbcfe8', // Sakura pink
      secondary: '#fce7f3', // Lighter sakura
      accent: '#ec4899', // Deep pink
      glow: 'rgba(251,207,232,0.4)',
      background: '#1a1612', // Warm dark
      text: '#fef3f2',
    },
    atmosphere: {
      particle: '🌸',
      particleColor: '#fbcfe8',
      gradient: 'from-pink-900/20 via-rose-900/10 to-transparent',
    },
    haiku: '花びらの舞う静寂',
  },
  summer: {
    season: 'summer',
    name: { ja: '夏', en: 'Summer' },
    colors: {
      primary: '#67e8f9', // Cyan water
      secondary: '#a5f3fc', // Light cyan
      accent: '#06b6d4', // Deep cyan
      glow: 'rgba(103,232,249,0.3)',
      background: '#0f1419', // Cool dark
      text: '#f0fdfa',
    },
    atmosphere: {
      particle: '💧',
      particleColor: '#67e8f9',
      gradient: 'from-cyan-900/20 via-teal-900/10 to-transparent',
    },
    haiku: '水面に映る涼',
  },
  autumn: {
    season: 'autumn',
    name: { ja: '秋', en: 'Autumn' },
    colors: {
      primary: '#fb923c', // Maple orange
      secondary: '#fed7aa', // Light orange
      accent: '#ea580c', // Deep orange
      glow: 'rgba(251,146,60,0.3)',
      background: '#1c1410', // Warm dark brown
      text: '#fef3e2',
    },
    atmosphere: {
      particle: '🍂',
      particleColor: '#fb923c',
      gradient: 'from-orange-900/20 via-amber-900/10 to-transparent',
    },
    haiku: '紅葉散りゆく秋',
  },
  winter: {
    season: 'winter',
    name: { ja: '冬', en: 'Winter' },
    colors: {
      primary: '#e0f2fe', // Snow white-blue
      secondary: '#f0f9ff', // Lighter snow
      accent: '#0ea5e9', // Ice blue
      glow: 'rgba(224,242,254,0.2)',
      background: '#0a0e14', // Cold dark
      text: '#f8fafc',
    },
    atmosphere: {
      particle: '❄️',
      particleColor: '#e0f2fe',
      gradient: 'from-blue-900/20 via-slate-900/10 to-transparent',
    },
    haiku: '雪静かに降る',
  },
};

/**
 * Determines the current season based on the month
 * Japanese seasonal calendar:
 * Spring (春): March, April, May
 * Summer (夏): June, July, August
 * Autumn (秋): September, October, November
 * Winter (冬): December, January, February
 */
export function getCurrentSeason(): Season {
  const month = new Date().getMonth(); // 0-11

  if (month >= 2 && month <= 4) return 'spring'; // Mar, Apr, May
  if (month >= 5 && month <= 7) return 'summer'; // Jun, Jul, Aug
  if (month >= 8 && month <= 10) return 'autumn'; // Sep, Oct, Nov
  return 'winter'; // Dec, Jan, Feb
}

/**
 * Gets the theme for the current season
 */
export function getCurrentSeasonalTheme(): SeasonalTheme {
  return SEASONAL_THEMES[getCurrentSeason()];
}

/**
 * Adjusts color brightness based on time of day
 */
function adjustColorBrightness(color: string, brightness: number): string {
  // Parse hex color
  const hex = color.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  // Adjust brightness
  const adjust = (c: number) => Math.min(255, Math.max(0, Math.round(c * brightness)));

  return `#${adjust(r).toString(16).padStart(2, '0')}${adjust(g)
    .toString(16)
    .padStart(2, '0')}${adjust(b).toString(16).padStart(2, '0')}`;
}

/**
 * Adjusts RGBA glow based on time of day
 */
function adjustGlow(glow: string, brightness: number, saturation: number): string {
  // Extract RGBA values
  const match = glow.match(/rgba?\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/);
  if (!match) return glow;

  const [, r, g, b, a] = match;
  const adjustedR = Math.round(parseInt(r) * saturation);
  const adjustedG = Math.round(parseInt(g) * saturation);
  const adjustedB = Math.round(parseInt(b) * saturation);
  const adjustedA = parseFloat(a) * brightness;

  return `rgba(${adjustedR},${adjustedG},${adjustedB},${adjustedA})`;
}

/**
 * Gets combined season + time-of-day theme
 */
export function getCombinedTheme(): CombinedTheme {
  const seasonalTheme = getCurrentSeasonalTheme();
  const timeTheme = getCurrentTimeTheme();

  return {
    ...seasonalTheme,
    timeOfDay: timeTheme.timeOfDay,
    timeName: timeTheme.name,
    timeTheme,
    adjustedColors: {
      background: adjustColorBrightness(
        seasonalTheme.colors.background,
        timeTheme.atmosphere.brightness
      ),
      primary: adjustColorBrightness(
        seasonalTheme.colors.primary,
        timeTheme.atmosphere.brightness * 1.2 // Slight boost for visibility
      ),
      glow: adjustGlow(
        seasonalTheme.colors.glow,
        timeTheme.atmosphere.brightness,
        timeTheme.atmosphere.saturation
      ),
    },
  };
}
