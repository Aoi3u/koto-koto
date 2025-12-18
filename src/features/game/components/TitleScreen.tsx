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
        className="mt-12 px-8 py-3 rounded-full border border-white/10 hover:bg-white/5 text-off-white font-inter text-sm tracking-widest transition-all duration-300 hover:scale-105 active:scale-95"
      >
        PRESS ENTER TO START
      </button>
    </motion.div>
  );
}
