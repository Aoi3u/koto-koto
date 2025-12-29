'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useSeasonalTheme } from '../../../contexts/SeasonalContext';

interface TitleScreenProps {
  onStart: () => void;
}

export default function TitleScreen({ onStart }: TitleScreenProps) {
  const seasonalTheme = useSeasonalTheme();

  return (
    <motion.div
      key="waiting"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center text-center space-y-8"
    >
      <h1
        className="text-6xl md:text-8xl font-thin tracking-widest text-transparent bg-clip-text mb-4 opacity-90 transition-all duration-1000"
        style={{
          backgroundImage: `linear-gradient(to bottom, ${seasonalTheme.colors.text}, ${seasonalTheme.adjustedColors.primary})`,
        }}
      >
        Koto-Koto
      </h1>
      <p className="text-sm font-inter tracking-[0.4em] text-subtle-gray uppercase">
        Japanese Zen Typing
      </p>
      <p
        className="text-xs font-zen-old-mincho mt-4 opacity-60 transition-colors duration-1000"
        style={{ color: seasonalTheme.adjustedColors.primary }}
      >
        {seasonalTheme.haiku}
      </p>

      <button
        onClick={onStart}
        className="mt-16 group relative px-8 py-3 overflow-hidden rounded-full transition-all duration-500"
      >
        <span
          className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500"
          style={{ backgroundColor: seasonalTheme.adjustedColors.primary }}
        />
        <span
          className="relative text-sm font-zen-old-mincho tracking-[0.3em] text-off-white transition-all duration-500 group-hover:tracking-[0.4em]"
          style={{ textShadow: `0 0 10px ${seasonalTheme.adjustedColors.glow}` }}
        >
          PRESS ENTER TO START
        </span>
        <motion.div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-px w-0 bg-off-white/50 group-hover:w-1/2 transition-all duration-500" />
      </button>
    </motion.div>
  );
}
