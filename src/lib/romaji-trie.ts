import { KANA_MAP, SMALL_TSU_OPTIONS, TARGET_PREFIX_LENGTHS } from './constants/kana-map';

export type MatchResult = {
  isMatch: boolean;
  consumedInput: string;
  consumedTarget: string;
  remainingTarget: string;
};

export type TrieNode = {
  children: Map<string, TrieNode>;
  isTerminal: boolean;
  terminalKanas: Set<string>;
  reachableKanas: Set<string>;
  longestMatchLength: number;
};

// Re-export for backward compatibility
export { KANA_MAP };

const isConsonant = (char: string) => /^[bcdfghjklmnpqrstvwxyz]$/.test(char);

function createNode(): TrieNode {
  return {
    children: new Map(),
    isTerminal: false,
    terminalKanas: new Set(),
    reachableKanas: new Set(),
    longestMatchLength: 0,
  };
}

function buildTrie(map: Record<string, string[]>): TrieNode {
  const root = createNode();

  for (const [kana, romajiList] of Object.entries(map)) {
    for (const romaji of romajiList) {
      let node = root;
      node.longestMatchLength = Math.max(node.longestMatchLength, romaji.length);
      node.reachableKanas.add(kana);

      for (let i = 0; i < romaji.length; i += 1) {
        const ch = romaji[i];
        let child = node.children.get(ch);

        if (!child) {
          child = createNode();
          node.children.set(ch, child);
        }

        child.longestMatchLength = Math.max(child.longestMatchLength, romaji.length);
        child.reachableKanas.add(kana);
        node = child;
      }

      node.isTerminal = true;
      node.terminalKanas.add(kana);
    }
  }

  return root;
}

const TRIE_ROOT = buildTrie(KANA_MAP);

function extractLeadingKanas(target: string): string[] {
  const candidates: string[] = [];

  for (const len of TARGET_PREFIX_LENGTHS) {
    const slice = target.slice(0, len);
    if (KANA_MAP[slice]) {
      candidates.push(slice);
    }
  }

  return candidates;
}

function findLongestMatchLengthForKana(input: string, targetKana: string): number {
  let node = TRIE_ROOT;
  let best = 0;

  for (let i = 0; i < input.length; i += 1) {
    const ch = input[i];
    const next = node.children.get(ch);
    if (!next) break;

    node = next;
    if (node.isTerminal && node.terminalKanas.has(targetKana)) {
      best = i + 1;
    }
  }

  return best;
}

function isPrefixValidForKana(input: string, targetKana: string): boolean {
  let node = TRIE_ROOT;

  for (let i = 0; i < input.length; i += 1) {
    const ch = input[i];
    const next = node.children.get(ch);
    if (!next) return false;
    node = next;
  }

  return node.reachableKanas.has(targetKana);
}

function getRomajiOptions(kana: string): string[] {
  return KANA_MAP[kana] ?? [];
}

function getNextKana(target: string): string | null {
  if (target.length <= 1) return null;
  const nextSection = target.slice(1);
  const candidates = extractLeadingKanas(nextSection);
  return candidates.length > 0 ? candidates[0] : null;
}

function matchSmallTsu(targetKana: string, input: string): MatchResult | null {
  if (!targetKana.startsWith('っ')) return null;

  for (const opt of SMALL_TSU_OPTIONS) {
    if (input.startsWith(opt)) {
      return {
        isMatch: true,
        consumedInput: opt,
        consumedTarget: 'っ',
        remainingTarget: targetKana.slice(1),
      };
    }
  }

  const nextKana = getNextKana(targetKana);
  if (!nextKana) return null;

  const nextRomajiOptions = getRomajiOptions(nextKana);
  const nextStarts = new Set(nextRomajiOptions.map((opt) => opt[0]).filter(Boolean));

  if (input.length > 0 && isConsonant(input[0]) && nextStarts.has(input[0])) {
    return {
      isMatch: true,
      consumedInput: input[0],
      consumedTarget: 'っ',
      remainingTarget: targetKana.slice(1),
    };
  }

  return null;
}

