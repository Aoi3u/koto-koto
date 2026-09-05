import { GameResultFlexibleSchema } from '@/lib/validation/game';

describe('GameResultFlexibleSchema Validation', () => {
  // elapsedTime is in milliseconds; 30000ms (30s = 0.5min) at wpm=100 implies
  // 100 * 5 * 0.5 = 250 correct keystrokes, so fixtures below use that basis
  // to stay consistent with the wpm/keystrokes/elapsedTime plausibility check.
  test('validates correct payload', () => {
    const validPayload = {
      wpm: 100,
      accuracy: 95,
      keystrokes: 250,
      elapsedTime: 30000,
    };

    const result = GameResultFlexibleSchema.safeParse(validPayload);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.wpm).toBe(100);
      expect(result.data.accuracy).toBe(95);
      expect(result.data.keystrokes).toBe(250);
    }
  });

  test('validates with legacy field names', () => {
    const legacyPayload = {
      wordsPerMinute: 100,
      accuracy: 95,
      totalCharacters: 250,
      totalTime: 30000,
    };

    const result = GameResultFlexibleSchema.safeParse(legacyPayload);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.wpm).toBe(100);
      expect(result.data.accuracy).toBe(95);
      expect(result.data.keystrokes).toBe(250);
    }
  });

  test('rejects invalid accuracy', () => {
    const invalidPayload = {
      wpm: 100,
      accuracy: 150, // > 100
      keystrokes: 250,
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

  describe('plausibility checks', () => {
    test('rejects wpm decoupled from keystrokes/elapsedTime', () => {
      // 250 keystrokes in 30s implies ~100 wpm, not 900.
      const result = GameResultFlexibleSchema.safeParse({
        wpm: 900,
        accuracy: 100,
        keystrokes: 250,
        elapsedTime: 30000,
      });
      expect(result.success).toBe(false);
    });

    test('rejects a huge keystroke count crammed into almost no time', () => {
      // 100,000 keystrokes in 1s is far beyond human typing speed, even
      // though wpm/keystrokes/elapsedTime are internally "consistent".
      const result = GameResultFlexibleSchema.safeParse({
        wpm: 1_200_000,
        accuracy: 100,
        keystrokes: 100_000,
        elapsedTime: 1000,
      });
      expect(result.success).toBe(false);
    });

    test('rejects a positive wpm with zero elapsed time', () => {
      const result = GameResultFlexibleSchema.safeParse({
        wpm: 100,
        accuracy: 100,
        keystrokes: 250,
        elapsedTime: 0,
      });
      expect(result.success).toBe(false);
    });

    test('rejects wpm above the plausible human ceiling even if "consistent"', () => {
      // 5,000 keystrokes in 60s implies wpm = 5000/5/1 = 1000, above the cap.
      const result = GameResultFlexibleSchema.safeParse({
        wpm: 1000,
        accuracy: 100,
        keystrokes: 5000,
        elapsedTime: 60000,
      });
      expect(result.success).toBe(false);
    });

    test('accepts a realistic result near a genuinely fast typist', () => {
      // 1500 keystrokes in 60s => wpm = 1500/5/1 = 300 (fast but plausible),
      // kpm = 1500 (right at the plausibility cap).
      const result = GameResultFlexibleSchema.safeParse({
        wpm: 300,
        accuracy: 100,
        keystrokes: 1500,
        correctKeystrokes: 1500,
        elapsedTime: 60000,
      });
      expect(result.success).toBe(true);
    });

    test('allows small rounding differences between reported and expected wpm', () => {
      // 250 keystrokes / 30s => expected wpm 100; report 102, within tolerance.
      const result = GameResultFlexibleSchema.safeParse({
        wpm: 102,
        accuracy: 100,
        keystrokes: 250,
        elapsedTime: 30000,
      });
      expect(result.success).toBe(true);
    });
  });
});
