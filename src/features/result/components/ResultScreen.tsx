'use client';

import { motion } from 'framer-motion';
import { RefreshCw, Share2 } from 'lucide-react';
import { calculateRank } from '../utils/rankLogic';
import { useSeasonalTheme } from '../../../contexts/SeasonalContext';
import {
  formatTimeWithMillis,
  calculateWPM,
  calculateKPM,
  calculateAccuracy,
} from '../../../lib/formatters';

interface ResultScreenProps {
  correctKeyCount: number;
  errorCount: number;
  maxCombo: number;
  duration: number; // usually 60s
  onRestart: () => void;
}

export default function ResultScreen({
  correctKeyCount,
  errorCount,
  maxCombo,
  duration, // This is now elapsedTime in seconds
  onRestart,
}: ResultScreenProps) {
  const seasonalTheme = useSeasonalTheme();

  // Calculations
  const totalKeystrokes = correctKeyCount + errorCount;
  const minutes = duration / 60;
  const netWpm = calculateWPM(correctKeyCount, minutes);
  const kpm = calculateKPM(correctKeyCount, minutes);
  const timeStr = formatTimeWithMillis(duration);
  const accuracy = calculateAccuracy(correctKeyCount, totalKeystrokes);

  const { grade, title, color } = calculateRank(netWpm, accuracy);

  const handleShare = () => {
    const text = `Koto-Koto Result:\nRank: ${grade} - ${title}\nWPM: ${netWpm}\nAccuracy: ${accuracy}%\n#KotoKoto`;
    navigator.clipboard.writeText(text);
    alert('Result copied to clipboard!');
  };

  return (
    <motion.div
      key="finished"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center w-full max-w-xl z-10 text-off-white px-4"
    >
      <h2 className="text-xs md:text-sm font-inter tracking-[0.3em] text-subtle-gray mb-2 md:mb-4 uppercase">
        Session Complete
      </h2>

      {/* Grade Display (Visible!) */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, type: 'spring' }}
        className={`text-7xl md:text-8xl font-zen-old-mincho tracking-tighter mb-2 ${color} transition-all duration-1000`}
        style={{
          filter: `drop-shadow(0 0 30px ${seasonalTheme.adjustedColors.glow})`,
        }}
      >
        {grade}
      </motion.div>

      {/* Title Display */}
      <h1 className="text-xl md:text-3xl font-zen-old-mincho font-bold mb-6 md:mb-8 text-off-white tracking-widest opacity-90 text-center">
        {title}
      </h1>

      <div className="grid grid-cols-2 gap-4 w-full mb-6 md:mb-8">
        {/* Main Stats */}
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

        {/* Detail Stats Row */}
        <div className="col-span-2 grid grid-cols-3 gap-3">
          <div
            className="bg-white/5 rounded-lg p-3 md:p-4 flex flex-col items-center border transition-colors duration-1000"
            style={{
              borderColor: `${seasonalTheme.adjustedColors.primary}20`,
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
              borderColor: `${seasonalTheme.adjustedColors.primary}20`,
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
              Max Combo
            </span>
            <span className="text-base md:text-lg font-inter mt-1">{maxCombo}</span>
          </div>
          <div
            className="bg-white/5 rounded-lg p-3 md:p-4 flex flex-col items-center cursor-pointer hover:bg-white/10 transition-all duration-300 border"
            style={{
              borderColor: `${seasonalTheme.adjustedColors.primary}20`,
            }}
            onClick={handleShare}
          >
            <span className="text-[8px] md:text-[10px] text-subtle-gray uppercase tracking-widest">
              Share
            </span>
            <Share2
              className="w-4 h-4 md:w-5 md:h-5 mt-1 transition-colors duration-1000"
              style={{
                color: seasonalTheme.adjustedColors.primary,
              }}
            />
          </div>
        </div>
      </div>

      <button
        onClick={onRestart}
        autoFocus
        className="group relative px-8 py-3 md:px-10 md:py-4 overflow-hidden rounded-full bg-off-white text-zen-dark font-inter font-bold tracking-widest hover:bg-matcha transition-colors duration-300"
      >
        <span className="relative z-10 flex items-center gap-2 text-sm md:text-base">
          <RefreshCw className="w-3 h-3 md:w-4 md:h-4" /> PLAY AGAIN
        </span>
      </button>
    </motion.div>
  );
}
