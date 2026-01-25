'use client';

import type React from 'react';
import { motion } from 'framer-motion';
import { calculateRank } from '@/features/result/utils/rankLogic';
import { calculateZenScore } from '@/lib/formatters';
import { useThemePalette } from '@/contexts/SeasonalContext';
import type { HistoryItem } from '../types';

export default function HistoryList({
  items,
  scrollRef,
  scrollState,
  onScroll,
}: {
  items: HistoryItem[];
  scrollRef: React.RefObject<HTMLDivElement | null>;
  scrollState: { top: boolean; bottom: boolean };
  onScroll: (event: React.UIEvent<HTMLDivElement>) => void;
}) {
  const { palette } = useThemePalette('dynamic');

  return (
    <div
      ref={scrollRef}
      onScroll={onScroll}
      className={`grid gap-3 pr-2 ${
        scrollState.top ? 'has-scroll-top' : ''
      } ${scrollState.bottom ? 'has-scroll-bottom' : ''}`}
    >
      {items.map((item, i) => {
        const rankResult = calculateRank(item.wpm, item.accuracy);
        const zenScore = calculateZenScore(item.wpm, item.accuracy);

        return (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className="group relative bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg p-4 flex items-center justify-between transition-all duration-300"
            style={{
              borderColor: 'rgba(255,255,255,0.05)',
            }}
            whileHover={{
              borderColor: palette.primary,
              boxShadow: `0 0 15px ${palette.glow}20`,
            }}
          >
            <div className="flex items-center gap-6">
              <div className="w-16 text-center hidden md:block">
                <div className={`text-lg font-bold font-zen-old-mincho ${rankResult.color}`}>
                  {rankResult.grade}
                </div>
                <div className="text-[9px] text-subtle-gray leading-tight tracking-wider uppercase line-clamp-1">
                  {rankResult.title}
                </div>
              </div>
              <div>
                <div className="text-xs text-subtle-gray font-mono mb-1">
                  {new Date(item.createdAt).toLocaleDateString()} •{' '}
                  {new Date(item.createdAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6 text-right">
              <div className="hidden sm:block relative group/zen">
                <div className="text-sm text-off-white font-mono font-bold cursor-help">
                  {zenScore}
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
              <div className="relative group/wpm">
                <div className="text-xl font-light font-inter text-off-white cursor-help">
                  {item.wpm}
                </div>
                <div className="text-[10px] text-subtle-gray uppercase">WPM</div>
                {/* Tooltip for WPM */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-zen-dark/95 backdrop-blur-md border border-white/20 rounded-md shadow-xl opacity-0 invisible group-hover/wpm:opacity-100 group-hover/wpm:visible transition-all duration-200 whitespace-nowrap z-50 pointer-events-none">
                  <div className="text-[10px] text-off-white font-mono mb-1">
                    WPM = (Correct Keys ÷ 5) ÷ Minutes
                  </div>
                  <div className="text-[9px] text-subtle-gray font-mono">
                    = ({item.correctKeystrokes} ÷ 5) ÷ {(item.elapsedTime / 60).toFixed(2)}m
                  </div>
                </div>
              </div>
              <div className="hidden sm:block">
                <div className="text-sm text-subtle-gray font-mono">{item.accuracy}%</div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
