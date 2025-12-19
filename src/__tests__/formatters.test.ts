import {
  pad,
  formatTime,
  formatTimeWithMillis,
  calculateWPM,
  calculateKPM,
  calculateAccuracy,
} from '../lib/formatters';

describe('formatters.ts', () => {
  test('pad works', () => {
    expect(pad(3)).toBe('03');
    expect(pad(12)).toBe('12');
    expect(pad(5, 3)).toBe('005');
  });

  test('formatTime MM:SS rounding down seconds', () => {
    expect(formatTime(0)).toBe('00:00');
    expect(formatTime(59.9)).toBe('00:59');
    expect(formatTime(60)).toBe('01:00');
    expect(formatTime(65)).toBe('01:05');
  });

  test('formatTimeWithMillis MM:SS.ms (minutes not padded by design)', () => {
    expect(formatTimeWithMillis(0)).toBe('0:00.00');
    expect(formatTimeWithMillis(65.12)).toBe('1:05.12');
    expect(formatTimeWithMillis(600.999)).toBe('10:00.99');
  });

  test('calculateWPM rounds and guards zero minutes', () => {
    expect(calculateWPM(0, 1)).toBe(0);
    expect(calculateWPM(12, 1)).toBe(2); // 12/5=2.4 -> 2
    expect(calculateWPM(13, 1)).toBe(3); // 13/5=2.6 -> 3
    expect(calculateWPM(25, 1)).toBe(5);
    expect(calculateWPM(25, 0)).toBe(0);
  });

  test('calculateKPM rounds and guards zero minutes', () => {
    expect(calculateKPM(0, 1)).toBe(0);
    expect(calculateKPM(12, 1)).toBe(12);
    expect(calculateKPM(12, 0)).toBe(0);
  });

  test('calculateAccuracy rounds and guards zero total', () => {
    expect(calculateAccuracy(0, 0)).toBe(0);
    expect(calculateAccuracy(5, 10)).toBe(50);
    expect(calculateAccuracy(3, 7)).toBe(43); // 42.857 -> 43
  });
});
