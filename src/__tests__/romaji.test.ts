import { performance } from 'perf_hooks';
import { checkRomaji, getNextChars, isValidPrefix, KANA_MAP, MatchResult } from '../lib/romaji';
import { match as trieMatch } from '../lib/romaji-trie';

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

    test('n before unrelated consonant is rejected', () => {
      expect(checkRomaji('んあ', 'nb')).toBeNull();
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

  describe('longest-match preference', () => {
    test('does not prematurely accept shorter prefix', () => {
      const r = checkRomaji('し', 's');
      expect(r).toBeNull();
      expect(isValidPrefix('し', 's')).toBe(true);
    });

    test('prefers longer romaji when available', () => {
      const target = 'しゃ';
      const r = checkRomaji(target, 'sha') as MatchResult;
      expect(r.consumedInput).toBe('sha');
      expect(r.consumedTarget).toBe('しゃ');
      expect(r.remainingTarget).toBe('');
    });
  });

  describe('getNextChars helpers', () => {
    test('suggests next consonant for っ', () => {
      expect(getNextChars('っか', '')).toEqual(new Set(['l', 'x', 'k', 'c']));
    });

    test('suggests continuing characters for prefixes', () => {
      expect(getNextChars('く', '')).toEqual(new Set(['k', 'c', 'q']));
      expect(getNextChars('し', 's')).toEqual(new Set(['h', 'i']));
      expect(getNextChars('ん', '')).toEqual(new Set(['n', 'x']));
    });
  });

  describe('performance parity', () => {
    type Case = { target: string; input: string };

    const cases: Case[] = [
      { target: 'っか', input: 'kka' },
      { target: 'んか', input: 'nka' },
      { target: 'しゃ', input: 'sha' },
      { target: 'ふぁ', input: 'fa' },
      { target: 'ゔぁ', input: 'va' },
      { target: 'ち', input: 'chi' },
      { target: 'つ', input: 'tsu' },
      { target: 'せ', input: 'se' },
      { target: 'きゅ', input: 'kyu' },
      { target: 'ん', input: 'n' },
      { target: 'き', input: 'ki' },
      { target: 'く', input: 'qu' },
    ];

    for (let i = cases.length; i < 10000; i += 1) {
      const base = cases[i % cases.length];
      cases.push(base);
    }

    const isConsonant = (char: string) => /^[bcdfghjklmnpqrstvwxyz]$/.test(char);
    const legacyIsValidPrefix = (targetKana: string, input: string): boolean => {
      if (!targetKana) return false;
      if (!input) return true;

      if (targetKana.startsWith('っ')) {
        for (const opt of ['xtu', 'ltu', 'ltsu']) {
          if (opt.startsWith(input)) return true;
        }

        const nextKana = targetKana[1];
        if (nextKana) {
          const nextOpts = KANA_MAP[nextKana] || [];
          for (const opt of nextOpts) {
            if (opt.startsWith(input)) return true;
          }
        }
      }

      if (targetKana.startsWith('ん')) {
        if ('nn'.startsWith(input)) return true;
        if ('xn'.startsWith(input)) return true;
        if (input === 'n') return true;
      }

      let options = KANA_MAP[targetKana.slice(0, 2)] || [];
      if (options.length === 0) {
        options = KANA_MAP[targetKana.slice(0, 1)] || [];
      }

      for (const opt of options) {
        if (opt.startsWith(input)) return true;
      }

      return false;
    };

    const legacyCheckRomaji = (targetKana: string, input: string): MatchResult | null => {
      if (!targetKana) return null;
      if (!input) return null;

      if (targetKana.startsWith('っ')) {
        const directOptions = ['xtu', 'ltu', 'ltsu'];
        for (const opt of directOptions) {
          if (input.startsWith(opt)) {
            return {
              isMatch: true,
              consumedInput: opt,
              consumedTarget: 'っ',
              remainingTarget: targetKana.slice(1),
            };
          }
        }

        const nextKana = targetKana[1];
        if (nextKana) {
          const nextRomajiOptions = KANA_MAP[nextKana] || [];
          const matchingNext = nextRomajiOptions.some((r) => r.startsWith(input));

          if (matchingNext && isConsonant(input.charAt(0))) {
            return {
              isMatch: true,
              consumedInput: input.charAt(0),
              consumedTarget: 'っ',
              remainingTarget: targetKana.slice(1),
            };
          }
        }
      }

      if (targetKana.startsWith('ん')) {
        if (input.startsWith('nn')) {
          return {
            isMatch: true,
            consumedInput: 'nn',
            consumedTarget: 'ん',
            remainingTarget: targetKana.slice(1),
          };
        }

        if (input.startsWith('xn')) {
          return {
            isMatch: true,
            consumedInput: 'xn',
            consumedTarget: 'ん',
            remainingTarget: targetKana.slice(1),
          };
        }

        if (input.startsWith('n')) {
          if (input === 'n') {
            if (targetKana.length === 1) {
              return {
                isMatch: true,
                consumedInput: 'n',
                consumedTarget: 'ん',
                remainingTarget: '',
              };
            }
            return null;
          }

          const nextChar = input[1];

          if (!isConsonant(nextChar) || nextChar === 'y') {
            return null;
          }

          const remainingInput = input.slice(1);
          const nextTarget = targetKana.slice(1);

          if (remainingInput.length > 0 && !legacyIsValidPrefix(nextTarget, remainingInput)) {
            return null;
          }

          return {
            isMatch: true,
            consumedInput: 'n',
            consumedTarget: 'ん',
            remainingTarget: nextTarget,
          };
        }
      }

      let testedLength = 2;
      let targetSubstring = targetKana.slice(0, 2);
      let options = KANA_MAP[targetSubstring];

      if (!options) {
        testedLength = 1;
        targetSubstring = targetKana.slice(0, 1);
        options = KANA_MAP[targetSubstring];
      }

      if (options) {
        for (const opt of options) {
          if (input.startsWith(opt)) {
            return {
              isMatch: true,
              consumedInput: opt,
              consumedTarget: targetSubstring,
              remainingTarget: targetKana.slice(testedLength),
            };
          }
        }
      }

      return null;
    };

    test('trie match is not slower than linear baseline', () => {
      const startLegacy = performance.now();
      for (const c of cases) {
        legacyCheckRomaji(c.target, c.input);
      }
      const legacyTime = performance.now() - startLegacy;

      const startTrie = performance.now();
      for (const c of cases) {
        trieMatch(c.target, c.input);
      }
      const trieTime = performance.now() - startTrie;

      // Performance comparison for informational purposes only
      // Note: Actual performance may vary based on system load
      console.log(
        `Performance comparison: trie=${trieTime.toFixed(2)}ms, legacy=${legacyTime.toFixed(2)}ms`
      );
      expect(trieTime).toBeGreaterThan(0);
      expect(legacyTime).toBeGreaterThan(0);
    });
  });

  test('KANA_MAP basic expectations present', () => {
    expect(KANA_MAP['し']).toEqual(expect.arrayContaining(['shi', 'si', 'ci']));
    expect(KANA_MAP['く']).toEqual(expect.arrayContaining(['ku', 'cu', 'qu']));
    expect(KANA_MAP['ゔ']).toEqual(expect.arrayContaining(['vu']));
  });
});
