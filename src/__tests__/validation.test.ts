import { GameResultFlexibleSchema } from '@/lib/validation/game';

describe('GameResultFlexibleSchema Validation', () => {
  test('validates correct payload', () => {
    const validPayload = {
      wpm: 100,
      accuracy: 95,
      keystrokes: 500,
      elapsedTime: 30000,
    };

    const result = GameResultFlexibleSchema.safeParse(validPayload);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.wpm).toBe(100);
      expect(result.data.accuracy).toBe(95);
      expect(result.data.keystrokes).toBe(500);
    }
  });

  test('validates with legacy field names', () => {
    const legacyPayload = {
      wordsPerMinute: 100,
      accuracy: 95,
      totalCharacters: 500,
      totalTime: 30000,
    };

    const result = GameResultFlexibleSchema.safeParse(legacyPayload);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.wpm).toBe(100);
      expect(result.data.accuracy).toBe(95);
      expect(result.data.keystrokes).toBe(500);
    }
  });

  test('rejects invalid accuracy', () => {
    const invalidPayload = {
      wpm: 100,
      accuracy: 150, // > 100
      keystrokes: 500,
      elapsedTime: 30000,
    };

    const result = GameResultFlexibleSchema.safeParse(invalidPayload);
    expect(result.success).toBe(false);
  });

  test('rejects missing required fields', () => {
    const incompletePayload = {
      wpm: 100,
      // missing accuracy, keystrokes, elapsedTime
    };

    const result = GameResultFlexibleSchema.safeParse(incompletePayload);
    expect(result.success).toBe(false);
  });

  test('rejects correctKeystrokes > keystrokes', () => {
    const invalidPayload = {
      wpm: 100,
      accuracy: 95,
      keystrokes: 500,
      correctKeystrokes: 600, // > keystrokes
      elapsedTime: 30000,
    };

    const result = GameResultFlexibleSchema.safeParse(invalidPayload);
    expect(result.success).toBe(false);
  });
});
