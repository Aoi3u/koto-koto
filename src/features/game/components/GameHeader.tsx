'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { formatTime } from '../../../lib/formatters';
import { useSeasonalTheme } from '../../../contexts/SeasonalContext';

interface GameHeaderProps {
  elapsedTime: number;
  currentWordIndex: number;
  totalSentences: number;
  onQuit: () => void;
}

export default function GameHeader({
  elapsedTime,
  currentWordIndex,
  totalSentences,
  onQuit,
}: GameHeaderProps) {
  const seasonalTheme = useSeasonalTheme();
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
          style={{ textShadow: `0 0 15px ${seasonalTheme.adjustedColors.glow}` }}
        >
          {timeStr}
        </span>
      </div>

      {/* Right: Progress */}
      <div className="flex flex-col items-end">
        <span className="text-[10px] tracking-[0.3em] uppercase mb-1 opacity-60 font-zen-old-mincho">
          Progress
        </span>
        <span className="text-xl font-inter font-light tracking-wider text-off-white">
          {currentWordIndex + 1}
          <span className="text-sm text-subtle-gray mx-1 opacity-50">/</span>
          {totalSentences}
        </span>
      </div>
    </motion.header>
  );
}
