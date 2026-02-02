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
    secondary: string;
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
 * Adjusts color saturation and brightness for better chart visibility
 * while maintaining seasonal aesthetics
 */
function adjustColorForChart(
  color: string,
  brightnessBoost: number,
  saturationBoost: number,
  hueShift: number = 0
): string {
  const hex = color.replace('#', '');
  let r = parseInt(hex.substring(0, 2), 16);
  let g = parseInt(hex.substring(2, 4), 16);
  let b = parseInt(hex.substring(4, 6), 16);

  // Convert RGB to HSL
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  let l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  // Apply hue shift (for creating contrasting colors)
  h = (h + hueShift) % 1;
  if (h < 0) h += 1;

  // Adjust saturation and lightness
  s = Math.min(1, s * saturationBoost);
  l = Math.min(0.85, l * brightnessBoost); // Cap lightness for readability

  // Convert HSL back to RGB
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };

  let r2, g2, b2;
  if (s === 0) {
    r2 = g2 = b2 = l;
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r2 = hue2rgb(p, q, h + 1 / 3);
    g2 = hue2rgb(p, q, h);
    b2 = hue2rgb(p, q, h - 1 / 3);
  }

  const toHex = (n: number) => {
    const hex = Math.round(n * 255).toString(16);
    return hex.padStart(2, '0');
  };

  return `#${toHex(r2)}${toHex(g2)}${toHex(b2)}`;
}

/**
 * Gets chart line colors derived from current seasonal theme
 * with enhanced visibility for dark backgrounds
 */
export function getSeasonalChartColors(): {
  zenScore: string;
  wpm: string;
  accuracy: string;
} {
  const theme = getCurrentSeasonalTheme();

  return {
    zenScore: adjustColorForChart(theme.colors.primary, 1.4, 1.3), // Main metric: brightest, original hue
    wpm: adjustColorForChart(theme.colors.primary, 1.35, 1.25, 0.4), // Secondary: shifted hue for contrast
    accuracy: adjustColorForChart(theme.colors.accent, 1.3, 1.1), // Accent: slightly subdued
  };
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
      secondary: adjustColorBrightness(
        seasonalTheme.colors.secondary,
        timeTheme.atmosphere.brightness * 1.1
      ),
      glow: adjustGlow(
        seasonalTheme.colors.glow,
        timeTheme.atmosphere.brightness,
        timeTheme.atmosphere.saturation
      ),
    },
  };
}
