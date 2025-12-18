/**
 * Time-of-Day System (移ろい - Utsuroi)
 * Reflects the passage of time throughout the day
 */

export type TimeOfDay = 'morning' | 'day' | 'sunset' | 'night';

export interface TimeTheme {
  timeOfDay: TimeOfDay;
  name: {
    ja: string;
    en: string;
  };
  description: string;
  hourRange: [number, number]; // [start, end] in 24h format
  atmosphere: {
    brightness: number; // 0-1 scale
    saturation: number; // 0-1 scale
    ambientOverlay: string; // color overlay
  };
}

export const TIME_THEMES: Record<TimeOfDay, TimeTheme> = {
  morning: {
    timeOfDay: 'morning',
    name: { ja: '朝', en: 'Morning' },
    description: 'Awakening, mist, gentle light',
    hourRange: [5, 9],
    atmosphere: {
      brightness: 0.7,
      saturation: 0.6,
      ambientOverlay: 'rgba(255,250,240,0.08)', // Warm white mist
    },
  },
  day: {
    timeOfDay: 'day',
    name: { ja: '昼', en: 'Day' },
    description: 'Clarity, stillness, full light',
    hourRange: [10, 15],
    atmosphere: {
      brightness: 1.0,
      saturation: 0.8,
      ambientOverlay: 'rgba(255,255,255,0.05)', // Bright clear
    },
  },
  sunset: {
    timeOfDay: 'sunset',
    name: { ja: '黄昏', en: 'Sunset' },
    description: 'Tasogare, transition, shadows',
    hourRange: [16, 18],
    atmosphere: {
      brightness: 0.5,
      saturation: 1.0,
      ambientOverlay: 'rgba(255,140,60,0.12)', // Orange glow
    },
  },
  night: {
    timeOfDay: 'night',
    name: { ja: '夜', en: 'Night' },
    description: 'Deep void, focus, serenity',
    hourRange: [19, 4],
    atmosphere: {
      brightness: 0.3,
      saturation: 0.4,
      ambientOverlay: 'rgba(20,20,40,0.15)', // Deep blue darkness
    },
  },
};

/**
 * Determines current time of day based on hour
 */
export function getCurrentTimeOfDay(): TimeOfDay {
  const hour = new Date().getHours();

  if (hour >= 5 && hour <= 9) return 'morning';
  if (hour >= 10 && hour <= 15) return 'day';
  if (hour >= 16 && hour <= 18) return 'sunset';
  return 'night'; // 19-4
}

/**
 * Gets the time theme for the current hour
 */
export function getCurrentTimeTheme(): TimeTheme {
  return TIME_THEMES[getCurrentTimeOfDay()];
}