function matchN(targetKana: string, input: string): MatchResult | null {
  if (!targetKana.startsWith('ん')) return null;

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
    if (input === 'n' && targetKana.length === 1) {
      return {
        isMatch: true,
        consumedInput: 'n',
        consumedTarget: 'ん',
        remainingTarget: '',
      };
    }

    if (input.length === 1) return null;

    const nextChar = input[1];
    if (!isConsonant(nextChar) || nextChar === 'y') return null;

    const remainingInput = input.slice(1);
    const remainingTarget = targetKana.slice(1);

    if (remainingInput.length > 0 && !isValidPrefix(remainingTarget, remainingInput)) {
      return null;
    }

    return {
      isMatch: true,
      consumedInput: 'n',
      consumedTarget: 'ん',
      remainingTarget,
    };
  }

  return null;
}

export function match(targetKana: string, input: string): MatchResult | null {
  if (!targetKana || !input) return null;

  const tsu = matchSmallTsu(targetKana, input);
  if (tsu) return tsu;

  if (targetKana.startsWith('ん')) {
    const nResult = matchN(targetKana, input);
    if (nResult || input.startsWith('n')) return nResult;
  }

  let best: MatchResult | null = null;
  const candidates = extractLeadingKanas(targetKana);

  for (const candidate of candidates) {
    const len = findLongestMatchLengthForKana(input, candidate);
    if (len > 0) {
      if (!best || len > best.consumedInput.length) {
        best = {
          isMatch: true,
          consumedInput: input.slice(0, len),
          consumedTarget: candidate,
          remainingTarget: targetKana.slice(candidate.length),
        };
      }
    }
  }

  return best;
}

export function isValidPrefix(targetKana: string, input: string): boolean {
  if (!targetKana) return false;
  if (!input) return true;

  if (targetKana.startsWith('っ')) {
    for (const opt of SMALL_TSU_OPTIONS) {
      if (opt.startsWith(input)) return true;
    }

    const nextKana = getNextKana(targetKana);
    if (nextKana) {
      for (const opt of getRomajiOptions(nextKana)) {
        if (opt.startsWith(input)) return true;
      }
    }
  }

  if (targetKana.startsWith('ん')) {
    if ('nn'.startsWith(input)) return true;
    if ('xn'.startsWith(input)) return true;
    if (input === 'n') return true;
  }

  const candidates = extractLeadingKanas(targetKana);
  for (const candidate of candidates) {
    if (isPrefixValidForKana(input, candidate)) return true;
  }

  return false;
}

export function getNextChars(targetKana: string, input: string): Set<string> {
  const hints = new Set<string>();
  if (!targetKana) return hints;

  if (targetKana.startsWith('っ')) {
    for (const opt of SMALL_TSU_OPTIONS) {
      if (opt.startsWith(input) && input.length < opt.length) {
        hints.add(opt[input.length]);
      }
    }

    if (input.length === 0) {
      const nextKana = getNextKana(targetKana);
      if (nextKana) {
        for (const opt of getRomajiOptions(nextKana)) {
          if (isConsonant(opt[0])) {
            hints.add(opt[0]);
          }
        }
      }
    }
  }

  if (targetKana.startsWith('ん')) {
    for (const opt of ['nn', 'xn']) {
      if (opt.startsWith(input) && input.length < opt.length) {
        hints.add(opt[input.length]);
      }
    }

    if (input === '') {
      hints.add('n');
    }
  }

  const candidates = extractLeadingKanas(targetKana);
  for (const candidate of candidates) {
    let node: TrieNode | undefined = TRIE_ROOT;
    let viable = true;

    for (let i = 0; i < input.length; i += 1) {
      const ch = input[i];
      node = node.children.get(ch);
      if (!node) {
        viable = false;
        break;
      }
    }

    if (!viable || !node) continue;

    for (const [ch, child] of node.children.entries()) {
      if (child.reachableKanas.has(candidate)) {
        hints.add(ch);
      }
    }
  }

  return hints;
}
