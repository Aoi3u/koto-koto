'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import useGameController from '../features/game/hooks/useGameController';
import TypingArea from '../features/game/components/TypingArea';
import TitleScreen from '../features/game/components/TitleScreen';
import GameHeader from '../features/game/components/GameHeader';
import ResultScreen from '../features/result/components/ResultScreen';
import EndlessResultScreen from '../features/result/components/EndlessResultScreen';
import MobileBlocker from './MobileBlocker';
import SeasonalParticles from './SeasonalParticles';
import { SeasonalProvider, useSeasonalTheme, useThemePalette } from '../contexts/SeasonalContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from './ToastProvider';
import type { GameResultPayload } from '@/types/game';
import type { GameMode } from '../features/game/hooks/useGameSession';
import { buildSessionMetrics } from '../features/result/utils/sessionMetrics';

function TypingGameInner() {
  const seasonalTheme = useSeasonalTheme();
  const { palette } = useThemePalette('stable');
  const { data: session, status } = useSession();
  const { addToast } = useToast();
  const postedRef = useRef(false);
  const [selectedMode, setSelectedMode] = useState<GameMode>('classic');

  const {
    gameState,
    gameMode,
    isProblemLoading,
    problemLoadError,
    isEndlessMode,
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
    finishSession,
    correctKeyCount,
    errorCount,
    maxCombo,
    mistypedKeyCounts,
    currentWordIndex,
    totalSentences,
    nextWordItem,
  } = useGameController({ preferredStartMode: selectedMode });

  useEffect(() => {
    if (gameState !== 'finished') {
      postedRef.current = false;
    }
  }, [gameState]);

  useEffect(() => {
    if (gameMode === 'word-endless') return;
    if (gameState !== 'finished' || postedRef.current) return;

    postedRef.current = true;

    if (!session?.user?.id) {
      if (status !== 'loading') addToast('Sign in to save your result.', 'error');
      return;
    }

    const { totalKeystrokes, netWpm, accuracy } = buildSessionMetrics(
      correctKeyCount,
      errorCount,
      elapsedTime
    );

    const payload: GameResultPayload = {
      wpm: netWpm,
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
  }, [
    gameMode,
    gameState,
    session?.user?.id,
    status,
    elapsedTime,
    correctKeyCount,
    errorCount,
    addToast,
  ]);

  return (
    <div
      className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden font-zen-old-mincho select-none transition-colors duration-1000 selection:bg-(--selection-bg) selection:text-(--selection-text)"
      style={{
        backgroundColor: palette.background,
        ['--selection-bg' as string]: palette.primary,
        ['--selection-text' as string]: palette.background,
      }}
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
          isEndlessMode={isEndlessMode}
          onFinishEndless={isEndlessMode ? finishSession : undefined}
          onQuit={quitGame}
        />
      )}

      {/* Main Game Area */}
      <div className="w-full max-w-5xl px-8 flex flex-col items-center relative z-10">
        <AnimatePresence mode="wait">
          {/* Waiting State / Intro */}
          {gameState === 'waiting' && (
            <TitleScreen
              selectedMode={selectedMode}
              onModeChange={setSelectedMode}
              onStart={() => startGame(selectedMode)}
              isLoading={isProblemLoading}
              errorMessage={problemLoadError}
            />
          )}

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
          {gameState === 'finished' && !isEndlessMode && (
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

          {gameState === 'finished' && isEndlessMode && (
            <EndlessResultScreen
              correctKeyCount={correctKeyCount}
              errorCount={errorCount}
              duration={elapsedTime}
              mistypedKeyCounts={mistypedKeyCounts}
              onRestart={quitGame}
            />
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
