export const GAME_CONFIG = {
  TOTAL_SENTENCES: 10,
  TIMER_INTERVAL_MS: 100,
  COMBO_TIMEOUT_MS: 3000, // Implied or future use
  WORD_TRANSITION_DELAY_MS: 50, // Delay for visual smoothness between words
};

export const RANK_THRESHOLDS = {
  NIRVANA_MASTER: { score: 100, grade: 'SSS 大師', title: 'Nirvana (涅槃)' },
  NIRVANA_9: { score: 98, grade: 'SSS 九段', title: 'Nirvana (涅槃)' },
  NIRVANA_8: { score: 96, grade: 'SSS 八段', title: 'Nirvana (涅槃)' },
  NIRVANA_7: { score: 94, grade: 'SSS 七段', title: 'Nirvana (涅槃)' },
  NIRVANA_6: { score: 92, grade: 'SSS 六段', title: 'Nirvana (涅槃)' },
  NIRVANA_5: { score: 90, grade: 'SSS 五段', title: 'Nirvana (涅槃)' },
  NIRVANA_4: { score: 88, grade: 'SSS 四段', title: 'Nirvana (涅槃)' },
  NIRVANA_3: { score: 86, grade: 'SSS 三段', title: 'Nirvana (涅槃)' },
  NIRVANA_2: { score: 84, grade: 'SSS 二段', title: 'Nirvana (涅槃)' },
  NIRVANA_1: { score: 82, grade: 'SSS 初段', title: 'Nirvana (涅槃)' },
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
