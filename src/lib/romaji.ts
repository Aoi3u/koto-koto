export type MatchResult = {
  isMatch: boolean;
  consumedInput: string;
  consumedTarget: string;
  remainingTarget: string;
};

// Map of Kana to all valid Romaji inputs
export const KANA_MAP: Record<string, string[]> = {
  あ: ["a"],
  い: ["i", "yi"],
  う: ["u", "wu", "whu"],
  え: ["e"],
  お: ["o"],
  か: ["ka", "ca"],
  き: ["ki"],
  く: ["ku", "cu", "qu"],
  け: ["ke"],
  こ: ["ko", "co"],
  さ: ["sa"],
  し: ["shi", "si", "ci"],
  す: ["su"],
  せ: ["se", "ce"],
  そ: ["so"],
  た: ["ta"],
  ち: ["chi", "ti"],
  つ: ["tsu", "tu"],
  て: ["te"],
  と: ["to"],
  な: ["na"],
  に: ["ni"],
  ぬ: ["nu"],
  ね: ["ne"],
  の: ["no"],
  は: ["ha"],
  ひ: ["hi"],
  ふ: ["fu", "hu"],
  へ: ["he"],
  ほ: ["ho"],

  // F-series (Modern IME - Added Fix)
  ふぁ: ["fa"],
  ふぃ: ["fi"],
  ふぇ: ["fe"],
  ふぉ: ["fo"],

  ゔ: ["vu"],
  ゔぁ: ["va"],
  ゔぃ: ["vi"],
  ゔぇ: ["ve"],
  ゔぉ: ["vo"],

  ま: ["ma"],
  み: ["mi"],
  む: ["mu"],
  め: ["me"],
  も: ["mo"],
  や: ["ya"],
  ゆ: ["yu"],
  よ: ["yo"],
  ら: ["ra"],
  り: ["ri"],
  る: ["ru"],
  れ: ["re"],
  ろ: ["ro"],
  わ: ["wa"],
  を: ["wo"],
  ん: ["nn", "n", "xn"],

  // Dakuten
  が: ["ga"],
  ぎ: ["gi"],
  ぐ: ["gu"],
  げ: ["ge"],
  ご: ["go"],
  ざ: ["za"],
  じ: ["ji", "zi"],
  ず: ["zu"],
  ぜ: ["ze"],
  ぞ: ["zo"],
  だ: ["da"],
  ぢ: ["ji", "di"],
  づ: ["zu", "du"],
  で: ["de"],
  ど: ["do"],
  ば: ["ba"],
  び: ["bi"],
  ぶ: ["bu"],
  べ: ["be"],
  ぼ: ["bo"],
  ぱ: ["pa"],
  ぴ: ["pi"],
  ぷ: ["pu"],
  ぺ: ["pe"],
  ぽ: ["po"],

  // Small Kana (independent)
  ぁ: ["la", "xa"],
  ぃ: ["li", "xi"],
  ぅ: ["lu", "xu"],
  ぇ: ["le", "xe"],
  ぉ: ["lo", "xo"],
  っ: ["ltu", "xtu", "ltsu"], // Double consonant handled separately
  ゃ: ["lya", "xya"],
  ゅ: ["lyu", "xyu"],
  ょ: ["lyo", "xyo"],

  // Yoon (Contracted sounds)
  きゃ: ["kya"],
  きゅ: ["kyu"],
  きょ: ["kyo"],
  しゃ: ["sha", "sya"],
  しゅ: ["shu", "syu"],
  しょ: ["sho", "syo"],
  ちゃ: ["cha", "tya"],
  ちゅ: ["chu", "tyu"],
  ちょ: ["cho", "tyo"],
  にゃ: ["nya"],
  にゅ: ["nyu"],
  にょ: ["nyo"],
  ひゃ: ["hya"],
  ひゅ: ["hyu"],
  ひょ: ["hyo"],
  みゃ: ["mya"],
  みゅ: ["myu"],
  みょ: ["myo"],
  りゃ: ["rya"],
  りゅ: ["ryu"],
  りょ: ["ryo"],
  ぎゃ: ["gya"],
  ぎゅ: ["gyu"],
  ぎょ: ["gyo"],
  じゃ: ["ja", "jya", "zya"],
  じゅ: ["ju", "jyu", "zyu"],
  じょ: ["jo", "jyo", "zyo"],
  びゃ: ["bya"],
  びゅ: ["byu"],
  びょ: ["byo"],
  ぴゃ: ["pya"],
  ぴゅ: ["pyu"],
  ぴょ: ["pyo"],

  // Special Symbols
  ー: ["-"],
  "、": [","],
  "。": ["."],
};

// Check if a character is a consonant
const isConsonant = (char: string) => /^[bcdfghjklmnpqrstvwxyz]$/.test(char);

// Helper to get romaji options, handling basic combinations if missing
function getRomajiOptions(kana: string): string[] {
  if (KANA_MAP[kana]) return KANA_MAP[kana];
  // Fallbacks or empty
  return [""];
}

