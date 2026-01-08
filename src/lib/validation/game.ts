/**
 * Validation schemas for game API requests and responses
 */

import { z } from 'zod';

/**
 * Schema for game result submission
 */
export const GameResultPayloadSchema = z.object({
  wpm: z.number().nonnegative('WPM must be non-negative'),
  accuracy: z.number().min(0).max(100, 'Accuracy must be between 0 and 100'),
  keystrokes: z.number().nonnegative('Keystrokes must be non-negative'),
  correctKeystrokes: z.number().nonnegative('Correct keystrokes must be non-negative').optional(),
  elapsedTime: z.number().nonnegative('Elapsed time must be non-negative'),
  difficulty: z.string().default('normal'),
});

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
  }));

export type GameResultPayload = z.infer<typeof GameResultPayloadSchema>;
