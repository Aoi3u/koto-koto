'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Flag } from 'lucide-react';
import { formatTime } from '../../../lib/formatters';
import { useSeasonalTheme, useThemePalette } from '../../../contexts/SeasonalContext';
import ChipButton from '@/components/ui/ChipButton';

interface GameHeaderProps {
  elapsedTime: number;
  currentWordIndex: number;
  totalSentences: number;
  isEndlessMode?: boolean;
  onFinishEndless?: () => void;
  onQuit: () => void;
}

export default function GameHeader({
  elapsedTime,
  currentWordIndex,
  totalSentences,
  isEndlessMode = false,
  onFinishEndless,
  onQuit,
}: GameHeaderProps) {
  const seasonalTheme = useSeasonalTheme();
  const { palette } = useThemePalette('stable');
  const timeStr = formatTime(elapsedTime);

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="absolute top-20 w-full px-8 py-4 flex justify-between items-start z-50 text-subtle-gray pointer-events-none"
    >
      {/* Left: Back to Title */}
      <button
        onClick={onQuit}
        className="pointer-events-auto flex items-center gap-2 text-subtle-gray hover:text-off-white transition-colors duration-300 group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span className="text-xs font-zen-old-mincho tracking-widest uppercase">Title</span>
      </button>

      {/* Center: Timer & Season & Time */}
      <div className="flex flex-col items-center">
        <span className="text-[10px] tracking-[0.3em] uppercase mb-1 opacity-60 font-zen-old-mincho">
          {seasonalTheme.name.ja} • {seasonalTheme.timeName.ja}
        </span>
        <span
          className="text-xl font-inter font-light tracking-wider text-off-white transition-all duration-1000"
          style={{ textShadow: `0 0 15px ${palette.glow}` }}
        >
          {timeStr}
        </span>
      </div>

      {/* Right: Progress / End Endless */}
      <div className="flex flex-col items-end gap-2 pointer-events-auto">
        {isEndlessMode && onFinishEndless && (
          <ChipButton
            onClick={onFinishEndless}
            className="gap-1.5 border-white/15 px-3 py-1 text-[10px] tracking-widest text-off-white/80 hover:text-off-white hover:border-white/35"
          >
            <Flag className="w-3 h-3" />
            End
          </ChipButton>
        )}
        <div className="flex flex-col items-end">
          <span className="text-[10px] tracking-[0.3em] uppercase mb-1 opacity-60 font-zen-old-mincho">
            Progress
          </span>
          <span className="text-xl font-inter font-light tracking-wider text-off-white">
            {currentWordIndex + 1}
            <span className="text-sm text-subtle-gray mx-1 opacity-50">/</span>
            {isEndlessMode ? '∞' : totalSentences}
          </span>
        </div>
      </div>
    </motion.header>
  );
}
