import { checkRomaji, isValidPrefix, KANA_MAP, MatchResult } from '../lib/romaji';

describe('romaji.ts core mapping and matching', () => {
  describe('ん (n) handling', () => {
    test('accepts nn and xn for ん', () => {
      const r1 = checkRomaji('ん', 'nn') as MatchResult;
      expect(r1).toEqual({
        isMatch: true,
        consumedInput: 'nn',
        consumedTarget: 'ん',
        remainingTarget: '',
      });

      const r2 = checkRomaji('ん', 'xn') as MatchResult;
      expect(r2).toEqual({
        isMatch: true,
        consumedInput: 'xn',
        consumedTarget: 'ん',
        remainingTarget: '',
      });
    });

    test('single n at end is accepted', () => {
      const r = checkRomaji('ん', 'n') as MatchResult;
      expect(r).toEqual({
        isMatch: true,
        consumedInput: 'n',
        consumedTarget: 'ん',
        remainingTarget: '',
      });
    });

    test('single n pending when not last', () => {
      const r = checkRomaji('んあ', 'n');
      expect(r).toBeNull();
    });

    test('n before consonant consumes ん immediately', () => {
      const r = checkRomaji('んか', 'nk') as MatchResult;
      expect(r.isMatch).toBe(true);
      expect(r.consumedInput).toBe('n');
      expect(r.consumedTarget).toBe('ん');
      expect(r.remainingTarget).toBe('か');
    });

    test('n before vowel does not match ん (delegates to next kana)', () => {
      const r = checkRomaji('んあ', 'na');
      expect(r).toBeNull();
      expect(isValidPrefix('んあ', 'na')).toBe(false);
    });
  });

  describe('促音 (っ) handling', () => {
    test('direct input of small tsu (xtu/ltu/ltsu)', () => {
      for (const opt of ['xtu', 'ltu', 'ltsu']) {
        const r = checkRomaji('っか', opt) as MatchResult;
        expect(r).toEqual({
          isMatch: true,
          consumedInput: opt,
          consumedTarget: 'っ',
          remainingTarget: 'か',
        });
      }
    });

    test('double consonant consumption (e.g., k for っ before か)', () => {
      const r = checkRomaji('っか', 'k') as MatchResult;
      expect(r.isMatch).toBe(true);
      expect(r.consumedInput).toBe('k');
      expect(r.consumedTarget).toBe('っ');
      expect(r.remainingTarget).toBe('か');
    });

    test('tte -> って (consume first t as っ)', () => {
      const r = checkRomaji('って', 't') as MatchResult;
      expect(r.isMatch).toBe(true);
      expect(r.consumedTarget).toBe('っ');
      expect(r.remainingTarget).toBe('て');
    });
  });

  describe('variant spellings', () => {
    test('shi/si/ci -> し', () => {
      for (const romaji of ['shi', 'si', 'ci']) {
        const r = checkRomaji('し', romaji) as MatchResult;
        expect(r.isMatch).toBe(true);
        expect(r.consumedInput).toBe(romaji);
        expect(r.consumedTarget).toBe('し');
        expect(r.remainingTarget).toBe('');
      }
    });

    test('chi/ti -> ち', () => {
      for (const romaji of ['chi', 'ti']) {
        const r = checkRomaji('ち', romaji) as MatchResult;
        expect(r?.isMatch).toBe(true);
      }
    });

    test('tsu/tu -> つ', () => {
      for (const romaji of ['tsu', 'tu']) {
        const r = checkRomaji('つ', romaji) as MatchResult;
        expect(r?.isMatch).toBe(true);
      }
    });

    test('fu/hu -> ふ', () => {
      for (const romaji of ['fu', 'hu']) {
        const r = checkRomaji('ふ', romaji) as MatchResult;
        expect(r?.isMatch).toBe(true);
      }
    });

    test('ka/ca -> か', () => {
      for (const romaji of ['ka', 'ca']) {
        expect(checkRomaji('か', romaji)?.isMatch).toBe(true);
      }
    });

    test('ku/cu/qu -> く', () => {
      for (const romaji of ['ku', 'cu', 'qu']) {
        expect(checkRomaji('く', romaji)?.isMatch).toBe(true);
      }
    });

    test('se/ce -> せ', () => {
      for (const romaji of ['se', 'ce']) {
        expect(checkRomaji('せ', romaji)?.isMatch).toBe(true);
      }
    });
  });

  describe('拗音・濁音・F/V系列', () => {
    test('しゃ (sha/sya)', () => {
      expect(checkRomaji('しゃ', 'sha')?.isMatch).toBe(true);
      expect(checkRomaji('しゃ', 'sya')?.isMatch).toBe(true);
    });

    test('F-series fa/fi/fe/fo -> ふぁ/ふぃ/ふぇ/ふぉ', () => {
      expect(checkRomaji('ふぁ', 'fa')?.isMatch).toBe(true);
      expect(checkRomaji('ふぃ', 'fi')?.isMatch).toBe(true);
      expect(checkRomaji('ふぇ', 'fe')?.isMatch).toBe(true);
      expect(checkRomaji('ふぉ', 'fo')?.isMatch).toBe(true);
    });

    test('ヴ系列 vu/va/vi/ve/vo', () => {
      expect(checkRomaji('ゔ', 'vu')?.isMatch).toBe(true);
      expect(checkRomaji('ゔぁ', 'va')?.isMatch).toBe(true);
      expect(checkRomaji('ゔぃ', 'vi')?.isMatch).toBe(true);
      expect(checkRomaji('ゔぇ', 've')?.isMatch).toBe(true);
      expect(checkRomaji('ゔぉ', 'vo')?.isMatch).toBe(true);
    });
  });

  describe('isValidPrefix invariants', () => {
    test('valid prefixes for く (k/c/q variants)', () => {
      expect(isValidPrefix('く', 'k')).toBe(true);
      expect(isValidPrefix('く', 'c')).toBe(true);
      expect(isValidPrefix('く', 'q')).toBe(true);
      expect(isValidPrefix('く', 'ku')).toBe(true);
      expect(isValidPrefix('く', 'cu')).toBe(true);
      expect(isValidPrefix('く', 'qu')).toBe(true);
      expect(isValidPrefix('く', 'x')).toBe(false);
    });

    test('valid prefixes for ん', () => {
      expect(isValidPrefix('ん', 'n')).toBe(true);
      expect(isValidPrefix('ん', 'nn')).toBe(true);
      expect(isValidPrefix('ん', 'xn')).toBe(true);
      expect(isValidPrefix('ん', 'na')).toBe(false);
    });
  });

  describe('match result consistency', () => {
    test('consumed/remaining coherence', () => {
      const input = 'kaku';
      const target = 'かく';
      const r1 = checkRomaji(target, input) as MatchResult;
      expect(r1.isMatch).toBe(true);
      expect(input.startsWith(r1.consumedInput)).toBe(true);
      expect(target.startsWith(r1.consumedTarget)).toBe(true);
      const r2 = checkRomaji(
        r1.remainingTarget,
        input.slice(r1.consumedInput.length)
      ) as MatchResult;
      expect(r2.isMatch).toBe(true);
      expect(r1.consumedTarget + r2.consumedTarget).toBe(target);
    });
  });

  test('KANA_MAP basic expectations present', () => {
    expect(KANA_MAP['し']).toEqual(expect.arrayContaining(['shi', 'si', 'ci']));
    expect(KANA_MAP['く']).toEqual(expect.arrayContaining(['ku', 'cu', 'qu']));
    expect(KANA_MAP['ゔ']).toEqual(expect.arrayContaining(['vu']));
  });
});
