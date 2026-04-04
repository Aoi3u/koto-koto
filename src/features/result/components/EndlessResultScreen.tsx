'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw } from 'lucide-react';
import { useSeasonalTheme } from '../../../contexts/SeasonalContext';
import { getTopMistypedKeys } from '../utils/endlessAdvice';
import { buildSessionMetrics } from '../utils/sessionMetrics';
import PillActionButton from '@/components/ui/PillActionButton';

type EndlessResultScreenProps = {
  correctKeyCount: number;
  errorCount: number;
  duration: number;
  mistypedKeyCounts: Record<string, number>;
  onRestart: () => void;
};

export default function EndlessResultScreen({
  correctKeyCount,
  errorCount,
  duration,
  mistypedKeyCounts,
  onRestart,
}: EndlessResultScreenProps) {
  const seasonalTheme = useSeasonalTheme();
  const { totalKeystrokes, netWpm, kpm, accuracy, timeStr } = buildSessionMetrics(
    correctKeyCount,
    errorCount,
    duration
  );
  const topMistypedKeys = getTopMistypedKeys(mistypedKeyCounts);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        onRestart();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onRestart]);

  return (
    <motion.div
      key="finished-endless"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center w-full max-w-xl z-10 text-off-white px-4"
    >
      <h2 className="text-xs md:text-sm font-inter tracking-[0.3em] text-subtle-gray mb-2 md:mb-4 uppercase">
        Session Complete
      </h2>
      <h1 className="text-xl md:text-2xl font-zen-old-mincho font-bold mb-6 md:mb-8 text-off-white tracking-widest opacity-90 text-center">
        Endless Mode
      </h1>

      <div className="grid grid-cols-2 gap-4 w-full mb-6 md:mb-8">
        <div
          className="col-span-1 bg-white/5 rounded-lg p-4 md:p-5 flex flex-col items-center justify-center backdrop-blur-sm border transition-colors duration-1000"
          style={{
            borderColor: `${seasonalTheme.adjustedColors.primary}30`,
          }}
        >
          <span className="text-[10px] md:text-xs text-subtle-gray uppercase tracking-widest mb-1 font-medium">
            WPM
          </span>
          <span className="text-4xl md:text-6xl font-inter font-light">{netWpm}</span>
          <span className="text-[10px] text-subtle-gray mt-1 font-inter tracking-wider font-medium">
            KPM: {kpm}
          </span>
        </div>

        <div
          className="col-span-1 bg-white/5 rounded-lg p-4 md:p-5 flex flex-col items-center justify-center backdrop-blur-sm border transition-colors duration-1000"
          style={{
            borderColor: `${seasonalTheme.adjustedColors.primary}30`,
          }}
        >
          <span className="text-[10px] md:text-xs text-subtle-gray uppercase tracking-widest mb-1 font-medium">
            Accuracy
          </span>
          <span className="text-4xl md:text-6xl font-inter font-light">
            {accuracy}
            <span className="text-lg md:text-2xl">%</span>
          </span>
        </div>

        <div className="col-span-2 grid grid-cols-3 gap-3">
          <div
            className="bg-white/5 rounded-lg p-3 md:p-4 flex flex-col items-center border transition-colors duration-1000"
            style={{
              borderColor: `${seasonalTheme.colors.primary}20`,
            }}
          >
            <span className="text-[8px] md:text-[10px] text-subtle-gray uppercase tracking-widest">
              Keystrokes
            </span>
            <span className="text-base md:text-lg font-inter mt-1">
              {totalKeystrokes}{' '}
              <span className="text-[10px] text-subtle-gray">
                ({correctKeyCount}/{errorCount})
              </span>
            </span>
          </div>
          <div
            className="bg-white/5 rounded-lg p-3 md:p-4 flex flex-col items-center border transition-colors duration-1000"
            style={{
              borderColor: `${seasonalTheme.colors.primary}20`,
            }}
          >
            <span className="text-[8px] md:text-[10px] text-subtle-gray uppercase tracking-widest">
              Total Time
            </span>
            <span className="text-base md:text-lg font-inter mt-1 tracking-wider text-off-white">
              {timeStr}
            </span>
          </div>
          <div
            className="bg-white/5 rounded-lg p-3 md:p-4 flex flex-col items-center border transition-colors duration-1000"
            style={{
              borderColor: `${seasonalTheme.adjustedColors.primary}20`,
            }}
          >
            <span className="text-[8px] md:text-[10px] text-subtle-gray uppercase tracking-widest">
              Frequent Mistypes
            </span>
            {topMistypedKeys.length > 0 ? (
              <span className="text-base md:text-lg font-inter mt-1 text-center">
                {topMistypedKeys.map((item) => `${item.key}x${item.count}`).join(', ')}
              </span>
            ) : (
              <span className="text-[10px] text-subtle-gray mt-2">None</span>
            )}
          </div>
        </div>
      </div>

      <PillActionButton
        onClick={onRestart}
        autoFocus
        className="group relative px-8 py-3 md:px-10 md:py-4 overflow-hidden rounded-full font-inter font-bold tracking-widest transition-colors duration-300"
        style={{
          backgroundColor: seasonalTheme.colors.primary,
          color: seasonalTheme.colors.background,
          boxShadow: `0 0 18px ${seasonalTheme.colors.glow}`,
        }}
      >
        <span className="relative z-10 flex items-center gap-2 text-sm md:text-base">
          <RefreshCw className="w-3 h-3 md:w-4 md:h-4" /> PLAY AGAIN
        </span>
      </PillActionButton>
    </motion.div>
  );
}
