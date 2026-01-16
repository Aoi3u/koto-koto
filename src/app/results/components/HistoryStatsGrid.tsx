'use client';

import type { HistoryStats } from '../types';

const statCardsFrom = (stats: HistoryStats) => [
  { label: 'Sessions', value: stats.sessions, suffix: '' },
  { label: 'Avg WPM', value: stats.avgWpm, suffix: '' },
  { label: 'Best WPM', value: stats.bestWpm, suffix: '' },
  { label: 'Avg Accuracy', value: stats.avgAccuracy, suffix: '%' },
  { label: 'Best Accuracy', value: stats.bestAccuracy, suffix: '%' },
  { label: 'Avg Zen Score', value: stats.avgZenScore, suffix: '' },
  { label: 'Best Zen Score', value: stats.bestZenScore, suffix: '' },
  { label: 'Current Streak', value: stats.currentStreak, suffix: 'days' },
  { label: 'Longest Streak', value: stats.longestStreak, suffix: 'days' },
];

export default function HistoryStatsGrid({ stats }: { stats: HistoryStats }) {
  const statCards = statCardsFrom(stats);

  return (
    <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
      {statCards.map((stat) => (
        <div
          key={stat.label}
          className="bg-white/5 border border-white/10 rounded-lg p-3 flex flex-col gap-1"
        >
          <div className="text-sm text-subtle-gray">{stat.label}</div>
          <div className="text-xl text-off-white font-mono">
            {stat.value}
            <span className="text-sm text-subtle-gray ml-1">{stat.suffix}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
