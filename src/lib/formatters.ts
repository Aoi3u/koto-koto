/**
 * Utility functions for formatting display values
 */

/**
 * Pads a number with leading zeros
 */
export function pad(num: number, length: number = 2): string {
  return num.toString().padStart(length, '0');
}

/**
 * Formats elapsed time in MM:SS format
 */
export function formatTime(seconds: number): string {
  const mm = Math.floor(seconds / 60);
  const ss = Math.floor(seconds % 60);
  return `${pad(mm)}:${pad(ss)}`;
}

/**
 * Formats elapsed time in MM:SS.MS format
 */
export function formatTimeWithMillis(seconds: number): string {
  const mm = Math.floor(seconds / 60);
  const ss = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 100);
  return `${mm}:${pad(ss)}.${pad(ms)}`;
}

/**
 * Calculates WPM (Words Per Minute)
 */
export function calculateWPM(correctKeys: number, minutes: number): number {
  if (minutes === 0) return 0;
  return Math.round(correctKeys / 5 / minutes);
}

/**
 * Calculates KPM (Keys Per Minute)
 */
export function calculateKPM(correctKeys: number, minutes: number): number {
  if (minutes === 0) return 0;
  return Math.round(correctKeys / minutes);
}

/**
 * Calculates accuracy percentage
 */
export function calculateAccuracy(correctKeys: number, totalKeys: number): number {
  if (totalKeys === 0) return 0;
  return Math.round((correctKeys / totalKeys) * 100);
}
