import { RANK_THRESHOLDS } from '../../../config/gameConfig';
import { THEME } from '../../../config/theme';

export interface RankResult {
  grade: string;
  title: string;
  color: string;
  score: number;
}

export const calculateRank = (wpm: number, acc: number): RankResult => {
  // 1. Formula: ZenScore = WPM * (Accuracy / 100)
  const zenScore = wpm * (acc / 100);

  // 2. Safety Net: If accuracy is too low, force low rank.
  if (acc < 80)
    return {
      grade: 'D',
      title: 'Pebble (小石)',
      color: THEME.rankColors.D,
      score: zenScore,
    };

  // 3. Thresholds (High Density Ladder)
  if (zenScore >= RANK_THRESHOLDS.SSS.score)
    return {
      ...RANK_THRESHOLDS.SSS,
      color: THEME.rankColors.SSS,
      score: zenScore,
    };

  if (zenScore >= RANK_THRESHOLDS.SS_PLUS.score)
    return {
      ...RANK_THRESHOLDS.SS_PLUS,
      color: THEME.rankColors.SS_PLUS,
      score: zenScore,
    };

  if (zenScore >= RANK_THRESHOLDS.SS.score)
    return {
      ...RANK_THRESHOLDS.SS,
      color: THEME.rankColors.SS,
      score: zenScore,
    };

  if (zenScore >= RANK_THRESHOLDS.SS_MINUS.score)
    return {
      ...RANK_THRESHOLDS.SS_MINUS,
      color: THEME.rankColors.SS_MINUS,
      score: zenScore,
    };

  if (zenScore >= RANK_THRESHOLDS.S_PLUS.score)
    return {
      ...RANK_THRESHOLDS.S_PLUS,
      color: THEME.rankColors.S_PLUS,
      score: zenScore,
    };

  if (zenScore >= RANK_THRESHOLDS.S.score)
    return { ...RANK_THRESHOLDS.S, color: THEME.rankColors.S, score: zenScore };

  if (zenScore >= RANK_THRESHOLDS.S_MINUS.score)
    return {
      ...RANK_THRESHOLDS.S_MINUS,
      color: THEME.rankColors.S_MINUS,
      score: zenScore,
    };

  if (zenScore >= RANK_THRESHOLDS.A_PLUS.score)
    return {
      ...RANK_THRESHOLDS.A_PLUS,
      color: THEME.rankColors.A_PLUS,
      score: zenScore,
    };

  if (zenScore >= RANK_THRESHOLDS.A.score)
    return { ...RANK_THRESHOLDS.A, color: THEME.rankColors.A, score: zenScore };

  if (zenScore >= RANK_THRESHOLDS.A_MINUS.score)
    return {
      ...RANK_THRESHOLDS.A_MINUS,
      color: THEME.rankColors.A_MINUS,
      score: zenScore,
    };

  if (zenScore >= RANK_THRESHOLDS.B_PLUS.score)
    return {
      ...RANK_THRESHOLDS.B_PLUS,
      color: THEME.rankColors.B_PLUS,
      score: zenScore,
    };

  if (zenScore >= RANK_THRESHOLDS.B.score)
    return { ...RANK_THRESHOLDS.B, color: THEME.rankColors.B, score: zenScore };

  if (zenScore >= RANK_THRESHOLDS.B_MINUS.score)
    return {
      ...RANK_THRESHOLDS.B_MINUS,
      color: THEME.rankColors.B_MINUS,
      score: zenScore,
    };

  if (zenScore >= RANK_THRESHOLDS.C_PLUS.score)
    return {
      ...RANK_THRESHOLDS.C_PLUS,
      color: THEME.rankColors.C_PLUS,
      score: zenScore,
    };

  if (zenScore >= RANK_THRESHOLDS.C.score)
    return { ...RANK_THRESHOLDS.C, color: THEME.rankColors.C, score: zenScore };

  if (zenScore >= RANK_THRESHOLDS.C_MINUS.score)
    return {
      ...RANK_THRESHOLDS.C_MINUS,
      color: THEME.rankColors.C_MINUS,
      score: zenScore,
    };

  return { ...RANK_THRESHOLDS.D, color: THEME.rankColors.D, score: zenScore };
};
