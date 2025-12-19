import {
  KANA_MAP,
  MatchResult,
  getNextChars,
  isValidPrefix as trieIsValidPrefix,
  match,
} from './romaji-trie';

export { KANA_MAP, getNextChars };
export type { MatchResult };

export function checkRomaji(targetKana: string, input: string): MatchResult | null {
  return match(targetKana, input);
}

export function isValidPrefix(targetKana: string, input: string): boolean {
  return trieIsValidPrefix(targetKana, input);
}
