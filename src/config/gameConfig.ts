export const GAME_CONFIG = {
  TOTAL_SENTENCES: 10,
  TIMER_INTERVAL_MS: 100,
  COMBO_TIMEOUT_MS: 3000, // Implied or future use
  WORD_TRANSITION_DELAY_MS: 50, // Delay for visual smoothness between words
};

export const RANK_THRESHOLDS = {
  SSS: { score: 85, grade: 'SSS', title: 'Nirvana (涅槃)' },
  SS: { score: 75, grade: 'SS', title: 'Void (虚空)' },
  S_PLUS: { score: 65, grade: 'S+', title: 'Roaring Dragon (昇龍)' },
  S: { score: 58, grade: 'S', title: 'Flowing Water (流水)' },
  S_MINUS: { score: 54, grade: 'S-', title: 'Waterfall (滝)' },
  A_PLUS: { score: 50, grade: 'A+', title: 'Full Moon (満月)' },
  A: { score: 46, grade: 'A', title: 'Clear Mirror (明鏡)' },
  A_MINUS: { score: 42, grade: 'A-', title: 'Still Lake (静湖)' },
  B_PLUS: { score: 38, grade: 'B+', title: 'Morning Dew (朝露)' },
  B: { score: 34, grade: 'B', title: 'Ripples (波紋)' },
  B_MINUS: { score: 30, grade: 'B-', title: 'Wind in Pines (松風)' },
  C_PLUS: { score: 20, grade: 'C+', title: 'Sprout (芽吹き)' },
  C: { score: 0, grade: 'C', title: 'Seed (種)' },
} as const;
