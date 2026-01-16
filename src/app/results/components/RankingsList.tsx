'use client';

import type React from 'react';
import { motion } from 'framer-motion';
import { useSeasonalTheme } from '@/contexts/SeasonalContext';
import type { RankingItem } from '../types';

export default function RankingsList({
  items,
  scrollRef,
  scrollState,
  onScroll,
}: {
  items: RankingItem[];
  scrollRef: React.RefObject<HTMLDivElement | null>;
  scrollState: { top: boolean; bottom: boolean };
  onScroll: (event: React.UIEvent<HTMLDivElement>) => void;
}) {
  const seasonalTheme = useSeasonalTheme();

  return (
    <div
      ref={scrollRef}
      onScroll={onScroll}
      className={`grid gap-2 pr-2 ${
        scrollState.top ? 'has-scroll-top' : ''
      } ${scrollState.bottom ? 'has-scroll-bottom' : ''}`}
    >
      {items.map((item, i) => {
        const isSelf = item.isSelf;
        return (
          <motion.div
            key={`${item.rank}-${item.user}-${item.createdAt}`}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.02 }}
            className={`flex items-center p-3 rounded-md border transition-all duration-300 ${
              item.rank === 1
                ? 'bg-yellow-700/20 border-yellow-700/30'
                : item.rank === 2
                  ? 'bg-white/10 border-white/20'
                  : item.rank === 3
                    ? 'bg-orange-700/20 border-orange-700/30'
                    : 'bg-transparent border-transparent hover:bg-white/5 hover:border-white/20'
            } ${isSelf ? 'relative' : ''}`}
            style={{
              ...(item.rank > 3
                ? {
                    borderColor: 'rgba(0, 0, 0, 0)',
                  }
                : {}),
              ...(isSelf
                ? {
                    borderColor: item.rank > 3 ? seasonalTheme.adjustedColors.primary : undefined,
                    boxShadow: `0 0 0 1px ${seasonalTheme.adjustedColors.primary}, 0 0 18px ${seasonalTheme.adjustedColors.glow}35`,
                  }
                : {}),
            }}
            whileHover={
              item.rank > 3
                ? {
                    borderColor: seasonalTheme.adjustedColors.primary,
                    backgroundColor: 'rgba(255,255,255,0.05)',
                  }
                : {}
            }
          >
            <div
              className={`w-8 text-center font-mono font-bold ${
                item.rank <= 3 ? 'text-off-white' : 'text-subtle-gray'
              }`}
            >
              {item.rank}
            </div>
            <div className="flex-1 min-w-0 px-3">
              <div className="flex items-center gap-2">
                <div className="text-off-white font-zen-old-mincho truncate">{item.user}</div>
                {isSelf && (
                  <span className="px-2 py-0.5 text-[10px] font-mono rounded-full bg-white/10 border border-white/15">
                    You
                  </span>
                )}
              </div>
              <div className="text-[10px] text-subtle-gray">
                {new Date(item.createdAt).toLocaleDateString()}
              </div>
            </div>
            {item.grade && (
              <div className="w-12 text-center hidden md:block">
                <div className="text-base text-subtle-gray font-bold font-zen-old-mincho">
                  {item.grade}
                </div>
              </div>
            )}
            <div className="w-16 text-right hidden sm:block relative group/zen">
              <div className="text-sm text-off-white font-mono font-semibold cursor-help">
                {item.zenScore}
              </div>
              <div className="text-[10px] text-subtle-gray uppercase">Zen Score</div>
              {/* Tooltip for Zen Score */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-zen-dark/95 backdrop-blur-md border border-white/20 rounded-md shadow-xl opacity-0 invisible group-hover/zen:opacity-100 group-hover/zen:visible transition-all duration-200 whitespace-nowrap z-50 pointer-events-none">
                <div className="text-[10px] text-off-white font-mono mb-1">
                  Zen Score = WPM × Accuracy ÷ 100
                </div>
                <div className="text-[9px] text-subtle-gray font-mono">
                  = {item.wpm} × {item.accuracy}% ÷ 100
                </div>
              </div>
            </div>
            <div className="w-16 text-right relative group/wpm">
              <div className="text-xl font-light font-inter text-off-white cursor-help">
                {item.wpm}
              </div>
              <div className="text-[10px] text-subtle-gray uppercase">WPM</div>
              {/* Tooltip for WPM */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-zen-dark/95 backdrop-blur-md border border-white/20 rounded-md shadow-xl opacity-0 invisible group-hover/wpm:opacity-100 group-hover/wpm:visible transition-all duration-200 whitespace-nowrap z-50 pointer-events-none">
                <div className="text-[10px] text-off-white font-mono text-center">
                  WPM = (Correct Keys ÷ 5) ÷ Minutes
                </div>
              </div>
            </div>
            <div className="w-16 text-right hidden sm:block">
              <div className="text-sm text-subtle-gray font-mono">{item.accuracy}%</div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
