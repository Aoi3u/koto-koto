'use client';

import { useSeasonalTheme } from '@/contexts/SeasonalContext';
import type { HistoryStats } from '../types';

export default function HistoryStatsGrid({ stats }: { stats: HistoryStats }) {
  const { adjustedColors } = useSeasonalTheme();

  return (
    <div className="grid gap-4 md:grid-cols-5 mb-6">
      {/* Hero Stat - Zen Score is the one number worth a card */}
      <div
        className="md:col-span-2 bg-white/5 border rounded-xl p-6 flex flex-col justify-center items-center relative overflow-hidden group transition-all duration-300 hover:bg-white/10"
        style={{ borderColor: 'rgba(255,255,255,0.1)' }}
      >
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-700"
          style={{
            background: `radial-gradient(circle at center, ${adjustedColors.primary}, transparent 70%)`,
          }}
        />
        <div className="relative z-10 text-center">
          <div className="text-sm uppercase tracking-[0.2em] text-subtle-gray mb-2 font-zen-old-mincho">
            Highest Zen Score
          </div>
          <div className="text-5xl text-off-white md:text-6xl font-light font-zen-old-mincho mb-2">
            {stats.bestZenScore}
          </div>
          {stats.bestZenRank && (
            <div className={`text-md font-bold mb-1 ${stats.bestZenRank.color}`}>
              {stats.bestZenRank.grade}{' '}
              <span className="opacity-70 text-sm font-normal">・ {stats.bestZenRank.title}</span>
            </div>
          )}
          <div className="text-sm text-subtle-gray/70">Avg: {Math.round(stats.avgZenScore)}</div>
        </div>
      </div>

      {/* Everything else is secondary detail, grouped in one strip instead of four lookalike cards */}
      <div className="md:col-span-3 grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-white/10 border border-white/10 rounded-xl">
        <div className="p-4 flex flex-col justify-between">
          <div className="text-xs uppercase tracking-wider text-subtle-gray">Streak</div>
          <div className="flex items-end gap-1.5 mt-2">
            <span className="text-2xl font-light text-off-white">{stats.currentStreak}</span>
            <span className="text-xs text-subtle-gray mb-1">days</span>
          </div>
          <div className="text-xs text-subtle-gray/60 mt-1">Longest: {stats.longestStreak}</div>
        </div>
        <div className="p-4 flex flex-col justify-between">
          <div className="text-xs uppercase tracking-wider text-subtle-gray">Sessions</div>
          <div className="text-2xl font-light text-off-white mt-2">{stats.sessions}</div>
          <div className="text-xs text-subtle-gray/60 mt-1">Total played</div>
        </div>
        <div className="p-4 flex flex-col justify-between">
          <div className="text-xs uppercase tracking-wider text-subtle-gray">Best WPM</div>
          <div className="text-2xl text-off-white mt-2 font-mono">{stats.bestWpm}</div>
          <div className="text-xs text-subtle-gray/60 mt-1">Avg: {Math.round(stats.avgWpm)}</div>
        </div>
        <div className="p-4 flex flex-col justify-between">
          <div className="text-xs uppercase tracking-wider text-subtle-gray">Best Acc</div>
          <div className="text-2xl text-off-white mt-2 font-mono">{stats.bestAccuracy}%</div>
          <div className="text-xs text-subtle-gray/60 mt-1">Avg: {Math.round(stats.avgAccuracy)}%</div>
        </div>
      </div>
    </div>
  );
}
