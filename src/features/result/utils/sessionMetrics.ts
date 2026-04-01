import {
  formatTimeWithMillis,
  calculateWPM,
  calculateKPM,
  calculateAccuracy,
} from '../../../lib/formatters';

export type SessionMetrics = {
  totalKeystrokes: number;
  minutes: number;
  netWpm: number;
  kpm: number;
  accuracy: number;
  timeStr: string;
};

export function buildSessionMetrics(
  correctKeyCount: number,
  errorCount: number,
  durationSeconds: number
): SessionMetrics {
  const totalKeystrokes = correctKeyCount + errorCount;
  const minutes = durationSeconds / 60;
  const netWpm = calculateWPM(correctKeyCount, minutes);
  const kpm = calculateKPM(correctKeyCount, minutes);
  const accuracy = calculateAccuracy(correctKeyCount, totalKeystrokes);
  const timeStr = formatTimeWithMillis(durationSeconds);

  return {
    totalKeystrokes,
    minutes,
    netWpm,
    kpm,
    accuracy,
    timeStr,
  };
}
