import { calculateZenScore } from '@/lib/formatters';
import type { HistoryChartPoint, HistoryItem, HistoryStats } from '../types';

const formatDayKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const toDayNumber = (date: Date) =>
  Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86400000);

export const computeHistoryStats = (items: HistoryItem[]): HistoryStats => {
  if (items.length === 0) {
    return {
      sessions: 0,
      avgWpm: 0,
      bestWpm: 0,
      avgAccuracy: 0,
      bestAccuracy: 0,
      avgZenScore: 0,
      bestZenScore: 0,
      currentStreak: 0,
      longestStreak: 0,
    };
  }

  const stats = items.reduce(
    (acc, item) => {
      const zenScore = calculateZenScore(item.wpm, item.accuracy);
      acc.totalWpm += item.wpm;
      acc.totalAccuracy += item.accuracy;
      acc.totalZen += zenScore;
      acc.bestWpm = Math.max(acc.bestWpm, item.wpm);
      acc.bestAccuracy = Math.max(acc.bestAccuracy, item.accuracy);
      acc.bestZenScore = Math.max(acc.bestZenScore, zenScore);
      return acc;
    },
    {
      totalWpm: 0,
      totalAccuracy: 0,
      totalZen: 0,
      bestWpm: 0,
      bestAccuracy: 0,
      bestZenScore: 0,
    }
  );

  const uniqueDays = new Map<number, string>();
  items.forEach((item) => {
    const date = new Date(item.createdAt);
    uniqueDays.set(toDayNumber(date), formatDayKey(date));
  });
  const dayNumbers = Array.from(uniqueDays.keys()).sort((a, b) => b - a);

  let currentStreak = 0;
  if (dayNumbers.length > 0) {
    currentStreak = 1;
    for (let i = 1; i < dayNumbers.length; i += 1) {
      if (dayNumbers[i - 1] - dayNumbers[i] === 1) currentStreak += 1;
      else break;
    }
  }

  let longestStreak = 0;
  let streak = 0;
  for (let i = 0; i < dayNumbers.length; i += 1) {
    if (i === 0 || dayNumbers[i - 1] - dayNumbers[i] === 1) {
      streak += 1;
    } else {
      streak = 1;
    }
    longestStreak = Math.max(longestStreak, streak);
  }

  return {
    sessions: items.length,
    avgWpm: Math.round(stats.totalWpm / items.length),
    bestWpm: Math.round(stats.bestWpm),
    avgAccuracy: Math.round((stats.totalAccuracy / items.length) * 10) / 10,
    bestAccuracy: Math.round(stats.bestAccuracy * 10) / 10,
    avgZenScore: Math.round(stats.totalZen / items.length),
    bestZenScore: Math.round(stats.bestZenScore),
    currentStreak,
    longestStreak,
  };
};

export const buildHistoryChart = (items: HistoryItem[]): HistoryChartPoint[] => {
  const sorted = [...items].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  return sorted.map((item) => ({
    label: new Date(item.createdAt).toLocaleDateString(),
    wpm: Math.round(item.wpm),
    accuracy: Math.round(item.accuracy * 10) / 10,
    zenScore: Math.round(calculateZenScore(item.wpm, item.accuracy)),
  }));
};
