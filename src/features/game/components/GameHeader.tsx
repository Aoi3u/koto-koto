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
      className="absolute top-0 w-full p-8 flex justify-between items-start z-50 text-subtle-gray"
    >
      {/* Left: Back to Title */}
      <button
        onClick={onQuit}
        className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors duration-300 group"
      >
        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        <span className="text-sm font-inter tracking-widest uppercase">Title</span>
      </button>

      {/* Center: Timer & Season & Time */}
      <div className="flex flex-col items-center">
        <span className="text-[10px] tracking-[0.2em] uppercase mb-1">
          {seasonalTheme.name.ja} • {seasonalTheme.timeName.ja}
        </span>
        <span className="text-xl font-inter font-light tracking-wider text-off-white">
          {timeStr}
        </span>
      </div>

      {/* Right: Progress */}
      <div className="flex flex-col items-end">
        <span className="text-[10px] tracking-[0.2em] uppercase mb-1">Progress</span>
        <span className="text-xl font-inter font-light tracking-wider text-off-white">
          {currentWordIndex + 1}
          <span className="text-sm text-zinc-600 mx-1">/</span>
          {totalSentences}
        </span>
      </div>
    </motion.header>
  );
}
