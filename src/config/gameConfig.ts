export const GAME_CONFIG = {
  TOTAL_SENTENCES: 10,
  TIMER_INTERVAL_MS: 100,
  COMBO_TIMEOUT_MS: 3000, // Implied or future use
  WORD_TRANSITION_DELAY_MS: 50, // Delay for visual smoothness between words
};

export const RANK_THRESHOLDS = {
  SSS: { score: 80, grade: 'SSS', title: 'Nirvana (涅槃)' },
  SS_PLUS: { score: 75, grade: 'SS+', title: 'Heaven (天)' },
  SS: { score: 70, grade: 'SS', title: 'Void (虚空)' },
  SS_MINUS: { score: 66, grade: 'SS-', title: 'Phoenix (鳳凰)' },
  S_PLUS: { score: 63, grade: 'S+', title: 'Roaring Dragon (昇龍)' },
  S: { score: 60, grade: 'S', title: 'Flowing Water (流水)' },
  S_MINUS: { score: 57, grade: 'S-', title: 'Waterfall (滝)' },
  A_PLUS: { score: 54, grade: 'A+', title: 'Full Moon (満月)' },
  A: { score: 51, grade: 'A', title: 'Clear Mirror (明鏡)' },
  A_MINUS: { score: 48, grade: 'A-', title: 'Still Lake (静湖)' },
  B_PLUS: { score: 45, grade: 'B+', title: 'Mountain Peak (峰)' },
  B: { score: 42, grade: 'B', title: 'Morning Dew (朝露)' },
  B_MINUS: { score: 39, grade: 'B-', title: 'Ripples (波紋)' },
  C_PLUS: { score: 36, grade: 'C+', title: 'Wind in Pines (松風)' },
  C: { score: 33, grade: 'C', title: 'Sprout (芽吹き)' },
  C_MINUS: { score: 30, grade: 'C-', title: 'Seed (種)' },
  D: { score: 0, grade: 'D', title: 'Pebble (小石)' },
} as const;
