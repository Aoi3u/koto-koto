'use client';

import { useSeasonalTheme } from '@/contexts/SeasonalContext';
import type { HistoryStats } from '../types';

export default function HistoryStatsGrid({ stats }: { stats: HistoryStats }) {
  const { adjustedColors } = useSeasonalTheme();

  return (
    <div className="grid gap-4 grid-cols-2 md:grid-cols-4 lg:grid-cols-6 mb-6">
      {/* Hero Stats - Zen Score */}
      <div
        className="col-span-2 row-span-2 bg-white/5 border rounded-xl p-6 flex flex-col justify-center items-center relative overflow-hidden group transition-all duration-300 hover:bg-white/10"
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
          <div
            className="text-5xl md:text-6xl font-light font-zen-old-mincho mb-2 drop-shadow-sm"
            style={{ color: adjustedColors.primary }}
          >
            {Math.round(stats.bestZenScore)}
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
      {/* Streak Section */}
      <div className="col-span-1 md:col-span-2 bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col justify-between group hover:border-white/20 transition-colors">
        <div className="text-sm uppercase tracking-wider text-subtle-gray font-zen-old-mincho">
          Streak
        </div>
        <div className="flex items-end gap-2 mt-2">
          <span className="text-3xl font-light text-off-white">{stats.currentStreak}</span>
          <span className="text-sm text-subtle-gray mb-1.5">days current</span>
        </div>
        <div className="text-sm text-subtle-gray/60 mt-1">Longest: {stats.longestStreak} days</div>
      </div>
      {/* Sessions */}
      <div className="col-span-1 md:col-span-2 bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col justify-between group hover:border-white/20 transition-colors">
        <div className="text-sm uppercase tracking-wider text-subtle-gray font-zen-old-mincho">
          Total Sessions
        </div>
        <div className="text-3xl font-light text-off-white mt-2">{stats.sessions}</div>
        <div className="text-sm text-subtle-gray/60 mt-1">Practice makes perfect</div>
      </div>
      {/* Speed & Accuracy Details */}{' '}
      {/* These will wrap to next line on smaller screens efficiently */}
      <div className="col-span-1 md:col-span-1 bg-white/5 border border-white/5 rounded-xl p-3 flex flex-col">
        <div className="text-sm uppercase tracking-wider text-subtle-gray">Best WPM</div>
        <div className="text-xl text-off-white my-1 font-mono">{stats.bestWpm}</div>
        <div className="text-sm text-subtle-gray/60">Avg: {Math.round(stats.avgWpm)}</div>
      </div>
      <div className="col-span-1 md:col-span-1 bg-white/5 border border-white/5 rounded-xl p-3 flex flex-col">
        <div className="text-sm uppercase tracking-wider text-subtle-gray">Best Acc</div>
        <div className="text-xl my-1 font-mono" style={{ color: adjustedColors.secondary }}>
          {stats.bestAccuracy}%
        </div>
        <div className="text-sm text-subtle-gray/60">Avg: {Math.round(stats.avgAccuracy)}%</div>
      </div>
    </div>
  );
}
