'use client';

import React, { useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import useGameController from '../features/game/hooks/useGameController';
import TypingArea from '../features/game/components/TypingArea';
import TitleScreen from '../features/game/components/TitleScreen';
import GameHeader from '../features/game/components/GameHeader';
import ResultScreen from '../features/result/components/ResultScreen';
import MobileBlocker from './MobileBlocker';
import SeasonalParticles from './SeasonalParticles';
import { SeasonalProvider, useSeasonalTheme } from '../contexts/SeasonalContext';
import { motion, AnimatePresence } from 'framer-motion';
import { calculateAccuracy, calculateWPM } from '../lib/formatters';
import { useToast } from './ToastProvider';
import type { GameResultPayload } from '@/types/game';

function TypingGameInner() {
  const seasonalTheme = useSeasonalTheme();
  const { data: session, status } = useSession();
  const { addToast } = useToast();
  const postedRef = useRef(false);

  const {
    gameState,
    currentWord,
    matchedRomaji,
    pendingInput,
    remainingTarget,
    matchedKana,
    elapsedTime,
    shake,
    ripple,
    startGame,
    quitGame,
    correctKeyCount,
    errorCount,
    maxCombo,
    currentWordIndex,
    totalSentences,
    nextWordItem,
  } = useGameController();

  useEffect(() => {
    if (gameState !== 'finished') {
      postedRef.current = false;
    }
  }, [gameState]);

  useEffect(() => {
    if (gameState !== 'finished' || postedRef.current) return;

    postedRef.current = true;

    if (!session?.user?.id) {
      if (status !== 'loading') addToast('Sign in to save your result.', 'error');
      return;
    }

    const totalKeystrokes = correctKeyCount + errorCount;
    const minutes = elapsedTime / 60;
    const wpm = calculateWPM(correctKeyCount, minutes);
    const accuracy = calculateAccuracy(correctKeyCount, totalKeystrokes);

    const payload: GameResultPayload = {
      wpm,
      accuracy,
      keystrokes: totalKeystrokes,
      correctKeystrokes: correctKeyCount,
      elapsedTime: Math.round(elapsedTime * 1000),
      difficulty: 'normal',
    };

    // Create AbortController to cancel request if component unmounts
    const abortController = new AbortController();

    const send = async () => {
      try {
        const res = await fetch('/api/game-results', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          signal: abortController.signal,
        });
        if (!res.ok) throw new Error('save failed');
        addToast('Result saved', 'success');
      } catch (error) {
        // Don't show error toast if the request was aborted (component unmounted)
        if (error instanceof Error && error.name !== 'AbortError') {
          addToast('Failed to save result', 'error');
        }
      }
    };

    send();

    // Cleanup: abort the request if component unmounts
    return () => {
      abortController.abort();
    };
  }, [gameState, session?.user?.id, status, elapsedTime, correctKeyCount, errorCount, addToast]);

  return (
    <div
      className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden font-zen-old-mincho select-none transition-colors duration-1000"
      style={{ backgroundColor: seasonalTheme.colors.background }}
    >
      {/* Mobile Blocker */}
      <MobileBlocker />

      {/* Remove time-of-day overlay to keep typing experience consistent */}

      {/* Seasonal Particles */}
      <SeasonalParticles
        emoji={seasonalTheme.atmosphere.particle}
        color={seasonalTheme.atmosphere.particleColor}
      />

      {/* Header */}
      {gameState === 'playing' && (
        <GameHeader
          elapsedTime={elapsedTime}
          currentWordIndex={currentWordIndex}
          totalSentences={totalSentences}
          onQuit={quitGame}
        />
      )}

      {/* Main Game Area */}
      <div className="w-full max-w-5xl px-8 flex flex-col items-center relative z-10">
        <AnimatePresence mode="wait">
          {/* Waiting State / Intro */}
          {gameState === 'waiting' && <TitleScreen onStart={startGame} />}

          {/* Playing State */}
          {gameState === 'playing' && currentWord && (
            <motion.div
              key="playing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full"
            >
              <TypingArea
                currentWord={currentWord}
                nextWord={nextWordItem}
                matchedRomaji={matchedRomaji}
                pendingInput={pendingInput}
                matchedKana={matchedKana}
                remainingTarget={remainingTarget}
                shake={shake}
                ripple={ripple}
              />
            </motion.div>
          )}

          {/* Finished State */}
          {gameState === 'finished' && (
            <motion.div
              key="finished"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full flex justify-center"
            >
              <ResultScreen
                correctKeyCount={correctKeyCount}
                errorCount={errorCount}
                maxCombo={maxCombo}
                duration={elapsedTime}
                onRestart={quitGame}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Background Ambience */}
      <div
        className={`absolute inset-0 pointer-events-none bg-linear-to-b ${seasonalTheme.atmosphere.gradient} z-0 transition-opacity duration-1000`}
      />
    </div>
  );
}

export default function TypingGame() {
  return (
    <SeasonalProvider>
      <TypingGameInner />
    </SeasonalProvider>
  );
}