/**
 * Main function to check input against target.
 * targetKana: The full remaining target string (e.g. "かんに").
 * input: The user's current input buffer (e.g. "k").
 */
export function checkRomaji(
  targetKana: string,
  input: string
): MatchResult | null {
  if (!targetKana) return null;
  if (!input) return null;

  // 1. Check for Double Consonant (Small Tsu)
  if (targetKana.startsWith("っ")) {
    const nextKana = targetKana[1];
    // Check direct entry for っ (xtu, ltu)
    const directOptions = ["xtu", "ltu", "ltsu"];
    for (const opt of directOptions) {
      if (input.startsWith(opt)) {
        return {
          isMatch: true,
          consumedInput: opt,
          consumedTarget: "っ",
          remainingTarget: targetKana.slice(1),
        };
      }
    }

    if (nextKana) {
      const nextRomajiOptions = getRomajiOptions(nextKana);
      // Double consonant check: input starts with consonant, matches next kana start
      // e.g. target "った" (tta), input "t". "ta" starts with "t".
      // Consumed input is "t", consumed target is "っ".
      const matchingNext = nextRomajiOptions.some((r) => r.startsWith(input));

      if (matchingNext && isConsonant(input.charAt(0))) {
        // Only valid if input is ALMOST purely the consonant?
        // e.g. "tt" -> first "t" is 'っ'.
        // Input "t".
        return {
          isMatch: true,
          consumedInput: input.charAt(0), // Consume just the first char
          consumedTarget: "っ",
          remainingTarget: targetKana.slice(1),
        };
      }
    }
  }

  // 2. Check for "N" (ん) - PERMISSIVE LOGIC
  if (targetKana.startsWith("ん")) {
    // Case A: "nn" -> Always match
    if (input.startsWith("nn")) {
      return {
        isMatch: true,
        consumedInput: "nn",
        consumedTarget: "ん",
        remainingTarget: targetKana.slice(1),
      };
    }

    // Case B: "xn" -> Always match
    if (input.startsWith("xn")) {
      return {
        isMatch: true,
        consumedInput: "xn",
        consumedTarget: "ん",
        remainingTarget: targetKana.slice(1),
      };
    }

    // Case C: Single "n" logic
    if (input.startsWith("n")) {
      // C-1: "n" at End of Input (Potential Pending)
      if (input === "n") {
        // If this is the LAST character of the target, we accept 'n' as complete.
        // e.g. "Riron" -> "りろん". 'ん' is last. 'n' is valid.
        if (targetKana.length === 1) {
          return {
            isMatch: true,
            consumedInput: "n",
            consumedTarget: "ん",
            remainingTarget: "",
          };
        }
        // Otherwise, it's just "pending". Return NULL.
        // User must type another 'n' OR a consonant.
        return null;
      }

      // C-2: "n" + Character ...
      // Check next char in INPUT
      const nextChar = input[1];

      if (!isConsonant(nextChar) || nextChar === "y") {
        return null;
      }

      if (isConsonant(nextChar)) {
        const remainingInput = input.slice(1);
        const nextTarget = targetKana.slice(1);

        if (remainingInput.length > 0 && !isValidPrefix(nextTarget, remainingInput)) {
          return null;
        }
        return {
          isMatch: true,
          consumedInput: "n",
          consumedTarget: "ん",
          remainingTarget: nextTarget,
        };
      }

      // "n" + Vowel (e.g. "na") -> "な". Not "ん".
      // Return null (no match for 'ん').
    }
  }

  // 3. Normal Kana Match
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
}

// Helper to check if input is a valid prefix for the start of target
export function isValidPrefix(targetKana: string, input: string): boolean {
  if (!targetKana) return false;
  if (!input) return true;

  // 1. Check for Double Consonant (Small Tsu)
  if (targetKana.startsWith("っ")) {
    const nextKana = targetKana[1];
    // Check direct entry options
    const directOptions = ["xtu", "ltu", "ltsu"];
    for (const opt of directOptions) {
      if (opt.startsWith(input)) return true;
    }

    // Check double consonant (e.g. "k" for "kka")
    if (nextKana) {
      const nextOpts = getRomajiOptions(nextKana);
      for (const opt of nextOpts) {
        if (opt.startsWith(input)) return true;
      }
    }
  }

  // 2. Check N
  if (targetKana.startsWith("ん")) {
    // "n", "nn", "xn"
    if ("nn".startsWith(input)) return true;
    if ("xn".startsWith(input)) return true;
    // Single 'n' is always valid prefix
    if (input === "n") return true;
  }

  // 3. Normal Kana
  let options = KANA_MAP[targetKana.slice(0, 2)] || [];
  if (options.length === 0) {
    options = KANA_MAP[targetKana.slice(0, 1)] || [];
  }

  for (const opt of options) {
    if (opt.startsWith(input)) return true;
  }

  return false;
}
