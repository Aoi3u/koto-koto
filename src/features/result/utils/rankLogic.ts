import { RANK_THRESHOLDS } from '../../../config/gameConfig';
import { THEME } from '../../../config/theme';
import { calculateZenScore } from '../../../lib/gameUtils';
import type { RankResult } from '@/types/game';

type RankKey = keyof typeof RANK_THRESHOLDS;

// Thresholds sorted highest-score-first so the first match is the correct rank.
const SORTED_RANK_KEYS = (Object.keys(RANK_THRESHOLDS) as RankKey[]).sort(
  (a, b) => RANK_THRESHOLDS[b].score - RANK_THRESHOLDS[a].score
);

const ACCURACY_GATE = {
  grade: 'D',
  title: 'Pebble (小石)',
} as const;

export const calculateRank = (wpm: number, acc: number): RankResult => {
  // Formula: ZenScore = WPM * (Accuracy / 100)
  const zenScore = calculateZenScore(wpm, acc);

  // Safety Net: high grades (S and above) require Accuracy >= 80%.
  if (acc < 80) {
    return {
      ...ACCURACY_GATE,
      color: THEME.rankColors.D,
      score: zenScore,
    };
  }

  const key = SORTED_RANK_KEYS.find((k) => zenScore >= RANK_THRESHOLDS[k].score) ?? 'D';
  const threshold = RANK_THRESHOLDS[key];

  return {
    grade: threshold.grade,
    title: threshold.title,
    color: THEME.rankColors[key],
    score: zenScore,
  };
};
