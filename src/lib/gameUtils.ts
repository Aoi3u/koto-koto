/**
 * Game-specific utility functions
 * Consolidated calculations for WPM, accuracy, and scoring
 */

/**
 * Calculates WPM (Words Per Minute)
 * Standard: 1 word = 5 characters
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

/**
 * Calculates Zen Score (balanced score of WPM and Accuracy)
 * Formula: (WPM × Accuracy) ÷ 100
 * This prioritizes both speed and precision
 */
export function calculateZenScore(wpm: number, accuracy: number): number {
  const zenScore = wpm * (accuracy / 100);
  return Math.round(zenScore * 100) / 100;
}

/**
 * Validates game result data
 */
export function validateGameResult(wpm: number, accuracy: number, keystrokes: number): boolean {
  return wpm >= 0 && accuracy >= 0 && accuracy <= 100 && keystrokes >= 0;
}
