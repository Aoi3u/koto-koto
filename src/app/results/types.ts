export type HistoryItem = {
  id: string;
  createdAt: string;
  wpm: number;
  accuracy: number;
  keystrokes: number;
  correctKeystrokes: number;
  elapsedTime: number;
  difficulty: string;
};

export type HistoryChartPoint = {
  label: string;
  wpm: number;
  accuracy: number;
  zenScore: number;
};

export type HistoryStats = {
  sessions: number;
  avgWpm: number;
  bestWpm: number;
  avgAccuracy: number;
  bestAccuracy: number;
  avgZenScore: number;
  bestZenScore: number;
  currentStreak: number;
  longestStreak: number;
};

export type RankingItem = {
  rank: number;
  user: string;
  wpm: number;
  accuracy: number;
  createdAt: string;
  zenScore?: number;
  grade?: string;
  title?: string;
  color?: string;
  isSelf?: boolean;
};
