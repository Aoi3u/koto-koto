/**
 * Utility functions for formatting display values
 * Game calculation utilities are consolidated in gameUtils.ts
 */

// Re-export game utilities for backward compatibility
export { calculateWPM, calculateKPM, calculateAccuracy, calculateZenScore } from './gameUtils';

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
