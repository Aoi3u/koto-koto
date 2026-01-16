import { calculateRank } from '../features/result/utils/rankLogic';
import { RANK_THRESHOLDS } from '../config/gameConfig';
import { THEME } from '../config/theme';

describe('rankLogic', () => {
  test('accuracy gate: acc < 80 forces D', () => {
    const r = calculateRank(200, 79);
    expect(r.grade).toBe('D');
    expect(r.title).toBe('Pebble (小石)');
    expect(r.color).toBe(THEME.rankColors.D);
  });

  test('exact threshold yields correct S ranks', () => {
    const s = calculateRank(RANK_THRESHOLDS.S.score, 100);
    expect(s.grade).toBe('S');
    expect(s.color).toBe(THEME.rankColors.S);

    const sp = calculateRank(RANK_THRESHOLDS.S_PLUS.score, 100);
    expect(sp.grade).toBe('S+');
    expect(sp.color).toBe(THEME.rankColors.S_PLUS);

    const ss = calculateRank(RANK_THRESHOLDS.SS.score, 100);
    expect(ss.grade).toBe('SS');
    expect(ss.color).toBe(THEME.rankColors.SS);

    const sss = calculateRank(RANK_THRESHOLDS.SSS.score, 100);
    expect(sss.grade).toBe('SSS');
    expect(sss.color).toBe(THEME.rankColors.SSS);
  });

  test('boundary just below moves to lower rank', () => {
    const belowS = calculateRank(RANK_THRESHOLDS.S.score - 1, 100);
    expect(belowS.grade).toBe('S-');
    expect(belowS.color).toBe(THEME.rankColors.S_MINUS);
  });

  test('zenScore stored in result', () => {
    const r = calculateRank(50, 90); // 45
    expect(Math.round(r.score)).toBe(45);
  });
});
