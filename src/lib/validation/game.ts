/**
 * Validation schemas for game API requests and responses
 */

import { z } from 'zod';
import { calculateWPM, calculateKPM } from '@/lib/gameUtils';

// Generous upper bounds on human typing speed, used to reject physically
// implausible submissions (e.g. spoofed or decoupled wpm/keystrokes/time).
// World-record English typing tops out around ~216 WPM sustained; kana input
// can run faster per "word" due to shorter romaji sequences, so these caps
// are set well above any legitimate result.
const MAX_PLAUSIBLE_WPM = 400;
const MAX_PLAUSIBLE_KPM = 1500; // 25 keystrokes/sec

/**
 * Rejects game results whose fields are internally inconsistent or exceed
 * plausible human typing speed, to keep the leaderboard resistant to direct
 * API submissions that skip the actual gameplay.
 */
function checkPlausibility(
  data: {
    wpm: number;
    keystrokes: number;
    correctKeystrokes?: number;
    elapsedTime: number;
  },
  ctx: z.RefinementCtx
) {
  const { wpm, keystrokes, correctKeystrokes, elapsedTime } = data;

  if (elapsedTime <= 0 && (keystrokes > 0 || wpm > 0)) {
    ctx.addIssue({
      code: 'custom',
      message: 'elapsedTime must be positive when keystrokes were recorded',
    });
    return;
  }

  const minutes = elapsedTime / 1000 / 60;
  if (minutes <= 0) return;

  if (calculateKPM(keystrokes, minutes) > MAX_PLAUSIBLE_KPM) {
    ctx.addIssue({
      code: 'custom',
      message: 'Keystroke rate exceeds plausible human typing speed',
    });
  }

  if (wpm > MAX_PLAUSIBLE_WPM) {
    ctx.addIssue({ code: 'custom', message: 'WPM exceeds plausible human typing speed' });
  }

  const expectedWpm = calculateWPM(correctKeystrokes ?? keystrokes, minutes);
  const tolerance = Math.max(3, expectedWpm * 0.05);
  if (Math.abs(wpm - expectedWpm) > tolerance) {
    ctx.addIssue({
      code: 'custom',
      message: 'Reported WPM is inconsistent with keystrokes and elapsed time',
    });
  }
}

/**
 * Schema for game result submission
 */
export const GameResultPayloadSchema = z
  .object({
    wpm: z.number().nonnegative('WPM must be non-negative'),
    accuracy: z.number().min(0).max(100, 'Accuracy must be between 0 and 100'),
    keystrokes: z.number().nonnegative('Keystrokes must be non-negative'),
    correctKeystrokes: z.number().nonnegative('Correct keystrokes must be non-negative').optional(),
    elapsedTime: z.number().nonnegative('Elapsed time must be non-negative'),
    difficulty: z.string().default('normal'),
  })
  .superRefine(checkPlausibility);

/**
 * Schema for flexible input (supports legacy field names)
 */
export const GameResultFlexibleSchema = z
  .object({
    wpm: z.number().nonnegative().optional(),
    wordsPerMinute: z.number().nonnegative().optional(),
    accuracy: z.number().min(0).max(100).optional(),
    keystrokes: z.number().nonnegative().optional(),
    totalCharacters: z.number().nonnegative().optional(),
    correctKeystrokes: z.number().nonnegative().optional(),
    correctCharacters: z.number().nonnegative().optional(),
    elapsedTime: z.number().nonnegative().optional(),
    totalTime: z.number().nonnegative().optional(),
    difficulty: z.string().optional(),
  })
  .transform((data) => ({
    wpm: data.wpm ?? data.wordsPerMinute,
    accuracy: data.accuracy,
    keystrokes: data.keystrokes ?? data.totalCharacters,
    correctKeystrokes: data.correctKeystrokes ?? data.correctCharacters,
    elapsedTime: data.elapsedTime ?? data.totalTime,
    difficulty: data.difficulty ?? 'normal',
  }))
  .refine(
    (data) =>
      data.wpm !== undefined && data.accuracy !== undefined && data.elapsedTime !== undefined,
    'Missing required fields: wpm, accuracy, elapsedTime'
  )
  .refine(
    (data) => data.keystrokes !== undefined,
    'Missing required field: keystrokes (or totalCharacters)'
  )
  .refine((data) => {
    if (data.correctKeystrokes !== undefined && data.keystrokes !== undefined) {
      return data.correctKeystrokes <= data.keystrokes;
    }
    return true;
  }, 'Correct keystrokes cannot exceed total keystrokes')
  .transform((data) => ({
    wpm: data.wpm!,
    accuracy: data.accuracy!,
    keystrokes: data.keystrokes!,
    correctKeystrokes: data.correctKeystrokes,
    elapsedTime: data.elapsedTime!,
    difficulty: data.difficulty,
  }))
  .superRefine(checkPlausibility);

export type GameResultPayload = z.infer<typeof GameResultPayloadSchema>;
