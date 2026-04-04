'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useSeasonalTheme, useThemePalette } from '../../../contexts/SeasonalContext';
import type { GameMode } from '../hooks/useGameSession';

interface TitleScreenProps {
  selectedMode: GameMode;
  onModeChange: (mode: GameMode) => void;
  onStart: () => void;
}

export default function TitleScreen({ selectedMode, onModeChange, onStart }: TitleScreenProps) {
  const seasonalTheme = useSeasonalTheme();
  const { palette } = useThemePalette('dynamic');
  const [showModePanel, setShowModePanel] = useState(false);

  return (
    <motion.div
      key="waiting"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center text-center space-y-8"
    >
      <p className="my-4 text-md font-inter tracking-[0.2em] text-subtle-gray">
        Japanese Zen Typing
      </p>
      <h1
        className="text-6xl md:text-8xl font-thin tracking-widest text-transparent bg-clip-text opacity-90 transition-all duration-1000"
        style={{
          backgroundImage: `linear-gradient(to bottom, ${palette.text}, ${palette.primary})`,
        }}
      >
        Koto-Koto
      </h1>
      <p
        className="text-xs font-zen-old-mincho opacity-60 transition-colors duration-1000"
        style={{ color: palette.primary }}
      >
        {seasonalTheme.haiku}
      </p>

      <div className="mt-12 flex flex-col items-center gap-3">
        <button
          type="button"
          onClick={() => setShowModePanel((prev) => !prev)}
          className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-5 py-2 text-[10px] tracking-[0.22em] uppercase font-inter text-off-white/75 hover:text-off-white hover:border-white/35 transition-colors duration-300"
          aria-expanded={showModePanel}
          aria-controls="mode-panel"
        >
          <motion.span
            animate={{ rotate: showModePanel ? 90 : 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="inline-block text-[8px] leading-none"
            aria-hidden="true"
          >
            ▶
          </motion.span>
          Mode
        </button>

        {showModePanel && (
          <div>
            <div
              id="mode-panel"
              className="flex items-center gap-2 rounded-full border border-white/15 bg-white/5 p-1 backdrop-blur-sm"
            >
              <button
                type="button"
                onClick={() => onModeChange('classic')}
                className={`px-4 py-2 rounded-full text-[10px] tracking-[0.2em] uppercase font-inter transition-colors duration-300 ${
                  selectedMode === 'classic'
                    ? 'bg-white/20 text-off-white'
                    : 'text-off-white/60 hover:text-off-white/85'
                }`}
              >
                Classic
              </button>
              <button
                type="button"
                onClick={() => onModeChange('word-endless')}
                className={`px-4 py-2 rounded-full text-[10px] tracking-[0.2em] uppercase font-inter transition-colors duration-300 ${
                  selectedMode === 'word-endless'
                    ? 'bg-white/20 text-off-white'
                    : 'text-off-white/60 hover:text-off-white/85'
                }`}
              >
                Word Endless
              </button>
            </div>
            <p className="mt-4 text-[11px] font-inter tracking-widest text-off-white/60">
              {selectedMode === 'classic'
                ? '10 sentences • result saved'
                : 'infinite words • no save'}
            </p>
          </div>
        )}
      </div>

      <div className="flex flex-col items-center gap-4">
        <button
          onClick={onStart}
          className="group relative px-8 py-3 overflow-hidden rounded-full transition-all duration-500"
        >
          <span
            className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500"
            style={{ backgroundColor: palette.primary }}
          />
          <span
            className="relative text-sm font-zen-old-mincho tracking-[0.3em] text-off-white transition-all duration-500 group-hover:tracking-[0.4em]"
            style={{ textShadow: `0 0 10px ${palette.glow}` }}
          >
            PRESS ENTER TO START
          </span>
          <motion.div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-px w-0 bg-off-white/50 group-hover:w-1/2 transition-all duration-500" />
        </button>
      </div>
    </motion.div>
  );
}
