import { useEffect, useCallback, useState } from 'react';
import useGameSession from './useGameSession';
import useTypingEngine from './useTypingEngine';
import { GAME_CONFIG } from '../../../config/gameConfig';
import type { GameMode } from './useGameSession';

type UseGameControllerOptions = {
  preferredStartMode?: GameMode;
};

export default function useGameController({
  preferredStartMode = 'classic',
}: UseGameControllerOptions = {}) {
  const {
    gameState,
    gameMode,
    currentWord,
    elapsedTime,
    startGame,
    quitGame,
    nextWord,
    currentWordIndex,
    wordList,
    endGame,
  } = useGameSession();

  const {
    matchedRomaji,
    pendingInput,
    remainingTarget,
    matchedKana,
    shake,
    ripple,
    correctKeyCount,
    errorCount,
    currentCombo,
    maxCombo,
    handleInput,
    setTarget,
    resetEngine,
  } = useTypingEngine();
  const [mistypedKeyCounts, setMistypedKeyCounts] = useState<Record<string, number>>({});

  const startSession = useCallback(
    (mode: GameMode = preferredStartMode) => {
      setMistypedKeyCounts({});
      startGame(mode);
    },
    [preferredStartMode, startGame]
  );

  const quitSession = useCallback(() => {
    setMistypedKeyCounts({});
    quitGame();
  }, [quitGame]);

  // Sync Engine with Session Word
  useEffect(() => {
    if (gameState === 'playing' && currentWord) {
      // Only set the target - don't reset stats (they should persist across words)
      setTarget(currentWord.reading);
    } else if (gameState === 'waiting') {
      // Only reset when game stops, not between words
      resetEngine();
    }
  }, [gameState, currentWord, setTarget, resetEngine]);

  // Input Handler Wrapper
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (gameState === 'waiting') {
        if (e.key === 'Enter') {
          startSession(preferredStartMode);
        }
        return;
      }

      if (gameState !== 'playing') return;

      if (e.key.length !== 1 || e.metaKey || e.ctrlKey || e.altKey) return;
      e.preventDefault();

      const result = handleInput(e.key.toLowerCase());
      if (result?.isError) {
        setMistypedKeyCounts((prev) => ({
          ...prev,
          [e.key.toLowerCase()]: (prev[e.key.toLowerCase()] ?? 0) + 1,
        }));
      }

      if (result && result.isWordComplete) {
        if (gameMode === 'word-endless') {
          setTimeout(() => nextWord(), GAME_CONFIG.WORD_TRANSITION_DELAY_MS);
          return;
        }

        // Check for Game Over immediately
        if (currentWordIndex + 1 >= wordList.length) {
          endGame();
        } else {
          // Delay for visual smoothness
          setTimeout(() => nextWord(), GAME_CONFIG.WORD_TRANSITION_DELAY_MS);
        }
      }
    },
    [
      gameState,
      gameMode,
      preferredStartMode,
      startSession,
      handleInput,
      nextWord,
      endGame,
      currentWordIndex,
      wordList.length,
    ]
  );

  // Attach Listeners
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return {
    // Session
    gameState,
    gameMode,
    currentWord,
    elapsedTime,
    startGame: startSession,
    quitGame: quitSession,
    currentWordIndex,
    totalSentences: wordList.length,
    isEndlessMode: gameMode === 'word-endless',
    finishSession: endGame,
    mistypedKeyCounts,

    // Engine / Stats
    matchedRomaji,
    pendingInput,
    remainingTarget,
    matchedKana,
    shake,
    ripple,
    correctKeyCount,
    errorCount,
    currentCombo,
    maxCombo,
    nextWordItem: wordList[currentWordIndex + 1],
  };
}
