'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useSeasonalTheme, useThemePalette } from '../../../contexts/SeasonalContext';
import SegmentedControl from '@/components/ui/SegmentedControl';
import type { GameMode } from '../hooks/useGameSession';

interface TitleScreenProps {
  selectedMode: GameMode;
  onModeChange: (mode: GameMode) => void;
  onStart: () => void;
  isLoading?: boolean;
  errorMessage?: string | null;
}

export default function TitleScreen({
  selectedMode,
  onModeChange,
  onStart,
  isLoading = false,
  errorMessage = null,
}: TitleScreenProps) {
  const seasonalTheme = useSeasonalTheme();
  const { palette } = useThemePalette('dynamic');
  const modeOptions: Array<{ value: GameMode; label: string }> = [
    { value: 'classic', label: 'Classic' },
    { value: 'word-endless', label: 'Word Endless' },
  ];

  return (
    <motion.div
      key="waiting"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center text-center space-y-8"
    >
      <p className="mt-12 mb-2 text-base font-inter tracking-[0.2em] text-subtle-gray">
        Japanese Zen Typing
      </p>
      <h1
        className="text-6xl md:text-8xl font-thin tracking-[-0.01em] md:tracking-[-0.02em] text-transparent bg-clip-text transition-all duration-1000"
        style={{
          backgroundImage: `linear-gradient(to bottom, ${palette.text}, ${palette.primary})`,
        }}
      >
        Koto-Koto
      </h1>
      <p
        lang="ja"
        className="text-xs font-zen-old-mincho transition-colors duration-1000"
        style={{ color: palette.primary }}
      >
        {seasonalTheme.haiku}
      </p>

      <div className="mt-20 flex flex-col items-center gap-3">
        <div>
          <SegmentedControl
            id="mode-panel"
            ariaLabel="Select game mode"
            value={selectedMode}
            options={modeOptions}
            onChange={onModeChange}
            className="flex items-center gap-2 rounded-full border border-white/15 bg-white/5 p-1 backdrop-blur-sm"
            itemClassName="px-3 py-1 rounded-full text-[11px] tracking-[0.2em] uppercase font-inter transition-colors duration-300"
            activeItemClassName="bg-white/20 text-off-white"
            inactiveItemClassName="text-off-white/60 hover:text-off-white/85"
          />
          <p className="mt-4 text-xs font-inter tracking-widest text-off-white/60">
            {selectedMode === 'classic'
              ? '10 sentences • result saved'
              : 'infinite words • no save'}
          </p>
          <Link
            href="/about"
            className="mt-2 inline-block text-[11px] font-inter tracking-wide text-off-white/40 underline decoration-off-white/20 underline-offset-2 transition-colors hover:text-off-white/70"
          >
            How it works
          </Link>
        </div>
      </div>

      <div className="flex flex-col items-center gap-4">
        <button
          onClick={onStart}
          disabled={isLoading}
          className="group relative px-8 py-3 overflow-hidden rounded-full border border-white/15 bg-white/10 transition-[color,background-color,border-color,opacity,transform] duration-300 ease-out hover:bg-white/15 active:scale-[0.97] disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100"
        >
          <span
            className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500"
            style={{ backgroundColor: palette.primary }}
          />
          <span
            className="relative text-sm font-zen-old-mincho tracking-[0.3em] text-off-white transition-all duration-500 group-hover:tracking-[0.4em]"
            style={{ textShadow: `0 0 10px ${palette.glow}` }}
          >
            {isLoading ? 'PREPARING...' : 'PRESS ENTER TO START'}
          </span>
          <motion.div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-px w-0 bg-off-white/50 group-hover:w-1/2 transition-all duration-500" />
        </button>
        {errorMessage && (
          <p role="alert" aria-live="polite" className="text-xs font-inter text-red-300 tracking-wide">
            {errorMessage}
          </p>
        )}
      </div>
    </motion.div>
  );
}
